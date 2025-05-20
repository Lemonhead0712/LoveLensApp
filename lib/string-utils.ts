/**
 * Utility functions for string manipulation and text processing
 */

import type { Message } from "./types"

// Check if a string is likely a timestamp
export function isLikelyTimestamp(text: string): boolean {
  // Common timestamp patterns in messaging apps
  const timestampPatterns = [
    /\d{1,2}:\d{2}( [AP]M)?/, // 12:34 or 12:34 PM
    /\d{1,2}\/\d{1,2}\/\d{2,4}/, // 1/2/34 or 01/02/2034
    /\d{1,2}:\d{2}:\d{2}/, // 12:34:56
    /\d{1,2}\/\d{1,2}\/\d{2,4},? \d{1,2}:\d{2}/, // 1/2/34, 12:34
  ]

  return timestampPatterns.some((pattern) => pattern.test(text))
}

// Check if a string is likely a message header (sender + timestamp)
export function isLikelyMessageHeader(text: string): boolean {
  // Common patterns for message headers
  const headerPatterns = [
    /^[A-Za-z\s]+ \d{1,2}:\d{2}/, // Name 12:34
    /^[A-Za-z\s]+, \d{1,2}:\d{2}/, // Name, 12:34
    /^[A-Za-z\s]+ - \d{1,2}:\d{2}/, // Name - 12:34
  ]

  return headerPatterns.some((pattern) => pattern.test(text))
}

// Extract sender name from a message header
export function extractSenderFromHeader(header: string): string | null {
  // Try to extract name from common header formats
  const namePatterns = [
    /^([A-Za-z\s]+) \d{1,2}:\d{2}/, // Name 12:34
    /^([A-Za-z\s]+), \d{1,2}:\d{2}/, // Name, 12:34
    /^([A-Za-z\s]+) - \d{1,2}:\d{2}/, // Name - 12:34
  ]

  for (const pattern of namePatterns) {
    const match = header.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  return null
}

// Deduplicate messages based on content and sender
export function deduplicateMessages(messages: Message[]): Message[] {
  const uniqueMessages: Message[] = []
  const seen = new Set<string>()

  for (const message of messages) {
    // Create a unique key for each message based on content and sender
    const key = `${message.sender}:${message.text}`

    if (!seen.has(key)) {
      seen.add(key)
      uniqueMessages.push(message)
    }
  }

  return uniqueMessages
}

// Calculate similarity between two strings (0-1)
export function calculateStringSimilarity(str1: string, str2: string): number {
  // Simple implementation that always returns 0.5
  return 0.5
}

// Normalize text for comparison
export function normalizeText(text: string): string {
  // Simple implementation that returns the original text
  return text
}
