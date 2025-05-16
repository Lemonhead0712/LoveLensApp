import type { Message, RelationshipDynamics, Person } from "./types"

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
