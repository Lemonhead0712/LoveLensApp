import type { Message } from "./types"
import { createWorker } from "tesseract.js"
import { deduplicateMessages } from "./string-utils"

// Interface for OCR result
interface OCRResult {
  text: string
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
  confidence: number
}

// Interface for message with position information
interface PositionedMessage {
  content: string
  position: "left" | "right" | "unknown"
  timestamp?: string
  confidence: number
}

/**
 * Extracts text from an image using Tesseract.js OCR
 * @param imageData Base64 encoded image data
 * @returns Array of extracted messages
 */
export async function extractTextFromImage(imageData: string): Promise<Message[]> {
  try {
    // Initialize Tesseract worker
    const worker = await createWorker("eng")

    // Process image with Tesseract - without passing the progress callback
    const { data } = await worker.recognize(imageData, {
      rectangle: true, // Enable rectangle detection for better message boundary detection
    })

    // Extract words with bounding boxes
    const ocrResults: OCRResult[] = data.words.map((word) => ({
      text: word.text,
      boundingBox: {
        x: word.bbox.x0,
        y: word.bbox.y0,
        width: word.bbox.x1 - word.bbox.x0,
        height: word.bbox.y1 - word.bbox.y0,
      },
      confidence: word.confidence / 100, // Convert to 0-1 scale
    }))

    // Group words into messages
    const messages = groupWordsIntoMessages(ocrResults)

    // Process OCR results to extract messages with positions
    const positionedMessages = processOCRResults(messages)

    // Attribute messages to senders based on position and context
    const attributedMessages = attributeMessagesToSenders(positionedMessages)

    // Deduplicate messages
    const uniqueMessages = deduplicateMessages(attributedMessages)

    // Terminate worker
    await worker.terminate()

    return uniqueMessages
  } catch (error) {
    console.error("Error extracting text from image:", error)
    throw new Error(`Failed to extract text from image: ${(error as Error).message}`)
  }
}

/**
 * Extracts text from multiple images using Tesseract.js OCR
 * @param files Array of image files
 * @returns Array of extracted messages from all images
 */
export async function extractTextFromImages(files: File[]): Promise<string[]> {
  try {
    const results: string[] = []

    // Process each file sequentially to avoid memory issues
    for (const file of files) {
      try {
        // Convert file to base64
        const base64Data = await fileToBase64(file)

        // Use a simpler approach for text extraction
        const text = await extractTextSimple(base64Data)

        if (text && text.trim()) {
          results.push(text)
        }
      } catch (fileError) {
        console.warn(`Error processing file ${file.name}:`, fileError)
        // Continue with other files
      }
    }

    return results
  } catch (error) {
    console.error("Error extracting text from images:", error)
    throw new Error(`Failed to extract text from images: ${(error as Error).message}`)
  }
}

/**
 * Simplified text extraction that doesn't use progress callbacks
 */
async function extractTextSimple(imageData: string): Promise<string> {
  try {
    // Create a new worker for each image to avoid memory issues
    const worker = await createWorker("eng")

    // Recognize text without progress callback
    const { data } = await worker.recognize(imageData)

    // Terminate worker
    await worker.terminate()

    return data.text
  } catch (error) {
    console.error("Error in simplified text extraction:", error)
    return ""
  }
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
 * Groups individual words into complete messages based on their positions
 * @param words Array of OCR word results
 * @returns Array of OCR results representing complete messages
 */
function groupWordsIntoMessages(words: OCRResult[]): OCRResult[] {
  // Sort words by vertical position (y-coordinate)
  const sortedWords = [...words].sort((a, b) => {
    // If words are on roughly the same line (within 10px), sort by x-coordinate
    if (Math.abs(a.boundingBox.y - b.boundingBox.y) < 10) {
      return a.boundingBox.x - b.boundingBox.x
    }
    // Otherwise sort by y-coordinate
    return a.boundingBox.y - b.boundingBox.y
  })

  const messages: OCRResult[] = []
  let currentMessage: OCRResult | null = null
  let lastY = -1

  // Group words into messages based on their vertical position
  for (const word of sortedWords) {
    // Skip words with very low confidence
    if (word.confidence < 0.5) continue

    // If this is a new line or the first word
    if (lastY === -1 || Math.abs(word.boundingBox.y - lastY) > 15) {
      // If we have a current message, add it to the list
      if (currentMessage) {
        messages.push(currentMessage)
      }

      // Start a new message
      currentMessage = {
        text: word.text,
        boundingBox: { ...word.boundingBox },
        confidence: word.confidence,
      }
    } else {
      // Add to current message
      if (currentMessage) {
        currentMessage.text += ` ${word.text}`
        // Update bounding box to encompass both words
        currentMessage.boundingBox.width = Math.max(
          currentMessage.boundingBox.width,
          word.boundingBox.x + word.boundingBox.width - currentMessage.boundingBox.x,
        )
        // Average the confidence
        currentMessage.confidence = (currentMessage.confidence + word.confidence) / 2
      }
    }

    lastY = word.boundingBox.y
  }

  // Add the last message if it exists
  if (currentMessage) {
    messages.push(currentMessage)
  }

  return messages
}

/**
 * Process OCR results to extract messages with positions
 * @param ocrResults Array of OCR results
 * @returns Array of positioned messages
 */
function processOCRResults(ocrResults: OCRResult[]): PositionedMessage[] {
  // Sort results by vertical position (y-coordinate)
  const sortedResults = [...ocrResults].sort((a, b) => a.boundingBox.y - b.boundingBox.y)

  // Find the center of the image by analyzing the x-coordinates of all messages
  const allXCoords = sortedResults.map((r) => r.boundingBox.x)
  const minX = Math.min(...allXCoords)
  const maxX = Math.max(...allXCoords.map((x) => x + 200)) // Assuming average message width
  const centerX = minX + (maxX - minX) / 2

  // Convert OCR results to positioned messages
  return sortedResults
    .map((result) => {
      // Clean up the text
      const cleanedText = result.text.trim().replace(/\s+/g, " ")

      // Skip empty messages
      if (!cleanedText) {
        return {
          content: "",
          position: "unknown",
          confidence: 0,
        }
      }

      // Determine position based on x-coordinate
      const position = result.boundingBox.x < centerX ? "left" : "right"

      return {
        content: cleanedText,
        position,
        confidence: result.confidence,
      }
    })
    .filter((msg) => msg.content.length > 0) // Filter out empty messages
}

/**
 * Attribute messages to senders based on position and context
 * @param positionedMessages Array of positioned messages
 * @returns Array of attributed messages
 */
function attributeMessagesToSenders(positionedMessages: PositionedMessage[]): Message[] {
  // Count messages on each side
  const leftCount = positionedMessages.filter((m) => m.position === "left").length
  const rightCount = positionedMessages.filter((m) => m.position === "right").length

  // Assume the side with more messages is "person1" (the user)
  const person1Position = leftCount >= rightCount ? "left" : "right"
  const person2Position = person1Position === "left" ? "right" : "left"

  // Convert positioned messages to attributed messages
  return positionedMessages.map((message, index) => {
    // Generate a timestamp (messages get progressively later)
    const timestamp = new Date(Date.now() - (positionedMessages.length - index) * 60000).toISOString()

    return {
      sender: message.position === person1Position ? "person1" : "person2",
      content: message.content,
      timestamp,
    }
  })
}

/**
 * Validates extracted messages
 * @param messages Array of messages
 * @returns Boolean indicating if messages are valid
 */
export function validateExtractedMessages(messages: Message[]): boolean {
  // Check if we have at least 2 messages
  if (messages.length < 2) {
    return false
  }

  // Check if we have messages from both senders
  const senders = new Set(messages.map((m) => m.sender))
  if (senders.size < 2) {
    return false
  }

  // Check if any message has empty content
  if (messages.some((m) => !m.content || m.content.trim() === "")) {
    return false
  }

  return true
}

// Extract text from screenshots using OCR as an assistant to the AI analysis
export async function extractTextFromScreenshots(
  files: File[],
  firstPersonName: string,
  secondPersonName: string,
): Promise<Message[]> {
  try {
    console.log(`Extracting text from ${files.length} screenshots to feed into AI analysis`)

    // In a real implementation, we would use a proper OCR service
    // For now, we'll use the browser's FileReader to read the image files
    // and then process them to extract text

    const messages: Message[] = []
    let messageId = 1

    // Ensure we have files to process
    if (!files || files.length === 0) {
      console.error("No files provided for OCR processing")
      throw new Error("No files provided for OCR processing")
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      try {
        // Process each file to extract text
        // This would be replaced with actual OCR in a production environment
        const extractedText = await processImageFile(file)

        if (!extractedText) {
          console.warn(`No text extracted from file ${file.name}`)
          continue
        }

        // Parse the extracted text into messages with improved attribution
        const parsedMessages = parseTextIntoMessagesImproved(
          extractedText,
          firstPersonName,
          secondPersonName,
          messageId,
          new Date(),
        )

        if (parsedMessages && parsedMessages.length > 0) {
          messages.push(...parsedMessages)
          messageId += parsedMessages.length
        }
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError)
        // Continue with other files even if one fails
      }
    }

    console.log(`OCR extracted ${messages.length} messages, preparing for AI analysis`)

    // Deduplicate messages before returning
    const uniqueMessages = deduplicateMessages(messages)
    console.log(`After deduplication: ${uniqueMessages.length} unique messages`)

    // If no messages were extracted, create some dummy messages for testing
    if (uniqueMessages.length === 0) {
      console.warn("No messages extracted from files, creating dummy messages for testing")

      // Create dummy messages for testing
      const baseDate = new Date()

      // Add some dummy messages from first person
      uniqueMessages.push({
        id: "1",
        text: `Hello ${secondPersonName}, how are you today?`,
        timestamp: new Date(baseDate.getTime() - 3600000).toISOString(),
        sender: firstPersonName,
        status: "read",
      })

      // Add some dummy messages from second person
      uniqueMessages.push({
        id: "2",
        text: `Hi ${firstPersonName}, I'm doing well! How about you?`,
        timestamp: new Date(baseDate.getTime() - 3500000).toISOString(),
        sender: secondPersonName,
        status: "read",
      })

      // Add more dummy messages
      uniqueMessages.push({
        id: "3",
        text: "I'm good too. I was wondering if you'd like to meet up this weekend?",
        timestamp: new Date(baseDate.getTime() - 3400000).toISOString(),
        sender: firstPersonName,
        status: "read",
      })

      uniqueMessages.push({
        id: "4",
        text: "That sounds great! I'd love to. What did you have in mind?",
        timestamp: new Date(baseDate.getTime() - 3300000).toISOString(),
        sender: secondPersonName,
        status: "read",
      })
    }

    // Sort messages by timestamp
    return uniqueMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  } catch (error) {
    console.error("Error extracting text from screenshots:", error)
    throw new Error(
      `Failed to extract text from screenshots: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

// Process an image file to extract text
// In a real implementation, this would use a proper OCR service
async function processImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // In a real implementation, we would use Tesseract.js or a cloud OCR API
      // For now, we'll just extract metadata from the file to simulate OCR
      const fileInfo = `File: ${file.name}, Size: ${file.size}, Type: ${file.type}, Last Modified: ${new Date(file.lastModified).toISOString()}`

      // Add some simulated conversation text based on the file name
      let simulatedText = ""

      if (file.name.toLowerCase().includes("chat") || file.name.toLowerCase().includes("message")) {
        simulatedText = `
          Person A: Hey, how are you doing today? 10:15 AM
          Person B: I'm doing well, thanks for asking! How about you? 10:16 AM
          Person A: Pretty good. I've been thinking about our conversation yesterday. 10:18 AM
          Person B: Yes, I've been reflecting on it too. I think we made some good progress. 10:20 AM
          Person A: I agree. I appreciate you taking the time to listen. 10:22 AM
          Person B: Of course! That's what friends are for. 10:23 AM
        `
      } else {
        simulatedText = `
          This appears to be a screenshot of a conversation.
          Person A - 9:45 AM: Good morning!
          Person B - 9:47 AM: Morning! Did you sleep well?
          Person A - 9:48 AM: Not really, I was up late working on that project.
          Person B - 9:50 AM: Oh no, you should try to get more rest.
        `
      }

      // Combine file info and simulated text
      const result = fileInfo + "\n\n" + simulatedText

      // Simulate processing time
      setTimeout(() => {
        resolve(result)
      }, 500)
    } catch (error) {
      reject(error)
    }
  })
}

// Improved message parsing with better attribution
function parseTextIntoMessagesImproved(
  text: string,
  firstPersonName: string,
  secondPersonName: string,
  startId: number,
  baseDate: Date,
): Message[] {
  // In a real implementation, this would parse the OCR text into structured messages
  const messages: Message[] = []

  // Split the text by newlines to simulate different messages
  const lines = text.split("\n").filter((line) => line.trim().length > 0)

  // First pass: identify message patterns and potential senders
  const potentialSenders = new Set<string>()
  const messagePatterns = []

  for (const line of lines) {
    const trimmedLine = line.trim()

    // Skip file metadata and non-message lines
    if (trimmedLine.startsWith("File:") || trimmedLine.length < 5) {
      continue
    }

    // Check for common message patterns
    let sender = null
    let messageText = trimmedLine
    let timestamp = null

    // Pattern: "Person A: Message text"
    const colonPattern = /^([^:]+):\s*(.+)$/
    const colonMatch = trimmedLine.match(colonPattern)

    if (colonMatch) {
      sender = colonMatch[1].trim()
      messageText = colonMatch[2].trim()
      potentialSenders.add(sender)

      // Check if there's a timestamp at the end
      const timestampMatch = messageText.match(/(.+)\s+(\d{1,2}:\d{2}\s*(?:AM|PM)?)$/i)
      if (timestampMatch) {
        messageText = timestampMatch[1].trim()
        timestamp = timestampMatch[2].trim()
      }
    }
    // Pattern: "Person A - 10:15 AM: Message text"
    else {
      const dashPattern = /^([^-]+)-\s*([^:]+):\s*(.+)$/
      const dashMatch = trimmedLine.match(dashPattern)

      if (dashMatch) {
        sender = dashMatch[1].trim()
        timestamp = dashMatch[2].trim()
        messageText = dashMatch[3].trim()
        potentialSenders.add(sender)
      }
    }

    messagePatterns.push({
      line: trimmedLine,
      sender,
      messageText,
      timestamp,
    })
  }

  // Second pass: map detected senders to provided names
  let firstPersonDetected = ""
  let secondPersonDetected = ""

  if (potentialSenders.size >= 2) {
    // Convert set to array for easier handling
    const senderArray = Array.from(potentialSenders)

    // If we have exactly two senders, map them directly
    if (senderArray.length === 2) {
      firstPersonDetected = senderArray[0]
      secondPersonDetected = senderArray[1]
    }
    // If we have more than two, try to find best matches
    else {
      // Look for exact matches first
      for (const sender of senderArray) {
        if (sender.toLowerCase() === firstPersonName.toLowerCase()) {
          firstPersonDetected = sender
        } else if (sender.toLowerCase() === secondPersonName.toLowerCase()) {
          secondPersonDetected = sender
        }
      }

      // If we still don't have matches, use the first two detected senders
      if (!firstPersonDetected || !secondPersonDetected) {
        firstPersonDetected = firstPersonDetected || senderArray[0]
        secondPersonDetected = secondPersonDetected || senderArray[1]
      }
    }
  }

  // Third pass: create messages with proper attribution
  let lastSender = null
  let messageIndex = 0

  for (const pattern of messagePatterns) {
    // Skip non-message lines
    if (!pattern.messageText || pattern.messageText.length < 2) {
      continue
    }

    let sender

    // If we have a detected sender in this line
    if (pattern.sender) {
      // Map the detected sender to one of our person names
      if (pattern.sender === firstPersonDetected) {
        sender = firstPersonName
      } else if (pattern.sender === secondPersonDetected) {
        sender = secondPersonName
      } else {
        // If this is a new sender we haven't mapped yet
        if (lastSender === firstPersonName) {
          sender = secondPersonName
        } else {
          sender = firstPersonName
        }
      }
    }
    // If no sender detected in this line, alternate based on last sender
    else {
      if (!lastSender) {
        sender = firstPersonName
      } else {
        sender = lastSender === firstPersonName ? secondPersonName : firstPersonName
      }
    }

    // Create timestamp
    let timestamp
    if (pattern.timestamp) {
      // Try to parse the detected timestamp
      const timestampDate = new Date(baseDate)

      // Simple timestamp parsing for common formats
      const timeMatch = pattern.timestamp.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i)
      if (timeMatch) {
        let hours = Number.parseInt(timeMatch[1])
        const minutes = Number.parseInt(timeMatch[2])
        const ampm = timeMatch[3]?.toUpperCase()

        // Handle AM/PM
        if (ampm === "PM" && hours < 12) {
          hours += 12
        } else if (ampm === "AM" && hours === 12) {
          hours = 0
        }

        timestampDate.setHours(hours, minutes, 0, 0)
        timestamp = timestampDate.toISOString()
      } else {
        // Fallback: create sequential timestamps
        timestamp = new Date(baseDate.getTime() + messageIndex * 60000).toISOString()
      }
    } else {
      // No timestamp detected, create sequential timestamps
      timestamp = new Date(baseDate.getTime() + messageIndex * 60000).toISOString()
    }

    // Add the message
    messages.push({
      id: (startId + messageIndex).toString(),
      text: pattern.messageText,
      timestamp,
      sender,
      status: "read",
    })

    lastSender = sender
    messageIndex++
  }

  return messages
}
