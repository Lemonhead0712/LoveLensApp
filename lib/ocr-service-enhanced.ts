import { createWorker } from "tesseract.js"
import { preprocessImage, defaultOptions } from "./image-preprocessing"
import { isClient } from "./utils"
import {
  createMetricsSession,
  startTiming,
  endTiming,
  recordAccuracy,
  recordResourceUsage,
  saveMetrics,
} from "./ocr-metrics"

/**
 * Perform OCR on an image with detailed performance metrics
 */
export async function performOcr(imageData: string | Blob, options = {}) {
  // Create a metrics session
  const imageInfo = {
    filename: imageData instanceof Blob ? imageData.name || "unknown" : "base64-image",
    width: 0,
    height: 0,
    fileSize: imageData instanceof Blob ? imageData.size : 0,
    format: imageData instanceof Blob ? imageData.type.split("/")[1] || "unknown" : "unknown",
  }

  const metrics = createMetricsSession(imageInfo)

  // Start total timing
  const totalTiming = startTiming("total")

  try {
    // Check if we're in a client environment
    if (!isClient()) {
      throw new Error("Server-side OCR processing is not supported")
    }

    // Record resource usage at start
    metrics.resources.push(recordResourceUsage("start"))

    // Start preprocessing timing
    const preprocessingTiming = startTiming("preprocessing")

    // Preprocess the image
    const preprocessedImage = await preprocessImage(imageData, options.preprocessingOption || defaultOptions)

    // Update metrics with preprocessing option
    metrics.preprocessingOption = options.preprocessingOption || "default"

    // End preprocessing timing
    metrics.timings.push(endTiming(preprocessingTiming))

    // Get image dimensions for metrics
    if (typeof preprocessedImage === "string" && preprocessedImage.startsWith("data:")) {
      const img = new Image()
      img.src = preprocessedImage
      await new Promise((resolve) => {
        img.onload = () => {
          metrics.imageInfo.width = img.width
          metrics.imageInfo.height = img.height
          resolve(null)
        }
      })
    }

    // Start OCR worker timing
    const workerTiming = startTiming("worker_initialization")

    // Create a worker
    const worker = await createWorker()

    // End worker timing
    metrics.timings.push(endTiming(workerTiming))

    // Start parameter setting timing
    const paramTiming = startTiming("parameter_setting")

    // Set parameters for sparse text detection
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

    // End parameter timing
    metrics.timings.push(endTiming(paramTiming))

    // Start recognition timing
    const recognitionTiming = startTiming("recognition")

    // Perform OCR
    const result = await worker.recognize(preprocessedImage)

    // End recognition timing
    metrics.timings.push(endTiming(recognitionTiming))

    // Start cleanup timing
    const cleanupTiming = startTiming("cleanup")

    // Terminate worker
    await worker.terminate()

    // End cleanup timing
    metrics.timings.push(endTiming(cleanupTiming))

    // Record resource usage at end
    metrics.resources.push(recordResourceUsage("end"))

    // Extract text and words
    const text = result.data.text || ""
    const words = result.data.words || []

    // Record accuracy metrics
    metrics.accuracy.push(recordAccuracy("raw_text", result.data.confidence || 0, words.length, text.length))

    // Update metrics with extraction results
    metrics.extractedTextLength = text.length
    metrics.extractedWordCount = words.length
    metrics.overallConfidence = result.data.confidence || 0

    // Process words for message detection
    const messages = processWordsIntoMessages(words)

    // Update metrics with message count
    metrics.extractedMessageCount = messages.length

    // Record message detection accuracy
    if (words.length > 0) {
      metrics.accuracy.push(
        recordAccuracy(
          "message_detection",
          (messages.length / words.length) * 100,
          messages.length,
          messages.reduce((sum, msg) => sum + msg.text.length, 0),
        ),
      )
    }

    // End total timing
    metrics.timings.push(endTiming(totalTiming))

    // Save metrics
    saveMetrics(metrics)

    return {
      success: true,
      text,
      words,
      messages,
      confidence: result.data.confidence || 0,
      metrics,
    }
  } catch (error) {
    // End total timing even on error
    metrics.timings.push(endTiming(totalTiming))

    // Save metrics with error flag
    metrics.successRate = 0
    saveMetrics(metrics)

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      metrics,
    }
  }
}

/**
 * Process words into messages (simplified version for the example)
 */
function processWordsIntoMessages(words: any[]) {
  // This is a simplified implementation
  // In a real implementation, this would use more sophisticated logic
  // to group words into messages based on position, etc.

  const messages: any[] = []
  let currentMessage: any = null

  words.forEach((word, index) => {
    if (!word.text || !word.bbox) return

    // Start a new message every few words (simplified)
    if (index % 5 === 0 || !currentMessage) {
      if (currentMessage) {
        messages.push(currentMessage)
      }

      currentMessage = {
        text: word.text,
        position: {
          x: word.bbox.x0,
          y: word.bbox.y0,
          width: word.bbox.x1 - word.bbox.x0,
          height: word.bbox.y1 - word.bbox.y0,
        },
        confidence: word.confidence,
      }
    } else if (currentMessage) {
      // Add to current message
      currentMessage.text += ` ${word.text}`

      // Update position to encompass both
      currentMessage.position.width = Math.max(currentMessage.position.width, word.bbox.x1 - currentMessage.position.x)

      // Average the confidence
      currentMessage.confidence = (currentMessage.confidence + word.confidence) / 2
    }
  })

  // Add the last message if it exists
  if (currentMessage) {
    messages.push(currentMessage)
  }

  return messages
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
