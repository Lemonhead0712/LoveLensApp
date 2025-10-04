/**
 * Optimized image processing utilities with better performance
 */

// Convert File to Canvas with optimization
export async function fileToCanvas(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d", { alpha: false })

      if (!ctx) {
        reject(new Error("Could not get canvas context"))
        return
      }

      // Optimize canvas size for OCR (max 2000px on longest side)
      const maxSize = 2000
      let width = img.width
      let height = img.height

      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      canvas.width = width
      canvas.height = height

      // Use better image smoothing
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"

      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas)
    }
    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = URL.createObjectURL(file)
  })
}

// Optimized canvas to File conversion
export async function canvasToFile(canvas: HTMLCanvasElement, filename: string, quality = 0.85): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas to Blob conversion failed"))
          return
        }
        const file = new File([blob], filename, { type: "image/jpeg" })
        resolve(file)
      },
      "image/jpeg",
      quality,
    )
  })
}

// Batch process images with progress callback
export async function batchProcessImages(files: File[], onProgress?: (progress: number) => void): Promise<File[]> {
  const results: File[] = []

  for (let i = 0; i < files.length; i++) {
    try {
      // Simple optimization: just ensure files are in good format
      const canvas = await fileToCanvas(files[i])
      const optimizedFile = await canvasToFile(canvas, `optimized_${files[i].name}`, 0.85)
      results.push(optimizedFile)

      if (onProgress) {
        onProgress(((i + 1) / files.length) * 100)
      }
    } catch (error) {
      console.error(`Failed to process ${files[i].name}:`, error)
      results.push(files[i]) // Use original if processing fails
    }
  }

  return results
}
