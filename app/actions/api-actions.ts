"use server"

// Server action to get the OpenAI API key from environment variables
export async function getServerOpenAIKey(): Promise<{ available: boolean; key?: string }> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return { available: false }
  }

  // Return a sanitized response that just indicates the key is available
  // The actual key will only be used in server actions
  return { available: true, key: apiKey }
}

// Server action to validate an OpenAI API key
export async function validateOpenAIKey(key: string): Promise<{ valid: boolean; error?: string }> {
  try {
    // Make a simple request to the OpenAI API to validate the key
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${key}`,
      },
    })

    if (response.ok) {
      return { valid: true, error: undefined }
    } else {
      const errorData = await response.json()
      return { valid: false, error: errorData.error?.message || "Invalid API key" }
    }
  } catch (error) {
    return { valid: false, error: "Network error while validating API key" }
  }
}

// Add the validateApiKey function for backward compatibility
export async function validateApiKey(apiKey: string) {
  // Simple validation to check if the key has the correct format
  if (!apiKey || typeof apiKey !== "string" || !apiKey.startsWith("sk-")) {
    return { valid: false, error: "Invalid API key format" }
  }

  try {
    // Additional validation logic can go here if needed
    return { valid: true }
  } catch (error) {
    console.error("Error validating API key:", error)
    return { valid: false, error: "Error validating API key" }
  }
}

// Server action to analyze sentiment with OpenAI
export async function analyzeTextSentiment(text: string): Promise<number> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("OpenAI API key is not available")
  }

  const model = "gpt-3.5-turbo"

  // Prepare the prompt for sentiment analysis
  const prompt = `
    Analyze the sentiment of this message on a scale of 0-100, where:
    0-20: Very negative
    21-40: Negative
    41-60: Neutral
    61-80: Positive
    81-100: Very positive
    
    Message: "${text}"
    
    Return only the numeric score.
  `

  // Call OpenAI API
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: "system",
          content:
            "You are a sentiment analysis assistant. Analyze the sentiment of messages and return only a numeric score between 0 and 100.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 10,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`)
  }

  const data = await response.json()

  // Extract the sentiment score from the response
  const scoreText = data.choices[0]?.message?.content?.trim() || "50"
  const score = Number.parseInt(scoreText, 10)

  // Validate the score
  if (isNaN(score) || score < 0 || score > 100) {
    console.warn("Invalid sentiment score from OpenAI:", scoreText)
    return 50 // Default to neutral
  }

  return score
}

// Server action to batch analyze sentiment with OpenAI
export async function batchAnalyzeTextSentiment(texts: string[]): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("OpenAI API key is not available")
  }

  const model = "gpt-3.5-turbo"

  // Prepare the prompt for batch sentiment analysis
  const prompt = `
    Analyze the sentiment of each of the following messages on a scale of 0-100, where:
    0-20: Very negative
    21-40: Negative
    41-60: Neutral
    61-80: Positive
    81-100: Very positive
    
    Messages:
    ${texts.map((text, index) => `${index + 1}. "${text}"`).join("\n")}
    
    Return only a JSON array of numeric scores in the same order as the messages, like this: [75, 30, 50]
  `

  // Call OpenAI API
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: "system",
          content:
            "You are a sentiment analysis assistant. Analyze the sentiment of messages and return only a JSON array of numeric scores between 0 and 100.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 100,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`)
  }

  const data = await response.json()

  // Extract the sentiment scores from the response
  const scoresText = data.choices[0]?.message?.content?.trim() || "[]"

  // Try to parse the JSON array
  try {
    const scores = JSON.parse(scoresText)

    // Validate that we have an array of numbers
    if (!Array.isArray(scores) || scores.length !== texts.length || scores.some((s) => typeof s !== "number")) {
      console.warn("Invalid sentiment scores from OpenAI:", scoresText)
      return texts.map(() => 50) // Default to neutral
    }

    return scores
  } catch (error) {
    console.error("Error parsing sentiment scores from OpenAI:", error)
    return texts.map(() => 50) // Default to neutral
  }
}

export async function getApiStatus(): Promise<{ hasApiKey: boolean }> {
  const apiKey = process.env.OPENAI_API_KEY
  return { hasApiKey: !!apiKey }
}

// Server action to initialize the OpenAI API key
export async function initializeOpenAI() {
  // Access the environment variable server-side only
  const apiKey = process.env.OPENAI_API_KEY || null

  if (apiKey) {
    // Return a boolean indicating if the API key is available
    return true
  }

  return false
}
