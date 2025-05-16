import type { Message, RelationshipDynamics, Person } from "./types"

// Interface for keyword analysis results
interface KeywordAnalysisResult {
  criticism: string[]
  defensiveness: string[]
  contempt: string[]
  stonewalling: string[]
  emotional_awareness: string[]
  repair_attempts: string[]
  positive_communication: string[]
}

// Interface for sentiment scores
interface SentimentScores {
  criticism: number
  defensiveness: number
  contempt: number
  stonewalling: number
  emotional_awareness: number
  repair_attempts: number
  positive_communication: number
}

/**
 * Analyzes relationship dynamics using rule-based methods
 * @param messages Array of messages between two people
 * @param person1 First person in the conversation
 * @param person2 Second person in the conversation
 * @returns RelationshipDynamics object with analysis results
 */
export function analyzeRelationshipDynamicsRuleBased(
  messages: Message[],
  person1: Person,
  person2: Person,
): RelationshipDynamics {
  // Default relationship dynamics
  const dynamics: RelationshipDynamics = {
    powerDynamic: 0.5, // Equal power (0 = person1 dominant, 1 = person2 dominant)
    conflictResolutionStyle: "collaborative", // Default to collaborative
    attachmentStyle: {
      person1: "secure",
      person2: "secure",
    },
    intimacyLevel: 0.5, // Moderate intimacy
    supportLevel: 0.5, // Moderate support
    reciprocity: 0.5, // Equal give and take
    trustLevel: 0.7, // Moderate to high trust
    respectLevel: 0.7, // Moderate to high respect
    overallHealth: 0.6, // Moderately healthy
    areas: {
      strengths: [],
      improvements: [],
    },
  }

  if (!messages || messages.length === 0) {
    return dynamics
  }

  // Count messages by each person
  const person1Messages = messages.filter((m) => m.sender === person1.name)
  const person2Messages = messages.filter((m) => m.sender === person2.name)

  // Calculate message length statistics
  const person1TotalLength = person1Messages.reduce((sum, m) => sum + m.content.length, 0)
  const person2TotalLength = person2Messages.reduce((sum, m) => sum + m.content.length, 0)

  // Analyze power dynamics based on message frequency and length
  if (person1Messages.length > 0 && person2Messages.length > 0) {
    // Power dynamic based on message count and length
    const messageCountRatio = person1Messages.length / (person1Messages.length + person2Messages.length)
    const messageLengthRatio = person1TotalLength / (person1TotalLength + person2TotalLength)

    // Combine the ratios (weighted average)
    dynamics.powerDynamic = messageCountRatio * 0.4 + messageLengthRatio * 0.6
  }

  // Analyze conflict resolution style
  const conflictKeywords = {
    collaborative: ["understand", "compromise", "together", "both", "agree", "solution"],
    competitive: ["win", "right", "wrong", "prove", "better", "best"],
    avoidant: ["whatever", "fine", "nevermind", "forget it", "doesn't matter"],
    accommodating: ["sorry", "my fault", "you're right", "i apologize"],
  }

  // Count occurrences of conflict resolution keywords
  const styleCounts = {
    collaborative: 0,
    competitive: 0,
    avoidant: 0,
    accommodating: 0,
  }

  // Simple keyword matching for conflict resolution style
  messages.forEach((message) => {
    const lowerContent = message.content.toLowerCase()

    Object.entries(conflictKeywords).forEach(([style, keywords]) => {
      keywords.forEach((keyword) => {
        if (lowerContent.includes(keyword)) {
          styleCounts[style as keyof typeof styleCounts]++
        }
      })
    })
  })

  // Determine dominant conflict resolution style
  let maxCount = 0
  let dominantStyle = "collaborative"

  Object.entries(styleCounts).forEach(([style, count]) => {
    if (count > maxCount) {
      maxCount = count
      dominantStyle = style
    }
  })

  dynamics.conflictResolutionStyle = dominantStyle

  // Analyze attachment styles based on message patterns
  const person1Attachment = analyzeAttachmentStyle(person1Messages)
  const person2Attachment = analyzeAttachmentStyle(person2Messages)

  dynamics.attachmentStyle = {
    person1: person1Attachment,
    person2: person2Attachment,
  }

  // Analyze intimacy level based on personal disclosure and emotional language
  const intimacyKeywords = ["feel", "love", "care", "miss", "need you", "trust", "close"]
  let intimacyScore = 0

  messages.forEach((message) => {
    const lowerContent = message.content.toLowerCase()
    intimacyKeywords.forEach((keyword) => {
      if (lowerContent.includes(keyword)) {
        intimacyScore++
      }
    })
  })

  // Normalize intimacy score (0-1)
  dynamics.intimacyLevel = Math.min(1, intimacyScore / (messages.length * 0.3))

  // Analyze support level
  const supportKeywords = ["help", "support", "there for you", "understand", "listen"]
  let supportScore = 0

  messages.forEach((message) => {
    const lowerContent = message.content.toLowerCase()
    supportKeywords.forEach((keyword) => {
      if (lowerContent.includes(keyword)) {
        supportScore++
      }
    })
  })

  // Normalize support score (0-1)
  dynamics.supportLevel = Math.min(1, supportScore / (messages.length * 0.2))

  // Analyze reciprocity (balance in conversation)
  if (person1Messages.length > 0 && person2Messages.length > 0) {
    const responseRatio =
      Math.min(person1Messages.length, person2Messages.length) /
      Math.max(person1Messages.length, person2Messages.length)
    dynamics.reciprocity = responseRatio
  }

  // Calculate overall relationship health
  dynamics.overallHealth =
    dynamics.intimacyLevel * 0.2 +
    dynamics.supportLevel * 0.2 +
    dynamics.reciprocity * 0.2 +
    dynamics.trustLevel * 0.2 +
    dynamics.respectLevel * 0.2

  // Identify strengths and areas for improvement
  identifyStrengthsAndImprovements(dynamics)

  return dynamics
}

/**
 * Analyzes attachment style based on message patterns
 * @param messages Array of messages from a person
 * @returns Attachment style as a string
 */
function analyzeAttachmentStyle(messages: Message[]): string {
  if (!messages || messages.length === 0) {
    return "secure"
  }

  // Keywords associated with different attachment styles
  const attachmentKeywords = {
    secure: ["trust", "comfortable", "support", "together", "understand"],
    anxious: ["worry", "afraid", "need", "miss", "alone", "always"],
    avoidant: ["space", "independent", "fine", "busy", "later", "time"],
    disorganized: ["confused", "hurt", "angry", "love", "hate"],
  }

  // Count occurrences of attachment style keywords
  const styleCounts = {
    secure: 0,
    anxious: 0,
    avoidant: 0,
    disorganized: 0,
  }

  // Simple keyword matching for attachment style
  messages.forEach((message) => {
    const lowerContent = message.content.toLowerCase()

    Object.entries(attachmentKeywords).forEach(([style, keywords]) => {
      keywords.forEach((keyword) => {
        if (lowerContent.includes(keyword)) {
          styleCounts[style as keyof typeof styleCounts]++
        }
      })
    })
  })

  // Determine dominant attachment style
  let maxCount = 0
  let dominantStyle = "secure"

  Object.entries(styleCounts).forEach(([style, count]) => {
    if (count > maxCount) {
      maxCount = count
      dominantStyle = style
    }
  })

  return dominantStyle
}

/**
 * Identifies strengths and areas for improvement in the relationship
 * @param dynamics RelationshipDynamics object
 */
function identifyStrengthsAndImprovements(dynamics: RelationshipDynamics): void {
  dynamics.areas = {
    strengths: [],
    improvements: [],
  }

  // Identify strengths
  if (dynamics.intimacyLevel > 0.7) {
    dynamics.areas.strengths.push("Strong emotional intimacy")
  }

  if (dynamics.supportLevel > 0.7) {
    dynamics.areas.strengths.push("High level of mutual support")
  }

  if (dynamics.reciprocity > 0.8) {
    dynamics.areas.strengths.push("Balanced give and take in the relationship")
  }

  if (dynamics.trustLevel > 0.8) {
    dynamics.areas.strengths.push("Strong foundation of trust")
  }

  if (dynamics.respectLevel > 0.8) {
    dynamics.areas.strengths.push("High level of mutual respect")
  }

  if (dynamics.powerDynamic > 0.4 && dynamics.powerDynamic < 0.6) {
    dynamics.areas.strengths.push("Balanced power dynamic")
  }

  if (dynamics.conflictResolutionStyle === "collaborative") {
    dynamics.areas.strengths.push("Healthy collaborative approach to resolving conflicts")
  }

  // Identify areas for improvement
  if (dynamics.intimacyLevel < 0.4) {
    dynamics.areas.improvements.push("Could benefit from more emotional sharing and vulnerability")
  }

  if (dynamics.supportLevel < 0.4) {
    dynamics.areas.improvements.push("Could improve mutual support during difficult times")
  }

  if (dynamics.reciprocity < 0.4) {
    dynamics.areas.improvements.push("More balanced give and take would strengthen the relationship")
  }

  if (dynamics.trustLevel < 0.5) {
    dynamics.areas.improvements.push("Building more trust would improve relationship security")
  }

  if (dynamics.respectLevel < 0.5) {
    dynamics.areas.improvements.push("Showing more respect for each other's perspectives would help")
  }

  if (dynamics.powerDynamic < 0.3 || dynamics.powerDynamic > 0.7) {
    dynamics.areas.improvements.push("Working toward a more balanced power dynamic")
  }

  if (dynamics.conflictResolutionStyle === "avoidant") {
    dynamics.areas.improvements.push("Addressing conflicts directly rather than avoiding them")
  } else if (dynamics.conflictResolutionStyle === "competitive") {
    dynamics.areas.improvements.push("Focusing on mutual solutions rather than winning arguments")
  }

  // Ensure we have at least one strength and one improvement
  if (dynamics.areas.strengths.length === 0) {
    dynamics.areas.strengths.push("Communication effort from both parties")
  }

  if (dynamics.areas.improvements.length === 0) {
    dynamics.areas.improvements.push("Continue building on current relationship patterns")
  }
}

/**
 * Analyzes text for specific keywords and returns matches categorized by type
 * @param texts Array of text strings to analyze
 * @returns Object containing arrays of matched keywords by category
 */
export function analyzeKeywords(texts: string[]): KeywordAnalysisResult {
  // Initialize result object
  const result: KeywordAnalysisResult = {
    criticism: [],
    defensiveness: [],
    contempt: [],
    stonewalling: [],
    emotional_awareness: [],
    repair_attempts: [],
    positive_communication: [],
  }

  // Define keyword patterns for each category
  const patterns = {
    criticism: [
      /you always/i,
      /you never/i,
      /why do you/i,
      /what's wrong with you/i,
      /you're so/i,
      /you should/i,
      /you shouldn't/i,
    ],
    defensiveness: [
      /not my fault/i,
      /that's not true/i,
      /i didn't/i,
      /you were the one/i,
      /you started/i,
      /don't blame me/i,
      /it wasn't me/i,
    ],
    contempt: [
      /whatever/i,
      /pathetic/i,
      /ridiculous/i,
      /stupid/i,
      /idiot/i,
      /eye roll/i,
      /rolling my eyes/i,
      /you're crazy/i,
    ],
    stonewalling: [
      /^k$/i,
      /^fine$/i,
      /^whatever$/i,
      /^ok$/i,
      /^sure$/i,
      /not talking about this/i,
      /don't want to discuss/i,
    ],
    emotional_awareness: [
      /i feel/i,
      /i'm feeling/i,
      /i am feeling/i,
      /makes me feel/i,
      /i'm sad/i,
      /i'm happy/i,
      /i'm angry/i,
      /i'm upset/i,
    ],
    repair_attempts: [
      /i'm sorry/i,
      /sorry about/i,
      /let's try/i,
      /can we/i,
      /i understand/i,
      /i see your point/i,
      /you're right/i,
    ],
    positive_communication: [
      /thank you/i,
      /appreciate/i,
      /love you/i,
      /care about/i,
      /you're amazing/i,
      /you're great/i,
      /miss you/i,
    ],
  }

  // Analyze each text
  texts.forEach((text) => {
    // Check for patterns in each category
    Object.entries(patterns).forEach(([category, categoryPatterns]) => {
      categoryPatterns.forEach((pattern) => {
        if (pattern.test(text)) {
          // Extract the matched text
          const match = text.match(pattern)?.[0] || ""

          // Add to results if not already included
          const categoryArray = result[category as keyof KeywordAnalysisResult]
          if (!categoryArray.includes(match)) {
            categoryArray.push(match)
          }
        }
      })
    })
  })

  return result
}

/**
 * Calculates sentiment scores based on keyword analysis results
 * @param keywordResults Results from keyword analysis
 * @returns Object containing normalized scores for each category
 */
export function calculateSentimentScore(keywordResults: KeywordAnalysisResult): SentimentScores {
  // Initialize scores
  const scores: SentimentScores = {
    criticism: 0,
    defensiveness: 0,
    contempt: 0,
    stonewalling: 0,
    emotional_awareness: 0,
    repair_attempts: 0,
    positive_communication: 0,
  }

  // Calculate raw scores based on keyword matches
  Object.keys(keywordResults).forEach((category) => {
    const matches = keywordResults[category as keyof KeywordAnalysisResult]
    const matchCount = matches.length

    // Different categories have different weights
    let weight = 0.2

    // Contempt is particularly damaging, so weight it higher
    if (category === "contempt") {
      weight = 0.3
    }
    // Repair attempts are particularly positive, so weight them higher
    else if (category === "repair_attempts") {
      weight = 0.25
    }

    // Calculate score based on match count and weight
    scores[category as keyof SentimentScores] = Math.min(1, matchCount * weight)
  })

  return scores
}

/**
 * Analyzes messages for sentiment using rule-based approach
 * @param messages Array of message objects to analyze
 * @returns Object containing sentiment scores and insights
 */
export function analyzeMessageSentiment(messages: Message[]): SentimentScores {
  // Extract message content
  const messageContents = messages.map((m) => m.content)

  // Analyze keywords
  const keywordResults = analyzeKeywords(messageContents)

  // Calculate sentiment scores
  const scores = calculateSentimentScore(keywordResults)

  // Analyze message sequence for context
  const contextScores = analyzeMessageSequence(messages)

  // Combine base scores with context scores
  const combinedScores: SentimentScores = {
    criticism: normalizeScore(scores.criticism + contextScores.criticism),
    defensiveness: normalizeScore(scores.defensiveness + contextScores.defensiveness),
    contempt: normalizeScore(scores.contempt + contextScores.contempt),
    stonewalling: normalizeScore(scores.stonewalling + contextScores.stonewalling),
    emotional_awareness: normalizeScore(scores.emotional_awareness + contextScores.emotional_awareness),
    repair_attempts: normalizeScore(scores.repair_attempts + contextScores.repair_attempts),
    positive_communication: normalizeScore(scores.positive_communication + contextScores.positive_communication),
  }

  return combinedScores
}

/**
 * Analyzes message sequence for contextual patterns
 * @param messages Array of message objects to analyze
 * @returns Object containing context-based scores for each category
 */
function analyzeMessageSequence(messages: Message[]): SentimentScores {
  // Initialize scores
  const scores: SentimentScores = {
    criticism: 0,
    defensiveness: 0,
    contempt: 0,
    stonewalling: 0,
    emotional_awareness: 0,
    repair_attempts: 0,
    positive_communication: 0,
  }

  // Look for patterns in message sequence
  for (let i = 1; i < messages.length; i++) {
    const prevMsg = messages[i - 1].content.toLowerCase()
    const currMsg = messages[i].content.toLowerCase()

    // Check for criticism followed by defensiveness
    if (
      (prevMsg.includes("you always") || prevMsg.includes("you never")) &&
      (currMsg.includes("not my fault") || currMsg.includes("that's not true"))
    ) {
      scores.criticism += 0.1
      scores.defensiveness += 0.2
    }

    // Check for stonewalling after emotional messages
    if (
      prevMsg.length > 100 &&
      (prevMsg.includes("feel") || prevMsg.includes("upset")) &&
      (currMsg.length < 20 || currMsg.includes("whatever") || currMsg.includes("fine"))
    ) {
      scores.stonewalling += 0.2
    }

    // Check for repair attempts after conflict
    if (
      (prevMsg.includes("upset") || prevMsg.includes("angry")) &&
      (currMsg.includes("sorry") || currMsg.includes("understand"))
    ) {
      scores.repair_attempts += 0.2
      scores.positive_communication += 0.1
    }

    // Check for emotional awareness
    if (currMsg.includes("i feel") || currMsg.includes("i'm feeling") || currMsg.includes("makes me feel")) {
      scores.emotional_awareness += 0.15
    }
  }

  return scores
}

/**
 * Normalizes a score to ensure it's between 0 and 1
 * @param score Score to normalize
 * @returns Normalized score between 0 and 1
 */
function normalizeScore(score: number): number {
  return Math.max(0, Math.min(1, score))
}
