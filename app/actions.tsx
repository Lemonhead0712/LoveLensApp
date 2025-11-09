"use server"

import { generateText } from "ai"
import { put } from "@vercel/blob"
import type { AnalysisResults } from "@/types/analysis"

// Helper function to extract text from images using AI
async function extractTextFromImage(imageUrl: string): Promise<string> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

    const { text } = await generateText({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all text from this conversation screenshot. Preserve the order and format. Include sender names if visible. Return only the extracted text, no commentary.",
            },
            {
              type: "image",
              image: imageUrl,
            },
          ],
        },
      ],
      abortSignal: controller.signal,
    })

    clearTimeout(timeoutId)
    return text || ""
  } catch (error: any) {
    console.error("[v0] Error extracting text from image:", error)
    if (error.name === "AbortError") {
      throw new Error("Image extraction timed out")
    }
    throw new Error(`Failed to extract text: ${error.message}`)
  }
}

// Main analysis function
export async function analyzeConversation(formData: FormData) {
  try {
    console.log("[v0] Starting conversation analysis")

    // Extract files from FormData
    const files: File[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("file-") && value instanceof File) {
        files.push(value)
      }
    }

    if (files.length === 0) {
      return { error: "No files provided" }
    }

    console.log("[v0] Processing", files.length, "files")

    // Upload images to Blob storage and extract text
    const imageUrls: string[] = []
    const extractedTexts: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      console.log(`[v0] Uploading image ${i + 1}/${files.length}`)

      try {
        // Upload to Vercel Blob
        const blob = await put(file.name, file, {
          access: "public",
        })

        imageUrls.push(blob.url)

        // Extract text from image
        console.log(`[v0] Extracting text from image ${i + 1}`)
        const text = await extractTextFromImage(blob.url)
        extractedTexts.push(text)
      } catch (error: any) {
        console.error(`[v0] Error processing image ${i + 1}:`, error)
        // Continue with other images even if one fails
        extractedTexts.push(`[Error extracting text from image ${i + 1}]`)
      }
    }

    const combinedText = extractedTexts.join("\n\n---\n\n")
    console.log("[v0] Combined text length:", combinedText.length)

    if (!combinedText.trim()) {
      return { error: "No text could be extracted from the images" }
    }

    // Analyze the conversation with AI
    console.log("[v0] Starting AI analysis")

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60s timeout

    try {
      const { text: analysisText } = await generateText({
        model: "openai/gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert relationship analyst. Analyze the conversation and provide a comprehensive analysis in JSON format.

The JSON must include:
- subjectALabel: string (name of person A)
- subjectBLabel: string (name of person B)
- overallScore: number (0-100)
- summary: string
- openingThoughts: string
- communicationPatterns: object with personA, personB, and dynamicBetweenThem
- emotionalDynamics: object with positiveIndicators, concerningPatterns, emotionalBalance, emotionalHighlights
- deeperInsights: array of insights
- strengthsToGelebrate: array of strengths
- growthOpportunities: array of opportunities
- recommendations: array of recommendations
- conversationMetrics: object with totalMessages, messageBalance, emotionalTone, engagementLevel, conversationFlow
- closingThoughts: string
- messageCount: number
- screenshotCount: number
- extractionConfidence: number (0-100)

Return ONLY valid JSON, no markdown formatting.`,
          },
          {
            role: "user",
            content: `Analyze this conversation:\n\n${combinedText}`,
          },
        ],
        abortSignal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("[v0] AI analysis complete, parsing JSON")

      // Parse and validate JSON
      let results: AnalysisResults
      try {
        // Remove markdown code blocks if present
        const cleanedText = analysisText
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim()
        results = JSON.parse(cleanedText)
      } catch (parseError) {
        console.error("[v0] JSON parse error:", parseError)
        console.error("[v0] Raw response:", analysisText.substring(0, 500))

        // Return a fallback analysis
        return {
          error: "Analysis completed but response format was invalid",
          subjectALabel: "Person A",
          subjectBLabel: "Person B",
          overallScore: 50,
          summary: "Unable to complete full analysis due to formatting issues.",
          openingThoughts: "The analysis encountered technical difficulties.",
          communicationPatterns: {
            personA: {
              style: "Unable to analyze",
              strengths: [],
              areasForGrowth: [],
              notableQuotes: [],
              communicationTendencies: "Analysis incomplete",
            },
            personB: {
              style: "Unable to analyze",
              strengths: [],
              areasForGrowth: [],
              notableQuotes: [],
              communicationTendencies: "Analysis incomplete",
            },
            dynamicBetweenThem: "Analysis incomplete",
          },
          emotionalDynamics: {
            positiveIndicators: [],
            concerningPatterns: [],
            emotionalBalance: "Unable to determine",
            emotionalHighlights: [],
          },
          deeperInsights: [],
          strengthsToGelebrate: [],
          growthOpportunities: [],
          recommendations: [],
          conversationMetrics: {
            totalMessages: 0,
            messageBalance: { personA: 50, personB: 50 },
            emotionalTone: "Unable to determine",
            engagementLevel: "Unable to determine",
            conversationFlow: "Unable to determine",
          },
          closingThoughts: "Please try again or contact support if the issue persists.",
          messageCount: 0,
          screenshotCount: files.length,
          extractionConfidence: 0,
        }
      }

      // Add metadata
      results.messageCount = results.messageCount || 0
      results.screenshotCount = files.length
      results.extractionConfidence = results.extractionConfidence || 85

      console.log("[v0] Analysis successful")
      return results
    } catch (error: any) {
      clearTimeout(timeoutId)
      console.error("[v0] AI analysis error:", error)

      if (error.name === "AbortError") {
        return { error: "Analysis timed out. Please try with fewer images." }
      }

      throw error
    }
  } catch (error: any) {
    console.error("[v0] Analysis error:", error)
    return {
      error: error.message || "An unexpected error occurred during analysis",
    }
  }
}

// Export to Word function
export async function exportToWord(results: AnalysisResults) {
  try {
    console.log("[v0] Starting Word export")

    // Create a simple HTML document that can be opened in Word
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Love Lens Analysis Report</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #9333ea; border-bottom: 3px solid #ec4899; padding-bottom: 10px; }
    h2 { color: #7c3aed; margin-top: 30px; }
    h3 { color: #a855f7; margin-top: 20px; }
    .score { font-size: 24px; font-weight: bold; color: #9333ea; }
    .section { margin: 20px 0; padding: 15px; background: #f9fafb; border-left: 4px solid #9333ea; }
    .strength { background: #d1fae5; border-left-color: #10b981; }
    .growth { background: #fef3c7; border-left-color: #f59e0b; }
    ul { margin: 10px 0; }
    li { margin: 5px 0; }
  </style>
</head>
<body>
  <h1>Love Lens Relationship Analysis</h1>
  <p><strong>${results.subjectALabel} & ${results.subjectBLabel}</strong></p>
  <p class="score">Overall Score: ${results.overallScore}/100</p>
  
  <div class="section">
    <h2>Summary</h2>
    <p>${results.summary}</p>
  </div>

  <div class="section">
    <h2>Opening Thoughts</h2>
    <p>${results.openingThoughts}</p>
  </div>

  <div class="section">
    <h2>Communication Patterns</h2>
    
    <h3>${results.subjectALabel}</h3>
    <p>${results.communicationPatterns.personA.style}</p>
    <p><strong>Strengths:</strong></p>
    <ul>
      ${results.communicationPatterns.personA.strengths.map((s) => `<li>${s}</li>`).join("")}
    </ul>
    <p><strong>Areas for Growth:</strong></p>
    <ul>
      ${results.communicationPatterns.personA.areasForGrowth.map((a) => `<li>${a}</li>`).join("")}
    </ul>

    <h3>${results.subjectBLabel}</h3>
    <p>${results.communicationPatterns.personB.style}</p>
    <p><strong>Strengths:</strong></p>
    <ul>
      ${results.communicationPatterns.personB.strengths.map((s) => `<li>${s}</li>`).join("")}
    </ul>
    <p><strong>Areas for Growth:</strong></p>
    <ul>
      ${results.communicationPatterns.personB.areasForGrowth.map((a) => `<li>${a}</li>`).join("")}
    </ul>

    <h3>The Dynamic Between You</h3>
    <p>${results.communicationPatterns.dynamicBetweenThem}</p>
  </div>

  <div class="section">
    <h2>Emotional Dynamics</h2>
    <p><strong>Positive Indicators:</strong></p>
    <ul>
      ${results.emotionalDynamics.positiveIndicators.map((i) => `<li>${i}</li>`).join("")}
    </ul>
    <p><strong>Areas to Watch:</strong></p>
    <ul>
      ${results.emotionalDynamics.concerningPatterns.map((p) => `<li>${p}</li>`).join("")}
    </ul>
    <p><strong>Emotional Balance:</strong> ${results.emotionalDynamics.emotionalBalance}</p>
  </div>

  ${
    results.strengthsToGelebrate.length > 0
      ? `
  <div class="section strength">
    <h2>Strengths to Celebrate</h2>
    ${results.strengthsToGelebrate
      .map(
        (s) => `
      <h3>${s.strength}</h3>
      <p>${s.whyItMatters}</p>
      ${s.examples.length > 0 ? `<ul>${s.examples.map((e) => `<li>${e}</li>`).join("")}</ul>` : ""}
    `,
      )
      .join("")}
  </div>
  `
      : ""
  }

  ${
    results.growthOpportunities.length > 0
      ? `
  <div class="section growth">
    <h2>Growth Opportunities</h2>
    ${results.growthOpportunities
      .map(
        (o) => `
      <h3>${o.area} (${o.priority} priority)</h3>
      <p><strong>Current Pattern:</strong> ${o.currentPattern}</p>
      <p><strong>Why It Matters:</strong> ${o.whyItMatters}</p>
      <p><strong>Suggestions:</strong></p>
      <ul>${o.suggestions.map((s) => `<li>${s}</li>`).join("")}</ul>
    `,
      )
      .join("")}
  </div>
  `
      : ""
  }

  ${
    results.recommendations.length > 0
      ? `
  <div class="section">
    <h2>Recommendations</h2>
    ${results.recommendations
      .map(
        (r) => `
      <h3>${r.title} (${r.priority} priority)</h3>
      <p>${r.description}</p>
      <p><strong>Expected Outcome:</strong> ${r.expectedOutcome}</p>
    `,
      )
      .join("")}
  </div>
  `
      : ""
  }

  <div class="section">
    <h2>Closing Thoughts</h2>
    <p>${results.closingThoughts}</p>
  </div>

  <div class="section">
    <h2>Conversation Metrics</h2>
    <p><strong>Total Messages:</strong> ${results.conversationMetrics.totalMessages}</p>
    <p><strong>Message Balance:</strong> ${results.subjectALabel} ${results.conversationMetrics.messageBalance.personA}% | ${results.subjectBLabel} ${results.conversationMetrics.messageBalance.personB}%</p>
    <p><strong>Emotional Tone:</strong> ${results.conversationMetrics.emotionalTone}</p>
    <p><strong>Engagement Level:</strong> ${results.conversationMetrics.engagementLevel}</p>
    <p><strong>Conversation Flow:</strong> ${results.conversationMetrics.conversationFlow}</p>
  </div>

  <hr>
  <p style="text-align: center; color: #6b7280; font-size: 12px;">
    Generated by Love Lens | ${new Date().toLocaleDateString()}
  </p>
</body>
</html>
    `

    // Create a Blob and trigger download
    const blob = new Blob([html], { type: "application/msword" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `love-lens-analysis-${Date.now()}.doc`
    link.click()
    URL.revokeObjectURL(url)

    console.log("[v0] Word export complete")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Export error:", error)
    throw new Error(`Failed to export: ${error.message}`)
  }
}
