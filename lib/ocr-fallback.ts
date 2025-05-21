import { analyzeSentimentText } from "./sentiment-analyzer"
import type { MessageData, Message } from "./types"

/**
 * Fallback OCR function that attempts to extract text from an image using a simple, less accurate method.
 * This is intended to be used when the primary OCR service fails.
 *
 * @param imageBuffer - The image data as a Buffer.
 * @returns A promise that resolves with the extracted text, or an empty string if extraction fails.
 */
export async function ocrFallback(imageBuffer: Buffer): Promise<string> {
  try {
    // Simulate OCR processing with a delay. In a real implementation, this would
    // use a library like Tesseract.js or similar.
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Simulate text extraction. This is a placeholder.
    const extractedText = "Fallback OCR: This is a sample text extraction."

    // Analyze the sentiment of the extracted text.
    const sentimentAnalysisResult = await analyzeSentimentText(extractedText)

    // Log the sentiment analysis result (optional).
    console.log("Fallback OCR Sentiment Analysis:", sentimentAnalysisResult)

    return extractedText
  } catch (error) {
    console.error("Fallback OCR failed:", error)
    return ""
  }
}

/**
 * Creates synthetic words/messages for testing or when OCR fails completely.
 * This function generates a structured array of message data that mimics
 * what would be extracted from a real conversation.
 *
 * @param count - The number of synthetic messages to generate
 * @returns An array of MessageData objects representing synthetic messages
 */
export function createSyntheticWords(count = 10): MessageData[] {
  const senders = ["User1", "User2"]
  const sentiments = ["positive", "negative", "neutral"]
  const emotionalTones = ["happy", "sad", "angry", "anxious", "calm"]

  const syntheticMessages: MessageData[] = []

  for (let i = 0; i < count; i++) {
    const sender = senders[i % 2] // Alternate between senders
    const timestamp = new Date(Date.now() - (count - i) * 60000).toISOString() // Messages spaced 1 minute apart

    syntheticMessages.push({
      id: `synthetic-${i}`,
      text: `This is a synthetic message #${i} for testing purposes.`,
      sender,
      timestamp,
      position: {
        x: sender === "User1" ? 50 : 250, // Position User1 messages on left, User2 on right
        y: 100 + i * 50, // Stack messages vertically
        width: 200,
        height: 40,
      },
      sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
      emotionalTone: emotionalTones[Math.floor(Math.random() * emotionalTones.length)],
      confidence: 0.5, // Medium confidence since it's synthetic
    })
  }

  return syntheticMessages
}

/**
 * Extracts messages from raw text when OCR bounding box detection fails.
 * This function parses text into a structured message format based on
 * common patterns found in chat conversations.
 *
 * @param text - The raw text extracted from an image
 * @param firstPersonName - The name of the first person in the conversation
 * @param secondPersonName - The name of the second person in the conversation
 * @returns An array of Message objects
 */
export function extractMessagesFromText(text: string, firstPersonName: string, secondPersonName: string): Message[] {
  if (!text || typeof text !== "string") {
    console.error("No valid text provided for message extraction")
    return []
  }

  console.log("Extracting messages from raw text using fallback method")

  // Split text by line breaks
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)

  if (lines.length === 0) {
    console.warn("No content found in text")
    return []
  }

  const messages: Message[] = []
  let currentSender: string | null = null
  let currentMessageLines: string[] = []
  let currentTimestamp: string | null = null

  // Common patterns to identify message boundaries
  const timestampPatterns = [
    /\d{1,2}:\d{2}(?:\s?[AP]M)?/i, // 12:34 PM
    /\d{1,2}\/\d{1,2}\/\d{2,4}\s+\d{1,2}:\d{2}/i, // 01/23/2023 12:34
    /\d{1,2}\s+[A-Za-z]{3,}\s+\d{2,4}\s+\d{1,2}:\d{2}/i, // 23 Jan 2023 12:34
  ]

  // System messages to filter out
  const systemPatterns = [
    /^Delivered$/i,
    /^Read$/i,
    /^Sent$/i,
    /^Today$/i,
    /^Yesterday$/i,
    /^Last seen/i,
    /^Typing\.\.\.$/i,
  ]

  // Try to detect message patterns
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Skip very short lines or system messages
    if (line.length < 2 || systemPatterns.some((pattern) => pattern.test(line))) {
      continue
    }

    // Check for timestamp
    const hasTimestamp = timestampPatterns.some((pattern) => pattern.test(line))
    if (hasTimestamp) {
      const match = line.match(timestampPatterns.find((pattern) => pattern.test(line)))
      if (match) {
        currentTimestamp = match[0]
      }

      // If this is just a timestamp, skip to next line
      if (line.length < 10) continue
    }

    // Heuristic: Check if this line looks like a new message
    const isNewMessage =
      i === 0 || // First line
      hasTimestamp || // Has timestamp
      (line.length > 0 && line[0] === line[0].toUpperCase()) || // Starts with uppercase
      (i > 0 && lines[i - 1].trim().length === 0) || // Previous line was empty
      (line.includes(":") && line.indexOf(":") < 15) // Looks like "Name: message"

    // If this looks like a new message
    if (isNewMessage) {
      // Save previous message if we have one
      if (currentMessageLines.length > 0) {
        const messageText = currentMessageLines.join("\n")
        messages.push({
          sender: currentSender || firstPersonName,
          text: messageText,
          timestamp: currentTimestamp
            ? new Date(currentTimestamp).toISOString()
            : new Date(Date.now() - messages.length * 60000).toISOString(),
        })

        // Reset for new message
        currentMessageLines = []
      }

      // Try to determine sender from the line
      if (line.includes(firstPersonName)) {
        currentSender = firstPersonName
        // Remove name from the line
        currentMessageLines.push(line.replace(firstPersonName, "").replace(":", "").trim())
      } else if (line.includes(secondPersonName)) {
        currentSender = secondPersonName
        // Remove name from the line
        currentMessageLines.push(line.replace(secondPersonName, "").replace(":", "").trim())
      } else {
        // Alternate senders if we can't determine
        currentSender = messages.length % 2 === 0 ? firstPersonName : secondPersonName
        currentMessageLines.push(line)
      }
    } else {
      // Continue with current message
      currentMessageLines.push(line)
    }
  }

  // Add final message if there is one
  if (currentMessageLines.length > 0) {
    messages.push({
      sender: currentSender || firstPersonName,
      text: currentMessageLines.join("\n"),
      timestamp: currentTimestamp
        ? new Date(currentTimestamp).toISOString()
        : new Date(Date.now() - messages.length * 60000).toISOString(),
    })
  }

  // If we couldn't extract any messages, create some synthetic ones
  if (messages.length === 0) {
    console.warn("Could not extract messages from text, creating synthetic messages")
    return [
      {
        sender: firstPersonName,
        text: "I couldn't extract the actual messages from the image. This is a synthetic message.",
        timestamp: new Date(Date.now() - 120000).toISOString(),
      },
      {
        sender: secondPersonName,
        text: "Please try again with a clearer image or different preprocessing options.",
        timestamp: new Date(Date.now() - 60000).toISOString(),
      },
    ]
  }

  return messages
}
