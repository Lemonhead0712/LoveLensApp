import type { AnalysisResults, Message } from "./types"
import { extractMessagesFromScreenshots } from "./ocr-service"
import { analyzeSentiment } from "./sentiment-analyzer"
import { saveAnalysisResults, getAnalysisResults, storeTransformedAnalysisResult } from "./storage-utils"
import { validateAnalysisResults } from "./result-validator"
import { generatePsychologicalProfile } from "./psychological-frameworks"
import { fetchGPTEmotionalAnalysis } from "./gpt-ei-service"

// Import the data validation utility
import { ensureValidEmotionalIntelligenceData } from "./data-validation"

// Import enhanced OCR and single screenshot analysis
import { performOcr } from "./ocr-service-enhanced"
import { analyzeText as analyzeSentimentText } from "./sentiment-analyzer"
import { extractEmotionalInsights } from "./gpt-ei-service"

// Main function to analyze screenshots
export async function analyzeScreenshots(
  screenshots: File[],
  firstPersonName: string,
  secondPersonName: string,
): Promise<AnalysisResults> {
  try {
    console.log(`Starting analysis for ${screenshots.length} screenshots`)
    console.log(`First person: ${firstPersonName}, Second person: ${secondPersonName}`)

    // Extract messages from screenshots
    let extractedMessages: Message[] = []
    try {
      extractedMessages = await extractMessagesFromScreenshots(screenshots, firstPersonName, secondPersonName)
      console.log(`Extracted ${extractedMessages.length} messages`)

      // Ensure we have real extracted messages, not synthetic ones
      if (!extractedMessages || extractedMessages.length === 0) {
        throw new Error("OCR failed: No messages could be extracted from the screenshots.")
      }
    } catch (ocrError) {
      console.error("OCR extraction failed:", ocrError)
      throw new Error(`OCR extraction failed: ${ocrError instanceof Error ? ocrError.message : String(ocrError)}`)
    }

    // 🔁 Re-Establish Two-Way Separation - Clearly separate messages by sender
    const messagesA = extractedMessages.filter((msg) => msg.sender === firstPersonName)
    const messagesB = extractedMessages.filter((msg) => msg.sender === secondPersonName)

    if (!messagesA.length || !messagesB.length) {
      throw new Error("OCR message separation failed: One or both sides have zero messages.")
    }

    console.log(
      `Separated messages - ${firstPersonName}: ${messagesA.length}, ${secondPersonName}: ${messagesB.length}`,
    )

    // ✅ Soft Handling + Logging - Replace error throwing with warnings
    const validationWarnings: string[] = []

    if (!messagesA || messagesA.length === 0) {
      const warning = `⚠️ No messages from ${firstPersonName}. Skipping their analysis.`
      console.warn(warning)
      validationWarnings.push(warning)
    }

    if (!messagesB || messagesB.length === 0) {
      const warning = `⚠️ No messages from ${secondPersonName}. Skipping their analysis.`
      console.warn(warning)
      validationWarnings.push(warning)
    }

    // Initialize variables with default values
    let sentimentA: any = { overallScore: 0, messagesWithSentiment: [], gottmanScores: {}, relationshipDynamics: {} }
    let sentimentB: any = { overallScore: 0, messagesWithSentiment: [], gottmanScores: {}, relationshipDynamics: {} }
    let linguisticA: any = {}
    let linguisticB: any = {}
    let communicationStyleA = "Unknown"
    let communicationStyleB = "Unknown"
    let profileA: any = {
      attachmentStyle: { primaryStyle: "Unknown" },
      transactionalAnalysis: { dominantEgoState: "Unknown" },
      cognitivePatterns: {},
    }
    let profileB: any = {
      attachmentStyle: { primaryStyle: "Unknown" },
      transactionalAnalysis: { dominantEgoState: "Unknown" },
      cognitivePatterns: {},
    }
    let emotionalBreakdownA: any = {}
    let emotionalBreakdownB: any = {}
    let emotionalIntelligenceA = 0
    let emotionalIntelligenceB = 0

    // ✅ Wrap Each Participant's Analysis in Conditional Blocks
    const participants: any[] = []

    // 🆕 Fetch GPT-powered emotional analysis
    console.log("Fetching GPT emotional analysis...")
    const { analysis: emotionalInsights, error: gptError } = await fetchGPTEmotionalAnalysis(
      extractedMessages,
      firstPersonName,
      secondPersonName,
    )

    if (gptError) {
      console.warn("GPT analysis error:", gptError)
      validationWarnings.push(`⚠️ GPT analysis error: ${gptError.error}`)

      if (gptError.status === 429) {
        validationWarnings.push(`⚠️ Rate limit exceeded. Try again in ${Math.ceil((gptError.reset || 0) / 60)} minutes.`)
      }
    }

    console.log("GPT emotional analysis complete")

    // Analyze first person if they have messages
    if (messagesA && messagesA.length > 0) {
      console.log(`Analyzing sentiment for ${firstPersonName}...`)
      sentimentA = await analyzeSentiment(messagesA, firstPersonName)

      console.log(`Analyzing linguistic patterns for ${firstPersonName}...`)
      linguisticA = calculateLinguisticPatterns(messagesA)

      console.log(`Determining communication style for ${firstPersonName}...`)
      communicationStyleA = determineCommStyle(linguisticA, messagesA)

      console.log(`Generating psychological profile for ${firstPersonName}...`)
      profileA = generatePsychologicalProfile(messagesA, firstPersonName)

      console.log(`Calculating emotional intelligence for ${firstPersonName}...`)
      emotionalBreakdownA = ensureValidEmotionalIntelligenceData(
        calculateEmotionalBreakdown(messagesA, sentimentA.overallScore),
      )
      emotionalIntelligenceA = calculateEmotionalIntelligence(
        emotionalBreakdownA,
        sentimentA.firstPersonProfile,
        linguisticA,
        messagesA,
      )

      // Add first person to participants array
      participants.push({
        name: firstPersonName,
        communicationStyle: communicationStyleA,
        emotionalIntelligence: emotionalIntelligenceA,
        attachmentStyle: profileA.attachmentStyle.primaryStyle,
        egoState: profileA.transactionalAnalysis.dominantEgoState,
        cognitivePatterns: profileA.cognitivePatterns,
        emotionalBreakdown: emotionalBreakdownA,
        psychologicalProfile: profileA,
        sentiment: sentimentA.overallScore,
        linguisticPatterns: linguisticA,
        insights: sentimentA.insights || [],
        recommendations: sentimentA.recommendations || [],
        // 🆕 Add GPT emotional insights with null safety
        gptEmotionalInsights: emotionalInsights?.forPersonA || null,
        // 🆕 Add analysis metadata
        gptAnalysisMetadata: emotionalInsights?._metadata || null,
      })
    } else {
      throw new Error(`No messages found from ${firstPersonName}. Analysis cannot proceed.`)
    }

    // Analyze second person if they have messages
    if (messagesB && messagesB.length > 0) {
      console.log(`Analyzing sentiment for ${secondPersonName}...`)
      sentimentB = await analyzeSentiment(messagesB, secondPersonName)

      console.log(`Analyzing linguistic patterns for ${secondPersonName}...`)
      linguisticB = calculateLinguisticPatterns(messagesB)

      console.log(`Determining communication style for ${secondPersonName}...`)
      communicationStyleB = determineCommStyle(linguisticB, messagesB)

      console.log(`Generating psychological profile for ${secondPersonName}...`)
      profileB = generatePsychologicalProfile(messagesB, secondPersonName)

      console.log(`Calculating emotional intelligence for ${secondPersonName}...`)
      emotionalBreakdownB = ensureValidEmotionalIntelligenceData(
        calculateEmotionalBreakdown(messagesB, sentimentB.overallScore),
      )
      emotionalIntelligenceB = calculateEmotionalIntelligence(
        emotionalBreakdownB,
        sentimentB.firstPersonProfile,
        linguisticB,
        messagesB,
      )

      // Add second person to participants array
      participants.push({
        name: secondPersonName,
        communicationStyle: communicationStyleB,
        emotionalIntelligence: emotionalIntelligenceB,
        attachmentStyle: profileB.attachmentStyle.primaryStyle,
        egoState: profileB.transactionalAnalysis.dominantEgoState,
        cognitivePatterns: profileB.cognitivePatterns,
        emotionalBreakdown: emotionalBreakdownB,
        psychologicalProfile: profileB,
        sentiment: sentimentB.overallScore,
        linguisticPatterns: linguisticB,
        insights: sentimentB.insights || [],
        recommendations: sentimentB.recommendations || [],
        // 🆕 Add GPT emotional insights
        gptEmotionalInsights: emotionalInsights?.forPersonB || null,
        // 🆕 Add analysis metadata
        gptAnalysisMetadata: emotionalInsights?._metadata || null,
      })
    } else {
      throw new Error(`No messages found from ${secondPersonName}. Analysis cannot proceed.`)
    }

    // Calculate compatibility only if both participants have messages
    let compatibility: any = null
    if (messagesA && messagesA.length > 0 && messagesB && messagesB.length > 0) {
      // Calculate compatibility scores
      const attachmentCompatibilityScore = calculateAttachmentCompatibility(
        profileA.attachmentStyle.primaryStyle,
        profileB.attachmentStyle.primaryStyle,
      )

      const communicationStyleCompatibilityScore = calculateCommunicationStyleCompatibility(
        communicationStyleA,
        communicationStyleB,
      )

      const emotionalSyncScore = calculateEmotionalSynchrony(emotionalBreakdownA, emotionalBreakdownB)

      // Calculate category scores
      const categoryScores = calculateCategoryScores(
        emotionalIntelligenceA,
        emotionalIntelligenceB,
        sentimentA.gottmanScores,
        emotionalBreakdownA,
        emotionalBreakdownB,
        sentimentA.relationshipDynamics,
        communicationStyleA,
        communicationStyleB,
        profileA,
        profileB,
      )

      const finalCompatibilityScore = calculateFinalCompatibilityScore(categoryScores)

      // Structure the compatibility data
      compatibility = {
        attachment: attachmentCompatibilityScore,
        communication: communicationStyleCompatibilityScore,
        emotionalSync: emotionalSyncScore,
        categoryScores,
        finalScore: finalCompatibilityScore,
        gottmanScores: sentimentA.gottmanScores,
        relationshipDynamics: sentimentA.relationshipDynamics,
        // 🆕 Add GPT relationship dynamics
        gptRelationshipDynamics: emotionalInsights?.relationshipDynamics,
        // 🆕 Add analysis metadata
        gptAnalysisMetadata: emotionalInsights?._metadata || null,
      }
    } else {
      throw new Error("Compatibility analysis requires messages from both participants.")
    }

    // Enhance the messagesWithSentiment handling in analyzeScreenshots
    // Combine messages with sentiment
    const messagesWithSentiment = [
      ...(sentimentA.messagesWithSentiment || []),
      ...(sentimentB.messagesWithSentiment || []),
    ].sort((a, b) =>
      a.timestamp && b.timestamp ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime() : 0,
    )

    // Ensure each message has required properties
    const enhancedMessagesWithSentiment = messagesWithSentiment.map((msg) => ({
      ...msg,
      sender: msg.sender || "Unknown",
      text: msg.text || "",
      timestamp: msg.timestamp || new Date().toISOString(),
      sentiment: msg.sentiment || 50,
      sentimentScore: msg.sentimentScore || 50,
      detectedTone: msg.detectedTone || "neutral",
    }))

    // Build the final results object
    const results = {
      id: generateAnalysisId(),
      timestamp: new Date().toISOString(),
      participants,
      compatibility,
      messagesWithSentiment: enhancedMessagesWithSentiment,
      keyMoments: [...(sentimentA.keyMoments || []), ...(sentimentB.keyMoments || [])],
      gottmanSummary: sentimentA.gottmanSummary || "Analysis incomplete due to insufficient data.",
      gottmanRecommendations: sentimentA.gottmanRecommendations || [],
      analysisMethod: "gpt-enhanced", // 🆕 Update analysis method
      validationWarnings,
    }

    // Log the messagesWithSentiment for debugging
    console.log(`Final messagesWithSentiment count: ${enhancedMessagesWithSentiment.length}`)
    console.log(
      "Sample messagesWithSentiment:",
      enhancedMessagesWithSentiment.length > 0
        ? enhancedMessagesWithSentiment.slice(0, 2)
        : "No messages with sentiment",
    )

    // Validate results to ensure they're not too similar
    const validationResult = validateAnalysisResults(results)

    // Combine existing warnings with new ones
    if (validationResult.warnings && validationResult.warnings.length > 0) {
      results.validationWarnings = [...results.validationWarnings, ...validationResult.warnings]
    }

    // Save analysis results
    await saveAnalysisResults(results)
    await storeTransformedAnalysisResult(results)

    // Log the final results for debugging
    console.log("Final Results:", JSON.stringify(results, null, 2))

    return results
  } catch (error) {
    console.error("Error analyzing screenshots:", error)
    throw error // Propagate the error instead of returning a fallback result
  }
}

// Function to get previous analysis results
export async function getPreviousAnalysis(): Promise<AnalysisResults | null> {
  try {
    return await getAnalysisResults()
  } catch (error) {
    console.error("Error getting previous analysis:", error)
    return null
  }
}

// Calculate linguistic patterns from messages directly
function calculateLinguisticPatterns(messages: Message[]) {
  // 🚫 Step 3: Remove Fallback Profiles - Ensure we have messages
  if (!messages || messages.length === 0) {
    throw new Error("Cannot calculate linguistic patterns: No messages provided")
  }

  // Calculate emotional expressiveness based on sentiment variance
  const sentiments = messages.map((m) => m.sentiment || 50)
  const avgSentiment = sentiments.reduce((sum, val) => sum + val, 0) / sentiments.length
  const variance = sentiments.reduce((sum, val) => sum + Math.pow(val - avgSentiment, 2), 0) / sentiments.length
  const emotionalExpressiveness = Math.min(100, Math.max(30, 50 + variance / 10))

  // Calculate cognitive complexity based on message length and vocabulary
  const avgLength = messages.reduce((sum, m) => sum + (m.text?.length || 0), 0) / messages.length
  const uniqueWords = new Set(
    messages.flatMap((m) => {
      // Add type checking for message.text
      const text = typeof m.text === "string" ? m.text.toLowerCase() : ""
      return text.split(/\s+/)
    }),
  ).size
  const cognitiveComplexity = Math.min(100, Math.max(30, 40 + avgLength / 10 + uniqueWords / 20))

  // Calculate social engagement based on message frequency and questions
  const questionCount = messages.filter((m) => {
    const text = typeof m.text === "string" ? m.text : ""
    return text.includes("?")
  }).length
  const questionRatio = questionCount / messages.length
  const socialEngagement = Math.min(100, Math.max(30, 40 + messages.length / 2 + questionRatio * 50))

  // Calculate psychological distancing based on third-person references
  const thirdPersonCount = messages.filter((m) => {
    const text = typeof m.text === "string" ? m.text.toLowerCase() : ""
    return text.includes(" he ") || text.includes(" she ") || text.includes(" they ") || text.includes(" them ")
  }).length
  const thirdPersonRatio = thirdPersonCount / messages.length
  const psychologicalDistancing = Math.min(100, Math.max(30, 40 + thirdPersonRatio * 100))

  // Calculate certainty level based on definitive language
  const certaintyKeywords = ["definitely", "always", "never", "must", "absolutely", "certainly", "sure", "know"]
  const uncertaintyKeywords = ["maybe", "perhaps", "possibly", "might", "could", "sometimes", "think", "guess"]

  let certaintyCount = 0
  let uncertaintyCount = 0

  messages.forEach((message) => {
    const text = typeof message.text === "string" ? message.text.toLowerCase() : ""

    certaintyKeywords.forEach((keyword) => {
      if (text.includes(keyword)) certaintyCount++
    })

    uncertaintyKeywords.forEach((keyword) => {
      if (text.includes(keyword)) uncertaintyCount++
    })
  })

  const totalCertaintyWords = certaintyCount + uncertaintyCount || 1
  const certaintyRatio = certaintyCount / totalCertaintyWords
  const certaintyLevel = Math.min(100, Math.max(30, 40 + certaintyRatio * 60))

  return {
    emotionalExpressiveness,
    cognitiveComplexity,
    socialEngagement,
    dominantEmotions: determineDominantEmotions(messages),
    psychologicalDistancing,
    certaintyLevel,
  }
}

// Determine dominant emotions from messages
function determineDominantEmotions(messages: Message[]): string[] {
  // 🚫 Step 3: Remove Fallback Profiles - Ensure we have messages
  if (!messages || messages.length === 0) {
    throw new Error("Cannot determine dominant emotions: No messages provided")
  }

  const emotionKeywords = {
    Joy: ["happy", "joy", "glad", "excited", "great", "😊", "😃", "😄"],
    Sadness: ["sad", "sorry", "miss", "upset", "disappointed", "😢", "😔", "😞"],
    Anger: ["angry", "mad", "annoyed", "frustrated", "😠", "😡", "😤"],
    Fear: ["afraid", "worried", "nervous", "scared", "anxious", "😨", "😰", "😱"],
    Surprise: ["wow", "omg", "surprised", "unexpected", "😮", "😲", "😯"],
    Trust: ["trust", "believe", "sure", "definitely", "rely", "count on"],
    Anticipation: ["looking forward", "can't wait", "hope", "excited for"],
    Disgust: ["gross", "disgusting", "ew", "yuck", "🤢", "🤮"],
  }

  const emotionCounts: Record<string, number> = {}

  // Initialize counts
  Object.keys(emotionKeywords).forEach((emotion) => {
    emotionCounts[emotion] = 0
  })

  // Count emotion keywords in messages
  messages.forEach((message) => {
    // Add type checking for message.text
    const text = typeof message.text === "string" ? message.text.toLowerCase() : ""

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      keywords.forEach((keyword) => {
        if (text.includes(keyword)) {
          emotionCounts[emotion]++
        }
      })
    })
  })

  // Sort emotions by count and return top 3
  return Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([emotion]) => emotion)
}

// Calculate sentiment based on message count, not length
function calculateNormalizedSentiment(messages: Message[]): number {
  // 🚫 Step 3: Remove Fallback Profiles - Ensure we have messages
  if (!messages || messages.length === 0) {
    throw new Error("Cannot calculate sentiment: No messages provided")
  }

  // Simple average of sentiment scores
  const sum = messages.reduce((total, msg) => total + (msg.sentiment ?? 50), 0)
  return Math.round(sum / messages.length)
}

// Normalize score within bounds
function normalizeScore(value: number, min = 0, max = 100): number {
  // Ensure value is within bounds
  return Math.min(max, Math.max(min, value))
}

// Helper function to normalize linguistic patterns between two participants
function normalizeLinguisticPatterns(firstPatterns: any, secondPatterns: any) {
  // 🚫 Step 3: Remove Fallback Profiles - Ensure we have patterns
  if (!firstPatterns || !secondPatterns) {
    throw new Error("Cannot normalize linguistic patterns: Missing pattern data")
  }

  // Normalize emotional expressiveness
  const minExp = Math.min(firstPatterns.emotionalExpressiveness || 0, secondPatterns.emotionalExpressiveness || 0)
  const maxExp = Math.max(firstPatterns.emotionalExpressiveness || 100, secondPatterns.emotionalExpressiveness || 100)
  const normExpFirst = normalizeScore(firstPatterns.emotionalExpressiveness || 50, minExp, maxExp)
  const normExpSecond = normalizeScore(secondPatterns.emotionalExpressiveness || 50, minExp, maxExp)

  // Normalize cognitive complexity
  const minCog = Math.min(firstPatterns.cognitiveComplexity || 0, secondPatterns.cognitiveComplexity || 0)
  const maxCog = Math.max(firstPatterns.cognitiveComplexity || 100, secondPatterns.cognitiveComplexity || 100)
  const normCogFirst = normalizeScore(firstPatterns.cognitiveComplexity || 50, minCog, maxCog)
  const normCogSecond = normalizeScore(secondPatterns.cognitiveComplexity || 50, minCog, maxCog)

  // Normalize social engagement
  const minSoc = Math.min(firstPatterns.socialEngagement || 0, secondPatterns.socialEngagement || 0)
  const maxSoc = Math.max(firstPatterns.socialEngagement || 100, secondPatterns.cognitiveComplexity || 100)
  const normSocFirst = normalizeScore(firstPatterns.socialEngagement || 50, minSoc, maxSoc)
  const normSocSecond = normalizeScore(secondPatterns.socialEngagement || 50, minSoc, maxSoc)

  // Normalize psychological distancing
  const minDist = Math.min(firstPatterns.psychologicalDistancing || 0, secondPatterns.psychologicalDistancing || 0)
  const maxDist = Math.max(firstPatterns.psychologicalDistancing || 100, secondPatterns.psychologicalDistancing || 100)
  const normDistFirst = normalizeScore(firstPatterns.psychologicalDistancing || 50, minDist, maxDist)
  const normDistSecond = normalizeScore(secondPatterns.psychologicalDistancing || 50, minDist, maxDist)

  // Normalize certainty level
  const minCert = Math.min(firstPatterns.certaintyLevel || 0, secondPatterns.certaintyLevel || 0)
  const maxCert = Math.max(firstPatterns.certaintyLevel || 100, secondPatterns.certaintyLevel || 100)
  const normCertFirst = normalizeScore(firstPatterns.certaintyLevel || 50, minCert, maxCert)
  const normCertSecond = normalizeScore(secondPatterns.certaintyLevel || 50, minCert, maxCert)

  return {
    first: {
      emotionalExpressiveness: normExpFirst,
      cognitiveComplexity: normCogFirst,
      socialEngagement: normSocFirst,
      psychologicalDistancing: normDistFirst,
      certaintyLevel: normCertFirst,
      // Keep the original dominant emotions with null safety
      dominantEmotions: firstPatterns.dominantEmotions || [],
    },
    second: {
      emotionalExpressiveness: normExpSecond,
      cognitiveComplexity: normCogSecond,
      socialEngagement: normSocSecond,
      psychologicalDistancing: normDistSecond,
      certaintyLevel: normCertSecond,
      // Keep the original dominant emotions with null safety
      dominantEmotions: secondPatterns.dominantEmotions || [],
    },
  }
}

// Helper function to calculate emotional intelligence score with normalized values
function calculateEmotionalIntelligence(
  emotionalBreakdown: any,
  profile: any,
  linguisticPatterns: any,
  messages: Message[],
): number {
  // 🚫 Step 3: Remove Fallback Profiles - Ensure we have messages
  if (!messages || messages.length === 0) {
    throw new Error("Cannot calculate emotional intelligence: No messages provided")
  }

  // Calculate attachment score based on message patterns
  const attachmentScore = calculateAttachmentScore(messages)

  // Calculate linguistic score
  const linguisticScore =
    (linguisticPatterns.emotionalExpressiveness +
      linguisticPatterns.cognitiveComplexity +
      linguisticPatterns.socialEngagement +
      (100 - (linguisticPatterns.psychologicalDistancing || 50))) /
    4

  // Calculate emotional score
  const emotionalScore =
    (emotionalBreakdown.empathy +
      emotionalBreakdown.selfAwareness +
      emotionalBreakdown.emotionalRegulation +
      emotionalBreakdown.socialSkills +
      emotionalBreakdown.motivation +
      emotionalBreakdown.adaptability) /
    6

  // Weighted average of different scores
  return Math.round(attachmentScore * 0.3 + linguisticScore * 0.3 + emotionalScore * 0.4)
}

// Calculate attachment score from messages
function calculateAttachmentScore(messages: Message[]): number {
  // 🚫 Step 3: Remove Fallback Profiles - Ensure we have messages
  if (!messages || messages.length === 0) {
    throw new Error("Cannot calculate attachment score: No messages provided")
  }

  // Keywords associated with different attachment styles
  const secureKeywords = ["trust", "comfortable", "support", "together", "understand"]
  const anxiousKeywords = ["worry", "afraid", "need", "miss", "alone", "always"]
  const avoidantKeywords = ["space", "independent", "fine", "busy", "later", "time"]

  let secureCount = 0
  let anxiousCount = 0
  let avoidantCount = 0

  messages.forEach((message) => {
    // Add type checking for message.text
    const text = typeof message.text === "string" ? message.text.toLowerCase() : ""

    secureKeywords.forEach((keyword) => {
      if (text.includes(keyword)) secureCount++
    })

    anxiousKeywords.forEach((keyword) => {
      if (text.includes(keyword)) anxiousCount++
    })

    avoidantKeywords.forEach((keyword) => {
      if (text.includes(keyword)) avoidantCount++
    })
  })

  const total = secureCount + anxiousCount + avoidantCount || 1
  const secureRatio = secureCount / total

  // Higher secure ratio = higher attachment score
  return Math.round(65 + secureRatio * 30)
}

// Helper function to determine communication style using linguistic patterns
function determineCommStyle(linguisticPatterns: any, messages: Message[]): string {
  // 🚫 Step 3: Remove Fallback Profiles - Ensure we have messages
  if (!messages || messages.length === 0) {
    throw new Error("Cannot determine communication style: No messages provided")
  }

  // Calculate scores for each style using linguistic patterns
  const assertiveScore = linguisticPatterns.certaintyLevel * 0.7 + linguisticPatterns.psychologicalDistancing * 0.3

  const analyticalScore = linguisticPatterns.cognitiveComplexity * 0.6 + linguisticPatterns.certaintyLevel * 0.4

  const expressiveScore = linguisticPatterns.emotionalExpressiveness * 0.8 + linguisticPatterns.socialEngagement * 0.2

  const supportiveScore = linguisticPatterns.emotionalExpressiveness * 0.5 + linguisticPatterns.socialEngagement * 0.5

  // Calculate defensive score based on specific patterns
  const defensiveKeywords = ["not my fault", "you always", "you never", "i didn't", "wasn't me", "you're wrong"]
  let defensiveCount = 0

  messages.forEach((message) => {
    const text = typeof message.text === "string" ? message.text.toLowerCase() : ""

    defensiveKeywords.forEach((keyword) => {
      if (text.includes(keyword)) defensiveCount++
    })
  })

  const defensiveRatio = defensiveCount / messages.length
  const defensiveScore = Math.min(100, Math.max(30, 40 + defensiveRatio * 200))

  // Calculate passive score based on specific patterns
  const passiveKeywords = ["whatever", "i guess", "if you want", "doesn't matter", "up to you", "fine"]
  let passiveCount = 0

  messages.forEach((message) => {
    const text = typeof message.text === "string" ? message.text.toLowerCase() : ""

    passiveKeywords.forEach((keyword) => {
      if (text.includes(keyword)) passiveCount++
    })
  })

  const passiveRatio = passiveCount / messages.length
  const passiveScore = Math.min(100, Math.max(30, 40 + passiveRatio * 200))

  // Find the highest scoring style
  const scores = [
    { style: "Assertive", score: assertiveScore },
    { style: "Analytical", score: analyticalScore },
    { style: "Expressive", score: expressiveScore },
    { style: "Supportive", score: supportiveScore },
    { style: "Defensive", score: defensiveScore },
    { style: "Passive", score: passiveScore },
  ].sort((a, b) => b.score - a.score)

  // Return the highest scoring style
  return scores[0].style
}

// Helper function to generate timeline data from messages
function generateTimelineData(messages: Message[]) {
  // 🚫 Step 3: Remove Fallback Profiles - Ensure we have messages
  if (!messages || messages.length === 0) {
    throw new Error("Cannot generate timeline data: No messages provided")
  }

  return messages
    .map((message) => ({
      participant: message.sender,
      timestamp: message.timestamp || new Date().toISOString(),
      sentiment: message.sentiment || 50,
    }))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}

// Calculate emotional breakdown directly from messages
function calculateEmotionalBreakdown(messages: Message[], sentiment: number): any {
  // 🚫 Step 3: Remove Fallback Profiles - Ensure we have messages
  if (!messages || messages.length === 0) {
    throw new Error("Cannot calculate emotional breakdown: No messages provided")
  }

  // Calculate empathy based on question frequency and positive responses
  const questionCount = messages.filter((m) => {
    const text = typeof m.text === "string" ? m.text : ""
    return text.includes("?")
  }).length
  const questionRatio = questionCount / messages.length
  const positiveResponseCount = messages.filter((m) => (m.sentiment || 0) > 60).length
  const empathy = Math.min(100, Math.max(30, 40 + questionRatio * 50 + positiveResponseCount * 5))

  // Calculate self-awareness based on "I" statements and reflection
  const iStatementCount = messages.filter((m) => {
    const text = typeof m.text === "string" ? m.text.toLowerCase() : ""
    return text.includes(" i ") || text.startsWith("i ")
  }).length
  const iStatementRatio = iStatementCount / messages.length
  const selfAwareness = Math.min(100, Math.max(30, 40 + iStatementRatio * 60))

  // Calculate social skills based on engagement patterns
  const socialSkills = Math.min(100, Math.max(30, 40 + messages.length / 3))

  // Calculate emotional regulation based on sentiment consistency
  const sentiments = messages.map((m) => m.sentiment || 50)
  const avgSentiment = sentiments.reduce((sum, val) => sum + val, 0) / sentiments.length
  const variance = sentiments.reduce((sum, val) => sum + Math.pow(val - avgSentiment, 2), 0) / sentiments.length
  const emotionalRegulation = Math.min(100, Math.max(30, 80 - variance / 5))

  // Calculate motivation based on sentiment and message frequency
  const motivation = normalizeScore(sentiment + 10)

  // Calculate adaptability based on response variety
  const uniqueWords = new Set(
    messages.flatMap((m) => {
      const text = typeof m.text === "string" ? m.text.toLowerCase() : ""
      return text.split(/\s+/)
    }),
  ).size
  const uniqueWordsRatio =
    uniqueWords /
    (messages.reduce((sum, m) => {
      const text = typeof m.text === "string" ? m.text : ""
      return sum + (text.split(/\s+/).length || 0)
    }, 0) || 1)
  const adaptability = Math.min(100, Math.max(30, 40 + uniqueWordsRatio * 100))

  return ensureValidEmotionalIntelligenceData({
    empathy,
    selfAwareness,
    socialSkills,
    emotionalRegulation,
    motivation,
    adaptability,
  })
}

// Calculate emotional synchrony between two people's emotional breakdowns
function calculateEmotionalSynchrony(breakdownA: any, breakdownB: any): number {
  // If either breakdown is missing or empty, return a default value
  if (!breakdownA || !breakdownB || Object.keys(breakdownA).length === 0 || Object.keys(breakdownB).length === 0) {
    return 50 // Default middle value
  }

  // Calculate the difference in each emotional component
  const empathyDiff = Math.abs((breakdownA.empathy || 50) - (breakdownB.empathy || 50))
  const selfAwarenessDiff = Math.abs((breakdownA.selfAwareness || 50) - (breakdownB.selfAwareness || 50))
  const socialSkillsDiff = Math.abs((breakdownA.socialSkills || 50) - (breakdownB.socialSkills || 50))
  const emotionalRegulationDiff = Math.abs(
    (breakdownA.emotionalRegulation || 50) - (breakdownB.emotionalRegulation || 50),
  )
  const motivationDiff = Math.abs((breakdownA.motivation || 50) - (breakdownB.motivation || 50))
  const adaptabilityDiff = Math.abs((breakdownA.adaptability || 50) - (breakdownB.adaptability || 50))

  // Calculate the average difference
  const avgDiff =
    (empathyDiff + selfAwarenessDiff + socialSkillsDiff + emotionalRegulationDiff + motivationDiff + adaptabilityDiff) /
    6

  // Convert to a synchrony score (100 - average difference)
  return Math.round(100 - avgDiff)
}

// Calculate category scores for compatibility
function calculateCategoryScores(
  firstPersonEI: number,
  secondPersonEI: number,
  gottmanScores: any,
  firstPersonEmo: any,
  secondPersonEmo: any,
  relationshipDynamics: any,
  firstPersonCommStyle: string,
  secondPersonCommStyle: string,
  firstPersonPsychProfile: any,
  secondPersonPsychProfile: any,
): any {
  // Handle missing data with default values
  gottmanScores = gottmanScores || {}
  relationshipDynamics = relationshipDynamics || {}
  firstPersonEmo = firstPersonEmo || {}
  secondPersonEmo = secondPersonEmo || {}

  // 1. Emotional Intelligence - average of both participants
  const emotionalIntelligence = Math.round((firstPersonEI + secondPersonEI) / 2)

  // 2. Communication Styles - based on complementary styles and clarity
  // Calculate communication style compatibility
  const communicationStyleCompatibility = calculateCommunicationStyleCompatibility(
    firstPersonCommStyle,
    secondPersonCommStyle,
  )

  const communicationStyles = Math.round(
    (communicationStyleCompatibility +
      (100 - Math.abs((firstPersonEmo.selfAwareness || 50) - (secondPersonEmo.selfAwareness || 50))) +
      (100 - Math.abs((firstPersonEmo.socialSkills || 50) - (secondPersonEmo.socialSkills || 50))) +
      (gottmanScores?.sharedMeaning || 50)) /
      4,
  )

  // 3. Compatibility - based on Gottman positive metrics
  const compatibility = Math.round(
    ((gottmanScores?.emotionalBids || 50) +
      (gottmanScores?.turnTowards || 50) +
      (gottmanScores?.repairAttempts || 50) +
      (gottmanScores?.sharedMeaning || 50)) /
      4,
  )

  // 4. Psychology - based on attachment and cognitive patterns
  // Calculate attachment style compatibility
  const attachmentCompatibility = calculateAttachmentCompatibility(
    firstPersonPsychProfile?.attachmentStyle?.primaryStyle || "Unknown",
    secondPersonPsychProfile?.attachmentStyle?.primaryStyle || "Unknown",
  )

  const psychology = Math.round(
    (attachmentCompatibility + ((firstPersonEmo.adaptability || 50) + (secondPersonEmo.adaptability || 50)) / 2) / 2,
  )

  // 5. Relationship Dynamics - based on Gottman negative metrics (inverted) and ratio
  const relationshipDynamics_score = Math.round(
    (100 -
      (gottmanScores?.criticism || 50) +
      (100 - (gottmanScores?.contempt || 50)) +
      (100 - (gottmanScores?.defensiveness || 50)) +
      (100 - (gottmanScores?.stonewalling || 50)) +
      Math.min(100, (relationshipDynamics?.positiveToNegativeRatio || 1) * 20)) /
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

// Calculate attachment style compatibility
function calculateAttachmentCompatibility(style1: string, style2: string): number {
  // Default to 50 if either style is unknown
  if (style1 === "Unknown" || style2 === "Unknown") {
    return 50
  }

  // Define compatibility matrix for different attachment styles
  const compatibilityMatrix: Record<string, Record<string, number>> = {
    secure: {
      secure: 95, // Highly compatible
      anxious: 75, // Can work well with patience
      avoidant: 70, // Can work with understanding
      disorganized: 60, // Challenging but possible
    },
    anxious: {
      secure: 75, // Secure partner can provide stability
      anxious: 50, // May amplify each other's anxieties
      avoidant: 40, // Classic anxious-avoidant trap
      disorganized: 35, // Very challenging
    },
    avoidant: {
      secure: 70, // Secure partner can help avoidant open up
      anxious: 40, // Classic anxious-avoidant trap
      avoidant: 60, // May work due to mutual space needs
      disorganized: 30, // Very challenging
    },
    disorganized: {
      secure: 60, // Secure partner can provide stability
      anxious: 35, // Very challenging
      avoidant: 30, // Very challenging
      disorganized: 25, // Extremely challenging
    },
  }

  // Return compatibility score from matrix, or default to 50 if not found
  return compatibilityMatrix[style1.toLowerCase()]?.[style2.toLowerCase()] || 50
}

// Calculate communication style compatibility
function calculateCommunicationStyleCompatibility(style1: string, style2: string): number {
  // Default to 50 if either style is unknown
  if (style1 === "Unknown" || style2 === "Unknown") {
    return 50
  }

  // Define compatibility matrix for different communication styles
  const compatibilityMatrix: Record<string, Record<string, number>> = {
    Assertive: {
      Assertive: 60, // Two assertive people may clash
      Analytical: 75, // Can work well together
      Expressive: 65, // Mixed compatibility
      Supportive: 85, // Good balance
      Defensive: 40, // Challenging combination
      Passive: 70, // Can work but may be imbalanced
    },
    Analytical: {
      Assertive: 75, // Can work well together
      Analytical: 80, // Good for problem-solving
      Expressive: 60, // May have communication gaps
      Supportive: 70, // Decent balance
      Defensive: 50, // Challenging
      Passive: 65, // May lack momentum
    },
    Expressive: {
      Assertive: 65, // Mixed compatibility
      Analytical: 60, // May have communication gaps
      Expressive: 75, // Energetic but may lack focus
      Supportive: 90, // Excellent balance
      Defensive: 45, // Challenging
      Passive: 80, // Good balance
    },
    Supportive: {
      Assertive: 85, // Good balance
      Analytical: 70, // Decent balance
      Expressive: 90, // Excellent balance
      Supportive: 85, // Very harmonious
      Defensive: 60, // Can be helpful
      Passive: 65, // May lack direction
    },
    Defensive: {
      Assertive: 40, // Challenging combination
      Analytical: 50, // Challenging
      Expressive: 45, // Challenging
      Supportive: 60, // Can be helpful
      Defensive: 30, // Very challenging
      Passive: 50, // Challenging
    },
    Passive: {
      Assertive: 70, // Can work but may be imbalanced
      Analytical: 65, // May lack momentum
      Expressive: 80, // Good balance
      Supportive: 65, // May lack direction
      Defensive: 50, // Challenging
      Passive: 40, // May lack momentum and direction
    },
  }

  // Return compatibility score from matrix, or default to 50 if not found
  return compatibilityMatrix[style1]?.[style2] || 50
}

// Calculate final compatibility score
function calculateFinalCompatibilityScore(categoryScores: any): number {
  // Handle missing category scores
  if (!categoryScores) {
    return 50 // Default middle value
  }

  const average =
    ((categoryScores.emotionalIntelligence || 50) +
      (categoryScores.communicationStyles || 50) +
      (categoryScores.compatibility || 50) +
      (categoryScores.psychology || 50) +
      (categoryScores.relationshipDynamics || 50)) /
    5

  // Round to 1 decimal place
  return Math.round(average * 10) / 10
}

// Generate a unique analysis ID
function generateAnalysisId(): string {
  return `analysis_${Date.now()}_${Math.floor(Math.random() * 1000)}`
}

function getCommunicationStyleLabel(style1: string, style2: string): string {
  if (style1 === style2) {
    return `${style1}`
  }

  return `${style1} - ${style2}`
}

export async function analyzeScreenshot(imageData: string | Blob) {
  try {
    console.log("Starting screenshot analysis...")

    // Step 1: Perform OCR on the image
    const ocrResult = await performOcr(imageData)

    if (!ocrResult.success) {
      console.error("OCR processing failed:", ocrResult.error)
      return {
        success: false,
        error: ocrResult.error || "OCR processing failed",
        debugInfo: {
          ocrError: ocrResult.error,
          stage: "OCR",
        },
      }
    }

    // Step 2: Extract the text from the OCR result
    const text = ocrResult.text || ""

    if (!text || text.trim().length === 0) {
      console.error("No text extracted from image")
      return {
        success: false,
        error: "No text could be extracted from the image",
        debugInfo: {
          ocrResult,
          stage: "Text Extraction",
        },
      }
    }

    console.log("Text extracted successfully, length:", text.length)

    // Step 3: Analyze the text for sentiment and emotional content
    const sentimentResult = await analyzeSentimentText(text)

    // Step 4: Extract emotional insights using GPT
    const emotionalInsights = await extractEmotionalInsights(text)

    return {
      success: true,
      text,
      words: ocrResult.words || [],
      messages: ocrResult.messages || [],
      sentiment: sentimentResult,
      emotionalInsights,
      debugInfo: {
        ocrConfidence: ocrResult.confidence,
        textLength: text.length,
        messageCount: (ocrResult.messages || []).length,
      },
    }
  } catch (error) {
    console.error("Screenshot analysis failed:", error)
    return {
      success: false,
      error: "Screenshot analysis failed: " + (error.message || error),
      debugInfo: {
        errorMessage: error.message,
        errorStack: error.stack,
        stage: "Analysis",
      },
    }
  }
}
