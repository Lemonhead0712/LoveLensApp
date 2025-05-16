import type { Message } from "./types"
import { getOpenAIKey, isOpenAIEnabled } from "./api-config"

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

// Enhanced OCR service with better message attribution and OpenAI refinement
export async function extractTextFromImage(imageData: string): Promise<Message[]> {
  try {
    console.log("Starting OCR extraction process...")

    // Step 1: Perform initial OCR on the image
    const ocrResults = await performOCR(imageData)

    if (!ocrResults || ocrResults.length === 0) {
      console.warn("OCR returned no results")
      return []
    }

    console.log(`OCR extracted ${ocrResults.length} text blocks`)

    // Step 2: Process OCR results to extract messages with positions
    const positionedMessages = processOCRResults(ocrResults)

    // Step 3: Use OpenAI to refine and enhance the OCR results
    const enhancedMessages = await enhanceWithOpenAI(positionedMessages)

    // Step 4: Attribute messages to senders based on position and context
    const attributedMessages = attributeMessagesToSenders(enhancedMessages)

    console.log(`Extracted and processed ${attributedMessages.length} messages`)
    return attributedMessages
  } catch (error) {
    console.error("Error extracting text from image:", error)
    throw new Error("Failed to extract text from image")
  }
}

// Perform OCR on the image data
async function performOCR(imageData: string): Promise<OCRResult[]> {
  // In a production environment, this would call an actual OCR API like Google Cloud Vision,
  // Microsoft Computer Vision, or Tesseract.js

  // For now, we'll simulate the OCR process with improved positioning logic
  // This would be replaced with actual API calls in production

  try {
    // Convert base64 image data to a format suitable for OCR API
    // const imageBuffer = Buffer.from(imageData.split(',')[1], 'base64')

    // Simulate OCR API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Simulate OCR results
    // In production, this would be the result from the OCR API
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
  } catch (error) {
    console.error("OCR processing error:", error)
    throw new Error("Failed to process image with OCR")
  }
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

// Use OpenAI to enhance and refine OCR results
async function enhanceWithOpenAI(positionedMessages: PositionedMessage[]): Promise<PositionedMessage[]> {
  if (!isOpenAIEnabled()) {
    console.log("OpenAI enhancement skipped: API not enabled")
    return positionedMessages
  }

  try {
    const apiKey = await getOpenAIKey()

    if (!apiKey) {
      console.warn("OpenAI API key not available, skipping enhancement")
      return positionedMessages
    }

    console.log("Enhancing OCR results with OpenAI...")

    // Prepare the messages for OpenAI processing
    const messagesForProcessing = positionedMessages
      .map(
        (msg, index) => `Message ${index + 1} (${msg.position} side, confidence: ${msg.confidence}): "${msg.content}"`,
      )
      .join("\n")

    // Create the prompt for OpenAI
    const prompt = `
      I have extracted the following text messages from a conversation screenshot using OCR.
      Some messages may contain errors, be incomplete, or have formatting issues.
      
      ${messagesForProcessing}
      
      Please correct any OCR errors, fix formatting issues, and ensure each message is complete and makes sense.
      Return the corrected messages in JSON format as an array of objects with the following structure:
      [
        {
          "content": "corrected message text",
          "position": "left or right (same as original)",
          "confidence": number (original confidence or 1.0 if fully corrected)
        }
      ]
      
      Only return the JSON array, nothing else.
    `

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an OCR correction assistant. Your task is to fix errors in text extracted from images and return the corrected text in JSON format.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.warn(`OpenAI API error: ${errorData.error?.message || response.statusText}`)
      return positionedMessages
    }

    const data = await response.json()
    const enhancedText = data.choices[0]?.message?.content?.trim()

    if (!enhancedText) {
      console.warn("Empty response from OpenAI")
      return positionedMessages
    }

    // Extract JSON from the response
    const jsonMatch = enhancedText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.warn("Could not extract JSON from OpenAI response")
      return positionedMessages
    }

    try {
      const enhancedMessages = JSON.parse(jsonMatch[0])
      console.log(`OpenAI successfully enhanced ${enhancedMessages.length} messages`)
      return enhancedMessages
    } catch (error) {
      console.error("Error parsing enhanced messages from OpenAI:", error)
      return positionedMessages
    }
  } catch (error) {
    console.error("Error enhancing OCR results with OpenAI:", error)
    return positionedMessages
  }
}

// Attribute messages to senders based on position and context
function attributeMessagesToSenders(positionedMessages: PositionedMessage[]): Message[] {
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
