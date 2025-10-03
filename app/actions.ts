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

  // Check if API key is available (server-side only)
  if (!process.env.OPENAI_API_KEY) {
    console.error("CRITICAL: No OpenAI API key found in environment variables")
    throw new Error("OpenAI API key not configured. Please check your environment variables.")
  }

  try {
    const base64Image = await fileToBase64(file)

    // Verify the base64 image is valid
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

    // Provide more specific error message
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

export async function analyzeConversation(formData: FormData) {
  try {
    // Verify environment (server-side only)
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

    // Process files one at a time to better handle errors
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

    // If ALL files failed, provide detailed error
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

    // If some failed, log but continue
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

    const analysisPrompt = `You are Love Lens — an expert relationship insight engine.

CONVERSATION TO ANALYZE:
${conversationText}

CONTEXT:
This is a ${conversationLength} conversation sample with approximately ${actualMessageCount} messages.

ANALYSIS INSTRUCTIONS:
Provide a comprehensive, emotionally intelligent analysis of this conversation.

CRITICAL: Return realistic, specific scores (1-10 scale) based on what you observe. Do NOT use placeholders or default to 5s.

Return ONLY a valid JSON object (no markdown, no code blocks):

{
  "introductionNote": "2-3 sentence intro mentioning the ${actualMessageCount} messages analyzed",
  "overallRelationshipHealth": {
    "score": [realistic number 1-10],
    "description": "Brief assessment of overall health"
  },
  "communicationStylesAndEmotionalTone": {
    "description": "Detailed analysis of how each person communicates",
    "emotionalVibeTags": ["3-5 specific emotional descriptors"],
    "regulationPatternsObserved": "How they manage emotions in this exchange",
    "messageRhythmAndPacing": "Observable response patterns",
    "subjectAStyle": "Specific communication style of Subject A",
    "subjectBStyle": "Specific communication style of Subject B"
  },
  "recurringPatternsIdentified": {
    "description": "Observable patterns with examples",
    "loopingMiscommunicationsExamples": ["specific examples or 'Not observed in this sample'"],
    "commonTriggersAndResponsesExamples": ["specific examples or 'Not observed'"],
    "repairAttemptsOrEmotionalAvoidancesExamples": ["specific examples or 'Not observed'"],
    "positivePatterns": ["2-3 positive patterns observed"]
  },
  "reflectiveFrameworks": {
    "description": "Relationship psychology insights",
    "attachmentEnergies": "Observable attachment style indicators",
    "loveLanguageFriction": "Love language patterns observed",
    "gottmanConflictMarkers": "Any Four Horsemen or positive interactions",
    "emotionalIntelligenceIndicators": "Signs of emotional awareness"
  },
  "whatsGettingInTheWay": {
    "description": "Observable obstacles",
    "emotionalMismatches": "Where emotional needs don't align",
    "communicationGaps": "What's left unsaid or unclear",
    "subtlePowerStrugglesOrMisfires": "Dynamic imbalances observed",
    "externalStressors": "Any mentioned external pressures"
  },
  "constructiveFeedback": {
    "subjectA": {
      "strengths": ["3-4 specific strengths"],
      "gentleGrowthNudges": ["3-4 specific, actionable suggestions"],
      "connectionBoosters": ["3-4 specific actions to improve connection"]
    },
    "subjectB": {
      "strengths": ["3-4 specific strengths"],
      "gentleGrowthNudges": ["3-4 specific, actionable suggestions"],
      "connectionBoosters": ["3-4 specific actions to improve connection"]
    },
    "forBoth": {
      "sharedStrengths": ["2-3 shared strengths"],
      "sharedGrowthNudges": ["3-4 suggestions for both"],
      "sharedConnectionBoosters": ["3-4 actions to do together"]
    }
  },
  "visualInsightsData": {
    "descriptionForChartsIntro": "Based on ${actualMessageCount} messages from this conversation",
    "emotionalCommunicationCharacteristics": [
      {"category": "Expresses Vulnerability", "Subject A": [realistic 1-10], "Subject B": [realistic 1-10]},
      {"category": "Active Listening", "Subject A": [realistic 1-10], "Subject B": [realistic 1-10]},
      {"category": "Emotional Awareness", "Subject A": [realistic 1-10], "Subject B": [realistic 1-10]},
      {"category": "Empathy Expression", "Subject A": [realistic 1-10], "Subject B": [realistic 1-10]},
      {"category": "Openness", "Subject A": [realistic 1-10], "Subject B": [realistic 1-10]}
    ],
    "conflictExpressionStyles": [
      {"category": "Uses 'I' Statements", "Subject A": [realistic 1-10], "Subject B": [realistic 1-10]},
      {"category": "Avoids Blame", "Subject A": [realistic 1-10], "Subject B": [realistic 1-10]},
      {"category": "Seeks Resolution", "Subject A": [realistic 1-10], "Subject B": [realistic 1-10]},
      {"category": "Takes Responsibility", "Subject A": [realistic 1-10], "Subject B": [realistic 1-10]},
      {"category": "Manages Emotions", "Subject A": [realistic 1-10], "Subject B": [realistic 1-10]}
    ],
    "validationAndReassurancePatterns": [
      {"category": "Offers Validation", "Subject A": [realistic 1-10], "Subject B": [realistic 1-10]},
      {"category": "Provides Reassurance", "Subject A": [realistic 1-10], "Subject B": [realistic 1-10]},
      {"category": "Acknowledges Feelings", "Subject A": [realistic 1-10], "Subject B": [realistic 1-10]},
      {"category": "Shows Appreciation", "Subject A": [realistic 1-10], "Subject B": [realistic 1-10]},
      {"category": "Offers Support", "Subject A": [realistic 1-10], "Subject B": [realistic 1-10]}
    ],
    "communicationMetrics": {
      "responseTimeBalance": [realistic 1-10],
      "messageLengthBalance": [realistic 1-10],
      "emotionalDepth": [realistic 1-10],
      "conflictResolution": [realistic 1-10],
      "affectionLevel": [realistic 1-10]
    }
  },
  "outlook": "2-3 paragraphs: realistic assessment of relationship trajectory with specific recommendations",
  "optionalAppendix": "Additional observations, patterns, or context that might be helpful",
  "keyTakeaways": ["3-5 most important insights from this analysis"]
}`

    const result = await generateText({
      model: openai("gpt-4o-2024-08-06"),
      messages: [
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
      temperature: 0.4,
      maxTokens: 5000,
    })

    const rawJsonText = result.text

    let parsedResults
    try {
      let cleanedJsonText = rawJsonText.trim()

      if (cleanedJsonText.startsWith("```json")) {
        cleanedJsonText = cleanedJsonText.substring(7)
      }
      if (cleanedJsonText.startsWith("```")) {
        cleanedJsonText = cleanedJsonText.substring(3)
      }
      if (cleanedJsonText.endsWith("```")) {
        cleanedJsonText = cleanedJsonText.substring(0, cleanedJsonText.length - 3)
      }

      cleanedJsonText = cleanedJsonText.trim()

      parsedResults = JSON.parse(cleanedJsonText)
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", e)
      console.error("Raw AI response:", rawJsonText.substring(0, 500))
      return {
        error:
          "The AI analysis could not be processed correctly. Please try again. If the problem persists, try uploading different screenshots.",
      }
    }

    if (
      !parsedResults.communicationStylesAndEmotionalTone ||
      !parsedResults.visualInsightsData ||
      !parsedResults.constructiveFeedback
    ) {
      console.error("Parsed AI response is missing required fields")
      return {
        error: "The analysis is incomplete. Please try again.",
      }
    }

    console.log("Analysis complete!")

    return {
      ...parsedResults,
      analyzedConversationText: conversationText,
      messageCount: actualMessageCount,
      screenshotCount: files.length,
      extractionConfidence: Math.round(averageConfidence),
      confidenceWarning: confidenceWarning || undefined,
    }
  } catch (error: any) {
    console.error("Error in analyzeConversation:", error)
    return {
      error: `Analysis failed: ${error.message || "Unknown error"}. Please try again with clear screenshots.`,
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
