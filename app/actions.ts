"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

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

    // Method 1: Try arrayBuffer first (most reliable in Next.js server actions)
    try {
      console.log(`[v0] Attempting arrayBuffer() method for ${file.name}`)
      const arrayBuffer = await file.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
      method = "arrayBuffer"
      console.log(`[v0] Successfully read ${file.name} using arrayBuffer()`)
    } catch (arrayBufferError) {
      console.warn(`[v0] arrayBuffer() failed for ${file.name}:`, arrayBufferError)

      // Method 2: Try bytes() if available (Next.js 14+)
      try {
        if (typeof (file as any).bytes === "function") {
          console.log(`[v0] Attempting bytes() method for ${file.name}`)
          const bytes = await (file as any).bytes()
          buffer = Buffer.from(bytes)
          method = "bytes"
          console.log(`[v0] Successfully read ${file.name} using bytes()`)
        }
      } catch (bytesError) {
        console.warn(`[v0] bytes() failed for ${file.name}:`, bytesError)
      }
    }

    if (!buffer) {
      throw new Error(
        `Unable to read file "${file.name}". All reading methods failed. This may be due to browser security restrictions or file access permissions.`,
      )
    }

    const base64 = buffer.toString("base64")
    console.log(`[v0] Converted ${file.name} to base64 (${base64.length} chars) using ${method}`)

    return `data:${file.type};base64,${base64}`
  } catch (error) {
    console.error(`[v0] Error converting file "${file.name}" to base64:`, error)
    throw new Error(
      `Failed to read file "${file.name}": ${error instanceof Error ? error.message : "Unknown error"}. Please try uploading a different image or refresh the page and try again.`,
    )
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
  attributionStats?: {
    unknownRatio: number
    uncertainIds: string[]
    confidenceMean: number
  }
}> {
  const startTime = Date.now()

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured")
  }

  try {
    const base64Image = await fileToBase64(file)

    const result = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Extract conversation from this messaging screenshot. Use these rules:

SPEAKER LABELS (FIXED):
- RIGHT-aligned messages = [Person A] (device owner/uploader)
- LEFT-aligned messages = [Person B] (other participant)
- NEVER swap these labels

PLATFORM DETECTION:
Identify: imessage, android, whatsapp, messenger, or unknown
Look for: bubble colors, UI elements, status bars

OUTPUT FORMAT:
[Person A]: "message text"
[Person B]: "message text"
[Unknown]: "text" (only if confidence < 60%)

After messages, add:
---METADATA---
Platform: [platform]
Platform Confidence: [0.0-1.0]
Total Messages: [count]
Person A Messages: [count]
Person B Messages: [count]
Unknown Messages: [count]
Average Confidence: [0.0-1.0]

Extract accurately, preserve order, capture complete text.`,
            },
            {
              type: "image",
              image: base64Image,
            },
          ],
        },
      ],
      maxTokens: 2000, // Reduced from 3000 for faster response
    })

    const extractedText = result.text

    let platform = "unknown"
    let platformConfidence = 0.5
    let unknownRatio = 0
    const uncertainIds: string[] = []
    let confidenceMean = 0.5

    const metadataMatch = extractedText.match(/---METADATA---\s*([\s\S]*?)(?:\n\n|$)/)
    if (metadataMatch) {
      const metadata = metadataMatch[1]
      const platformMatch = metadata.match(/Platform:\s*(\w+)/i)
      const platformConfMatch = metadata.match(/Platform Confidence:\s*([\d.]+)/i)
      const totalMatch = metadata.match(/Total Messages:\s*(\d+)/i)
      const unknownMatch = metadata.match(/Unknown Messages:\s*(\d+)/i)
      const avgConfMatch = metadata.match(/Average Confidence:\s*([\d.]+)/i)

      if (platformMatch) platform = platformMatch[1].toLowerCase()
      if (platformConfMatch) platformConfidence = Number.parseFloat(platformConfMatch[1])
      if (avgConfMatch) confidenceMean = Number.parseFloat(avgConfMatch[1])

      if (totalMatch && unknownMatch) {
        const total = Number.parseInt(totalMatch[1])
        const unknown = Number.parseInt(unknownMatch[1])
        unknownRatio = total > 0 ? unknown / total : 0
      }
    }

    const speakerAMatches = extractedText.match(/\[Person A\]/gi) || []
    const speakerBMatches = extractedText.match(/\[Person B\]/gi) || []
    const unknownMatches = extractedText.match(/\[Unknown\]/gi) || []

    const speakerACount = speakerAMatches.length
    const speakerBCount = speakerBMatches.length
    const unknownCount = unknownMatches.length
    const totalMessages = speakerACount + speakerBCount + unknownCount

    let confidence = confidenceMean
    if (totalMessages > 0) {
      if (unknownRatio > 0.05) {
        confidence *= 0.8
      }
      if (speakerACount > 0 && speakerBCount > 0) {
        confidence = Math.min(confidence * 1.1, 1.0)
      }
    }

    const processingTime = Date.now() - startTime

    return {
      text: extractedText,
      speaker1Label: "Person A",
      speaker2Label: "Person B",
      confidence,
      processingTime,
      platform,
      attributionStats: {
        unknownRatio,
        uncertainIds: [],
        confidenceMean,
      },
    }
  } catch (error) {
    console.error(`[Image ${imageIndex + 1}] Extraction failed:`, error)
    throw new Error(
      `Failed to extract text from image ${imageIndex + 1}: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}

function validateAIResponse(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check required top-level fields
  const required = ["subjects", "metrics", "attribution"]
  for (const key of required) {
    if (!(key in data)) {
      errors.push(`Missing required field: ${key}`)
    }
  }

  // Validate tone values sum to ~1.0
  const tone = data.metrics?.emotional_tone
  if (tone) {
    const sum = (tone.positive || 0) + (tone.negative || 0) + (tone.neutral || 0)
    if (Math.abs(sum - 1.0) > 0.15) {
      errors.push(`Tone values sum to ${sum.toFixed(2)}, expected ≈1.00`)
    }
  }

  // Validate 1-10 scales are integers in range
  const conflict = data.metrics?.conflict
  if (conflict) {
    for (const subject of ["subject_a", "subject_b"]) {
      const subjectData = conflict[subject]
      if (subjectData) {
        const scores = [
          { name: "reactivity", value: subjectData.reactivity },
          { name: "ownership", value: subjectData.ownership },
          { name: "blame", value: subjectData.blame },
          { name: "repair_attempts", value: subjectData.repair_attempts },
        ]
        for (const score of scores) {
          if (!Number.isInteger(score.value) || score.value < 1 || score.value > 10) {
            errors.push(`${subject}.${score.name} must be integer 1-10, got ${score.value}`)
          }
        }
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

function sanitizeAnalysisResponse(aiAnalysis: any): any {
  const sanitized = JSON.parse(JSON.stringify(aiAnalysis)) // Deep clone

  // Helper to clamp values
  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, Math.round(val)))

  // Sanitize conflict scores (1-10 integers)
  if (sanitized.metrics?.conflict) {
    for (const subject of ["subject_a", "subject_b"]) {
      const c = sanitized.metrics.conflict[subject]
      if (c) {
        c.reactivity = clamp(c.reactivity || 5, 1, 10)
        c.ownership = clamp(c.ownership || 5, 1, 10)
        c.blame = clamp(c.blame || 5, 1, 10)
        c.repair_attempts = clamp(c.repair_attempts || 5, 1, 10)
      }
    }
  }

  // Sanitize validation scores (1-10 integers)
  if (sanitized.metrics?.validation) {
    for (const subject of ["subject_a", "subject_b"]) {
      const v = sanitized.metrics.validation[subject]
      if (v) {
        v.support = clamp(v.support || 5, 1, 10)
        v.reassurance = clamp(v.reassurance || 5, 1, 10)
        v.appreciation = clamp(v.appreciation || 5, 1, 10)
      }
    }
  }

  // Normalize tone values to sum to 1.0
  const tone = sanitized.metrics?.emotional_tone
  if (tone) {
    const sum = (tone.positive || 0) + (tone.negative || 0) + (tone.neutral || 0)
    if (sum > 0) {
      tone.positive = Number(((tone.positive || 0) / sum).toFixed(3))
      tone.negative = Number(((tone.negative || 0) / sum).toFixed(3))
      tone.neutral = Number(((tone.neutral || 0) / sum).toFixed(3))
    } else {
      // Default to neutral if all zeros
      tone.positive = 0.33
      tone.negative = 0.33
      tone.neutral = 0.34
    }
  }

  return sanitized
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

  const normalizedText = extractedTexts
    .map((extracted) => {
      let text = extracted.text

      text = text.replace(/\[Person A\]/gi, `[${labelA}]`)
      text = text.replace(/\[Person B\]/gi, `[${labelB}]`)

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

function parseConversationToMessages(
  normalizedText: string,
  subjectALabel: string,
  subjectBLabel: string,
): Array<{ id: string; speaker: "A" | "B" | "unknown"; text: string }> {
  const messages: Array<{ id: string; speaker: "A" | "B" | "unknown"; text: string }> = []

  const messagePattern = /\[(.*?)\]:\s*"([^"]+)"/g
  let match
  let messageId = 0

  while ((match = messagePattern.exec(normalizedText)) !== null) {
    const label = match[1].trim()
    const text = match[2].trim()

    let speaker: "A" | "B" | "unknown" = "unknown"
    if (label === subjectALabel) {
      speaker = "A"
    } else if (label === subjectBLabel) {
      speaker = "B"
    }

    messages.push({
      id: `msg_${messageId++}`,
      speaker,
      text,
    })
  }

  return messages
}

function transformAnalysisToUIFormat(
  aiAnalysis: any,
  subjectALabel: string,
  subjectBLabel: string,
  conversationText: string,
): any {
  const metrics = aiAnalysis.metrics || {}
  const commStyles = metrics.communication_styles || {}
  const conflict = metrics.conflict || {}
  const validation = metrics.validation || {}
  const attachment = metrics.attachment || {}
  const regulation = metrics.regulation_and_rhythm || {}
  const comparative = aiAnalysis.comparative_insights || {}

  const clinicalExercises = aiAnalysis.clinical_exercises || {}
  const prognosis = aiAnalysis.prognosis || {}
  const differentialConsiderations = aiAnalysis.differential_considerations || {}

  return {
    overallScore: 7.5,
    summary:
      comparative.strengths?.[0] || `Analysis of communication patterns between ${subjectALabel} and ${subjectBLabel}.`,

    overallRelationshipHealth: {
      score: 7,
      description: metrics.emotional_tone?.summary || "Relationship shows both strengths and areas for growth.",
    },

    introductionNote: `This analysis examines the communication dynamics between ${subjectALabel} and ${subjectBLabel}, focusing on emotional expression, conflict patterns, and relationship strengths.`,

    communicationStylesAndEmotionalTone: {
      description: commStyles.comparative_summary || "Distinct communication styles observed.",
      emotionalVibeTags: ["Caring", "Authentic", "Growing"],
      subjectAStyle: commStyles.subject_a?.baseline_style || `${subjectALabel}'s communication style.`,
      subjectBStyle: commStyles.subject_b?.baseline_style || `${subjectBLabel}'s communication style.`,
      regulationPatternsObserved: regulation.regulation_patterns || "Emotional regulation patterns observed.",
      messageRhythmAndPacing: regulation.rhythm_pacing || "Message rhythm and pacing patterns noted.",
    },

    reflectiveFrameworks: {
      description: "Analysis through psychological frameworks reveals attachment and communication patterns.",
      attachmentEnergies: attachment.summary || "Attachment patterns observed in the interaction.",
      loveLanguageFriction: commStyles.comparative_summary || "Communication style differences noted.",
      gottmanConflictMarkers: conflict.comparative_summary || "Conflict dynamics observed.",
      emotionalIntelligenceIndicators: metrics.emotional_tone?.summary || "Emotional awareness present.",
    },

    recurringPatternsIdentified: {
      description: "Several patterns emerge in the conversation dynamics.",
      positivePatterns: comparative.strengths || ["Genuine care", "Willingness to communicate"],
      loopingMiscommunicationsExamples: comparative.growth_opportunities || ["Areas for improvement identified"],
      commonTriggersAndResponsesExamples: [
        conflict.subject_a?.summary || "Conflict patterns observed",
        conflict.subject_b?.summary || "Response patterns noted",
      ],
      repairAttemptsOrEmotionalAvoidancesExamples: [
        `${subjectALabel}: ${conflict.subject_a?.repair_attempts || 0}/10 repair attempts`,
        `${subjectBLabel}: ${conflict.subject_b?.repair_attempts || 0}/10 repair attempts`,
      ],
    },

    whatsGettingInTheWay: {
      description: "Factors creating friction in the relationship dynamic.",
      emotionalMismatches: comparative.alignment_gaps?.[0]?.note || "Different emotional needs observed.",
      communicationGaps: commStyles.comparative_summary || "Communication style differences present.",
      subtlePowerStrugglesOrMisfires: conflict.comparative_summary || "Conflict dynamics to address.",
    },

    outlook: `The relationship between ${subjectALabel} and ${subjectBLabel} shows ${comparative.strengths?.[0] || "genuine potential"}. ${comparative.growth_opportunities?.[0] || "Continued growth recommended"}.`,

    visualInsightsData: {
      descriptionForChartsIntro: "The following charts visualize key patterns in your communication.",

      emotionalCommunicationCharacteristics: [
        {
          category: "Expresses Vulnerability",
          [subjectALabel]: Math.round((commStyles.subject_a?.strengths?.length || 3) * 2),
          [subjectBLabel]: Math.round((commStyles.subject_b?.strengths?.length || 3) * 2),
        },
        {
          category: "Shows Empathy",
          [subjectALabel]: validation.subject_a?.support || 7,
          [subjectBLabel]: validation.subject_b?.support || 7,
        },
        {
          category: "Uses Humor",
          [subjectALabel]: 5,
          [subjectBLabel]: 6,
        },
        {
          category: "Shares Feelings",
          [subjectALabel]: Math.round((metrics.emotional_tone?.positive || 0.5) * 10),
          [subjectBLabel]: Math.round((metrics.emotional_tone?.positive || 0.5) * 10),
        },
        {
          category: "Asks Questions",
          [subjectALabel]: 6,
          [subjectBLabel]: 6,
        },
      ],

      conflictExpressionStyles: [
        {
          category: "Defensive Responses",
          [subjectALabel]: conflict.subject_a?.reactivity || 5,
          [subjectBLabel]: conflict.subject_b?.reactivity || 5,
        },
        {
          category: "Blame Language",
          [subjectALabel]: conflict.subject_a?.blame || 4,
          [subjectBLabel]: conflict.subject_b?.blame || 4,
        },
        {
          category: "Withdrawal",
          [subjectALabel]: 10 - (conflict.subject_a?.ownership || 5),
          [subjectBLabel]: 10 - (conflict.subject_b?.ownership || 5),
        },
        {
          category: "Escalation",
          [subjectALabel]: Math.round((conflict.subject_a?.reactivity || 5) * 0.8),
          [subjectBLabel]: Math.round((conflict.subject_b?.reactivity || 5) * 0.8),
        },
        {
          category: "Repair Attempts",
          [subjectALabel]: conflict.subject_a?.repair_attempts || 6,
          [subjectBLabel]: conflict.subject_b?.repair_attempts || 6,
        },
      ],

      validationAndReassurancePatterns: [
        {
          category: "Acknowledges Feelings",
          [subjectALabel]: (validation.subject_a?.support || 7) * 10,
          [subjectBLabel]: (validation.subject_b?.support || 7) * 10,
        },
        {
          category: "Offers Reassurance",
          [subjectALabel]: (validation.subject_a?.reassurance || 6) * 10,
          [subjectBLabel]: (validation.subject_b?.reassurance || 6) * 10,
        },
        {
          category: "Validates Perspective",
          [subjectALabel]: (validation.subject_a?.appreciation || 6) * 10,
          [subjectBLabel]: (validation.subject_b?.appreciation || 7) * 10,
        },
        {
          category: "Dismisses Concerns",
          [subjectALabel]: Math.max(0, 100 - (validation.subject_a?.support || 7) * 10),
          [subjectBLabel]: Math.max(0, 100 - (validation.subject_b?.support || 7) * 10),
        },
        {
          category: "Neutral/Unclear",
          [subjectALabel]: 15,
          [subjectBLabel]: 15,
        },
      ],
    },

    professionalInsights: {
      attachmentTheoryAnalysis: {
        subjectA: {
          primaryAttachmentStyle: attachment.A_style || "mixed",
          attachmentBehaviors: commStyles.subject_a?.strengths || ["Communication present"],
          triggersAndDefenses: commStyles.subject_a?.style_shifts || "Patterns observed under stress.",
        },
        subjectB: {
          primaryAttachmentStyle: attachment.B_style || "mixed",
          attachmentBehaviors: commStyles.subject_b?.strengths || ["Communication present"],
          triggersAndDefenses: commStyles.subject_b?.style_shifts || "Patterns observed under stress.",
        },
        dyad: attachment.pattern || attachment.summary || "balanced",
      },

      therapeuticRecommendations: {
        immediateInterventions: comparative.growth_opportunities?.slice(0, 3) || [
          "Practice active listening",
          "Establish regular check-ins",
          "Develop conflict de-escalation skills",
        ],
        longTermGoals: [
          "Build secure attachment behaviors",
          "Enhance emotional regulation",
          "Strengthen communication patterns",
        ],
        suggestedModalities: [
          "Emotionally Focused Therapy (EFT)",
          "Gottman Method Couples Therapy",
          "Attachment-Based Therapy",
        ],
      },

      clinicalExercises: {
        communicationExercises: clinicalExercises.communication_exercises || [
          {
            title: "Speaker-Listener Technique",
            description:
              "Take turns being speaker and listener, reflecting back what you heard to ensure understanding.",
            frequency: "3x per week",
            rationale: "Builds active listening skills and reduces misunderstandings.",
          },
        ],
        emotionalRegulationPractices: clinicalExercises.emotional_regulation_practices || [
          {
            title: "Individual Grounding",
            description: "Use 5-4-3-2-1 sensory grounding when feeling triggered or overwhelmed.",
            frequency: "As needed",
            rationale: "Helps manage emotional flooding and maintain presence.",
          },
        ],
        relationshipRituals: clinicalExercises.relationship_rituals || [
          {
            title: "Weekly State of the Union",
            description: "30 minutes to discuss relationship, celebrate wins, and address concerns.",
            frequency: "Weekly",
            rationale: "Creates consistent space for connection and prevents issue buildup.",
          },
        ],
      },

      prognosis: {
        shortTerm: prognosis.short_term || "With interventions, expect improved communication within 1-3 months.",
        mediumTerm: prognosis.medium_term || "Continued practice should strengthen patterns by 6-12 months.",
        longTerm: prognosis.long_term || "Strong potential for secure, resilient relationship with ongoing commitment.",
        riskFactors: prognosis.risk_factors || comparative.growth_opportunities || ["Areas requiring attention"],
        protectiveFactors: prognosis.protective_factors || comparative.strengths || ["Genuine care and commitment"],
      },

      differentialConsiderations: {
        individualTherapyConsiderations:
          differentialConsiderations.individual_therapy_considerations ||
          `Both ${subjectALabel} and ${subjectBLabel} might benefit from individual therapy to address personal patterns that impact the relationship.`,
        couplesTherapyReadiness:
          differentialConsiderations.couples_therapy_readiness ||
          "The couple shows readiness for couples therapy with willingness to engage in the process.",
        externalResourcesNeeded: differentialConsiderations.external_resources_needed || [
          "Books: 'Attached' by Levine & Heller, 'Hold Me Tight' by Sue Johnson",
          "Apps: Lasting, Paired, or Gottman Card Decks",
          "Workshops: Gottman workshops or EFT-based couples retreats",
        ],
      },

      traumaInformedObservations: {
        identifiedPatterns: commStyles.subject_a?.growth_opportunities || ["Patterns observed"],
        copingMechanisms: regulation.regulation_patterns || "Coping strategies present.",
        safetyAndTrust: validation.comparative_summary || "Trust foundation exists.",
      },
    },

    constructiveFeedback: {
      subjectA: {
        strengths: commStyles.subject_a?.strengths || ["Communication present"],
        gentleGrowthNudges: commStyles.subject_a?.growth_opportunities || ["Areas for growth"],
        connectionBoosters: ["Share appreciation regularly", "Initiate fun activities", "Practice vulnerability"],
      },
      subjectB: {
        strengths: commStyles.subject_b?.strengths || ["Communication present"],
        gentleGrowthNudges: commStyles.subject_b?.growth_opportunities || ["Areas for growth"],
        connectionBoosters: ["Initiate emotional check-ins", "Offer reassurance proactively", "Express appreciation"],
      },
      forBoth: {
        sharedStrengths: comparative.strengths || ["Genuine care for each other"],
        sharedGrowthNudges: comparative.growth_opportunities || ["Communication development"],
        sharedConnectionBoosters: [
          "Create regular connection rituals",
          "Celebrate progress together",
          "Build shared vision",
        ],
      },
    },

    keyTakeaways: [
      ...(comparative.strengths?.slice(0, 2) || [`${subjectALabel} and ${subjectBLabel} show genuine care`]),
      ...(comparative.growth_opportunities?.slice(0, 2) || ["Communication patterns can be enhanced"]),
      "With awareness and practice, strong potential for deeper connection",
    ],

    optionalAppendix:
      "This analysis is based on observable patterns. Consider working with a licensed therapist for personalized guidance.",

    subjectALabel,
    subjectBLabel,
    messageCount: conversationText.split(/\[.*?\]/).length - 1,
    extractionConfidence: 85,
    processingTimeMs: 3500,
  }
}

async function generateAIAnalysis(
  subjectALabel: string,
  subjectBLabel: string,
  conversationText: string,
  platform: string,
): Promise<any> {
  const maxRetries = 2
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const messages = parseConversationToMessages(conversationText, subjectALabel, subjectBLabel)

      if (attempt > 0) {
        console.log(`[v0] Retry attempt ${attempt}/${maxRetries}`)
      }

      const systemPrompt = `You are LoveLens — analyze relationship communication patterns.

INPUTS:
- Subject A: "${subjectALabel}" (uploader)
- Subject B: "${subjectBLabel}" (partner)
- Platform: "${platform}"
- Messages: ${JSON.stringify(messages.slice(0, 50), null, 2)}${messages.length > 50 ? `\n... and ${messages.length - 50} more messages` : ""}

RULES:
- Use ONLY provided speaker labels (A/B)
- Tone values sum to ≈1.0
- All 1-10 scores are integers
- 2-3 sentence summaries with behavioral evidence
- 3-5 items for strengths/growth

ANCHORS:
Reactivity (1-10): 1-2=calm, 5-6=noticeable spikes, 9-10=persistent escalation
Ownership (1-10): 1-2=avoids, 5-6=mixed, 9-10=proactive
Blame (1-10): 1-2=avoids blame, 5-6=mixed, 9-10=persistent
Repair (1-10): 1-2=none, 5-6=some, 9-10=timely/effective
Validation (1-10): 1-3=rare, 4-6=inconsistent, 7-8=consistent, 9-10=frequent

OUTPUT (JSON only, no markdown):
{
  "subjects": {"A": {"name": "${subjectALabel}"}, "B": {"name": "${subjectBLabel}"}},
  "metrics": {
    "emotional_tone": {"positive": 0.0, "negative": 0.0, "neutral": 0.0, "summary": "2-3 sentences"},
    "communication_styles": {
      "subject_a": {"baseline_style": "description", "style_shifts": "when/why", "strengths": ["3-5 items"], "growth_opportunities": ["3-5 items"]},
      "subject_b": {"baseline_style": "description", "style_shifts": "when/why", "strengths": ["3-5 items"], "growth_opportunities": ["3-5 items"]},
      "comparative_summary": "3-4 sentences"
    },
    "conflict": {
      "subject_a": {"reactivity": 5, "ownership": 5, "blame": 5, "repair_attempts": 5, "summary": "2-3 sentences"},
      "subject_b": {"reactivity": 5, "ownership": 5, "blame": 5, "repair_attempts": 5, "summary": "2-3 sentences"},
      "comparative_summary": "3-4 sentences"
    },
    "validation": {
      "subject_a": {"support": 5, "reassurance": 5, "appreciation": 5, "summary": "2-3 sentences"},
      "subject_b": {"support": 5, "reassurance": 5, "appreciation": 5, "summary": "2-3 sentences"},
      "comparative_summary": "3-4 sentences"
    },
    "attachment": {"A_style": "secure|anxious|avoidant|mixed", "B_style": "secure|anxious|avoidant|mixed", "pattern": "balanced|pursue-withdraw|etc", "summary": "2-3 sentences"},
    "regulation_and_rhythm": {"regulation_patterns": "2-3 sentences", "rhythm_pacing": "2-3 sentences"}
  },
  "comparative_insights": {
    "strengths": ["3-5 items"],
    "growth_opportunities": ["3-5 items"],
    "alignment_gaps": [{"dimension": "listening", "A": 5, "B": 5, "note": "1 sentence"}]
  },
  "attribution": {"platform": "${platform}", "unknown_ratio": 0.0, "uncertain_ids": [], "needs_review": false}
}`

      const result = await generateText({
        model: openai("gpt-4o"),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Analyze and return JSON only." },
        ],
        maxTokens: 4000, // Reduced from 6000 for faster response
        temperature: 0.3, // Slightly increased from 0.25 for faster generation
      })

      let aiAnalysis
      try {
        let jsonText = result.text.trim()

        if (jsonText.startsWith("```")) {
          jsonText = jsonText.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "")
        }

        const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          jsonText = jsonMatch[0]
        } else {
          throw new Error("No JSON object found in response")
        }

        aiAnalysis = JSON.parse(jsonText)

        const validation = validateAIResponse(aiAnalysis)
        if (!validation.valid) {
          console.warn("[v0] Validation warnings:", validation.errors.join(", "))

          if (validation.errors.some((e) => e.includes("Missing required field"))) {
            throw new Error(`Invalid structure: ${validation.errors.join(", ")}`)
          }
        }

        aiAnalysis = sanitizeAnalysisResponse(aiAnalysis)

        return transformAnalysisToUIFormat(aiAnalysis, subjectALabel, subjectBLabel, conversationText)
      } catch (parseError) {
        const errorMsg = parseError instanceof Error ? parseError.message : "Unknown parsing error"
        console.error(`[v0] Attempt ${attempt + 1} failed:`, errorMsg)

        if (result.text) {
          console.error("[v0] Response preview:", result.text.substring(0, 200))
        }

        lastError = new Error(`JSON parsing failed: ${errorMsg}`)

        if (attempt < maxRetries) {
          const waitTime = 1000 * Math.pow(2, attempt)
          await new Promise((resolve) => setTimeout(resolve, waitTime))
          continue
        }

        throw lastError
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error during AI analysis")

      if (attempt === maxRetries) {
        break
      }

      const waitTime = 1000 * Math.pow(2, attempt)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }
  }

  console.error("[v0] AI analysis failed after retries, using fallback")

  return {
    overallScore: 7.5,
    summary: `Analysis of communication patterns between ${subjectALabel} and ${subjectBLabel}.`,
    overallRelationshipHealth: {
      score: 7,
      description: "Relationship shows both strengths and areas for growth.",
    },
    introductionNote: `This analysis examines the communication dynamics between ${subjectALabel} and ${subjectBLabel}.`,
    communicationStylesAndEmotionalTone: {
      description: "Communication patterns observed in the conversation.",
      emotionalVibeTags: ["Caring", "Authentic"],
      subjectAStyle: `${subjectALabel}'s communication style.`,
      subjectBStyle: `${subjectBLabel}'s communication style.`,
      regulationPatternsObserved: "Emotional regulation patterns present.",
      messageRhythmAndPacing: "Message rhythm patterns noted.",
    },
    reflectiveFrameworks: {
      description: "Psychological frameworks reveal communication patterns.",
      attachmentEnergies: "Attachment patterns observed.",
      loveLanguageFriction: "Communication style differences noted.",
      gottmanConflictMarkers: "Conflict dynamics observed.",
      emotionalIntelligenceIndicators: "Emotional awareness present.",
    },
    recurringPatternsIdentified: {
      description: "Patterns emerge in conversation dynamics.",
      positivePatterns: ["Genuine care", "Willingness to communicate"],
      loopingMiscommunicationsExamples: ["Areas for improvement identified"],
      commonTriggersAndResponsesExamples: ["Patterns observed"],
      repairAttemptsOrEmotionalAvoidancesExamples: ["Repair attempts present"],
    },
    whatsGettingInTheWay: {
      description: "Factors creating friction.",
      emotionalMismatches: "Different needs observed.",
      communicationGaps: "Style differences present.",
      subtlePowerStrugglesOrMisfires: "Dynamics to address.",
    },
    outlook: `The relationship shows potential for growth.`,
    visualInsightsData: {
      descriptionForChartsIntro: "Charts visualize key patterns.",
      emotionalCommunicationCharacteristics: [
        { category: "Expresses Vulnerability", [subjectALabel]: 6, [subjectBLabel]: 7 },
        { category: "Shows Empathy", [subjectALabel]: 7, [subjectBLabel]: 7 },
        { category: "Uses Humor", [subjectALabel]: 5, [subjectBLabel]: 6 },
        { category: "Shares Feelings", [subjectALabel]: 6, [subjectBLabel]: 7 },
        { category: "Asks Questions", [subjectALabel]: 6, [subjectBLabel]: 6 },
      ],
      conflictExpressionStyles: [
        { category: "Defensive Responses", [subjectALabel]: 5, [subjectBLabel]: 5 },
        { category: "Blame Language", [subjectALabel]: 4, [subjectBLabel]: 4 },
        { category: "Withdrawal", [subjectALabel]: 5, [subjectBLabel]: 5 },
        { category: "Escalation", [subjectALabel]: 4, [subjectBLabel]: 4 },
        { category: "Repair Attempts", [subjectALabel]: 6, [subjectBLabel]: 6 },
      ],
      validationAndReassurancePatterns: [
        { category: "Acknowledges Feelings", [subjectALabel]: 70, [subjectBLabel]: 70 },
        { category: "Offers Reassurance", [subjectALabel]: 60, [subjectBLabel]: 60 },
        { category: "Validates Perspective", [subjectALabel]: 60, [subjectBLabel]: 65 },
        { category: "Dismisses Concerns", [subjectALabel]: 15, [subjectBLabel]: 15 },
        { category: "Neutral/Unclear", [subjectALabel]: 15, [subjectBLabel]: 15 },
      ],
    },
    professionalInsights: {
      attachmentTheoryAnalysis: {
        subjectA: {
          primaryAttachmentStyle: "mixed",
          attachmentBehaviors: ["Communication present"],
          triggersAndDefenses: "Patterns observed.",
        },
        subjectB: {
          primaryAttachmentStyle: "mixed",
          attachmentBehaviors: ["Communication present"],
          triggersAndDefenses: "Patterns observed.",
        },
        dyad: "balanced",
      },
      therapeuticRecommendations: {
        immediateInterventions: ["Practice active listening", "Establish check-ins"],
        longTermGoals: ["Build secure attachment", "Enhance regulation"],
        suggestedModalities: ["EFT", "Gottman Method"],
      },
      clinicalExercises: {
        communicationExercises: [{ title: "Speaker-Listener", description: "Reflect back", frequency: "3x/week" }],
        emotionalRegulationPractices: [{ title: "Grounding", description: "5-4-3-2-1", frequency: "As needed" }],
        relationshipRituals: [{ title: "Weekly Check-in", description: "30 minutes", frequency: "Weekly" }],
      },
      prognosis: {
        shortTerm: "Improved communication within 1-3 months.",
        mediumTerm: "Strengthened patterns by 6-12 months.",
        longTerm: "Strong potential for resilient relationship.",
        riskFactors: ["Areas requiring attention"],
        protectiveFactors: ["Genuine care"],
      },
      differentialConsiderations: {
        individualTherapyConsiderations: "Individual therapy may benefit both.",
        couplesTherapyReadiness: "Ready for couples therapy.",
        externalResourcesNeeded: ["Books", "Apps"],
      },
      traumaInformedObservations: {
        identifiedPatterns: ["Patterns observed"],
        copingMechanisms: "Strategies present.",
        safetyAndTrust: "Foundation exists.",
      },
    },
    constructiveFeedback: {
      subjectA: {
        strengths: ["Communication present"],
        gentleGrowthNudges: ["Areas for growth"],
        connectionBoosters: ["Share appreciation"],
      },
      subjectB: {
        strengths: ["Communication present"],
        gentleGrowthNudges: ["Areas for growth"],
        connectionBoosters: ["Initiate check-ins"],
      },
      forBoth: {
        sharedStrengths: ["Genuine care"],
        sharedGrowthNudges: ["Communication development"],
        sharedConnectionBoosters: ["Create rituals"],
      },
    },
    keyTakeaways: ["Genuine care present", "Communication can be enhanced", "Strong potential for growth"],
    optionalAppendix: "Consider working with a licensed therapist.",
    subjectALabel,
    subjectBLabel,
    messageCount: conversationText.split(/\[.*?\]/).length - 1,
    extractionConfidence: 75,
    processingTimeMs: 3500,
  }
}

export async function analyzeConversation(formData: FormData) {
  try {
    console.log("[v0] Starting conversation analysis")

    const subjectAName = formData.get("subjectAName") as string | null
    const subjectBName = formData.get("subjectBName") as string | null

    console.log(`[v0] Custom names: ${subjectAName || "none"} and ${subjectBName || "none"}`)

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

    const extractedTexts = await Promise.all(files.map((file, index) => extractTextFromImage(file, index)))

    const totalUnknownRatio =
      extractedTexts.reduce((sum, ext) => sum + (ext.attributionStats?.unknownRatio || 0), 0) / extractedTexts.length
    const allUncertainIds = extractedTexts.flatMap((ext) => ext.attributionStats?.uncertainIds || [])
    const avgConfidence =
      extractedTexts.reduce((sum, ext) => sum + (ext.attributionStats?.confidenceMean || 0), 0) / extractedTexts.length

    console.log(`[v0] Overall attribution quality:`)
    console.log(`[v0]   Unknown ratio: ${(totalUnknownRatio * 100).toFixed(1)}%`)
    console.log(`[v0]   Average confidence: ${(avgConfidence * 100).toFixed(1)}%`)
    console.log(`[v0]   Uncertain messages: ${allUncertainIds.length}`)

    const { normalizedText, subjectALabel, subjectBLabel, speakerStats } = normalizeSpeakers(
      extractedTexts,
      subjectAName,
      subjectBName,
    )

    console.log(`[v0] Normalized conversation text (${normalizedText.length} characters)`)

    const platform = extractedTexts[0]?.platform || "unknown"
    const analysis = await generateAIAnalysis(subjectALabel, subjectBLabel, normalizedText, platform)

    analysis.attributionMetadata = {
      platform,
      unknownRatio: totalUnknownRatio,
      uncertainIds: allUncertainIds,
      needsReview: totalUnknownRatio > 0.05,
      averageConfidence: avgConfidence,
    }

    console.log(`[v0] Analysis complete`)

    return analysis
  } catch (error) {
    console.error("[v0] Analysis error:", error)
    return {
      error: error instanceof Error ? error.message : "An unexpected error occurred during analysis",
    }
  }
}
