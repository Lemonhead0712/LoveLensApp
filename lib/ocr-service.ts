import type { Message } from "./types"
import { createWorker } from "tesseract.js"
import { preprocessImage, defaultOptions, type PreprocessingOptions } from "./image-preprocessing"

// Interface for OCR result with bounding box
interface OCRWord {
  text: string
  bbox: {
    x0: number
    y0: number
    x1: number
    y1: number
  }
  confidence: number
}

// Interface for a grouped message line
interface MessageLine {
  text: string
  x: number
  y: number
  width: number
  height: number
  confidence: number
}

// Interface for a complete message with position
interface PositionedMessage {
  content: string
  position: "left" | "right"
  y: number
  confidence: number
  timestamp?: string
}

/**
 * Helper function to check if a date string is valid
 */
function isValidDate(input: any): boolean {
  return input && typeof input === "string" && !isNaN(Date.parse(input))
}

/**
 * Convert File to base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Extract timestamp from message content if present
 */
function extractTimestamp(content: string): { content: string; timestamp?: string } {
  // Common timestamp patterns in chat apps (both Android and iPhone)
  const timestampPatterns = [
    /(\d{1,2}:\d{2}(?:\s?[AP]M)?)/i, // 12:34 PM
    /(\d{1,2}\/\d{1,2}\/\d{2,4}\s+\d{1,2}:\d{2})/i, // 01/23/2023 12:34
    /(\d{1,2}\s+[A-Za-z]{3,}\s+\d{2,4}\s+\d{1,2}:\d{2})/i, // 23 Jan 2023 12:34
    /(\d{1,2}:\d{2}:\d{2}(?:\s?[AP]M)?)/i, // 12:34:56 PM
    /([A-Za-z]{3,},\s+\d{1,2}\s+[A-Za-z]{3,})/i, // Mon, 18 May
    /([A-Za-z]{3,}\s+\d{1,2})/i, // May 18
    /(\d{1,2}:\d{2})/i, // 12:34 (fallback, might catch non-timestamps)
  ]

  for (const pattern of timestampPatterns) {
    const match = content.match(pattern)
    if (match) {
      // Remove the timestamp from the content
      const cleanedContent = content.replace(match[0], "").trim()
      return {
        content: cleanedContent,
        timestamp: match[1],
      }
    }
  }

  return { content }
}

/**
 * Filter out common system messages and metadata
 */
function filterSystemMessages(content: string): string {
  // Common system message patterns to filter out
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
  ]

  // Check if the content matches any system pattern
  for (const pattern of systemPatterns) {
    if (pattern.test(content)) {
      return ""
    }
  }

  return content
}

/**
 * Group words into message lines based on vertical position
 */
function groupWordsIntoLines(words: OCRWord[]): MessageLine[] {
  // Sort words by vertical position (y-coordinate)
  const sortedWords = [...words].sort((a, b) => {
    // If words are on roughly the same line (within 10px), sort by x-coordinate
    if (Math.abs(a.bbox.y0 - b.bbox.y0) < 10) {
      return a.bbox.x0 - b.bbox.x0
    }
    // Otherwise sort by y-coordinate
    return a.bbox.y0 - b.bbox.y0
  })

  const lines: MessageLine[] = []
  let currentLine: MessageLine | null = null
  let lastY = -1

  // Group words into lines based on their vertical position
  for (const word of sortedWords) {
    // Skip words with very low confidence or empty text
    if (word.confidence < 30 || !word.text.trim()) continue

    // If this is a new line or the first word
    if (lastY === -1 || Math.abs(word.bbox.y0 - lastY) > 15) {
      // If we have a current line, add it to the list
      if (currentLine) {
        lines.push(currentLine)
      }

      // Start a new line
      currentLine = {
        text: word.text,
        x: word.bbox.x0,
        y: word.bbox.y0,
        width: word.bbox.x1 - word.bbox.x0,
        height: word.bbox.y1 - word.bbox.y0,
        confidence: word.confidence,
      }
    } else {
      // Add to current line
      if (currentLine) {
        currentLine.text += ` ${word.text}`
        // Update width to encompass both words
        const newWidth = Math.max(currentLine.width, word.bbox.x1 - currentLine.x)
        currentLine.width = newWidth
        // Average the confidence
        currentLine.confidence = (currentLine.confidence + word.confidence) / 2
      }
    }

    lastY = word.bbox.y0
  }

  // Add the last line if it exists
  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

/**
 * Detect chat app type from screenshot characteristics
 */
function detectChatAppType(lines: MessageLine[]): "android" | "iphone" | "unknown" {
  // Count messages on far left vs indented
  const farLeftCount = lines.filter((line) => line.x <= 30).length
  const indentedCount = lines.filter((line) => line.x > 30 && line.x < 100).length
  const farRightCount = lines.filter((line) => line.x >= 100).length

  // Check for patterns characteristic of different chat apps
  if (farLeftCount > 5 && indentedCount > 5) {
    return "android" // Android typically has messages on far left and indented
  } else if (farLeftCount > 5 && farRightCount > 5) {
    return "iphone" // iPhone typically has messages on far left and far right
  }

  return "unknown"
}

/**
 * Group lines into complete messages based on proximity and indentation
 * Enhanced to handle both Android and iPhone chat layouts
 */
function groupLinesIntoMessages(lines: MessageLine[]): PositionedMessage[] {
  // Sort lines by vertical position
  const sortedLines = [...lines].sort((a, b) => a.y - b.y)

  // Detect chat app type to adjust position detection
  const appType = detectChatAppType(sortedLines)
  console.log(`Detected chat app type: ${appType}`)

  // Determine the threshold for left vs right based on app type
  let positionThreshold = 50 // Default threshold
  if (appType === "iphone") {
    // For iPhone, calculate a dynamic threshold based on the distribution of x values
    const xValues = sortedLines.map((line) => line.x)
    const minX = Math.min(...xValues)
    const maxX = Math.max(...xValues)
    positionThreshold = minX + (maxX - minX) / 2
  } else if (appType === "android") {
    // For Android, use a more flexible threshold
    positionThreshold = 40
  } else {
    // For unknown app types, try to determine threshold from the data
    const xValues = sortedLines.map((line) => line.x).sort((a, b) => a - b)
    // Find the largest gap in x-coordinates to determine the natural split
    let maxGap = 0
    let gapPosition = 50
    for (let i = 1; i < xValues.length; i++) {
      const gap = xValues[i] - xValues[i - 1]
      if (gap > maxGap) {
        maxGap = gap
        gapPosition = (xValues[i] + xValues[i - 1]) / 2
      }
    }
    // Only use the gap-based threshold if we found a significant gap
    if (maxGap > 20) {
      positionThreshold = gapPosition
    }
  }

  const messages: PositionedMessage[] = []
  let currentMessage: PositionedMessage | null = null
  let lastPosition: "left" | "right" | null = null
  let lastY = -1

  for (const line of sortedLines) {
    // Filter out system messages and metadata
    const filteredText = filterSystemMessages(line.text)
    if (!filteredText) continue

    // Determine position based on x-coordinate and app type
    const position = line.x <= positionThreshold ? "left" : "right"

    // If this is a new message or sender changed or large vertical gap
    if (lastY === -1 || position !== lastPosition || Math.abs(line.y - lastY) > 50) {
      // If we have a current message, add it to the list
      if (currentMessage) {
        messages.push(currentMessage)
      }

      // Start a new message
      currentMessage = {
        content: filteredText,
        position,
        y: line.y,
        confidence: line.confidence,
      }
    } else {
      // Continue the current message
      if (currentMessage) {
        currentMessage.content += `\n${filteredText}`
        // Average the confidence
        currentMessage.confidence = (currentMessage.confidence + line.confidence) / 2
      }
    }

    lastPosition = position
    lastY = line.y
  }

  // Add the last message if it exists
  if (currentMessage) {
    messages.push(currentMessage)
  }

  return messages
}

/**
 * Process OCR results to extract messages with accurate sender attribution
 */
async function processOCRWithBoundingBoxes(
  imageFile: File,
  firstPersonName: string,
  secondPersonName: string,
  preprocessingOptions?: Partial<PreprocessingOptions>,
): Promise<Message[]> {
  try {
    console.log(`Processing image with bounding box detection for ${firstPersonName} and ${secondPersonName}`)

    // Create a worker - simplified initialization for compatibility
    const worker = await createWorker()

    // Set parameters for sparse text detection if supported
    try {
      await worker.setParameters({
        tessedit_pageseg_mode: "11", // PSM.SPARSE_TEXT_OSD for better chat message detection
        tessedit_char_whitelist:
          "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,?!:;'\"()-_+=@#$%^&*<>{}[]|\\/ ", // Allow common characters
        tessjs_create_hocr: "1", // Enable HOCR output for better bounding box data
        tessjs_create_tsv: "1", // Enable TSV output for more detailed word data
      })
    } catch (paramError) {
      console.warn("Could not set Tesseract parameters, continuing with defaults:", paramError)
    }

    // Preprocess the image to improve OCR results
    console.log("Preprocessing image...")
    const processedImageData = await preprocessImage(imageFile, preprocessingOptions)
    console.log("Image preprocessing complete")

    // Before recognition
    console.log("Starting OCR recognition...")
    const result = await worker.recognize(processedImageData)
    console.log("OCR recognition completed")

    await worker.terminate()

    // Check if result has the expected structure
    if (!result || !result.data || !result.data.words || !Array.isArray(result.data.words)) {
      console.warn("OCR result does not have the expected structure:", result)
      // Return empty array, the calling function will handle fallback
      return []
    }

    // Log the raw OCR text for debugging
    console.log("Raw OCR text:", result.data.text)

    // Extract words with bounding boxes - with null checks
    const words: OCRWord[] = result.data.words
      .map((word) => ({
        text: word.text || "",
        bbox: word.bbox || { x0: 0, y0: 0, x1: 0, y1: 0 },
        confidence: word.confidence || 0,
      }))
      .filter((word) => word.text.trim() !== "")

    // If no words were extracted, return empty array
    if (words.length === 0) {
      console.warn("No words extracted from OCR result")
      return []
    }

    // Group words into lines
    const lines = groupWordsIntoLines(words)

    // If no lines were created, return empty array
    if (lines.length === 0) {
      console.warn("No lines created from words")
      return []
    }

    // Group lines into messages
    const positionedMessages = groupLinesIntoMessages(lines)

    // If no messages were created, return empty array
    if (positionedMessages.length === 0) {
      console.warn("No messages created from lines")
      return []
    }

    // Count messages on each side to verify we have both participants
    const leftCount = positionedMessages.filter((m) => m.position === "left").length
    const rightCount = positionedMessages.filter((m) => m.position === "right").length

    console.log(
      `Detected ${leftCount} messages on left (${secondPersonName}) and ${rightCount} messages on right (${firstPersonName})`,
    )

    // Convert positioned messages to the Message format
    const messages: Message[] = positionedMessages.map((message, index) => {
      // Try to extract timestamp from the message content
      const { content, timestamp } = extractTimestamp(message.content)

      // Create a timestamp if none was extracted
      const messageTimestamp = isValidDate(timestamp)
        ? new Date(timestamp).toISOString()
        : new Date(Date.now() - (positionedMessages.length - index) * 60000).toISOString()

      // Determine sender based on position
      // In both Android and iPhone, left messages are typically from the other person
      const sender = message.position === "left" ? secondPersonName : firstPersonName

      return {
        sender,
        text: content.trim(), // Use text property to match Message interface
        timestamp: messageTimestamp,
      }
    })

    return messages
  } catch (error) {
    console.error("Error processing OCR with bounding boxes:", error)
    // Return empty array instead of throwing, the calling function will handle fallback
    return []
  }
}

/**
 * Extract messages from screenshots using bounding box detection
 * This is the main function that should be called from other parts of the application
 */
export async function extractMessagesFromScreenshots(
  screenshots: File[],
  firstPersonName: string,
  secondPersonName: string,
): Promise<Message[]> {
  try {
    console.log(`Extracting text from ${screenshots.length} screenshots using enhanced OCR with preprocessing`)

    if (!screenshots || screenshots.length === 0) {
      throw new Error("No screenshots provided. Please upload at least one screenshot.")
    }

    // Process each screenshot and combine the results
    const allMessages: Message[] = []
    const failedScreenshots: string[] = []

    // Try different preprocessing options for better results
    const preprocessingOptions = [
      // Option 1: Default settings (grayscale + normalize + adaptive threshold)
      { ...defaultOptions },

      // Option 2: More aggressive contrast enhancement
      {
        ...defaultOptions,
        normalize: true,
        adaptiveThreshold: true,
        sharpen: true,
      },

      // Option 3: Simple threshold instead of adaptive
      {
        ...defaultOptions,
        adaptiveThreshold: false,
        threshold: true,
        thresholdValue: 128,
      },

      // Option 4: Invert colors (for dark mode screenshots)
      {
        ...defaultOptions,
        invert: true,
      },
    ]

    for (const screenshot of screenshots) {
      try {
        console.log(`Processing screenshot: ${screenshot.name}`)

        // Try each preprocessing option until we get good results
        let messages: Message[] = []
        let bestOptionIndex = -1

        for (let i = 0; i < preprocessingOptions.length; i++) {
          console.log(`Trying preprocessing option ${i + 1}...`)
          const optionMessages = await processOCRWithBoundingBoxes(
            screenshot,
            firstPersonName,
            secondPersonName,
            preprocessingOptions[i],
          )

          if (optionMessages && optionMessages.length > 0) {
            // If this option gave us more messages than previous ones, use it
            if (optionMessages.length > messages.length) {
              messages = optionMessages
              bestOptionIndex = i
            }

            // If we got a good number of messages, stop trying options
            if (optionMessages.length >= 5) {
              break
            }
          }
        }

        if (messages && messages.length > 0) {
          console.log(
            `Successfully extracted ${messages.length} messages from ${screenshot.name} using option ${bestOptionIndex + 1}`,
          )
          allMessages.push(...messages)
        } else {
          console.warn(`No messages extracted from ${screenshot.name} after trying all preprocessing options`)
          failedScreenshots.push(screenshot.name)
        }
      } catch (screenshotError) {
        console.error(`Error processing screenshot ${screenshot.name}:`, screenshotError)
        failedScreenshots.push(screenshot.name)
        // Continue with other screenshots
      }
    }

    // If no messages were extracted, throw a detailed error
    if (allMessages.length === 0) {
      if (failedScreenshots.length === screenshots.length) {
        throw new Error(
          `OCR failed: No messages could be extracted from any of the screenshots. Please check that your screenshots clearly show text messages.`,
        )
      } else {
        throw new Error(`OCR failed: No messages could be extracted from the screenshots.`)
      }
    }

    // Sort messages by timestamp
    const sortedMessages = allMessages.sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    })

    // Verify we have messages from both participants
    const senders = new Set(sortedMessages.map((m) => m.sender))
    if (senders.size < 2) {
      console.warn("Could not detect messages from both participants, check screenshot format")
    }

    console.log(`Extracted ${sortedMessages.length} messages (${senders.size} participants)`)

    // Log some sample messages for debugging
    if (sortedMessages.length > 0) {
      console.log("Sample messages:", sortedMessages.slice(0, 3))
    }

    return sortedMessages
  } catch (error) {
    console.error("Error in extractMessagesFromScreenshots:", error)
    // Rethrow the error to be handled by the caller
    throw error
  }
}

/**
 * Validates extracted messages
 * @param messages Array of messages
 * @returns Boolean indicating if messages are valid
 */
export function validateExtractedMessages(messages: Message[]): boolean {
  // Check if we have at least 2 messages total
  if (!messages || messages.length < 2) {
    return false
  }

  // Get unique senders
  const senders = [...new Set(messages.map((m) => m.sender))]

  // Check if we have at least one sender with messages
  if (senders.length === 0) {
    return false
  }

  // Check if any message has empty content
  if (messages.some((m) => !m.text || m.text.trim() === "")) {
    return false
  }

  return true
}

/**
 * Extract text from a single image
 * @param imageData Base64 image data
 * @param progressCallback Optional callback for progress updates
 * @returns Array of extracted messages
 */
export async function extractTextFromImage(
  imageData: string,
  progressCallback?: (progress: number) => void,
): Promise<Message[]> {
  try {
    // Create a dummy file object from the base64 data
    const byteString = atob(imageData.split(",")[1])
    const mimeString = imageData.split(",")[0].split(":")[1].split(";")[0]
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }

    const blob = new Blob([ab], { type: mimeString })
    const file = new File([blob], "screenshot.png", { type: mimeString })

    // Use default names for testing - these will be replaced later
    const messages = await processOCRWithBoundingBoxes(file, "User", "Friend")

    if (progressCallback) {
      progressCallback(100)
    }

    return messages
  } catch (error) {
    console.error("Error extracting text from image:", error)
    return []
  }
}
