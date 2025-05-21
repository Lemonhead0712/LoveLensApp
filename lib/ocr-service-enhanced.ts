/**
 * Enhanced OCR Service with Worker Pool Support
 *
 * This module provides OCR functionality with performance optimizations
 * by offloading heavy processing to a pool of Web Workers when available.
 */

import type { Message } from "./types"
import { isClient } from "./utils"
import { performLocalOcrFallback } from "./ocr-fallback"
import workerPoolManager from "./workers/worker-pool-manager"

// Cache for OCR results to avoid redundant processing
const ocrCache = new Map<string, Message[]>()

/**
 * Generates a cache key for an image
 * @param imageData The image data
 * @returns A string key for caching
 */
function generateCacheKey(imageData: string): string {
  // Use a substring of the image data as the key
  // This is a simple approach - for production, consider using a hash function
  return imageData.substring(0, 100) + imageData.length
}

/**
 * Extracts text from multiple images using a pool of workers
 * @param imageDataArray Array of base64 image data
 * @param progressCallback Optional callback for progress updates
 * @returns Array of extracted messages from all images
 */
export async function extractTextFromImagesWithWorkerPool(
  imageDataArray: string[],
  progressCallback?: (progress: number) => void,
): Promise<Message[]> {
  try {
    // Check if we're in a client environment
    if (!isClient()) {
      throw new Error("Server-side text extraction is not supported")
    }

    // Check if any images are already in cache
    const uncachedImages: string[] = []
    const cachedMessages: Message[] = []

    imageDataArray.forEach((imageData) => {
      const cacheKey = generateCacheKey(imageData)
      if (ocrCache.has(cacheKey)) {
        console.log("Using cached OCR result")
        const cachedResult = ocrCache.get(cacheKey)
        if (cachedResult) {
          cachedMessages.push(...cachedResult)
        }
      } else {
        uncachedImages.push(imageData)
      }
    })

    // If all images were cached, return immediately
    if (uncachedImages.length === 0) {
      if (progressCallback) progressCallback(100)
      return cachedMessages
    }

    // Check if worker pools are supported
    if (workerPoolManager.supportsWorkers()) {
      try {
        console.log(`Processing ${uncachedImages.length} images with worker pool`)

        // Process all images in parallel with the worker pool
        const results = await workerPoolManager.processImagesInParallel(
          uncachedImages,
          {
            firstPersonName: "User",
            secondPersonName: "Friend",
            enhanceImage: true,
            poolOptions: {
              maxWorkers: Math.max(2, navigator.hardwareConcurrency - 1),
              taskTimeout: 120000, // 2 minutes per image
              retryCount: 2,
            },
          },
          progressCallback,
        )

        // Combine all messages from all images
        let allMessages: Message[] = [...cachedMessages]

        results.forEach((result, index) => {
          if (result && result.success && result.messages) {
            // Cache the result for this image
            const cacheKey = generateCacheKey(uncachedImages[index])
            ocrCache.set(cacheKey, result.messages)

            // Add to combined messages
            allMessages = [...allMessages, ...result.messages]
          }
        })

        return allMessages
      } catch (workerError) {
        console.warn("Worker pool OCR failed, falling back to sequential processing:", workerError)
        // Fall through to sequential processing
      }
    }

    // If worker pools aren't supported or failed, process images sequentially
    console.log("Processing images sequentially")

    let allMessages: Message[] = [...cachedMessages]
    let overallProgress = (cachedMessages.length / imageDataArray.length) * 100

    // Import the main thread implementation dynamically
    const { extractTextFromImage } = await import("./ocr-service")

    // Process each uncached image sequentially
    for (let i = 0; i < uncachedImages.length; i++) {
      const imageData = uncachedImages[i]

      try {
        const messages = await extractTextFromImage(imageData, (progress) => {
          if (progressCallback) {
            // Calculate overall progress
            const imageWeight = 1 / imageDataArray.length
            const imageProgress = progress * imageWeight
            const newOverallProgress = overallProgress + imageProgress
            progressCallback(Math.min(99, newOverallProgress)) // Cap at 99% until complete
          }
        })

        // Cache the result
        const cacheKey = generateCacheKey(imageData)
        ocrCache.set(cacheKey, messages)

        // Add to combined messages
        allMessages = [...allMessages, ...messages]

        // Update overall progress
        overallProgress += (1 / imageDataArray.length) * 100
      } catch (error) {
        console.warn(`Error processing image ${i}:`, error)

        // Try fallback for this image
        try {
          const fallbackMessages = await performLocalOcrFallback(imageData, "User", "Friend")
          allMessages = [...allMessages, ...fallbackMessages]
        } catch (fallbackError) {
          console.error(`Fallback also failed for image ${i}:`, fallbackError)
        }
      }
    }

    if (progressCallback) {
      progressCallback(100)
    }

    return allMessages
  } catch (error) {
    console.error("Error extracting text from images:", error)
    throw error
  }
}

/**
 * Clears the OCR cache
 */
export function clearOCRCache(): void {
  ocrCache.clear()
}

/**
 * Gets the size of the OCR cache
 * @returns The number of entries in the cache
 */
export function getOCRCacheSize(): number {
  return ocrCache.size
}
