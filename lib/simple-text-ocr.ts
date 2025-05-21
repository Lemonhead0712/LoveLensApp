import type { Message } from "./types"
import { createWorker } from "tesseract.js"
import { isClient } from "./utils"

/**
 * A simple text-based OCR approach as a fallback when bounding box detection fails
 */

/**
 * Extract text from an image using Tesseract's simpler PSM modes
 */
export async function extractTextOnly(imageData: string): Promise<string> {
  try {
    if (!isClient()) {
      return "Server-side OCR is limited. Please use client-side for better results."
    }

    // Create worker with simpler config
    const worker = await createWorker()

    // Use a simpler page segmentation mode that treats the image as a single block of text
    await worker.setParameters({
      tessedit_pageseg_mode: "6", // PSM_SINGLE_BLOCK - simpler, more robust mode
      tessedit_ocr_engine_mode: "1", // LSTM only
      tessjs_create_hocr: "0", // Don't need HOCR
      tessjs_create_tsv: "0", // Don't need TSV
    })

    // Recognize text
    console.log("Starting simple text OCR...")
    const result = await worker.recognize(imageData)
    console.log("Simple text OCR complete")

    await worker.terminate()

    return result.data.text || ""
  } catch (error) {
    console.error("Error in simple text OCR:", error)
    return ""
  }
}

/**
 * Parse extracted text into alternating messages
 */
export function parseTextIntoMessages(text: string, firstPersonName: string, secondPersonName: string): Message[] {
  if (!text || text.trim().length === 0) {
    return []
  }

  // Split text into paragraphs
  const paragraphs = text
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0)
    .map((p) => p.trim())

  if (paragraphs.length === 0) {
    return []
  }

  // If we only have one paragraph, try to split it by other means
  let segments = paragraphs
  if (paragraphs.length === 1) {
    const lines = paragraphs[0].split(/\n/)
    if (lines.length > 2) {
      segments = lines.filter((line) => line.trim().length > 0)
    } else {
      // Try to split by sentences
      segments = paragraphs[0].split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0)
    }
  }

  // Create messages, alternating between people
  const messages: Message[] = []
  segments.forEach((segment, index) => {
    const text = segment.trim()
    if (text.length === 0) return

    // Skip lines that are likely just timestamps or system indicators
    if (/^\d{1,2}:\d{2}\s*(am|pm)?$/i.test(text) || /^(today|yesterday)$/i.test(text)) {
      return
    }

    messages.push({
      sender: index % 2 === 0 ? firstPersonName : secondPersonName,
      text,
      timestamp: new Date(Date.now() - (segments.length - index) * 60000).toISOString(),
    })
  })

  return messages
}

/**
 * Extract messages directly from image with a simpler approach
 * This is used as a fallback when more sophisticated methods fail
 */
export async function extractMessagesWithSimpleOCR(
  imageFile: File,
  firstPersonName: string,
  secondPersonName: string,
): Promise<Message[]> {
  try {
    if (!isClient()) {
      return [
        {
          sender: firstPersonName,
          text: "Server-side simple OCR processing is not available.",
          timestamp: new Date().toISOString(),
        },
      ]
    }

    // Convert file to base64
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(imageFile)
    })

    // Extract text with simple OCR
    const extractedText = await extractTextOnly(base64)

    if (!extractedText || extractedText.trim().length === 0) {
      return []
    }

    // Parse text into messages
    return parseTextIntoMessages(extractedText, firstPersonName, secondPersonName)
  } catch (error) {
    console.error("Error in simple OCR extraction:", error)
    return []
  }
}
