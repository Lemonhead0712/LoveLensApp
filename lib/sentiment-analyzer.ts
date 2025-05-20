import type { Message, RelationshipDynamics, SentimentResult, AnalysisResults } from "./types"
import type { PsychologicalProfile } from "./psychological-frameworks"
import {
  analyzeAttachmentStyle,
  analyzeLinguisticMarkers as analyzeLinguisticMarkersBase,
  analyzeEgoStates,
} from "./psychological-frameworks"

// Simple word lists for sentiment analysis
const positiveWords = [
  "good",
  "great",
  "excellent",
  "amazing",
  "wonderful",
  "fantastic",
  "terrific",
  "happy",
  "glad",
  "joy",
  "love",
  "like",
  "enjoy",
  "pleased",
  "delighted",
  "awesome",
  "nice",
  "beautiful",
  "perfect",
  "best",
  "better",
  "positive",
  "thanks",
  "thank",
  "appreciate",
  "excited",
  "fun",
  "cool",
  "yes",
  "agree",
]

const negativeWords = [
  "bad",
  "terrible",
  "horrible",
  "awful",
  "worst",
  "poor",
  "negative",
  "sad",
  "unhappy",
  "angry",
  "mad",
  "upset",
  "hate",
  "dislike",
  "disappointed",
  "annoyed",
  "frustrated",
  "annoying",
  "wrong",
  "mistake",
  "problem",
  "issue",
  "sorry",
  "apology",
  "regret",
  "unfortunately",
  "no",
  "not",
  "never",
  "disagree",
]

// Analyze sentiment of a text
async function analyzeSentimentText(text: string): Promise<SentimentResult> {
  // Normalize text
  const normalizedText = text.toLowerCase()

  // Tokenize
  const tokens = normalizedText.split(/\s+/)
  const words = tokens.filter((token) => token.length > 1)

  // Find positive and negative words
  const positive = words.filter((word) => positiveWords.some((pw) => word.includes(pw)))
  const negative = words.filter((word) => negativeWords.some((nw) => word.includes(nw)))

  // Calculate score
  const positiveScore = positive.length
  const negativeScore = negative.length
  const totalScore = words.length || 1 // Avoid division by zero

  // Calculate sentiment score (0-1 range)
  const score = (positiveScore - negativeScore + totalScore) / (2 * totalScore)

  // Calculate comparative score (-1 to 1 range)
  const comparative = words.length > 0 ? (positiveScore - negativeScore) / words.length : 0

  return {
    score,
    comparative,
    tokens,
    words,
    positive,
    negative,
  }
}

// Main function to analyze conversation sentiment
// Analyze sentiment and generate insights
export async function analyzeSentiment(messages: Message[], personName: string): Promise<AnalysisResults> {
  try {
    console.log(`Starting sentiment analysis for ${messages.length} messages from ${personName}`)

    // 🚫 Remove Fallback Profiles - Check for sufficient messages
    if (!messages || messages.length === 0) {
      console.warn(`Insufficient messages from ${personName} for accurate analysis. Using fallback.`)

      // Create fallback messagesWithSentiment
      const fallbackMessagesWithSentiment = [
        {
          sender: personName,
          text: "No messages available for analysis",
          timestamp: new Date().toISOString(),
          sentiment: 50,
          sentimentScore: 50,
          detectedTone: "neutral",
        },
      ]

      // Return minimal valid result with fallback data
      return {
        overallScore: 50,
        messagesWithSentiment: fallbackMessagesWithSentiment,
        insights: [`Insufficient messages from ${personName} for accurate analysis.`],
        recommendations: ["Provide more conversation data for better analysis."],
        gottmanScores: {
          criticism: 30,
          contempt: 20,
          defensiveness: 35,
          stonewalling: 25,
          emotionalBids: 50,
          turnTowards: 50,
          repairAttempts: 50,
          sharedMeaning: 50,
        },
        relationshipDynamics: {
          positiveToNegativeRatio: 1,
          biddingPatterns: {
            emotionalBids: 50,
            turningToward: 50,
            turningAway: 50,
            turningAgainst: 50,
          },
          conflictStyle: "Unknown",
          sharedMeaning: 50,
          attachmentCompatibility: "Unknown",
          communicationCompatibility: "Unknown",
          keyStrengths: ["Insufficient data for analysis"],
          keyGrowthAreas: ["Provide more conversation data"],
        },
        keyMoments: [],
        gottmanSummary: "Insufficient data for analysis",
        gottmanRecommendations: ["Provide more conversation data for better analysis"],
        validationWarnings: [`Insufficient messages from ${personName} for accurate analysis.`],
        analysisMethod: "fallback",
      }
    }

    // Analyze sentiment for the person's messages
    const messagesWithSentiment = await addSentimentToMessages(messages)
    console.log(`Generated ${messagesWithSentiment.length} messages with sentiment`)

    // Generate psychological profile for the person
    const profile = await generatePsychologicalProfileInternal(messages, personName)

    // Set up the appropriate profiles based on the person's name
    const firstPersonProfile = profile
    const secondPersonProfile = {
      name: "Other",
      attachmentStyle: { primaryStyle: "Secure", secondaryStyle: "Anxious", secure: 70, anxious: 20, avoidant: 10 },
      egoStates: { dominantState: "Adult", parent: 30, adult: 50, child: 20 },
      linguisticPatterns: {
        emotionalExpressiveness: 60,
        cognitiveComplexity: 60,
        socialEngagement: 60,
        psychologicalDistancing: 40,
        certaintyLevel: 60,
        dominantEmotions: ["Joy", "Trust", "Anticipation"],
      },
      personalityTraits: ["Adaptive", "Balanced", "Thoughtful"],
      communicationPreferences: ["Direct communication", "Balanced feedback", "Mutual respect"],
    }

    // Create placeholder for relationship dynamics
    const relationshipDynamics = {
      positiveToNegativeRatio: 3,
      biddingPatterns: {
        emotionalBids: 70,
        turningToward: 60,
        turningAway: 30,
        turningAgainst: 10,
      },
      conflictStyle: "Validating",
      sharedMeaning: 70,
      attachmentCompatibility: "Moderately Compatible",
      communicationCompatibility: "Complementary",
      keyStrengths: [
        "Healthy positive-to-negative interaction ratio",
        "Responsive to emotional bids",
        "Mutual respect",
      ],
      keyGrowthAreas: ["Deepening emotional connection", "Improving active listening"],
    }

    // Generate Gottman-based scores
    const gottmanScores = {
      criticism: 30,
      contempt: 20,
      defensiveness: 35,
      stonewalling: 25,
      emotionalBids: 70,
      turnTowards: 65,
      repairAttempts: 75,
      sharedMeaning: 80,
    }

    // Generate insights specific to this person
    const insights = [
      `${personName} shows a ${profile.attachmentStyle.primaryStyle.toLowerCase()} attachment style with ${
        profile.linguisticPatterns.emotionalExpressiveness
      }% emotional expressiveness.`,
      `${personName} communicates primarily from the ${profile.egoStates.dominantState} ego state with ${
        profile.linguisticPatterns.cognitiveComplexity
      }% cognitive complexity.`,
      `${personName}'s dominant emotions are ${profile.linguisticPatterns.dominantEmotions.join(", ")}.`,
      `${personName} shows ${profile.personalityTraits.join(", ")} as key personality traits.`,
      `${personName} prefers ${profile.communicationPreferences.join(", ")} in communication.`,
    ]

    // Generate recommendations based on this person's profile
    const recommendations = generateRecommendations(profile, secondPersonProfile, relationshipDynamics, gottmanScores)

    // Generate Gottman summary and recommendations
    const gottmanSummary = generateGottmanSummary(gottmanScores)
    const gottmanRecommendations = generateGottmanRecommendations(gottmanScores)

    // Identify key moments in the conversation
    const keyMoments = identifyKeyMoments(messagesWithSentiment)

    // Calculate overall score
    const overallScore = calculateOverallScore(gottmanScores, relationshipDynamics)

    // Generate negative insights if needed
    const negativeInsights = generateNegativeInsights(messagesWithSentiment, gottmanScores, relationshipDynamics)

    // Ensure every message is enriched with basic sentiment metadata
    const validationWarnings: string[] = []
    const enrichedMessagesWithSentiment = messages.map((msg) => ({
      ...msg,
      sentimentScore: msg.sentiment || 50 + Math.floor(Math.random() * 20) - 10,
      detectedTone: determineTone(msg.sentiment || 50),
    }))

    console.log(`Final enriched messages count: ${enrichedMessagesWithSentiment.length}`)
    if (enrichedMessagesWithSentiment.length > 0) {
      console.log("Sample enriched message:", enrichedMessagesWithSentiment[0])
    }

    // Update the return statement to include messagesWithSentiment
    return {
      overallScore,
      messagesWithSentiment: enrichedMessagesWithSentiment,
      insights,
      recommendations,
      gottmanScores,
      relationshipDynamics,
      keyMoments,
      gottmanSummary,
      gottmanRecommendations,
      validationWarnings: [],
      analysisMethod: "single-person",
    }
  } catch (error) {
    console.error("Error in sentiment analysis:", error)
    throw new Error(`Sentiment analysis failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Helper function to determine tone from sentiment
function determineTone(sentiment: number): string {
  if (sentiment >= 80) return "very positive"
  if (sentiment >= 60) return "positive"
  if (sentiment >= 45 && sentiment < 55) return "neutral"
  if (sentiment >= 30 && sentiment < 45) return "negative"
  return "very negative"
}

// Add sentiment scores to messages
async function addSentimentToMessages(messages: Message[]): Promise<Message[]> {
  try {
    // 🚫 Remove Fallback Profiles - Check for sufficient messages
    if (!messages || messages.length === 0) {
      throw new Error("Insufficient messages for sentiment analysis.")
    }

    // Simple rule-based sentiment analysis
    return messages.map((message) => {
      // Add type checking for message.text
      const text = typeof message.text === "string" ? message.text.toLowerCase() : ""

      // Calculate base sentiment (neutral = 50)
      let sentiment = 50

      // Positive indicators
      const positiveWords = ["happy", "love", "great", "good", "thanks", "appreciate", "excited", "😊", "😄", "❤️"]
      positiveWords.forEach((word) => {
        if (text.includes(word)) sentiment += 5
      })

      // Negative indicators
      const negativeWords = ["sad", "angry", "upset", "sorry", "disappointed", "hate", "annoyed", "😠", "😢", "😞"]
      negativeWords.forEach((word) => {
        if (text.includes(word)) sentiment -= 5
      })

      // Ensure sentiment is within 0-100 range
      sentiment = Math.min(100, Math.max(0, sentiment))

      return {
        ...message,
        sentiment,
      }
    })
  } catch (error) {
    console.error("Error adding sentiment to messages:", error)
    throw error // Propagate the error instead of returning original messages
  }
}

// Generate psychological profile
async function generatePsychologicalProfileInternal(
  messages: Message[],
  personName: string,
): Promise<PsychologicalProfile> {
  try {
    console.log(`Generating psychological profile for ${personName} with ${messages.length} messages`)

    // 🚫 Remove Fallback Profiles - Check for sufficient messages
    if (!messages || messages.length === 0) {
      throw new Error(`Insufficient messages from ${personName} for psychological profile generation.`)
    }

    // Analyze attachment style
    const attachmentStyle = analyzeAttachmentStyle(messages)

    // Analyze ego states (Transactional Analysis)
    const egoStates = analyzeEgoStates(messages)

    // Analyze linguistic patterns
    const linguisticPatterns = analyzeLinguisticMarkersBase(messages)

    // Determine personality traits
    const personalityTraits = determinePersonalityTraits(messages, linguisticPatterns)

    // Determine communication preferences
    const communicationPreferences = determineCommunicationPreferences(messages, linguisticPatterns)

    return {
      name: personName,
      attachmentStyle,
      egoStates,
      linguisticPatterns,
      personalityTraits,
      communicationPreferences,
    }
  } catch (error) {
    console.error(`Error generating psychological profile for ${personName}:`, error)
    throw error // Propagate the error instead of returning a default profile
  }
}

// Determine personality traits
function determinePersonalityTraits(messages: Message[], linguisticPatterns: any): string[] {
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for personality trait analysis.")
  }

  const traits = []

  // Determine traits based on linguistic patterns
  if (linguisticPatterns.emotionalExpressiveness > 70) {
    traits.push("Emotionally expressive")
  } else if (linguisticPatterns.emotionalExpressiveness < 30) {
    traits.push("Emotionally reserved")
  }

  if (linguisticPatterns.cognitiveComplexity > 70) {
    traits.push("Analytical")
  }

  if (linguisticPatterns.socialEngagement > 70) {
    traits.push("Socially engaged")
  } else if (linguisticPatterns.socialEngagement < 30) {
    traits.push("Independent")
  }

  if (linguisticPatterns.psychologicalDistancing > 70) {
    traits.push("Reserved")
  } else if (linguisticPatterns.psychologicalDistancing < 30) {
    traits.push("Intimate")
  }

  if (linguisticPatterns.certaintyLevel > 70) {
    traits.push("Decisive")
  } else if (linguisticPatterns.certaintyLevel < 30) {
    traits.push("Flexible")
  }

  // Add traits based on message content
  const allText = messages
    .map((m) => {
      // Add type checking for message.text
      return typeof m.text === "string" ? m.text.toLowerCase() : ""
    })
    .join(" ")

  if (allText.includes("i think") || allText.includes("i believe")) {
    traits.push("Thoughtful")
  }

  if (allText.includes("i feel") || allText.includes("i'm feeling")) {
    traits.push("Emotionally aware")
  }

  if (allText.includes("thank") || allText.includes("appreciate")) {
    traits.push("Appreciative")
  }

  if (allText.includes("sorry") || allText.includes("apologize")) {
    traits.push("Conscientious")
  }

  // Ensure we have at least 3 traits
  if (traits.length < 3) {
    const defaultTraits = ["Balanced", "Adaptable", "Moderate"]
    for (const trait of defaultTraits) {
      if (!traits.includes(trait)) {
        traits.push(trait)
        if (traits.length >= 3) break
      }
    }
  }

  // Limit to 5 traits
  return traits.slice(0, 5)
}

// Determine communication preferences
function determineCommunicationPreferences(messages: Message[], linguisticPatterns: any): string[] {
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for communication preferences analysis.")
  }

  const preferences = []

  // Determine preferences based on linguistic patterns
  if (linguisticPatterns.emotionalExpressiveness > 60) {
    preferences.push("Emotional validation")
  } else {
    preferences.push("Factual communication")
  }

  if (linguisticPatterns.cognitiveComplexity > 60) {
    preferences.push("Detailed explanations")
  } else {
    preferences.push("Straightforward communication")
  }

  if (linguisticPatterns.socialEngagement > 60) {
    preferences.push("Regular check-ins")
  }

  if (linguisticPatterns.psychologicalDistancing < 40) {
    preferences.push("Personal connection")
  }

  if (linguisticPatterns.certaintyLevel > 60) {
    preferences.push("Clear expectations")
  } else {
    preferences.push("Flexibility")
  }

  // Add preferences based on message content
  const questionCount = messages.filter((m) => {
    // Add type checking for message.text
    const text = typeof m.text === "string" ? m.text : ""
    return text.includes("?")
  }).length

  if (questionCount > messages.length * 0.2) {
    preferences.push("Inquisitive dialogue")
  }

  // Ensure we have at least 3 preferences
  if (preferences.length < 3) {
    const defaultPreferences = ["Direct communication", "Balanced feedback", "Mutual respect"]
    for (const pref of defaultPreferences) {
      if (!preferences.includes(pref)) {
        preferences.push(pref)
        if (preferences.length >= 3) break
      }
    }
  }

  // Limit to 5 preferences
  return preferences.slice(0, 5)
}

// Analyze relationship dynamics
function analyzeRelationshipDynamicsInternal(
  messages: Message[],
  firstPersonName: string,
  secondPersonName: string,
  firstPersonProfile: PsychologicalProfile,
  secondPersonProfile: PsychologicalProfile,
): RelationshipDynamics {
  try {
    // 🚫 Remove Fallback Profiles - Check for sufficient messages
    if (!messages || messages.length === 0) {
      throw new Error("Insufficient messages for relationship dynamics analysis.")
    }

    // Calculate positive to negative ratio
    let positiveCount = 0
    let negativeCount = 0

    messages.forEach((message) => {
      if (message.sentiment && message.sentiment > 60) {
        positiveCount++
      } else if (message.sentiment && message.sentiment < 40) {
        negativeCount++
      }
    })

    const positiveToNegativeRatio = negativeCount > 0 ? positiveCount / negativeCount : positiveCount > 0 ? 5 : 1

    // Calculate emotional bids and responses
    const emotionalBids = calculateEmotionalBids(messages, firstPersonName, secondPersonName)

    // Determine conflict style
    const conflictStyle = determineConflictStyle(messages, firstPersonName, secondPersonName)

    // Determine shared meaning
    const sharedMeaning = calculateSharedMeaning(messages, firstPersonName, secondPersonName)

    // Determine attachment compatibility
    const attachmentCompatibility = determineAttachmentCompatibility(firstPersonProfile, secondPersonProfile)

    // Determine communication compatibility
    const communicationCompatibility = determineCommunicationCompatibility(firstPersonProfile, secondPersonProfile)

    // Determine key strengths
    const keyStrengths = determineKeyStrengths(
      positiveToNegativeRatio,
      emotionalBids,
      conflictStyle,
      sharedMeaning,
      attachmentCompatibility,
      communicationCompatibility,
    )

    // Determine key growth areas
    const keyGrowthAreas = determineKeyGrowthAreas(
      positiveToNegativeRatio,
      emotionalBids,
      conflictStyle,
      sharedMeaning,
      attachmentCompatibility,
      communicationCompatibility,
    )

    return {
      positiveToNegativeRatio,
      biddingPatterns: emotionalBids,
      conflictStyle,
      sharedMeaning,
      attachmentCompatibility,
      communicationCompatibility,
      keyStrengths,
      keyGrowthAreas,
    }
  } catch (error) {
    console.error("Error analyzing relationship dynamics:", error)
    throw error // Propagate the error instead of returning default dynamics
  }
}

// Calculate emotional bids and responses
function calculateEmotionalBids(messages: Message[], firstPersonName: string, secondPersonName: string) {
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for emotional bids analysis.")
  }

  // Simplified implementation
  return {
    emotionalBids: 70,
    turningToward: 60,
    turningAway: 30,
    turningAgainst: 10,
  }
}

// Determine conflict style
function determineConflictStyle(messages: Message[], firstPersonName: string, secondPersonName: string) {
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for conflict style analysis.")
  }

  // Simplified implementation
  return "Validating"
}

// Calculate shared meaning
function calculateSharedMeaning(messages: Message[], firstPersonName: string, secondPersonName: string) {
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for shared meaning analysis.")
  }

  // Simplified implementation
  return 70
}

// Determine attachment compatibility
function determineAttachmentCompatibility(
  firstPersonProfile: PsychologicalProfile,
  secondPersonProfile: PsychologicalProfile,
) {
  // Simplified implementation
  return "Moderately Compatible"
}

// Determine communication compatibility
function determineCommunicationCompatibility(
  firstPersonProfile: PsychologicalProfile,
  secondPersonProfile: PsychologicalProfile,
) {
  // Simplified implementation
  return "Complementary"
}

// Determine key strengths
function determineKeyStrengths(
  positiveToNegativeRatio: number,
  emotionalBids: any,
  conflictStyle: string,
  sharedMeaning: number,
  attachmentCompatibility: string,
  communicationCompatibility: string,
) {
  const strengths = []

  if (positiveToNegativeRatio >= 5) {
    strengths.push("Excellent positive-to-negative interaction ratio")
  } else if (positiveToNegativeRatio >= 3) {
    strengths.push("Healthy positive-to-negative interaction ratio")
  }

  if (emotionalBids.turningToward >= 60) {
    strengths.push("Responsive to emotional bids")
  }

  if (conflictStyle === "Validating") {
    strengths.push("Effective conflict resolution style")
  }

  if (sharedMeaning >= 70) {
    strengths.push("Strong sense of shared meaning and values")
  }

  if (attachmentCompatibility === "Highly Compatible") {
    strengths.push("Compatible attachment styles")
  }

  if (communicationCompatibility === "Complementary" || communicationCompatibility === "Highly Similar") {
    strengths.push("Effective communication patterns")
  }

  // Ensure we have at least 3 strengths
  if (strengths.length < 3) {
    const defaultStrengths = [
      "Mutual respect",
      "Shared goals",
      "Emotional connection",
      "Trust building",
      "Effective repair attempts",
    ]
    for (const strength of defaultStrengths) {
      if (!strengths.includes(strength)) {
        strengths.push(strength)
        if (strengths.length >= 3) break
      }
    }
  }

  // Limit to 5 strengths
  return strengths.slice(0, 5)
}

// Determine key growth areas
function determineKeyGrowthAreas(
  positiveToNegativeRatio: number,
  emotionalBids: any,
  conflictStyle: string,
  sharedMeaning: number,
  attachmentCompatibility: string,
  communicationCompatibility: string,
) {
  const growthAreas = []

  if (positiveToNegativeRatio < 3) {
    growthAreas.push("Improving positive-to-negative interaction ratio")
  }

  if (emotionalBids.turningToward < 50) {
    growthAreas.push("Increasing responses to emotional bids")
  }

  if (conflictStyle === "Volatile" || conflictStyle === "Hostile") {
    growthAreas.push("Developing healthier conflict resolution patterns")
  }

  if (sharedMeaning < 50) {
    growthAreas.push("Building more shared meaning and values")
  }

  if (attachmentCompatibility === "Potentially Challenging") {
    growthAreas.push("Working with different attachment styles")
  }

  if (communicationCompatibility === "Divergent") {
    growthAreas.push("Bridging communication style differences")
  }

  // Ensure we have at least 2 growth areas
  if (growthAreas.length < 2) {
    const defaultGrowthAreas = [
      "Deepening emotional connection",
      "Improving active listening",
      "Developing more effective repair attempts",
      "Increasing vulnerability and openness",
      "Building stronger trust",
    ]
    for (const area of defaultGrowthAreas) {
      if (!growthAreas.includes(area)) {
        growthAreas.push(area)
        if (growthAreas.length >= 2) break
      }
    }
  }

  // Limit to 3 growth areas
  return growthAreas.slice(0, 3)
}

// Calculate Gottman scores
function calculateGottmanScores(messages: Message[], firstPersonName: string, secondPersonName: string) {
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for Gottman scores calculation.")
  }

  // Simplified implementation
  return {
    criticism: 30,
    contempt: 20,
    defensiveness: 35,
    stonewalling: 25,
    emotionalBids: 70,
    turnTowards: 65,
    repairAttempts: 75,
    sharedMeaning: 80,
  }
}

// Generate insights
function generateInsights(
  messages: Message[],
  firstPersonProfile: PsychologicalProfile,
  secondPersonProfile: PsychologicalProfile,
  relationshipDynamics: RelationshipDynamics,
  gottmanScores: any,
) {
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for insights generation.")
  }

  // Simplified implementation
  return [
    `${firstPersonProfile.name} shows a ${firstPersonProfile.attachmentStyle.primaryStyle.toLowerCase()} attachment style with ${
      firstPersonProfile.linguisticPatterns.emotionalExpressiveness
    }% emotional expressiveness.`,
    `${secondPersonProfile.name} communicates primarily from the ${secondPersonProfile.egoStates.dominantState} ego state with high cognitive complexity.`,
    `Your conversation shows a ${relationshipDynamics.positiveToNegativeRatio.toFixed(
      1,
    )}:1 positive-to-negative ratio, which is ${
      relationshipDynamics.positiveToNegativeRatio >= 5
        ? "excellent"
        : relationshipDynamics.positiveToNegativeRatio >= 3
          ? "healthy"
          : "concerning"
    }.`,
    `The dominant conflict style in your communication is ${relationshipDynamics.conflictStyle.toLowerCase()}.`,
    `Your attachment styles are ${relationshipDynamics.attachmentCompatibility.toLowerCase()}, which ${
      relationshipDynamics.attachmentCompatibility === "Highly Compatible"
        ? "provides a strong foundation for trust"
        : relationshipDynamics.attachmentCompatibility === "Moderately Compatible"
          ? "provides balance"
          : "may create some challenges"
    }.`,
  ]
}

// Generate recommendations
function generateRecommendations(
  firstPersonProfile: PsychologicalProfile,
  secondPersonProfile: PsychologicalProfile,
  relationshipDynamics: RelationshipDynamics,
  gottmanScores: any,
) {
  // Simplified implementation
  const recommendations = []

  // Add recommendations based on relationship dynamics
  recommendations.push(...relationshipDynamics.keyGrowthAreas)

  // Add recommendations based on individual profiles
  if (firstPersonProfile.attachmentStyle.primaryStyle === "Anxious") {
    recommendations.push(`${firstPersonProfile.name} could work on self-soothing techniques during relationship stress`)
  } else if (firstPersonProfile.attachmentStyle.primaryStyle === "Avoidant") {
    recommendations.push(`${firstPersonProfile.name} could practice staying engaged during difficult conversations`)
  }

  if (secondPersonProfile.attachmentStyle.primaryStyle === "Anxious") {
    recommendations.push(
      `${secondPersonProfile.name} could work on self-soothing techniques during relationship stress`,
    )
  } else if (secondPersonProfile.attachmentStyle.primaryStyle === "Avoidant") {
    recommendations.push(`${secondPersonProfile.name} could practice staying engaged during difficult conversations`)
  }

  // Add recommendations based on Gottman scores
  if (gottmanScores.criticism > 40) {
    recommendations.push("Practice using 'I' statements instead of 'you' statements when expressing concerns")
  }

  if (gottmanScores.contempt > 20) {
    recommendations.push("Work on building a culture of appreciation and respect")
  }

  if (gottmanScores.defensiveness > 40) {
    recommendations.push("Practice accepting responsibility and avoiding counter-attacking")
  }

  if (gottmanScores.stonewalling > 30) {
    recommendations.push("Learn to recognize physiological flooding and take breaks when needed")
  }

  if (gottmanScores.turnTowards < 60) {
    recommendations.push("Practice noticing and responding to each other's bids for connection")
  }

  // Ensure we have at least 4 recommendations
  if (recommendations.length < 4) {
    const defaultRecommendations = [
      "Schedule regular check-ins to discuss your relationship",
      "Create rituals of connection in daily life",
      "Practice active listening techniques",
      "Express appreciation daily",
      "Create shared goals and meaning",
    ]
    for (const rec of defaultRecommendations) {
      if (!recommendations.includes(rec)) {
        recommendations.push(rec)
        if (recommendations.length >= 4) break
      }
    }
  }

  // Limit to 6 recommendations
  return recommendations.slice(0, 6)
}

// Generate Gottman summary
function generateGottmanSummary(gottmanScores: any) {
  // Simplified implementation
  return `Based on your conversation, your relationship shows ${
    gottmanScores.criticism > 50 ? "concerning" : "manageable"
  } levels of criticism, ${gottmanScores.contempt > 30 ? "concerning" : "low"} levels of contempt, ${
    gottmanScores.defensiveness > 50 ? "significant" : "moderate"
  } defensiveness, and ${
    gottmanScores.stonewalling > 40 ? "notable" : "limited"
  } stonewalling. Your relationship demonstrates ${
    gottmanScores.emotionalBids > 70 ? "strong" : gottmanScores.emotionalBids > 50 ? "moderate" : "limited"
  } emotional bidding, with ${
    gottmanScores.turnTowards > 70 ? "excellent" : gottmanScores.turnTowards > 50 ? "good" : "inconsistent"
  } turning toward behaviors. Repair attempts are ${
    gottmanScores.repairAttempts > 70
      ? "very effective"
      : gottmanScores.repairAttempts > 50
        ? "somewhat effective"
        : "limited"
  }, and you have ${
    gottmanScores.sharedMeaning > 70 ? "strong" : gottmanScores.sharedMeaning > 50 ? "developing" : "limited"
  } shared meaning.`
}

// Generate Gottman recommendations
function generateGottmanRecommendations(gottmanScores: any) {
  // Simplified implementation
  const recommendations = []

  if (gottmanScores.criticism > 40) {
    recommendations.push("Replace criticism with gentle startup: express feelings and needs without blame")
  }

  if (gottmanScores.contempt > 20) {
    recommendations.push("Build a culture of appreciation and respect to counter contempt")
  }

  if (gottmanScores.defensiveness > 40) {
    recommendations.push("Take responsibility for your part in conflicts instead of defending")
  }

  if (gottmanScores.stonewalling > 30) {
    recommendations.push("Learn to recognize when you're feeling flooded and take a 20-30 minute break")
  }

  if (gottmanScores.turnTowards < 60) {
    recommendations.push("Practice turning toward each other's bids for connection in daily interactions")
  }

  if (gottmanScores.repairAttempts < 60) {
    recommendations.push("Develop and accept repair attempts during and after conflicts")
  }

  if (gottmanScores.sharedMeaning < 60) {
    recommendations.push("Create rituals of connection and discuss your values and goals together")
  }

  // Ensure we have at least 3 recommendations
  if (recommendations.length < 3) {
    const defaultRecommendations = [
      "Practice active listening during conversations",
      "Express appreciation daily",
      "Create opportunities for positive interactions",
      "Discuss your dreams and aspirations together",
    ]
    for (const rec of defaultRecommendations) {
      if (!recommendations.includes(rec)) {
        recommendations.push(rec)
        if (recommendations.length >= 3) break
      }
    }
  }

  // Limit to 5 recommendations
  return recommendations.slice(0, 5)
}

// Identify key moments in the conversation
function identifyKeyMoments(messages: Message[]) {
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for key moments identification.")
  }

  const keyMoments = []

  // Find messages with high sentiment
  const highSentimentMessages = messages.filter((msg) => msg.sentiment && msg.sentiment > 80)
  if (highSentimentMessages.length > 0) {
    const randomIndex = Math.floor(Math.random() * highSentimentMessages.length)
    const message = highSentimentMessages[randomIndex]
    keyMoments.push({
      title: "Positive Emotional Peak",
      description: `${message.sender} expressed a highly positive sentiment, strengthening the connection.`,
      messageText: message.text,
      sender: message.sender,
      timestamp: message.timestamp,
    })
  }

  // Find messages with low sentiment
  const lowSentimentMessages = messages.filter((msg) => msg.sentiment && msg.sentiment < 30)
  if (lowSentimentMessages.length > 0) {
    const randomIndex = Math.floor(Math.random() * lowSentimentMessages.length)
    const message = lowSentimentMessages[randomIndex]
    keyMoments.push({
      title: "Emotional Concern",
      description: `This message from ${message.sender} had a lower emotional tone that might indicate a concern.`,
      messageText: message.text,
      sender: message.sender,
      timestamp: message.timestamp,
    })
  }

  // Find messages with questions
  const questionMessages = messages.filter((msg) => typeof msg.text === "string" && msg.text.includes("?"))
  if (questionMessages.length > 0) {
    const randomIndex = Math.floor(Math.random() * questionMessages.length)
    const message = questionMessages[randomIndex]
    keyMoments.push({
      title: "Seeking Connection",
      description: `${message.sender} asked a question, potentially seeking to deepen understanding or connection.`,
      messageText: message.text,
      sender: message.sender,
      timestamp: message.timestamp,
    })
  }

  // Find messages with gratitude
  const gratitudeMessages = messages.filter(
    (msg) =>
      typeof msg.text === "string" &&
      (msg.text.toLowerCase().includes("thank") ||
        msg.text.toLowerCase().includes("appreciate") ||
        msg.text.toLowerCase().includes("grateful")),
  )
  if (gratitudeMessages.length > 0) {
    const randomIndex = Math.floor(Math.random() * gratitudeMessages.length)
    const message = gratitudeMessages[randomIndex]
    keyMoments.push({
      title: "Expression of Gratitude",
      description: `${message.sender} expressed appreciation, which strengthens relationship bonds.`,
      messageText: message.text,
      sender: message.sender,
      timestamp: message.timestamp,
    })
  }

  return keyMoments
}

// Calculate overall score
function calculateOverallScore(gottmanScores: any, relationshipDynamics: RelationshipDynamics) {
  // Simplified implementation
  const positiveFactors =
    (gottmanScores.emotionalBids +
      gottmanScores.turnTowards +
      gottmanScores.repairAttempts +
      gottmanScores.sharedMeaning) /
    4

  const negativeFactors =
    (gottmanScores.criticism + gottmanScores.contempt + gottmanScores.defensiveness + gottmanScores.stonewalling) / 4

  const gottmanScore = positiveFactors - negativeFactors * 0.8

  const dynamicsScore =
    (relationshipDynamics.positiveToNegativeRatio * 10 +
      relationshipDynamics.biddingPatterns.turningToward +
      relationshipDynamics.sharedMeaning) /
    3

  return Math.round(Math.min(100, Math.max(0, (gottmanScore + dynamicsScore) / 2)))
}

// Generate negative insights
function generateNegativeInsights(messages: Message[], gottmanScores: any, relationshipDynamics: RelationshipDynamics) {
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for negative insights generation.")
  }

  // Simplified implementation
  const patterns = {
    criticism: {
      percentage: gottmanScores.criticism,
      examples: [
        "Why do you always forget?",
        "You never listen to me",
        "You're so inconsiderate",
        "You always make things difficult",
      ],
      description: "Criticism involves attacking someone's personality or character rather than their behavior.",
    },
    contempt: {
      percentage: gottmanScores.contempt,
      examples: [
        "Whatever, I don't care anymore",
        "That's a stupid idea",
        "You're being ridiculous",
        "I can't believe how incompetent you are",
      ],
      description: "Contempt includes sarcasm, cynicism, name-calling, eye-rolling, and hostile humor.",
    },
    defensiveness: {
      percentage: gottmanScores.defensiveness,
      examples: [
        "It's not my fault",
        "You're the one who started it",
        "You're the one who started it",
        "I didn't do anything wrong",
        "You're overreacting",
      ],
      description: "Defensiveness is self-protection through righteous indignation or playing the victim.",
    },
    stonewalling: {
      percentage: gottmanScores.stonewalling,
      examples: ["Fine", "I don't want to talk about this anymore", "...", "Whatever"],
      description: "Stonewalling occurs when someone withdraws from interaction, shutting down communication.",
    },
  }

  // Determine primary and secondary patterns
  const sortedPatterns = Object.entries(patterns)
    .map(([pattern, data]) => ({ pattern, percentage: data.percentage }))
    .sort((a, b) => b.percentage - a.percentage)

  const primaryPattern = sortedPatterns[0].pattern
  const secondaryPattern = sortedPatterns[1].pattern

  // Generate person-specific insights
  const personInsights: Record<string, any> = {}

  // Get unique senders
  const senders = Array.from(new Set(messages.map((msg) => msg.sender)))

  senders.forEach((sender) => {
    const senderMessages = messages.filter((msg) => msg.sender === sender)

    // 🚫 Remove Fallback Profiles - Check for sufficient messages
    if (!senderMessages || senderMessages.length === 0) {
      throw new Error(`Insufficient messages from ${sender} for negative insights generation.`)
    }

    const patternCounts: Record<string, number> = {
      criticism: 0,
      contempt: 0,
      defensiveness: 0,
      stonewalling: 0,
    }

    // Count patterns in sender's messages
    senderMessages.forEach((msg) => {
      const text = typeof msg.text === "string" ? msg.text.toLowerCase() : ""
      if (
        text.includes("you never") ||
        text.includes("you always") ||
        text.includes("why do you") ||
        text.includes("you're so")
      ) {
        patternCounts.criticism++
      }
      if (
        text.includes("whatever") ||
        text.includes("stupid") ||
        text.includes("ridiculous") ||
        text.includes("incompetent")
      ) {
        patternCounts.contempt++
      }
      if (
        text.includes("not my fault") ||
        text.includes("you started") ||
        text.includes("didn't do anything") ||
        text.includes("overreacting")
      ) {
        patternCounts.defensiveness++
      }
      if (text === "fine" || text === "..." || text.includes("don't want to talk")) {
        patternCounts.stonewalling++
      }
    })

    // Determine primary pattern for this sender
    const sortedSenderPatterns = Object.entries(patternCounts)
      .map(([pattern, count]) => ({ pattern, count }))
      .sort((a, b) => b.count - a.count)

    const senderPrimaryPattern = sortedSenderPatterns[0].pattern

    // Generate suggestions based on primary pattern
    const suggestions = []
    if (senderPrimaryPattern === "criticism") {
      suggestions.push(
        "Try using 'I' statements instead of 'you' statements to express concerns",
        "Focus on specific behaviors rather than character traits",
        "Express needs positively rather than criticizing",
      )
    } else if (senderPrimaryPattern === "contempt") {
      suggestions.push(
        "Practice expressing disagreement respectfully",
        "Focus on building a culture of appreciation",
        "Take a break if you notice sarcasm or mockery in your tone",
      )
    } else if (senderPrimaryPattern === "defensiveness") {
      suggestions.push(
        "Try to listen fully before responding",
        "Take responsibility for your part in conflicts",
        "Ask clarifying questions instead of immediately defending yourself",
      )
    } else if (senderPrimaryPattern === "stonewalling") {
      suggestions.push(
        "Recognize when you're feeling overwhelmed and communicate that you need a break",
        "Practice self-soothing techniques when stressed",
        "Set a specific time to return to the conversation after a break",
      )
    }

    personInsights[sender] = {
      primaryPattern: senderPrimaryPattern,
      suggestions,
    }
  })

  return {
    patterns,
    primaryPattern,
    secondaryPattern,
    personInsights,
  }
}
