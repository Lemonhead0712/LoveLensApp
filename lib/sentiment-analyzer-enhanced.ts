import type { Message, SentimentAnalysis, CategoryScores, NegativeInsights } from "./types"
import { useOpenAI } from "./openai-service"
import { analyzeKeywords, calculateSentimentScore } from "./rule-based-analysis"

// Add a new interface to track analysis method
export interface AnalysisMetadata {
  method: "ai" | "rule-based"
  fallbackReason?: string
  confidenceLevel: number // 0-1 scale
}

// Enhanced sentiment analysis function with fallback notification
export async function analyzeSentiment(
  messages: Message[],
): Promise<{ analysis: SentimentAnalysis; metadata: AnalysisMetadata }> {
  // Try OpenAI first
  const openai = useOpenAI()
  try {
    if (!openai) {
      throw new Error("OpenAI API not available")
    }

    const aiAnalysis = await performAIAnalysis(messages, openai)

    return {
      analysis: aiAnalysis,
      metadata: {
        method: "ai",
        confidenceLevel: 0.9, // AI analysis is generally more confident
      },
    }
  } catch (error) {
    console.warn("AI sentiment analysis failed, falling back to rule-based analysis:", error)

    // Fallback to rule-based analysis
    const fallbackAnalysis = performRuleBasedAnalysis(messages)

    return {
      analysis: fallbackAnalysis,
      metadata: {
        method: "rule-based",
        fallbackReason: error instanceof Error ? error.message : "Unknown error",
        confidenceLevel: 0.6, // Rule-based analysis is less confident
      },
    }
  }
}

// Improved rule-based analysis with context awareness
function performRuleBasedAnalysis(messages: Message[]): SentimentAnalysis {
  // Extract message content
  const messageContents = messages.map((m) => m.content)
  const combinedText = messageContents.join(" ")

  // Analyze keywords with improved context awareness
  const keywordResults = analyzeKeywords(messageContents)

  // Consider message sequence for context
  const contextAwareScores = analyzeMessageSequence(messages)

  // Detect potential sarcasm
  const sarcasmAdjustment = detectSarcasm(messages) ? -0.2 : 0

  // Calculate base sentiment scores
  const baseScores = calculateSentimentScore(keywordResults)

  // Apply context and sarcasm adjustments
  const adjustedScores: CategoryScores = {
    criticism: normalizeScore(baseScores.criticism + contextAwareScores.criticism + sarcasmAdjustment),
    defensiveness: normalizeScore(baseScores.defensiveness + contextAwareScores.defensiveness),
    contempt: normalizeScore(baseScores.contempt + contextAwareScores.contempt + sarcasmAdjustment),
    stonewalling: normalizeScore(baseScores.stonewalling + contextAwareScores.stonewalling),
    emotional_awareness: normalizeScore(baseScores.emotional_awareness - sarcasmAdjustment),
    repair_attempts: normalizeScore(baseScores.repair_attempts),
    positive_communication: normalizeScore(baseScores.positive_communication - sarcasmAdjustment),
  }

  // Generate negative insights
  const negativeInsights = analyzeNegativeCommunicationPatterns(messages, adjustedScores)

  return {
    scores: adjustedScores,
    negative_insights: negativeInsights,
    summary: generateSummary(adjustedScores, negativeInsights),
  }
}

// Helper function to analyze message sequence for context
function analyzeMessageSequence(messages: Message[]): CategoryScores {
  const scores: CategoryScores = {
    criticism: 0,
    defensiveness: 0,
    contempt: 0,
    stonewalling: 0,
    emotional_awareness: 0,
    repair_attempts: 0,
    positive_communication: 0,
  }

  // Look for patterns like criticism followed by defensiveness
  for (let i = 1; i < messages.length; i++) {
    const prevMsg = messages[i - 1].content.toLowerCase()
    const currMsg = messages[i].content.toLowerCase()

    // If previous message contains criticism and current contains defensive words
    if (
      (prevMsg.includes("you always") || prevMsg.includes("you never")) &&
      (currMsg.includes("not my fault") || currMsg.includes("that's not true"))
    ) {
      scores.criticism += 0.1
      scores.defensiveness += 0.2
    }

    // Detect stonewalling patterns (short responses after emotional messages)
    if (
      prevMsg.length > 100 &&
      prevMsg.includes("feel") &&
      (currMsg.length < 20 || currMsg.includes("whatever") || currMsg.includes("fine"))
    ) {
      scores.stonewalling += 0.2
    }

    // Detect repair attempts
    if (
      (prevMsg.includes("sorry") || currMsg.includes("understand")) &&
      (currMsg.includes("appreciate") || currMsg.includes("thank"))
    ) {
      scores.repair_attempts += 0.2
      scores.positive_communication += 0.1
    }
  }

  return scores
}

// Helper function to detect potential sarcasm
function detectSarcasm(messages: Message[]): boolean {
  const sarcasmIndicators = [
    { pattern: /sure\s+thing/i, weight: 0.3 },
    { pattern: /yeah\s+right/i, weight: 0.4 },
    { pattern: /whatever\s+you\s+say/i, weight: 0.3 },
    { pattern: /of\s+course\s+you\s+do/i, weight: 0.3 },
    { pattern: /thanks\s+a\s+lot/i, weight: 0.2 },
    { pattern: /how\s+nice\s+of\s+you/i, weight: 0.3 },
    { pattern: /exactly\s+what\s+I\s+needed/i, weight: 0.3 },
  ]

  let sarcasmScore = 0

  for (const message of messages) {
    for (const indicator of sarcasmIndicators) {
      if (indicator.pattern.test(message.content)) {
        sarcasmScore += indicator.weight
      }
    }
  }

  return sarcasmScore > 0.5 // Threshold for considering sarcasm present
}

// Helper function to normalize scores between 0 and 1
function normalizeScore(score: number): number {
  return Math.max(0, Math.min(1, score))
}

// Helper function to analyze negative communication patterns
function analyzeNegativeCommunicationPatterns(messages: Message[], scores: CategoryScores): NegativeInsights {
  // Implement personalized negative communication insights
  const insights: NegativeInsights = {
    criticism_examples: [],
    defensiveness_examples: [],
    contempt_examples: [],
    stonewalling_examples: [],
  }

  // Extract examples of each negative pattern
  for (const message of messages) {
    const content = message.content.toLowerCase()

    // Check for criticism patterns
    if (
      content.includes("you always") ||
      content.includes("you never") ||
      content.includes("why do you") ||
      content.includes("you should")
    ) {
      insights.criticism_examples.push(message.content)
    }

    // Check for defensiveness patterns
    if (
      content.includes("not my fault") ||
      content.includes("that's not true") ||
      content.includes("i didn't") ||
      content.includes("you were the one")
    ) {
      insights.defensiveness_examples.push(message.content)
    }

    // Check for contempt patterns
    if (
      content.includes("whatever") ||
      content.includes("pathetic") ||
      content.includes("ridiculous") ||
      content.includes("stupid")
    ) {
      insights.contempt_examples.push(message.content)
    }

    // Check for stonewalling patterns
    if (content === "k" || content === "fine" || content === "whatever" || content.length < 5) {
      insights.stonewalling_examples.push(message.content)
    }
  }

  return insights
}

// Helper function to generate a summary based on scores and insights
function generateSummary(scores: CategoryScores, insights: NegativeInsights): string {
  const highScoreThreshold = 0.7
  const moderateScoreThreshold = 0.4

  const negativePatterns = []
  const positivePatterns = []

  // Check for negative patterns
  if (scores.criticism > highScoreThreshold) {
    negativePatterns.push("high levels of criticism")
  } else if (scores.criticism > moderateScoreThreshold) {
    negativePatterns.push("moderate levels of criticism")
  }

  if (scores.defensiveness > highScoreThreshold) {
    negativePatterns.push("high levels of defensiveness")
  } else if (scores.defensiveness > moderateScoreThreshold) {
    negativePatterns.push("moderate levels of defensiveness")
  }

  if (scores.contempt > highScoreThreshold) {
    negativePatterns.push("high levels of contempt")
  } else if (scores.contempt > moderateScoreThreshold) {
    negativePatterns.push("moderate levels of contempt")
  }

  if (scores.stonewalling > highScoreThreshold) {
    negativePatterns.push("high levels of stonewalling")
  } else if (scores.stonewalling > moderateScoreThreshold) {
    negativePatterns.push("moderate levels of stonewalling")
  }

  // Check for positive patterns
  if (scores.emotional_awareness > highScoreThreshold) {
    positivePatterns.push("strong emotional awareness")
  } else if (scores.emotional_awareness > moderateScoreThreshold) {
    positivePatterns.push("moderate emotional awareness")
  }

  if (scores.repair_attempts > highScoreThreshold) {
    positivePatterns.push("effective repair attempts")
  } else if (scores.repair_attempts > moderateScoreThreshold) {
    positivePatterns.push("some repair attempts")
  }

  if (scores.positive_communication > highScoreThreshold) {
    positivePatterns.push("strong positive communication")
  } else if (scores.positive_communication > moderateScoreThreshold) {
    positivePatterns.push("some positive communication")
  }

  // Generate summary
  let summary = ""

  if (negativePatterns.length > 0) {
    summary += `This conversation shows ${negativePatterns.join(", ")}. `
  } else {
    summary += "This conversation shows minimal negative communication patterns. "
  }

  if (positivePatterns.length > 0) {
    summary += `There are signs of ${positivePatterns.join(", ")}. `
  } else {
    summary += "There are few signs of positive communication patterns. "
  }

  // Add specific examples if available
  if (insights.criticism_examples.length > 0) {
    summary += `Examples of criticism include: "${insights.criticism_examples[0]}". `
  }

  if (insights.repair_attempts > 0.5 && insights.criticism > 0.5) {
    summary += "Despite criticism, there are attempts to repair the relationship. "
  }

  return summary
}

// AI-based analysis function (placeholder for the actual implementation)
async function performAIAnalysis(messages: Message[], openai: any): Promise<SentimentAnalysis> {
  // This would be the actual OpenAI implementation
  // For now, we'll just return a placeholder
  return {
    scores: {
      criticism: 0.5,
      defensiveness: 0.5,
      contempt: 0.5,
      stonewalling: 0.5,
      emotional_awareness: 0.5,
      repair_attempts: 0.5,
      positive_communication: 0.5,
    },
    negative_insights: {
      criticism_examples: [],
      defensiveness_examples: [],
      contempt_examples: [],
      stonewalling_examples: [],
    },
    summary: "This is a placeholder summary from AI analysis.",
  }
}
