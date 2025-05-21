/**
 * Detects which side of the conversation a message belongs to based on its bounding box position
 * @param bboxX The x-coordinate of the top-left corner of the message bounding box
 * @param imageWidth The total width of the image being analyzed
 * @returns 'left' or 'right' indicating the message position
 */
export function detectMessageSide(bboxX: number, imageWidth: number): "left" | "right" {
  // Simple threshold-based detection - messages starting in the left half are considered 'left'
  return bboxX < imageWidth / 2 ? "left" : "right"
}

/**
 * Enhanced position detection that considers both the x position and the width of the bounding box
 * This can be more accurate for some chat interfaces where bubbles extend across the screen
 * @param bbox The bounding box of the text
 * @param imageWidth The total width of the image
 * @returns 'left' or 'right' indicating the message position
 */
export function enhancedPositionDetection(
  bbox: { x0: number; x1: number; y0: number; y1: number },
  imageWidth: number,
): "left" | "right" {
  // Calculate the center of the bounding box
  const boxCenter = (bbox.x0 + bbox.x1) / 2

  // Calculate the relative position (0-1) of the box center
  const relativePosition = boxCenter / imageWidth

  // Use a threshold slightly offset from center (0.45) to account for UI biases
  // Many chat apps have slightly asymmetric layouts
  return relativePosition < 0.45 ? "left" : "right"
}

/**
 * Detects the position of a message based on its content and bounding box
 * Combines spatial analysis with content heuristics for higher accuracy
 * @param text The message text
 * @param bbox The bounding box of the text
 * @param imageWidth The total width of the image
 * @returns 'left' or 'right' indicating the message position
 */
export function hybridPositionDetection(
  text: string,
  bbox: { x0: number; x1: number; y0: number; y1: number },
  imageWidth: number,
): "left" | "right" {
  // Get position based on spatial information
  const spatialPosition = enhancedPositionDetection(bbox, imageWidth)

  // Simple content-based heuristics (as a fallback or confirmation)
  const lowerText = text.toLowerCase()
  const hasLeftIndicators = /\b(i am|i'm|i'll|i will|i have)\b/i.test(lowerText)
  const hasRightIndicators = /\b(you are|you're|you'll|you will|you have)\b/i.test(lowerText)

  // If content strongly suggests a position that contradicts spatial analysis,
  // we might have an unusual layout - log this case for review
  if (
    (spatialPosition === "left" && hasRightIndicators && !hasLeftIndicators) ||
    (spatialPosition === "right" && hasLeftIndicators && !hasRightIndicators)
  ) {
    console.warn("Position detection conflict:", {
      text: text.substring(0, 50),
      spatialPosition,
      hasLeftIndicators,
      hasRightIndicators,
    })
  }

  // Prioritize spatial information over content heuristics
  return spatialPosition
}
