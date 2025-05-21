/**
 * Worker Manager
 *
 * This module manages Web Workers for CPU-intensive operations.
 * It handles worker creation, message passing, and cleanup.
 */

// Type definitions for worker messages
export type WorkerMessage = {
  type: string
  imageData?: string
  options?: any
}

export type WorkerResponse = {
  type: "RESULT" | "ERROR" | "PROGRESS"
  data: any
  error?: string
  progress?: number
}

export type ProgressCallback = (progress: number) => void
export type ResultCallback = (result: any) => void
export type ErrorCallback = (error: string) => void

class WorkerManager {
  private workers: Map<string, Worker> = new Map()
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
   * Creates a new worker or returns an existing one
   * @param workerType The type of worker to create
   * @returns The worker instance or null if not supported
   */
  public getWorker(workerType: string): Worker | null {
    if (!this.isSupported) {
      console.warn("Web Workers are not supported in this environment")
      return null
    }

    if (this.workers.has(workerType)) {
      return this.workers.get(workerType) || null
    }

    try {
      let worker: Worker

      // Create the appropriate worker based on type
      switch (workerType) {
        case "ocr":
          worker = new Worker(new URL("./ocr-worker.ts", import.meta.url), { type: "module" })
          break
        default:
          throw new Error(`Unknown worker type: ${workerType}`)
      }

      this.workers.set(workerType, worker)
      return worker
    } catch (error) {
      console.error(`Error creating worker of type ${workerType}:`, error)
      return null
    }
  }

  /**
   * Processes an image using a Web Worker
   * @param imageData The image data to process
   * @param options Additional options for processing
   * @param onProgress Callback for progress updates
   * @param onResult Callback for the final result
   * @param onError Callback for errors
   * @returns A promise that resolves when processing is complete
   */
  public processImageWithWorker(
    imageData: string,
    options: any = {},
    onProgress?: ProgressCallback,
    onResult?: ResultCallback,
    onError?: ErrorCallback,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const worker = this.getWorker("ocr")

      if (!worker) {
        const error = "Web Workers are not supported in this environment"
        if (onError) onError(error)
        reject(new Error(error))
        return
      }

      // Set up message handler
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const { type, data, error, progress } = event.data

        switch (type) {
          case "RESULT":
            if (onResult) onResult(data)
            resolve(data)
            break
          case "ERROR":
            if (onError && error) onError(error)
            reject(new Error(error))
            break
          case "PROGRESS":
            if (onProgress && progress !== undefined) onProgress(progress)
            break
        }
      }

      // Handle worker errors
      worker.onerror = (error) => {
        const errorMessage = "Error in OCR worker: " + error.message
        if (onError) onError(errorMessage)
        reject(new Error(errorMessage))
      }

      // Send the message to the worker
      worker.postMessage({
        type: "PROCESS_IMAGE",
        imageData,
        options,
      } as WorkerMessage)
    })
  }

  /**
   * Terminates all workers and cleans up resources
   */
  public terminateAll(): void {
    this.workers.forEach((worker, type) => {
      worker.terminate()
      console.log(`Terminated worker: ${type}`)
    })

    this.workers.clear()
  }

  /**
   * Terminates a specific worker
   * @param workerType The type of worker to terminate
   */
  public terminateWorker(workerType: string): void {
    const worker = this.workers.get(workerType)
    if (worker) {
      worker.terminate()
      this.workers.delete(workerType)
      console.log(`Terminated worker: ${workerType}`)
    }
  }
}

// Create a singleton instance
const workerManager = new WorkerManager()

export default workerManager
