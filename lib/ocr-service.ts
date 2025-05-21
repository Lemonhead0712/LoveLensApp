export interface Word {
  text: string
  confidence: number
  box: {
    x0: number
    y0: number
    x1: number
    y1: number
  }
}

export interface OcrResult {
  words: Word[]
  text: string
}

export interface OcrService {
  extractTextFromImage(image: Buffer): Promise<OcrResult>
}

export class TesseractOcrService implements OcrService {
  private readonly tesseract: any // Import type later to avoid circular dependency

  constructor(tesseract: any) {
    this.tesseract = tesseract
  }

  async extractTextFromImage(image: Buffer): Promise<OcrResult> {
    try {
      const { data } = await this.tesseract.recognize(image, "eng", {
        tessedit_char_whitelist: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,-' ",
      })

      const words: Word[] = data.words.map((word: any) => ({
        text: word.text,
        confidence: word.confidence,
        box: {
          x0: word.bbox.x0,
          y0: word.bbox.y0,
          x1: word.bbox.x1,
          y1: word.bbox.y1,
        },
      }))

      if (words.length === 0) {
        throw new Error("OCR failed: Could not extract any text from the image")
      }

      const text = data.text

      return { words, text }
    } catch (error: any) {
      console.error("OCR Error:", error)
      throw new Error(`OCR failed: ${error.message}`)
    }
  }
}
