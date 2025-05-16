import { isOpenAIEnabled, getOpenAIKey } from "./api-config"
import type { Message } from "./types"

// Main function to analyze text with OpenAI
export async function analyzeWithOpenAI(text: string, systemPrompt: string) {
  try {
    const apiKey = await getOpenAIKey()

    if (!apiKey) {
      throw new Error("OpenAI API key not available")
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content
  } catch (error) {
    console.error("Error in OpenAI analysis:", error)
    throw error
  }
}

// Analyze sentiment for a batch of messages
export async function batchAnalyzeSentiment(texts: string[]): Promise<number[]> {
  try {
    if (!isOpenAIEnabled()) {
      throw new Error("OpenAI is not enabled")
    }

    const apiKey = await getOpenAIKey()

    if (!apiKey) {
      throw new Error("OpenAI API key not available")
    }

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
        model: "gpt-4o",
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
  } catch (error) {
    console.error("Error in batch sentiment analysis:", error)
    throw error
  }
}

// Enhanced function to generate a psychological profile with personalized communication style analysis
export async function generateProfileForSubject(messages: Message[], name: string) {
  try {
    if (!isOpenAIEnabled()) {
      throw new Error("OpenAI is not enabled")
    }

    const apiKey = await getOpenAIKey()

    if (!apiKey) {
      throw new Error("OpenAI API key not available")
    }

    // Filter messages to only include those from this person
    const subjectMessages = messages.filter((msg) => msg.sender === name)

    if (subjectMessages.length === 0) {
      console.warn(`No messages found for ${name}`)
      return getDefaultProfile(name)
    }

    // Get messages from other participants to understand context
    const otherMessages = messages.filter((msg) => msg.sender !== name)
    const otherParticipants = [...new Set(otherMessages.map((msg) => msg.sender))]

    // Extract conversation context
    const conversationContext = extractConversationContext(messages, name)

    // Prepare conversation data for analysis
    const messagesSummary = subjectMessages
      .map((msg) => `"${msg.text}" (Sentiment: ${msg.sentiment || "Unknown"})`)
      .join("\n")

    // Create the prompt for psychological profile analysis with enhanced communication style focus
    const systemPrompt = `
      You are a relationship psychologist specializing in communication patterns, linguistic analysis, and psychological profiling.
      Analyze messages from ${name} to create a detailed psychological profile with personalized communication style insights.
      
      IMPORTANT: This analysis must be unique to ${name}'s communication style and patterns. Do not mirror or copy patterns from other participants.
      
      CONVERSATION CONTEXT:
      ${name} is communicating with: ${otherParticipants.join(", ")}
      Total messages from ${name}: ${subjectMessages.length}
      Average message length: ${Math.round(subjectMessages.reduce((sum, msg) => sum + msg.text.length, 0) / subjectMessages.length)} characters
      Conversation topics: ${conversationContext.topics.join(", ")}
      Emotional tone: ${conversationContext.emotionalTone}
      
      Focus on ${name}'s unique characteristics:
      1. COMMUNICATION STYLE:
         - Identify ${name}'s unique linguistic patterns (word choice, sentence structure, punctuation usage)
         - Analyze ${name}'s communication preferences (direct vs indirect, detailed vs concise, formal vs casual)
         - Determine ${name}'s primary and secondary communication styles (assertive, analytical, expressive, supportive)
         - Note any context-specific adaptations in ${name}'s communication approach
      
      2. ATTACHMENT STYLE:
         - Identify ${name}'s attachment indicators (secure, anxious, avoidant, disorganized/fearful)
         - Note how ${name}'s attachment style manifests in specific language patterns
         - Assess confidence level in attachment classification
         - Provide specific examples from ${name}'s messages that indicate their attachment style
      
      3. PSYCHOLOGICAL PATTERNS:
         - Analyze ${name}'s transactional analysis ego states (parent, adult, child) with specific examples
         - Identify ${name}'s cognitive patterns and potential cognitive distortions
         - Assess ${name}'s emotional intelligence markers in communication
      
      4. LINGUISTIC DETAILS:
         - Measure ${name}'s cognitive complexity (abstract thinking, nuance, perspective-taking)
         - Evaluate ${name}'s emotional expressiveness (emotion words, intensity markers)
         - Analyze ${name}'s social engagement patterns (questions, acknowledgments, turn-taking)
         - Assess ${name}'s psychological distancing (impersonal language, passive voice)
         - Measure ${name}'s certainty level (hedging, qualifiers, absolutes)
      
      5. PERSONALIZED INSIGHTS:
         - Identify 3-5 unique communication strengths specific to ${name}'s style
         - Suggest 2-3 personalized growth areas based on ${name}'s communication patterns
         - Note dominant emotions expressed by ${name} and how they influence communication
         - Identify any recurring themes or patterns specific to ${name}
      
      Return the analysis as a JSON object with the following structure:
      {
        "name": "${name}",
        "communicationStyle": {
          "primary": "Style name",
          "secondary": "Style name or null",
          "uniqueTraits": ["Trait 1", "Trait 2", "Trait 3"],
          "preferredApproaches": ["Approach 1", "Approach 2"],
          "contextualAdaptations": ["Adaptation 1", "Adaptation 2"]
        },
        "attachmentStyle": { 
          "primaryStyle": "Style", 
          "secondaryStyle": "Style or null", 
          "confidence": 70,
          "indicators": ["Indicator 1", "Indicator 2"],
          "examples": ["Example 1", "Example 2"]
        },
        "transactionalAnalysis": { 
          "dominantEgoState": "State",
          "egoStateDistribution": { "parent": 30, "adult": 40, "child": 30 },
          "examples": ["Example 1", "Example 2"]
        },
        "linguisticPatterns": {
          "cognitiveComplexity": 70,
          "emotionalExpressiveness": 65,
          "socialEngagement": 75,
          "psychologicalDistancing": 40,
          "certaintyLevel": 60,
          "dominantEmotions": ["Emotion1", "Emotion2"],
          "wordChoicePatterns": ["Pattern 1", "Pattern 2"],
          "sentenceStructure": "Description"
        },
        "personalizedInsights": {
          "communicationStrengths": ["Strength1", "Strength2", "Strength3"],
          "growthAreas": ["Area1", "Area2"],
          "recurringThemes": ["Theme1", "Theme2"],
          "uniqueCharacteristics": ["Characteristic1", "Characteristic2"]
        }
      }
    `

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: messagesSummary,
          },
        ],
        temperature: 0.4,
        max_tokens: 1500,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const analysisText = data.choices[0]?.message?.content?.trim()

    if (!analysisText) {
      throw new Error("Empty response from OpenAI")
    }

    // Extract JSON from the response (in case there's any text before or after)
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.warn("Could not extract JSON from OpenAI response, using default profile")
      return getDefaultProfile(name)
    }

    try {
      const enhancedProfile = JSON.parse(jsonMatch[0])

      // Convert the enhanced profile to the format expected by the UI
      return convertToCompatibleProfile(enhancedProfile)
    } catch (error) {
      console.error("Error parsing psychological profile from OpenAI:", error)
      return getDefaultProfile(name)
    }
  } catch (error) {
    console.error(`Error generating profile for ${name}:`, error)
    return getDefaultProfile(name)
  }
}

// Helper function to extract conversation context
function extractConversationContext(messages: Message[], subjectName: string) {
  // Default values
  const context = {
    topics: ["general conversation"],
    emotionalTone: "neutral",
  }

  if (!messages || messages.length === 0) {
    return context
  }

  // Extract potential topics from message content
  const allText = messages.map((msg) => msg.text.toLowerCase()).join(" ")

  // Simple topic detection based on keyword frequency
  const topicKeywords: { [key: string]: string[] } = {
    work: ["work", "job", "office", "meeting", "project", "boss", "colleague", "deadline"],
    relationship: ["relationship", "love", "together", "feel", "us", "couple", "partner"],
    family: ["family", "mom", "dad", "parent", "child", "kid", "brother", "sister"],
    social: ["friend", "party", "hang out", "meet up", "social", "fun", "weekend"],
    planning: ["plan", "schedule", "time", "when", "date", "calendar", "tomorrow", "later"],
    emotional: ["feel", "emotion", "sad", "happy", "angry", "upset", "worried", "excited"],
    conflict: ["sorry", "misunderstanding", "wrong", "argue", "fight", "disagree", "upset"],
    support: ["support", "help", "there for you", "understand", "listen", "care"],
  }

  const detectedTopics = Object.entries(topicKeywords)
    .filter(([topic, keywords]) => keywords.some((keyword) => allText.includes(keyword)))
    .map(([topic]) => topic)

  if (detectedTopics.length > 0) {
    context.topics = detectedTopics
  }

  // Determine emotional tone based on average sentiment
  const avgSentiment =
    messages.filter((msg) => msg.sentiment !== undefined).reduce((sum, msg) => sum + (msg.sentiment || 50), 0) /
      messages.filter((msg) => msg.sentiment !== undefined).length || 50

  if (avgSentiment > 70) {
    context.emotionalTone = "positive"
  } else if (avgSentiment < 40) {
    context.emotionalTone = "negative"
  } else if (avgSentiment > 55) {
    context.emotionalTone = "slightly positive"
  } else if (avgSentiment < 45) {
    context.emotionalTone = "slightly negative"
  } else {
    context.emotionalTone = "neutral"
  }

  return context
}

// Helper function to convert enhanced profile to compatible format
function convertToCompatibleProfile(enhancedProfile: any) {
  // Ensure we have a valid profile object
  if (!enhancedProfile || typeof enhancedProfile !== "object") {
    return getDefaultProfile(enhancedProfile?.name || "Unknown")
  }

  // Create a compatible profile structure that maintains backward compatibility
  // while incorporating the enhanced data
  return {
    name: enhancedProfile.name || "Unknown",
    attachmentStyle: {
      primaryStyle: enhancedProfile.attachmentStyle?.primaryStyle || "Secure",
      secondaryStyle: enhancedProfile.attachmentStyle?.secondaryStyle || null,
      confidence: enhancedProfile.attachmentStyle?.confidence || 50,
      indicators: enhancedProfile.attachmentStyle?.indicators || [],
      explanation: enhancedProfile.attachmentStyle?.examples?.join(". ") || "Based on communication patterns and attachment indicators",
      limitedDataWarning: enhancedProfile.attachmentStyle?.indicators?.length === 0 ? "Limited data available for analysis" : undefined,
    },
    transactionalAnalysis: {
      dominantEgoState: enhancedProfile.transactionalAnalysis?.dominantEgoState || "Adult",
      egoStateDistribution: enhancedProfile.transactionalAnalysis?.egoStateDistribution || {
        parent: 33,
        adult: 34,
        child: 33,
      },
      examples: enhancedProfile.transactionalAnalysis?.examples || [],
    },
    linguisticPatterns: {
      cognitiveComplexity: enhancedProfile.linguisticPatterns?.cognitiveComplexity || 50,
      emotionalExpressiveness: enhancedProfile.linguisticPatterns?.emotionalExpressiveness || 50,
      socialEngagement: enhancedProfile.linguisticPatterns?.socialEngagement || 50,
      psychologicalDistancing: enhancedProfile.linguisticPatterns?.psychologicalDistancing || 50,
      certaintyLevel: enhancedProfile.linguisticPatterns?.certaintyLevel || 50,
      dominantEmotions: enhancedProfile.linguisticPatterns?.dominantEmotions || ["Neutral"],
      wordChoicePatterns: enhancedProfile.linguisticPatterns?.wordChoicePatterns || [],
      sentenceStructure: enhancedProfile.linguisticPatterns?.sentenceStructure || "Standard",
    },
    communicationStyle: {
      primary: enhancedProfile.communicationStyle?.primary || "Balanced",
      secondary: enhancedProfile.communicationStyle?.secondary || null,
      uniqueTraits: enhancedProfile.communicationStyle?.uniqueTraits || [],
      preferredApproaches: enhancedProfile.communicationStyle?.preferredApproaches || [],
      contextualAdaptations: enhancedProfile.communicationStyle?.contextualAdaptations || [],
    },
    personalizedInsights: {
      communicationStrengths: enhancedProfile.personalizedInsights?.communicationStrengths ||
        enhancedProfile.communicationStrengths || ["Clear communication"],
      growthAreas: enhancedProfile.personalizedInsights?.growthAreas ||
        enhancedProfile.growthAreas || ["Developing emotional awareness"],
      recurringThemes: enhancedProfile.personalizedInsights?.recurringThemes || [],
      uniqueCharacteristics: enhancedProfile.personalizedInsights?.uniqueCharacteristics || [],
    },
    // Include these for backward compatibility
    communicationStrengths: enhancedProfile.personalizedInsights?.communicationStrengths ||
      enhancedProfile.communicationStrengths || ["Clear communication"],
    growthAreas: enhancedProfile.personalizedInsights?.growthAreas ||
      enhancedProfile.growthAreas || ["Developing emotional awareness"],
  }
}

// Helper function to get a default profile (maintains structure compatibility)
function getDefaultProfile(name: string) {
  return {
    name,
    attachmentStyle: {
      primaryStyle: "Secure",
      secondaryStyle: null,
      confidence: 50,
      indicators: [],
    },
    transactionalAnalysis: {
      dominantEgoState: "Adult",
      egoStateDistribution: {
        parent: 33,
        adult: 34,
        child: 33,
      },
      examples: [],
    },
    linguisticPatterns: {
      cognitiveComplexity: 50,
      emotionalExpressiveness: 50,
      socialEngagement: 50,
      psychologicalDistancing: 50,
      certaintyLevel: 50,
      dominantEmotions: ["Neutral"],
      wordChoicePatterns: [],
      sentenceStructure: "Standard",
    },
    communicationStyle: {
      primary: "Balanced",
      secondary: null,
      uniqueTraits: ["Clear expression"],
      preferredApproaches: ["Direct communication"],
      contextualAdaptations: [],
    },
    personalizedInsights: {
      communicationStrengths: ["Clear communication"],
      growthAreas: ["Developing emotional awareness"],
      recurringThemes: ["General conversation"],
      uniqueCharacteristics: ["Standard communication patterns"],
    },
    // Include these for backward compatibility
    communicationStrengths: ["Clear communication"],
    growthAreas: ["Developing emotional awareness"],
  }
}

// Updated function to analyze psychological profiles with individual subject analysis
export async function analyzePsychologicalProfiles(
  messages: Message[],
  firstPersonName: string,
  secondPersonName: string,
) {
  try {
    if (!isOpenAIEnabled()) {
      throw new Error("OpenAI is not enabled")
    }

    // Generate individual profiles for each person
    console.log(`Generating profile for ${firstPersonName}...`)
    const firstPersonProfile = await generateProfileForSubject(messages, firstPersonName)

    console.log(`Generating profile for ${secondPersonName}...`)
    const secondPersonProfile = await generateProfileForSubject(messages, secondPersonName)

    return {
      firstPersonProfile,
      secondPersonProfile,
    }
  } catch (error) {
    console.error("Error analyzing psychological profiles:", error)

    // Return default profiles if analysis fails
    return {
      firstPersonProfile: getDefaultProfile(firstPersonName),
      secondPersonProfile: getDefaultProfile(secondPersonName),
    }
  }
}

// Analyze relationship dynamics with OpenAI
export async function analyzeRelationshipDynamics(
  messages: any[],
  firstPersonName: string,
  secondPersonName: string,
  gottmanScores: any,
) {
  try {
    if (!isOpenAIEnabled()) {
      throw new Error("OpenAI is not enabled")
    }

    const apiKey = await getOpenAIKey()

    if (!apiKey) {
      throw new Error("OpenAI API key not available")
    }

    // Prepare conversation data for analysis
    const conversationSummary = messages
      .slice(0, 20)
      .map((msg) => `${msg.sender}: "${msg.text}" (Sentiment: ${msg.sentiment || "Unknown"})`)
      .join("\n")

    // Create the prompt for relationship dynamics analysis
    const prompt = `
      Analyze the following conversation between ${firstPersonName} and ${secondPersonName} to assess their relationship dynamics.
      
      Conversation:
      ${conversationSummary}
      
      Gottman Scores:
      ${JSON.stringify(gottmanScores)}
      
      Provide a comprehensive analysis of their relationship dynamics including:
      1. Positive-to-negative interaction ratio
      2. Conflict style (Competitive, Collaborative, Compromising, Avoiding, Accommodating)
      3. Attachment compatibility
      4. Key growth areas
      5. Relationship strengths
      
      Return the analysis as a JSON object with the following structure:
      {
        "positiveToNegativeRatio": 5.0,
        "conflictStyle": "Style",
        "attachmentCompatibility": "Compatibility Level",
        "keyGrowthAreas": ["Area1", "Area2", "Area3"],
        "relationshipStrengths": ["Strength1", "Strength2", "Strength3"]
      }
    `

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a relationship dynamics analysis assistant specializing in the Gottman method and attachment theory. Analyze conversations and provide detailed relationship dynamics in JSON format.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.4,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const analysisText = data.choices[0]?.message?.content?.trim()

    if (!analysisText) {
      throw new Error("Empty response from OpenAI")
    }

    // Extract JSON from the response (in case there's any text before or after)
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from OpenAI response")
    }

    try {
      return JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error("Error parsing relationship dynamics from OpenAI:", error)
      throw new Error("Failed to parse relationship dynamics")
    }
  } catch (error) {
    console.error("Error analyzing relationship dynamics:", error)
    throw error
  }
}
