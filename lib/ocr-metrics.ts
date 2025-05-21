/**
 * OCR Performance Metrics Collection and Analysis
 *
 * This module provides utilities for collecting, analyzing, and visualizing
 * performance metrics for the OCR processing pipeline.
 */

export interface TimingMetric {
  name: string
  startTime: number
  endTime: number
  duration: number
}

export interface AccuracyMetric {
  name: string
  confidence: number
  wordCount: number
  characterCount: number
}

export interface ResourceMetric {
  name: string
  memoryUsage?: number
  cpuUsage?: number
}

export interface OCRMetrics {
  id: string
  timestamp: string
  imageInfo: {
    filename: string
    width: number
    height: number
    fileSize: number
    format: string
  }
  timings: TimingMetric[]
  accuracy: AccuracyMetric[]
  resources: ResourceMetric[]
  preprocessingOption: string
  overallConfidence: number
  extractedTextLength: number
  extractedWordCount: number
  extractedMessageCount: number
  recognizedCharactersPerSecond: number
  processingTimePerPixel: number
  successRate: number
}

// Store for historical metrics
const metricsStore: OCRMetrics[] = []

/**
 * Create a new metrics collection session
 */
export function createMetricsSession(imageInfo: OCRMetrics["imageInfo"]): OCRMetrics {
  return {
    id: `metrics_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    imageInfo,
    timings: [],
    accuracy: [],
    resources: [],
    preprocessingOption: "default",
    overallConfidence: 0,
    extractedTextLength: 0,
    extractedWordCount: 0,
    extractedMessageCount: 0,
    recognizedCharactersPerSecond: 0,
    processingTimePerPixel: 0,
    successRate: 0,
  }
}

/**
 * Start timing a specific operation
 */
export function startTiming(name: string): { name: string; startTime: number } {
  return {
    name,
    startTime: performance.now(),
  }
}

/**
 * End timing a specific operation and return the timing metric
 */
export function endTiming(timing: { name: string; startTime: number }): TimingMetric {
  const endTime = performance.now()
  const duration = endTime - timing.startTime

  return {
    name: timing.name,
    startTime: timing.startTime,
    endTime,
    duration,
  }
}

/**
 * Record an accuracy metric
 */
export function recordAccuracy(
  name: string,
  confidence: number,
  wordCount: number,
  characterCount: number,
): AccuracyMetric {
  return {
    name,
    confidence,
    wordCount,
    characterCount,
  }
}

/**
 * Record a resource usage metric
 */
export function recordResourceUsage(name: string): ResourceMetric {
  // In a browser environment, we can't get detailed memory/CPU usage
  // But we can estimate memory usage from performance.memory if available
  const memory = (performance as any).memory

  return {
    name,
    memoryUsage: memory ? memory.usedJSHeapSize : undefined,
  }
}

/**
 * Calculate derived metrics based on collected data
 */
export function calculateDerivedMetrics(metrics: OCRMetrics): OCRMetrics {
  // Calculate total processing time
  const totalProcessingTime = metrics.timings.reduce((total, timing) => {
    return timing.name.includes("total") ? timing.duration : total
  }, 0)

  // Calculate characters per second
  const recognizedCharactersPerSecond =
    metrics.extractedTextLength > 0 ? metrics.extractedTextLength / (totalProcessingTime / 1000) : 0

  // Calculate processing time per pixel
  const totalPixels = metrics.imageInfo.width * metrics.imageInfo.height
  const processingTimePerPixel = totalPixels > 0 ? totalProcessingTime / totalPixels : 0

  // Calculate success rate based on confidence
  const successRate = metrics.overallConfidence / 100

  return {
    ...metrics,
    recognizedCharactersPerSecond,
    processingTimePerPixel,
    successRate,
  }
}

/**
 * Save metrics to the historical store
 */
export function saveMetrics(metrics: OCRMetrics): void {
  // Calculate derived metrics
  const finalMetrics = calculateDerivedMetrics(metrics)

  // Add to store
  metricsStore.push(finalMetrics)

  // Limit store size to prevent memory issues
  if (metricsStore.length > 50) {
    metricsStore.shift()
  }

  // Save to localStorage for persistence
  try {
    const existingMetrics = JSON.parse(localStorage.getItem("ocrMetrics") || "[]")
    const updatedMetrics = [...existingMetrics, finalMetrics].slice(-50)
    localStorage.setItem("ocrMetrics", JSON.stringify(updatedMetrics))
  } catch (error) {
    console.error("Failed to save OCR metrics to localStorage:", error)
  }
}

/**
 * Get all historical metrics
 */
export function getHistoricalMetrics(): OCRMetrics[] {
  // Try to load from localStorage first
  try {
    const storedMetrics = localStorage.getItem("ocrMetrics")
    if (storedMetrics) {
      return JSON.parse(storedMetrics)
    }
  } catch (error) {
    console.error("Failed to load OCR metrics from localStorage:", error)
  }

  return [...metricsStore]
}

/**
 * Get metrics for a specific image
 */
export function getMetricsForImage(filename: string): OCRMetrics | undefined {
  return metricsStore.find((m) => m.imageInfo.filename === filename)
}

/**
 * Clear all metrics
 */
export function clearMetrics(): void {
  metricsStore.length = 0
  try {
    localStorage.removeItem("ocrMetrics")
  } catch (error) {
    console.error("Failed to clear OCR metrics from localStorage:", error)
  }
}

/**
 * Compare metrics between different preprocessing options
 */
export function comparePreprocessingOptions(): Record<
  string,
  {
    averageConfidence: number
    averageProcessingTime: number
    successRate: number
  }
> {
  const optionMetrics: Record<string, OCRMetrics[]> = {}

  // Group metrics by preprocessing option
  metricsStore.forEach((metric) => {
    if (!optionMetrics[metric.preprocessingOption]) {
      optionMetrics[metric.preprocessingOption] = []
    }
    optionMetrics[metric.preprocessingOption].push(metric)
  })

  // Calculate averages for each option
  const result: Record<
    string,
    {
      averageConfidence: number
      averageProcessingTime: number
      successRate: number
    }
  > = {}

  Object.entries(optionMetrics).forEach(([option, metrics]) => {
    const totalConfidence = metrics.reduce((sum, m) => sum + m.overallConfidence, 0)
    const totalProcessingTime = metrics.reduce((sum, m) => {
      const processingTime = m.timings.find((t) => t.name === "total")?.duration || 0
      return sum + processingTime
    }, 0)
    const successCount = metrics.filter((m) => m.successRate >= 0.7).length

    result[option] = {
      averageConfidence: totalConfidence / metrics.length,
      averageProcessingTime: totalProcessingTime / metrics.length,
      successRate: successCount / metrics.length,
    }
  })

  return result
}
