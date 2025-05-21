import { createWorker } from "tesseract.js"
import { readFile } from "fs/promises"
import { Image } from "image-js"

interface AnalyzedScreenshot {
  text: string
}

async function analyzeScreenshot(imagePath: string): Promise<AnalyzedScreenshot> {
  try {
    const imageBuffer = await readFile(imagePath)
    const image = await Image.load(imageBuffer)

    // Ensure the image is grayscale for better OCR accuracy
    if (image.channels > 1) {
      image.grey()
    }

    const worker = await createWorker()

    try {
      await worker.loadLanguage("eng")
      await worker.initialize("eng")
      await worker.setParameters({
        tessedit_pageseg_mode: 1, // Automatic page segmentation with OSD
        tessedit_char_whitelist: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,:- ", // Limit characters to improve accuracy
      })

      const {
        data: { text },
      } = await worker.recognize(image.toBuffer())
      await worker.terminate()

      return { text }
    } catch (ocrError) {
      console.error("OCR Error:", ocrError)
      await worker.terminate()
      throw new Error("OCR processing failed.")
    }
  } catch (error) {
    console.error("Error analyzing screenshot:", error)
    throw new Error("Failed to analyze screenshot.")
  }
}

export { analyzeScreenshot, type AnalyzedScreenshot }
