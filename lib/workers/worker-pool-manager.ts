/**
 * Worker Pool Manager
 *
 * Manages worker pools for different types of tasks.
 */

import { WorkerPool, type WorkerPoolOptions } from "./worker-pool"

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
    const pool = this.getPool("ocr", options.poolOptions)

    if (!pool) {
      throw new Error("Worker pool could not be created")
    }

    try {
      // Track overall progress
      let totalProgress = 0
      const updateProgress = () => {
        if (onProgress) {
          const overallProgress = Math.round(totalProgress / images.length)
          onProgress(overallProgress)
        }
      }

      // Create tasks for each image
      const tasks = images.map((imageData, index) => {
        return pool.addTask(
          "PROCESS_IMAGE",
          {
            imageData,
            options: {
              ...options,
              index,
            },
          },
          {
            priority: options.priority || 0,
            onProgress: (progress) => {
              // Update this image's contribution to total progress
              totalProgress += (progress / 100) * (1 / images.length) * 100
              updateProgress()
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
