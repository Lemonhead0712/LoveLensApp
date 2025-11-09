"use server"
import sharp from "sharp"

export async function serverEnhanceImage(formData: FormData) {
  try {
    const file = formData.get("file") as File
    if (!file) {
      throw new Error("No file provided")
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Get image metadata to determine appropriate processing
    const metadata = await sharp(buffer).metadata()
    const { width, height, format } = metadata

    // Determine if we need to resize the image for better OCR
    let processingPipeline = sharp(buffer)

    // Normalize resolution for very large or very small images
    if (width && height) {
      if (width > 3000 || height > 3000) {
        // Downsample very large images
        const scale = Math.min(3000 / width, 3000 / height)
        processingPipeline = processingPipeline.resize(Math.round(width * scale), Math.round(height * scale), {
          kernel: sharp.kernel.lanczos3,
        })
      } else if (width < 800 || height < 800) {
        // Upsample very small images
        const scale = Math.max(800 / width, 800 / height)
        processingPipeline = processingPipeline.resize(Math.round(width * scale), Math.round(height * scale), {
          kernel: sharp.kernel.lanczos3,
        })
      }
    }

    // Apply a series of enhancements using sharp
    const enhancedBuffer = await processingPipeline
      // Normalize contrast
      .normalize()
      // Reduce noise with adaptive settings based on image size
      .median(width && width > 1000 ? 2 : 1)
      // Sharpen with adaptive settings
      .sharpen({
        sigma: 1.2,
        m1: 0.5,
        m2: 0.5,
        x1: 2,
        y2: 10,
        y3: 20,
      })
      // Adjust gamma for better text visibility
      .gamma(1.2)
      // Enhance local contrast
      .clahe({ width: 100, height: 100 })
      .toBuffer()

    // Create multiple binarized versions with different thresholds for OCR
    const binarizedBuffer = await sharp(enhancedBuffer).grayscale().threshold(128).toBuffer()

    // Create an adaptive thresholded version
    const adaptiveBuffer = await sharp(enhancedBuffer)
      .grayscale()
      // Simulate adaptive thresholding using local operations
      .recomb([
        [0.299, 0.587, 0.114], // Convert to grayscale with proper weights
        [0, 0, 0],
        [0, 0, 0],
      ])
      // Use local area operations to simulate adaptive thresholding
      .convolve({
        width: 5,
        height: 5,
        kernel: [1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 2, 0, 2, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1],
        scale: 24,
        offset: -15,
      })
      .threshold(128)
      .toBuffer()

    // In a real implementation, we would use all versions for OCR
    // and combine the results for the best accuracy

    return {
      success: true,
      enhancedImage: enhancedBuffer.toString("base64"),
      binarizedImage: binarizedBuffer.toString("base64"),
      adaptiveImage: adaptiveBuffer.toString("base64"),
      metadata: {
        originalWidth: width,
        originalHeight: height,
        originalFormat: format,
        processingApplied: {
          normalized: true,
          adaptiveThreshold: true,
          noiseReduction: true,
          contrastEnhancement: true,
        },
      },
    }
  } catch (error) {
    console.error("Server image enhancement failed:", error)
    return {
      success: false,
      error: (error as Error).message,
    }
  }
}
