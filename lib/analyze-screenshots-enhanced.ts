import type { AnalysisResult, CategoryScores } from "./types"
import { analyzeSentiment } from "./sentiment-analyzer-enhanced"
import { extractTextFromImage, deduplicateMessages, validateExtractedMessages } from "./ocr-service-enhanced"
import { analyzeAttachmentStyle, analyzeCommunicationStyle } from "./psychological-frameworks-enhanced"

// Interface for relationship type
interface RelationshipType {
  type: "romantic" | "friendship" | "family" | "professional" | "unknown"
  confidence: number
}

// Enhanced screenshot analysis with improved scoring normalization
export async function analyzeScreenshots(
  screenshots: string[],
  relationshipType: RelationshipType = { type: "unknown", confidence: 0 },
): Promise<AnalysisResult> {
  try {
    // Extract text from screenshots
    const messagesArrays = await Promise.all(screenshots.map((screenshot) => extractTextFromImage(screenshot)))

    // Flatten and deduplicate messages
    let allMessages = messagesArrays.flat()
    allMessages = deduplicateMessages(allMessages)

    // Validate extracted messages
    if (!validateExtractedMessages(allMessages)) {
      throw new Error("Invalid or insufficient messages extracted from screenshots")
    }

    // Perform sentiment analysis with metadata
    const { analysis: sentimentAnalysis, metadata: sentimentMetadata } = await analyzeSentiment(allMessages)

    // Perform psychological analyses
    const attachmentStyle = analyzeAttachmentStyle(allMessages)
    const communicationStyle = analyzeCommunicationStyle(allMessages)

    // Calculate category scores with relationship-specific weights
    const categoryScores = calculateCategoryScores(sentimentAnalysis.scores, relationshipType)

    // Generate analysis result
    return {
      messages: allMessages,
      sentiment: sentimentAnalysis,
      attachment_style: attachmentStyle.primaryStyle,
      communication_style: communicationStyle.dominantStyle,
      category_scores: categoryScores,
      metadata: {
        analysis_method: sentimentMetadata.method,
        confidence_level: sentimentMetadata.confidenceLevel,
        attachment_confidence: attachmentStyle.confidence,
        communication_confidence: communicationStyle.confidence,
        limited_data_warning:
          allMessages.length < 10
            ? "This analysis is based on limited data and should be considered preliminary."
            : undefined,
      },
    }
  } catch (error) {
    console.error("Error analyzing screenshots:", error)
    throw new Error("Failed to analyze screenshots")
  }
}

// Calculate category scores with relationship-specific weights
function calculateCategoryScores(sentimentScores: CategoryScores, relationshipType: RelationshipType): CategoryScores {
  // Define weights for different relationship types
  const weights = getRelationshipWeights(relationshipType.type)

  // Apply weights to sentiment scores
  const weightedScores: CategoryScores = {
    criticism: applyWeight(sentimentScores.criticism, weights.criticism),
    defensiveness: applyWeight(sentimentScores.defensiveness, weights.defensiveness),
    contempt: applyWeight(sentimentScores.contempt, weights.contempt),
    stonewalling: applyWeight(sentimentScores.stonewalling, weights.stonewalling),
    emotional_awareness: applyWeight(sentimentScores.emotional_awareness, weights.emotional_awareness),
    repair_attempts: applyWeight(sentimentScores.repair_attempts, weights.repair_attempts),
    positive_communication: applyWeight(sentimentScores.positive_communication, weights.positive_communication),
  }

  // Normalize scores to ensure they're between 0 and 1
  return normalizeScores(weightedScores)
}

// Get relationship-specific weights
function getRelationshipWeights(relationshipType: string): CategoryScores {
  switch (relationshipType) {
    case "romantic":
      return {
        criticism: 1.2, // Criticism is more impactful in romantic relationships
        defensiveness: 1.1,
        contempt: 1.3, // Contempt is particularly damaging in romantic relationships
        stonewalling: 1.2,
        emotional_awareness: 1.2, // Emotional awareness is more important
        repair_attempts: 1.2, // Repair attempts are crucial
        positive_communication: 1.1,
      }
    case "friendship":
      return {
        criticism: 0.9,
        defensiveness: 1.0,
        contempt: 1.1, // Still important but less than in romantic relationships
        stonewalling: 0.9,
        emotional_awareness: 1.0,
        repair_attempts: 1.1,
        positive_communication: 1.2, // Positive communication is key in friendships
      }
    case "family":
      return {
        criticism: 1.1,
        defensiveness: 1.1,
        contempt: 1.2,
        stonewalling: 1.1,
        emotional_awareness: 1.0,
        repair_attempts: 1.1,
        positive_communication: 1.0,
      }
    case "professional":
      return {
        criticism: 0.8, // Criticism may be more expected in professional contexts
        defensiveness: 0.9,
        contempt: 1.3, // Contempt is particularly inappropriate in professional settings
        stonewalling: 1.0,
        emotional_awareness: 0.8, // Less emphasis on emotional aspects
        repair_attempts: 1.0,
        positive_communication: 1.1,
      }
    case "unknown":
    default:
      // Balanced weights when relationship type is unknown
      return {
        criticism: 1.0,
        defensiveness: 1.0,
        contempt: 1.0,
        stonewalling: 1.0,
        emotional_awareness: 1.0,
        repair_attempts: 1.0,
        positive_communication: 1.0,
      }
  }
}

// Apply weight to a score
function applyWeight(score: number, weight: number): number {
  return score * weight
}

// Normalize scores to ensure they're between 0 and 1
function normalizeScores(scores: CategoryScores): CategoryScores {
  // Find the maximum score
  const maxScore = Math.max(
    scores.criticism,
    scores.defensiveness,
    scores.contempt,
    scores.stonewalling,
    scores.emotional_awareness,
    scores.repair_attempts,
    scores.positive_communication,
  )

  // If max score is greater than 1, normalize all scores
  if (maxScore > 1) {
    return {
      criticism: Math.round((scores.criticism / maxScore) * 100) / 100,
      defensiveness: Math.round((scores.defensiveness / maxScore) * 100) / 100,
      contempt: Math.round((scores.contempt / maxScore) * 100) / 100,
      stonewalling: Math.round((scores.stonewalling / maxScore) * 100) / 100,
      emotional_awareness: Math.round((scores.emotional_awareness / maxScore) * 100) / 100,
      repair_attempts: Math.round((scores.repair_attempts / maxScore) * 100) / 100,
      positive_communication: Math.round((scores.positive_communication / maxScore) * 100) / 100,
    }
  }

  // Otherwise, just round the scores
  return {
    criticism: Math.round(scores.criticism * 100) / 100,
    defensiveness: Math.round(scores.defensiveness * 100) / 100,
    contempt: Math.round(scores.contempt * 100) / 100,
    stonewalling: Math.round(scores.stonewalling * 100) / 100,
    emotional_awareness: Math.round(scores.emotional_awareness * 100) / 100,
    repair_attempts: Math.round(scores.repair_attempts * 100) / 100,
    positive_communication: Math.round(scores.positive_communication * 100) / 100,
  }
}
