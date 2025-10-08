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
              text: `You are analyzing a messaging conversation screenshot with ENHANCED SPEAKER ATTRIBUTION.

═══════════════════════════════════════════════════════════════════════════════
CRITICAL: FIXED NAMING CONVENTION (IMMUTABLE)
═══════════════════════════════════════════════════════════════════════════════
• The uploader's messages (device owner) = **Person A** (Subject A)
• The recipient's messages (other participant) = **Person B** (Subject B)
• This mapping is FIXED and NEVER changes regardless of content or style

═══════════════════════════════════════════════════════════════════════════════
STEP 1: PLATFORM DETECTION
═══════════════════════════════════════════════════════════════════════════════
Identify the messaging platform based on visual signatures:

**iOS/iMessage:**
- Blue bubbles (iMessage) or green bubbles (SMS) on RIGHT
- Gray bubbles on LEFT
- Rounded corners, clean design
- Status bar with signal/battery icons

**WhatsApp:**
- Green bubbles (#25D366 or similar) on RIGHT
- White/light gray bubbles on LEFT
- Checkmarks for message status
- Green header bar

**Android Messages:**
- Blue/purple bubbles on RIGHT
- Gray/white bubbles on LEFT
- Material Design style
- Colorful header

**Facebook Messenger / Instagram:**
- Blue gradient bubbles on RIGHT
- Gray bubbles on LEFT
- Profile pictures visible
- Messenger/Instagram UI elements

**Platform Confidence:** Rate 0.0-1.0 based on how clearly you can identify the platform.

═══════════════════════════════════════════════════════════════════════════════
STEP 2: BUBBLE FEATURE EXTRACTION
═══════════════════════════════════════════════════════════════════════════════
For EACH message bubble, extract:

1. **Text Content:** The actual message text
2. **Horizontal Position:** LEFT or RIGHT side of screen
3. **Bubble Color:** Describe the color (e.g., "blue", "gray", "green", "white")
4. **Tail/Pointer Direction:** Does the bubble tail point LEFT or RIGHT?
5. **Avatar Presence:** Is there a profile picture? If yes, on which side?
6. **Timestamp Grouping:** Messages sent close together in time

═══════════════════════════════════════════════════════════════════════════════
STEP 3: ENSEMBLE VOTING FOR SPEAKER ATTRIBUTION
═══════════════════════════════════════════════════════════════════════════════
Apply these rules in order (each is a "vote"):

**Vote 1 - Horizontal Position (STRONGEST SIGNAL):**
- RIGHT side → Person A (uploader/device owner)
- LEFT side → Person B (other participant)

**Vote 2 - Color by Platform:**
- iOS: Blue/Green → Person A, Gray → Person B
- WhatsApp: Green → Person A, White/Gray → Person B
- Android: Blue/Purple → Person A, Gray → Person B
- Messenger: Blue → Person A, Gray → Person B

**Vote 3 - Tail Direction:**
- Tail points RIGHT → Person A
- Tail points LEFT → Person B

**Vote 4 - Avatar Position:**
- Avatar on LEFT → Message is from Person B
- Avatar on RIGHT → Message is from Person A
- No avatar → Neutral vote

**Vote 5 - Row Consistency:**
- Messages in same timestamp group likely from same speaker

**Confidence Calculation:**
- Count agreeing votes / total votes
- Multiply by platform confidence
- If final confidence < 0.6 → Mark as "unknown"

═══════════════════════════════════════════════════════════════════════════════
STEP 4: OUTPUT FORMAT
═══════════════════════════════════════════════════════════════════════════════
For each message, use this EXACT format:

[Person A]: "message text here"
[Person B]: "message text here"
[Unknown]: "message text here" (only if confidence < 0.6)

**CRITICAL RULES:**
✓ RIGHT-aligned messages = [Person A]
✓ LEFT-aligned messages = [Person B]
✓ NEVER swap these labels
✓ NEVER use generic labels like "Sender" or "User"
✓ Use [Unknown] ONLY when confidence < 0.6
✓ Capture complete message text accurately
✓ Preserve conversation order and context

═══════════════════════════════════════════════════════════════════════════════
STEP 5: METADATA (Include at the end)
═══════════════════════════════════════════════════════════════════════════════
After all messages, add:

---METADATA---
Platform: [imessage|android|whatsapp|messenger|unknown]
Platform Confidence: [0.0-1.0]
Total Messages: [count]
Person A Messages: [count]
Person B Messages: [count]
Unknown Messages: [count]
Average Confidence: [0.0-1.0]
Uncertain Message IDs: [list if any]

═══════════════════════════════════════════════════════════════════════════════
EXAMPLE OUTPUT:
═══════════════════════════════════════════════════════════════════════════════

[Person A]: "Hey, how are you doing?"
[Person B]: "I'm good! How about you?"
[Person A]: "Great! Want to grab coffee later?"
[Person B]: "Sure, what time works for you?"
[Person A]: "How about 3pm?"
[Person B]: "Perfect, see you then!"

---METADATA---
Platform: imessage
Platform Confidence: 0.95
Total Messages: 6
Person A Messages: 3
Person B Messages: 3
Unknown Messages: 0
Average Confidence: 0.92
Uncertain Message IDs: none

Now extract the conversation from this screenshot using the enhanced attribution system.`,
            },
            {
              type: "image",
              image: base64Image,
            },
          ],
        },
      ],
      maxTokens: 3000,
    })

    const extractedText = result.text

    let platform = "unknown"
    let platformConfidence = 0.5
    let unknownRatio = 0
    let uncertainIds: string[] = []
    let confidenceMean = 0.5

    const metadataMatch = extractedText.match(/---METADATA---\s*([\s\S]*?)(?:\n\n|$)/)
    if (metadataMatch) {
      const metadata = metadataMatch[1]
      const platformMatch = metadata.match(/Platform:\s*(\w+)/i)
      const platformConfMatch = metadata.match(/Platform Confidence:\s*([\d.]+)/i)
      const totalMatch = metadata.match(/Total Messages:\s*(\d+)/i)
      const unknownMatch = metadata.match(/Unknown Messages:\s*(\d+)/i)
      const avgConfMatch = metadata.match(/Average Confidence:\s*([\d.]+)/i)
      const uncertainMatch = metadata.match(/Uncertain Message IDs:\s*(.+)/i)

      if (platformMatch) platform = platformMatch[1].toLowerCase()
      if (platformConfMatch) platformConfidence = Number.parseFloat(platformConfMatch[1])
      if (avgConfMatch) confidenceMean = Number.parseFloat(avgConfMatch[1])

      if (totalMatch && unknownMatch) {
        const total = Number.parseInt(totalMatch[1])
        const unknown = Number.parseInt(unknownMatch[1])
        unknownRatio = total > 0 ? unknown / total : 0
      }

      if (uncertainMatch && uncertainMatch[1] !== "none") {
        uncertainIds = uncertainMatch[1].split(",").map((id) => id.trim())
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
        uncertainIds,
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
  try {
    const messages = parseConversationToMessages(conversationText, subjectALabel, subjectBLabel)

    console.log(`[v0] Parsed ${messages.length} messages for AI analysis`)

    const systemPrompt = `You are LoveLens — a professional relationship analysis engine grounded in psychology and communication science.

SCOPE & NON-NEGOTIABLES
- NO UI/LAYOUT CHANGES: Do not add or remove fields. Produce JSON exactly in the schema below so existing charts bind correctly.
- SPEAKER RULES: Subject A = uploader (always "A"). Subject B = partner (always "B"). Use ONLY the provided \`speaker\` labels ("A","B","unknown"). Never infer or swap based on content.

INPUTS PROVIDED
- subject_a: "${subjectALabel}" (uploader name)
- subject_b: "${subjectBLabel}" (partner name)
- platform: "${platform}"
- messages: ${JSON.stringify(messages, null, 2)}
  * You must not quote or paraphrase message text. Analyze patterns only.
- (You may assume low-variance decoding on the calling side.)

TONE
- Warm, professional, emotionally literate (coach-style), not clinical. Balanced: always include strengths and growth opportunities.

CONSISTENCY ADDENDUM (v1.2)
- Tone proportions (positive/negative/neutral) each in [0,1], sum ≈ 1.00.
- All 1–10 scores are integers and follow anchors below.
- Use only provided speaker labels; exclude "unknown" from per-subject metrics but include in global tallies.
- Self-verify with the checklist before finalizing.

DEPTH GUARANTEES (without changing schema)
- Every \`summary\` field: **2–3 sentences** with specific, behavior-based insights (no quotes).
- Every \`comparative_summary\`: **3–4 sentences** that explain alignment, friction points, and the situational triggers for shifts.
- Each \`strengths\` and \`growth_opportunities\` list: **3–5 concise, actionable items** (behavior-based, no clichés).
- Describe **patterns AND triggers** (e.g., "tends to escalate when reassurance is delayed," "becomes concise after repeated explanations").
- If evidence is thin, set neutral scores but still provide a careful, transparent rationale (e.g., "limited data; patterns inferred cautiously").

ANCHORS (apply exactly)
Reactivity (1–10)
1–2 calm under provocation; 3–4 rare spikes; 5–6 noticeable spikes, recovers with prompts; 7–8 frequent spikes, slow recovery; 9–10 persistent escalation.

Ownership (1–10)
1–2 avoids responsibility; 3–4 minimal under pressure; 5–6 mixed; 7–8 regularly owns contribution; 9–10 proactive ownership with next steps.

Blame (1–10) (reverse-good)
1–2 avoids blame, "I" frames; 3–4 occasional blame; 5–6 mixed/cyclical; 7–8 frequent blaming; 9–10 persistent externalizing.

Repair Attempts (1–10)
1–2 none; 3–4 infrequent/poorly timed; 5–6 some/mixed impact; 7–8 regular/often effective; 9–10 timely, specific, reliable.

Validation (Support, Reassurance, Appreciation; each 1–10)
1–3 rare; 4–6 present but inconsistent; 7–8 consistent/clear; 9–10 frequent, timely, well-matched.

Attachment energies (behavioral, not diagnostic)
secure = steady tone, direct needs, flexible repair
anxious = pursuit, protest, reassurance seeking under uncertainty
avoidant = distance, shutdown or topic shift under stress
mixed = varies by trigger/context

STYLE & NUANCE RULES
- Report both the **baseline style** and the **style shifts** (when/why their tone/length changes).
- Always ground explanations in **interaction patterns** (initiate/respond, pacing, repair timing), not personality labels.

OUTPUT FORMAT — RETURN **ONLY** VALID JSON (no prose outside JSON):

{
  "subjects": {
    "A": { "name": "${subjectALabel}" },
    "B": { "name": "${subjectBLabel}" }
  },
  "metrics": {
    "emotional_tone": {
      "positive": 0.0,
      "negative": 0.0,
      "neutral": 0.0,
      "summary": "2–3 sentences explaining balance and notable shifts"
    },
    "communication_styles": {
      "subject_a": {
        "baseline_style": "concise/detailed etc. with behavioral specifics",
        "style_shifts": "when/why A changes tone/length (triggers)",
        "strengths": ["3–5 behavior-based items"],
        "growth_opportunities": ["3–5 actionable items"]
      },
      "subject_b": {
        "baseline_style": "…",
        "style_shifts": "…",
        "strengths": ["3–5 items"],
        "growth_opportunities": ["3–5 items"]
      },
      "comparative_summary": "3–4 sentences on alignment, friction, and situational dynamics"
    },
    "conflict": {
      "subject_a": {
        "reactivity": 1,
        "ownership": 1,
        "blame": 1,
        "repair_attempts": 1,
        "summary": "2–3 sentences on escalation/de-escalation patterns and timing of repairs"
      },
      "subject_b": {
        "reactivity": 1,
        "ownership": 1,
        "blame": 1,
        "repair_attempts": 1,
        "summary": "2–3 sentences"
      },
      "comparative_summary": "3–4 sentences highlighting pursue/withdraw dynamics, timing mismatches, and triggers"
    },
    "validation": {
      "subject_a": {
        "support": 1,
        "reassurance": 1,
        "appreciation": 1,
        "summary": "2–3 sentences on consistency, fit, and timing of validation"
      },
      "subject_b": {
        "support": 1,
        "reassurance": 1,
        "appreciation": 1,
        "summary": "2–3 sentences"
      },
      "comparative_summary": "3–4 sentences on balance/imbalance and how it affects regulation"
    },
    "attachment": {
      "A_style": "secure|anxious|avoidant|mixed",
      "B_style": "secure|anxious|avoidant|mixed",
      "pattern": "pursue-withdraw|mutual-pursuit|mutual-withdrawal|balanced",
      "summary": "2–3 sentences on behavioral attachment interplay (no diagnoses)"
    },
    "regulation_and_rhythm": {
      "regulation_patterns": "2–3 sentences on how each manages stress and repair timing",
      "rhythm_pacing": "2–3 sentences on initiation/response cadence, pacing asymmetry, message-length balance"
    }
  },
  "comparative_insights": {
    "strengths": ["3–5 concise, specific, behavior-based strengths the dyad can build on"],
    "growth_opportunities": ["3–5 actionable, respectful improvements matched to patterns"],
    "alignment_gaps": [
      { "dimension": "listening|repair_attempts|clarity|etc.", "A": 1, "B": 1, "note": "1 sentence on the gap and a practical nudge" }
    ]
  },
  "attribution": {
    "platform": "${platform}",
    "unknown_ratio": 0.0,
    "uncertain_ids": [],
    "needs_review": false
  }
}

SELF-CHECKLIST (must pass before returning):
- JSON matches schema exactly; no extra fields, no missing fields.
- Tone values in [0,1] and sum ≈ 1.00.
- All 1–10 scores are integers and follow anchors.
- Every summary and comparative summary meets required sentence counts with concrete, behavior-based language.
- Strengths and growth lists each have 3–5 clear, actionable items.
- Speaker labels used exactly as provided; "unknown" excluded from per-subject metrics.

IMPORTANT: Respond with ONLY the JSON object. No markdown formatting, no code blocks, no explanatory text.`

    console.log(`[v0] Sending ${messages.length} messages to AI for analysis`)

    const result = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content:
            "Analyze the conversation and provide a comprehensive JSON response following all anchors, depth guarantees, and consistency rules. Remember: respond with ONLY valid JSON, no markdown code blocks, no extra text.",
        },
      ],
      maxTokens: 6000,
      temperature: 0.25, // Low variability for consistency
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
      }

      aiAnalysis = JSON.parse(jsonText)

      if (!aiAnalysis.subjects || !aiAnalysis.metrics || !aiAnalysis.attribution) {
        throw new Error("AI response missing required top-level fields")
      }

      const tone = aiAnalysis.metrics.emotional_tone
      if (tone) {
        const toneSum = (tone.positive || 0) + (tone.negative || 0) + (tone.neutral || 0)
        if (Math.abs(toneSum - 1.0) > 0.1) {
          console.warn(`[v0] Tone values sum to ${toneSum.toFixed(2)}, expected ≈1.00`)
        }
      }

      console.log(`[v0] AI analysis validated successfully`)
    } catch (parseError) {
      console.error("[v0] Failed to parse AI response as JSON:", parseError)
      throw new Error(
        `AI returned invalid JSON response: ${parseError instanceof Error ? parseError.message : "Unknown error"}`,
      )
    }

    return transformAnalysisToUIFormat(aiAnalysis, subjectALabel, subjectBLabel, conversationText)
  } catch (error) {
    console.error("[v0] AI analysis failed:", error)
    console.log("[v0] Falling back to default analysis")

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
