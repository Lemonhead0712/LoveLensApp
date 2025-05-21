/**
 * Task Queue
 *
 * A queue system for managing asynchronous tasks to be processed by workers.
 */

export interface Task<T = any> {
  id: string
  type: string
  data: any
  priority: number
  createdAt: number
  onProgress?: (progress: number) => void
  onComplete?: (result: T) => void
  onError?: (error: Error) => void
}

export class TaskQueue {
  private queue: Task[] = []
  private taskMap: Map<string, Task> = new Map()

  /**
   * Add a task to the queue
   * @param task The task to add
   * @returns The task ID
   */
  public addTask(task: Omit<Task, "id" | "createdAt">): string {
    const id = crypto.randomUUID()
    const fullTask: Task = {
      ...task,
      id,
      createdAt: Date.now(),
    }

    this.queue.push(fullTask)
    this.taskMap.set(id, fullTask)

    // Sort the queue by priority (higher numbers = higher priority)
    this.queue.sort((a, b) => b.priority - a.priority)

    return id
  }

  /**
   * Get the next task from the queue
   * @returns The next task or undefined if the queue is empty
   */
  public getNextTask(): Task | undefined {
    return this.queue.shift()
  }

  /**
   * Check if the queue has any tasks
   * @returns True if the queue has tasks, false otherwise
   */
  public hasTasks(): boolean {
    return this.queue.length > 0
  }

  /**
   * Get the number of tasks in the queue
   * @returns The number of tasks
   */
  public size(): number {
    return this.queue.length
  }

  /**
   * Get a task by ID
   * @param id The task ID
   * @returns The task or undefined if not found
   */
  public getTask(id: string): Task | undefined {
    return this.taskMap.get(id)
  }

  /**
   * Remove a task from the queue
   * @param id The task ID
   * @returns True if the task was removed, false otherwise
   */
  public removeTask(id: string): boolean {
    const task = this.taskMap.get(id)
    if (!task) return false

    this.taskMap.delete(id)

    const index = this.queue.findIndex((t) => t.id === id)
    if (index !== -1) {
      this.queue.splice(index, 1)
      return true
    }

    return false
  }

  /**
   * Clear all tasks from the queue
   */
  public clear(): void {
    this.queue = []
    this.taskMap.clear()
  }
}
