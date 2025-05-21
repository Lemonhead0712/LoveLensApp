/**
 * Performance Monitoring Utility
 *
 * This module provides functions for monitoring and logging performance metrics.
 */

// Interface for performance metrics
export interface PerformanceMetrics {
  operation: string
  startTime: number
  endTime: number
  duration: number
  success: boolean
  error?: string
  metadata?: Record<string, any>
}

// Store for performance metrics
const performanceMetrics: PerformanceMetrics[] = []

/**
 * Starts timing an operation
 * @param operation The name of the operation to time
 * @returns A unique ID for the operation
 */
export function startTiming(operation: string): number {
  const startTime = performance.now()
  const id = performanceMetrics.length

  performanceMetrics.push({
    operation,
    startTime,
    endTime: 0,
    duration: 0,
    success: false,
  })

  return id
}

/**
 * Ends timing an operation and records metrics
 * @param id The ID of the operation
 * @param success Whether the operation was successful
 * @param error Optional error message if the operation failed
 * @param metadata Optional additional data about the operation
 * @returns The duration of the operation in milliseconds
 */
export function endTiming(id: number, success = true, error?: string, metadata?: Record<string, any>): number {
  const endTime = performance.now()

  if (id >= 0 && id < performanceMetrics.length) {
    const metrics = performanceMetrics[id]
    metrics.endTime = endTime
    metrics.duration = endTime - metrics.startTime
    metrics.success = success

    if (error) {
      metrics.error = error
    }

    if (metadata) {
      metrics.metadata = metadata
    }

    // Log performance for debugging
    console.log(`Performance: ${metrics.operation} took ${metrics.duration.toFixed(2)}ms`)

    return metrics.duration
  }

  return 0
}

/**
 * Gets all recorded performance metrics
 * @returns Array of performance metrics
 */
export function getPerformanceMetrics(): PerformanceMetrics[] {
  return [...performanceMetrics]
}

/**
 * Clears all recorded performance metrics
 */
export function clearPerformanceMetrics(): void {
  performanceMetrics.length = 0
}

/**
 * Measures the execution time of a function
 * @param fn The function to measure
 * @param operationName The name of the operation
 * @returns A promise that resolves to the result of the function
 */
export async function measureExecutionTime<T>(fn: () => Promise<T>, operationName: string): Promise<T> {
  const id = startTiming(operationName)

  try {
    const result = await fn()
    endTiming(id, true, undefined, { result: typeof result })
    return result
  } catch (error) {
    endTiming(id, false, error instanceof Error ? error.message : "Unknown error")
    throw error
  }
}

/**
 * Creates a performance-monitored version of a function
 * @param fn The function to monitor
 * @param operationName The name of the operation
 * @returns A new function that monitors performance
 */
export function withPerformanceMonitoring<T extends (...args: any[]) => Promise<any>>(fn: T, operationName: string): T {
  return (async (...args: Parameters<T>) => {
    return measureExecutionTime(() => fn(...args), operationName)
  }) as T
}
