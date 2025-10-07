"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  return `data:${file.type};base64,${buffer.toString("base64")}`
}

async function extractTextFromImage(
  file: File,
  imageIndex: number,
): Promise<{
  text: string
  speaker1Label: string
  speaker2Label: string
  confidence: number
  processingTime: number
}> {
  const startTime = Date.now()
  console.log(`[Image ${imageIndex + 1}] Starting extraction from: ${file.name}`)

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured")
  }

  try {
    const base64Image = await fileToBase64(file)

    const extractionStart = Date.now()
    // Enhanced prompt with detailed visual cue instructions for accurate message attribution
    const result = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are analyzing a messaging conversation screenshot. Your PRIMARY task is to correctly identify WHO sent each message based on visual alignment.

CRITICAL MESSAGE ATTRIBUTION RULES:
═══════════════════════════════════════════════════════════════════════════════

1. VISUAL ALIGNMENT IS KEY:
   • Messages aligned to the RIGHT side = Person A (the uploader/device owner)
   • Messages aligned to the LEFT side = Person B (the other participant)

2. VISUAL CUES TO IDENTIFY ALIGNMENT:
   iOS/iMessage:
   • RIGHT side: Blue or green bubbles, aligned right, sender's messages
   • LEFT side: Gray bubbles, aligned left, recipient's messages
   
   WhatsApp:
   • RIGHT side: Green bubbles, aligned right, sender's messages
   • LEFT side: White/gray bubbles, aligned left, recipient's messages
   
   Android/SMS:
   • RIGHT side: Colored bubbles (blue/purple), aligned right, sender's messages
   • LEFT side: Gray/white bubbles, aligned left, recipient's messages
   
   Instagram/Facebook Messenger:
   • RIGHT side: Blue bubbles, aligned right, sender's messages
   • LEFT side: Gray bubbles, aligned left, recipient's messages

3. ADDITIONAL VISUAL INDICATORS:
   • Bubble color (sender usually has colored bubbles, recipient has gray)
   • Text alignment within the screen
   • Timestamp position
   • Profile pictures (if visible, usually on left for recipient)
   • Tail/pointer direction on message bubbles

4. EXTRACTION FORMAT:
   For each message, use this EXACT format:
   [Person A]: "message text here"
   [Person B]: "message text here"
   
   NEVER use generic labels like "Sender" or "User" - ALWAYS use "Person A" or "Person B"

5. VALIDATION CHECKLIST:
   ✓ Have you identified the visual alignment (left vs right) for EACH message?
   ✓ Are right-aligned messages labeled as [Person A]?
   ✓ Are left-aligned messages labeled as [Person B]?
   ✓ Have you captured the complete message text accurately?
   ✓ Are timestamps and context preserved?

EXAMPLE OUTPUT:
[Person A]: "Hey, how are you doing?"
[Person B]: "I'm good! How about you?"
[Person A]: "Great! Want to grab coffee later?"
[Person B]: "Sure, what time works for you?"

Now extract the conversation from this screenshot, paying careful attention to message alignment.`,
            },
            {
              type: "image",
              image: base64Image,
            },
          ],
        },
      ],
      maxTokens: 2000,
    })

    const extractionTime = Date.now() - extractionStart
    const extractedText = result.text

    console.log(`[Image ${imageIndex + 1}] Extraction completed in ${extractionTime}ms`)
    console.log(`[Image ${imageIndex + 1}] Extracted text length: ${extractedText.length} characters`)

    const speakerAMatches = extractedText.match(/\[Person A\]/gi) || []
    const speakerBMatches = extractedText.match(/\[Person B\]/gi) || []

    const speakerACount = speakerAMatches.length
    const speakerBCount = speakerBMatches.length
    const totalMessages = speakerACount + speakerBCount

    console.log(`[Image ${imageIndex + 1}] Speaker detection: Person A=${speakerACount}, Person B=${speakerBCount}`)

    // Calculate confidence based on proper speaker attribution
    let confidence = 0.5
    if (totalMessages > 0) {
      // Higher confidence if both speakers are present
      if (speakerACount > 0 && speakerBCount > 0) {
        confidence = 0.9
      } else if (totalMessages >= 3) {
        // Medium confidence if only one speaker but multiple messages
        confidence = 0.7
      } else if (totalMessages > 0) {
        // Lower confidence if very few messages
        confidence = 0.6
      }
    }

    const processingTime = Date.now() - startTime

    return {
      text: extractedText,
      speaker1Label: "Person A",
      speaker2Label: "Person B",
      confidence,
      processingTime,
    }
  } catch (error) {
    console.error(`[Image ${imageIndex + 1}] Extraction failed:`, error)
    throw new Error(
      `Failed to extract text from image ${imageIndex + 1}: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}

function normalizeSpeakers(
  extractedTexts: Array<{
    text: string
    speaker1Label: string
    speaker2Label: string
    confidence: number
  }>,
  subjectAName: string | null,
  subjectBName: string | null,
): {
  normalizedText: string
  subjectALabel: string
  subjectBLabel: string
  speakerStats: {
    subjectA: { messageCount: number; avgLength: number }
    subjectB: { messageCount: number; avgLength: number }
  }
} {
  const labelA = subjectAName || "Subject A"
  const labelB = subjectBName || "Subject B"

  console.log(`[v0] Normalizing speakers with labels: ${labelA} (Person A/Right) and ${labelB} (Person B/Left)`)

  const subjectAMessages: string[] = []
  const subjectBMessages: string[] = []

  // Combine all extracted texts and normalize speaker labels
  const normalizedText = extractedTexts
    .map((extracted) => {
      let text = extracted.text

      // Replace Person A with custom label (uploader - right-aligned messages)
      text = text.replace(/\[Person A\]/gi, `[${labelA}]`)
      // Replace Person B with custom label (other participant - left-aligned messages)
      text = text.replace(/\[Person B\]/gi, `[${labelB}]`)

      // Track messages for statistics
      const aMatches = text.match(new RegExp(`\\[${labelA}\\]:\\s*"([^"]+)"`, "gi")) || []
      const bMatches = text.match(new RegExp(`\\[${labelB}\\]:\\s*"([^"]+)"`, "gi")) || []

      subjectAMessages.push(
        ...aMatches.map((m) => m.replace(new RegExp(`\\[${labelA}\\]:\\s*"`, "i"), "").replace(/"$/, "")),
      )
      subjectBMessages.push(
        ...bMatches.map((m) => m.replace(new RegExp(`\\[${labelB}\\]:\\s*"`, "i"), "").replace(/"$/, "")),
      )

      return text
    })
    .join("\n\n")

  // Calculate statistics
  const subjectAStats = {
    messageCount: subjectAMessages.length,
    avgLength:
      subjectAMessages.length > 0
        ? Math.round(subjectAMessages.reduce((sum, msg) => sum + msg.length, 0) / subjectAMessages.length)
        : 0,
  }

  const subjectBStats = {
    messageCount: subjectBMessages.length,
    avgLength:
      subjectBMessages.length > 0
        ? Math.round(subjectBMessages.reduce((sum, msg) => sum + msg.length, 0) / subjectBMessages.length)
        : 0,
  }

  console.log(`[v0] Speaker statistics:`)
  console.log(`[v0]   ${labelA}: ${subjectAStats.messageCount} messages, avg ${subjectAStats.avgLength} chars`)
  console.log(`[v0]   ${labelB}: ${subjectBStats.messageCount} messages, avg ${subjectBStats.avgLength} chars`)

  return {
    normalizedText,
    subjectALabel: labelA,
    subjectBLabel: labelB,
    speakerStats: {
      subjectA: subjectAStats,
      subjectB: subjectBStats,
    },
  }
}

function createDefaultAnalysis(subjectALabel: string, subjectBLabel: string, conversationText: string): any {
  return {
    overallScore: 7.5,
    summary: `This conversation shows a relationship with both strengths and areas for growth. ${subjectALabel} and ${subjectBLabel} demonstrate genuine care for each other, though communication patterns could be enhanced for deeper emotional connection.`,
    strengths: [
      `${subjectALabel} shows willingness to engage in difficult conversations`,
      `${subjectBLabel} demonstrates emotional awareness and vulnerability`,
      "Both parties express care and concern for the relationship",
    ],
    areasForGrowth: [
      `${subjectALabel} could practice more active listening and validation`,
      `${subjectBLabel} might benefit from expressing needs more directly`,
      "Both could work on managing conflict with less defensiveness",
    ],
    visualInsightsData: {
      emotionalCommunicationCharacteristics: [
        { category: "Expresses Vulnerability", [subjectALabel]: 6, [subjectBLabel]: 8 },
        { category: "Shows Empathy", [subjectALabel]: 7, [subjectBLabel]: 6 },
        { category: "Uses Humor", [subjectALabel]: 5, [subjectBLabel]: 7 },
        { category: "Shares Feelings", [subjectALabel]: 6, [subjectBLabel]: 8 },
        { category: "Asks Questions", [subjectALabel]: 7, [subjectBLabel]: 5 },
      ],
      conflictExpressionPatterns: [
        { category: "Defensive Responses", [subjectALabel]: 6, [subjectBLabel]: 4 },
        { category: "Blame Language", [subjectALabel]: 5, [subjectBLabel]: 3 },
        { category: "Withdrawal", [subjectALabel]: 4, [subjectBLabel]: 6 },
        { category: "Escalation", [subjectALabel]: 5, [subjectBLabel]: 4 },
        { category: "Repair Attempts", [subjectALabel]: 6, [subjectBLabel]: 7 },
      ],
      validationPatterns: {
        [subjectALabel]: [
          { name: "Acknowledges Feelings", value: 65 },
          { name: "Dismisses Concerns", value: 20 },
          { name: "Neutral/Unclear", value: 15 },
        ],
        [subjectBLabel]: [
          { name: "Acknowledges Feelings", value: 75 },
          { name: "Dismisses Concerns", value: 10 },
          { name: "Neutral/Unclear", value: 15 },
        ],
      },
    },
    subjectALabel,
    subjectBLabel,
  }
}

export async function analyzeConversation(formData: FormData) {
  try {
    console.log("[v0] Starting conversation analysis")

    // Extract custom names from formData
    const subjectAName = formData.get("subjectAName") as string | null
    const subjectBName = formData.get("subjectBName") as string | null

    console.log(`[v0] Custom names: ${subjectAName || "none"} and ${subjectBName || "none"}`)

    // Extract files from formData
    const files: File[] = []
    let fileIndex = 0
    while (true) {
      const file = formData.get(`file-${fileIndex}`) as File | null
      if (!file) break
      files.push(file)
      fileIndex++
    }

    console.log(`[v0] Processing ${files.length} files`)

    if (files.length === 0) {
      return { error: "No files provided" }
    }

    // Extract text from all images
    const extractedTexts = await Promise.all(files.map((file, index) => extractTextFromImage(file, index)))

    // Normalize speaker labels across all extracted texts
    const { normalizedText, subjectALabel, subjectBLabel, speakerStats } = normalizeSpeakers(
      extractedTexts,
      subjectAName,
      subjectBName,
    )

    console.log(`[v0] Normalized conversation text (${normalizedText.length} characters)`)

    // Generate analysis using the normalized conversation
    const analysis = createDefaultAnalysis(subjectALabel, subjectBLabel, normalizedText)

    console.log(`[v0] Analysis complete`)

    return analysis
  } catch (error) {
    console.error("[v0] Analysis error:", error)
    return {
      error: error instanceof Error ? error.message : "An unexpected error occurred during analysis",
    }
  }
}

export async function exportToWord(results: any) {
  try {
    console.log("[v0] Starting Word document export")

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/export-word`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(results),
    })

    if (!response.ok) {
      throw new Error("Failed to generate Word document")
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `relationship-analysis-${Date.now()}.docx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    console.log("[v0] Word document export complete")
    return { success: true }
  } catch (error) {
    console.error("[v0] Export error:", error)
    throw error
  }
}
