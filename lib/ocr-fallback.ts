import { analyzeSentimentText } from "./sentiment-analyzer"
import type { MessageData } from "./types"

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
