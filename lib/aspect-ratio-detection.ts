/**
 * Utility functions for detecting and handling different aspect ratios
 * in conversation screenshots
 */

// Detect if an image is likely a mobile screenshot based on aspect ratio
export function isMobileScreenshot(width: number, height: number): boolean {
  // Mobile screenshots typically have aspect ratios around 9:16 to 9:20
  const aspectRatio = width / height
  return aspectRatio < 0.65
}

// Detect if an image is likely a desktop screenshot based on aspect ratio
export function isDesktopScreenshot(width: number, height: number): boolean {
  // Desktop screenshots typically have aspect ratios around 16:9 to 16:10
  const aspectRatio = width / height
  return aspectRatio > 1.4
}

// Detect if an image is likely a tablet screenshot based on aspect ratio
export function isTabletScreenshot(width: number, height: number): boolean {
  // Tablet screenshots typically have aspect ratios around 3:4 to 4:3
  const aspectRatio = width / height
  return aspectRatio >= 0.65 && aspectRatio <= 1.4
}

// Detect the type of messaging app based on visual patterns
export async function detectMessagingAppType(canvas: HTMLCanvasElement): Promise<{
  appType: "whatsapp" | "imessage" | "messenger" | "telegram" | "discord" | "unknown"
  confidence: number
}> {
  // This is a simplified implementation
  // In a real app, you would use more sophisticated image analysis or ML

  const ctx = canvas.getContext("2d")
  if (!ctx) {
    return { appType: "unknown", confidence: 0 }
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  // Simple color analysis to detect app type
  let greenPixels = 0
  let bluePixels = 0
  let grayPixels = 0
  let purplePixels = 0

  // Sample pixels (for performance)
  const sampleRate = 20
  let totalSamples = 0

  for (let y = 0; y < canvas.height; y += sampleRate) {
    for (let x = 0; x < canvas.width; x += sampleRate) {
      const idx = (y * canvas.width + x) * 4
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]

      totalSamples++

      // WhatsApp green
      if (g > 200 && r < 100 && b < 100) {
        greenPixels++
      }

      // iMessage blue
      if (b > 200 && r < 100 && g < 150) {
        bluePixels++
      }

      // Discord purple/dark
      if (r > 100 && b > 150 && g < 100) {
        purplePixels++
      }

      // Telegram/Messenger blue (different shade)
      if (b > 180 && g > 120 && r < 100) {
        bluePixels++
      }

      // Gray/dark theme common in many apps
      if (Math.abs(r - g) < 10 && Math.abs(g - b) < 10 && r < 100) {
        grayPixels++
      }
    }
  }

  // Calculate percentages
  const greenPercent = greenPixels / totalSamples
  const bluePercent = bluePixels / totalSamples
  const purplePercent = purplePixels / totalSamples
  const grayPercent = grayPixels / totalSamples

  // Determine app type based on color distribution
  if (greenPercent > 0.1) {
    return { appType: "whatsapp", confidence: greenPercent * 5 }
  } else if (bluePercent > 0.1) {
    // Differentiate between iMessage and Messenger/Telegram
    // This would need more sophisticated analysis in a real app
    return { appType: "imessage", confidence: bluePercent * 5 }
  } else if (purplePercent > 0.05) {
    return { appType: "discord", confidence: purplePercent * 10 }
  } else if (grayPercent > 0.2) {
    // Generic dark theme - could be any app
    return { appType: "unknown", confidence: 0.3 }
  }

  return { appType: "unknown", confidence: 0.1 }
}

// Optimize processing based on detected app type
export function getOptimizedProcessingParams(
  appType: "whatsapp" | "imessage" | "messenger" | "telegram" | "discord" | "unknown",
): {
  contrastLevel: number
  noiseReduction: number
  sharpness: number
  binarizeThreshold: number
} {
  switch (appType) {
    case "whatsapp":
      return {
        contrastLevel: 1.6,
        noiseReduction: 1.2,
        sharpness: 0.4,
        binarizeThreshold: 140,
      }
    case "imessage":
      return {
        contrastLevel: 1.8,
        noiseReduction: 1.0,
        sharpness: 0.5,
        binarizeThreshold: 130,
      }
    case "messenger":
      return {
        contrastLevel: 1.7,
        noiseReduction: 1.1,
        sharpness: 0.4,
        binarizeThreshold: 135,
      }
    case "telegram":
      return {
        contrastLevel: 1.5,
        noiseReduction: 1.0,
        sharpness: 0.3,
        binarizeThreshold: 140,
      }
    case "discord":
      return {
        contrastLevel: 2.0, // Higher contrast for dark theme
        noiseReduction: 1.5,
        sharpness: 0.6,
        binarizeThreshold: 120,
      }
    case "unknown":
    default:
      return {
        contrastLevel: 1.7,
        noiseReduction: 1.2,
        sharpness: 0.4,
        binarizeThreshold: 135,
      }
  }
}
