/**
 * Worker Pool
 *
 * Manages a pool of Web Workers for parallel processing of tasks.
 */

import { TaskQueue, type Task } from "./task-queue"

export interface WorkerPoolOptions {
  maxWorkers?: number
  workerScript: string | URL
  workerOptions?: WorkerOptions
  taskTimeout?: number
  retryCount?: number
}

interface WorkerInfo {
  worker: Worker
  busy: boolean
  currentTaskId?: string
  startTime?: number
}

export class WorkerPool {
  private workers: WorkerInfo[] = []
  private taskQueue: TaskQueue
  private options: Required<WorkerPoolOptions>
  private isProcessing = false
  private activeTaskCount = 0
  private completedTaskCount = 0
  private failedTaskCount = 0
  private retryMap: Map<string, number> = new Map()

  constructor(options: WorkerPoolOptions) {
    this.options = {
      maxWorkers: options.maxWorkers || Math.max(2, navigator.hardwareConcurrency - 1),
      workerScript: options.workerScript,
      workerOptions: options.workerOptions || { type: "module" },
      taskTimeout: options.taskTimeout || 60000, // 1 minute default timeout
      retryCount: options.retryCount || 1,
    }

    this.taskQueue = new TaskQueue()
    this.initializeWorkers()
  }

  /**
   * Initialize the worker pool
   */
  private initializeWorkers(): void {
    for (let i = 0; i < this.options.maxWorkers; i++) {
      this.createWorker()
    }
    console.log(`Worker pool initialized with ${this.options.maxWorkers} workers`)
  }

  /**
   * Create a new worker
   * @returns The worker info object
   */
  private createWorker(): WorkerInfo {
    const worker = new Worker(this.options.workerScript, this.options.workerOptions)

    const workerInfo: WorkerInfo = {
      worker,
      busy: false,
    }

    worker.onmessage = (event) => this.handleWorkerMessage(event, workerInfo)
    worker.onerror = (error) => this.handleWorkerError(error, workerInfo)

    this.workers.push(workerInfo)
    return workerInfo
  }

  /**
   * Handle messages from workers
   * @param event The message event
   * @param workerInfo The worker info
   */
  private handleWorkerMessage(event: MessageEvent, workerInfo: WorkerInfo): void {
    const { type, taskId, data, progress, error } = event.data

    if (!taskId || !workerInfo.currentTaskId || taskId !== workerInfo.currentTaskId) {
      console.warn("Received message for unknown task", taskId)
      return
    }

    const task = this.taskQueue.getTask(taskId)
    if (!task) {
      console.warn("Task not found in queue", taskId)
      this.releaseWorker(workerInfo)
      return
    }

    switch (type) {
      case "progress":
        if (task.onProgress && typeof progress === "number") {
          task.onProgress(progress)
        }
        break

      case "complete":
        this.taskQueue.removeTask(taskId)
        this.completedTaskCount++
        this.activeTaskCount--

        if (task.onComplete) {
          task.onComplete(data)
        }

        this.releaseWorker(workerInfo)
        break

      case "error":
        this.handleTaskError(task, new Error(error || "Unknown worker error"), workerInfo)
        break

      default:
        console.warn("Unknown message type from worker", type)
        break
    }
  }

  /**
   * Handle worker errors
   * @param error The error event
   * @param workerInfo The worker info
   */
  private handleWorkerError(error: ErrorEvent, workerInfo: WorkerInfo): void {
    console.error("Worker error:", error)

    if (workerInfo.currentTaskId) {
      const task = this.taskQueue.getTask(workerInfo.currentTaskId)
      if (task) {
        this.handleTaskError(task, new Error(`Worker error: ${error.message}`), workerInfo)
      }
    }

    // Replace the crashed worker
    this.replaceWorker(workerInfo)
  }

  /**
   * Handle task errors with retry logic
   * @param task The task that failed
   * @param error The error that occurred
   * @param workerInfo The worker info
   */
  private handleTaskError(task: Task, error: Error, workerInfo: WorkerInfo): void {
    const retryCount = this.retryMap.get(task.id) || 0

    if (retryCount < this.options.retryCount) {
      // Retry the task
      console.log(`Retrying task ${task.id}, attempt ${retryCount + 1}`)
      this.retryMap.set(task.id, retryCount + 1)

      // Re-add the task to the queue with high priority
      this.taskQueue.removeTask(task.id)
      this.taskQueue.addTask({
        ...task,
        priority: task.priority + 10, // Increase priority for retries
      })

      this.releaseWorker(workerInfo)
    } else {
      // Task failed after all retry attempts
      this.taskQueue.removeTask(task.id)
      this.failedTaskCount++
      this.activeTaskCount--

      if (task.onError) {
        task.onError(error)
      }

      this.releaseWorker(workerInfo)
    }
  }

  /**
   * Replace a worker that may have crashed
   * @param workerInfo The worker info to replace
   */
  private replaceWorker(workerInfo: WorkerInfo): void {
    const index = this.workers.indexOf(workerInfo)
    if (index !== -1) {
      try {
        workerInfo.worker.terminate()
      } catch (e) {
        console.warn("Error terminating worker", e)
      }

      this.workers.splice(index, 1)
      this.createWorker()
    }
  }

  /**
   * Release a worker back to the pool
   * @param workerInfo The worker info
   */
  private releaseWorker(workerInfo: WorkerInfo): void {
    workerInfo.busy = false
    workerInfo.currentTaskId = undefined
    workerInfo.startTime = undefined

    // Process next task if available
    this.processNextTask()
  }

  /**
   * Process the next task in the queue
   */
  private processNextTask(): void {
    if (!this.isProcessing || !this.taskQueue.hasTasks()) return

    const availableWorker = this.workers.find((w) => !w.busy)
    if (!availableWorker) return

    const task = this.taskQueue.getNextTask()
    if (!task) return

    availableWorker.busy = true
    availableWorker.currentTaskId = task.id
    availableWorker.startTime = Date.now()
    this.activeTaskCount++

    // Send the task to the worker
    availableWorker.worker.postMessage({
      taskId: task.id,
      type: task.type,
      data: task.data,
    })

    // Set up task timeout
    setTimeout(() => {
      if (availableWorker.busy && availableWorker.currentTaskId === task.id) {
        console.warn(`Task ${task.id} timed out after ${this.options.taskTimeout}ms`)
        this.handleTaskError(task, new Error(`Task timed out after ${this.options.taskTimeout}ms`), availableWorker)
      }
    }, this.options.taskTimeout)

    // Check for more tasks to process
    if (this.taskQueue.hasTasks()) {
      this.processNextTask()
    }
  }

  /**
   * Add a task to the pool
   * @param type The task type
   * @param data The task data
   * @param options Task options
   * @returns A promise that resolves with the task result
   */
  public addTask<T = any>(
    type: string,
    data: any,
    options: {
      priority?: number
      onProgress?: (progress: number) => void
    } = {},
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const taskId = this.taskQueue.addTask({
        type,
        data,
        priority: options.priority || 0,
        onProgress: options.onProgress,
        onComplete: resolve,
        onError: reject,
      })

      // Start processing if not already
      if (!this.isProcessing) {
        this.start()
      } else {
        // Process next task if workers are available
        this.processNextTask()
      }

      return taskId
    })
  }

  /**
   * Start processing tasks
   */
  public start(): void {
    if (this.isProcessing) return

    this.isProcessing = true
    this.processNextTask()
  }

  /**
   * Stop processing tasks
   * @param clearQueue Whether to clear the task queue
   */
  public stop(clearQueue = false): void {
    this.isProcessing = false

    if (clearQueue) {
      this.taskQueue.clear()
    }
  }

  /**
   * Get statistics about the worker pool
   */
  public getStats() {
    return {
      totalWorkers: this.workers.length,
      busyWorkers: this.workers.filter((w) => w.busy).length,
      queuedTasks: this.taskQueue.size(),
      activeTasks: this.activeTaskCount,
      completedTasks: this.completedTaskCount,
      failedTasks: this.failedTaskCount,
    }
  }

  /**
   * Terminate all workers and clean up
   */
  public terminate(): void {
    this.stop(true)

    for (const workerInfo of this.workers) {
      try {
        workerInfo.worker.terminate()
      } catch (e) {
        console.warn("Error terminating worker", e)
      }
    }

    this.workers = []
    this.activeTaskCount = 0
  }
}
