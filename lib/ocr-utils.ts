import type { Message } from "./types"

/**
 * Utility functions to support OCR processing
 */

/**
 * Try to identify speaker from text patterns
 * @param text Message text
 * @param firstPersonName First person's name
 * @param secondPersonName Second person's name
 * @returns The name of the likely sender
 */
export function identifySpeakerFromText(text: string, firstPersonName: string, secondPersonName: string): string {
  // Default to first person if we can't determine
  let likelySender = firstPersonName

  // Convert names to lowercase for case-insensitive matching
  const firstName = firstPersonName.toLowerCase()
  const secondName = secondPersonName.toLowerCase()
  const lowercaseText = text.toLowerCase()

  // Look for first-person indicators
  const firstPersonIndicators = [
    "i am",
    "i'm",
    "i was",
    "i have",
    "i had",
    "i need",
    "i want",
    "my",
    "mine",
    "me",
    "myself",
  ]

  // Look for second-person indicators
  const secondPersonIndicators = [
    "you are",
    "you're",
    "you were",
    "you have",
    "you had",
    "you need",
    "you want",
    "your",
    "yours",
    "yourself",
  ]

  // Count indicators
  let firstPersonCount = 0
  let secondPersonCount = 0

  // Check for first person indicators
  firstPersonIndicators.forEach((indicator) => {
    const regex = new RegExp(`\\b${indicator}\\b`, "gi")
    const matches = lowercaseText.match(regex)
    if (matches) {
      firstPersonCount += matches.length
    }
  })

  // Check for second person indicators
  secondPersonIndicators.forEach((indicator) => {
    const regex = new RegExp(`\\b${indicator}\\b`, "gi")
    const matches = lowercaseText.match(regex)
    if (matches) {
      secondPersonCount += matches.length
    }
  })

  // If there are more second-person indicators, it's likely the second person speaking
  if (secondPersonCount > firstPersonCount) {
    likelySender = secondPersonName
  }

  // Check for direct name references
  if (lowercaseText.includes(firstName) && !lowercaseText.includes(secondName)) {
    // If only the first name is mentioned, it's likely the second person speaking
    likelySender = secondPersonName
  } else if (!lowercaseText.includes(firstName) && lowercaseText.includes(secondName)) {
    // If only the second name is mentioned, it's likely the first person speaking
    likelySender = firstPersonName
  }

  return likelySender
}

/**
 * Enhance message quality by attempting to fix common OCR errors
 * @param text Raw OCR text
 * @returns Cleaned up text
 */
export function enhanceMessageText(text: string): string {
  if (!text) return ""

  // Remove any null characters or control characters
  let cleaned = text.replace(/[\x00-\x1F\x7F-\x9F]/g, "")

  // Fix common OCR errors
  cleaned = cleaned
    // Fix spacing issues
    .replace(/\s+/g, " ")
    // Fix common OCR mistakes
    .replace(/l'm/g, "I'm")
    .replace(/l'll/g, "I'll")
    .replace(/l've/g, "I've")
    .replace(/l'd/g, "I'd")
    .replace(/l am/g, "I am")
    .replace(/\bl\b/g, "I")
    // Fix common punctuation errors
    .replace(/,,/g, ",")
    .replace(/\.\./g, ".")
    .replace(/\?\?/g, "?")
    .replace(/!!/g, "!")
    // Trim and normalize spaces
    .trim()

  return cleaned
}

/**
 * Detect if a message is likely a system message or notification
 * @param text Message text
 * @returns true if the message is likely a system notification
 */
export function isLikelySystemMessage(text: string): boolean {
  const systemPatterns = [
    /^[0-9]{1,2}:[0-9]{1,2}(\s?(am|pm))?$/i, // Just a timestamp
    /^(today|yesterday|monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i, // Just a day
    /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s[0-9]{1,2}$/i, // Just a date
    /^delivered$/i,
    /^read$/i,
    /^sent$/i,
    /^missed (call|video call)$/i,
    /^call (started|ended)$/i,
    /^video call (started|ended)$/i,
    /^typing\.\.\.$/i,
    /^[a-z]+ is typing\.\.\.$/i,
    /^message not sent\.?$/i,
    /^this message was deleted\.?$/i,
    /^you deleted this message\.?$/i,
  ]

  return systemPatterns.some((pattern) => pattern.test(text.trim()))
}

/**
 * Split a long text into possible messages based on content analysis
 * @param text Long text block
 * @param firstPersonName First person's name
 * @param secondPersonName Second person's name
 * @returns Array of messages
 */
export function splitTextIntoMessages(text: string, firstPersonName: string, secondPersonName: string): Message[] {
  if (!text) return []

  // Split by possible message boundaries
  const boundaries = [
    /\n{2,}/g, // Double newlines
    /\.\s+[A-Z]/g, // Period followed by capital letter
    /\?\s+[A-Z]/g, // Question mark followed by capital letter
    /!\s+[A-Z]/g, // Exclamation mark followed by capital letter
    /\d{1,2}:\d{2}(\s?(am|pm))?\s+/gi, // Timestamp pattern
  ]

  // Start with line breaks for initial splitting
  let segments = text.split(/\n{2,}/)

  // If we have very few segments, try other boundaries
  if (segments.length < 3) {
    for (const boundary of boundaries) {
      if (segments.length >= 3) break

      segments = []
      let lastIndex = 0
      let match

      // Create a copy of the regex to reset its lastIndex
      const regex = new RegExp(boundary.source, boundary.flags)

      while ((match = regex.exec(text)) !== null) {
        segments.push(text.substring(lastIndex, match.index + 1))
        lastIndex = match.index + 1
      }

      // Add the remaining text
      if (lastIndex < text.length) {
        segments.push(text.substring(lastIndex))
      }
    }
  }

  // Further refine segments if they're still too long
  const refinedSegments: string[] = []
  segments.forEach((segment) => {
    if (segment.length > 200) {
      // Split very long segments by sentence boundaries
      const sentences = segment.split(/(?<=[.?!])\s+/)
      refinedSegments.push(...sentences)
    } else {
      refinedSegments.push(segment)
    }
  })

  // Convert segments to messages
  const messages: Message[] = []
  let currentSender = firstPersonName

  refinedSegments.forEach((segment, index) => {
    const cleanText = enhanceMessageText(segment)

    // Skip likely system messages
    if (isLikelySystemMessage(cleanText)) {
      return
    }

    // Determine sender - alternate if we can't detect
    if (index > 0) {
      // Try to identify the speaker from text patterns
      currentSender = identifySpeakerFromText(cleanText, firstPersonName, secondPersonName)

      // Alternate speakers if we couldn't determine from content
      if (currentSender === messages[messages.length - 1].sender) {
        // If the message has clear first-person indicators, keep the same sender
        const firstPersonCount = countFirstPersonIndicators(cleanText)
        const secondPersonCount = countSecondPersonIndicators(cleanText)

        if (firstPersonCount <= secondPersonCount) {
          // Alternate sender if no strong first-person indication
          currentSender = currentSender === firstPersonName ? secondPersonName : firstPersonName
        }
      }
    }

    messages.push({
      sender: currentSender,
      text: cleanText,
      timestamp: new Date(Date.now() - (refinedSegments.length - index) * 60000).toISOString(),
    })
  })

  return messages
}

/**
 * Count first-person indicators in text
 */
function countFirstPersonIndicators(text: string): number {
  const indicators = [
    /\bi\b/gi,
    /\bme\b/gi,
    /\bmy\b/gi,
    /\bmine\b/gi,
    /\bmyself\b/gi,
    /\bi'm\b/gi,
    /\bi've\b/gi,
    /\bi'll\b/gi,
    /\bi'd\b/gi,
  ]

  return indicators.reduce((count, pattern) => {
    const matches = text.match(pattern)
    return count + (matches ? matches.length : 0)
  }, 0)
}

/**
 * Count second-person indicators in text
 */
function countSecondPersonIndicators(text: string): number {
  const indicators = [
    /\byou\b/gi,
    /\byour\b/gi,
    /\byours\b/gi,
    /\byourself\b/gi,
    /\byou're\b/gi,
    /\byou've\b/gi,
    /\byou'll\b/gi,
    /\byou'd\b/gi,
  ]

  return indicators.reduce((count, pattern) => {
    const matches = text.match(pattern)
    return count + (matches ? matches.length : 0)
  }, 0)
}
