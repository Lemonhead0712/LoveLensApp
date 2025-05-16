import type { Message } from "./types"

// Interface for attachment style analysis result
interface AttachmentStyleAnalysis {
  primaryStyle: "secure" | "anxious" | "avoidant" | "disorganized"
  confidence: number
  secondaryStyle?: "secure" | "anxious" | "avoidant" | "disorganized"
  explanation: string
  limitedDataWarning?: string
}

// Enhanced attachment style analysis with better handling of edge cases
export function analyzeAttachmentStyle(messages: Message[]): AttachmentStyleAnalysis {
  // Handle edge case: very short conversations
  if (messages.length < 5) {
    return {
      primaryStyle: "secure", // Default to secure as the safest assumption
      confidence: 0.3, // Low confidence due to limited data
      explanation: "Based on the limited conversation data available.",
      limitedDataWarning:
        "This analysis is based on very limited data and should be considered preliminary. More conversation data would provide a more accurate assessment.",
    }
  }

  // Extract message content for analysis
  const messageContents = messages.map((m) => m.content)
  const combinedText = messageContents.join(" ").toLowerCase()

  // Count messages per sender to check for balance
  const person1Messages = messages.filter((m) => m.sender === "person1").length
  const person2Messages = messages.filter((m) => m.sender === "person2").length
  const messageRatio = Math.min(person1Messages, person2Messages) / Math.max(person1Messages, person2Messages)

  // If the conversation is very unbalanced, reduce confidence
  let confidenceModifier = 1.0
  if (messageRatio < 0.3) {
    confidenceModifier = 0.7
  }

  // Check for anxious attachment indicators
  const anxiousIndicators = [
    { pattern: /worry (you|about you|that you)/i, weight: 0.2 },
    { pattern: /need (reassurance|to know)/i, weight: 0.2 },
    { pattern: /afraid (of losing|you don't)/i, weight: 0.3 },
    { pattern: /why (haven't you|didn't you) (text|call|respond)/i, weight: 0.3 },
    { pattern: /do you still (love|care)/i, weight: 0.2 },
    { pattern: /feel (abandoned|ignored|neglected)/i, weight: 0.3 },
  ]

  // Check for avoidant attachment indicators
  const avoidantIndicators = [
    { pattern: /need (space|time|distance)/i, weight: 0.2 },
    { pattern: /too (intense|much|close)/i, weight: 0.2 },
    { pattern: /overwhelm(ed|ing)/i, weight: 0.2 },
    { pattern: /(can't|cannot) talk about this/i, weight: 0.3 },
    { pattern: /not ready (for|to)/i, weight: 0.2 },
    { pattern: /stop (pressuring|pushing)/i, weight: 0.3 },
  ]

  // Check for secure attachment indicators
  const secureIndicators = [
    { pattern: /understand (your|how you)/i, weight: 0.2 },
    { pattern: /appreciate (you|your)/i, weight: 0.2 },
    { pattern: /talk about (our|this)/i, weight: 0.2 },
    { pattern: /feel (safe|comfortable)/i, weight: 0.2 },
    { pattern: /trust (you|your)/i, weight: 0.2 },
    { pattern: /here for you/i, weight: 0.2 },
  ]

  // Check for disorganized attachment indicators
  const disorganizedIndicators = [
    { pattern: /love you but (hate|can't stand)/i, weight: 0.3 },
    { pattern: /need you but (afraid|scared)/i, weight: 0.3 },
    { pattern: /want to (be close|connect) but (can't|afraid)/i, weight: 0.3 },
    { pattern: /push away.*then regret/i, weight: 0.3 },
    { pattern: /trust issues/i, weight: 0.2 },
    { pattern: /confus(ed|ing) feelings/i, weight: 0.2 },
  ]

  // Calculate scores for each attachment style
  let anxiousScore = 0
  let avoidantScore = 0
  let secureScore = 0
  let disorganizedScore = 0

  // Process each message for indicators
  for (const message of messages) {
    const content = message.content.toLowerCase()

    // Check for anxious indicators
    for (const indicator of anxiousIndicators) {
      if (indicator.pattern.test(content)) {
        anxiousScore += indicator.weight
      }
    }

    // Check for avoidant indicators
    for (const indicator of avoidantIndicators) {
      if (indicator.pattern.test(content)) {
        avoidantScore += indicator.weight
      }
    }

    // Check for secure indicators
    for (const indicator of secureIndicators) {
      if (indicator.pattern.test(content)) {
        secureScore += indicator.weight
      }
    }

    // Check for disorganized indicators
    for (const indicator of disorganizedIndicators) {
      if (indicator.pattern.test(content)) {
        disorganizedScore += indicator.weight
      }
    }
  }

  // Apply confidence modifier
  anxiousScore *= confidenceModifier
  avoidantScore *= confidenceModifier
  secureScore *= confidenceModifier
  disorganizedScore *= confidenceModifier

  // Determine primary and secondary styles
  const scores = [
    { style: "anxious", score: anxiousScore },
    { style: "avoidant", score: avoidantScore },
    { style: "secure", score: secureScore },
    { style: "disorganized", score: disorganizedScore },
  ]

  // Sort by score in descending order
  scores.sort((a, b) => b.score - a.score)

  // Calculate confidence based on the difference between top scores
  // If the top two scores are close, confidence is lower
  const topScoreDifference = scores[0].score - scores[1].score
  const confidence = Math.min(0.9, Math.max(0.4, 0.6 + topScoreDifference))

  // Generate explanation
  let explanation = `Based on the conversation analysis, there are indicators of ${scores[0].style} attachment style`

  // Add secondary style if the scores are close
  let secondaryStyle = undefined
  if (topScoreDifference < 0.3 && scores[1].score > 0.3) {
    explanation += ` with elements of ${scores[1].style} attachment`
    secondaryStyle = scores[1].style as "secure" | "anxious" | "avoidant" | "disorganized"
  }

  // Add limited data warning if appropriate
  let limitedDataWarning = undefined
  if (messages.length < 10) {
    limitedDataWarning =
      "This analysis is based on limited data and should be considered preliminary. More conversation data would provide a more accurate assessment."
  }

  return {
    primaryStyle: scores[0].style as "secure" | "anxious" | "avoidant" | "disorganized",
    confidence: confidence,
    secondaryStyle,
    explanation,
    limitedDataWarning,
  }
}

// Interface for communication style analysis result
interface CommunicationStyleAnalysis {
  dominantStyle: string
  confidence: number
  secondaryStyle?: string
  explanation: string
  limitedDataWarning?: string
}

// Enhanced communication style analysis with better handling of edge cases
export function analyzeCommunicationStyle(messages: Message[]): CommunicationStyleAnalysis {
  // Handle edge case: very short conversations
  if (messages.length < 5) {
    return {
      dominantStyle: "balanced",
      confidence: 0.3,
      explanation: "Based on the limited conversation data available.",
      limitedDataWarning:
        "This analysis is based on very limited data and should be considered preliminary. More conversation data would provide a more accurate assessment.",
    }
  }

  // Extract messages for each person
  const person1Messages = messages.filter((m) => m.sender === "person1").map((m) => m.content)
  const person2Messages = messages.filter((m) => m.sender === "person2").map((m) => m.content)

  // Calculate average message length for each person
  const avgLength1 = person1Messages.reduce((sum, msg) => sum + msg.length, 0) / person1Messages.length
  const avgLength2 = person2Messages.reduce((sum, msg) => sum + msg.length, 0) / person2Messages.length

  // Calculate message frequency (messages per person)
  const frequency1 = person1Messages.length
  const frequency2 = person2Messages.length

  // Calculate question frequency
  const questionCount1 = person1Messages.filter((msg) => msg.includes("?")).length
  const questionCount2 = person2Messages.filter((msg) => msg.includes("?")).length

  // Calculate directive language frequency (commands, imperatives)
  const directivePatterns = [/you should/i, /you need to/i, /do this/i, /don't do/i]
  const directiveCount1 = countPatternMatches(person1Messages, directivePatterns)
  const directiveCount2 = countPatternMatches(person2Messages, directivePatterns)

  // Calculate emotional language frequency
  const emotionalPatterns = [/feel/i, /emotion/i, /happy/i, /sad/i, /angry/i, /upset/i]
  const emotionalCount1 = countPatternMatches(person1Messages, emotionalPatterns)
  const emotionalCount2 = countPatternMatches(person2Messages, emotionalPatterns)

  // Calculate analytical language frequency
  const analyticalPatterns = [/think/i, /believe/i, /analyze/i, /consider/i, /logic/i]
  const analyticalCount1 = countPatternMatches(person1Messages, analyticalPatterns)
  const analyticalCount2 = countPatternMatches(person2Messages, analyticalPatterns)

  // Calculate scores for different communication styles
  const styles = {
    assertive: calculateAssertiveScore(frequency1, directiveCount1, avgLength1),
    passive: calculatePassiveScore(frequency1, questionCount1, avgLength1),
    aggressive: calculateAggressiveScore(directiveCount1, emotionalCount1),
    analytical: calculateAnalyticalScore(analyticalCount1, emotionalCount1),
    emotional: calculateEmotionalScore(emotionalCount1, analyticalCount1),
    balanced: calculateBalancedScore(frequency1, questionCount1, directiveCount1, emotionalCount1, analyticalCount1),
  }

  // Sort styles by score
  const sortedStyles = Object.entries(styles).sort((a, b) => b[1] - a[1])

  // Calculate confidence based on the difference between top scores
  const topScoreDifference = sortedStyles[0][1] - sortedStyles[1][1]
  const confidence = Math.min(0.9, Math.max(0.4, 0.6 + topScoreDifference))

  // Generate explanation
  let explanation = `Based on the conversation analysis, the dominant communication style is ${sortedStyles[0][0]}`

  // Add secondary style if the scores are close
  let secondaryStyle = undefined
  if (topScoreDifference < 0.2) {
    explanation += ` with elements of ${sortedStyles[1][0]}`
    secondaryStyle = sortedStyles[1][0]
  }

  // Add limited data warning if appropriate
  let limitedDataWarning = undefined
  if (messages.length < 10) {
    limitedDataWarning =
      "This analysis is based on limited data and should be considered preliminary. More conversation data would provide a more accurate assessment."
  }

  return {
    dominantStyle: sortedStyles[0][0],
    confidence,
    secondaryStyle,
    explanation,
    limitedDataWarning,
  }
}

// Helper function to count pattern matches in messages
function countPatternMatches(messages: string[], patterns: RegExp[]): number {
  let count = 0
  for (const message of messages) {
    for (const pattern of patterns) {
      if (pattern.test(message)) {
        count++
        break // Count each message only once per pattern category
      }
    }
  }
  return count
}

// Helper functions to calculate scores for different communication styles
function calculateAssertiveScore(frequency: number, directiveCount: number, avgLength: number): number {
  // Assertive communication has moderate directives and moderate to high message length
  return normalizeScore((directiveCount / Math.max(1, frequency)) * 0.5 + (avgLength / 100) * 0.5)
}

function calculatePassiveScore(frequency: number, questionCount: number, avgLength: number): number {
  // Passive communication has high questions and low to moderate message length
  return normalizeScore((questionCount / Math.max(1, frequency)) * 0.7 + (1 - avgLength / 200) * 0.3)
}

function calculateAggressiveScore(directiveCount: number, emotionalCount: number): number {
  // Aggressive communication has high directives and moderate to high emotional content
  return normalizeScore(directiveCount * 0.7 + emotionalCount * 0.3)
}

function calculateAnalyticalScore(analyticalCount: number, emotionalCount: number): number {
  // Analytical communication has high analytical content and low emotional content
  return normalizeScore(analyticalCount * 0.7 + (1 - emotionalCount / 10) * 0.3)
}

function calculateEmotionalScore(emotionalCount: number, analyticalCount: number): number {
  // Emotional communication has high emotional content and low to moderate analytical content
  return normalizeScore(emotionalCount * 0.7 + (1 - analyticalCount / 10) * 0.3)
}

function calculateBalancedScore(
  frequency: number,
  questionCount: number,
  directiveCount: number,
  emotionalCount: number,
  analyticalCount: number,
): number {
  // Balanced communication has moderate levels of all indicators
  const questionRatio = questionCount / Math.max(1, frequency)
  const directiveRatio = directiveCount / Math.max(1, frequency)
  const emotionalRatio = emotionalCount / Math.max(1, frequency)
  const analyticalRatio = analyticalCount / Math.max(1, frequency)

  // Calculate how close each ratio is to a "balanced" value (around 0.3-0.4)
  const balancedValue = 0.35
  const questionBalance = 1 - Math.abs(questionRatio - balancedValue)
  const directiveBalance = 1 - Math.abs(directiveRatio - balancedValue)
  const emotionalBalance = 1 - Math.abs(emotionalRatio - balancedValue)
  const analyticalBalance = 1 - Math.abs(analyticalRatio - balancedValue)

  // Average the balance scores
  return normalizeScore((questionBalance + directiveBalance + emotionalBalance + analyticalBalance) / 4)
}

// Helper function to normalize scores between 0 and 1
function normalizeScore(score: number): number {
  return Math.max(0, Math.min(1, score))
}
