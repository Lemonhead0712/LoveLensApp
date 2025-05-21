// OCR Worker
// This worker handles OCR processing in a separate thread

import { createWorker } from "tesseract.js"

// Import position detection functions
import { detectMessageSide } from "../ocr/position-detection"

let worker = null

// Initialize the worker
async function initWorker() {
  if (!worker) {
    worker = await createWorker()
    await worker.setParameters({
      tessedit_pageseg_mode: "11", // PSM.SPARSE_TEXT_OSD for better chat message detection
      tessjs_create_hocr: "1", // Enable HOCR output for better bounding box data
      tessjs_create_tsv: "1", // Enable TSV output for more detailed word data
    })
  }
  return worker
}

// Process an image with OCR
async function processImage(imageData, options = {}) {
  try {
    const startTime = performance.now()

    // Initialize worker if needed
    const worker = await initWorker()

    // Get image dimensions for position detection
    let imageWidth = 0
    let imageHeight = 0

    try {
      const img = new Image()
      img.src = imageData
      await new Promise((resolve) => {
        img.onload = () => {
          imageWidth = img.width
          imageHeight = img.height
          resolve()
        }
        img.onerror = () => {
          console.warn("Could not determine image dimensions")
          resolve()
        }
      })
    } catch (error) {
      console.warn("Error getting image dimensions:", error)
    }

    // Recognize text in the image
    const result = await worker.recognize(imageData)

    // Extract words with bounding boxes
    const words = result.data.words
      .map((word) => ({
        text: word.text || "",
        bbox: word.bbox || { x0: 0, y0: 0, x1: 0, y1: 0 },
        confidence: word.confidence || 0,
      }))
      .filter((word) => word.text.trim() !== "")

    // Group words into lines with position information
    const lines = groupWordsIntoLines(words, imageWidth)

    // Group lines into messages
    const messages = groupLinesIntoMessages(lines)

    // Convert to standard message format
    const formattedMessages = formatMessages(
      messages,
      options.firstPersonName || "User",
      options.secondPersonName || "Friend",
    )

    const endTime = performance.now()

    return {
      success: true,
      text: result.data.text,
      words: words,
      messages: formattedMessages,
      confidence: result.data.confidence,
      processingTime: endTime - startTime,
      imageWidth,
      imageHeight,
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || "Unknown OCR error",
      messages: [],
    }
  }
}

// Group words into lines with position information
function groupWordsIntoLines(words, imageWidth) {
  // Sort words by vertical position
  const sortedWords = [...words].sort((a, b) => {
    if (Math.abs(a.bbox.y0 - b.bbox.y0) < 10) {
      return a.bbox.x0 - b.bbox.x0
    }
    return a.bbox.y0 - b.bbox.y0
  })

  const lines = []
  let currentLine = null
  let lastY = -1

  for (const word of sortedWords) {
    if (word.confidence < 30 || !word.text.trim()) continue

    if (lastY === -1 || Math.abs(word.bbox.y0 - lastY) > 15) {
      if (currentLine) {
        // Add position information to the line
        currentLine.position = detectMessageSide(currentLine.x, imageWidth)
        lines.push(currentLine)
      }

      currentLine = {
        text: word.text,
        x: word.bbox.x0,
        y: word.bbox.y0,
        width: word.bbox.x1 - word.bbox.x0,
        height: word.bbox.y1 - word.bbox.y0,
        confidence: word.confidence,
      }
    } else {
      if (currentLine) {
        currentLine.text += ` ${word.text}`
        const newWidth = Math.max(currentLine.width, word.bbox.x1 - currentLine.x)
        currentLine.width = newWidth
        currentLine.confidence = (currentLine.confidence + word.confidence) / 2
      }
    }

    lastY = word.bbox.y0
  }

  if (currentLine) {
    currentLine.position = detectMessageSide(currentLine.x, imageWidth)
    lines.push(currentLine)
  }

  return lines
}

// Group lines into messages
function groupLinesIntoMessages(lines) {
  const sortedLines = [...lines].sort((a, b) => a.y - b.y)

  const messages = []
  let currentMessage = null
  let lastPosition = null
  let lastY = -1

  for (const line of sortedLines) {
    const filteredText = filterSystemMessages(line.text)
    if (!filteredText) continue

    const position = line.position || "left"

    if (lastY === -1 || position !== lastPosition || Math.abs(line.y - lastY) > 50) {
      if (currentMessage) {
        messages.push(currentMessage)
      }

      currentMessage = {
        text: filteredText,
        boundingBox: {
          x: line.x,
          y: line.y,
          width: line.width,
          height: line.height,
        },
        position,
        confidence: line.confidence,
      }
    } else {
      if (currentMessage) {
        currentMessage.text += `\n${filteredText}`
        currentMessage.boundingBox.height = line.y + line.height - currentMessage.boundingBox.y
        currentMessage.confidence = (currentMessage.confidence + line.confidence) / 2
      }
    }

    lastPosition = position
    lastY = line.y
  }

  if (currentMessage) {
    messages.push(currentMessage)
  }

  return messages
}

// Format messages with sender information
function formatMessages(messages, firstPersonName, secondPersonName) {
  return messages.map((message, index) => {
    const { content, timestamp } = extractTimestamp(message.text)

    const messageTimestamp = isValidDate(timestamp)
      ? new Date(timestamp).toISOString()
      : new Date(Date.now() - (messages.length - index) * 60000).toISOString()

    // Determine sender based on position
    const sender = message.position === "left" ? secondPersonName : firstPersonName

    return {
      sender,
      text: content.trim(),
      timestamp: messageTimestamp,
      position: message.position,
      confidence: message.confidence,
    }
  })
}

// Extract timestamp from message content
function extractTimestamp(content) {
  const timestampPatterns = [
    /(\d{1,2}:\d{2}(?:\s?[AP]M)?)/i,
    /(\d{1,2}\/\d{1,2}\/\d{2,4}\s+\d{1,2}:\d{2})/i,
    /(\d{1,2}\s+[A-Za-z]{3,}\s+\d{2,4}\s+\d{1,2}:\d{2})/i,
    /(\d{1,2}:\d{2}:\d{2}(?:\s?[AP]M)?)/i,
    /([A-Za-z]{3,},\s+\d{1,2}\s+[A-Za-z]{3,})/i,
    /([A-Za-z]{3,}\s+\d{1,2})/i,
    /(\d{1,2}:\d{2})/i,
  ]

  for (const pattern of timestampPatterns) {
    const match = content.match(pattern)
    if (match) {
      const cleanedContent = content.replace(match[0], "").trim()
      return {
        content: cleanedContent,
        timestamp: match[1],
      }
    }
  }

  return { content }
}

// Filter out system messages
function filterSystemMessages(content) {
  const systemPatterns = [
    /^Delivered$/i,
    /^Read$/i,
    /^Sent$/i,
    /^Today$/i,
    /^Yesterday$/i,
    /^Last seen/i,
    /^Typing\.\.\.$/i,
    /^[A-Za-z]+ is typing\.\.\.$/i,
    /^This message was deleted$/i,
    /^You deleted this message$/i,
    /^Message not sent\.$/i,
    /^Missed call$/i,
    /^Missed video call$/i,
    /^Call ended$/i,
    /^New messages$/i,
    /^\d+ unread messages?$/i,
  ]

  for (const pattern of systemPatterns) {
    if (pattern.test(content)) {
      return ""
    }
  }

  return content.trim()
}

// Check if a date string is valid
function isValidDate(input) {
  return input && typeof input === "string" && !isNaN(Date.parse(input))
}

// Handle messages from the main thread
self.onmessage = async (e) => {
  const { type, data, id } = e.data

  if (type === "process") {
    try {
      const result = await processImage(data.imageData, data.options)
      self.postMessage({ id, result })
    } catch (error) {
      self.postMessage({
        id,
        result: {
          success: false,
          error: error.message || "Unknown worker error",
          messages: [],
        },
      })
    }
  } else if (type === "terminate") {
    if (worker) {
      await worker.terminate()
      worker = null
    }
    self.postMessage({ id, result: { terminated: true } })
  }
}
