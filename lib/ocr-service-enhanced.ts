import type { Message } from "./types"

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

// Enhanced OCR service with better message attribution
export async function extractTextFromImage(imageData: string): Promise<Message[]> {
  try {
    // In a real implementation, this would call an actual OCR service
    // For now, we'll simulate the OCR process with improved positioning logic
    const ocrResults = await simulateOCR(imageData)

    // Process OCR results to extract messages with positions
    const positionedMessages = processOCRResults(ocrResults)

    // Attribute messages to senders based on position and context
    const attributedMessages = attributeMessagesToSenders(positionedMessages)

    return attributedMessages
  } catch (error) {
    console.error("Error extracting text from image:", error)
    throw new Error("Failed to extract text from image")
  }
}

// Simulate OCR process with position information
async function simulateOCR(imageData: string): Promise<OCRResult[]> {
  // In a real implementation, this would call an actual OCR API
  // For demonstration, we'll return simulated results

  // This is just a placeholder - in a real implementation,
  // this would process the image and return actual OCR results
  return [
    {
      text: "Hey, how are you doing today?",
      boundingBox: { x: 10, y: 50, width: 200, height: 30 },
      confidence: 0.95,
    },
    {
      text: "I'm okay. Just tired from work.",
      boundingBox: { x: 250, y: 100, width: 200, height: 30 },
      confidence: 0.92,
    },
    {
      text: "You always say that. Do you ever take breaks?",
      boundingBox: { x: 10, y: 150, width: 200, height: 30 },
      confidence: 0.88,
    },
    {
      text: "What do you mean 'always'? That's not fair.",
      boundingBox: { x: 250, y: 200, width: 200, height: 30 },
      confidence: 0.9,
    },
  ]
}

// Process OCR results to extract messages with positions
function processOCRResults(ocrResults: OCRResult[]): PositionedMessage[] {
  // Sort results by vertical position (y-coordinate)
  const sortedResults = [...ocrResults].sort((a, b) => a.boundingBox.y - b.boundingBox.y)

  // Determine left/right threshold based on image width
  // In a real implementation, this would be based on the actual image dimensions
  const centerX = 150 // Assume image width is 300px

  // Convert OCR results to positioned messages
  return sortedResults.map((result) => {
    // Determine position based on x-coordinate
    const position = result.boundingBox.x < centerX ? "left" : "right"

    return {
      content: result.text,
      position,
      confidence: result.confidence,
    }
  })
}

// Attribute messages to senders based on position and context
function attributeMessagesToSenders(positionedMessages: PositionedMessage[]): Message[] {
  // Determine which position (left or right) corresponds to which sender
  // This is a heuristic approach - in a real implementation, this might use
  // additional information like user avatars, names, etc.

  // Count messages on each side
  const leftCount = positionedMessages.filter((m) => m.position === "left").length
  const rightCount = positionedMessages.filter((m) => m.position === "right").length

  // Assume the side with more messages is "person1" (the user)
  const person1Position = leftCount >= rightCount ? "left" : "right"
  const person2Position = person1Position === "left" ? "right" : "left"

  // Convert positioned messages to attributed messages
  return positionedMessages.map((message) => ({
    sender: message.position === person1Position ? "person1" : "person2",
    content: message.content,
    timestamp: message.timestamp || new Date().toISOString(),
  }))
}

// Function to deduplicate messages
export function deduplicateMessages(messages: Message[]): Message[] {
  const uniqueMessages: Message[] = []
  const seenContents = new Set<string>()

  for (const message of messages) {
    // Normalize content for comparison (trim whitespace, lowercase)
    const normalizedContent = message.content.trim().toLowerCase()

    // Skip if we've seen this content before
    if (seenContents.has(normalizedContent)) {
      continue
    }

    // Add to unique messages and mark as seen
    uniqueMessages.push(message)
    seenContents.add(normalizedContent)
  }

  return uniqueMessages
}

// Function to validate extracted messages
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
