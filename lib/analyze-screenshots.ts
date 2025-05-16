import type { AnalysisResults, Message } from "./types"
import { extractTextFromScreenshots } from "./ocr-service"
import { analyzeSentiment } from "./sentiment-analyzer"
import { getCommunicationStyleLabel } from "./communication-styles"

// Process screenshots and generate analysis results
export async function analyzeScreenshots(
  files: File[],
  firstPersonName = "Person A",
  secondPersonName = "Person B",
): Promise<AnalysisResults | null> {
  try {
    console.log(`Starting analysis for ${firstPersonName} and ${secondPersonName} with ${files.length} files`)

    // Step 1: Extract text from screenshots using OCR
    console.log("Extracting text from screenshots...")
    const extractedMessages = await extractTextFromScreenshots(files, firstPersonName, secondPersonName)
    console.log(`Extracted ${extractedMessages.length} messages from screenshots`)

    if (extractedMessages.length === 0) {
      console.error("No messages could be extracted from the provided screenshots")
      throw new Error("No messages could be extracted from the provided screenshots")
    }

    // Step 2: Analyze sentiment and generate insights
    console.log("Analyzing sentiment and generating insights...")
    const analysisResults = await analyzeSentiment(extractedMessages, firstPersonName, secondPersonName)

    if (!analysisResults) {
      console.error("Sentiment analysis failed to produce results")
      throw new Error("Sentiment analysis failed to produce results")
    }

    // Step 3: Calculate emotional intelligence scores based on the sentiment analysis
    const firstPersonMessages = extractedMessages.filter((msg) => msg.sender === firstPersonName)
    const secondPersonMessages = extractedMessages.filter((msg) => msg.sender === secondPersonName)

    // Calculate weighted sentiment for each person - FIX: Use message count, not length
    const firstPersonSentiment = calculateNormalizedSentiment(firstPersonMessages)
    const secondPersonSentiment = calculateNormalizedSentiment(secondPersonMessages)

    console.log(
      `Normalized sentiment - ${firstPersonName}: ${firstPersonSentiment}, ${secondPersonName}: ${secondPersonSentiment}`,
    )

    // Get linguistic patterns for normalization
    const firstPersonLinguistics = analysisResults.firstPersonProfile?.linguisticPatterns
    const secondPersonLinguistics = analysisResults.secondPersonProfile?.linguisticPatterns

    if (!firstPersonLinguistics || !secondPersonLinguistics) {
      console.warn("Linguistic patterns missing, using default values")
    }

    // Normalize linguistic patterns - safely handle missing data
    const normalizedLinguistics = normalizeLinguisticPatterns(
      firstPersonLinguistics || getDefaultLinguisticPatterns(),
      secondPersonLinguistics || getDefaultLinguisticPatterns(),
    )

    // Calculate emotional breakdowns using the helper function
    const firstPersonEmo = profileToBreakdown(
      analysisResults.firstPersonProfile || getDefaultProfile(),
      firstPersonSentiment,
    )
    const secondPersonEmo = profileToBreakdown(
      analysisResults.secondPersonProfile || getDefaultProfile(),
      secondPersonSentiment,
    )

    // Calculate emotional intelligence based on normalized breakdowns
    const firstPersonEI = calculateEmotionalIntelligence(
      firstPersonEmo,
      analysisResults.firstPersonProfile || getDefaultProfile(),
      normalizedLinguistics.first,
    )

    const secondPersonEI = calculateEmotionalIntelligence(
      secondPersonEmo,
      analysisResults.secondPersonProfile || getDefaultProfile(),
      normalizedLinguistics.second,
    )

    console.log(`Emotional intelligence - ${firstPersonName}: ${firstPersonEI}, ${secondPersonName}: ${secondPersonEI}`)

    // Step 4: Determine communication styles based on normalized linguistic patterns
    const firstPersonStyle = determineCommStyle(normalizedLinguistics.first)
    const secondPersonStyle = determineCommStyle(normalizedLinguistics.second)

    // Step 5: Generate timeline data from messages with sentiment
    const timelineData = generateTimelineData(analysisResults.messagesWithSentiment || [])

    // Step 6: Calculate category scores for final compatibility score
    const categoryScores = calculateCategoryScores(
      firstPersonEI,
      secondPersonEI,
      analysisResults.gottmanScores || getDefaultGottmanScores(),
      firstPersonEmo,
      secondPersonEmo,
      analysisResults.relationshipDynamics || getDefaultRelationshipDynamics(),
    )

    // Step 7: Calculate final compatibility score (average of category averages)
    const finalCompatibilityScore = calculateFinalCompatibilityScore(categoryScores)

    // Step 8: Compile the final analysis results
    const results: AnalysisResults = {
      participants: [
        {
          name: firstPersonName,
          emotionalIntelligence: firstPersonEI,
          communicationStyle: firstPersonStyle,
          isFirstPerson: true,
        },
        {
          name: secondPersonName,
          emotionalIntelligence: secondPersonEI,
          communicationStyle: secondPersonStyle,
          isFirstPerson: false,
        },
      ],
      messageCount: analysisResults.messagesWithSentiment?.length || extractedMessages.length,
      overallScore: analysisResults.overallScore || 0,
      finalCompatibilityScore, // Add the new properly calculated score
      emotionalBreakdown: firstPersonEmo,
      secondPersonEmotionalBreakdown: secondPersonEmo,
      gottmanScores: analysisResults.gottmanScores || getDefaultGottmanScores(),
      insights: analysisResults.insights || [],
      recommendations: analysisResults.recommendations || [],
      gottmanSummary: analysisResults.gottmanSummary || "",
      gottmanRecommendations: analysisResults.gottmanRecommendations || [],
      conversationTimeline: timelineData,
      keyMoments: analysisResults.keyMoments || [],
      messages: analysisResults.messagesWithSentiment || extractedMessages,
      firstPersonProfile: analysisResults.firstPersonProfile || getDefaultProfile(),
      secondPersonProfile: analysisResults.secondPersonProfile || getDefaultProfile(),
      relationshipDynamics: analysisResults.relationshipDynamics || getDefaultRelationshipDynamics(),
      analysisMethod: analysisResults.analysisMethod || "standard",
      categoryScores, // Add category scores for transparency
    }

    console.log("Analysis completed successfully")
    return results
  } catch (error) {
    console.error("Error in analyzeScreenshots:", error)
    throw new Error(`Failed to analyze screenshots: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// New function to calculate category scores
interface CategoryScores {
  emotionalIntelligence: number
  communicationStyles: number
  compatibility: number
  psychology: number
  relationshipDynamics: number
}

function calculateCategoryScores(
  firstPersonEI: number,
  secondPersonEI: number,
  gottmanScores: any,
  firstPersonEmo: any,
  secondPersonEmo: any,
  relationshipDynamics: any,
): CategoryScores {
  // 1. Emotional Intelligence - average of both participants
  const emotionalIntelligence = (firstPersonEI + secondPersonEI) / 2

  // 2. Communication Styles - based on complementary styles and clarity
  const communicationStyles =
    (100 -
      Math.abs(firstPersonEmo.selfAwareness - secondPersonEmo.selfAwareness) +
      (100 - Math.abs(firstPersonEmo.socialSkills - secondPersonEmo.socialSkills)) +
      gottmanScores.sharedMeaning) /
    3

  // 3. Compatibility - based on Gottman positive metrics
  const compatibility =
    (gottmanScores.emotionalBids +
      gottmanScores.turnTowards +
      gottmanScores.repairAttempts +
      gottmanScores.sharedMeaning) /
    4

  // 4. Psychology - based on attachment and cognitive patterns
  const psychology =
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
    2

  // 5. Relationship Dynamics - based on Gottman negative metrics (inverted) and ratio
  const relationshipDynamics_score =
    (100 -
      gottmanScores.criticism +
      (100 - gottmanScores.contempt) +
      (100 - gottmanScores.defensiveness) +
      (100 - gottmanScores.stonewalling) +
      Math.min(100, relationshipDynamics.positiveToNegativeRatio * 20)) /
    5

  // Ensure all scores are within 0-100 range
  return {
    emotionalIntelligence: normalizeScore(emotionalIntelligence),
    communicationStyles: normalizeScore(communicationStyles),
    compatibility: normalizeScore(compatibility),
    psychology: normalizeScore(psychology),
    relationshipDynamics: normalizeScore(relationshipDynamics_score),
  }
}

// New function to calculate final compatibility score
function calculateFinalCompatibilityScore(categoryScores: CategoryScores): number {
  const average =
    (categoryScores.emotionalIntelligence +
      categoryScores.communicationStyles +
      categoryScores.compatibility +
      categoryScores.psychology +
      categoryScores.relationshipDynamics) /
    5

  // Round to 1 decimal place
  return Math.round(average * 10) / 10
}

// FIX: Calculate sentiment based on message count, not length
function calculateNormalizedSentiment(messages: Message[]): number {
  if (messages.length === 0) return 50 // Default neutral sentiment

  // Simple average of sentiment scores
  const sum = messages.reduce((total, msg) => total + (msg.sentiment ?? 50), 0)
  return Math.round(sum / messages.length)
}

// Improved normalization function
function normalizeScore(value: number, min = 0, max = 100): number {
  // Ensure value is within bounds
  return Math.min(100, Math.max(0, value))
}

// Helper function to normalize linguistic patterns between two participants
function normalizeLinguisticPatterns(firstPatterns: any, secondPatterns: any) {
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
  const maxSoc = Math.max(firstPatterns.socialEngagement || 100, secondPatterns.socialEngagement || 100)
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
function calculateEmotionalIntelligence(emotionalBreakdown: any, profile: any, normalizedLinguistics: any): number {
  // Calculate attachment score based on attachment style
  const attachmentScore =
    profile.attachmentStyle?.primaryStyle === "Secure"
      ? 85
      : profile.attachmentStyle?.primaryStyle === "Anxious"
        ? 65
        : profile.attachmentStyle?.primaryStyle === "Avoidant"
          ? 60
          : 55

  // Calculate normalized linguistic score
  const normalizedLinguisticScore =
    (normalizedLinguistics.emotionalExpressiveness +
      normalizedLinguistics.cognitiveComplexity +
      normalizedLinguistics.socialEngagement +
      (100 - normalizedLinguistics.psychologicalDistancing)) /
    4

  // Calculate normalized emotional score
  const normalizedEmotionalScore =
    (emotionalBreakdown.empathy +
      emotionalBreakdown.selfAwareness +
      emotionalBreakdown.emotionalRegulation +
      emotionalBreakdown.socialSkills +
      emotionalBreakdown.motivation +
      emotionalBreakdown.adaptability) /
    6

  // Weighted average of different scores
  return Math.round(attachmentScore * 0.3 + normalizedLinguisticScore * 0.3 + normalizedEmotionalScore * 0.4)
}

// Helper function to determine communication style using normalized values
function determineCommStyle(normalizedLinguistics: any): string {
  // Calculate scores for each style using normalized values
  const assertiveScore =
    normalizedLinguistics.certaintyLevel * 0.7 + normalizedLinguistics.psychologicalDistancing * 0.3
  const analyticalScore = normalizedLinguistics.cognitiveComplexity * 0.6 + normalizedLinguistics.certaintyLevel * 0.4
  const expressiveScore =
    normalizedLinguistics.emotionalExpressiveness * 0.8 + normalizedLinguistics.socialEngagement * 0.2
  const supportiveScore =
    normalizedLinguistics.emotionalExpressiveness * 0.5 + normalizedLinguistics.socialEngagement * 0.5

  // Find the two highest scores
  const scores = [
    { style: "Assertive", score: assertiveScore },
    { style: "Analytical", score: analyticalScore },
    { style: "Expressive", score: expressiveScore },
    { style: "Supportive", score: supportiveScore },
  ].sort((a, b) => b.score - a.score)

  // Return the communication style label for the two highest scoring styles
  return getCommunicationStyleLabel(scores[0].style, scores[1].style)
}

// Helper function to generate timeline data from messages
function generateTimelineData(messages: Message[]) {
  return messages
    .map((message) => ({
      participant: message.sender,
      timestamp: message.timestamp || new Date().toISOString(),
      sentiment: message.sentiment || 50,
    }))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}

// Helper function to convert a profile to an emotional breakdown
function profileToBreakdown(profile: any, sentiment: number): any {
  if (!profile || !profile.linguisticPatterns) {
    return getDefaultEmotionalBreakdown()
  }

  const lp = profile.linguisticPatterns

  return {
    empathy: normalizeScore(lp.emotionalExpressiveness || 50),
    selfAwareness: normalizeScore(lp.cognitiveComplexity || 50),
    socialSkills: normalizeScore(lp.socialEngagement || 50),
    emotionalRegulation: normalizeScore(100 - (lp.psychologicalDistancing || 50)),
    motivation: normalizeScore(sentiment + 15),
    adaptability: normalizeScore(100 - (lp.certaintyLevel || 50)),
  }
}

// Default values for null safety
function getDefaultLinguisticPatterns() {
  return {
    emotionalExpressiveness: 50,
    cognitiveComplexity: 50,
    socialEngagement: 50,
    psychologicalDistancing: 50,
    certaintyLevel: 50,
    dominantEmotions: [],
  }
}

function getDefaultProfile() {
  return {
    attachmentStyle: {
      primaryStyle: "Secure",
      secondaryStyle: null,
      confidence: 50,
    },
    linguisticPatterns: getDefaultLinguisticPatterns(),
    transactionalAnalysis: {
      dominantEgoState: "Adult",
      egoStateDistribution: {
        parent: 33,
        adult: 34,
        child: 33,
      },
    },
    growthAreas: ["improving communication clarity"],
  }
}

function getDefaultEmotionalBreakdown() {
  return {
    empathy: 50,
    selfAwareness: 50,
    socialSkills: 50,
    emotionalRegulation: 50,
    motivation: 50,
    adaptability: 50,
  }
}

function getDefaultGottmanScores() {
  return {
    criticism: 50,
    contempt: 50,
    defensiveness: 50,
    stonewalling: 50,
    emotionalBids: 50,
    turnTowards: 50,
    repairAttempts: 50,
    sharedMeaning: 50,
  }
}

function getDefaultRelationshipDynamics() {
  return {
    positiveToNegativeRatio: 1,
    conflictStyle: "Balanced",
    attachmentCompatibility: "Moderately Compatible",
    keyGrowthAreas: ["Improving communication"],
    relationshipStrengths: ["Potential for growth"],
  }
}
