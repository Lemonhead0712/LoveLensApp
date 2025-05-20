import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { checkRateLimit } from "@/lib/rate-limit"
import { cacheGPTAnalysis, getCachedGPTAnalysis, generateMessageHash } from "@/lib/redis-cache"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use server-only .env value
})

export async function POST(req: NextRequest) {
  try {
    // Check rate limit
    const rateLimit = await checkRateLimit(req)
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          limit: rateLimit.limit,
          remaining: rateLimit.remaining,
          reset: rateLimit.reset,
        },
        { status: 429 },
      )
    }

    const { messages, firstPersonName, secondPersonName } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid or empty messages array" }, { status: 400 })
    }

    // Generate a hash for the messages to use as cache key
    const messageHash = generateMessageHash(messages)

    // Try to get cached analysis
    const cachedAnalysis = await getCachedGPTAnalysis(messageHash, firstPersonName, secondPersonName)
    if (cachedAnalysis) {
      // Add cache hit metadata
      const analysisWithMetadata = {
        ...cachedAnalysis,
        _metadata: {
          ...(cachedAnalysis._metadata || {}),
          cacheHit: true,
          retrievedAt: new Date().toISOString(),
        },
      }
      return NextResponse.json({ analysis: analysisWithMetadata })
    }

    // Format the transcript with sender names and message content
    const transcript = messages.map((m) => `${m.sender}: ${m.text || m.content || ""}`).join("\n")

    let prompt = `
You are a relationship psychologist with expertise in emotional intelligence analysis. Based on the following chat between ${firstPersonName} and ${secondPersonName}, generate:

1. A short psychological profile for each participant including:
   - Attachment style (secure, anxious, avoidant, or disorganized)
   - Communication style (assertive, passive, aggressive, or passive-aggressive)
   - Empathy level (high, medium, or low with explanation)
   - Emotional intelligence indicators

2. An emotional intelligence score (0-100) for each person with brief explanation of:
   - Self-awareness
   - Self-regulation
   - Motivation
   - Empathy
   - Social skills

3. Three personalized communication tips for each person to improve their relationship dynamics

IMPORTANT: You MUST respond ONLY in this strict JSON format:
{
  "forPersonA": {
    "name": "${firstPersonName}",
    "profile": {
      "attachmentStyle": "",
      "communicationStyle": "",
      "empathyLevel": ""
    },
    "emotionalIntelligence": {
      "score": 0,
      "explanation": "",
      "components": {
        "selfAwareness": 0,
        "selfRegulation": 0,
        "motivation": 0,
        "empathy": 0,
        "socialSkills": 0
      }
    },
    "communicationTips": ["", "", ""]
  },
  "forPersonB": {
    "name": "${secondPersonName}",
    "profile": {
      "attachmentStyle": "",
      "communicationStyle": "",
      "empathyLevel": ""
    },
    "emotionalIntelligence": {
      "score": 0,
      "explanation": "",
      "components": {
        "selfAwareness": 0,
        "selfRegulation": 0,
        "motivation": 0,
        "empathy": 0,
        "socialSkills": 0
      }
    },
    "communicationTips": ["", "", ""]
  },
  "relationshipDynamics": {
    "overview": "",
    "strengths": ["", ""],
    "challenges": ["", ""],
    "compatibilityScore": 0
  }
}

Chat transcript:
${transcript}
`

    // Detect language (simple implementation)
    const languageDetected = detectLanguage(transcript)
    let languagePrompt = ""

    if (languageDetected && languageDetected !== "english") {
      languagePrompt = `This chat appears to be in ${languageDetected}. Please analyze it accordingly, but still respond in English.`
      prompt = `${languagePrompt}\n\n${prompt}`
    }

    // Record analysis start time for metrics
    const analysisStartTime = Date.now()

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    })

    // Calculate analysis duration
    const analysisDuration = Date.now() - analysisStartTime

    const content = completion.choices[0].message.content

    // Parse the JSON response
    let analysis
    try {
      analysis = JSON.parse(content || "{}")
    } catch (e) {
      console.error("Failed to parse GPT response as JSON:", e)
      return NextResponse.json({ error: "Failed to parse analysis results" }, { status: 500 })
    }

    // Add metadata to the analysis
    const analysisWithMetadata = {
      ...analysis,
      _metadata: {
        timestamp: new Date().toISOString(),
        messageCount: messages.length,
        analysisDuration,
        model: "gpt-4",
        language: languageDetected || "english",
        cacheHit: false,
      },
    }

    // Cache the analysis for future use
    await cacheGPTAnalysis(messageHash, firstPersonName, secondPersonName, analysisWithMetadata)

    return NextResponse.json({ analysis: analysisWithMetadata })
  } catch (error) {
    console.error("Error in emotion analysis API:", error)
    return NextResponse.json({ error: "Failed to analyze emotions" }, { status: 500 })
  }
}

// Simple language detection function
function detectLanguage(text: string): string | null {
  // This is a very basic implementation
  // In a production app, you would use a proper language detection library

  const spanishKeywords = ["hola", "como", "estás", "gracias", "por", "qué", "bien", "amor", "te quiero"]
  const frenchKeywords = ["bonjour", "comment", "merci", "bien", "amour", "je t'aime", "oui", "non", "pourquoi"]
  const germanKeywords = ["hallo", "wie", "danke", "gut", "liebe", "ich liebe", "ja", "nein", "warum"]

  const textLower = text.toLowerCase()

  let spanishCount = 0
  let frenchCount = 0
  let germanCount = 0

  spanishKeywords.forEach((word) => {
    if (textLower.includes(word)) spanishCount++
  })

  frenchKeywords.forEach((word) => {
    if (textLower.includes(word)) frenchCount++
  })

  germanKeywords.forEach((word) => {
    if (textLower.includes(word)) germanCount++
  })

  if (spanishCount > 3) return "spanish"
  if (frenchCount > 3) return "french"
  if (germanCount > 3) return "german"

  return null // Assume English or unable to determine
}
