/**
 * Image processing utility functions for enhancing screenshots
 * before text extraction
 */

// Convert an image file to a canvas element for processing
export async function fileToCanvas(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Could not get canvas context"))
        return
      }
      ctx.drawImage(img, 0, 0)
      resolve(canvas)
    }
    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = URL.createObjectURL(file)
  })
}

// Convert a canvas back to a File object
export async function canvasToFile(
  canvas: HTMLCanvasElement,
  filename: string,
  type = "image/jpeg",
  quality = 0.9,
): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas to Blob conversion failed"))
          return
        }
        const file = new File([blob], filename, { type })
        resolve(file)
      },
      type,
      quality,
    )
  })
}

// Enhance contrast to make text more readable
export function enhanceContrast(canvas: HTMLCanvasElement, level = 1.5): HTMLCanvasElement {
  const ctx = canvas.getContext("2d")
  if (!ctx) return canvas

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  // Calculate average luminance
  let totalLuminance = 0
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    // Luminance formula: 0.299*R + 0.587*G + 0.114*B
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b
    totalLuminance += luminance
  }
  const avgLuminance = totalLuminance / (data.length / 4)

  // Apply contrast enhancement
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // Adjust contrast based on luminance
    data[i] = Math.min(255, Math.max(0, avgLuminance + (r - avgLuminance) * level))
    data[i + 1] = Math.min(255, Math.max(0, avgLuminance + (g - avgLuminance) * level))
    data[i + 2] = Math.min(255, Math.max(0, avgLuminance + (b - avgLuminance) * level))
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas
}

// Apply sharpening to make text edges more defined
export function sharpenImage(canvas: HTMLCanvasElement, amount = 0.5): HTMLCanvasElement {
  const ctx = canvas.getContext("2d")
  if (!ctx) return canvas

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const width = canvas.width
  const height = canvas.height

  // Create a copy of the original data
  const original = new Uint8ClampedArray(data)

  // Apply convolution with a sharpening kernel
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4

      // For each color channel
      for (let c = 0; c < 3; c++) {
        const i = idx + c

        // Apply sharpening kernel
        const val =
          5 * original[i] -
          original[i - width * 4] - // pixel above
          original[i - 4] - // pixel to the left
          original[i + 4] - // pixel to the right
          original[i + width * 4] // pixel below

        // Mix with original based on amount
        data[i] = Math.min(255, Math.max(0, original[i] * (1 - amount) + val * amount))
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas
}

// Reduce noise to improve text clarity
export function reduceNoise(canvas: HTMLCanvasElement, level = 1): HTMLCanvasElement {
  const ctx = canvas.getContext("2d")
  if (!ctx) return canvas

  // Simple box blur for noise reduction
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const width = canvas.width
  const height = canvas.height

  // Create a copy of the original data
  const original = new Uint8ClampedArray(data)

  // Apply box blur
  const radius = Math.min(2, Math.max(1, Math.floor(level)))

  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      const idx = (y * width + x) * 4

      // For each color channel
      for (let c = 0; c < 3; c++) {
        let sum = 0
        let count = 0

        // Sum the values in the box
        for (let ky = -radius; ky <= radius; ky++) {
          for (let kx = -radius; kx <= radius; kx++) {
            const i = ((y + ky) * width + (x + kx)) * 4 + c
            sum += original[i]
            count++
          }
        }

        // Set the average value
        data[idx + c] = sum / count
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas
}

// Update the binarizeImage function to use adaptive thresholding
export function binarizeImage(canvas: HTMLCanvasElement, threshold = 128): HTMLCanvasElement {
  const ctx = canvas.getContext("2d")
  if (!ctx) return canvas

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const width = canvas.width
  const height = canvas.height

  // Determine threshold automatically if not specified
  let autoThreshold = threshold
  if (threshold === -1) {
    // Otsu's method for automatic thresholding
    const histogram = new Array(256).fill(0)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
      histogram[gray]++
    }

    // Calculate total pixels
    const total = data.length / 4

    let sum = 0
    for (let i = 0; i < 256; i++) {
      sum += i * histogram[i]
    }

    let sumB = 0
    let wB = 0
    let wF = 0
    let maxVariance = 0

    for (let t = 0; t < 256; t++) {
      wB += histogram[t]
      if (wB === 0) continue

      wF = total - wB
      if (wF === 0) break

      sumB += t * histogram[t]
      const mB = sumB / wB
      const mF = (sum - sumB) / wF

      const variance = wB * wF * (mB - mF) * (mB - mF)

      if (variance > maxVariance) {
        maxVariance = variance
        autoThreshold = t
      }
    }
  }

  // Apply adaptive thresholding for better results with varying lighting
  const blockSize = Math.max(3, Math.floor(Math.min(width, height) / 30)) * 2 + 1 // Must be odd
  const C = 5 // Constant subtracted from mean

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4

      // Calculate local mean
      let sum = 0
      let count = 0

      const halfBlock = Math.floor(blockSize / 2)
      for (let ky = -halfBlock; ky <= halfBlock; ky++) {
        const ny = y + ky
        if (ny < 0 || ny >= height) continue

        for (let kx = -halfBlock; kx <= halfBlock; kx++) {
          const nx = x + kx
          if (nx < 0 || nx >= width) continue

          const nidx = (ny * width + nx) * 4
          const r = data[nidx]
          const g = data[nidx + 1]
          const b = data[nidx + 2]
          const gray = 0.299 * r + 0.587 * g + 0.114 * b

          sum += gray
          count++
        }
      }

      const mean = count > 0 ? sum / count : 0
      const localThreshold = mean - C

      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]
      const gray = 0.299 * r + 0.587 * g + 0.114 * b

      const value = gray > localThreshold ? 255 : 0

      data[idx] = value
      data[idx + 1] = value
      data[idx + 2] = value
    }
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas
}

// Detect and correct perspective distortion
export function correctPerspective(canvas: HTMLCanvasElement): HTMLCanvasElement {
  // This is a simplified version - a full implementation would require
  // corner detection and perspective transformation which is complex
  // For now, we'll just return the original canvas
  return canvas

  // A full implementation would:
  // 1. Detect text lines or message bubbles
  // 2. Find the corners of the text area
  // 3. Calculate the perspective transform
  // 4. Apply the transform to straighten the image
}

// Auto-crop to focus on the conversation area
export function autoCropConversation(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext("2d")
  if (!ctx) return canvas

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const width = canvas.width
  const height = canvas.height

  // Find the bounding box of non-white pixels
  let minX = width
  let minY = height
  let maxX = 0
  let maxY = 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]

      // If pixel is not white/very light (threshold can be adjusted)
      if (r < 240 || g < 240 || b < 240) {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }

  // Add padding
  const padding = 10
  minX = Math.max(0, minX - padding)
  minY = Math.max(0, minY - padding)
  maxX = Math.min(width - 1, maxX + padding)
  maxY = Math.min(height - 1, maxY + padding)

  // Check if we found a valid bounding box
  if (minX < maxX && minY < maxY) {
    const newWidth = maxX - minX + 1
    const newHeight = maxY - minY + 1

    // Create a new canvas with the cropped dimensions
    const newCanvas = document.createElement("canvas")
    newCanvas.width = newWidth
    newCanvas.height = newHeight
    const newCtx = newCanvas.getContext("2d")

    if (newCtx) {
      // Draw the cropped portion
      newCtx.drawImage(canvas, minX, minY, newWidth, newHeight, 0, 0, newWidth, newHeight)
      return newCanvas
    }
  }

  // If cropping failed, return the original
  return canvas
}

// Add a new function for deskewing text
export function deskewImage(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext("2d")
  if (!ctx) return canvas

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const width = canvas.width
  const height = canvas.height

  // Detect skew angle using Hough transform (simplified implementation)
  // This is a basic implementation - a production version would use more sophisticated algorithms
  let maxAngle = 0
  let maxVotes = 0

  // Test angles from -15 to 15 degrees
  for (let angle = -15; angle <= 15; angle += 0.5) {
    const radians = (angle * Math.PI) / 180
    const cos = Math.cos(radians)
    const sin = Math.sin(radians)

    let votes = 0

    // Sample points to detect lines
    for (let y = 0; y < height; y += 10) {
      for (let x = 0; x < width; x += 10) {
        const idx = (y * width + x) * 4
        const r = data[idx]
        const g = data[idx + 1]
        const b = data[idx + 2]
        const gray = 0.299 * r + 0.587 * g + 0.114 * b

        // If this is a dark pixel (likely text)
        if (gray < 128) {
          // Check if it forms a horizontal line at this angle
          let lineFound = true
          for (let i = 1; i < 10; i++) {
            const nx = Math.round(x + i * cos)
            const ny = Math.round(y + i * sin)

            if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
              lineFound = false
              break
            }

            const nidx = (ny * width + nx) * 4
            const ngray = 0.299 * data[nidx] + 0.587 * data[nidx + 1] + 0.114 * data[nidx + 2]

            if (ngray >= 128) {
              lineFound = false
              break
            }
          }

          if (lineFound) {
            votes++
          }
        }
      }
    }

    if (votes > maxVotes) {
      maxVotes = votes
      maxAngle = angle
    }
  }

  // If a significant skew is detected, correct it
  if (Math.abs(maxAngle) > 1) {
    const radians = (-maxAngle * Math.PI) / 180 // Negative to correct the skew

    // Create a new canvas for the deskewed image
    const deskewedCanvas = document.createElement("canvas")
    deskewedCanvas.width = width
    deskewedCanvas.height = height
    const deskewedCtx = deskewedCanvas.getContext("2d")

    if (deskewedCtx) {
      // Clear the new canvas
      deskewedCtx.fillStyle = "#FFFFFF"
      deskewedCtx.fillRect(0, 0, width, height)

      // Apply the rotation transform
      deskewedCtx.translate(width / 2, height / 2)
      deskewedCtx.rotate(radians)
      deskewedCtx.translate(-width / 2, -height / 2)

      // Draw the original image onto the new canvas
      deskewedCtx.drawImage(canvas, 0, 0)

      return deskewedCanvas
    }
  }

  return canvas
}

// Add a new function for handling different resolutions
export function normalizeResolution(canvas: HTMLCanvasElement, targetDPI = 300): HTMLCanvasElement {
  // For screenshots, we can't reliably determine the DPI
  // Instead, we'll use a heuristic based on text size

  const ctx = canvas.getContext("2d")
  if (!ctx) return canvas

  const width = canvas.width
  const height = canvas.height

  // If the image is very high resolution, downsample it to improve processing speed
  if (width > 2000 || height > 2000) {
    const scale = Math.min(2000 / width, 2000 / height)

    const newWidth = Math.round(width * scale)
    const newHeight = Math.round(height * scale)

    const newCanvas = document.createElement("canvas")
    newCanvas.width = newWidth
    newCanvas.height = newHeight
    const newCtx = newCanvas.getContext("2d")

    if (newCtx) {
      // Use high-quality downsampling
      newCtx.imageSmoothingEnabled = true
      newCtx.imageSmoothingQuality = "high"
      newCtx.drawImage(canvas, 0, 0, newWidth, newHeight)
      return newCanvas
    }
  }

  // If the image is very low resolution, upsample it to improve OCR
  if (width < 500 || height < 500) {
    const scale = Math.max(500 / width, 500 / height)

    const newWidth = Math.round(width * scale)
    const newHeight = Math.round(height * scale)

    const newCanvas = document.createElement("canvas")
    newCanvas.width = newWidth
    newCanvas.height = newHeight
    const newCtx = newCanvas.getContext("2d")

    if (newCtx) {
      // Use high-quality upsampling
      newCtx.imageSmoothingEnabled = true
      newCtx.imageSmoothingQuality = "high"
      newCtx.drawImage(canvas, 0, 0, newWidth, newHeight)
      return newCanvas
    }
  }

  return canvas
}

// Update the enhanceImage function to use the new processing steps
export async function enhanceImage(file: File): Promise<File> {
  try {
    let canvas = await fileToCanvas(file)

    // Check if the image is already high quality and skip processing if so
    const skipEnhancement = await shouldSkipEnhancement(canvas)
    if (skipEnhancement) {
      console.log("Image quality is already good, skipping enhancement")
      return file
    }

    // Apply optimized processing pipeline - only apply what's needed
    canvas = normalizeResolution(canvas)

    // Only apply deskew if needed (detect skew first)
    const isSkewed = detectSkew(canvas)
    if (isSkewed) {
      canvas = deskewImage(canvas)
    }

    // Apply lighter noise reduction and contrast enhancement
    canvas = reduceNoise(canvas, 0.8) // Reduced from 1.2
    canvas = enhanceContrast(canvas, 1.5) // Reduced from 1.8

    // Only apply sharpening if image is blurry
    const isBlurry = detectBlur(canvas)
    if (isBlurry) {
      canvas = sharpenImage(canvas, 0.3) // Reduced from 0.4
    }

    // Create a more efficient file format
    return canvasToFile(canvas, `${file.name.split(".")[0]}_enhanced.jpg`, "image/jpeg", 0.85)
  } catch (error) {
    console.error("Image enhancement failed:", error)
    return file // Return original if processing fails
  }
}

// Add helper functions to determine if enhancement is needed
function shouldSkipEnhancement(canvas: HTMLCanvasElement): boolean {
  // Simple heuristic: check if image has good contrast and sharpness
  const ctx = canvas.getContext("2d")
  if (!ctx) return false

  // Sample a small portion of the image for faster analysis
  const imageData = ctx.getImageData(canvas.width * 0.25, canvas.height * 0.25, canvas.width * 0.5, canvas.height * 0.5)

  // Calculate contrast
  let min = 255,
    max = 0
  for (let i = 0; i < imageData.data.length; i += 16) {
    // Sample every 16th pixel
    const val = imageData.data[i]
    if (val < min) min = val
    if (val > max) max = val
  }

  const contrast = max - min
  return contrast > 100 // Skip if contrast is already good
}

function detectSkew(canvas: HTMLCanvasElement): boolean {
  // Simplified skew detection
  // In a real implementation, this would use more sophisticated algorithms
  return false // For demo purposes, assume no skew to speed up processing
}

function detectBlur(canvas: HTMLCanvasElement): boolean {
  // Simplified blur detection
  // In a real implementation, this would use more sophisticated algorithms
  return false // For demo purposes, assume no blur to speed up processing
}

// Process multiple files
export async function enhanceImages(files: File[]): Promise<File[]> {
  // Process images in parallel with Promise.all
  const enhancedFiles = await Promise.all(files.map((file) => enhanceImage(file)))
  return enhancedFiles
}
