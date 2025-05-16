import type { Message, SentimentAnalysis, CategoryScores, NegativeInsights } from "./types"
import { analyzeWithOpenAI } from "./openai-service"
import { isOpenAIEnabled } from "./api-config"

// Add a new interface to track analysis method
export interface AnalysisMetadata {
  method: "ai" | "rule-based" | "hybrid"
  fallbackReason?: string
  confidenceLevel: number // 0-1 scale
}

// Enhanced sentiment analysis function with OpenAI integration
export async function analyzeSentiment(
  messages: Message[],
): Promise<{ analysis: SentimentAnalysis; metadata: AnalysisMetadata }> {
  try {
    console.log("Starting sentiment analysis...")

    // Check if OpenAI is available
    if (isOpenAIEnabled()) {
      try {
        console.log("Using OpenAI for sentiment analysis")
        const aiAnalysis = await performAIAnalysis(messages)

        return {
          analysis: aiAnalysis,
          metadata: {
            method: "ai",
            confidenceLevel: 0.9, // AI analysis is generally more confident
          },
        }
      } catch (error) {
        console.warn("AI sentiment analysis failed, falling back to hybrid analysis:", error)

        // Fall back to hybrid analysis
        const hybridAnalysis = await performHybridAnalysis(messages)

        return {
          analysis: hybridAnalysis,
          metadata: {
            method: "hybrid",
            fallbackReason: error instanceof Error ? error.message : "Unknown error",
            confidenceLevel: 0.75, // Hybrid analysis is still quite confident
          },
        }
      }
    } else {
      console.log("OpenAI not available, using rule-based analysis")

      // Fall back to rule-based analysis
      const ruleBasedAnalysis = performRuleBasedAnalysis(messages)

      return {
        analysis: ruleBasedAnalysis,
        metadata: {
          method: "rule-based",
          fallbackReason: "OpenAI not enabled",
          confidenceLevel: 0.6, // Rule-based analysis is less confident
        },
      }
    }
  } catch (error) {
    console.error("Error in sentiment analysis:", error)

    // Ultimate fallback to basic rule-based analysis
    const basicAnalysis = performBasicAnalysis(messages)

    return {
      analysis: basicAnalysis,
      metadata: {
        method: "rule-based",
        fallbackReason: "Error in analysis pipeline",
        confidenceLevel: 0.4, // Low confidence due to errors
      },
    }
  }
}

// Perform AI-based sentiment analysis using OpenAI
async function performAIAnalysis(messages: Message[]): Promise<SentimentAnalysis> {
  // Prepare messages for analysis
  const messagesSample = messages
    .slice(0, 30)
    .map((msg) => `${msg.sender}: "${msg.content}"`)
    .join("\n")

  // Create the prompt for OpenAI
  const systemPrompt = `
    You are an expert in analyzing conversation sentiment based on the Gottman Method.
    Analyze the following conversation and provide scores for these categories:
    
    1. Criticism: Attacking someone's character rather than their behavior
    2. Defensiveness: Victimizing oneself to ward off perceived attack
    3. Contempt: Attacking from a position of superiority
    4. Stonewalling: Withdrawing from conversation as a way to avoid conflict
    5. Emotional Awareness: Recognizing and acknowledging emotions
    6. Repair Attempts: Efforts to de-escalate tension
    7. Positive Communication: Expressing appreciation, respect, and love
    
    Return your analysis as a JSON object with the following structure:
    {
      "scores": {
        "criticism": 0-1 score,
        "defensiveness": 0-1 score,
        "contempt": 0-1 score,
        "stonewalling": 0-1 score,
        "emotional_awareness": 0-1 score,
        "repair_attempts": 0-1 score,
        "positive_communication": 0-1 score
      },
      "negative_insights": {
        "criticism_examples": ["Example 1", "Example 2"],
        "defensiveness_examples": ["Example 1", "Example 2"],
        "contempt_examples": ["Example 1", "Example 2"],
        "stonewalling_examples": ["Example 1", "Example 2"]
      },
      "summary": "Brief summary of the sentiment analysis"
    }
  `

  // Call OpenAI for analysis
  const analysisText = await analyzeWithOpenAI(messagesSample, systemPrompt)

  if (!analysisText) {
    throw new Error("Empty response from OpenAI")
  }

  // Extract JSON from the response
  const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("Could not extract JSON from OpenAI response")
  }

  try {
    return JSON.parse(jsonMatch[0])
  } catch (error) {
    throw new Error("Failed to parse sentiment analysis from OpenAI")
  }
}

// Perform hybrid analysis using rule-based approach with AI enhancement
async function performHybridAnalysis(messages: Message[]): Promise<SentimentAnalysis> {
  // Start with rule-based analysis
  const ruleBasedAnalysis = performRuleBasedAnalysis(messages)

  try {
    // Enhance with OpenAI if possible
    const enhancedSummary = await enhanceSummaryWithAI(messages, ruleBasedAnalysis)

    return {
      ...ruleBasedAnalysis,
      summary: enhancedSummary || ruleBasedAnalysis.summary,
    }
  } catch (error) {
    console.warn("Failed to enhance summary with AI:", error)
    return ruleBasedAnalysis
  }
}

// Enhance summary with OpenAI
async function enhanceSummaryWithAI(messages: Message[], analysis: SentimentAnalysis): Promise<string | null> {
  try {
    // Prepare messages for analysis
    const messagesSample = messages
      .slice(0, 15)
      .map((msg) => `${msg.sender}: "${msg.content}"`)
      .join("\n")

    // Create the prompt for OpenAI
    const systemPrompt = `
      You are an expert in relationship dynamics and communication patterns.
      Based on the following conversation and preliminary analysis scores, provide a concise summary
      of the communication patterns and emotional dynamics.
      
      Preliminary Analysis Scores:
      Criticism: ${analysis.scores.criticism}
      Defensiveness: ${analysis.scores.defensiveness}
      Contempt: ${analysis.scores.contempt}
      Stonewalling: ${analysis.scores.stonewalling}
      Emotional Awareness: ${analysis.scores.emotional_awareness}
      Repair Attempts: ${analysis.scores.repair_attempts}
      Positive Communication: ${analysis.scores.positive_communication}
      
      Return ONLY a concise summary paragraph (3-5 sentences) with no additional text or formatting.
    `

    // Call OpenAI for enhanced summary
    const enhancedSummary = await analyzeWithOpenAI(messagesSample, systemPrompt)

    return enhancedSummary
  } catch (error) {
    console.error("Error enhancing summary with AI:", error)
    return null
  }
}

// Perform rule-based sentiment analysis
function performRuleBasedAnalysis(messages: Message[]): SentimentAnalysis {
  // Extract message content
  const messageContents = messages.map((m) => m.content)

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

  // Initialize scores
  const scores: CategoryScores = {
    criticism: 0,
    defensiveness: 0,
    contempt: 0,
    stonewalling: 0,
    emotional_awareness: 0,
    repair_attempts: 0,
    positive_communication: 0,
  }

  // Initialize examples
  const negativeInsights: NegativeInsights = {
    criticism_examples: [],
    defensiveness_examples: [],
    contempt_examples: [],
    stonewalling_examples: [],
  }

  // Analyze each message
  messages.forEach((message) => {
    const content = message.content

    // Check for patterns in each category
    Object.entries(patterns).forEach(([category, categoryPatterns]) => {
      categoryPatterns.forEach((pattern) => {
        if (pattern.test(content)) {
          // Increment score for this category
          scores[category as keyof CategoryScores] += 0.2

          // Add example if it's a negative category
          if (
            category === "criticism" ||
            category === "defensiveness" ||
            category === "contempt" ||
            category === "stonewalling"
          ) {
            const examplesKey = `${category}_examples` as keyof NegativeInsights
            if (negativeInsights[examplesKey].length < 3) {
              negativeInsights[examplesKey].push(content)
            }
          }
        }
      })
    })
  })

  // Normalize scores to be between 0 and 1
  Object.keys(scores).forEach((key) => {
    scores[key as keyof CategoryScores] = Math.min(1, scores[key as keyof CategoryScores])
  })

  // Generate summary
  const summary = generateSummary(scores, negativeInsights)

  return {
    scores,
    negative_insights: negativeInsights,
    summary,
  }
}

// Perform basic analysis as ultimate fallback
function performBasicAnalysis(messages: Message[]): SentimentAnalysis {
  // Default scores
  const scores: CategoryScores = {
    criticism: 0.5,
    defensiveness: 0.5,
    contempt: 0.5,
    stonewalling: 0.5,
    emotional_awareness: 0.5,
    repair_attempts: 0.5,
    positive_communication: 0.5,
  }

  // Default insights
  const negativeInsights: NegativeInsights = {
    criticism_examples: [],
    defensiveness_examples: [],
    contempt_examples: [],
    stonewalling_examples: [],
  }

  return {
    scores,
    negative_insights: negativeInsights,
    summary: "Basic analysis performed due to errors in the analysis pipeline. Results may not be accurate.",
  }
}

// Generate summary based on scores and insights
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

  if (scores.repair_attempts > 0.5 && scores.criticism > 0.5) {
    summary += "Despite criticism, there are attempts to repair the relationship. "
  }

  return summary
}
