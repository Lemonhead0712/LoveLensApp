/**
 * Utility functions for detecting message positions in chat screenshots
 */

/**
 * Determines if a message is on the left or right side based on its x-coordinate
 * and the image width
 *
 * @param bboxX The x-coordinate of the message bounding box
 * @param imageWidth The width of the image
 * @returns 'left' or 'right' indicating the message position
 */
export function detectMessageSide(bboxX: number, imageWidth: number): "left" | "right" {
  // Default threshold is the middle of the image
  const threshold = imageWidth / 2

  // Messages starting in the left half are considered 'left' messages
  // Messages starting in the right half are considered 'right' messages
  return bboxX < threshold ? "left" : "right"
}

/**
 * Advanced position detection that accounts for different chat app layouts
 *
 * @param bboxX The x-coordinate of the message bounding box
 * @param bboxWidth The width of the message bounding box
 * @param imageWidth The width of the image
 * @returns 'left' or 'right' indicating the message position
 */
export function detectMessageSideAdvanced(bboxX: number, bboxWidth: number, imageWidth: number): "left" | "right" {
  // Calculate the center point of the text block
  const centerX = bboxX + bboxWidth / 2

  // For wider messages, check if they span across the middle
  if (bboxWidth > imageWidth * 0.4) {
    // For wide messages, use the starting position as the determining factor
    return bboxX < imageWidth * 0.3 ? "left" : "right"
  }

  // For normal width messages, use the center point
  return centerX < imageWidth / 2 ? "left" : "right"
}

/**
 * Detects the chat app type based on message distribution patterns
 *
 * @param textBlocks Array of text blocks with position information
 * @param imageWidth The width of the image
 * @returns The detected chat app type
 */
export function detectChatAppType(
  textBlocks: Array<{ boundingBox: { x: number } }>,
  imageWidth: number,
): "whatsapp" | "imessage" | "messenger" | "telegram" | "unknown" {
  // Count messages in different regions of the image
  const leftEdgeCount = textBlocks.filter((block) => block.boundingBox.x < imageWidth * 0.1).length
  const leftSideCount = textBlocks.filter(
    (block) => block.boundingBox.x >= imageWidth * 0.1 && block.boundingBox.x < imageWidth * 0.4,
  ).length
  const rightSideCount = textBlocks.filter((block) => block.boundingBox.x >= imageWidth * 0.6).length

  // WhatsApp typically has messages aligned to both left and right edges
  if (leftEdgeCount > 3 && rightSideCount > 3) {
    return "whatsapp"
  }

  // iMessage typically has left messages indented and right messages aligned right
  if (leftSideCount > 3 && rightSideCount > 3 && leftEdgeCount < 3) {
    return "imessage"
  }

  // Messenger has a similar pattern to iMessage
  if (leftSideCount > 5 && rightSideCount > 5) {
    return "messenger"
  }

  // Telegram has a distinct pattern with bubbles
  if (leftEdgeCount > 5 && rightSideCount > 5) {
    return "telegram"
  }

  return "unknown"
}

/**
 * Gets the optimal position threshold based on the detected chat app type
 *
 * @param chatAppType The detected chat app type
 * @param imageWidth The width of the image
 * @returns The threshold x-coordinate for determining left vs right
 */
export function getPositionThreshold(chatAppType: string, imageWidth: number): number {
  switch (chatAppType) {
    case "whatsapp":
      return imageWidth * 0.5 // Middle of the image
    case "imessage":
      return imageWidth * 0.4 // Slightly left of center
    case "messenger":
      return imageWidth * 0.45 // Slightly left of center
    case "telegram":
      return imageWidth * 0.5 // Middle of the image
    default:
      return imageWidth * 0.5 // Default to middle
  }
}
