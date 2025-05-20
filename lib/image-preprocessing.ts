/**
 * Image preprocessing utilities to enhance OCR accuracy
 * These functions apply various image processing techniques to make text more readable
 */

/**
 * Convert a base64 image to an HTMLImageElement
 */
export function base64ToImage(base64: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new HTMLImageElement()
    img.onload = () => resolve(img)
    img.onerror = (e) => reject(e)
    img.src = base64
    img.crossOrigin = "anonymous" // Avoid CORS issues
  })
}

/**
 * Convert a File to base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Interface for preprocessing options
 */
export interface PreprocessingOptions {
  grayscale: boolean
  normalize: boolean
  threshold: boolean
  thresholdValue: number
  sharpen: boolean
  resize: boolean
  targetWidth?: number
  targetHeight?: number
  adaptiveThreshold: boolean
  despeckle: boolean
  invert: boolean
}

/**
 * Default preprocessing options optimized for chat screenshots
 */
export const defaultOptions: PreprocessingOptions = {
  grayscale: true,
  normalize: true,
  threshold: false, // Simple threshold can be too aggressive
  thresholdValue: 128,
  sharpen: true,
  resize: true,
  targetWidth: 1200, // Resize to reasonable dimensions if smaller
  adaptiveThreshold: true, // Better than simple threshold for varying backgrounds
  despeckle: true, // Remove noise
  invert: false, // Only use for dark mode screenshots
}

/**
 * Apply grayscale to image data
 */
function applyGrayscale(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    // Convert to grayscale using luminance formula
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    data[i] = gray // Red
    data[i + 1] = gray // Green
    data[i + 2] = gray // Blue
    // Alpha remains unchanged
  }

  ctx.putImageData(imageData, 0, 0)
}

/**
 * Normalize contrast in the image
 */
function normalizeContrast(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  // Find min and max values
  let min = 255
  let max = 0

  for (let i = 0; i < data.length; i += 4) {
    const val = data[i] // We assume the image is already grayscale
    if (val < min) min = val
    if (val > max) max = val
  }

  // Apply contrast stretching
  const range = max - min
  if (range > 0) {
    for (let i = 0; i < data.length; i += 4) {
      for (let j = 0; j < 3; j++) {
        data[i + j] = ((data[i + j] - min) / range) * 255
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

/**
 * Apply simple thresholding
 */
function applyThreshold(ctx: CanvasRenderingContext2D, width: number, height: number, threshold: number): void {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const val = data[i] // We assume the image is already grayscale
    const newVal = val > threshold ? 255 : 0
    data[i] = newVal // Red
    data[i + 1] = newVal // Green
    data[i + 2] = newVal // Blue
  }

  ctx.putImageData(imageData, 0, 0)
}

/**
 * Apply adaptive thresholding - better for varying backgrounds
 */
function applyAdaptiveThreshold(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  const blockSize = 11 // Size of the local neighborhood for adaptive threshold
  const C = 2 // Constant subtracted from the mean

  // Create a copy of the image data for calculating local means
  const tempData = new Uint8ClampedArray(data)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4

      // Calculate local mean
      let sum = 0
      let count = 0

      for (let dy = -blockSize; dy <= blockSize; dy++) {
        for (let dx = -blockSize; dx <= blockSize; dx++) {
          const nx = x + dx
          const ny = y + dy

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nidx = (ny * width + nx) * 4
            sum += tempData[nidx]
            count++
          }
        }
      }

      const mean = sum / count
      const threshold = mean - C

      // Apply threshold
      const val = data[idx]
      const newVal = val > threshold ? 255 : 0

      data[idx] = newVal // Red
      data[idx + 1] = newVal // Green
      data[idx + 2] = newVal // Blue
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

/**
 * Apply sharpening filter
 */
function applySharpen(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  const tempData = new Uint8ClampedArray(data)

  // Sharpening kernel
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0]

  const kernelSize = 3
  const kernelHalfSize = Math.floor(kernelSize / 2)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4

      let r = 0,
        g = 0,
        b = 0

      // Apply convolution
      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const nx = x + kx - kernelHalfSize
          const ny = y + ky - kernelHalfSize

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nidx = (ny * width + nx) * 4
            const kernelIdx = ky * kernelSize + kx

            r += tempData[nidx] * kernel[kernelIdx]
            g += tempData[nidx + 1] * kernel[kernelIdx]
            b += tempData[nidx + 2] * kernel[kernelIdx]
          }
        }
      }

      // Clamp values
      data[idx] = Math.max(0, Math.min(255, r))
      data[idx + 1] = Math.max(0, Math.min(255, g))
      data[idx + 2] = Math.max(0, Math.min(255, b))
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

/**
 * Apply despeckle filter to remove noise
 */
function applyDespeckle(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  const tempData = new Uint8ClampedArray(data)

  // Apply median filter to remove noise
  const filterSize = 3
  const filterHalfSize = Math.floor(filterSize / 2)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4

      // For each color channel
      for (let c = 0; c < 3; c++) {
        const values = []

        // Gather values in the neighborhood
        for (let dy = -filterHalfSize; dy <= filterHalfSize; dy++) {
          for (let dx = -filterHalfSize; dx <= filterHalfSize; dx++) {
            const nx = x + dx
            const ny = y + dy

            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nidx = (ny * width + nx) * 4 + c
              values.push(tempData[nidx])
            }
          }
        }

        // Sort values and take the median
        values.sort((a, b) => a - b)
        data[idx + c] = values[Math.floor(values.length / 2)]
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

/**
 * Invert image colors (useful for dark mode screenshots)
 */
function invertColors(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i] // Red
    data[i + 1] = 255 - data[i + 1] // Green
    data[i + 2] = 255 - data[i + 2] // Blue
    // Alpha remains unchanged
  }

  ctx.putImageData(imageData, 0, 0)
}

/**
 * Detect if an image is likely in dark mode
 */
export function detectDarkMode(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  let totalBrightness = 0

  for (let i = 0; i < data.length; i += 4) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3
    totalBrightness += brightness
  }

  const avgBrightness = totalBrightness / (width * height)
  return avgBrightness < 128 // If average brightness is less than 128, likely dark mode
}

/**
 * Auto-detect best preprocessing options based on image characteristics
 */
export function detectBestOptions(ctx: CanvasRenderingContext2D, width: number, height: number): PreprocessingOptions {
  const options = { ...defaultOptions }

  // Check if image is in dark mode
  const isDarkMode = detectDarkMode(ctx, width, height)
  options.invert = isDarkMode

  // Analyze image size
  if (width < 800 || height < 800) {
    options.resize = true
    options.targetWidth = Math.max(width * 1.5, 1200)
    options.targetHeight = Math.max(height * 1.5, 1200)
  } else {
    options.resize = false
  }

  return options
}

/**
 * Main preprocessing function that applies all selected techniques
 */
export async function preprocessImage(
  imageData: string | File,
  customOptions?: Partial<PreprocessingOptions>,
): Promise<string> {
  // Convert File to base64 if needed
  let base64Data: string
  if (typeof imageData === "string") {
    base64Data = imageData
  } else {
    base64Data = await fileToBase64(imageData)
  }

  // Load image
  const img = await base64ToImage(base64Data)

  // Create canvas
  const canvas = document.createElement("canvas")
  let width = img.width
  let height = img.height

  // Apply options
  const options = { ...defaultOptions, ...customOptions }

  // Resize if needed
  if (options.resize && options.targetWidth) {
    const scaleFactor = options.targetWidth / width
    width = options.targetWidth
    height = Math.floor(height * scaleFactor)
  }

  canvas.width = width
  canvas.height = height

  // Get context and draw image
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    throw new Error("Could not get canvas context")
  }

  // Draw original image
  ctx.drawImage(img, 0, 0, width, height)

  // Auto-detect options if not explicitly provided
  if (!customOptions) {
    const detectedOptions = detectBestOptions(ctx, width, height)
    Object.assign(options, detectedOptions)
  }

  // Apply preprocessing steps in optimal order

  // 1. Invert colors if needed (for dark mode)
  if (options.invert) {
    invertColors(ctx, width, height)
  }

  // 2. Convert to grayscale
  if (options.grayscale) {
    applyGrayscale(ctx, width, height)
  }

  // 3. Normalize contrast
  if (options.normalize) {
    normalizeContrast(ctx, width, height)
  }

  // 4. Apply sharpening
  if (options.sharpen) {
    applySharpen(ctx, width, height)
  }

  // 5. Remove noise
  if (options.despeckle) {
    applyDespeckle(ctx, width, height)
  }

  // 6. Apply thresholding (last because it reduces to binary)
  if (options.threshold) {
    applyThreshold(ctx, width, height, options.thresholdValue)
  } else if (options.adaptiveThreshold) {
    applyAdaptiveThreshold(ctx, width, height)
  }

  // Return processed image as base64
  return canvas.toDataURL("image/png")
}

/**
 * Create a debug visualization showing original vs processed image
 */
export async function createDebugVisualization(
  originalImage: string | File,
  options?: Partial<PreprocessingOptions>,
): Promise<string> {
  // Convert File to base64 if needed
  let originalBase64: string
  if (typeof originalImage === "string") {
    originalBase64 = originalImage
  } else {
    originalBase64 = await fileToBase64(originalImage)
  }

  // Process the image
  const processedBase64 = await preprocessImage(originalBase64, options)

  // Load both images
  const [imgOriginal, imgProcessed] = await Promise.all([base64ToImage(originalBase64), base64ToImage(processedBase64)])

  // Create canvas for side-by-side comparison
  const canvas = document.createElement("canvas")
  const maxWidth = Math.max(imgOriginal.width, imgProcessed.width)
  const totalHeight = Math.max(imgOriginal.height, imgProcessed.height)

  canvas.width = maxWidth * 2 + 20 // Add some padding between images
  canvas.height = totalHeight

  const ctx = canvas.getContext("2d")
  if (!ctx) {
    throw new Error("Could not get canvas context")
  }

  // Draw white background
  ctx.fillStyle = "white"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw original image on the left
  ctx.drawImage(imgOriginal, 0, 0)

  // Draw processed image on the right
  ctx.drawImage(imgProcessed, maxWidth + 20, 0)

  // Add labels
  ctx.fillStyle = "black"
  ctx.font = "16px Arial"
  ctx.fillText("Original", 10, 20)
  ctx.fillText("Processed", maxWidth + 30, 20)

  // Return comparison as base64
  return canvas.toDataURL("image/png")
}
