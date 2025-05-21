/**
 * OCR Worker
 *
 * Web Worker for performing OCR operations off the main thread.
 * This worker uses Tesseract.js to extract text from images.
 */

import { createWorker } from "tesseract.js"
import { preprocessImage } from "../image-preprocessing"

// Define the structure of incoming messages
interface WorkerMessage {
  taskId: string
  type: string
  data: {
    imageData: string
    options?: {
      lang?: string
      firstPersonName?: string
      secondPersonName?: string
      enhanceImage?: boolean
      [key: string]: any
    }
  }
}

// Initialize worker state
let tesseractWorker: any = null

/**
 * Process an image using OCR
 * @param imageData The image data as a base64 string
 * @param options Processing options
 * @returns The OCR result
 */
async function processImage(imageData: string, options: any = {}) {
  try {
    // Report progress
    self.postMessage({
      type: "progress",
      progress: 10,
      taskId: options.taskId,
    })

    // Initialize Tesseract worker if not already done
    if (!tesseractWorker) {
      tesseractWorker = await createWorker()
      await tesseractWorker.setParameters({
        tessedit_pageseg_mode: "SPARSE_TEXT",
      })
    }

    // Report progress
    self.postMessage({
      type: "progress",
      progress: 30,
      taskId: options.taskId,
    })

    // Preprocess the image if requested
    let processedImage = imageData
    if (options.enhanceImage !== false) {
      processedImage = await preprocessImage(imageData)
    }

    // Report progress
    self.postMessage({
      type: "progress",
      progress: 50,
      taskId: options.taskId,
    })

    // Perform OCR
    const result = await tesseractWorker.recognize(processedImage)

    // Report progress
    self.postMessage({
      type: "progress",
      progress: 80,
      taskId: options.taskId,
    })

    // Extract messages from the OCR result
    // This is a simplified version - in a real implementation,
    // you would import and use your message extraction logic
    const messages = extractMessagesFromText(
      result.data.text,
      options.firstPersonName || "User",
      options.secondPersonName || "Friend",
    )

    // Report progress
    self.postMessage({
      type: "progress",
      progress: 100,
      taskId: options.taskId,
    })

    // Return the result
    return {
      success: true,
      text: result.data.text,
      words: result.data.words || [],
      messages,
      confidence: result.data.confidence,
      debugInfo: {
        processingTime: Date.now() - (options.startTime || 0),
        enhancedImage: options.enhanceImage !== false,
        parameters: tesseractWorker.getParameters(),
      },
    }
  } catch (error) {
    console.error("OCR processing error in worker:", error)
    throw error
  }
}

/**
 * Extract messages from OCR text
 * This is a placeholder - you would import your actual extraction logic
 */
function extractMessagesFromText(text: string, firstPersonName: string, secondPersonName: string) {
  // Simplified placeholder implementation
  // In a real implementation, you would import and use your message extraction logic
  const lines = text.split("\n").filter((line) => line.trim().length > 0)
  const messages = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const isFromMe = i % 2 === 0 // Alternate for demo purposes

    messages.push({
      text: line,
      timestamp: new Date().toISOString(),
      sender: isFromMe ? firstPersonName : secondPersonName,
      isFromMe,
      sentiment: 0,
    })
  }

  return messages
}

// Set up message handler
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { taskId, type, data } = event.data

  try {
    if (type === "PROCESS_IMAGE") {
      const startTime = Date.now()
      const result = await processImage(data.imageData, {
        ...data.options,
        taskId,
        startTime,
      })

      self.postMessage({
        type: "complete",
        taskId,
        data: result,
      })
    } else {
      throw new Error(`Unknown task type: ${type}`)
    }
  } catch (error) {
    console.error("Worker error:", error)

    self.postMessage({
      type: "error",
      taskId,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

// Handle errors
self.onerror = (error) => {
  console.error("Worker global error:", error)
}
