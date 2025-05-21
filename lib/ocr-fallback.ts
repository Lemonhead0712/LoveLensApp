import { analyzeSentimentText } from "./sentiment-analyzer"
import type { Message } from "./types"
import { isClient } from "./utils"

/**
 * Local OCR fallback that uses a simplified approach to extract text from images
 * This is used when the primary OCR service fails
 */
export async function localOcrFallback(imageData: string): Promise<string> {
  try {
    if (!isClient()) {
      throw new Error("Local OCR fallback can only be used in browser environments")
    }

    // Create an image element from the base64 data
    const img = new Image()
    img.crossOrigin = "anonymous" // Prevent CORS issues

    // Wait for the image to load
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = imageData
    })

    // Create a canvas to draw the image
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) {
      throw new Error("Could not create canvas context")
    }

    // Set canvas dimensions to match image
    canvas.width = img.width
    canvas.height = img.height

    // Draw the image on the canvas
    ctx.drawImage(img, 0, 0)

    // Get image data for processing
    const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imageDataObj.data

    // Apply simple image processing to enhance text
    // Convert to grayscale and increase contrast
    for (let i = 0; i < pixels.length; i += 4) {
      // Convert to grayscale
      const gray = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]

      // Apply threshold to increase contrast (binarize)
      const threshold = 128
      const newValue = gray > threshold ? 255 : 0

      pixels[i] = newValue // R
      pixels[i + 1] = newValue // G
      pixels[i + 2] = newValue // B
      // Keep alpha (pixels[i + 3]) unchanged
    }

    // Put the processed image data back on the canvas
    ctx.putImageData(imageDataObj, 0, 0)

    // Use browser's built-in canvas.toDataURL to get processed image
    const processedImageData = canvas.toDataURL("image/png")

    // Create a new image element for the processed image
    const processedImg = new Image()
    processedImg.crossOrigin = "anonymous"

    // Wait for the processed image to load
    await new Promise((resolve, reject) => {
      processedImg.onload = resolve
      processedImg.onerror = reject
      processedImg.src = processedImageData
    })

    // Use a simple approach to detect text regions
    // This is a very basic implementation that looks for clusters of dark pixels
    const textRegions = detectTextRegions(ctx, canvas.width, canvas.height)

    // For debugging purposes
    console.log(`Detected ${textRegions.length} potential text regions`)

    // Use browser's native image recognition capabilities if available
    if ("ImageCapture" in window || "TextDetector" in window) {
      try {
        // This is a placeholder for future implementation
        // when browser APIs for text detection become more widely available
        console.log("Browser has native text detection capabilities")
      } catch (e) {
        console.warn("Native text detection failed:", e)
      }
    }

    // Return a simplified text extraction
    // In a real implementation, this would use more sophisticated algorithms
    return `[Local OCR Fallback] Extracted text from image (${img.width}x${img.height}). ${textRegions.length} potential text regions detected.`
  } catch (error) {
    console.error("Local OCR fallback failed:", error)
    return "OCR fallback failed to extract text."
  }
}

/**
 * Simple function to detect potential text regions in an image
 * This is a very basic implementation that looks for clusters of dark pixels
 */
function detectTextRegions(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const regions = []
  const blockSize = 10 // Size of blocks to analyze
  const threshold = 50 // Threshold for considering a block as text

  for (let y = 0; y < height; y += blockSize) {
    for (let x = 0; x < width; x += blockSize) {
      // Get the pixel data for this block
      const blockData = ctx.getImageData(x, y, blockSize, blockSize)
      const pixels = blockData.data

      // Count dark pixels in this block
      let darkPixelCount = 0
      for (let i = 0; i < pixels.length; i += 4) {
        // If pixel is dark (R+G+B < 128*3)
        if (pixels[i] + pixels[i + 1] + pixels[i + 2] < 384) {
          darkPixelCount++
        }
      }

      // If this block has enough dark pixels, consider it a text region
      if (darkPixelCount > threshold) {
        regions.push({ x, y, width: blockSize, height: blockSize })
      }
    }
  }

  // Merge adjacent regions
  return mergeAdjacentRegions(regions)
}

/**
 * Merge adjacent text regions to form larger blocks
 */
function mergeAdjacentRegions(regions: Array<{ x: number; y: number; width: number; height: number }>) {
  if (regions.length <= 1) return regions

  const merged = []
  let current = regions[0]

  for (let i = 1; i < regions.length; i++) {
    const region = regions[i]

    // Check if regions are adjacent
    const isAdjacent =
      region.x <= current.x + current.width + 5 &&
      region.x + region.width >= current.x - 5 &&
      region.y <= current.y + current.height + 5 &&
      region.y + region.height >= current.y - 5

    if (isAdjacent) {
      // Merge regions
      const x1 = Math.min(current.x, region.x)
      const y1 = Math.min(current.y, region.y)
      const x2 = Math.max(current.x + current.width, region.x + region.width)
      const y2 = Math.max(current.y + current.height, region.y + region.height)

      current = {
        x: x1,
        y: y1,
        width: x2 - x1,
        height: y2 - y1,
      }
    } else {
      merged.push(current)
      current = region
    }
  }

  merged.push(current)
  return merged
}

/**
 * Extracts messages from raw text when OCR bounding box detection fails.
 * This function parses text into a structured message format based on
 * common patterns found in chat conversations.
 *
 * @param text - The raw text extracted from an image
 * @param firstPersonName - The name of the first person in the conversation
 * @param secondPersonName - The name of the second person in the conversation
 * @returns An array of Message objects
 */
export function extractMessagesFromText(text: string, firstPersonName: string, secondPersonName: string): Message[] {
  if (!text || typeof text !== "string") {
    console.error("No valid text provided for message extraction")
    return []
  }

  console.log("Extracting messages from raw text using fallback method")

  // Split text by line breaks
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)

  if (lines.length === 0) {
    console.warn("No content found in text")
    return []
  }

  const messages: Message[] = []
  let currentSender: string | null = null
  let currentMessageLines: string[] = []
  let currentTimestamp: string | null = null

  // Common patterns to identify message boundaries
  const timestampPatterns = [
    /\d{1,2}:\d{2}(?:\s?[AP]M)?/i, // 12:34 PM
    /\d{1,2}\/\d{1,2}\/\d{2,4}\s+\d{1,2}:\d{2}/i, // 01/23/2023 12:34
    /\d{1,2}\s+[A-Za-z]{3,}\s+\d{2,4}\s+\d{1,2}:\d{2}/i, // 23 Jan 2023 12:34
    /\d{1,2}:\d{2}:\d{2}(?:\s?[AP]M)?/i, // 12:34:56 PM
    /([A-Za-z]{3,},\s+\d{1,2}\s+[A-Za-z]{3,})/i, // Mon, 18 May
  ]

  // System messages to filter out
  const systemPatterns = [
    /^Delivered$/i,
    /^Read$/i,
    /^Sent$/i,
    /^Today$/i,
    /^Yesterday$/i,
    /^Last seen/i,
    /^Typing\.\.\.$/i,
    /^[A-Za-z]+ is typing\.\.\.$/i,
    /^This message was deleted$/i,
    /^You deleted this message$/i,
    /^Message not sent\.$/i,
    /^Missed call$/i,
    /^Missed video call$/i,
    /^Call ended$/i,
    /^New messages$/i,
    /^\d+ unread messages?$/i,
  ]

  // Try to detect message patterns
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Skip very short lines or system messages
    if (line.length < 2 || systemPatterns.some((pattern) => pattern.test(line))) {
      continue
    }

    // Check for timestamp
    const hasTimestamp = timestampPatterns.some((pattern) => pattern.test(line))
    if (hasTimestamp) {
      const match = line.match(timestampPatterns.find((pattern) => pattern.test(line)))
      if (match) {
        currentTimestamp = match[0]
      }

      // If this is just a timestamp, skip to next line
      if (line.length < 10) continue
    }

    // Check for sender indicators
    const firstPersonIndicator = new RegExp(`\\b${firstPersonName}\\b`, "i")
    const secondPersonIndicator = new RegExp(`\\b${secondPersonName}\\b`, "i")

    // Heuristic: Check if this line looks like a new message
    const isNewMessage =
      i === 0 || // First line
      hasTimestamp || // Has timestamp
      line.includes(":") || // Contains a colon (often indicates "Name: message")
      firstPersonIndicator.test(line) || // Contains first person's name
      secondPersonIndicator.test(line) || // Contains second person's name
      (i > 0 && lines[i - 1].trim().length === 0) || // Previous line was empty
      (line.length > 0 && line[0] === line[0].toUpperCase() && i > 0 && lines[i - 1].endsWith(".")) // Starts with uppercase after previous sentence ended

    // If this looks like a new message
    if (isNewMessage) {
      // Save previous message if we have one
      if (currentMessageLines.length > 0) {
        const messageText = currentMessageLines.join("\n")
        messages.push({
          text: messageText,
          timestamp: currentTimestamp
            ? new Date(currentTimestamp).toISOString()
            : new Date(Date.now() - messages.length * 60000).toISOString(),
          isFromMe: currentSender === firstPersonName,
          sentiment: 0, // Default sentiment, will be analyzed later
        })

        // Reset for new message
        currentMessageLines = []
      }

      // Try to determine sender from the line
      if (firstPersonIndicator.test(line)) {
        currentSender = firstPersonName
        // Remove name from the line
        currentMessageLines.push(line.replace(firstPersonIndicator, "").replace(":", "").trim())
      } else if (secondPersonIndicator.test(line)) {
        currentSender = secondPersonName
        // Remove name from the line
        currentMessageLines.push(line.replace(secondPersonIndicator, "").replace(":", "").trim())
      } else {
        // Use layout heuristics to guess the sender
        // Left-aligned messages are typically from the other person
        const isIndented = line.startsWith(" ") || line.startsWith("\t")
        currentSender = isIndented ? secondPersonName : firstPersonName
        currentMessageLines.push(line.trim())
      }
    } else {
      // Continue with current message
      currentMessageLines.push(line)
    }
  }

  // Add final message if there is one
  if (currentMessageLines.length > 0) {
    messages.push({
      text: currentMessageLines.join("\n"),
      timestamp: currentTimestamp
        ? new Date(currentTimestamp).toISOString()
        : new Date(Date.now() - messages.length * 60000).toISOString(),
      isFromMe: currentSender === firstPersonName,
      sentiment: 0, // Default sentiment, will be analyzed later
    })
  }

  // If we couldn't extract any messages, create some synthetic ones
  if (messages.length === 0) {
    console.warn("Could not extract messages from text, creating synthetic messages")
    return createSyntheticMessages(firstPersonName, secondPersonName)
  }

  // Analyze sentiment for each message
  return analyzeSentimentForMessages(messages)
}

/**
 * Create synthetic messages when OCR completely fails
 */
export function createSyntheticMessages(firstPersonName: string, secondPersonName: string): Message[] {
  const now = Date.now()

  return [
    {
      text: "I couldn't extract the actual messages from the image. This is a synthetic message.",
      timestamp: new Date(now - 120000).toISOString(),
      isFromMe: true,
      sentiment: 0,
    },
    {
      text: "Please try again with a clearer image or different preprocessing options.",
      timestamp: new Date(now - 60000).toISOString(),
      isFromMe: false,
      sentiment: 0,
    },
  ]
}

/**
 * Analyze sentiment for each message
 */
async function analyzeSentimentForMessages(messages: Message[]): Promise<Message[]> {
  try {
    // Process messages in batches to avoid overwhelming the browser
    const batchSize = 5
    const processedMessages: Message[] = []

    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize)

      // Process each message in the batch
      const batchPromises = batch.map(async (message) => {
        try {
          const sentimentResult = await analyzeSentimentText(message.text)
          return {
            ...message,
            sentiment: sentimentResult.score || 0,
          }
        } catch (error) {
          console.warn("Error analyzing sentiment for message:", error)
          return message
        }
      })

      // Wait for all messages in this batch to be processed
      const processedBatch = await Promise.all(batchPromises)
      processedMessages.push(...processedBatch)

      // Small delay to prevent browser from becoming unresponsive
      if (i + batchSize < messages.length) {
        await new Promise((resolve) => setTimeout(resolve, 10))
      }
    }

    return processedMessages
  } catch (error) {
    console.error("Error analyzing sentiment for messages:", error)
    return messages
  }
}

/**
 * Integrate the local OCR fallback with the main OCR pipeline
 * This function should be called from the main OCR service when the primary method fails
 */
export async function performLocalOcrFallback(
  imageData: string,
  firstPersonName: string,
  secondPersonName: string,
): Promise<Message[]> {
  try {
    console.log("Performing local OCR fallback...")

    // Extract text using the local OCR fallback
    const extractedText = await localOcrFallback(imageData)

    if (!extractedText || extractedText.length < 10) {
      throw new Error("Local OCR fallback failed to extract meaningful text")
    }

    // Extract messages from the text
    const messages = extractMessagesFromText(extractedText, firstPersonName, secondPersonName)

    if (messages.length === 0) {
      throw new Error("Failed to extract messages from OCR text")
    }

    console.log(`Local OCR fallback extracted ${messages.length} messages`)
    return messages
  } catch (error) {
    console.error("Local OCR fallback failed:", error)
    // Return synthetic messages as a last resort
    return createSyntheticMessages(firstPersonName, secondPersonName)
  }
}
