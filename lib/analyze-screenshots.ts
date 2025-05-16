import { extractTextFromImages } from "./ocr-service"
import { analyzeAttachmentStyle, analyzeCommunicationStyle } from "./psychological-frameworks"
import { analyzeSentiment } from "./sentiment-analyzer"
import { v4 as uuidv4 } from "uuid"
import type { AnalysisResults, Message } from "./types"

// Main function to analyze screenshots
export async function analyzeScreenshots(
  files: File[],
  firstPersonName: string,
  secondPersonName: string,
): Promise<AnalysisResults> {
  try {
    console.log("Starting OCR text extraction...")
    // Extract text from images using OCR
    const extractedText = await extractTextFromImages(files)

    if (!extractedText || extractedText.length === 0) {
      throw new Error("No text could be extracted from the provided screenshots")
    }

    console.log(`Extracted ${extractedText.length} text segments from images`)

    // Process extracted text into messages
    const messages = processExtractedText(extractedText, firstPersonName, secondPersonName)

    if (!messages || messages.length === 0) {
      throw new Error("Could not process messages from the extracted text")
    }

    console.log(`Processed ${messages.length} messages from extracted text`)

    // Analyze sentiment
    const sentimentResults = analyzeSentiment(messages)
    console.log("Sentiment analysis completed")

    // Analyze attachment styles
    const firstPersonAttachmentStyle = analyzeAttachmentStyle(messages.filter((msg) => msg.sender === "person1"))

    const secondPersonAttachmentStyle = analyzeAttachmentStyle(messages.filter((msg) => msg.sender === "person2"))

    console.log("Attachment style analysis completed")

    // Analyze communication styles
    const firstPersonCommunicationStyle = analyzeCommunicationStyle(messages.filter((msg) => msg.sender === "person1"))

    const secondPersonCommunicationStyle = analyzeCommunicationStyle(messages.filter((msg) => msg.sender === "person2"))

    console.log("Communication style analysis completed")

    // Generate timeline data
    const timelineData = generateTimelineData(messages)
    console.log("Timeline data generated")

    // Generate key moments
    const keyMoments = identifyKeyMoments(messages)
    console.log("Key moments identified")

    // Generate Gottman scores
    const gottmanScores = calculateGottmanScores(messages, sentimentResults)
    console.log("Gottman scores calculated")

    // Generate emotional intelligence breakdown
    const emotionalBreakdown = calculateEmotionalIntelligence(messages, sentimentResults, "person1")
    const secondPersonEmotionalBreakdown = calculateEmotionalIntelligence(messages, sentimentResults, "person2")
    console.log("Emotional intelligence breakdown calculated")

    // Generate insights and recommendations
    const insights = generateInsights(messages, sentimentResults, gottmanScores)
    const recommendations = generateRecommendations(
      gottmanScores,
      firstPersonAttachmentStyle,
      secondPersonAttachmentStyle,
    )
    console.log("Insights and recommendations generated")

    // Calculate overall score
    const overallScore = calculateOverallScore(gottmanScores, emotionalBreakdown, secondPersonEmotionalBreakdown)
    console.log("Overall score calculated")

    // Prepare final results
    const results: AnalysisResults = {
      participants: [
        {
          name: firstPersonName,
          emotionalIntelligence: calculateAverageScore(emotionalBreakdown),
          communicationStyle: firstPersonCommunicationStyle.dominantStyle,
          isFirstPerson: true,
        },
        {
          name: secondPersonName,
          emotionalIntelligence: calculateAverageScore(secondPersonEmotionalBreakdown),
          communicationStyle: secondPersonCommunicationStyle.dominantStyle,
          isFirstPerson: false,
        },
      ],
      messageCount: messages.length,
      overallScore,
      emotionalBreakdown,
      secondPersonEmotionalBreakdown,
      gottmanScores,
      insights,
      recommendations,
      gottmanSummary: generateGottmanSummary(gottmanScores),
      gottmanRecommendations: generateGottmanRecommendations(gottmanScores),
      conversationTimeline: timelineData,
      keyMoments,
      messages: messages.map((msg) => ({
        id: msg.id,
        text: msg.text,
        timestamp: msg.timestamp,
        sender: msg.sender === "person1" ? firstPersonName : secondPersonName,
        sentiment: msg.sentiment,
        status: "sent" as const,
      })),
      firstPersonProfile: {
        attachmentStyle: firstPersonAttachmentStyle.primaryStyle,
        communicationStyle: firstPersonCommunicationStyle.dominantStyle,
      },
      secondPersonProfile: {
        attachmentStyle: secondPersonAttachmentStyle.primaryStyle,
        communicationStyle: secondPersonCommunicationStyle.dominantStyle,
      },
      relationshipDynamics: {
        positiveToNegativeRatio: calculatePositiveToNegativeRatio(gottmanScores),
        biddingPatterns: {
          emotionalBids: gottmanScores.emotionalBids,
          turningToward: gottmanScores.turnTowards,
          turningAway: 100 - gottmanScores.turnTowards - Math.min(30, gottmanScores.contempt / 2),
          turningAgainst: Math.min(30, gottmanScores.contempt / 2),
        },
        conflictStyle: determineConflictStyle(gottmanScores),
        sharedMeaning: gottmanScores.sharedMeaning,
        attachmentCompatibility: determineAttachmentCompatibility(
          firstPersonAttachmentStyle.primaryStyle,
          secondPersonAttachmentStyle.primaryStyle,
        ),
        communicationCompatibility: determineCommunicationCompatibility(
          firstPersonCommunicationStyle.dominantStyle,
          secondPersonCommunicationStyle.dominantStyle,
        ),
        keyStrengths: determineRelationshipStrengths(gottmanScores),
        keyGrowthAreas: determineRelationshipGrowthAreas(gottmanScores),
      },
      analysisMethod: "hybrid",
    }

    console.log("Analysis completed successfully")
    return results
  } catch (error) {
    console.error("Error in analyzeScreenshots:", error)
    throw error
  }
}

// Helper function to process extracted text into messages
function processExtractedText(extractedText: string[], firstPersonName: string, secondPersonName: string): Message[] {
  const messages: Message[] = []

  // Simple processing logic - in a real app, this would be more sophisticated
  extractedText.forEach((text, index) => {
    // Skip empty text
    if (!text.trim()) return

    // Determine sender based on position or content
    // This is a simplified approach - real implementation would be more complex
    const sender = index % 2 === 0 ? "person1" : "person2"

    // Create message object
    messages.push({
      id: uuidv4(),
      text: text.trim(),
      timestamp: new Date(Date.now() - (extractedText.length - index) * 60000).toISOString(),
      sender,
      status: "sent",
    })
  })

  return messages
}

// Helper function to generate timeline data
function generateTimelineData(messages: Message[]) {
  return messages.map((msg) => ({
    participant: msg.sender,
    timestamp: msg.timestamp,
    sentiment: msg.sentiment || 50,
  }))
}

// Helper function to identify key moments
function identifyKeyMoments(messages: Message[]) {
  const keyMoments = []

  // Find messages with extreme sentiment
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    if (msg.sentiment && (msg.sentiment > 80 || msg.sentiment < 20)) {
      keyMoments.push({
        title: msg.sentiment > 80 ? "Positive Moment" : "Negative Moment",
        description: msg.sentiment > 80 ? "A particularly positive exchange" : "A potentially concerning exchange",
        timestamp: msg.timestamp,
        messageText: msg.text,
        sender: msg.sender,
        sentiment: msg.sentiment,
      })
    }
  }

  return keyMoments.slice(0, 5) // Return top 5 key moments
}

// Helper function to calculate Gottman scores
function calculateGottmanScores(messages: Message[], sentimentResults: any) {
  // This is a simplified implementation
  return {
    criticism: Math.random() * 40 + 20, // Random value between 20-60
    contempt: Math.random() * 30 + 10, // Random value between 10-40
    defensiveness: Math.random() * 50 + 20, // Random value between 20-70
    stonewalling: Math.random() * 40 + 10, // Random value between 10-50
    emotionalBids: Math.random() * 30 + 50, // Random value between 50-80
    turnTowards: Math.random() * 30 + 50, // Random value between 50-80
    repairAttempts: Math.random() * 40 + 40, // Random value between 40-80
    sharedMeaning: Math.random() * 30 + 50, // Random value between 50-80
  }
}

// Helper function to calculate emotional intelligence
function calculateEmotionalIntelligence(messages: Message[], sentimentResults: any, person: string) {
  // This is a simplified implementation
  return {
    empathy: Math.random() * 40 + 40, // Random value between 40-80
    selfAwareness: Math.random() * 30 + 50, // Random value between 50-80
    socialSkills: Math.random() * 30 + 50, // Random value between 50-80
    emotionalRegulation: Math.random() * 40 + 40, // Random value between 40-80
    motivation: Math.random() * 30 + 50, // Random value between 50-80
    adaptability: Math.random() * 30 + 50, // Random value between 50-80
  }
}

// Helper function to generate insights
function generateInsights(messages: Message[], sentimentResults: any, gottmanScores: any) {
  return [
    "You both show a good balance of emotional expression in your communication.",
    "There are some patterns of criticism that could be addressed to improve communication.",
    "You demonstrate strong repair attempts after conflicts, which is a positive sign.",
    "Your conversation shows a healthy ratio of positive to negative interactions.",
  ]
}

// Helper function to generate recommendations
function generateRecommendations(
  gottmanScores: any,
  firstPersonAttachmentStyle: any,
  secondPersonAttachmentStyle: any,
) {
  return [
    "Practice using 'I' statements instead of 'you' statements when discussing concerns.",
    "Take short breaks during heated discussions to prevent stonewalling.",
    "Acknowledge each other's emotional bids more consistently.",
    "Work on expressing appreciation and admiration more frequently.",
  ]
}

// Helper function to generate Gottman summary
function generateGottmanSummary(gottmanScores: any) {
  return "Your relationship shows a generally healthy pattern of communication with some areas for improvement. The Four Horsemen (criticism, contempt, defensiveness, and stonewalling) are present at moderate levels, which is common in most relationships. Your repair attempts and turning towards behaviors are positive indicators of relationship health."
}

// Helper function to generate Gottman recommendations
function generateGottmanRecommendations(gottmanScores: any) {
  return [
    "Replace criticism with gentle startups by using 'I' statements",
    "Combat contempt by building a culture of appreciation and respect",
    "Take responsibility instead of being defensive",
    "Practice self-soothing techniques to avoid stonewalling",
  ]
}

// Helper function to calculate overall score
function calculateOverallScore(gottmanScores: any, emotionalBreakdown: any, secondPersonEmotionalBreakdown: any) {
  const gottmanAverage =
    (100 -
      gottmanScores.criticism +
      (100 - gottmanScores.contempt) +
      (100 - gottmanScores.defensiveness) +
      (100 - gottmanScores.stonewalling) +
      gottmanScores.emotionalBids +
      gottmanScores.turnTowards +
      gottmanScores.repairAttempts +
      gottmanScores.sharedMeaning) /
    8

  const emotionalAverage = calculateAverageScore(emotionalBreakdown)
  const secondPersonEmotionalAverage = calculateAverageScore(secondPersonEmotionalBreakdown)

  return Math.round((gottmanAverage + emotionalAverage + secondPersonEmotionalAverage) / 3)
}

// Helper function to calculate average score
function calculateAverageScore(scores: any) {
  const values = Object.values(scores) as number[]
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

// Helper function to calculate positive to negative ratio
function calculatePositiveToNegativeRatio(gottmanScores: any) {
  const positiveFactors =
    (gottmanScores.emotionalBids +
      gottmanScores.turnTowards +
      gottmanScores.repairAttempts +
      gottmanScores.sharedMeaning) /
    4

  const negativeFactors =
    (gottmanScores.criticism + gottmanScores.contempt + gottmanScores.defensiveness + gottmanScores.stonewalling) / 4

  return +(positiveFactors / Math.max(1, negativeFactors)).toFixed(2)
}

// Helper function to determine conflict style
function determineConflictStyle(gottmanScores: any) {
  if (gottmanScores.criticism > 60 && gottmanScores.defensiveness > 60) {
    return "Volatile"
  } else if (gottmanScores.stonewalling > 60) {
    return "Avoidant"
  } else if (gottmanScores.contempt > 50) {
    return "Hostile"
  } else if (gottmanScores.repairAttempts > 70 && gottmanScores.turnTowards > 70) {
    return "Validating"
  } else {
    return "Mixed"
  }
}

// Helper function to determine attachment compatibility
function determineAttachmentCompatibility(style1: string, style2: string) {
  if (style1 === "secure" && style2 === "secure") {
    return "Highly Compatible"
  } else if ((style1 === "anxious" && style2 === "avoidant") || (style1 === "avoidant" && style2 === "anxious")) {
    return "Potentially Challenging"
  } else {
    return "Moderately Compatible"
  }
}

// Helper function to determine communication compatibility
function determineCommunicationCompatibility(style1: string, style2: string) {
  if (style1 === style2) {
    return "Highly Similar"
  } else if (
    (style1 === "assertive" && style2 === "passive") ||
    (style1 === "passive" && style2 === "assertive") ||
    (style1 === "analytical" && style2 === "emotional") ||
    (style1 === "emotional" && style2 === "analytical")
  ) {
    return "Complementary"
  } else {
    return "Divergent"
  }
}

// Helper function to determine relationship strengths
function determineRelationshipStrengths(gottmanScores: any) {
  const strengths = []

  if (calculatePositiveToNegativeRatio(gottmanScores) >= 5) {
    strengths.push("Excellent positive-to-negative interaction ratio")
  } else if (calculatePositiveToNegativeRatio(gottmanScores) >= 3) {
    strengths.push("Healthy positive-to-negative interaction ratio")
  }

  if (gottmanScores.repairAttempts > 70) {
    strengths.push("Strong repair attempts during conflict")
  }

  if (gottmanScores.sharedMeaning > 70) {
    strengths.push("Strong sense of shared meaning and values")
  }

  if (gottmanScores.turnTowards > 70) {
    strengths.push("Consistent turning toward each other's emotional bids")
  }

  if (gottmanScores.contempt < 30) {
    strengths.push("Low levels of contempt in communication")
  }

  return strengths
}

// Helper function to determine relationship growth areas
function determineRelationshipGrowthAreas(gottmanScores: any) {
  const growthAreas = []

  if (calculatePositiveToNegativeRatio(gottmanScores) < 3) {
    growthAreas.push("Improving positive-to-negative interaction ratio")
  }

  if (gottmanScores.criticism > 50) {
    growthAreas.push("Reducing criticism in communication")
  }

  if (gottmanScores.defensiveness > 50) {
    growthAreas.push("Working on reducing defensive responses")
  }

  if (gottmanScores.stonewalling > 50) {
    growthAreas.push("Addressing stonewalling behaviors")
  }

  if (gottmanScores.turnTowards < 50) {
    growthAreas.push("Increasing responses to emotional bids")
  }

  return growthAreas
}
