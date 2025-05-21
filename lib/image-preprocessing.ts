import sharp from "sharp"

export interface PreprocessingOptions {
  grayscale: boolean
  normalize: boolean
  threshold: boolean
  thresholdValue: number
  adaptiveThreshold: boolean
  sharpen: boolean
  invert: boolean
}

export const defaultOptions: PreprocessingOptions = {
  grayscale: true,
  normalize: true,
  threshold: false,
  thresholdValue: 128,
  adaptiveThreshold: true,
  sharpen: false,
  invert: false,
}

type PreprocessingOption = "default" | "highContrast" | "binarize" | "sharpen" | "despeckle" | "normalize" | "invert"

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
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Preprocess an image to improve OCR results
 * @param imageInput File object, base64 string, or path to image
 * @param options Preprocessing options
 * @returns Base64 encoded image data
 */
// export async function preprocessImage(
//   imageInput: File | string,
//   options: Partial<PreprocessingOptions> = {},
// ): Promise<string> {
//   // Merge default options with provided options
//   const mergedOptions = { ...defaultOptions, ...options }

//   try {
//     // Convert input to base64 if it's a File
//     let base64Data: string

//     if (typeof imageInput === "string") {
//       // Already a base64 string or URL
//       if (imageInput.startsWith("data:")) {
//         base64Data = imageInput
//       } else {
//         // Assume it's a URL, load it
//         try {
//           const response = await fetch(imageInput)
//           const blob = await response.blob()
//           base64Data = await fileToBase64(new File([blob], "image.jpg"))
//         } catch (fetchError) {
//           console.error("Error fetching image URL:", fetchError)
//           // Return original input as fallback
//           return imageInput
//         }
//       }
//     } else {
//       // It's a File object
//       base64Data = await fileToBase64(imageInput)
//     }

//     // If we're on the server, return the base64 data without processing
//     // Server-side image processing would require additional libraries like Sharp
//     if (!isClient()) {
//       console.log("Server-side preprocessing - returning original image")
//       return base64Data
//     }

//     // Client-side image processing with additional error handling
//     try {
//       return await clientSidePreprocessImage(base64Data, mergedOptions)
//     } catch (clientSideError) {
//       console.error("Client-side preprocessing failed:", clientSideError)
//       // If client-side processing fails, return the original base64 data
//       return base64Data
//     }
//   } catch (error) {
//     console.error("Error in preprocessImage:", error)

//     // If it's a File, try to return the original file as base64
//     if (imageInput instanceof File) {
//       try {
//         return await fileToBase64(imageInput)
//       } catch (fallbackError) {
//         console.error("Fallback to original file failed:", fallbackError)
//         throw error // Re-throw if even the fallback fails
//       }
//     }

//     // If it's already a string, return it as is
//     if (typeof imageInput === "string") {
//       return imageInput
//     }

//     throw error
//   }
// }

/**
 * Preprocesses an image to improve OCR accuracy
 * @param imageData The image data as base64 string or Blob
 * @param option The preprocessing option to apply
 * @returns The processed image data
 */
export async function preprocessImage(
  imageData: string | Blob,
  option: PreprocessingOption = "default",
): Promise<Buffer> {
  try {
    // Convert input to buffer
    let buffer: Buffer

    if (typeof imageData === "string") {
      // Handle base64 string
      if (imageData.startsWith("data:")) {
        // Extract base64 data from data URL
        const base64Data = imageData.split(",")[1]
        buffer = Buffer.from(base64Data, "base64")
      } else {
        // Assume it's already base64
        buffer = Buffer.from(imageData, "base64")
      }
    } else {
      // Handle Blob
      const arrayBuffer = await imageData.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
    }

    // Create sharp instance
    let image = sharp(buffer)

    // Apply preprocessing based on option
    switch (option) {
      case "highContrast":
        image = image.gamma(2.2).linear(1.5, -0.3).normalize()
        break

      case "binarize":
        image = image.grayscale().threshold(128)
        break

      case "sharpen":
        image = image.sharpen({
          sigma: 1.5,
          m1: 1.5,
          m2: 0.7,
          x1: 2.5,
          y2: 20,
          y3: 50,
        })
        break

      case "despeckle":
        image = image.median(3).blur(0.5)
        break

      case "normalize":
        image = image.normalize().modulate({
          brightness: 1.1,
          saturation: 0.9,
        })
        break

      case "invert":
        image = image.grayscale().negate()
        break

      case "default":
      default:
        // Default preprocessing
        image = image.grayscale().normalize().sharpen(1)
        break
    }

    // Convert to PNG format for best OCR results
    const processedBuffer = await image.png().toBuffer()
    return processedBuffer
  } catch (error) {
    console.error("Image preprocessing failed:", error)

    // If preprocessing fails, return original image data as buffer
    if (typeof imageData === "string") {
      if (imageData.startsWith("data:")) {
        const base64Data = imageData.split(",")[1]
        return Buffer.from(base64Data, "base64")
      }
      return Buffer.from(imageData, "base64")
    } else {
      const arrayBuffer = await imageData.arrayBuffer()
      return Buffer.from(arrayBuffer)
    }
  }
}

/**
 * Client-side image processing using Canvas API
 */
async function clientSidePreprocessImage(base64Data: string, options: PreprocessingOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    // Set a timeout to prevent hanging if image loading takes too long
    const timeout = setTimeout(() => {
      reject(new Error("Image loading timed out"))
    }, 30000) // 30 second timeout

    img.onload = () => {
      clearTimeout(timeout)

      try {
        if (img.width === 0 || img.height === 0) {
          console.warn("Loaded image has zero dimensions, returning original")
          resolve(base64Data)
          return
        }

        // Limit dimensions to prevent canvas size errors
        const maxDimension = 4000 // Most browsers can handle this size
        let width = img.width
        let height = img.height

        if (width > maxDimension || height > maxDimension) {
          const scale = Math.min(maxDimension / width, maxDimension / height)
          width = Math.floor(width * scale)
          height = Math.floor(height * scale)
          console.warn(`Image resized due to large dimensions: ${img.width}x${img.height} -> ${width}x${height}`)
        }

        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        // Draw original image
        ctx.drawImage(img, 0, 0, width, height)

        // Get image data
        let imageData: ImageData
        try {
          imageData = ctx.getImageData(0, 0, width, height)
        } catch (e) {
          console.error("Failed to get image data:", e)
          // If we can't get image data, return original image
          resolve(base64Data)
          return
        }

        let data = imageData.data

        // Apply preprocessing steps
        try {
          if (options.grayscale) {
            data = applyGrayscale(data)
          }

          if (options.normalize) {
            data = applyNormalize(data)
          }

          if (options.threshold) {
            data = applyThreshold(data, options.thresholdValue)
          }

          if (options.adaptiveThreshold) {
            data = applyAdaptiveThreshold(data, width, height)
          }

          if (options.sharpen) {
            data = applySharpen(data, width, height)
          }

          if (options.invert) {
            data = applyInvert(data)
          }
        } catch (processingError) {
          console.error("Image processing error:", processingError)
          // If processing fails, return original image
          resolve(base64Data)
          return
        }

        // Put processed image data back to canvas
        try {
          ctx.putImageData(imageData, 0, 0)
        } catch (e) {
          console.error("Failed to put image data back to canvas:", e)
          resolve(base64Data)
          return
        }

        // Convert canvas to base64
        try {
          const processedBase64 = canvas.toDataURL("image/png")
          resolve(processedBase64)
        } catch (conversionError) {
          console.error("Failed to convert canvas to base64:", conversionError)
          resolve(base64Data)
        }
      } catch (error) {
        console.error("Error in client-side preprocessing:", error)
        resolve(base64Data) // Resolve with original image as fallback
      }
    }

    img.onerror = (error) => {
      clearTimeout(timeout)
      console.error("Error loading image:", error)
      // Resolve with original image on error
      resolve(base64Data)
    }

    // Set crossOrigin to anonymous to avoid CORS issues
    img.crossOrigin = "anonymous"
    img.src = base64Data
  })
}

// Image processing functions
function applyGrayscale(data: Uint8ClampedArray): Uint8ClampedArray {
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
    data[i] = avg // R
    data[i + 1] = avg // G
    data[i + 2] = avg // B
  }
  return data
}

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

function applyThreshold(data: Uint8ClampedArray, threshold: number): Uint8ClampedArray {
  for (let i = 0; i < data.length; i += 4) {
    const val = data[i] >= threshold ? 255 : 0
    data[i] = val // R
    data[i + 1] = val // G
    data[i + 2] = val // B
  }
  return data
}

function applyAdaptiveThreshold(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  // Simple adaptive threshold - use local neighborhood
  const blockSize = 11 // Must be odd
  const C = 5 // Constant subtracted from mean

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

function applyInvert(data: Uint8ClampedArray): Uint8ClampedArray {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i] // R
    data[i + 1] = 255 - data[i + 1] // G
    data[i + 2] = 255 - data[i + 2] // B
  }
  return data
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
