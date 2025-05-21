/**
 * Image Preprocessing Worker
 *
 * This worker handles image preprocessing operations off the main thread.
 * It applies various image enhancement techniques to improve OCR accuracy.
 */

// Define preprocessing strategies
type PreprocessingStrategy =
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

// Define the structure of incoming messages
interface WorkerMessage {
  taskId: string
  type: string
  data: {
    imageData: string
    options?: {
      strategy?: PreprocessingStrategy
      customParams?: Record<string, any>
      [key: string]: any
    }
  }
}

/**
 * Applies grayscale conversion to image data
 */
function applyGrayscale(data: Uint8ClampedArray): Uint8ClampedArray {
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
    data[i] = avg // R
    data[i + 1] = avg // G
    data[i + 2] = avg // B
  }
  return data
}

/**
 * Normalizes image contrast
 */
function applyNormalize(data: Uint8ClampedArray): Uint8ClampedArray {
  // Find min and max values
  let min = 255
  let max = 0

  for (let i = 0; i < data.length; i += 4) {
    const val = data[i] // Since it's grayscale, R=G=B
    if (val < min) min = val
    if (val > max) max = val
  }

  // Normalize
  const range = max - min
  if (range > 0) {
    for (let i = 0; i < data.length; i += 4) {
      const normalized = ((data[i] - min) / range) * 255
      data[i] = normalized // R
      data[i + 1] = normalized // G
      data[i + 2] = normalized // B
    }
  }

  return data
}

/**
 * Applies threshold to create binary image
 */
function applyThreshold(data: Uint8ClampedArray, threshold: number): Uint8ClampedArray {
  for (let i = 0; i < data.length; i += 4) {
    const val = data[i] >= threshold ? 255 : 0
    data[i] = val // R
    data[i + 1] = val // G
    data[i + 2] = val // B
  }
  return data
}

/**
 * Applies adaptive threshold using local neighborhood
 */
function applyAdaptiveThreshold(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  blockSize = 11,
  C = 5,
): Uint8ClampedArray {
  // Create a copy of the data for the mean calculation
  const tempData = new Uint8ClampedArray(data.length)
  for (let i = 0; i < data.length; i++) {
    tempData[i] = data[i]
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4

      // Calculate local mean
      let sum = 0
      let count = 0
      const halfBlock = Math.floor(blockSize / 2)

      for (let j = -halfBlock; j <= halfBlock; j++) {
        for (let i = -halfBlock; i <= halfBlock; i++) {
          const ny = y + j
          const nx = x + i

          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            sum += tempData[(ny * width + nx) * 4]
            count++
          }
        }
      }

      const mean = sum / count
      const threshold = mean - C

      // Apply threshold
      const val = data[idx] >= threshold ? 255 : 0
      data[idx] = val // R
      data[idx + 1] = val // G
      data[idx + 2] = val // B
    }
  }

  return data
}

/**
 * Applies sharpening using convolution
 */
function applySharpen(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  // Sharpen kernel
  const kernel = [-1, -1, -1, -1, 9, -1, -1, -1, -1]
  const tempData = new Uint8ClampedArray(data.length)

  // Apply convolution
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4

      let r = 0,
        g = 0,
        b = 0

      // Apply kernel
      for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {
          const kernelIdx = (j + 1) * 3 + (i + 1)
          const pixelIdx = ((y + j) * width + (x + i)) * 4
          r += data[pixelIdx] * kernel[kernelIdx]
          g += data[pixelIdx + 1] * kernel[kernelIdx]
          b += data[pixelIdx + 2] * kernel[kernelIdx]
        }
      }

      // Clamp values
      tempData[idx] = Math.min(255, Math.max(0, r))
      tempData[idx + 1] = Math.min(255, Math.max(0, g))
      tempData[idx + 2] = Math.min(255, Math.max(0, b))
      tempData[idx + 3] = data[idx + 3] // Keep alpha
    }
  }

  // Copy back to original data
  for (let i = 0; i < data.length; i++) {
    data[i] = tempData[i]
  }

  return data
}

/**
 * Inverts image colors
 */
function applyInvert(data: Uint8ClampedArray): Uint8ClampedArray {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i] // R
    data[i + 1] = 255 - data[i + 1] // G
    data[i + 2] = 255 - data[i + 2] // B
  }
  return data
}

/**
 * Applies median filter for noise reduction
 */
function applyMedianFilter(data: Uint8ClampedArray, width: number, height: number, size = 3): Uint8ClampedArray {
  const tempData = new Uint8ClampedArray(data.length)
  const halfSize = Math.floor(size / 2)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4

      // For each channel (R, G, B)
      for (let c = 0; c < 3; c++) {
        const values = []

        // Gather values from neighborhood
        for (let j = -halfSize; j <= halfSize; j++) {
          for (let i = -halfSize; i <= halfSize; i++) {
            const ny = Math.min(Math.max(y + j, 0), height - 1)
            const nx = Math.min(Math.max(x + i, 0), width - 1)
            values.push(data[(ny * width + nx) * 4 + c])
          }
        }

        // Sort and find median
        values.sort((a, b) => a - b)
        tempData[idx + c] = values[Math.floor(values.length / 2)]
      }

      // Keep alpha
      tempData[idx + 3] = data[idx + 3]
    }
  }

  // Copy back to original data
  for (let i = 0; i < data.length; i++) {
    data[i] = tempData[i]
  }

  return data
}

/**
 * Applies contrast adjustment
 */
function applyContrast(data: Uint8ClampedArray, factor: number): Uint8ClampedArray {
  const factor1 = factor
  const factor2 = (259 * (factor1 + 255)) / (255 * (259 - factor1))

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, factor2 * (data[i] - 128) + 128))
    data[i + 1] = Math.min(255, Math.max(0, factor2 * (data[i + 1] - 128) + 128))
    data[i + 2] = Math.min(255, Math.max(0, factor2 * (data[i + 2] - 128) + 128))
  }

  return data
}

/**
 * Applies brightness adjustment
 */
function applyBrightness(data: Uint8ClampedArray, adjustment: number): Uint8ClampedArray {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, data[i] + adjustment))
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + adjustment))
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + adjustment))
  }

  return data
}

/**
 * Detects if an image is likely in dark mode
 */
function detectDarkMode(data: Uint8ClampedArray): boolean {
  let totalBrightness = 0
  const pixelCount = data.length / 4

  for (let i = 0; i < data.length; i += 4) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3
    totalBrightness += brightness
  }

  const avgBrightness = totalBrightness / pixelCount
  return avgBrightness < 128 // If average brightness is less than 128, likely dark mode
}

/**
 * Processes an image using the specified strategy
 */
async function processImage(imageData: string, options: any = {}): Promise<string> {
  try {
    // Report initial progress
    self.postMessage({
      type: "progress",
      progress: 10,
      taskId: options.taskId,
    })

    // Convert base64 to image data
    const strategy = options.strategy || "default"
    const img = await createImageBitmap(await fetchImageData(imageData))

    // Report progress
    self.postMessage({
      type: "progress",
      progress: 30,
      taskId: options.taskId,
    })

    // Create canvas and get context
    const canvas = new OffscreenCanvas(img.width, img.height)
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("Could not get canvas context")
    }

    // Draw original image
    ctx.drawImage(img, 0, 0)

    // Get image data
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imgData.data

    // Detect if image is in dark mode
    const isDarkMode = detectDarkMode(data)

    // Report progress
    self.postMessage({
      type: "progress",
      progress: 50,
      taskId: options.taskId,
    })

    // Apply preprocessing based on strategy
    switch (strategy) {
      case "highContrast":
        applyGrayscale(data)
        applyContrast(data, 50)
        applyNormalize(data)
        break

      case "binarize":
        applyGrayscale(data)
        applyThreshold(data, options.customParams?.threshold || 128)
        break

      case "sharpen":
        applyGrayscale(data)
        applySharpen(data, canvas.width, canvas.height)
        break

      case "despeckle":
        applyGrayscale(data)
        applyMedianFilter(data, canvas.width, canvas.height, 3)
        break

      case "normalize":
        applyGrayscale(data)
        applyNormalize(data)
        break

      case "invert":
        applyGrayscale(data)
        applyInvert(data)
        break

      case "textOptimized":
        // Optimized for text extraction
        applyGrayscale(data)
        applyContrast(data, 30)
        applyAdaptiveThreshold(data, canvas.width, canvas.height, 15, 5)
        break

      case "chatBubbles":
        // Optimized for chat bubbles
        applyGrayscale(data)
        applyContrast(data, 20)
        applyNormalize(data)
        break

      case "darkMode":
        // Force dark mode optimization
        applyGrayscale(data)
        if (!isDarkMode) {
          applyInvert(data)
        }
        applyNormalize(data)
        break

      case "lightMode":
        // Force light mode optimization
        applyGrayscale(data)
        if (isDarkMode) {
          applyInvert(data)
        }
        applyNormalize(data)
        break

      case "default":
      default:
        // Auto-detect and apply appropriate preprocessing
        applyGrayscale(data)

        if (isDarkMode) {
          // For dark mode screenshots
          applyInvert(data)
        }

        applyNormalize(data)
        applyContrast(data, 20)
        break
    }

    // Put processed image data back to canvas
    ctx.putImageData(imgData, 0, 0)

    // Report progress
    self.postMessage({
      type: "progress",
      progress: 80,
      taskId: options.taskId,
    })

    // Convert canvas to blob
    const blob = await canvas.convertToBlob({ type: "image/png" })

    // Convert blob to base64
    const base64 = await blobToBase64(blob)

    // Report progress
    self.postMessage({
      type: "progress",
      progress: 100,
      taskId: options.taskId,
    })

    return base64
  } catch (error) {
    console.error("Image preprocessing error:", error)
    throw error
  }
}

/**
 * Converts a blob to base64
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Fetches image data from a base64 string or URL
 */
async function fetchImageData(imageData: string): Promise<Blob> {
  if (imageData.startsWith("data:")) {
    // It's already a data URL
    const response = await fetch(imageData)
    return await response.blob()
  } else {
    // Assume it's a URL
    const response = await fetch(imageData)
    return await response.blob()
  }
}

// Set up message handler
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { taskId, type, data } = event.data

  try {
    if (type === "PROCESS_IMAGE") {
      const startTime = Date.now()
      const result = await processImage(data.imageData, {
        ...data.options,
        taskId,
        startTime,
      })

      self.postMessage({
        type: "complete",
        taskId,
        data: {
          processedImageData: result,
          originalImageData: data.imageData,
          strategy: data.options?.strategy || "default",
          processingTime: Date.now() - startTime,
          isDarkMode: detectDarkMode(new Uint8ClampedArray(0)), // This is a placeholder, actual detection happens during processing
        },
      })
    } else {
      throw new Error(`Unknown task type: ${type}`)
    }
  } catch (error) {
    console.error("Worker error:", error)

    self.postMessage({
      type: "error",
      taskId,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

// Handle errors
self.onerror = (error) => {
  console.error("Worker global error:", error)
}
