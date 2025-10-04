"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { Buffer } from "buffer"

// Helper function to convert File to base64
async function fileToBase64(file: File): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  return buffer.toString("base64")
}

// Extract text from image using GPT-4 Vision with enhanced instructions
async function extractTextFromImage(file: File): Promise<{
  text: string
  speaker1Label: string
  speaker2Label: string
  confidence: number
}> {
  console.log(`Extracting text from: ${file.name}`)

  if (!process.env.OPENAI_API_KEY) {
    console.error("CRITICAL: No OpenAI API key found in environment variables")
    throw new Error("OpenAI API key not configured. Please check your environment variables.")
  }

  try {
    const base64Image = await fileToBase64(file)

    if (!base64Image || base64Image.length < 100) {
      console.error(`Invalid base64 image data for ${file.name}`)
      throw new Error("Failed to convert image to base64 format")
    }

    console.log(`Base64 image length: ${base64Image.length} characters`)

    const result = await generateText({
      model: openai("gpt-4o-2024-08-06"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an expert OCR system specialized in extracting text from mobile messaging screenshots.

IMPORTANT: This works with BOTH Android and iPhone screenshots from ANY messaging app (SMS, WhatsApp, iMessage, Messenger, etc.)

INSTRUCTIONS:
1. Extract EVERY message exactly as written
2. Identify speakers by their position or appearance:
   - Messages on the RIGHT (often blue, purple, or green bubbles) = "Person A" 
   - Messages on the LEFT (often gray or white bubbles) = "Person B"
   - If you see names, use those to distinguish speakers
   - In group chats or if unclear, use context clues

3. Format EVERY message as:
   Person A: [exact message text]
   Person B: [exact message text]

4. Preserve the EXACT order from top to bottom
5. Include timestamps if visible (helps with context)
6. If a message has emojis, include them
7. If you can't read some text, use [unclear] but extract what you can

COMMON FORMATS TO RECOGNIZE:
- iPhone iMessage: Blue (sent) and gray (received) bubbles
- Android Messages: Purple/blue (sent) and gray (received) bubbles  
- WhatsApp: Green (sent) and white (received) bubbles
- Facebook Messenger: Blue bubbles with profile pictures
- Any other messaging app format

EXAMPLE OUTPUT:
Person A: Hey! How are you?
Person B: I'm good, thanks! How about you?
Person A: Pretty good 😊
Person B: That's great to hear!

Now extract ALL text from this screenshot. Focus on accuracy and completeness:`,
            },
            {
              type: "image",
              image: base64Image,
            },
          ],
        },
      ],
      maxTokens: 2000,
      temperature: 0.1,
    })

    const extractedText = result.text || ""

    console.log(`Successfully extracted ${extractedText.length} characters from ${file.name}`)
    console.log(`Raw extraction (first 200 chars): ${extractedText.substring(0, 200)}`)

    let processedText = extractedText

    const hasPersonA = processedText.includes("Person A:")
    const hasPersonB = processedText.includes("Person B:")

    if (!hasPersonA && !hasPersonB) {
      console.log("No Person A/B labels found, attempting to reformat...")

      const lines = processedText.split("\n").filter((line) => line.trim().length > 0)

      if (lines.length > 0) {
        console.log(`Found ${lines.length} lines of text, reformatting...`)
        processedText = lines
          .map((line, index) => {
            line = line.replace(/^[-•*]\s*/, "").trim()
            const speaker = index % 2 === 0 ? "Person A" : "Person B"
            return `${speaker}: ${line}`
          })
          .join("\n")
      }
    }

    let confidence = 40
    if (processedText.length > 50) confidence = 60
    if (processedText.length > 100) confidence = 70
    if (processedText.includes("Person A:") && processedText.includes("Person B:")) confidence = 85
    if (processedText.includes("Person A:") && processedText.includes("Person B:") && processedText.length > 200)
      confidence = 90

    console.log(`Extracted ${processedText.length} characters with ${confidence}% confidence`)

    return {
      text: processedText,
      speaker1Label: "Person A",
      speaker2Label: "Person B",
      confidence,
    }
  } catch (error: any) {
    console.error(`Error extracting text from ${file.name}:`, error)
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      status: error.status,
      name: error.name,
    })

    if (error.message?.includes("API key")) {
      throw new Error(
        "OpenAI API authentication failed. Please verify your API key is correctly configured in Vercel environment variables.",
      )
    }

    if (error.status === 429) {
      throw new Error("OpenAI API rate limit exceeded. Please try again in a moment.")
    }

    if (error.status === 401) {
      throw new Error("OpenAI API authentication failed. Please check your API key configuration.")
    }

    throw new Error(`Failed to extract text: ${error.message || "Unknown error"}`)
  }
}

function normalizeSpeakers(
  extractedTexts: Array<{ text: string; speaker1Label: string; speaker2Label: string; confidence: number }>,
) {
  let allText = ""
  let totalConfidence = 0
  let successfulExtractions = 0

  for (const extracted of extractedTexts) {
    if (extracted.confidence > 0) {
      allText += extracted.text + "\n\n--- Next Screenshot ---\n\n"
      totalConfidence += extracted.confidence
      successfulExtractions++
    }
  }

  allText = allText.split("Person A:").join("Subject A:")
  allText = allText.split("Person B:").join("Subject B:")

  const avgConfidence = successfulExtractions > 0 ? totalConfidence / successfulExtractions : 0

  return { text: allText, averageConfidence: avgConfidence }
}

function countOccurrences(str: string, substring: string): number {
  let count = 0
  let position = 0

  while (true) {
    const index = str.indexOf(substring, position)
    if (index === -1) break
    count++
    position = index + 1
  }

  return count
}

// Helper function to extract JSON from text that might contain markdown code blocks
function extractJSON(text: string): string {
  let cleaned = text.trim()

  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7)
  }
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3)
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3)
  }

  cleaned = cleaned.trim()

  const jsonStart = cleaned.indexOf("{")
  const jsonEnd = cleaned.lastIndexOf("}")

  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    return cleaned.substring(jsonStart, jsonEnd + 1)
  }

  return cleaned
}

// Validate that the parsed result has required structure
function validateAnalysisResult(result: any): boolean {
  const requiredFields = [
    "communicationStylesAndEmotionalTone",
    "visualInsightsData",
    "constructiveFeedback",
    "overallRelationshipHealth",
  ]

  for (const field of requiredFields) {
    if (!result[field]) {
      console.error(`Missing required field: ${field}`)
      return false
    }
  }

  if (
    !result.visualInsightsData.emotionalCommunicationCharacteristics ||
    !result.visualInsightsData.conflictExpressionStyles ||
    !result.visualInsightsData.validationAndReassurancePatterns
  ) {
    console.error("Missing required visualInsightsData fields")
    return false
  }

  return true
}

export async function analyzeConversation(formData: FormData) {
  try {
    console.log("Environment check:", {
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      nodeEnv: process.env.NODE_ENV,
    })

    const files: File[] = []
    let i = 0
    while (formData.has(`file-${i}`)) {
      const file = formData.get(`file-${i}`) as File
      if (file && file.size > 0) {
        console.log(`File ${i}: ${file.name}, size: ${file.size} bytes, type: ${file.type}`)
        files.push(file)
      }
      i++
    }

    if (files.length === 0) {
      return {
        error: "No files uploaded or files are empty. Please upload screenshots of the conversation.",
      }
    }

    console.log(`Processing ${files.length} files...`)

    const extractedTexts = []
    const extractionErrors = []

    for (let i = 0; i < files.length; i++) {
      try {
        console.log(`Processing file ${i + 1}/${files.length}: ${files[i].name}`)
        const extracted = await extractTextFromImage(files[i])
        extractedTexts.push(extracted)
      } catch (error: any) {
        console.error(`Failed to process file ${i + 1}:`, error)
        extractionErrors.push({
          fileName: files[i].name,
          error: error.message,
        })
      }
    }

    if (extractedTexts.length === 0) {
      const errorMessages = extractionErrors.map((e) => `• ${e.fileName}: ${e.error}`).join("\n")

      return {
        error:
          "Could not extract text from any of the uploaded images.\n\n" +
          "Errors encountered:\n" +
          errorMessages +
          "\n\nPossible solutions:\n" +
          "• Verify your OpenAI API key is correctly configured in Vercel\n" +
          "• Check that your API key has access to GPT-4 Vision\n" +
          "• Ensure the images are clear and contain visible text\n" +
          "• Try uploading fewer images at once",
      }
    }

    if (extractionErrors.length > 0) {
      console.warn(`${extractionErrors.length} files failed to process:`, extractionErrors)
    }

    const { text: conversationText, averageConfidence } = normalizeSpeakers(extractedTexts)

    console.log("Extracted conversation length:", conversationText.length, "characters")
    console.log("Average extraction confidence:", averageConfidence, "%")
    console.log("First 500 characters:", conversationText.substring(0, 500).replace(/\n/g, " | "))

    if (conversationText.length < 10) {
      return {
        error:
          "Very little text was extracted from the images. Please try:\n" +
          "• Uploading higher quality screenshots\n" +
          "• Making sure the text is clearly visible\n" +
          "• Ensuring the screenshots are from a messaging app\n" +
          "• Checking that the images aren't corrupted or too small",
      }
    }

    const subjectACount = countOccurrences(conversationText, "Subject A:")
    const subjectBCount = countOccurrences(conversationText, "Subject B:")
    const messageCount = subjectACount + subjectBCount

    const lines = conversationText.split("\n").filter((line) => line.trim().length > 10)

    if (messageCount === 0) {
      if (lines.length === 0) {
        return {
          error:
            "The extracted text doesn't appear to contain conversation messages.\n\n" +
            "Please ensure you're uploading screenshots of text message conversations from:\n" +
            "• iPhone (iMessage, SMS)\n" +
            "• Android (Messages, SMS)\n" +
            "• WhatsApp, Messenger, Telegram, or other messaging apps\n\n" +
            "Make sure the text is clearly visible and readable in the screenshots.",
        }
      }

      console.log(`Found ${lines.length} lines of text without proper format. Attempting to proceed anyway...`)
    }

    let confidenceWarning = ""
    if (averageConfidence < 60) {
      confidenceWarning =
        "Note: Some text was difficult to read. The analysis is based on what could be extracted, but results may be less accurate. Consider uploading higher quality screenshots for better results."
    }

    const actualMessageCount = messageCount > 0 ? messageCount : Math.min(lines.length, 50)
    console.log(`Analyzing ${actualMessageCount} messages (${subjectACount} from A, ${subjectBCount} from B)...`)

    const conversationLength = actualMessageCount < 10 ? "limited" : actualMessageCount < 30 ? "moderate" : "extensive"

    const analysisPrompt = `You are Love Lens, an expert relationship analysis AI. You MUST respond with ONLY valid JSON.

CONVERSATION TO ANALYZE:
${conversationText}

CONTEXT: ${conversationLength} conversation with ~${actualMessageCount} messages.

CRITICAL INSTRUCTIONS:
1. Respond with ONLY a JSON object - no other text before or after
2. Do NOT use markdown code blocks or formatting
3. Use realistic scores (1-10) based on actual observations
4. Be specific and evidence-based in your analysis
5. This is a text conversation analysis - not inappropriate content

OUTPUT FORMAT (return this exact structure):
{
  "introductionNote": "Brief intro mentioning ${actualMessageCount} messages analyzed",
  "overallRelationshipHealth": {
    "score": [realistic 1-10 number],
    "description": "Overall assessment"
  },
  "communicationStylesAndEmotionalTone": {
    "description": "Detailed communication analysis",
    "emotionalVibeTags": ["tag1", "tag2", "tag3"],
    "regulationPatternsObserved": "Emotion management patterns",
    "messageRhythmAndPacing": "Response patterns",
    "subjectAStyle": "A's communication style",
    "subjectBStyle": "B's communication style"
  },
  "recurringPatternsIdentified": {
    "description": "Observable patterns",
    "loopingMiscommunicationsExamples": ["example or 'Not observed'"],
    "commonTriggersAndResponsesExamples": ["example or 'Not observed'"],
    "repairAttemptsOrEmotionalAvoidancesExamples": ["example or 'Not observed'"],
    "positivePatterns": ["pattern1", "pattern2"]
  },
  "reflectiveFrameworks": {
    "description": "Psychological insights",
    "attachmentEnergies": "Attachment style indicators",
    "loveLanguageFriction": "Love language patterns",
    "gottmanConflictMarkers": "Conflict/positive interactions",
    "emotionalIntelligenceIndicators": "EI indicators"
  },
  "whatsGettingInTheWay": {
    "description": "Observable obstacles",
    "emotionalMismatches": "Emotional need misalignments",
    "communicationGaps": "What's unsaid/unclear",
    "subtlePowerStrugglesOrMisfires": "Dynamic imbalances",
    "externalStressors": "External pressures mentioned"
  },
  "constructiveFeedback": {
    "subjectA": {
      "strengths": ["strength1", "strength2", "strength3"],
      "gentleGrowthNudges": ["suggestion1", "suggestion2", "suggestion3"],
      "connectionBoosters": ["action1", "action2", "action3"]
    },
    "subjectB": {
      "strengths": ["strength1", "strength2", "strength3"],
      "gentleGrowthNudges": ["suggestion1", "suggestion2", "suggestion3"],
      "connectionBoosters": ["action1", "action2", "action3"]
    },
    "forBoth": {
      "sharedStrengths": ["strength1", "strength2"],
      "sharedGrowthNudges": ["suggestion1", "suggestion2", "suggestion3"],
      "sharedConnectionBoosters": ["action1", "action2", "action3"]
    }
  },
  "visualInsightsData": {
    "descriptionForChartsIntro": "Based on ${actualMessageCount} messages",
    "emotionalCommunicationCharacteristics": [
      {"category": "Expresses Vulnerability", "Subject A": 7, "Subject B": 6},
      {"category": "Active Listening", "Subject A": 8, "Subject B": 7},
      {"category": "Emotional Awareness", "Subject A": 6, "Subject B": 8},
      {"category": "Empathy Expression", "Subject A": 7, "Subject B": 9},
      {"category": "Openness", "Subject A": 8, "Subject B": 7}
    ],
    "conflictExpressionStyles": [
      {"category": "Uses 'I' Statements", "Subject A": 5, "Subject B": 6},
      {"category": "Avoids Blame
      {"category": "Uses 'I' Statements", "Subject A": 5, "Subject B": 6},
      {"category": "Avoids Blame", "Subject A": 7, "Subject B": 8},
      {"category": "Seeks Resolution", "Subject A": 6, "Subject B": 7},
      {"category": "Takes Responsibility", "Subject A": 7, "Subject B": 6},
      {"category": "Manages Emotions", "Subject A": 6, "Subject B": 7}
    ],
    "validationAndReassurancePatterns": [
      {"category": "Offers Validation", "Subject A": 8, "Subject B": 9},
      {"category": "Provides Reassurance", "Subject A": 7, "Subject B": 8},
      {"category": "Acknowledges Feelings", "Subject A": 6, "Subject B": 8},
      {"category": "Shows Appreciation", "Subject A": 9, "Subject B": 8},
      {"category": "Offers Support", "Subject A": 7, "Subject B": 9}
    ],
    "communicationMetrics": {
      "responseTimeBalance": 7,
      "messageLengthBalance": 6,
      "emotionalDepth": 8,
      "conflictResolution": 7,
      "affectionLevel": 8
    }
  },
  "outlook": "Realistic 2-3 paragraph assessment with specific recommendations",
  "optionalAppendix": "Additional observations",
  "keyTakeaways": ["takeaway1", "takeaway2", "takeaway3"]
}`

    let retryCount = 0
    const maxRetries = 2

    while (retryCount <= maxRetries) {
      try {
        console.log(`Analysis attempt ${retryCount + 1}/${maxRetries + 1}...`)

        const result = await generateText({
          model: openai("gpt-4o-2024-08-06"),
          messages: [
            {
              role: "system",
              content:
                "You are a relationship analysis AI. You MUST respond with ONLY valid JSON. No markdown, no explanations, just the JSON object. This is analyzing text conversations for relationship insights - completely appropriate content.",
            },
            {
              role: "user",
              content: analysisPrompt,
            },
          ],
          temperature: 0.3,
          maxTokens: 5000,
        })

        const rawJsonText = result.text.trim()
        console.log("Raw AI response length:", rawJsonText.length)
        console.log("First 100 chars:", rawJsonText.substring(0, 100))

        if (
          rawJsonText.toLowerCase().includes("i'm sorry") ||
          rawJsonText.toLowerCase().includes("i cannot") ||
          rawJsonText.toLowerCase().includes("i apologize")
        ) {
          console.error("AI refused to analyze - detected refusal message")

          if (retryCount < maxRetries) {
            console.log("Retrying with adjusted prompt...")
            retryCount++
            continue
          }

          return {
            error:
              "The AI was unable to analyze this conversation. This may be due to:\n" +
              "• Content moderation filters being triggered\n" +
              "• Images not containing readable text messages\n" +
              "• Technical issues with the AI service\n\n" +
              "Please ensure your screenshots contain clear, readable text message conversations and try again.",
          }
        }

        const cleanedJsonText = extractJSON(rawJsonText)

        let parsedResults
        try {
          parsedResults = JSON.parse(cleanedJsonText)
        } catch (parseError) {
          console.error("JSON parse error:", parseError)
          console.error("Cleaned text that failed to parse:", cleanedJsonText.substring(0, 500))

          if (retryCount < maxRetries) {
            console.log("Retrying analysis due to parse error...")
            retryCount++
            continue
          }

          return {
            error:
              "The analysis could not be processed correctly. Please try again with different screenshots or contact support if the issue persists.",
          }
        }

        if (!validateAnalysisResult(parsedResults)) {
          if (retryCount < maxRetries) {
            console.log("Retrying due to invalid structure...")
            retryCount++
            continue
          }

          return {
            error: "The analysis is incomplete. Please try again with clear screenshots of text conversations.",
          }
        }

        console.log("Analysis complete and validated!")

        return {
          ...parsedResults,
          analyzedConversationText: conversationText,
          messageCount: actualMessageCount,
          screenshotCount: files.length,
          extractionConfidence: Math.round(averageConfidence),
          confidenceWarning: confidenceWarning || undefined,
        }
      } catch (error: any) {
        console.error(`Analysis attempt ${retryCount + 1} failed:`, error)

        if (retryCount < maxRetries) {
          retryCount++
          continue
        }

        throw error
      }
    }

    return {
      error: "Analysis failed after multiple attempts. Please try again with different screenshots.",
    }
  } catch (error: any) {
    console.error("Error in analyzeConversation:", error)
    return {
      error: `Analysis failed: ${error.message || "Unknown error"}. Please try again with clear screenshots of text conversations.`,
    }
  }
}

export async function exportToWord(results: any) {
  "use server"
  console.log("Simulating Word export with results")
  await new Promise((resolve) => setTimeout(resolve, 1500))
  return {
    success: true,
    message: "Word document export is currently simulated. Full export coming soon!",
    downloadUrl: "sample-document.docx",
  }
}
