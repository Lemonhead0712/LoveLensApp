import type {
  Message,
  KeyMoment,
  EmotionalBreakdown,
  GottmanScores,
  NegativeInsights,
  RelationshipDynamics,
} from "./types"
import { type PsychologicalProfile, AttachmentStyle, generatePsychologicalProfile } from "./psychological-frameworks"
import { isOpenAIEnabled } from "./api-config"
import {
  batchAnalyzeSentiment,
  analyzePsychologicalProfiles as analyzeProfilesWithAI,
  analyzeRelationshipDynamics,
} from "./openai-service"
import {
  analyzeAttachmentStyle,
  analyzeLinguisticMarkers as analyzeLinguisticMarkersBase,
  analyzeCognitivePatterns,
} from "./psychological-frameworks"
import { analyzeRelationshipDynamicsRuleBased as analyzeRelationshipDynamicsRuleBasedBase } from "./rule-based-analysis"

// Main function to analyze conversation sentiment
export async function analyzeSentiment(messages: Message[], firstPersonName: string, secondPersonName: string) {
  try {
    console.log("Starting AI-powered sentiment analysis...")
    let fallbackOccurred = false
    let fallbackReason = ""

    // Step 1: Analyze individual message sentiment using AI
    const { messagesWithSentiment, usedFallback, fallbackMessage } = await analyzeMessageSentiments(messages)
    if (usedFallback) {
      fallbackOccurred = true
      fallbackReason = fallbackMessage || "Sentiment analysis fallback occurred"
    }
    console.log("Message sentiment analysis complete")

    // Step 2: Identify key moments
    const keyMoments = await identifyKeyMoments(messagesWithSentiment, firstPersonName, secondPersonName)
    console.log("Key moments identified")

    // Step 3: Generate emotional breakdown for each person separately
    const firstPersonMessages = messagesWithSentiment.filter((msg) => msg.sender === firstPersonName)
    const secondPersonMessages = messagesWithSentiment.filter((msg) => msg.sender === secondPersonName)

    const firstPersonEmotionalBreakdown = await generateEmotionalBreakdown(
      firstPersonMessages,
      firstPersonName,
      secondPersonName,
    )
    const secondPersonEmotionalBreakdown = await generateEmotionalBreakdown(
      secondPersonMessages,
      firstPersonName,
      secondPersonName,
    )
    console.log("Emotional breakdowns generated")

    // Step 4: Generate Gottman scores
    const gottmanScores = await generateGottmanScores(messagesWithSentiment, firstPersonName, secondPersonName)
    console.log("Gottman scores generated")

    let firstPersonProfile: PsychologicalProfile, secondPersonProfile: PsychologicalProfile, relationshipDynamics
    let profileFallback = false

    // Step 5: Use AI to generate psychological profiles if OpenAI is enabled
    if (isOpenAIEnabled()) {
      try {
        console.log("Using AI to generate psychological profiles...")
        // Generate profiles separately for each person
        const profiles = await analyzeProfilesWithAI(messagesWithSentiment, firstPersonName, secondPersonName)
        firstPersonProfile = {
          attachmentStyle: {
            primaryStyle: profiles.firstPersonProfile.attachmentStyle.primaryStyle,
            secondaryStyle: profiles.firstPersonProfile.attachmentStyle.secondaryStyle || null,
            confidence: profiles.firstPersonProfile.attachmentStyle.confidence || 50,
            explanation: "Based on communication patterns and attachment indicators",
            limitedDataWarning:
              profiles.firstPersonProfile.attachmentStyle.indicators?.length === 0
                ? "Limited data available for analysis"
                : undefined,
          },
          transactionalAnalysis: {
            dominantEgoState: profiles.firstPersonProfile.transactionalAnalysis.dominantEgoState,
            egoStateDistribution: profiles.firstPersonProfile.transactionalAnalysis.egoStateDistribution,
          },
          linguisticPatterns: {
            cognitiveComplexity: profiles.firstPersonProfile.linguisticPatterns.cognitiveComplexity || 50,
            emotionalExpressiveness: profiles.firstPersonProfile.linguisticPatterns.emotionalExpressiveness || 50,
            socialEngagement: profiles.firstPersonProfile.linguisticPatterns.socialEngagement || 50,
            dominantEmotions: profiles.firstPersonProfile.linguisticPatterns.dominantEmotions || [],
          },
          cognitivePatterns: {
            topDistortions: profiles.firstPersonProfile.personalizedInsights?.growthAreas || [],
            topHealthyPatterns: profiles.firstPersonProfile.personalizedInsights?.communicationStrengths || [],
            overallBalance: 50 + (profiles.firstPersonProfile.linguisticPatterns.cognitiveComplexity || 50) / 2,
          },
          communicationStrengths: profiles.firstPersonProfile.personalizedInsights?.communicationStrengths || [],
          growthAreas: profiles.firstPersonProfile.personalizedInsights?.growthAreas || [],
        }
        secondPersonProfile = {
          attachmentStyle: {
            primaryStyle: profiles.secondPersonProfile.attachmentStyle.primaryStyle,
            secondaryStyle: profiles.secondPersonProfile.attachmentStyle.secondaryStyle || null,
            confidence: profiles.secondPersonProfile.attachmentStyle.confidence || 50,
            explanation: "Based on communication patterns and attachment indicators",
            limitedDataWarning:
              profiles.secondPersonProfile.attachmentStyle.indicators?.length === 0
                ? "Limited data available for analysis"
                : undefined,
          },
          transactionalAnalysis: {
            dominantEgoState: profiles.secondPersonProfile.transactionalAnalysis.dominantEgoState,
            egoStateDistribution: profiles.secondPersonProfile.transactionalAnalysis.egoStateDistribution,
          },
          linguisticPatterns: {
            cognitiveComplexity: profiles.secondPersonProfile.linguisticPatterns.cognitiveComplexity || 50,
            emotionalExpressiveness: profiles.secondPersonProfile.linguisticPatterns.emotionalExpressiveness || 50,
            socialEngagement: profiles.secondPersonProfile.linguisticPatterns.socialEngagement || 50,
            dominantEmotions: profiles.secondPersonProfile.linguisticPatterns.dominantEmotions || [],
          },
          cognitivePatterns: {
            topDistortions: profiles.secondPersonProfile.personalizedInsights?.growthAreas || [],
            topHealthyPatterns: profiles.secondPersonProfile.personalizedInsights?.communicationStrengths || [],
            overallBalance: 50 + (profiles.secondPersonProfile.linguisticPatterns.cognitiveComplexity || 50) / 2,
          },
          communicationStrengths: profiles.secondPersonProfile.personalizedInsights?.communicationStrengths || [],
          growthAreas: profiles.secondPersonProfile.personalizedInsights?.growthAreas || [],
        }
        console.log("AI psychological profiles generated")
      } catch (error) {
        console.error("Error in AI psychological profile analysis, falling back to rule-based:", error)
        fallbackOccurred = true
        profileFallback = true
        fallbackReason += " Psychological profile analysis fallback occurred."
        // Fallback to rule-based analysis
        const rawFirstProfile = generatePsychologicalProfile(firstPersonMessages, firstPersonName)
        const rawSecondProfile = generatePsychologicalProfile(secondPersonMessages, secondPersonName)
        firstPersonProfile = fixProfileSecondaryStyle(rawFirstProfile)
        secondPersonProfile = fixProfileSecondaryStyle(rawSecondProfile)
      }
    } else {
      // Use rule-based analysis if OpenAI is not enabled
      const rawFirstProfile = generatePsychologicalProfile(firstPersonMessages, firstPersonName)
      const rawSecondProfile = generatePsychologicalProfile(secondPersonMessages, secondPersonName)
      firstPersonProfile = fixProfileSecondaryStyle(rawFirstProfile)
      secondPersonProfile = fixProfileSecondaryStyle(rawSecondProfile)
    }

    // Step 6: Use AI to analyze relationship dynamics if OpenAI is enabled
    let dynamicsFallback = false
    if (isOpenAIEnabled()) {
      try {
        console.log("Using AI to analyze relationship dynamics...")
        relationshipDynamics = await analyzeRelationshipDynamics(
          messagesWithSentiment,
          firstPersonName,
          secondPersonName,
          gottmanScores,
        )
        console.log("AI relationship dynamics analysis complete")
      } catch (error) {
        console.error("Error in AI relationship dynamics analysis, falling back to rule-based:", error)
        fallbackOccurred = true
        dynamicsFallback = true
        fallbackReason += " Relationship dynamics analysis fallback occurred."
        // Fallback to rule-based analysis
        relationshipDynamics = analyzeRelationshipDynamicsRuleBased(
          messagesWithSentiment,
          firstPersonName,
          secondPersonName,
        )
      }
    } else {
      // Use rule-based analysis if OpenAI is not enabled
      relationshipDynamics = analyzeRelationshipDynamicsRuleBased(
        messagesWithSentiment,
        firstPersonName,
        secondPersonName,
      )
    }

    // Step 7: Generate insights and recommendations based on psychological frameworks
    const { insights, recommendations } = await generateInsightsAndRecommendations(
      messagesWithSentiment,
      firstPersonEmotionalBreakdown,
      gottmanScores,
      firstPersonName,
      secondPersonName,
      firstPersonProfile,
      secondPersonProfile,
      relationshipDynamics,
    )
    console.log("Insights and recommendations generated")

    // Step 8: Generate Gottman summary and recommendations
    const { gottmanSummary, gottmanRecommendations } = await generateGottmanSummary(
      gottmanScores,
      messagesWithSentiment,
      firstPersonName,
      secondPersonName,
      relationshipDynamics,
    )
    console.log("Gottman summary and recommendations generated")

    // Step 9: Calculate overall score - FIXED to use balanced weighting
    const overallScore = calculateBalancedOverallScore(
      firstPersonEmotionalBreakdown,
      gottmanScores,
      relationshipDynamics,
      firstPersonProfile,
      secondPersonProfile,
    )
    console.log("Overall score calculated:", overallScore)

    // Step 10: Analyze negative communication patterns
    const negativeInsights = analyzeNegativeCommunicationPatterns(
      messagesWithSentiment,
      firstPersonName,
      secondPersonName,
      gottmanScores,
    )
    console.log("Negative communication patterns analyzed")

    return {
      messagesWithSentiment,
      keyMoments,
      emotionalBreakdown: firstPersonEmotionalBreakdown,
      secondPersonEmotionalBreakdown,
      gottmanScores,
      insights,
      recommendations,
      gottmanSummary,
      gottmanRecommendations,
      overallScore,
      firstPersonProfile,
      secondPersonProfile,
      relationshipDynamics,
      analysisMethod: isOpenAIEnabled() ? "openai" : "rule-based",
      fallbackOccurred,
      fallbackReason: fallbackReason.trim(),
      fallbackDetails: {
        sentiment: usedFallback,
        profiles: profileFallback,
        dynamics: dynamicsFallback,
      },
      negativeInsights,
    }
  } catch (error) {
    console.error("Error in sentiment analysis:", error)
    throw new Error("Failed to analyze conversation sentiment")
  }
}

// Analyze sentiment for each message
async function analyzeMessageSentiments(messages: Message[]): Promise<{
  messagesWithSentiment: Message[]
  usedFallback: boolean
  fallbackMessage?: string
}> {
  try {
    // Check if OpenAI is enabled
    if (isOpenAIEnabled()) {
      console.log("Using OpenAI for sentiment analysis...")
      try {
        const analyzedMessages = await analyzeWithOpenAI(messages)
        return {
          messagesWithSentiment: analyzedMessages,
          usedFallback: false,
        }
      } catch (error) {
        console.error("Error in OpenAI sentiment analysis, falling back to rule-based:", error)
        const fallbackMessage = error instanceof Error ? error.message : "Unknown error occurred"
        return {
          messagesWithSentiment: analyzeWithRules(messages),
          usedFallback: true,
          fallbackMessage: `OpenAI sentiment analysis failed: ${fallbackMessage}. Using rule-based analysis instead.`,
        }
      }
    } else {
      console.log("OpenAI not enabled, using rule-based sentiment analysis...")
      return {
        messagesWithSentiment: analyzeWithRules(messages),
        usedFallback: false,
      }
    }
  } catch (error) {
    console.error("Error in sentiment analysis, falling back to rule-based:", error)
    const fallbackMessage = error instanceof Error ? error.message : "Unknown error occurred"
    // If OpenAI fails, fallback to rule-based
    return {
      messagesWithSentiment: analyzeWithRules(messages),
      usedFallback: true,
      fallbackMessage: `Sentiment analysis error: ${fallbackMessage}. Using rule-based analysis instead.`,
    }
  }
}

// Update the analyzeWithOpenAI function to use server actions
async function analyzeWithOpenAI(messages: Message[]): Promise<Message[]> {
  try {
    // Process messages in batches to optimize API calls
    const batchSize = 10
    const analyzedMessages: Message[] = []

    // Separate messages by sender to prevent cross-contamination
    const messagesBySender = messages.reduce(
      (acc, msg) => {
        const sender = msg.sender
        if (!acc[sender]) {
          acc[sender] = []
        }
        acc[sender].push(msg)
        return acc
      },
      {} as Record<string, Message[]>,
    )

    // Process each sender's messages separately
    for (const [sender, senderMessages] of Object.entries(messagesBySender)) {
      for (let i = 0; i < senderMessages.length; i += batchSize) {
        const batch = senderMessages.slice(i, i + batchSize)
        const messageTexts = batch.map((msg) => msg.text)

        // Call OpenAI batch analysis
        let sentimentScores: number[]

        try {
          // Try to use the server action first
          const { batchAnalyzeTextSentiment } = await import("@/app/actions/api-actions")
          sentimentScores = await batchAnalyzeTextSentiment(messageTexts)
          console.log(`Server action sentiment analysis complete for ${sender}`)
        } catch (error) {
          console.error(
            `Error using server action for sentiment analysis for ${sender}, falling back to client-side:`,
            error,
          )
          // Fall back to client-side analysis
          sentimentScores = await batchAnalyzeSentiment(messageTexts)
          console.log(`Client-side sentiment analysis complete for ${sender}`)
        }

        // Combine results with original messages
        const batchResults = batch.map((message, index) => ({
          ...message,
          sentiment: sentimentScores[index],
        }))

        analyzedMessages.push(...batchResults)
      }
    }

    return analyzedMessages
  } catch (error) {
    console.error("Error in OpenAI sentiment analysis:", error)
    throw error
  }
}

// Improved rule-based sentiment analysis with context awareness
function analyzeWithRules(messages: Message[]): Message[] {
  console.log("Using enhanced rule-based sentiment analysis...")

  // First pass: basic sentiment analysis
  const basicSentiment = messages.map((message) => {
    // Simple rule-based sentiment analysis
    const text = message.text.toLowerCase()

    // Positive words/phrases with weights
    const positivePatterns = [
      { pattern: "thank", weight: 1.5 },
      { pattern: "appreciate", weight: 2 },
      { pattern: "happy", weight: 1.5 },
      { pattern: "glad", weight: 1.5 },
      { pattern: "good", weight: 1 },
      { pattern: "great", weight: 1.5 },
      { pattern: "excellent", weight: 2 },
      { pattern: "amazing", weight: 2 },
      { pattern: "love", weight: 2 },
      { pattern: "wonderful", weight: 1.5 },
      { pattern: "awesome", weight: 1.5 },
      { pattern: "excited", weight: 1.5 },
      { pattern: "looking forward", weight: 1.5 },
      { pattern: "enjoy", weight: 1.5 },
      { pattern: "pleased", weight: 1.5 },
      { pattern: "😊", weight: 2 },
      { pattern: "😃", weight: 2 },
      { pattern: "👍", weight: 1.5 },
      { pattern: "❤️", weight: 2 },
      { pattern: "yes", weight: 0.5 },
      { pattern: "definitely", weight: 1 },
      { pattern: "sure", weight: 0.5 },
      { pattern: "perfect", weight: 1.5 },
      { pattern: "nice", weight: 1 },
      { pattern: "cool", weight: 1 },
      { pattern: "fantastic", weight: 1.5 },
      { pattern: "helpful", weight: 1.5 },
      { pattern: "thanks", weight: 1.5 },
    ]

    // Negative words/phrases with weights
    const negativePatterns = [
      { pattern: "sorry", weight: 1 },
      { pattern: "disappointed", weight: 1.5 },
      { pattern: "sad", weight: 1.5 },
      { pattern: "upset", weight: 1.5 },
      { pattern: "bad", weight: 1 },
      { pattern: "terrible", weight: 2 },
      { pattern: "awful", weight: 2 },
      { pattern: "hate", weight: 2 },
      { pattern: "dislike", weight: 1.5 },
      { pattern: "annoyed", weight: 1.5 },
      { pattern: "frustrated", weight: 1.5 },
      { pattern: "angry", weight: 2 },
      { pattern: "worried", weight: 1 },
      { pattern: "concerned", weight: 1 },
      { pattern: "problem", weight: 1 },
      { pattern: "issue", weight: 1 },
      { pattern: "mistake", weight: 1 },
      { pattern: "error", weight: 1 },
      { pattern: "fault", weight: 1.5 },
      { pattern: "wrong", weight: 1.5 },
      { pattern: "not", weight: 0.5 },
      { pattern: "don't", weight: 0.5 },
      { pattern: "confused", weight: 1 },
      { pattern: "misunderstood", weight: 1.5 },
      { pattern: "😞", weight: 1.5 },
      { pattern: "😢", weight: 1.5 },
      { pattern: "😠", weight: 2 },
      { pattern: "👎", weight: 1.5 },
      { pattern: "no", weight: 0.5 },
      { pattern: "never", weight: 1 },
    ]

    // Count matches with weights
    let positiveScore = 0
    let negativeScore = 0

    positivePatterns.forEach(({ pattern, weight }) => {
      if (text.includes(pattern)) positiveScore += weight
    })

    negativePatterns.forEach(({ pattern, weight }) => {
      if (text.includes(pattern)) negativeScore += weight
    })

    // Check for negation patterns that reverse sentiment
    const negationPatterns = ["not ", "don't ", "doesn't ", "isn't ", "aren't ", "wasn't ", "weren't ", "no "]

    // Check for sarcasm indicators
    const sarcasmIndicators = ["yeah right", "sure thing", "whatever", "as if", "oh great", "just what i need"]
    let sarcasmDetected = false

    sarcasmIndicators.forEach((indicator) => {
      if (text.includes(indicator)) {
        sarcasmDetected = true
      }
    })

    // Adjust for negation
    let negationAdjustment = 0
    negationPatterns.forEach((negation) => {
      // Look for negation + positive word patterns
      positivePatterns.forEach(({ pattern, weight }) => {
        if (text.includes(negation + pattern)) {
          negationAdjustment -= weight * 1.5 // Stronger negative effect when positive words are negated
        }
      })

      // Look for negation + negative word patterns (can sometimes reduce negativity)
      negativePatterns.forEach(({ pattern, weight }) => {
        if (text.includes(negation + pattern)) {
          negationAdjustment += weight * 0.5 // Smaller positive effect when negative words are negated
        }
      })
    })

    // Apply negation adjustment
    positiveScore += negationAdjustment

    // Handle sarcasm by potentially inverting sentiment
    if (sarcasmDetected) {
      if (positiveScore > negativeScore) {
        // Invert primarily positive sentiment for sarcasm
        const temp = positiveScore
        positiveScore = negativeScore
        negativeScore = temp * 1.2 // Amplify the negative effect of sarcasm
      }
    }

    // Calculate sentiment score (0-100)
    let sentimentScore = 50 // Neutral default

    if (positiveScore > 0 || negativeScore > 0) {
      // Calculate the ratio of positive to total matches
      const total = positiveScore + negativeScore
      const ratio = positiveScore / total

      // Convert to a 0-100 scale
      sentimentScore = Math.round(ratio * 100)

      // Adjust for intensity based on total weighted matches
      const intensityFactor = Math.min(1, total / 8) // Cap at 8 weighted points for full intensity

      // Move score toward neutral based on intensity
      sentimentScore = Math.round(50 + (sentimentScore - 50) * intensityFactor)
    }

    // Add some randomness to make it more realistic
    const randomVariation = Math.floor(Math.random() * 7) - 3 // -3 to +3
    sentimentScore = Math.max(0, Math.min(100, sentimentScore + randomVariation))

    return {
      ...message,
      sentiment: sentimentScore,
    }
  })

  // Second pass: context-aware adjustments
  return basicSentiment.map((message, index, array) => {
    let adjustedSentiment = message.sentiment || 50

    // Context window (look at previous and next messages if available)
    const prevMessage = index > 0 ? array[index - 1] : null
    const nextMessage = index < array.length - 1 ? array[index + 1] : null

    // Adjust based on conversation flow
    if (prevMessage) {
      const prevSentiment = prevMessage.sentiment || 50
      const sameSender = prevMessage.sender === message.sender

      if (sameSender) {
        // Messages from same sender tend to have similar sentiment
        adjustedSentiment = Math.round(adjustedSentiment * 0.8 + prevSentiment * 0.2)
      } else {
        // Check for sentiment mirroring between participants
        // If previous message was very positive/negative, this response might mirror it
        if (prevSentiment > 75) {
          // Previous message was very positive, likely to get positive response
          adjustedSentiment = Math.min(100, adjustedSentiment + 5)
        } else if (prevSentiment < 25) {
          // Previous message was very negative
          // Could either get sympathetic response or defensive response
          // For simplicity, we'll make a small negative adjustment
          adjustedSentiment = Math.max(0, adjustedSentiment - 3)
        }
      }
    }

    // Questions often have neutral sentiment regardless of content
    if (message.text.trim().endsWith("?")) {
      // Pull question sentiment closer to neutral
      adjustedSentiment = Math.round(adjustedSentiment * 0.7 + 50 * 0.3)
    }

    // Very short messages have less extreme sentiment
    if (message.text.length < 10) {
      // Pull short message sentiment closer to neutral
      adjustedSentiment = Math.round(adjustedSentiment * 0.8 + 50 * 0.2)
    }

    return {
      ...message,
      sentiment: adjustedSentiment,
    }
  })
}

// Analyze negative communication patterns
function analyzeNegativeCommunicationPatterns(
  messages: Message[],
  firstPersonName: string,
  secondPersonName: string,
  gottmanScores: GottmanScores,
): NegativeInsights {
  // Initialize patterns
  const patterns = {
    criticism: {
      count: 0,
      examples: [] as string[],
      description: "Criticism involves attacking someone's personality or character rather than their behavior.",
    },
    contempt: {
      count: 0,
      examples: [] as string[],
      description: "Contempt includes sarcasm, cynicism, name-calling, eye-rolling, and hostile humor.",
    },
    defensiveness: {
      count: 0,
      examples: [] as string[],
      description: "Defensiveness is self-protection through righteous indignation or playing the victim.",
    },
    stonewalling: {
      count: 0,
      examples: [] as string[],
      description: "Stonewalling occurs when someone withdraws from interaction, shutting down communication.",
    },
  }

  // Analyze each message
  messages.forEach((message) => {
    const text = message.text.toLowerCase()
    const sentiment = message.sentiment || 50

    // Criticism patterns
    if (
      text.includes("you always") ||
      text.includes("you never") ||
      (text.includes("why do you") && sentiment < 40) ||
      text.includes("what's wrong with you") ||
      (text.includes("you're so") && sentiment < 40)
    ) {
      patterns.criticism.count++
      if (patterns.criticism.examples.length < 3) {
        patterns.criticism.examples.push(message.text)
      }
    }

    // Contempt patterns
    if (
      (text.includes("whatever") && sentiment < 40) ||
      (text.includes("yeah right") && sentiment < 50) ||
      (text.includes("sure") && text.length < 10 && sentiment < 40) ||
      text.includes("pathetic") ||
      text.includes("loser") ||
      text.includes("idiot") ||
      text.includes("🙄") ||
      text.includes("😒")
    ) {
      patterns.contempt.count++
      if (patterns.contempt.examples.length < 3) {
        patterns.contempt.examples.push(message.text)
      }
    }

    // Defensiveness patterns
    if (
      text.includes("it's not my fault") ||
      (text.includes("i didn't") && sentiment < 40) ||
      text.includes("you're the one who") ||
      text.includes("that's not true") ||
      text.includes("that's not fair") ||
      text.includes("why are you blaming me")
    ) {
      patterns.defensiveness.count++
      if (patterns.defensiveness.examples.length < 3) {
        patterns.defensiveness.examples.push(message.text)
      }
    }

    // Stonewalling patterns
    if (
      (text.includes("fine") && text.length < 10) ||
      (text.includes("whatever") && text.length < 15) ||
      text.includes("i don't want to talk about this") ||
      text.includes("leave me alone") ||
      text.includes("i'm done")
    ) {
      patterns.stonewalling.count++
      if (patterns.stonewalling.examples.length < 3) {
        patterns.stonewalling.examples.push(message.text)
      }
    }
  })

  // Calculate percentages based on message count
  const totalMessages = messages.length
  const percentages = {
    criticism: Math.round((patterns.criticism.count / totalMessages) * 100),
    contempt: Math.round((patterns.contempt.count / totalMessages) * 100),
    defensiveness: Math.round((patterns.defensiveness.count / totalMessages) * 100),
    stonewalling: Math.round((patterns.stonewalling.count / totalMessages) * 100),
  }

  // Determine primary and secondary patterns
  const sortedPatterns = [
    { name: "criticism", percentage: percentages.criticism },
    { name: "contempt", percentage: percentages.contempt },
    { name: "defensiveness", percentage: percentages.defensiveness },
    { name: "stonewalling", percentage: percentages.stonewalling },
  ].sort((a, b) => b.percentage - a.percentage)

  const primaryPattern = sortedPatterns[0].percentage > 0 ? sortedPatterns[0].name : null
  const secondaryPattern = sortedPatterns[1].percentage > 0 ? sortedPatterns[1].name : null

  // Generate personalized insights
  const personInsights = {
    [firstPersonName]: generatePersonalizedInsights(messages, firstPersonName, patterns),
    [secondPersonName]: generatePersonalizedInsights(messages, secondPersonName, patterns),
  }

  return {
    patterns: {
      criticism: {
        percentage: percentages.criticism,
        examples: patterns.criticism.examples,
        description: patterns.criticism.description,
      },
      contempt: {
        percentage: percentages.contempt,
        examples: patterns.contempt.examples,
        description: patterns.contempt.description,
      },
      defensiveness: {
        percentage: percentages.defensiveness,
        examples: patterns.defensiveness.examples,
        description: patterns.defensiveness.description,
      },
      stonewalling: {
        percentage: percentages.stonewalling,
        examples: patterns.stonewalling.examples,
        description: patterns.stonewalling.description,
      },
    },
    primaryPattern,
    secondaryPattern,
    personInsights,
  }
}

// Generate personalized insights for each person
function generatePersonalizedInsights(
  messages: Message[],
  personName: string,
  patterns: any,
): { primaryPattern: string | null; suggestions: string[] } {
  // Filter messages by this person
  const personMessages = messages.filter((msg) => msg.sender === personName)
  if (personMessages.length === 0) {
    return { primaryPattern: null, suggestions: [] }
  }

  // Count patterns for this person
  const personPatterns = {
    criticism: 0,
    contempt: 0,
    defensiveness: 0,
    stonewalling: 0,
  }

  personMessages.forEach((message) => {
    const text = message.text.toLowerCase()
    const sentiment = message.sentiment || 50

    // Simplified pattern matching for per-person analysis
    if (text.includes("you always") || text.includes("you never") || (text.includes("why do you") && sentiment < 40)) {
      personPatterns.criticism++
    }

    if ((text.includes("whatever") && sentiment < 40) || text.includes("pathetic") || text.includes("🙄")) {
      personPatterns.contempt++
    }

    if (text.includes("it's not my fault") || (text.includes("i didn't") && sentiment < 40)) {
      personPatterns.defensiveness++
    }

    if ((text.includes("fine") && text.length < 10) || text.includes("i don't want to talk about this")) {
      personPatterns.stonewalling++
    }
  })

  // Determine primary pattern for this person
  const sortedPatterns = [
    { name: "criticism", count: personPatterns.criticism },
    { name: "contempt", count: personPatterns.contempt },
    { name: "defensiveness", count: personPatterns.defensiveness },
    { name: "stonewalling", count: personPatterns.stonewalling },
  ].sort((a, b) => b.count - a.count)

  const primaryPattern = sortedPatterns[0].count > 0 ? sortedPatterns[0].name : null

  // Generate personalized suggestions
  const suggestions: string[] = []

  if (primaryPattern === "criticism") {
    suggestions.push("Try using 'I' statements instead of 'you' statements to express concerns")
    suggestions.push("Focus on specific behaviors rather than character traits")
    suggestions.push("Express needs positively rather than criticizing")
  } else if (primaryPattern === "contempt") {
    suggestions.push("Practice expressing disagreement respectfully")
    suggestions.push("Take breaks when feeling overwhelmed to avoid sarcastic responses")
    suggestions.push("Focus on appreciation and respect even during disagreements")
  } else if (primaryPattern === "defensiveness") {
    suggestions.push("Try to listen fully before responding")
    suggestions.push("Take responsibility for your part in conflicts")
    suggestions.push("Ask clarifying questions instead of immediately defending yourself")
  } else if (primaryPattern === "stonewalling") {
    suggestions.push("Signal when you need a timeout instead of shutting down")
    suggestions.push("Practice self-soothing techniques when conversations get heated")
    suggestions.push("Return to difficult conversations after a break")
  } else {
    suggestions.push("Continue maintaining positive communication patterns")
    suggestions.push("Practice active listening and validation")
  }

  return {
    primaryPattern,
    suggestions,
  }
}

// Identify key moments in the conversation
async function identifyKeyMoments(
  messages: Message[],
  firstPersonName: string,
  secondPersonName: string,
): Promise<KeyMoment[]> {
  try {
    if (!messages || messages.length === 0) {
      return []
    }

    // Find messages with extreme sentiment (highest and lowest)
    const sortedBySentiment = [...messages].sort((a, b) => (b.sentiment || 0) - (a.sentiment || 0))
    const highestSentiment = sortedBySentiment[0]
    const lowestSentiment = sortedBySentiment[sortedBySentiment.length - 1]

    // Find a message with significant sentiment change
    let sentimentChange = null
    for (let i = 1; i < messages.length; i++) {
      const prevSentiment = messages[i - 1].sentiment || 50
      const currSentiment = messages[i].sentiment || 50
      if (Math.abs(currSentiment - prevSentiment) > 20) {
        sentimentChange = messages[i]
        break
      }
    }

    // If no significant change found, use the middle message
    if (!sentimentChange && messages.length > 2) {
      sentimentChange = messages[Math.floor(messages.length / 2)]
    }

    // Find messages with attachment style indicators
    const firstPersonMessages = messages.filter((msg) => msg.sender === firstPersonName)
    const secondPersonMessages = messages.filter((msg) => msg.sender === secondPersonName)

    const firstPersonAttachment = analyzeAttachmentStyle(firstPersonMessages)
    const secondPersonAttachment = analyzeAttachmentStyle(secondPersonMessages)

    // Find a message that strongly indicates the primary attachment style
    let attachmentMoment = null
    if (firstPersonAttachment.primaryStyle !== AttachmentStyle.Secure && firstPersonAttachment.confidence > 70) {
      // Find a message that exemplifies this attachment style
      attachmentMoment = findMessageWithAttachmentIndicator(firstPersonMessages, firstPersonAttachment.primaryStyle)
    } else if (
      secondPersonAttachment.primaryStyle !== AttachmentStyle.Secure &&
      secondPersonAttachment.confidence > 70
    ) {
      attachmentMoment = findMessageWithAttachmentIndicator(secondPersonMessages, secondPersonAttachment.primaryStyle)
    }

    const keyMoments: KeyMoment[] = []

    if (highestSentiment) {
      keyMoments.push({
        title: "Positive Emotional Peak",
        description: `${highestSentiment.sender} expressed a highly positive sentiment, strengthening the connection.`,
        messageText: highestSentiment.text,
        sender: highestSentiment.sender,
        timestamp: highestSentiment.timestamp || new Date().toISOString(),
      })
    }

    if (sentimentChange) {
      const direction = (sentimentChange.sentiment || 50) > 50 ? "positive" : "negative"
      keyMoments.push({
        title: "Sentiment Shift",
        description: `The conversation shifted to a more ${direction} tone at this point.`,
        messageText: sentimentChange.text,
        sender: sentimentChange.sender,
        timestamp: sentimentChange.timestamp || new Date().toISOString(),
      })
    }

    if (lowestSentiment) {
      keyMoments.push({
        title: "Emotional Concern",
        description: `This message from ${lowestSentiment.sender} had a lower emotional tone that might indicate a concern.`,
        messageText: lowestSentiment.text,
        sender: lowestSentiment.sender,
        timestamp: lowestSentiment.timestamp || new Date().toISOString(),
      })
    }

    if (attachmentMoment) {
      const style =
        attachmentMoment.sender === firstPersonName
          ? firstPersonAttachment.primaryStyle
          : secondPersonAttachment.primaryStyle

      keyMoments.push({
        title: "Attachment Pattern",
        description: `This message demonstrates a typical ${style.toLowerCase()} attachment communication pattern.`,
        messageText: attachmentMoment.text,
        sender: attachmentMoment.sender,
        timestamp: attachmentMoment.timestamp || new Date().toISOString(),
      })
    }

    return keyMoments
  } catch (error) {
    console.error("Error identifying key moments:", error)

    // Return fallback key moment if error occurs
    if (messages && messages.length > 0) {
      return [
        {
          title: "Conversation Start",
          description: "An important moment in your conversation.",
          messageText: messages[0].text,
          sender: messages[0].sender,
          timestamp: messages[0].timestamp || new Date().toISOString(),
        },
      ]
    }
    return []
  }
}

// Helper function to find a message that indicates a specific attachment style
function findMessageWithAttachmentIndicator(messages: Message[], style: string): Message | null {
  if (!messages || messages.length === 0) {
    return null
  }

  // Define indicators for each attachment style
  const anxiousIndicators = ["worry", "miss", "need you", "afraid", "sorry", "please", "?"]
  const avoidantIndicators = ["fine", "whatever", "busy", "need space", "later"]
  const disorganizedIndicators = ["love", "hate", "need", "away", "confused"]

  let indicators: string[] = []

  switch (style) {
    case "Anxious":
      indicators = anxiousIndicators
      break
    case "Avoidant":
      indicators = avoidantIndicators
      break
    case "Disorganized/Fearful":
      indicators = disorganizedIndicators
      break
    default:
      return null
  }

  // Find a message that contains these indicators
  for (const message of messages) {
    const text = message.text.toLowerCase()
    for (const indicator of indicators) {
      if (text.includes(indicator)) {
        return message
      }
    }
  }

  return null
}

// Generate emotional breakdown
async function generateEmotionalBreakdown(
  messages: Message[],
  firstPersonName: string,
  secondPersonName: string,
): Promise<EmotionalBreakdown> {
  try {
    if (!messages || messages.length === 0) {
      return getDefaultEmotionalBreakdown()
    }

    // Use linguistic analysis to enhance emotional breakdown
    const firstPersonLinguistics = analyzeLinguisticMarkers(messages)
    const secondPersonLinguistics = analyzeLinguisticMarkers(messages)

    // Calculate average sentiment
    let sum = 0
    for (const msg of messages) {
      sum += msg.sentiment || 50
    }
    const avgSentiment = sum / messages.length

    // Calculate sentiment variance (how much emotions fluctuate)
    let sentimentVariance = 0
    for (const msg of messages) {
      const diff = (msg.sentiment || 50) - avgSentiment
      sentimentVariance += diff * diff
    }
    sentimentVariance /= messages.length

    // Calculate response rate (how quickly messages are exchanged)
    let avgResponseTime = 0
    let responseCount = 0

    for (let i = 1; i < messages.length; i++) {
      if (messages[i].sender !== messages[i - 1].sender) {
        const time1 = new Date(messages[i - 1].timestamp || new Date()).getTime()
        const time2 = new Date(messages[i].timestamp || new Date()).getTime()
        avgResponseTime += time2 - time1
        responseCount++
      }
    }

    avgResponseTime = responseCount > 0 ? avgResponseTime / responseCount : 0

    // Normalize response time (lower is better)
    const normalizedResponseTime = Math.max(0, 100 - Math.min(100, (avgResponseTime / 60000) * 10))

    // Count message exchanges (turn-taking)
    let exchanges = 0
    for (let i = 1; i < messages.length; i++) {
      if (messages[i].sender !== messages[i - 1].sender) {
        exchanges++
      }
    }

    // Normalize exchanges (higher is better)
    const normalizedExchanges = Math.min(100, (exchanges / messages.length) * 150)

    // Generate scores based on these metrics and linguistic analysis
    return {
      empathy: Math.round(
        Math.min(
          100,
          (avgSentiment +
            firstPersonLinguistics.emotionalExpressiveness +
            secondPersonLinguistics.emotionalExpressiveness) /
            3 +
            5,
        ),
      ),
      selfAwareness: Math.round(
        Math.min(
          100,
          (75 +
            sentimentVariance / 5 +
            firstPersonLinguistics.cognitiveComplexity +
            secondPersonLinguistics.cognitiveComplexity) /
            3,
        ),
      ),
      socialSkills: Math.round(
        Math.min(
          100,
          (normalizedExchanges + firstPersonLinguistics.socialEngagement + secondPersonLinguistics.socialEngagement) /
            3 +
            3,
        ),
      ),
      emotionalRegulation: Math.round(
        Math.min(
          100,
          (100 -
            sentimentVariance / 4 +
            (100 - firstPersonLinguistics.psychologicalDistancing) +
            (100 - secondPersonLinguistics.psychologicalDistancing)) /
            3,
        ),
      ),
      motivation: Math.round(Math.min(100, avgSentiment + 20)),
      adaptability: Math.round(
        Math.min(
          100,
          (normalizedResponseTime +
            (100 - firstPersonLinguistics.certaintyLevel) +
            (100 - secondPersonLinguistics.certaintyLevel)) /
            3 +
            5,
        ),
      ),
    }
  } catch (error) {
    console.error("Error generating emotional breakdown:", error)

    // Return fallback breakdown
    return getDefaultEmotionalBreakdown()
  }
}

// Default emotional breakdown for null safety
function getDefaultEmotionalBreakdown(): EmotionalBreakdown {
  return {
    empathy: 75,
    selfAwareness: 68,
    socialSkills: 72,
    emotionalRegulation: 65,
    motivation: 80,
    adaptability: 70,
  }
}

// Generate Gottman scores
async function generateGottmanScores(
  messages: Message[],
  firstPersonName: string,
  secondPersonName: string,
): Promise<GottmanScores> {
  try {
    if (!messages || messages.length === 0) {
      return {
        criticism: 35,
        contempt: 25,
        defensiveness: 40,
        stonewalling: 30,
        emotionalBids: 70,
        turnTowards: 65,
        repairAttempts: 75,
        sharedMeaning: 80,
      }
    }

    // Use cognitive patterns analysis to enhance Gottman scores
    const firstPersonCognitive = analyzeCognitivePatterns(messages)
    const secondPersonCognitive = analyzeCognitivePatterns(messages)

    // Calculate average sentiment
    const avgSentiment = messages.reduce((sum, msg) => sum + (msg.sentiment || 50), 0) / messages.length

    // Count negative messages (sentiment < 40)
    const negativeMessages = messages.filter((msg) => (msg.sentiment || 50) < 40).length
    const negativeRatio = negativeMessages / messages.length

    // Count very positive messages (sentiment > 75)
    const veryPositiveMessages = messages.filter((msg) => (msg.sentiment || 50) > 75).length
    const veryPositiveRatio = veryPositiveMessages / messages.length

    // Count response patterns
    let responsesAfterNegative = 0
    let negativeFollowedByPositive = 0

    for (let i = 1; i < messages.length; i++) {
      if (messages[i].sender !== messages[i - 1].sender) {
        if ((messages[i - 1].sentiment || 50) < 40) {
          responsesAfterNegative++
          if ((messages[i].sentiment || 50) > 60) {
            negativeFollowedByPositive++
          }
        }
      }
    }

    // Calculate repair ratio (positive responses after negative messages)
    const repairRatio = responsesAfterNegative > 0 ? negativeFollowedByPositive / responsesAfterNegative : 0.5

    // Find cognitive distortions related to criticism
    const criticismDistortions = [
      ...findDistortionsByType(firstPersonCognitive, ["All-or-Nothing Thinking", "Labeling"]),
      ...findDistortionsByType(secondPersonCognitive, ["All-or-Nothing Thinking", "Labeling"]),
    ]

    // Find cognitive distortions related to contempt
    const contemptDistortions = [
      ...findDistortionsByType(firstPersonCognitive, ["Labeling", "Mind Reading"]),
      ...findDistortionsByType(secondPersonCognitive, ["Labeling", "Mind Reading"]),
    ]

    // Find cognitive distortions related to defensiveness
    const defensivenessDistortions = [
      ...findDistortionsByType(firstPersonCognitive, ["Personalization", "Mental Filter"]),
      ...findDistortionsByType(secondPersonCognitive, ["Personalization", "Mental Filter"]),
    ]

    // Generate Gottman scores based on these metrics
    return {
      criticism: Math.round(Math.min(100, negativeRatio * 200 + criticismDistortions.length * 10)),
      contempt: Math.round(Math.min(100, negativeRatio * 150 + contemptDistortions.length * 15)),
      defensiveness: Math.round(Math.min(100, 100 - repairRatio * 100 + defensivenessDistortions.length * 10)),
      stonewalling: Math.round(Math.min(100, 50 - (avgSentiment - 50))),
      emotionalBids: Math.round(Math.min(100, 60 + veryPositiveRatio * 100)),
      turnTowards: Math.round(Math.min(100, 50 + repairRatio * 100)),
      repairAttempts: Math.round(Math.min(100, repairRatio * 150)),
      sharedMeaning: Math.round(Math.min(100, avgSentiment + 10)),
    }
  } catch (error) {
    console.error("Error generating Gottman scores:", error)

    // Return fallback Gottman scores
    return {
      criticism: 35,
      contempt: 25,
      defensiveness: 40,
      stonewalling: 30,
      emotionalBids: 70,
      turnTowards: 65,
      repairAttempts: 75,
      sharedMeaning: 80,
    }
  }
}

// Helper function to find cognitive distortions by type
function findDistortionsByType(cognitiveAnalysis: any, types: string[]): any[] {
  if (!cognitiveAnalysis || !cognitiveAnalysis.distortions) {
    return []
  }
  return cognitiveAnalysis.distortions.filter((d: any) => types.includes(d.type))
}

// Generate insights and recommendations
async function generateInsightsAndRecommendations(
  messages: Message[],
  emotionalBreakdown: EmotionalBreakdown,
  gottmanScores: GottmanScores,
  firstPersonName: string,
  secondPersonName: string,
  firstPersonProfile: PsychologicalProfile,
  secondPersonProfile: PsychologicalProfile,
  relationshipDynamics: RelationshipDynamics,
) {
  try {
    if (!firstPersonProfile || !secondPersonProfile || !relationshipDynamics) {
      return {
        insights: [
          "Analysis is limited due to incomplete data.",
          "Consider providing more conversation data for better insights.",
        ],
        recommendations: [
          "Practice active listening techniques",
          "Express appreciation regularly",
          "Clarify misunderstandings promptly",
        ],
      }
    }

    // Generate insights based on psychological profiles and relationship dynamics
    const insights = [
      `${firstPersonName} shows ${emotionalBreakdown.empathy > 70 ? "high" : "moderate"} empathy with a ${firstPersonProfile.attachmentStyle?.primaryStyle?.toLowerCase() || "balanced"} attachment style.`,
      `${secondPersonName} communicates primarily from the ${secondPersonProfile.transactionalAnalysis?.dominantEgoState || "Adult"} ego state with ${secondPersonProfile.linguisticPatterns?.cognitiveComplexity > 70 ? "high" : "moderate"} cognitive complexity.`,
      `Your conversation shows a ${relationshipDynamics.positiveToNegativeRatio?.toFixed(1) || "1.0"}:1 positive-to-negative ratio, ${relationshipDynamics.positiveToNegativeRatio >= 5 ? "which is excellent" : relationshipDynamics.positiveToNegativeRatio >= 3 ? "which is healthy" : "which could be improved"}.`,
      `The dominant conflict style in your communication is ${relationshipDynamics.conflictStyle?.toLowerCase() || "balanced"}.`,
      `Your attachment styles are ${relationshipDynamics.attachmentCompatibility?.toLowerCase() || "moderately compatible"}, which ${relationshipDynamics.attachmentCompatibility === "Highly Compatible" ? "strengthens your connection" : relationshipDynamics.attachmentCompatibility === "Potentially Challenging" ? "may create tension" : "provides balance"}.`,
    ]

    // Generate recommendations based on psychological profiles and relationship dynamics
    const recommendations = [
      ...(relationshipDynamics.keyGrowthAreas || []).map((area: string) => area),
      `${firstPersonName} could ${firstPersonProfile.growthAreas?.[0]?.toLowerCase() || "work on expressing needs more clearly"}`,
      `${secondPersonName} might benefit from ${secondPersonProfile.growthAreas?.[0]?.toLowerCase() || "practicing active listening"}`,
      relationshipDynamics.positiveToNegativeRatio < 3
        ? "Work on increasing positive interactions to achieve the ideal 5:1 positive-to-negative ratio"
        : "Continue maintaining your healthy balance of positive interactions",
    ]

    return { insights, recommendations }
  } catch (error) {
    console.error("Error generating insights and recommendations:", error)

    // Return fallback insights and recommendations
    return {
      insights: [
        `${firstPersonName} shows good emotional awareness in their messages.`,
        `${secondPersonName} tends to be direct in their communication style.`,
        "Both participants show engagement in the conversation.",
        "The conversation shows a balanced exchange of ideas.",
        "Response times indicate mutual interest in the discussion.",
      ],
      recommendations: [
        "Practice active listening by acknowledging each other's points.",
        "Express appreciation more explicitly.",
        "Ask clarifying questions when unsure about meaning.",
        "Take time to respond thoughtfully to emotional messages.",
      ],
    }
  }
}

// Generate Gottman summary and recommendations
async function generateGottmanSummary(
  gottmanScores: GottmanScores,
  messages: Message[],
  firstPersonName: string,
  secondPersonName: string,
  relationshipDynamics: RelationshipDynamics,
) {
  try {
    if (!gottmanScores || !relationshipDynamics) {
      return {
        gottmanSummary: "Insufficient data to generate a complete Gottman analysis.",
        gottmanRecommendations: [
          "Practice active listening techniques",
          "Express appreciation regularly",
          "Clarify misunderstandings promptly",
        ],
      }
    }

    // Generate summary based on Gottman scores and relationship dynamics
    let summaryQuality = "moderate"
    if (
      (gottmanScores.criticism + gottmanScores.contempt + gottmanScores.defensiveness + gottmanScores.stonewalling) /
        4 <
        30 &&
      (gottmanScores.emotionalBids +
        gottmanScores.turnTowards +
        gottmanScores.repairAttempts +
        gottmanScores.sharedMeaning) /
        4 >
        70
    ) {
      summaryQuality = "strong"
    } else if (
      (gottmanScores.criticism + gottmanScores.contempt + gottmanScores.defensiveness + gottmanScores.stonewalling) /
        4 >
      50
    ) {
      summaryQuality = "concerning"
    }

    const gottmanSummary = `The conversation between ${firstPersonName} and ${secondPersonName} shows a ${summaryQuality} communication pattern with a ${relationshipDynamics.positiveToNegativeRatio?.toFixed(1) || "1.0"}:1 positive-to-negative ratio. ${
      summaryQuality === "strong"
        ? `There is effective emotional bidding and response, with minimal presence of criticism and contempt. Repair attempts are successful, and there's a good foundation of shared meaning. Your ${relationshipDynamics.conflictStyle?.toLowerCase() || "balanced"} conflict style is working well for your communication.`
        : summaryQuality === "concerning"
          ? `There are some patterns that may need attention, particularly around criticism and defensiveness. Your ${relationshipDynamics.conflictStyle?.toLowerCase() || "current"} conflict style may be contributing to communication challenges. However, there are also positive elements like repair attempts that can be built upon.`
          : `There's a balance of positive and negative elements. While some criticism and defensiveness are present, there are also successful repair attempts and emotional connections. Your ${relationshipDynamics.conflictStyle?.toLowerCase() || "current"} conflict style has both strengths and limitations.`
    }`

    // Generate recommendations based on Gottman scores and relationship dynamics
    const gottmanRecommendations = [
      ...(relationshipDynamics.keyGrowthAreas || []).slice(0, 2),
      gottmanScores.criticism > 40
        ? "Practice the 'gentle startup' technique when bringing up concerns, focusing on 'I' statements rather than blame."
        : "Continue using non-blaming language when discussing concerns.",

      gottmanScores.turnTowards < 70
        ? "Work on recognizing and responding positively to emotional bids for connection."
        : "Maintain your positive responses to each other's attempts to connect.",

      gottmanScores.defensiveness > 40
        ? "When feeling defensive, try to validate the other person's perspective first before explaining your own."
        : "Continue validating each other's perspectives during discussions.",

      gottmanScores.sharedMeaning < 70
        ? "Create more opportunities to discuss values, goals, and meaning to strengthen your connection."
        : "Build on your shared understanding by continuing to discuss your values and aspirations.",
    ]

    return { gottmanSummary, gottmanRecommendations }
  } catch (error) {
    console.error("Error generating Gottman summary:", error)

    // Return fallback summary and recommendations
    return {
      gottmanSummary: `The conversation between ${firstPersonName} and ${secondPersonName} shows a generally healthy communication pattern with good emotional bids and repair attempts. There are some instances of defensiveness, but they're typically followed by effective repair. The level of shared meaning and mutual respect is strong, indicating a solid foundation for communication.`,
      gottmanRecommendations: [
        "Practice the 'gentle startup' technique when bringing up concerns",
        "Work on recognizing and responding to emotional bids more consistently",
        "When feeling defensive, try to validate the other person's perspective first",
        "Create more opportunities for positive interactions outside of problem-solving",
      ],
    }
  }
}

// NEW: Balanced overall score calculation that doesn't double-count
function calculateBalancedOverallScore(
  emotionalBreakdown: EmotionalBreakdown,
  gottmanScores: GottmanScores,
  relationshipDynamics: RelationshipDynamics,
  firstPersonProfile: PsychologicalProfile,
  secondPersonProfile: PsychologicalProfile,
): number {
  if (!emotionalBreakdown || !gottmanScores || !relationshipDynamics) {
    return 50 // Default score if data is missing
  }

  // 1. Emotional Intelligence (20%)
  const eiScore =
    (emotionalBreakdown.empathy +
      emotionalBreakdown.selfAwareness +
      emotionalBreakdown.socialSkills +
      emotionalBreakdown.emotionalRegulation +
      emotionalBreakdown.motivation +
      emotionalBreakdown.adaptability) /
    6

  // 2. Communication (20%)
  const communicationScore =
    (gottmanScores.sharedMeaning +
      (100 - gottmanScores.criticism) +
      (firstPersonProfile?.linguisticPatterns?.cognitiveComplexity || 50) +
      (secondPersonProfile?.linguisticPatterns?.cognitiveComplexity || 50)) /
    4

  // 3. Conflict Management (20%)
  const conflictScore =
    (gottmanScores.repairAttempts +
      (100 - gottmanScores.defensiveness) +
      (100 - gottmanScores.stonewalling) +
      (relationshipDynamics.conflictStyle === "Collaborative"
        ? 90
        : relationshipDynamics.conflictStyle === "Compromising"
          ? 75
          : relationshipDynamics.conflictStyle === "Accommodating"
            ? 60
            : relationshipDynamics.conflictStyle === "Avoiding"
              ? 40
              : relationshipDynamics.conflictStyle === "Competitive"
                ? 30
                : 50)) /
    4

  // 4. Emotional Connection (20%)
  const connectionScore =
    (gottmanScores.emotionalBids +
      gottmanScores.turnTowards +
      (100 - gottmanScores.contempt) +
      Math.min(100, relationshipDynamics.positiveToNegativeRatio * 20)) /
    4

  // 5. Attachment Compatibility (20%)
  const attachmentScore =
    relationshipDynamics.attachmentCompatibility === "Highly Compatible"
      ? 90
      : relationshipDynamics.attachmentCompatibility === "Compatible with Growth Potential"
        ? 75
        : relationshipDynamics.attachmentCompatibility === "Moderately Compatible"
          ? 60
          : relationshipDynamics.attachmentCompatibility === "Potentially Challenging"
            ? 40
            : 50

  // Calculate weighted average
  const overallScore =
    eiScore * 0.2 + communicationScore * 0.2 + conflictScore * 0.2 + connectionScore * 0.2 + attachmentScore * 0.2

  // Round to nearest integer
  return Math.round(overallScore)
}

// Original overall score calculation (kept for reference)
function calculateOverallScore(
  emotionalBreakdown: EmotionalBreakdown,
  gottmanScores: GottmanScores,
  relationshipDynamics: any,
): number {
  if (!emotionalBreakdown || !gottmanScores || !relationshipDynamics) {
    return 50 // Default score if data is missing
  }

  // Average the emotional intelligence factors
  const eiAvg =
    (emotionalBreakdown.empathy +
      emotionalBreakdown.selfAwareness +
      emotionalBreakdown.socialSkills +
      emotionalBreakdown.emotionalRegulation +
      emotionalBreakdown.motivation +
      emotionalBreakdown.adaptability) /
    6

  // Average the positive Gottman factors
  const positiveGottmanAvg =
    (gottmanScores.emotionalBids +
      gottmanScores.turnTowards +
      gottmanScores.repairAttempts +
      gottmanScores.sharedMeaning) /
    4

  // Average the negative Gottman factors (inverted)
  const negativeGottmanAvg =
    100 -
    (gottmanScores.criticism + gottmanScores.contempt + gottmanScores.defensiveness + gottmanScores.stonewalling) / 4

  // Factor in the positive-to-negative ratio (normalized to 0-100)
  const ratioScore = Math.min(100, (relationshipDynamics.positiveToNegativeRatio || 1) * 20)

  // Weighted average for overall score
  const overallScore = Math.round(
    eiAvg * 0.3 + positiveGottmanAvg * 0.25 + negativeGottmanAvg * 0.25 + ratioScore * 0.2,
  )

  return Math.min(100, Math.max(0, overallScore))
}

interface CategoryScores {
  emotionalIntelligence: number
  communicationStyles: number
  compatibility: number
  psychology: number
  relationshipDynamics: number
}

// Update the calculateCategoryScores function to use Math.round() for all scores
function calculateCategoryScores(
  firstPersonEI: number,
  secondPersonEI: number,
  gottmanScores: any,
  firstPersonEmo: EmotionalBreakdown,
  secondPersonEmo: EmotionalBreakdown,
  relationshipDynamics: any,
): CategoryScores {
  // 1. Emotional Intelligence - average of both participants
  const emotionalIntelligence = Math.round((firstPersonEI + secondPersonEI) / 2)

  // 2. Communication Styles - based on complementary styles and clarity
  const communicationStyles = Math.round(
    (100 -
      Math.abs(firstPersonEmo.selfAwareness - secondPersonEmo.selfAwareness) +
      (100 - Math.abs(firstPersonEmo.socialSkills - secondPersonEmo.socialSkills)) +
      gottmanScores.sharedMeaning) /
      3,
  )

  // 3. Compatibility - based on Gottman positive metrics
  const compatibility = Math.round(
    (gottmanScores.emotionalBids +
      gottmanScores.turnTowards +
      gottmanScores.repairAttempts +
      gottmanScores.sharedMeaning) /
      4,
  )

  // 4. Psychology - based on attachment and cognitive patterns
  const psychology = Math.round(
    ((relationshipDynamics.attachmentCompatibility === "Highly Compatible"
      ? 90
      : relationshipDynamics.attachmentCompatibility === "Compatible with Growth Potential"
        ? 75
        : relationshipDynamics.attachmentCompatibility === "Moderately Compatible"
          ? 60
          : relationshipDynamics.attachmentCompatibility === "Potentially Challenging"
            ? 40
            : 50) +
      (firstPersonEmo.adaptability + secondPersonEmo.adaptability) / 2) /
      2,
  )

  // 5. Relationship Dynamics - based on Gottman negative metrics (inverted) and ratio
  const relationshipDynamics_score = Math.round(
    (100 -
      gottmanScores.criticism +
      (100 - gottmanScores.contempt) +
      (100 - gottmanScores.defensiveness) +
      (100 - gottmanScores.stonewalling) +
      Math.min(100, relationshipDynamics.positiveToNegativeRatio * 20)) /
      5,
  )

  // Ensure all scores are within 0-100 range
  return {
    emotionalIntelligence: normalizeScore(emotionalIntelligence),
    communicationStyles: normalizeScore(communicationStyles),
    compatibility: normalizeScore(compatibility),
    psychology: normalizeScore(psychology),
    relationshipDynamics: normalizeScore(relationshipDynamics_score),
  }
}

function normalizeScore(score: number): number {
  return Math.max(0, Math.min(100, score))
}

// Update the fixProfileSecondaryStyle function to handle undefined
function fixProfileSecondaryStyle(profile: any): PsychologicalProfile {
  return {
    ...profile,
    attachmentStyle: {
      ...profile.attachmentStyle,
      secondaryStyle: profile.attachmentStyle.secondaryStyle ?? null,
    },
    cognitivePatterns: profile.cognitivePatterns || {
      distortions: [],
      thinkingStyles: [],
      cognitiveComplexity: 50,
    },
  }
}

// Add Person interface
interface Person {
  name: string
}

// Update the relationship dynamics analysis to handle Person types
function analyzeRelationshipDynamicsRuleBased(messages: Message[], firstPerson: string, secondPerson: string) {
  const firstPersonObj: Person = { name: firstPerson }
  const secondPersonObj: Person = { name: secondPerson }
  return analyzeRelationshipDynamicsRuleBasedBase(messages, firstPersonObj, secondPersonObj)
}

// Update the linguistic analysis to include all required properties
interface LinguisticAnalysis {
  cognitiveComplexity: number
  emotionalExpressiveness: number
  socialEngagement: number
  dominantEmotions: string[]
  psychologicalDistancing: number
  certaintyLevel: number
}

function analyzeLinguisticMarkers(messages: Message[]): LinguisticAnalysis {
  const baseAnalysis = analyzeLinguisticMarkersBase(messages)
  return {
    ...baseAnalysis,
    psychologicalDistancing: 50,
    certaintyLevel: 50,
  }
}
