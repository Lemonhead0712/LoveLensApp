import type { Message } from "./types"
import { createWorker } from "tesseract.js"
import { createCanvas, loadImage } from "canvas"

// Interface for OCR preprocessing options
interface PreprocessingOptions {
  grayscale: boolean
  enhanceContrast: boolean
  resize: boolean
  targetWidth?: number
  debug: boolean
}

/**
 * Preprocess image before OCR to improve text recognition
 */
async function preprocessImage(
  imageFile: File,
  options: PreprocessingOptions = {
    grayscale: true,
    enhanceContrast: true,
    resize: true,
    targetWidth: 1200,
    debug: false,
  },
): Promise<string> {
  // Convert file to image data
  const arrayBuffer = await imageFile.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const image = await loadImage(buffer)

  // Create canvas with original dimensions or resize if needed
  let width = image.width
  let height = image.height

  if (options.resize && options.targetWidth && width < options.targetWidth) {
    // Upscale small images to improve OCR
    const scaleFactor = options.targetWidth / width
    width = options.targetWidth
    height = Math.floor(height * scaleFactor)
  }

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext("2d")

  // Draw original image
  ctx.drawImage(image, 0, 0, width, height)

  // Apply grayscale if enabled
  if (options.grayscale) {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
      data[i] = avg // red
      data[i + 1] = avg // green
      data[i + 2] = avg // blue
    }

    ctx.putImageData(imageData, 0, 0)
  }

  // Apply contrast enhancement if enabled
  if (options.enhanceContrast) {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    // Find min and max values
    let min = 255
    let max = 0

    for (let i = 0; i < data.length; i += 4) {
      const val = (data[i] + data[i + 1] + data[i + 2]) / 3
      if (val < min) min = val
      if (val > max) max = val
    }

    // Apply contrast stretching
    const range = max - min
    if (range > 0) {
      for (let i = 0; i < data.length; i += 4) {
        for (let j = 0; j < 3; j++) {
          data[i + j] = ((data[i + j] - min) / range) * 255
        }
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }

  // Return as data URL
  return canvas.toDataURL("image/png")
}

/**
 * Extract messages from screenshots with enhanced preprocessing
 */
export async function extractMessagesWithEnhancedOCR(
  screenshots: File[],
  firstPersonName: string,
  secondPersonName: string,
  debugMode = false,
): Promise<{ messages: Message[]; debugData?: any[] }> {
  try {
    console.log(`Extracting text from ${screenshots.length} screenshots with enhanced OCR`)

    if (!screenshots || screenshots.length === 0) {
      throw new Error("No screenshots provided")
    }

    // Process each screenshot with enhanced preprocessing
    const allMessages: Message[] = []
    const debugData: any[] = []

    for (const screenshot of screenshots) {
      try {
        // Preprocess the image
        const preprocessedImage = await preprocessImage(screenshot, {
          grayscale: true,
          enhanceContrast: true,
          resize: true,
          targetWidth: 1200,
          debug: debugMode,
        })

        // Create a worker with optimized settings for chat messages
        const worker = await createWorker()

        // Set parameters optimized for chat bubbles and sparse text
        await worker.setParameters({
          tessedit_pageseg_mode: "11", // PSM_SPARSE_TEXT_OSD - Better for chat bubbles
          tessedit_char_whitelist:
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,?!:;'\"()-_+=@#$%^&*<>{}[]|\\/ ",
          tessjs_create_hocr: "1", // Enable HOCR output for debugging
          tessjs_create_tsv: "1", // Enable TSV output for detailed word data
        })

        // Recognize text
        console.log(`Processing screenshot: ${screenshot.name}`)
        const result = await worker.recognize(preprocessedImage)

        // Store debug data if enabled
        if (debugMode) {
          debugData.push({
            filename: screenshot.name,
            words: result.data.words,
            hocr: result.data.hocr,
            tsv: result.data.tsv,
            text: result.data.text,
          })
        }

        // Process the OCR result to extract messages
        // This would call your existing processing functions
        // ...

        await worker.terminate()
      } catch (error) {
        console.error(`Error processing screenshot ${screenshot.name}:`, error)
      }
    }

    // Validate and return results
    if (allMessages.length === 0) {
      throw new Error("OCR failed: No messages could be extracted from the screenshots")
    }

    return {
      messages: allMessages,
      debugData: debugMode ? debugData : undefined,
    }
  } catch (error) {
    console.error("Error in enhanced OCR extraction:", error)
    throw error
  }
}

/**
 * Debug utility to visualize OCR bounding boxes
 */
export function createDebugVisualization(imageDataUrl: string, words: any[]): string {
  return new Promise(async (resolve) => {
    const image = await loadImage(imageDataUrl)
    const canvas = createCanvas(image.width, image.height)
    const ctx = canvas.getContext("2d")

    // Draw original image
    ctx.drawImage(image, 0, 0)

    // Draw bounding boxes
    ctx.strokeStyle = "rgba(255, 0, 0, 0.7)"
    ctx.lineWidth = 2

    words.forEach((word) => {
      if (word.bbox) {
        const { x0, y0, x1, y1 } = word.bbox
        ctx.strokeRect(x0, y0, x1 - x0, y1 - y0)

        // Add text label
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
        ctx.fillRect(x0, y0 - 20, 100, 20)
        ctx.fillStyle = "rgba(0, 0, 0, 1)"
        ctx.font = "12px Arial"
        ctx.fillText(`${word.text} (${word.confidence.toFixed(0)}%)`, x0, y0 - 5)
      }
    })

    resolve(canvas.toDataURL("image/png"))
  })
}
