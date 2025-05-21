import { createWorker } from "tesseract.js"
import { preprocessImage } from "./image-preprocessing"
import { fallbackOcr, extractMessagesFromText, createSyntheticWords } from "./ocr-fallback"

export interface OcrResult {
  success: boolean
  text?: string
  words?: any[]
  messages?: any[]
  confidence?: number
  error?: string
  debugInfo?: any
}

export async function performOcr(imageData: string | Blob): Promise<OcrResult> {
  try {
    console.log("Starting OCR processing...")

    // Try standard OCR first
    const worker = await createWorker()
    await worker.setParameters({
      tessedit_pageseg_mode: "SPARSE_TEXT",
    })

    // Preprocess the image
    const processedImage = await preprocessImage(imageData)

    // Perform OCR
    const result = await worker.recognize(processedImage)
    await worker.terminate()

    console.log("OCR completed with confidence:", result.data.confidence)

    // Check if we have word-level data
    if (result.data.words && result.data.words.length > 0) {
      // Standard processing - we have word data
      const messages = extractMessagesFromText(result.data.text)

      return {
        success: true,
        text: result.data.text,
        words: result.data.words,
        messages,
        confidence: result.data.confidence,
      }
    } else {
      console.log("No word-level data found, using fallback processing")

      // No word data, create synthetic words
      const words = createSyntheticWords(result.data.text)
      const messages = extractMessagesFromText(result.data.text)

      // If we have text but extraction failed, try fallback
      if (messages.length === 0 && result.data.text) {
        console.log("Message extraction failed, trying fallback OCR")
        return await fallbackOcr(imageData)
      }

      return {
        success: true,
        text: result.data.text,
        words,
        messages,
        confidence: result.data.confidence,
      }
    }
  } catch (error) {
    console.error("OCR processing failed:", error)

    // If standard OCR fails, try fallback
    console.log("Trying fallback OCR after error")
    return await fallbackOcr(imageData)
  }
}

export async function extractTextFromImage(imageData: string | Blob): Promise<string> {
  try {
    const result = await performOcr(imageData)
    return result.text || ""
  } catch (error) {
    console.error("Text extraction failed:", error)
    return ""
  }
}
