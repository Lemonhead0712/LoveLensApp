/**
 * OCR Web Worker
 *
 * This worker handles CPU-intensive OCR operations off the main thread.
 * It uses Tesseract.js to perform OCR on images and returns the results.
 */

import { createWorker } from "tesseract.js"

// Define message types for type safety
type WorkerMessage = {
  type: "PROCESS_IMAGE"
  imageData: string
  options?: {
    preprocessingOption?: string
    firstPersonName?: string
    secondPersonName?: string
  }
}

type WorkerResponse = {
  type: "RESULT" | "ERROR" | "PROGRESS"
  data: any
  error?: string
  progress?: number
}

// Initialize Tesseract worker
let tesseractWorker: any = null

// Handle messages from the main thread
self.addEventListener("message", async (event: MessageEvent<WorkerMessage>) => {
  const { type, imageData, options } = event.data

  if (type === "PROCESS_IMAGE") {
    try {
      // Send progress update
      self.postMessage({
        type: "PROGRESS",
        progress: 10,
        data: null,
      } as WorkerResponse)

      // Initialize Tesseract worker if not already initialized
      if (!tesseractWorker) {
        tesseractWorker = await createWorker()

        // Configure Tesseract for chat message detection
        await tesseractWorker.setParameters({
          tessedit_pageseg_mode: "11", // PSM.SPARSE_TEXT_OSD for better chat message detection
          tessedit_char_whitelist:
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,?!:;'\"()-_+=@#$%^&*<>{}[]|\\/ ",
          tessjs_create_hocr: "1",
          tessjs_create_tsv: "1",
        })

        self.postMessage({
          type: "PROGRESS",
          progress: 30,
          data: null,
        } as WorkerResponse)
      }

      // Process the image with Tesseract
      const result = await tesseractWorker.recognize(imageData)

      self.postMessage({
        type: "PROGRESS",
        progress: 80,
        data: null,
      } as WorkerResponse)

      // Post the result back to the main thread
      self.postMessage({
        type: "RESULT",
        data: result.data,
        progress: 100,
      } as WorkerResponse)
    } catch (error) {
      console.error("OCR Worker Error:", error)
      self.postMessage({
        type: "ERROR",
        data: null,
        error: error instanceof Error ? error.message : "Unknown error in OCR worker",
      } as WorkerResponse)
    }
  }
})

// Clean up when the worker is terminated
self.addEventListener("close", async () => {
  if (tesseractWorker) {
    await tesseractWorker.terminate()
    tesseractWorker = null
  }
})
