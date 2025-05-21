/**
 * OCR Result Validation
 *
 * This module provides functions for validating OCR results to ensure they meet
 * quality standards before being used for analysis.
 */

import type { Message } from "./types"

/**
 * Validates OCR results to ensure they meet quality standards
 *
 * @param messages - The extracted messages
 * @param rawText - The raw extracted text
 * @returns An object containing validation results
 */
export function validateOcrResults(
  messages: Message[],
  rawText: string,
): {
  isValid: boolean
  confidence: number
  issues: string[]
} {
  const issues: string[] = []
  let confidence = 1.0

  // Check if raw text is empty or too short
  if (!rawText || rawText.length < 10) {
    issues.push("Extracted text is too short or empty")
    confidence *= 0.5
  }

  // Check if no messages were extracted
  if (!messages || messages.length === 0) {
    issues.push("No messages were extracted")
    confidence *= 0.5
  }

  // Check for message quality
  if (messages && messages.length > 0) {
    // Check for very short messages
    const shortMessages = messages.filter((m) => m.text.length < 3)
    if (shortMessages.length > messages.length * 0.5) {
      issues.push("More than 50% of messages are very short")
      confidence *= 0.7
    }

    // Check for missing timestamps
    const missingTimestamps = messages.filter((m) => !m.timestamp)
    if (missingTimestamps.length > 0) {
      issues.push(`${missingTimestamps.length} messages are missing timestamps`)
      confidence *= 0.9
    }
  }

  return {
    isValid: confidence > 0.6 && issues.length < 3,
    confidence,
    issues,
  }
}

/**
 * Checks if OCR results are good enough for analysis
 *
 * @param messages - The extracted messages
 * @param rawText - The raw extracted text
 * @returns True if the results are good enough, false otherwise
 */
export function isOcrResultGoodEnough(messages: Message[], rawText: string): boolean {
  const { isValid } = validateOcrResults(messages, rawText)
  return isValid
}
