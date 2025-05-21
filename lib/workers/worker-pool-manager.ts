/**
 * Worker Pool Manager
 *
 * Manages worker pools for different types of tasks.
 */

import { WorkerPool, type WorkerPoolOptions } from "./worker-pool"

// Define preprocessing strategies
export type PreprocessingStrategy =
  | "default"
  | "highContrast"
  | "binarize"
  | "sharpen"
  | "despeckle"
  | "normalize"
  | "invert"
  | "textOptimized"
  | "chatBubbles"
  | "darkMode"
  | "lightMode"

class WorkerPoolManager {
  private pools: Map<string, WorkerPool> = new Map()
  private isSupported: boolean

  constructor() {
    // Check if Web Workers are supported
    this.isSupported = typeof Worker !== "undefined"
  }

  /**
   * Checks if Web Workers are supported in the current environment
   */
  public supportsWorkers(): boolean {
    return this.isSupported
  }

  /**
   * Gets or creates a worker pool for a specific task type
   * @param poolType The type of pool to get or create
   * @param options Options for creating the pool
   * @returns The worker pool or null if not supported
   */
  public getPool(poolType: string, options?: Partial<WorkerPoolOptions>): WorkerPool | null {
    if (!this.isSupported) {
      console.warn("Web Workers are not supported in this environment")
      return null
    }

    if (this.pools.has(poolType)) {
      return this.pools.get(poolType) || null
    }

    try {
      let poolOptions: WorkerPoolOptions

      // Create the appropriate pool based on type
      switch (poolType) {
        case "ocr":
          poolOptions = {
            workerScript: new URL("./ocr-worker.ts", import.meta.url),
            maxWorkers: options?.maxWorkers || Math.max(2, navigator.hardwareConcurrency - 1),
            workerOptions: { type: "module" },
            taskTimeout: options?.taskTimeout || 60000,
            retryCount: options?.retryCount || 1,
          }
          break
        case "preprocessing":
          poolOptions = {
            workerScript: new URL("./preprocessing-worker.ts", import.meta.url),
            maxWorkers: options?.maxWorkers || Math.max(2, navigator.hardwareConcurrency - 1),
            workerOptions: { type: "module" },
            taskTimeout: options?.taskTimeout || 30000, // Preprocessing should be faster
            retryCount: options?.retryCount || 1,
          }
          break
        default:
          throw new Error(`Unknown pool type: ${poolType}`)
      }

      const pool = new WorkerPool({
        ...poolOptions,
        ...options,
      })

      this.pools.set(poolType, pool)
      return pool
    } catch (error) {
      console.error(`Error creating worker pool of type ${poolType}:`, error)
      return null
    }
  }

  /**
   * Preprocesses an image using the preprocessing worker pool
   * @param imageData The image data to preprocess
   * @param strategy The preprocessing strategy to apply
   * @param options Additional options
   * @param onProgress Callback for progress updates
   * @returns Promise resolving to the processed image data
   */
  public async preprocessImage(
    imageData: string,
    strategy: PreprocessingStrategy = "default",
    options: any = {},
    onProgress?: (progress: number) => void,
  ): Promise<string> {
    const pool = this.getPool("preprocessing", options.poolOptions)

    if (!pool) {
      throw new Error("Preprocessing worker pool could not be created")
    }

    try {
      const result = await pool.addTask(
        "PROCESS_IMAGE",
        {
          imageData,
          options: {
            ...options,
            strategy,
          },
        },
        {
          priority: options.priority || 0,
          onProgress,
        },
      )

      return result.processedImageData
    } catch (error) {
      console.error("Error preprocessing image:", error)
      // Return original image if preprocessing fails
      return imageData
    }
  }

  /**
   * Process multiple images in parallel using a worker pool
   * @param images Array of image data to process
   * @param options Processing options
   * @param onProgress Callback for overall progress updates
   * @returns Promise resolving to an array of results
   */
  public async processImagesInParallel(
    images: string[],
    options: any = {},
    onProgress?: (progress: number) => void,
  ): Promise<any[]> {
    // First, preprocess all images if preprocessing is enabled
    let processedImages = images

    if (options.preprocess !== false) {
      try {
        const preprocessingStrategy = options.preprocessingStrategy || "default"
        console.log(`Preprocessing ${images.length} images with strategy: ${preprocessingStrategy}`)

        // Track preprocessing progress
        let preprocessingProgress = 0
        const updatePreprocessingProgress = (progress: number) => {
          preprocessingProgress = progress
          if (onProgress) {
            // Preprocessing is 40% of the total progress
            onProgress(Math.round(preprocessingProgress * 0.4))
          }
        }

        // Preprocess images in parallel
        const preprocessingPromises = images.map((imageData, index) => {
          return this.preprocessImage(
            imageData,
            preprocessingStrategy as PreprocessingStrategy,
            {
              ...options,
              index,
              poolOptions: {
                maxWorkers: Math.max(2, navigator.hardwareConcurrency - 2), // Leave more cores for OCR
              },
            },
            (progress) => {
              // Update this image's contribution to total preprocessing progress
              preprocessingProgress += (progress / 100) * (1 / images.length) * 100
              updatePreprocessingProgress(preprocessingProgress)
            },
          )
        })

        processedImages = await Promise.all(preprocessingPromises)
        console.log("Preprocessing complete")
      } catch (preprocessingError) {
        console.warn("Image preprocessing failed, using original images:", preprocessingError)
        processedImages = images
      }
    }

    // Now perform OCR on the preprocessed images
    const pool = this.getPool("ocr", options.poolOptions)

    if (!pool) {
      throw new Error("OCR worker pool could not be created")
    }

    try {
      // Track overall progress
      let ocrProgress = 0
      const updateOcrProgress = (progress: number) => {
        ocrProgress = progress
        if (onProgress) {
          // OCR is 60% of the total progress (after 40% for preprocessing)
          const totalProgress = 40 + Math.round(ocrProgress * 0.6)
          onProgress(totalProgress)
        }
      }

      // Create tasks for each image
      const tasks = processedImages.map((imageData, index) => {
        return pool.addTask(
          "PROCESS_IMAGE",
          {
            imageData,
            options: {
              ...options,
              index,
              // Don't enhance the image in OCR worker if we've already preprocessed it
              enhanceImage: options.preprocess === false,
            },
          },
          {
            priority: options.priority || 0,
            onProgress: (progress) => {
              // Update this image's contribution to total OCR progress
              ocrProgress += (progress / 100) * (1 / processedImages.length) * 100
              updateOcrProgress(ocrProgress)
            },
          },
        )
      })

      // Wait for all tasks to complete
      const results = await Promise.all(tasks)

      // Ensure 100% progress is reported
      if (onProgress) {
        onProgress(100)
      }

      return results
    } catch (error) {
      console.error("Error processing images in parallel:", error)
      throw error
    }
  }

  /**
   * Terminates all worker pools
   */
  public terminateAll(): void {
    this.pools.forEach((pool, type) => {
      pool.terminate()
      console.log(`Terminated worker pool: ${type}`)
    })

    this.pools.clear()
  }

  /**
   * Terminates a specific worker pool
   * @param poolType The type of pool to terminate
   */
  public terminatePool(poolType: string): void {
    const pool = this.pools.get(poolType)
    if (pool) {
      pool.terminate()
      this.pools.delete(poolType)
      console.log(`Terminated worker pool: ${poolType}`)
    }
  }

  /**
   * Get statistics for all pools
   */
  public getStats(): Record<string, any> {
    const stats: Record<string, any> = {}

    this.pools.forEach((pool, type) => {
      stats[type] = pool.getStats()
    })

    return stats
  }
}

// Create a singleton instance
const workerPoolManager = new WorkerPoolManager()

export default workerPoolManager
