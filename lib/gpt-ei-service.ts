import type { Message } from "./types"

export interface GPTEmotionalAnalysis {
  forPersonA: {
    name: string
    profile: {
      attachmentStyle: string
      communicationStyle: string
      empathyLevel: string
    }
    emotionalIntelligence: {
      score: number
      explanation: string
      components: {
        selfAwareness: number
        selfRegulation: number
        motivation: number
        empathy: number
        socialSkills: number
      }
    }
    communicationTips: string[]
  }
  forPersonB: {
    name: string
    profile: {
      attachmentStyle: string
      communicationStyle: string
      empathyLevel: string
    }
    emotionalIntelligence: {
      score: number
      explanation: string
      components: {
        selfAwareness: number
        selfRegulation: number
        motivation: number
        empathy: number
        socialSkills: number
      }
    }
    communicationTips: string[]
  }
  relationshipDynamics: {
    overview: string
    strengths: string[]
    challenges: string[]
    compatibilityScore: number
  }
  _metadata?: {
    timestamp: string
    messageCount: number
    analysisDuration: number
    model: string
    language: string
  }
}

export interface GPTAnalysisError {
  error: string
  status?: number
  limit?: number
  remaining?: number
  reset?: number
}

export async function fetchGPTEmotionalAnalysis(
  messages: Message[],
  firstPersonName: string,
  secondPersonName: string,
): Promise<{ analysis: GPTEmotionalAnalysis | null; error: GPTAnalysisError | null }> {
  try {
    console.log(`Fetching GPT emotional analysis for ${messages.length} messages`)

    const response = await fetch("/api/emotion-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, firstPersonName, secondPersonName }),
    })

    if (!response.ok) {
      const errorData = await response.json()

      if (response.status === 429) {
        console.warn("Rate limit exceeded for GPT analysis")
        return {
          analysis: null,
          error: {
            error: "Rate limit exceeded. Please try again later.",
            status: 429,
            limit: errorData.limit,
            remaining: errorData.remaining,
            reset: errorData.reset,
          },
        }
      }

      throw new Error(`GPT emotional analysis failed: ${response.status} ${errorData.error || "Unknown error"}`)
    }

    const data = await response.json()

    if (!data.analysis) {
      throw new Error("No analysis data returned from API")
    }

    console.log("GPT emotional analysis completed successfully")
    return { analysis: data.analysis, error: null }
  } catch (error) {
    console.error("Error fetching GPT emotional analysis:", error)

    // Return a default structure with error information
    return {
      analysis: null,
      error: {
        error: `Analysis failed: ${error instanceof Error ? error.message : String(error)}`,
      },
    }
  }
}
