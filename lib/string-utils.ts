/**
 * Utility functions for string manipulation and text processing
 */

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

// Calculate similarity between two strings (for name matching)
export function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase()
  const s2 = str2.toLowerCase()

  // Calculate Levenshtein distance
  const track = Array(s2.length + 1)
    .fill(null)
    .map(() => Array(s1.length + 1).fill(null))

  for (let i = 0; i <= s1.length; i += 1) {
    track[0][i] = i
  }

  for (let j = 0; j <= s2.length; j += 1) {
    track[j][0] = j
  }

  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator, // substitution
      )
    }
  }

  // Convert distance to similarity score (0-1)
  const maxLength = Math.max(s1.length, s2.length)
  if (maxLength === 0) return 1 // Both strings empty

  const distance = track[s2.length][s1.length]
  return 1 - distance / maxLength
}

// Deduplicate messages based on content similarity
export function deduplicateMessages(messages: any[]): any[] {
  if (!messages || messages.length <= 1) return messages

  const uniqueMessages: any[] = []
  const seenContent = new Set<string>()

  for (const message of messages) {
    // Create a normalized version of the message text for comparison
    const normalizedText = message.text.toLowerCase().trim()

    // Skip if we've seen this exact text before
    if (seenContent.has(normalizedText)) continue

    // Check for high similarity with previous messages
    let isDuplicate = false
    for (const seenText of seenContent) {
      const similarity = calculateStringSimilarity(normalizedText, seenText)
      if (similarity > 0.9) {
        // 90% similarity threshold
        isDuplicate = true
        break
      }
    }

    if (!isDuplicate) {
      uniqueMessages.push(message)
      seenContent.add(normalizedText)
    }
  }

  return uniqueMessages
}
