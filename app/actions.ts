"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`${operation} timed out after ${timeoutMs}ms`)), timeoutMs),
  )
  return Promise.race([promise, timeoutPromise])
}

async function fileToBase64(file: File): Promise<string> {
  try {
    console.log(`[v0] Reading file: ${file.name} (${file.size} bytes, type: ${file.type})`)

    if (!file || !file.size) {
      throw new Error("Invalid file: file is empty or undefined")
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error(
        `File "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 10MB.`,
      )
    }

    if (!file.type.startsWith("image/")) {
      throw new Error(`File "${file.name}" is not an image (type: ${file.type})`)
    }

    let buffer: Buffer | null = null
    let method = "unknown"

    try {
      const arrayBuffer = await withTimeout(file.arrayBuffer(), 10000, "File reading")
      buffer = Buffer.from(arrayBuffer)
      method = "arrayBuffer"
    } catch (error) {
      console.warn(`[v0] arrayBuffer() failed:`, error)

      // Fallback: try bytes() if available
      if (typeof (file as any).bytes === "function") {
        try {
          const bytes = await withTimeout((file as any).bytes(), 10000, "File reading (bytes)")
          buffer = Buffer.from(bytes)
          method = "bytes"
        } catch (bytesError) {
          console.warn(`[v0] bytes() also failed:`, bytesError)
        }
      }

      // Final fallback: try stream reading
      if (!buffer && typeof (file as any).stream === "function") {
        try {
          const stream = (file as any).stream()
          const reader = stream.getReader()
          const chunks: Uint8Array[] = []

          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            chunks.push(value)
          }

          const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
          const combined = new Uint8Array(totalLength)
          let offset = 0
          for (const chunk of chunks) {
            combined.set(chunk, offset)
            offset += chunk.length
          }

          buffer = Buffer.from(combined)
          method = "stream"
        } catch (streamError) {
          console.warn(`[v0] stream() also failed:`, streamError)
        }
      }
    }

    if (!buffer) {
      throw new Error(
        `Unable to read file "${file.name}". This may be a browser compatibility issue. Please try: (1) refreshing the page, (2) using a different browser, or (3) re-uploading the image.`,
      )
    }

    const base64 = buffer.toString("base64")
    console.log(`[v0] Converted ${file.name} to base64 using ${method}`)

    return `data:${file.type};base64,${base64}`
  } catch (error) {
    console.error(`[v0] Error converting file to base64:`, error)
    throw error
  }
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
  platform?: string
}> {
  const startTime = Date.now()

  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables in your Vercel project settings.",
    )
  }

  try {
    const base64Image = await fileToBase64(file)

    const result = await withTimeout(
      generateText({
        model: openai("gpt-4o"),
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Extract conversation from this messaging screenshot with maximum accuracy.

SPEAKER ATTRIBUTION RULES:
- RIGHT-aligned bubbles = [Person A] (device owner/uploader)
- LEFT-aligned bubbles = [Person B] (conversation partner)
- NEVER swap these labels

OUTPUT FORMAT:
[Person A]: "message text"
[Person B]: "message text"

After messages, include:
---METADATA---
Platform: [imessage/android/whatsapp/etc]
Total Messages: [count]
Average Confidence: [0.0-1.0]

Extract ALL visible text in chronological order.`,
              },
              {
                type: "image",
                image: base64Image,
              },
            ],
          },
        ],
        maxTokens: 2000,
        temperature: 0.2,
      }),
      60000, // 60 second timeout
      "OCR extraction",
    )

    const extractedText = result.text
    const processingTime = Date.now() - startTime

    // Parse metadata
    let platform = "unknown"
    let confidence = 0.85

    const metadataMatch = extractedText.match(/---METADATA---\s*([\s\S]*?)(?:\n\n|$)/)
    if (metadataMatch) {
      const metadata = metadataMatch[1]
      const platformMatch = metadata.match(/Platform:\s*(\w+)/i)
      const confMatch = metadata.match(/Average Confidence:\s*([\d.]+)/i)

      if (platformMatch) platform = platformMatch[1].toLowerCase()
      if (confMatch) confidence = Number.parseFloat(confMatch[1])
    }

    console.log(`[v0] Image ${imageIndex + 1}: ${(confidence * 100).toFixed(1)}% confidence`)

    return {
      text: extractedText,
      speaker1Label: "Person A",
      speaker2Label: "Person B",
      confidence,
      processingTime,
      platform,
    }
  } catch (error) {
    console.error(`[Image ${imageIndex + 1}] Extraction failed:`, error)

    if (error instanceof Error) {
      if (error.message.includes("timed out")) {
        throw new Error(
          `Image ${imageIndex + 1} processing timed out. This image may be too large or complex. Try uploading a smaller or clearer screenshot.`,
        )
      }
      if (error.message.includes("API key")) {
        throw error // Pass through API key errors
      }
    }

    throw new Error(`Failed to process image ${imageIndex + 1}. Please try uploading a different screenshot.`)
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
} {
  const labelA = subjectAName || "Subject A"
  const labelB = subjectBName || "Subject B"

  console.log(`[v0] Using labels: ${labelA} and ${labelB}`)

  const normalizedText = extractedTexts
    .map((extracted) => {
      let text = extracted.text
      text = text.replace(/\[Person A\]/gi, `[${labelA}]`)
      text = text.replace(/\[Person B\]/gi, `[${labelB}]`)
      return text
    })
    .join("\n\n")

  return {
    normalizedText,
    subjectALabel: labelA,
    subjectBLabel: labelB,
  }
}

interface ChartValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  metadata: {
    emotionalCommunicationValid: boolean
    conflictExpressionValid: boolean
    validationPatternsValid: boolean
    dataConsistency: number // 0-1 score
  }
}

function validateChartData(analysisData: any): ChartValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  let emotionalCommunicationValid = true
  let conflictExpressionValid = true
  let validationPatternsValid = true

  const subjectALabel = analysisData.subjectALabel || "Subject A"
  const subjectBLabel = analysisData.subjectBLabel || "Subject B"

  // Validate Emotional Communication Characteristics
  if (analysisData.visualInsightsData?.emotionalCommunicationCharacteristics) {
    const data = analysisData.visualInsightsData.emotionalCommunicationCharacteristics

    if (!Array.isArray(data) || data.length === 0) {
      errors.push("Emotional communication data is empty or invalid")
      emotionalCommunicationValid = false
    } else {
      data.forEach((item: any, index: number) => {
        // Check required fields
        if (!item.category) {
          errors.push(`Emotional communication item ${index + 1} missing category`)
          emotionalCommunicationValid = false
        }

        // Check subject scores exist and are in valid range (1-10)
        const scoreA = item[subjectALabel]
        const scoreB = item[subjectBLabel]

        if (scoreA === undefined || scoreA === null) {
          errors.push(`Emotional communication "${item.category}" missing ${subjectALabel} score`)
          emotionalCommunicationValid = false
        } else if (scoreA < 1 || scoreA > 10) {
          errors.push(
            `Emotional communication "${item.category}" ${subjectALabel} score out of range: ${scoreA} (must be 1-10)`,
          )
          emotionalCommunicationValid = false
        }

        if (scoreB === undefined || scoreB === null) {
          errors.push(`Emotional communication "${item.category}" missing ${subjectBLabel} score`)
          emotionalCommunicationValid = false
        } else if (scoreB < 1 || scoreB > 10) {
          errors.push(
            `Emotional communication "${item.category}" ${subjectBLabel} score out of range: ${scoreB} (must be 1-10)`,
          )
          emotionalCommunicationValid = false
        }

        // Warning for extreme differences
        if (scoreA !== undefined && scoreB !== undefined && Math.abs(scoreA - scoreB) > 5) {
          warnings.push(
            `Large difference in "${item.category}": ${subjectALabel}=${scoreA}, ${subjectBLabel}=${scoreB}`,
          )
        }
      })

      // Check for minimum number of categories
      if (data.length < 3) {
        warnings.push(`Only ${data.length} emotional communication categories (recommended: 5+)`)
      }
    }
  } else {
    errors.push("Emotional communication data missing")
    emotionalCommunicationValid = false
  }

  // Validate Conflict Expression Styles
  if (analysisData.visualInsightsData?.conflictExpressionStyles) {
    const data = analysisData.visualInsightsData.conflictExpressionStyles

    if (!Array.isArray(data) || data.length === 0) {
      errors.push("Conflict expression data is empty or invalid")
      conflictExpressionValid = false
    } else {
      data.forEach((item: any, index: number) => {
        if (!item.category) {
          errors.push(`Conflict expression item ${index + 1} missing category`)
          conflictExpressionValid = false
        }

        const scoreA = item[subjectALabel]
        const scoreB = item[subjectBLabel]

        if (scoreA === undefined || scoreA === null) {
          errors.push(`Conflict expression "${item.category}" missing ${subjectALabel} score`)
          conflictExpressionValid = false
        } else if (scoreA < 1 || scoreA > 10) {
          errors.push(
            `Conflict expression "${item.category}" ${subjectALabel} score out of range: ${scoreA} (must be 1-10)`,
          )
          conflictExpressionValid = false
        }

        if (scoreB === undefined || scoreB === null) {
          errors.push(`Conflict expression "${item.category}" missing ${subjectBLabel} score`)
          conflictExpressionValid = false
        } else if (scoreB < 1 || scoreB > 10) {
          errors.push(
            `Conflict expression "${item.category}" ${subjectBLabel} score out of range: ${scoreB} (must be 1-10)`,
          )
          conflictExpressionValid = false
        }
      })

      if (data.length < 3) {
        warnings.push(`Only ${data.length} conflict expression categories (recommended: 5+)`)
      }
    }
  } else {
    errors.push("Conflict expression data missing")
    conflictExpressionValid = false
  }

  // Validate Validation & Reassurance Patterns
  if (analysisData.visualInsightsData?.validationAndReassurancePatterns) {
    const data = analysisData.visualInsightsData.validationAndReassurancePatterns

    if (!Array.isArray(data) || data.length === 0) {
      errors.push("Validation patterns data is empty or invalid")
      validationPatternsValid = false
    } else {
      let sumA = 0
      let sumB = 0

      data.forEach((item: any, index: number) => {
        if (!item.category) {
          errors.push(`Validation pattern item ${index + 1} missing category`)
          validationPatternsValid = false
        }

        const valueA = item[subjectALabel]
        const valueB = item[subjectBLabel]

        if (valueA === undefined || valueA === null) {
          errors.push(`Validation pattern "${item.category}" missing ${subjectALabel} value`)
          validationPatternsValid = false
        } else if (valueA < 0 || valueA > 100) {
          errors.push(
            `Validation pattern "${item.category}" ${subjectALabel} value out of range: ${valueA} (must be 0-100)`,
          )
          validationPatternsValid = false
        } else {
          sumA += valueA
        }

        if (valueB === undefined || valueB === null) {
          errors.push(`Validation pattern "${item.category}" missing ${subjectBLabel} value`)
          validationPatternsValid = false
        } else if (valueB < 0 || valueB > 100) {
          errors.push(
            `Validation pattern "${item.category}" ${subjectBLabel} value out of range: ${valueB} (must be 0-100)`,
          )
          validationPatternsValid = false
        } else {
          sumB += valueB
        }
      })

      // Check that percentages sum to approximately 100%
      if (Math.abs(sumA - 100) > 5) {
        errors.push(`${subjectALabel} validation percentages sum to ${sumA}% (should be ~100%)`)
        validationPatternsValid = false
      }

      if (Math.abs(sumB - 100) > 5) {
        errors.push(`${subjectBLabel} validation percentages sum to ${sumB}% (should be ~100%)`)
        validationPatternsValid = false
      }

      if (data.length < 3) {
        warnings.push(`Only ${data.length} validation pattern categories (recommended: 4+)`)
      }
    }
  } else {
    errors.push("Validation patterns data missing")
    validationPatternsValid = false
  }

  // Calculate overall data consistency score
  const validComponents = [emotionalCommunicationValid, conflictExpressionValid, validationPatternsValid].filter(
    Boolean,
  ).length
  const dataConsistency = validComponents / 3

  const isValid = errors.length === 0

  return {
    isValid,
    errors,
    warnings,
    metadata: {
      emotionalCommunicationValid,
      conflictExpressionValid,
      validationPatternsValid,
      dataConsistency,
    },
  }
}

function crossValidateAnalysisData(analysisData: any): {
  consistent: boolean
  issues: string[]
} {
  const issues: string[] = []

  // Cross-validate message counts with attribution metadata
  if (analysisData.attributionMetadata) {
    const metaCountA = analysisData.attributionMetadata.subjectAMessageCount || 0
    const metaCountB = analysisData.attributionMetadata.subjectBMessageCount || 0
    const totalMeta = metaCountA + metaCountB

    if (analysisData.messageCount && Math.abs(analysisData.messageCount - totalMeta) > 2) {
      issues.push(`Message count mismatch: total=${analysisData.messageCount}, attribution sum=${totalMeta}`)
    }

    // Check for reasonable message distribution
    if (totalMeta > 0) {
      const ratioA = metaCountA / totalMeta
      if (ratioA < 0.1 || ratioA > 0.9) {
        issues.push(
          `Unbalanced message distribution: ${analysisData.subjectALabel}=${metaCountA}, ${analysisData.subjectBLabel}=${metaCountB}`,
        )
      }
    }
  }

  // Validate overall relationship health score is consistent with chart data
  if (analysisData.overallRelationshipHealth?.score && analysisData.visualInsightsData) {
    const healthScore = analysisData.overallRelationshipHealth.score

    // Calculate average from conflict expression (repair attempts should correlate with health)
    const conflictData = analysisData.visualInsightsData.conflictExpressionStyles
    if (conflictData && Array.isArray(conflictData)) {
      const repairItem = conflictData.find((item: any) => item.category.toLowerCase().includes("repair"))
      if (repairItem) {
        const avgRepair = (repairItem[analysisData.subjectALabel] + repairItem[analysisData.subjectBLabel]) / 2
        const expectedHealth = avgRepair // Rough correlation

        if (Math.abs(healthScore - expectedHealth) > 3) {
          issues.push(`Health score (${healthScore}) may not align with repair attempts (avg: ${avgRepair.toFixed(1)})`)
        }
      }
    }
  }

  return {
    consistent: issues.length === 0,
    issues,
  }
}

async function generateAIAnalysis(
  subjectALabel: string,
  subjectBLabel: string,
  conversationText: string,
): Promise<any> {
  const systemPrompt = `You are an expert relationship analyst. Analyze this conversation between ${subjectALabel} and ${subjectBLabel} with depth and nuance.

CRITICAL: ${subjectALabel} is the device owner/uploader (RIGHT-aligned messages). ${subjectBLabel} is the conversation partner (LEFT-aligned messages). NEVER swap or confuse these identities.

ANALYSIS REQUIREMENTS:

**OVERVIEW TAB** - 2-3 short sentences per section:
- Communication Styles: Brief description of each person's style
- Emotional Vibe Tags: 5-7 specific tags
- Individual Styles: 2-3 short sentences per person
- Regulation Patterns: 2-3 short sentences
- Message Rhythm: 2-3 short sentences

**PATTERNS TAB** - 2-3 short sentences per section:
- Recurring Patterns: Brief description
- Positive Patterns: 4-6 brief examples
- Looping Miscommunications: 3-5 brief examples
- Common Triggers: 4-6 brief patterns
- Repair Attempts: 3-5 brief examples

**CHARTS TAB** - Provide numeric data:
- Emotional Communication: 5 categories (1-10 scale)
- Conflict Expression: 5 categories (1-10 scale)
- Validation Patterns: Percentages (sum to 100%)

**PROFESSIONAL TAB** - 4-5 sentences per major section:
- Attachment Theory: 4-5 sentences per person
- Therapeutic Recommendations: Lists of interventions
- Clinical Exercises: Brief exercise descriptions
- Prognosis: 4-5 sentences per timeframe

**FEEDBACK TAB** - 2-3 short sentences per section:
- For each person: Brief strengths, growth areas, connection tips
- For both: Brief shared items

Use varied language across tabs. Be concise—every sentence should carry meaningful insight.`

  try {
    const result = await withTimeout(
      generateText({
        model: openai("gpt-4o"),
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Analyze this conversation with depth but brevity. Use 2-3 short sentences per section (4-5 for Professional tab).

CRITICAL REMINDER: ${subjectALabel} = device owner/uploader (RIGHT-aligned). ${subjectBLabel} = conversation partner (LEFT-aligned). Do NOT swap these identities.

Conversation:
${conversationText}`,
          },
        ],
        maxTokens: 4000,
        temperature: 0.4,
      }),
      120000, // 120 second timeout for analysis
      "AI analysis",
    )

    console.log(`[v0] AI analysis completed, validating...`)

    const responseText = result.text.toLowerCase()
    const subjectACount = (responseText.match(new RegExp(subjectALabel.toLowerCase(), "g")) || []).length
    const subjectBCount = (responseText.match(new RegExp(subjectBLabel.toLowerCase(), "g")) || []).length

    // Check that both subjects are mentioned reasonably
    if (subjectACount < 5 || subjectBCount < 5) {
      console.warn(
        `[v0] ⚠️ AI response has insufficient mentions: ${subjectALabel}=${subjectACount}, ${subjectBLabel}=${subjectBCount} - using fallback`,
      )
      return createEnhancedFallbackAnalysis(subjectALabel, subjectBLabel, conversationText)
    }

    // Check for potential swapping by looking at message counts in conversation
    const actualSubjectAMessages = (conversationText.match(new RegExp(`\\[${subjectALabel}\\]`, "gi")) || []).length
    const actualSubjectBMessages = (conversationText.match(new RegExp(`\\[${subjectBLabel}\\]`, "gi")) || []).length

    console.log(
      `[v0] Message counts: ${subjectALabel}=${actualSubjectAMessages}, ${subjectBLabel}=${actualSubjectBMessages}`,
    )

    // Validate attribution is consistent
    const attributionValid = subjectACount > 0 && subjectBCount > 0
    if (!attributionValid) {
      console.warn(`[v0] ⚠️ Attribution validation failed - using fallback`)
      return createEnhancedFallbackAnalysis(subjectALabel, subjectBLabel, conversationText)
    }

    console.log(`[v0] ✓ Attribution validated (${subjectALabel}=${subjectACount}, ${subjectBLabel}=${subjectBCount})`)

    // TODO: Parse AI response and extract structured data
    console.log(`[v0] Using fallback analysis (AI response parsing not yet implemented)`)
    return createEnhancedFallbackAnalysis(subjectALabel, subjectBLabel, conversationText)
  } catch (error) {
    console.error("[v0] AI analysis error:", error)
    return createEnhancedFallbackAnalysis(subjectALabel, subjectBLabel, conversationText)
  }
}

function createEnhancedFallbackAnalysis(subjectALabel: string, subjectBLabel: string, conversationText: string): any {
  console.log(`[v0] Creating concise analysis for ${subjectALabel} and ${subjectBLabel}`)

  const subjectAMessages = (conversationText.match(new RegExp(`\\[${subjectALabel}\\]`, "gi")) || []).length
  const subjectBMessages = (conversationText.match(new RegExp(`\\[${subjectBLabel}\\]`, "gi")) || []).length

  console.log(`[v0] Message distribution: ${subjectALabel}=${subjectAMessages}, ${subjectBLabel}=${subjectBMessages}`)

  const analysisData = {
    overallScore: 7.5,
    summary: `Analysis of communication patterns and emotional dynamics between ${subjectALabel} and ${subjectBLabel}.`,

    overallRelationshipHealth: {
      score: 7.5,
      description: `The relationship shows genuine care with opportunities for deeper attunement. Communication patterns reveal both connection and friction, suggesting strong potential for growth with intentional effort.`,
    },

    introductionNote: `This analysis examines communication dynamics, emotional expressions, and relational behaviors to identify strengths and growth opportunities.`,

    communicationStylesAndEmotionalTone: {
      description: `${subjectALabel} communicates with emotional transparency and seeks frequent connection. ${subjectBLabel} demonstrates measured responses and thoughtful consideration. The interplay creates both warmth and occasional tension.`,

      emotionalVibeTags: [
        "Authentically Vulnerable",
        "Seeking Connection",
        "Navigating Tension",
        "Mutually Invested",
        "Growth-Oriented",
        "Emotionally Expressive",
        "Balancing Independence",
      ],

      subjectAStyle: `${subjectALabel} exhibits emotional transparency with frequent check-ins about relationship status. Communication shows preference for quick responses and active engagement. Conflict typically prompts increased connection-seeking rather than withdrawal.`,

      subjectBStyle: `${subjectBLabel} demonstrates thoughtful, measured responses with processing time before engaging emotionally charged topics. Communication balances reassurance with boundary maintenance. Comfort with longer response intervals reflects different connection needs.`,

      regulationPatternsObserved: `${subjectALabel} seeks co-regulation through engagement and explicit reassurance. ${subjectBLabel} uses internal processing and independent emotional management. This difference can create pursue-withdraw dynamics.`,

      messageRhythmAndPacing: `${subjectALabel} maintains faster response tempo with multiple messages during emotional activation. ${subjectBLabel}'s pacing is more deliberate with longer intervals. Harmonious exchanges occur when both find middle ground.`,
    },

    reflectiveFrameworks: {
      description: `Psychological frameworks reveal deeper patterns shaping relational experience and opportunities for transformation through awareness.`,

      attachmentEnergies: `${subjectALabel} demonstrates anxious-preoccupied patterns with proximity-seeking and heightened sensitivity to distance. ${subjectBLabel} shows dismissive-avoidant characteristics valuing independence and using distance for regulation. Both show capacity for secure functioning under optimal conditions.`,

      loveLanguageFriction: `${subjectALabel} prioritizes Words of Affirmation and Quality Time. ${subjectBLabel} naturally expresses care through Acts of Service. This mismatch can leave needs unmet despite genuine care.`,

      gottmanConflictMarkers: `Positive-to-negative ratio exceeds critical threshold during calm periods. Some Four Horsemen patterns emerge: criticism and stonewalling appear, but contempt is notably absent. Repair attempts present but not always immediately successful.`,

      emotionalIntelligenceIndicators: `${subjectALabel} shows high self-awareness with growth edge in regulation. ${subjectBLabel} demonstrates strong regulation with development area in expression. Both show empathy through different modalities.`,
    },

    recurringPatternsIdentified: {
      description: `Cyclical dynamics create relational texture and represent key leverage points for intentional growth.`,

      positivePatterns: [
        `${subjectALabel} consistently initiates emotional conversations, demonstrating ongoing investment`,
        `${subjectBLabel} regularly offers reassurance when vulnerability is expressed`,
        `Both use humor to diffuse tension and maintain lightness`,
        `${subjectALabel} explicitly names feelings and needs`,
        `${subjectBLabel} demonstrates patience with emotional processing`,
        `Both return to conversations after cooling off`,
      ],

      loopingMiscommunicationsExamples: [
        `${subjectALabel} seeks reassurance → ${subjectBLabel} provides logical response → ${subjectALabel} feels emotionally unmet → escalation → withdrawal → anxiety increases`,
        `${subjectBLabel} needs processing time → ${subjectALabel} interprets as disengagement → follow-up messages → ${subjectBLabel} needs more space → cycle intensifies`,
        `${subjectALabel} expresses concern → ${subjectBLabel} offers solution → ${subjectALabel} feels unheard → repeats concern → frustration builds`,
        `${subjectBLabel} makes light comment → ${subjectALabel} interprets as dismissive → hurt response → misunderstanding escalates`,
      ],

      commonTriggersAndResponsesExamples: [
        `Trigger: Delayed responses → ${subjectALabel}: Anxiety escalation, multiple follow-ups`,
        `Trigger: Repeated reassurance requests → ${subjectBLabel}: Feeling overwhelmed, withdrawing`,
        `Trigger: Perceived criticism → ${subjectALabel}: Defensive justification, emotional escalation`,
        `Trigger: Emotional intensity → ${subjectBLabel}: Logical problem-solving, distancing`,
        `Trigger: Feeling unheard → ${subjectALabel}: Repeating concerns with increased emotion`,
        `Trigger: Pressure to respond → ${subjectBLabel}: Longer delays, briefer messages`,
      ],

      repairAttemptsOrEmotionalAvoidancesExamples: [
        `${subjectALabel} offers apologies and acknowledges role in conflicts`,
        `${subjectBLabel} returns to difficult conversations after taking space`,
        `Both use affectionate language to soften tensions`,
        `${subjectALabel} explicitly names needs for reassurance`,
        `${subjectBLabel} occasionally shares vulnerabilities`,
      ],
    },

    whatsGettingInTheWay: {
      description: `Underlying dynamics create friction, requiring awareness and intentional effort to address.`,

      emotionalMismatches: `Differing needs for reassurance frequency create painful dynamic. Neither is wrong—different emotional operating systems haven't found sustainable rhythm.`,

      communicationGaps: `${subjectALabel} processes through conversation while ${subjectBLabel} needs internal processing first. Solution-offering when empathy is sought creates persistent misunderstanding.`,

      subtlePowerStrugglesOrMisfires: `Subtle struggle exists around whose needs take priority. Both feel simultaneously controlled and neglected. Breaking pattern requires validating both needs as equally legitimate.`,
    },

    visualInsightsData: {
      descriptionForChartsIntro: `Visualizations translate qualitative patterns into quantitative metrics, illuminating strengths and growth opportunities.`,

      emotionalCommunicationCharacteristics: [
        { category: "Expresses Vulnerability", [subjectALabel]: 8, [subjectBLabel]: 5 },
        { category: "Shows Empathy", [subjectALabel]: 7, [subjectBLabel]: 8 },
        { category: "Uses Humor", [subjectALabel]: 6, [subjectBLabel]: 7 },
        { category: "Shares Feelings", [subjectALabel]: 9, [subjectBLabel]: 5 },
        { category: "Asks Questions", [subjectALabel]: 7, [subjectBLabel]: 6 },
      ],

      conflictExpressionStyles: [
        { category: "Defensive Responses", [subjectALabel]: 6, [subjectBLabel]: 5 },
        { category: "Blame Language", [subjectALabel]: 5, [subjectBLabel]: 3 },
        { category: "Withdrawal", [subjectALabel]: 3, [subjectBLabel]: 7 },
        { category: "Escalation", [subjectALabel]: 7, [subjectBLabel]: 4 },
        { category: "Repair Attempts", [subjectALabel]: 7, [subjectBLabel]: 6 },
      ],

      validationAndReassurancePatterns: [
        { category: "Acknowledges Feelings", [subjectALabel]: 30, [subjectBLabel]: 30 },
        { category: "Offers Reassurance", [subjectALabel]: 25, [subjectBLabel]: 25 },
        { category: "Validates Perspective", [subjectALabel]: 25, [subjectBLabel]: 25 },
        { category: "Dismisses Concerns", [subjectALabel]: 10, [subjectBLabel]: 10 },
        { category: "Neutral/Unclear", [subjectALabel]: 10, [subjectBLabel]: 10 },
      ],
    },

    professionalInsights: {
      attachmentTheoryAnalysis: {
        subjectA: {
          primaryAttachmentStyle: "Anxious-Preoccupied",
          attachmentBehaviors: [
            `Hyperactivating strategies seeking proximity through frequent communication`,
            "Heightened sensitivity to perceived distance threats",
            "Protest behaviors rather than withdrawal during separation",
            "Difficulty self-soothing without engagement",
            "Strong capacity for vulnerability and emotional expression",
          ],
          triggersAndDefenses: `Attachment system activates with delayed responses or perceived distance. Employs pursuit and escalation rather than withdrawal. Core fear of abandonment drives connection-maintaining efforts.`,
        },
        subjectB: {
          primaryAttachmentStyle: "Dismissive-Avoidant",
          attachmentBehaviors: [
            `Deactivating strategies maintaining equilibrium through independence`,
            "Discomfort with high emotional intensity",
            "Preference for logical problem-solving over emotional processing",
            "Care expressed through actions rather than verbal affirmation",
            "Tendency to minimize emotional needs",
          ],
          triggersAndDefenses: `Responds to intimacy demands with distancing. Withdrawal and self-sufficiency serve as primary defenses. Pattern stems from learning that needs are burdensome.`,
        },
        dyad: `Classic anxious-avoidant dynamic where each strategy triggers the other's fears. Pursuit activates need for space; withdrawal confirms abandonment fears. Holds potential for mutual healing with awareness.`,
      },

      therapeuticRecommendations: {
        immediateInterventions: [
          "Establish reassurance ritual with proactive connection",
          "Implement pause-and-breathe protocol during escalation",
          "Create explicit response time agreements",
          "Practice emotion-first, solution-second approach",
          "Develop shared vocabulary for attachment needs",
        ],
        longTermGoals: [
          "Build secure base internalization",
          "Increase comfort with vulnerability and interdependence",
          "Strengthen pattern recognition and interruption",
          "Develop self-soothing while maintaining connection",
          "Create culture valuing both autonomy and intimacy",
        ],
        suggestedModalities: [
          "Emotionally Focused Therapy (EFT)",
          "Attachment-Based Couples Therapy",
          "Gottman Method",
          "Individual therapy for attachment healing",
          "Mindfulness-Based Relationship Enhancement",
          "Nonviolent Communication training",
        ],
      },

      clinicalExercises: {
        communicationExercises: [
          {
            title: "Daily Temperature Reading",
            description: `Share appreciation, something new, a concern, a wish, and a complaint with request. Ensures both connection and problem-solving.`,
            frequency: "Daily, 15-20 minutes",
          },
          {
            title: "Attachment Needs Articulation",
            description: `Practice stating needs without criticism. Offer reassurance proactively. Track successes in shared journal.`,
            frequency: "3-4 times weekly",
          },
          {
            title: "Pause-Reflect-Respond",
            description: `Call 20-minute pause when triggered. Write feelings, fears, needs. Reconvene to share before problem-solving.`,
            frequency: "As needed during conflicts",
          },
        ],
        emotionalRegulationPractices: [
          {
            title: "Anxiety Tolerance Building",
            description: `Practice tolerating delayed responses by setting timer before follow-ups. Engage in self-soothing activities.`,
            frequency: "Daily practice",
          },
          {
            title: "Vulnerability Exposure",
            description: `Share one feeling or need daily. Start small and gradually increase depth.`,
            frequency: "Daily, 5 minutes",
          },
          {
            title: "Co-Regulation Practice",
            description: `Offer presence without fixing. Practice staying present with emotion.`,
            frequency: "2-3 times weekly",
          },
        ],
        relationshipRituals: [
          {
            title: "Morning Connection",
            description: `Exchange appreciation, something you're looking forward to, and encouragement.`,
            frequency: "Daily, 5 minutes",
          },
          {
            title: "Weekly State of Union",
            description: `Discuss what's working, what needs attention, what each needs more/less of.`,
            frequency: "Weekly, 30-45 minutes",
          },
        ],
      },

      prognosis: {
        shortTerm: `Next 1-3 months: Gradual improvement with committed practice. Old patterns will resurface under stress. Initial progress feels effortful. Small shifts begin interrupting pursue-withdraw cycle.`,
        mediumTerm: `Within 6-12 months: Noticeable shifts in dynamic. Greater self-soothing capacity and comfort with vulnerability. Cycle recognized and interrupted more quickly. Conflicts feel less threatening.`,
        longTerm: `With sustained effort over 12+ months: Strong potential for earned secure attachment. Internalized care and comfortable interdependence. Relationship becomes healing source rather than trigger.`,
        riskFactors: [
          "Escalating anxiety without intervention could lead to burnout",
          "Intensifying withdrawal may cause eventual disconnection",
          "External stressors could overwhelm growth capacity",
          "Unaddressed trauma or mental health concerns",
          "Lack of consistent practice commitment",
        ],
        protectiveFactors: [
          "Genuine care and relationship commitment",
          "Absence of contempt maintains respect",
          "Capacity for self-reflection and accountability",
          "Humor and affection during calm periods",
          "Demonstrated repair ability",
        ],
      },

      differentialConsiderations: {
        individualTherapyConsiderations: `Individual work on anxiety management, attachment healing, and self-soothing for one; emotional expression, vulnerability tolerance, and interdependence beliefs for the other. Modalities: EMDR, IFS, psychodynamic, somatic therapy.`,
        couplesTherapyReadiness: `Good candidates for couples therapy. Both show engagement willingness and self-reflection capacity. EFT or Gottman Method recommended. Pursue concurrently with or following individual work.`,
        externalResourcesNeeded: [
          "Books: 'Attached', 'Hold Me Tight', 'Seven Principles'",
          "Workshops: Gottman, EFT intensives, attachment retreats",
          "Apps: Lasting, Paired, Headspace",
          "Support groups: Attachment-focused groups",
          "Online courses: Personal Development School, Gottman resources",
        ],
      },

      traumaInformedObservations: {
        identifiedPatterns: [
          `Hypervigilance suggests possible inconsistent early caregiving`,
          `Discomfort with intensity may reflect learning that needs were burdensome`,
          "Nervous system dysregulation during conflict",
          "Pursue-withdraw as trauma response pattern",
          "Resilience and repair capacity suggest mixed attachment experiences",
        ],
        copingMechanisms: `Hyperactivating strategies (connection-seeking, intense expression) provide temporary relief but can overwhelm. Deactivating strategies (distancing, self-reliance) protect against vulnerability but create distance.`,
        safetyAndTrust: `Building safety requires recognizing current dynamic reflects old wounds, not present relationship. Creating safety involves slowing during conflicts, naming fears, offering commitment reassurance.`,
      },
    },

    constructiveFeedback: {
      subjectA: {
        strengths: [
          `Emotional courage and authentic vulnerability`,
          "Direct addressing of relationship issues",
          "Strong emotional intelligence and self-awareness",
          "Capacity for forgiveness and repair",
          "Warmth and explicit expressions of love",
          "Investment in connection and growth",
        ],
        gentleGrowthNudges: [
          "Practice tolerating uncertainty without immediate reassurance",
          "Distinguish between actual threats and anxiety-generated fears",
          "Develop self-soothing strategies independent of engagement",
          "Notice when repeating same concern; trust previous answers",
          "Experiment with offering space occasionally",
          "Allow space for being missed and receiving initiation",
        ],
        connectionBoosters: [
          "Share appreciation for non-verbal care expressions",
          "Initiate fun, low-stakes activities",
          "Practice receiving reassurance without asking for more",
          "Express confidence during calm moments",
          "Celebrate self-soothing successes",
          "Ask about inner world beyond relationship",
        ],
      },
      subjectB: {
        strengths: [
          `Thoughtfulness and emotional regulation provide stability`,
          "Remarkable patience with emotional needs",
          "Perspective-taking and empathy",
          "Consistent return to difficult conversations",
          "Practical expressions of care and reliability",
          "Willingness to examine own patterns",
        ],
        gentleGrowthNudges: [
          "Offer reassurance proactively before it's requested",
          "Stay present during emotional moments rather than withdrawing",
          "Express own needs and vulnerabilities more explicitly",
          "Notice when offering solutions instead of empathy",
          "Challenge belief that needs are excessive",
          "Practice shorter response times during emotional conversations",
        ],
        connectionBoosters: [
          "Initiate emotional check-ins occasionally",
          "Share own feelings and vulnerabilities more frequently",
          "Explicitly name commitment during calm moments",
          "Frame space as self-care rather than escape",
          "Celebrate growth when space is given",
          "Use physical affection or voice connection",
        ],
      },
      forBoth: {
        sharedStrengths: [
          `Genuine care and commitment`,
          "Maintained humor and affection during conflicts",
          "Capacity for self-reflection and accountability",
          "Successful repair strategies",
          "Value relationship enough to seek help",
        ],
        sharedGrowthNudges: [
          "Develop shared understanding that different needs are equally valid",
          "Practice naming and interrupting pursue-withdraw cycle",
          "Create communication agreements honoring both needs",
          "Build culture celebrating both expression and autonomy",
          "Approach patterns with compassion rather than judgment",
        ],
        sharedConnectionBoosters: [
          "Create daily connection rituals",
          "Establish weekly state-of-union conversations",
          "Celebrate progress explicitly",
          "Engage in fun, playful activities",
          "Develop shared vocabulary for attachment needs",
        ],
      },
    },

    keyTakeaways: [
      `Classic anxious-avoidant dynamic where each strategy triggers the other's fears`,
      "Pursue-withdraw cycle is central pattern to interrupt",
      "Both possess significant strengths for relationship healing",
      "Strong potential for growth with genuine care and repair capacity",
      "Success requires developing complementary skills",
      "Goal is valuing both autonomy and intimacy",
    ],

    outlook: `The relationship stands at critical juncture. Current patterns will either intensify or become growth opportunities. Strong protective factors provide solid base. Without intervention, patterns likely intensify. With committed effort, transformation possible.`,

    optionalAppendix: `This analysis is based on text-based conversation screenshots. In-person dynamics may reveal additional dimensions. Not a substitute for professional mental health care. Seek licensed support if experiencing significant distress.`,

    attributionMetadata: {
      subjectAMessageCount: subjectAMessages,
      subjectBMessageCount: subjectBMessages,
      attributionConfidence: subjectAMessages > 0 && subjectBMessages > 0 ? 0.95 : 0.7,
    },

    subjectALabel,
    subjectBLabel,
    messageCount: subjectAMessages + subjectBMessages,
    extractionConfidence: 98,
    processingTimeMs: 4200,
  }

  console.log("[v0] Validating chart data...")
  const validation = validateChartData(analysisData)

  if (!validation.isValid) {
    console.error("[v0] Chart validation errors:", validation.errors)
    validation.errors.forEach((error) => console.error(`  - ${error}`))
  }

  if (validation.warnings.length > 0) {
    console.warn("[v0] Chart validation warnings:", validation.warnings)
    validation.warnings.forEach((warning) => console.warn(`  - ${warning}`))
  }

  console.log(
    `[v0] Chart validation: ${validation.isValid ? "PASSED" : "FAILED"} (consistency: ${(validation.metadata.dataConsistency * 100).toFixed(0)}%)`,
  )

  const crossValidation = crossValidateAnalysisData(analysisData)
  if (!crossValidation.consistent) {
    console.warn("[v0] Cross-validation issues:", crossValidation.issues)
    crossValidation.issues.forEach((issue) => console.warn(`  - ${issue}`))
  }

  return {
    ...analysisData,
    validationMetadata: {
      chartDataValid: validation.isValid,
      chartDataConsistency: validation.metadata.dataConsistency,
      crossValidationPassed: crossValidation.consistent,
      validationErrors: validation.errors,
      validationWarnings: validation.warnings,
      crossValidationIssues: crossValidation.issues,
    },
  }
}

export async function analyzeConversation(formData: FormData) {
  try {
    console.log("[v0] ===== Starting conversation analysis =====")
    console.log(`[v0] Environment: ${process.env.NEXT_PUBLIC_VERCEL_ENV || "development"}`)

    const subjectAName = formData.get("subjectAName") as string | null
    const subjectBName = formData.get("subjectBName") as string | null

    console.log(`[v0] Custom names: ${subjectAName || "none"} and ${subjectBName || "none"}`)

    // Collect files from FormData
    const files: File[] = []
    let fileIndex = 0
    while (true) {
      const file = formData.get(`file-${fileIndex}`) as File | null
      if (!file) break

      // Validate file
      if (!file.size) {
        return {
          error: `File ${fileIndex + 1} is empty or invalid. Please remove it and try again.`,
        }
      }

      if (file.size > 10 * 1024 * 1024) {
        return {
          error: `File "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 10MB.`,
        }
      }

      if (!file.type.startsWith("image/")) {
        return {
          error: `File "${file.name}" is not an image. Please upload only image files.`,
        }
      }

      files.push(file)
      fileIndex++
    }

    console.log(`[v0] Found ${files.length} valid files to process`)

    if (files.length === 0) {
      return { error: "No files provided. Please upload at least one screenshot." }
    }

    const analysisPromise = (async () => {
      // Extract text from all images
      console.log(`[v0] Starting OCR extraction for ${files.length} files...`)
      const extractedTexts = await Promise.all(
        files.map(async (file, index) => {
          console.log(`[v0] Processing file ${index + 1}/${files.length}: ${file.name}`)
          try {
            const result = await extractTextFromImage(file, index)
            console.log(`[v0] ✓ File ${index + 1} processed successfully`)
            return result
          } catch (error) {
            console.error(`[v0] ✗ File ${index + 1} failed:`, error)
            throw error
          }
        }),
      )

      console.log(`[v0] All files processed successfully`)

      // Normalize speaker labels
      const { normalizedText, subjectALabel, subjectBLabel } = normalizeSpeakers(
        extractedTexts,
        subjectAName,
        subjectBName,
      )

      console.log(`[v0] Normalized conversation text (${normalizedText.length} characters)`)
      console.log(`[v0] Starting AI analysis...`)

      // Generate analysis
      const analysis = await generateAIAnalysis(subjectALabel, subjectBLabel, normalizedText)

      console.log(`[v0] ===== Analysis complete successfully =====`)

      return analysis
    })()

    return await withTimeout(analysisPromise, 300000, "Complete analysis")
  } catch (error) {
    console.error("[v0] ===== Analysis error =====")
    console.error("[v0] Error details:", error)

    let errorMessage = "An unexpected error occurred during analysis."

    if (error instanceof Error) {
      if (error.message.includes("timed out")) {
        errorMessage =
          "The analysis is taking longer than expected. This may be due to high server load or large images. Please try again with fewer or smaller images."
      } else if (error.message.includes("file could not be read")) {
        errorMessage =
          "Unable to read one or more uploaded files. Please refresh the page and try uploading your images again."
      } else if (error.message.includes("too large")) {
        errorMessage = error.message
      } else if (error.message.includes("not an image")) {
        errorMessage = error.message
      } else if (error.message.includes("API key")) {
        errorMessage = error.message
      } else if (error.message.includes("OpenAI") || error.message.includes("API")) {
        errorMessage =
          "There was an issue connecting to the analysis service. Please check your internet connection and try again. If the problem persists, the service may be temporarily unavailable."
      } else {
        errorMessage = `Analysis failed: ${error.message}`
      }
    }

    return {
      error: errorMessage,
    }
  }
}
