"use server"

import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

interface AnalysisResult {
  overallRelationshipHealth: number
  emotionalConnection: number
  communicationQuality: number
  conflictResolution: number
  communicationPatterns: Array<{
    category: string
    "Subject A": number
    "Subject B": number
  }>
  emotionalIntelligence: Array<{
    category: string
    "Subject A": number
    "Subject B": number
  }>
  strengths: string[]
  areasForGrowth: string[]
  recommendations: string[]
  summary: string
}

async function fileToBase64(file: File): Promise<string> {
  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    return `data:${file.type};base64,${buffer.toString("base64")}`
  } catch (error) {
    console.error("Error converting file to base64:", error)
    throw new Error(`Failed to read file ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

async function extractTextFromImage(file: File): Promise<string> {
  try {
    console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`)

    const base64Image = await fileToBase64(file)

    const { text } = await generateText({
      model: openai("gpt-4o-2024-08-06"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all text from this image of a text conversation. Preserve the structure and indicate who is speaking. Include timestamps if visible.",
            },
            { type: "image", image: base64Image },
          ],
        },
      ],
    })

    console.log(`Successfully extracted text from ${file.name}`)
    return text
  } catch (error) {
    console.error(`Error extracting text from ${file.name}:`, error)
    throw new Error(
      `Error extracting text from ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}

export async function analyzeConversation(formData: FormData): Promise<AnalysisResult> {
  try {
    console.log("Starting conversation analysis...")

    // Extract files from FormData
    const files: File[] = []
    let index = 0
    while (true) {
      const file = formData.get(`file-${index}`) as File | null
      if (!file) break
      files.push(file)
      index++
    }

    if (files.length === 0) {
      throw new Error("No files provided for analysis")
    }

    console.log(`Processing ${files.length} file(s)`)

    // Extract text from all images
    const extractedTexts = await Promise.all(files.map((file) => extractTextFromImage(file)))

    const combinedText = extractedTexts.join("\n\n--- Next Image ---\n\n")
    console.log("Text extraction complete, starting analysis...")

    // Analyze the combined conversation
    const { text: analysisText } = await generateText({
      model: openai("gpt-4o-2024-08-06"),
      system: `You are an expert relationship analyst specializing in emotional intelligence and communication patterns. 
      Analyze text conversations and provide detailed, actionable insights about relationship dynamics.
      Always respond with valid JSON that matches the required structure exactly.`,
      prompt: `Analyze this conversation and provide a comprehensive relationship analysis.

Conversation:
${combinedText}

Provide your analysis in the following JSON format:
{
  "overallRelationshipHealth": <number 0-10>,
  "emotionalConnection": <number 0-10>,
  "communicationQuality": <number 0-10>,
  "conflictResolution": <number 0-10>,
  "communicationPatterns": [
    {"category": "Active Listening", "Subject A": <0-10>, "Subject B": <0-10>},
    {"category": "Empathy Expression", "Subject A": <0-10>, "Subject B": <0-10>},
    {"category": "Assertiveness", "Subject A": <0-10>, "Subject B": <0-10>},
    {"category": "Response Time", "Subject A": <0-10>, "Subject B": <0-10>},
    {"category": "Emotional Support", "Subject A": <0-10>, "Subject B": <0-10>}
  ],
  "emotionalIntelligence": [
    {"category": "Self-Awareness", "Subject A": <0-10>, "Subject B": <0-10>},
    {"category": "Emotional Regulation", "Subject A": <0-10>, "Subject B": <0-10>},
    {"category": "Social Awareness", "Subject A": <0-10>, "Subject B": <0-10>},
    {"category": "Relationship Management", "Subject A": <0-10>, "Subject B": <0-10>}
  ],
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "areasForGrowth": ["<area 1>", "<area 2>", "<area 3>"],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>"],
  "summary": "<detailed summary paragraph>"
}

Respond ONLY with valid JSON, no additional text.`,
    })

    console.log("Analysis complete, parsing results...")

    // Parse the JSON response
    const cleanedText = analysisText
      .trim()
      .replace(/^```json\n?/, "")
      .replace(/\n?```$/, "")
    const analysis: AnalysisResult = JSON.parse(cleanedText)

    console.log("Analysis successfully parsed")
    return analysis
  } catch (error) {
    console.error("Error in analyzeConversation:", error)
    throw new Error(`Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
