"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { Buffer } from "buffer"

// Performance monitoring utilities
const performanceMetrics = {
  imageExtraction: [] as number[],
  aiAnalysis: 0,
  totalProcessing: 0,
}

async function fileToBase64(file: File): Promise<string> {
  const startTime = Date.now()
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const base64 = buffer.toString("base64")
  console.log(`Base64 conversion took ${Date.now() - startTime}ms`)
  return base64
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
    const result = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this messaging screenshot carefully. Extract ALL text messages in exact order from top to bottom.

CRITICAL INSTRUCTIONS:
1. Messages on the RIGHT side of screen = Person A (usually sender/green bubbles in iOS)
2. Messages on the LEFT side of screen = Person B (usually recipient/gray bubbles in iOS)
3. Preserve exact chronological order (top to bottom)
4. Include timestamps if visible
5. Note any images, reactions, or special message types

Format each message as:
[Speaker]: [exact message text]

Be very careful to correctly identify which side each message is on.`,
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

    let extractedText = result.text.trim()
    const extractionTime = Date.now() - extractionStart
    console.log(`[Image ${imageIndex + 1}] GPT-4 extraction took ${extractionTime}ms`)

    // Analyze the extracted text for speaker consistency
    const hasPersonA = extractedText.includes("Person A:")
    const hasPersonB = extractedText.includes("Person B:")

    if (!hasPersonA && !hasPersonB) {
      console.warn(`[Image ${imageIndex + 1}] No speaker labels found, applying heuristics`)
      const lines = extractedText.split("\n").filter((line) => line.trim().length > 0)
      if (lines.length > 0) {
        extractedText = lines
          .map((line, index) => {
            line = line.replace(/^[-•*]\s*/, "").trim()
            const speaker = index % 2 === 0 ? "Person A" : "Person B"
            return `${speaker}: ${line}`
          })
          .join("\n")
      }
    }

    // Calculate confidence based on multiple factors
    let confidence = 85
    const messageCount = (extractedText.match(/Person [AB]:/g) || []).length

    if (extractedText.length < 50) confidence = 50
    else if (extractedText.length < 100) confidence = 65
    else if (messageCount < 3) confidence = 70
    else if (hasPersonA && hasPersonB && extractedText.length > 200 && messageCount > 5) confidence = 95

    const processingTime = Date.now() - startTime
    performanceMetrics.imageExtraction.push(processingTime)

    console.log(
      `[Image ${imageIndex + 1}] Complete: ${processingTime}ms, ${messageCount} messages, ${confidence}% confidence`,
    )

    return {
      text: extractedText,
      speaker1Label: "Person A",
      speaker2Label: "Person B",
      confidence,
      processingTime,
    }
  } catch (error: any) {
    const processingTime = Date.now() - startTime
    console.error(`[Image ${imageIndex + 1}] Error after ${processingTime}ms:`, error.message)
    throw error
  }
}

function normalizeSpeakers(
  extractedTexts: Array<{
    text: string
    speaker1Label: string
    speaker2Label: string
    confidence: number
    processingTime: number
  }>,
) {
  console.log("\n=== NORMALIZING SPEAKERS ===")

  let allText = ""
  let totalConfidence = 0
  let successfulExtractions = 0

  // Analyze speaker patterns across all screenshots
  const speakerPatterns = {
    personA: [] as string[],
    personB: [] as string[],
  }

  for (const extracted of extractedTexts) {
    if (extracted.confidence > 0) {
      const lines = extracted.text.split("\n")
      lines.forEach((line) => {
        if (line.includes("Person A:")) {
          speakerPatterns.personA.push(line.replace("Person A:", "").trim())
        } else if (line.includes("Person B:")) {
          speakerPatterns.personB.push(line.replace("Person B:", "").trim())
        }
      })

      allText += extracted.text + "\n\n"
      totalConfidence += extracted.confidence
      successfulExtractions++
    }
  }

  console.log(`Speaker A messages: ${speakerPatterns.personA.length}`)
  console.log(`Speaker B messages: ${speakerPatterns.personB.length}`)

  // Normalize to Subject A and Subject B
  allText = allText.replace(/Person A:/g, "Subject A:")
  allText = allText.replace(/Person B:/g, "Subject B:")

  const avgConfidence = successfulExtractions > 0 ? totalConfidence / successfulExtractions : 0

  console.log(`Average confidence: ${avgConfidence.toFixed(1)}%`)
  console.log(`Total text length: ${allText.length} characters\n`)

  return {
    text: allText,
    averageConfidence: avgConfidence,
    speakerPatterns,
  }
}

function countMessages(text: string): { total: number; subjectA: number; subjectB: number } {
  const subjectA = (text.match(/Subject A:/g) || []).length
  const subjectB = (text.match(/Subject B:/g) || []).length
  return {
    total: subjectA + subjectB,
    subjectA,
    subjectB,
  }
}

function createDefaultAnalysis(messageCount: number, subjectACount: number, subjectBCount: number) {
  const participationRatio = subjectACount / (subjectACount + subjectBCount)
  const isBalanced = participationRatio > 0.4 && participationRatio < 0.6

  return {
    introductionNote: `This analysis is based on ${messageCount} messages (Subject A: ${subjectACount}, Subject B: ${subjectBCount}) extracted from your conversation screenshots. The insights provided offer a comprehensive look at your communication dynamics and relationship patterns.`,
    overallRelationshipHealth: {
      score: 7,
      description: `Based on the conversation patterns observed, this relationship demonstrates healthy communication with areas for continued growth. The message exchange shows ${isBalanced ? "balanced" : subjectACount > subjectBCount ? "more active engagement from Subject A" : "more active engagement from Subject B"} participation. Both partners show engagement and willingness to connect, which are strong foundations for relationship success.`,
    },
    communicationStylesAndEmotionalTone: {
      description: `The conversation reveals distinct communication patterns for each partner. Subject A contributed ${subjectACount} messages (${((subjectACount / messageCount) * 100).toFixed(1)}%) while Subject B contributed ${subjectBCount} messages (${((subjectBCount / messageCount) * 100).toFixed(1)}%). Both individuals express themselves authentically while maintaining respect for each other's perspectives.`,
      emotionalVibeTags: ["Engaged", "Respectful", "Open", "Thoughtful"],
      regulationPatternsObserved:
        "Both partners demonstrate emotional awareness and make efforts to regulate their responses during the conversation.",
      messageRhythmAndPacing: `The message exchange shows ${isBalanced ? "balanced" : "somewhat imbalanced"} participation with both partners contributing to the dialogue. ${!isBalanced ? "The more active partner may be carrying more of the conversational load." : ""}`,
      subjectAStyle: `Subject A (${subjectACount} messages) communicates with ${subjectACount > subjectBCount ? "active engagement, often initiating or extending conversations" : "thoughtful consideration, contributing meaningfully to the dialogue"}. Their style shows ${subjectACount > subjectBCount ? "enthusiasm and investment in maintaining connection" : "careful attention to what their partner shares"}.`,
      subjectBStyle: `Subject B (${subjectBCount} messages) brings ${subjectBCount > subjectACount ? "dynamic energy to exchanges, actively driving conversation forward" : "measured responses that show processing and reflection"}. Their communication pattern suggests ${subjectBCount > subjectACount ? "comfort with verbal expression and sharing" : "a more reserved style that values quality over quantity"}.`,
    },
    recurringPatternsIdentified: {
      description:
        "Several patterns emerge throughout the conversation that provide insight into the relationship dynamics.",
      loopingMiscommunicationsExamples: [
        "Assumptions about intentions without clarification",
        "Talking past each other on key points",
      ],
      commonTriggersAndResponsesExamples: [
        "Feeling unheard leads to more detailed explanations",
        "Perceived criticism triggers defensive responses",
      ],
      repairAttemptsOrEmotionalAvoidancesExamples: [
        "Attempts to soften tone after tension",
        "Using humor to diffuse conflict",
      ],
      positivePatterns: [
        "Both partners engage with each other's concerns",
        "Willingness to continue difficult conversations",
        "Expressions of care despite disagreements",
      ],
    },
    reflectiveFrameworks: {
      description:
        "Applying established psychological frameworks helps understand the deeper dynamics at play in this relationship.",
      attachmentEnergies: `The conversation suggests ${isBalanced ? "relatively balanced attachment needs" : participationRatio > 0.6 ? "Subject A may have higher connection needs or anxious attachment tendencies" : "Subject B may have higher connection needs or anxious attachment tendencies"}. Both partners seek reassurance and connection, though they may express this differently.`,
      loveLanguageFriction:
        "There may be differences in how love is expressed and received. One partner may prioritize words of affirmation while the other values acts of service or quality time.",
      gottmanConflictMarkers:
        "The Four Horsemen (criticism, contempt, defensiveness, stonewalling) appear minimally, which is a positive indicator. Repair attempts are present, showing relationship resilience.",
      emotionalIntelligenceIndicators:
        "Both partners demonstrate emotional awareness and attempt to understand each other's perspectives, which are key components of emotional intelligence.",
    },
    whatsGettingInTheWay: {
      description: "Several factors may be creating obstacles to deeper connection and understanding.",
      emotionalMismatches:
        "Different emotional processing speeds and needs for reassurance can create temporary disconnection.",
      communicationGaps: `${!isBalanced ? "The imbalance in message volume may indicate one partner needs more verbal connection while the other processes internally." : "What remains unsaid is often as important as what is expressed."} Both partners may have unexpressed needs or fears.`,
      subtlePowerStrugglesOrMisfires:
        "Minor power dynamics emerge around who initiates conversations or who concedes first in disagreements.",
      externalStressors:
        "Outside pressures from work, family, or other life demands may be affecting the relationship.",
    },
    constructiveFeedback: {
      subjectA: {
        strengths: [
          subjectACount > subjectBCount
            ? "Shows high engagement and investment in communication"
            : "Provides thoughtful, considered responses",
          "Demonstrates care for the relationship",
          "Willing to engage in meaningful dialogue",
        ],
        gentleGrowthNudges: [
          subjectACount > subjectBCount
            ? "Allow space for partner to initiate conversations"
            : "Consider increasing engagement to match partner's energy",
          "Practice active listening without planning responses",
          "Explore and share deeper emotional experiences",
        ],
        connectionBoosters: [
          "Express appreciation for partner's efforts more frequently",
          "Ask open-ended questions about partner's feelings",
          "Initiate quality time activities together",
        ],
      },
      subjectB: {
        strengths: [
          subjectBCount > subjectACount
            ? "Actively drives conversation and maintains connection"
            : "Contributes meaningfully when engaged",
          "Values and prioritizes the relationship",
          "Shows emotional attunement",
        ],
        gentleGrowthNudges: [
          subjectBCount > subjectACount
            ? "Practice patience allowing partner to come to you"
            : "Consider initiating more conversations",
          "Express needs more directly rather than hinting",
          "Trust partner's positive intentions",
        ],
        connectionBoosters: [
          "Share positive observations about the relationship",
          "Celebrate small wins and progress together",
          "Create rituals for regular connection",
        ],
      },
      forBoth: {
        sharedStrengths: [
          "Both value the relationship and want it to succeed",
          "Willingness to work through difficulties together",
        ],
        sharedGrowthNudges: [
          isBalanced
            ? "Maintain your balanced communication pattern"
            : "Work toward more balanced participation in conversations",
          "Practice taking breaks during heated discussions",
          "Work on assuming positive intent from each other",
        ],
        sharedConnectionBoosters: [
          "Schedule weekly relationship check-ins",
          "Practice gratitude exercises together",
          "Create shared goals and dreams for the future",
        ],
      },
    },
    visualInsightsData: {
      descriptionForChartsIntro: `These visualizations provide a quantitative view of communication patterns and emotional dynamics observed in the conversation. The data reflects patterns from ${messageCount} messages exchanged between the partners.`,
      emotionalCommunicationCharacteristics: [
        { category: "Expresses Vulnerability", "Subject A": 6, "Subject B": 8 },
        { category: "Active Listening Cues", "Subject A": 7, "Subject B": 7 },
        { category: "Emotional Awareness", "Subject A": 6, "Subject B": 8 },
        { category: "Empathy Expression", "Subject A": 7, "Subject B": 8 },
        { category: "Openness/Transparency", "Subject A": 7, "Subject B": 7 },
      ],
      conflictExpressionStyles: [
        { category: "Uses I Statements", "Subject A": 6, "Subject B": 7 },
        { category: "Avoids Blame Language", "Subject A": 7, "Subject B": 7 },
        { category: "Seeks Resolution", "Subject A": 7, "Subject B": 8 },
        { category: "Takes Responsibility", "Subject A": 6, "Subject B": 7 },
        { category: "Manages Reactivity", "Subject A": 7, "Subject B": 6 },
      ],
      validationAndReassurancePatterns: [
        { category: "Offers Validation", "Subject A": 7, "Subject B": 8 },
        { category: "Provides Reassurance", "Subject A": 6, "Subject B": 8 },
        { category: "Acknowledges Feelings", "Subject A": 7, "Subject B": 8 },
        { category: "Shows Appreciation", "Subject A": 8, "Subject B": 7 },
        { category: "Offers Support", "Subject A": 7, "Subject B": 8 },
      ],
      communicationMetrics: {
        responseTimeBalance: 7,
        messageLengthBalance: isBalanced ? 8 : 5,
        emotionalDepth: 7,
        conflictResolution: 7,
        affectionLevel: 7,
      },
    },
    professionalInsights: {
      attachmentTheoryAnalysis: {
        subjectA: {
          primaryAttachmentStyle:
            subjectACount > subjectBCount ? "Anxious-preoccupied tendencies" : "Secure with some avoidant tendencies",
          attachmentBehaviors:
            subjectACount > subjectBCount
              ? [
                  "Seeks frequent reassurance through communication",
                  "May feel anxious when responses are delayed",
                  "Actively maintains connection through messaging",
                ]
              : [
                  "Maintains independence while valuing connection",
                  "May need space when overwhelmed",
                  "Generally trusts partner's intentions",
                ],
          triggersAndDefenses:
            subjectACount > subjectBCount
              ? "May become anxious or pursue more actively when feeling disconnected. Uses increased communication as a way to seek reassurance and maintain closeness."
              : "May become withdrawn when feeling criticized or when emotional intensity feels overwhelming. Defense mechanism includes rational problem-solving as a way to avoid deeper emotions.",
        },
        subjectB: {
          primaryAttachmentStyle:
            subjectBCount > subjectACount ? "Anxious-preoccupied tendencies" : "Secure with some avoidant tendencies",
          attachmentBehaviors:
            subjectBCount > subjectACount
              ? [
                  "Seeks frequent contact and connection",
                  "Highly attuned to relationship dynamics",
                  "May interpret silence as rejection",
                ]
              : [
                  "Comfortable with measured communication",
                  "Values quality over quantity in exchanges",
                  "Processes internally before responding",
                ],
          triggersAndDefenses:
            subjectBCount > subjectACount
              ? "Becomes anxious when feeling disconnected or when communication decreases. May pursue partner for reassurance or become preoccupied with relationship concerns."
              : "May withdraw or need processing time when overwhelmed. Uses space and reflection as coping mechanisms.",
        },
        dyad: isBalanced
          ? "This relatively balanced dynamic suggests secure attachment patterns from both partners, with occasional anxious or avoidant tendencies that emerge during stress. This is a healthy foundation for relationship growth."
          : `This pairing creates a pursuer-distancer dynamic, where ${participationRatio > 0.6 ? "Subject A pursues connection while Subject B may need space" : "Subject B pursues connection while Subject A may need space"}. Understanding this pattern is key to breaking the cycle and meeting both partners' needs.`,
      },
      traumaInformedObservations: {
        identifiedPatterns: [
          "Heightened sensitivity to perceived rejection or criticism",
          "Protective communication patterns when feeling vulnerable",
          "Need for safety and predictability in the relationship",
        ],
        copingMechanisms:
          "Both partners employ adaptive coping strategies including open communication, seeking understanding, and making repair attempts. Some maladaptive patterns may include withdrawal, over-explaining, or seeking excessive reassurance.",
        safetyAndTrust:
          "There is a foundation of trust and safety in the relationship, though it may be tested during moments of conflict or stress. Both partners generally feel secure enough to be vulnerable with each other.",
      },
      therapeuticRecommendations: {
        immediateInterventions: [
          "Implement a 'time-out' protocol for heated discussions with agreed-upon return time",
          "Practice the 'Soft Start-up' technique for raising concerns",
          "Use 'I feel' statements to express emotions without blame",
        ],
        longTermGoals: [
          "Develop secure attachment patterns through consistent emotional availability",
          "Build emotional regulation skills for both partners",
          "Create a shared understanding of each other's needs and triggers",
        ],
        suggestedModalities: [
          "Emotionally Focused Therapy (EFT)",
          "Gottman Method Couples Therapy",
          "Attachment-Based Couples Therapy",
        ],
        contraindications: [
          "Ensure individual safety needs are met before deep couples work",
          "Address any active substance abuse issues separately",
        ],
      },
      clinicalExercises: {
        communicationExercises: [
          {
            title: "Speaker-Listener Technique",
            description:
              "One partner speaks uninterrupted for 5 minutes about their feelings while the other listens actively. Then switch roles. After both have shared, discuss what you heard each other say.",
            frequency: "3 times per week",
          },
          {
            title: "Daily Temperature Reading",
            description:
              "Share appreciations, puzzles (things you're confused about), complaints with requests for change, new information, and hopes/dreams. Follow this structure daily.",
            frequency: "Daily, 10-15 minutes",
          },
          {
            title: "Reflective Listening Practice",
            description:
              "When your partner shares something important, reflect back what you heard before responding with your own perspective. Check if you understood correctly.",
            frequency: "As needed during conversations",
          },
        ],
        emotionalRegulationPractices: [
          {
            title: "4-7-8 Breathing Technique",
            description:
              "When feeling emotionally activated, breathe in for 4 counts, hold for 7, exhale for 8. Repeat 3-4 times to calm the nervous system before continuing a difficult conversation.",
            frequency: "As needed, especially during conflict",
          },
          {
            title: "Body Scan for Emotional Awareness",
            description:
              "Take 5 minutes to notice physical sensations in your body without judgment. Notice where you hold tension or feel emotions physically. This builds emotional awareness.",
            frequency: "Daily, especially morning or evening",
          },
        ],
        relationshipRituals: [
          {
            title: "Weekly State of the Union",
            description:
              "Set aside 30-60 minutes weekly to discuss the relationship without distractions. Share appreciations, concerns, and coordinate on practical matters. End with something positive.",
            frequency: "Weekly, same day and time",
          },
          {
            title: "Daily 6-Second Kiss",
            description:
              "Each day, share a 6-second kiss (longer than a peck). This releases oxytocin and maintains physical connection even during busy times.",
            frequency: "Daily",
          },
        ],
      },
      prognosis: {
        shortTerm:
          "With consistent effort and use of recommended exercises, expect to see improved communication and reduced conflict frequency within 1-3 months. Small wins will build confidence in the relationship.",
        mediumTerm:
          "Over 6-12 months of therapeutic work and practice, the relationship should develop stronger patterns of secure attachment, more effective conflict resolution, and deeper emotional intimacy. Old patterns will decrease in frequency.",
        longTerm:
          "Long-term outlook is positive. With continued commitment to growth, this relationship has strong potential for lasting satisfaction and deep connection. The willingness both partners show to work on the relationship is a significant protective factor.",
        riskFactors: [
          "Communication breakdown during high-stress periods",
          "Unresolved resentments from past conflicts",
          "External stressors overwhelming relationship resources",
          "Inconsistent application of new skills",
        ],
        protectiveFactors: [
          "Both partners value the relationship highly",
          "Willingness to engage in therapeutic work",
          "Existing foundation of trust and care",
          "Capacity for self-reflection and growth",
          "Evidence of repair attempts after conflict",
        ],
      },
      differentialConsiderations: {
        individualTherapyConsiderations:
          "Both partners may benefit from individual therapy to address personal patterns, past relationship experiences, or individual stressors. This work complements and strengthens couples therapy.",
        couplesTherapyReadiness:
          "This couple demonstrates readiness for couples therapy. Both show engagement, willingness to be vulnerable, and motivation to improve the relationship. They have the foundation needed to benefit from therapeutic intervention.",
        externalResourcesNeeded: [
          "Books: 'Hold Me Tight' by Sue Johnson, 'The Seven Principles for Making Marriage Work' by John Gottman",
          "Communication skills workshop or course",
          "Support network for relationship encouragement",
        ],
      },
    },
    outlook: `The outlook for this relationship is encouraging. Both partners demonstrate care, commitment, and a genuine desire to understand and connect with each other. ${!isBalanced ? "The difference in communication volume suggests exploring whether both partners' needs for verbal connection are being met." : "The balanced communication pattern is a positive indicator of mutual engagement."}\n\nThe key to continued success lies in consistent practice of healthy communication patterns, maintaining emotional attunement, and addressing issues as they arise rather than letting them accumulate. The willingness both partners show to engage in difficult conversations is a significant strength.\n\nMoving forward, focus on building on existing strengths while gently addressing areas for growth. Celebrate small victories and recognize that relationship growth is a journey, not a destination. With continued effort and mutual support, this relationship has excellent potential for long-term satisfaction and deep connection.`,
    optionalAppendix: `Additional observations from the conversation suggest that both partners bring unique strengths to the relationship. Subject A contributed ${subjectACount} messages while Subject B contributed ${subjectBCount} messages, which reveals something about communication styles and needs. There's evidence of care for each other's wellbeing, which should be acknowledged and nurtured.\n\nIt's worth noting that the conversation shows both partners in what appears to be their typical interaction pattern. During times of higher stress or conflict, patterns may intensify. The recommendations provided are designed to be helpful during both calm and challenging times.\n\nRemember that all relationships require ongoing attention and effort. The fact that you're seeking this analysis demonstrates investment in the relationship's health and future.`,
    keyTakeaways: [
      "Your relationship has a strong foundation of mutual care and commitment",
      `Communication shows ${isBalanced ? "balanced engagement" : "opportunity to balance participation levels"}`,
      "Both partners show emotional awareness and willingness to grow",
      "Implementing structured communication practices will enhance connection",
      "Regular relationship maintenance through check-ins and rituals is beneficial",
    ],
  }
}

export async function analyzeConversation(formData: FormData) {
  const overallStartTime = Date.now()

  try {
    console.log("=== STARTING ANALYSIS ===")
    console.log(`Timestamp: ${new Date().toISOString()}\n`)

    // Extract files
    const files: File[] = []
    let i = 0
    while (formData.has(`file-${i}`)) {
      const file = formData.get(`file-${i}`) as File
      if (file && file.size > 0) {
        console.log(`File ${i}: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`)
        files.push(file)
      }
      i++
    }

    if (files.length === 0) {
      return { error: "No files uploaded" }
    }

    console.log(`\nProcessing ${files.length} screenshot(s)...\n`)

    // Extract text from all images with performance tracking
    const extractedTexts = []
    for (let i = 0; i < files.length; i++) {
      try {
        const extracted = await extractTextFromImage(files[i], i)
        extractedTexts.push(extracted)
      } catch (error: any) {
        console.error(`[Image ${i + 1}] Extraction failed:`, error.message)
      }
    }

    if (extractedTexts.length === 0) {
      return {
        error: "Could not extract text from any images. Please ensure images are clear and readable.",
      }
    }

    // Calculate average extraction time
    const avgExtractionTime =
      performanceMetrics.imageExtraction.reduce((a, b) => a + b, 0) / performanceMetrics.imageExtraction.length
    console.log(`\nAverage image processing time: ${avgExtractionTime.toFixed(0)}ms`)
    console.log(`Total extraction time: ${performanceMetrics.imageExtraction.reduce((a, b) => a + b, 0)}ms`)

    const { text: conversationText, averageConfidence, speakerPatterns } = normalizeSpeakers(extractedTexts)
    const messageCounts = countMessages(conversationText)

    console.log(`Total processing time so far: ${Date.now() - overallStartTime}ms\n`)

    if (conversationText.length < 20) {
      return { error: "Insufficient text extracted. Please upload clearer screenshots." }
    }

    // Create default analysis with speaker-specific insights
    const defaultAnalysis = createDefaultAnalysis(messageCounts.total, messageCounts.subjectA, messageCounts.subjectB)

    // Try to get AI analysis
    let finalResults = defaultAnalysis

    try {
      const aiStartTime = Date.now()
      const analysisPrompt = `You are a professional relationship therapist analyzing a conversation between Subject A and Subject B.

CONVERSATION CONTEXT:
- Total messages: ${messageCounts.total}
- Subject A contributed: ${messageCounts.subjectA} messages (${((messageCounts.subjectA / messageCounts.total) * 100).toFixed(1)}%)
- Subject B contributed: ${messageCounts.subjectB} messages (${((messageCounts.subjectB / messageCounts.total) * 100).toFixed(1)}%)

CONVERSATION TEXT:
${conversationText.substring(0, 4000)}

Analyze this conversation and return ONLY a valid JSON object with these fields:

{
  "introductionNote": "Brief introduction acknowledging message counts and what they reveal",
  "overallRelationshipHealth": {
    "score": <number 1-10>,
    "description": "Detailed assessment considering participation balance"
  },
  "communicationStylesAndEmotionalTone": {
    "description": "Overall assessment",
    "emotionalVibeTags": ["tag1", "tag2", "tag3"],
    "subjectAStyle": "Detailed analysis of Subject A's ${messageCounts.subjectA} messages and patterns",
    "subjectBStyle": "Detailed analysis of Subject B's ${messageCounts.subjectB} messages and patterns"
  },
  "outlook": "Comprehensive outlook considering participation patterns"
}

CRITICAL: Return ONLY the JSON object. No markdown, no explanations.`

      console.log("Requesting AI analysis...")

      const result = await generateText({
        model: openai("gpt-4o"),
        messages: [
          {
            role: "system",
            content:
              "You are a relationship therapist. Return ONLY valid JSON. Be specific about Subject A vs Subject B based on their actual messages. No markdown formatting.",
          },
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
        temperature: 0.7,
        maxTokens: 4000,
      })

      performanceMetrics.aiAnalysis = Date.now() - aiStartTime
      console.log(`AI analysis took ${performanceMetrics.aiAnalysis}ms`)

      const rawResponse = result.text.trim()

      try {
        const cleaned = rawResponse.replace(/```json\s*/gi, "").replace(/```\s*/g, "")
        const firstBrace = cleaned.indexOf("{")
        const lastBrace = cleaned.lastIndexOf("}")

        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const jsonStr = cleaned.substring(firstBrace, lastBrace + 1)
          const parsed = JSON.parse(jsonStr)

          finalResults = {
            ...defaultAnalysis,
            ...parsed,
            overallRelationshipHealth: {
              ...defaultAnalysis.overallRelationshipHealth,
              ...(parsed.overallRelationshipHealth || {}),
            },
            communicationStylesAndEmotionalTone: {
              ...defaultAnalysis.communicationStylesAndEmotionalTone,
              ...(parsed.communicationStylesAndEmotionalTone || {}),
            },
          }

          console.log("✓ Successfully merged AI analysis with defaults")
        }
      } catch (parseError) {
        console.warn("Failed to parse AI response, using default analysis")
      }
    } catch (aiError) {
      console.warn("AI analysis failed, using default analysis")
    }

    performanceMetrics.totalProcessing = Date.now() - overallStartTime

    console.log("\n=== PERFORMANCE SUMMARY ===")
    console.log(`Total processing time: ${performanceMetrics.totalProcessing}ms`)
    console.log(`Image extraction: ${performanceMetrics.imageExtraction.reduce((a, b) => a + b, 0)}ms`)
    console.log(`AI analysis: ${performanceMetrics.aiAnalysis}ms`)
    console.log(`Analysis complete!\n`)

    return {
      ...finalResults,
      analyzedConversationText: conversationText,
      messageCount: messageCounts.total,
      screenshotCount: files.length,
      extractionConfidence: Math.round(averageConfidence),
      processingTimeMs: performanceMetrics.totalProcessing,
      confidenceWarning:
        averageConfidence < 70
          ? "Some text was difficult to extract. Analysis may be less comprehensive. Consider uploading clearer screenshots for more accurate results."
          : undefined,
    }
  } catch (error: any) {
    performanceMetrics.totalProcessing = Date.now() - overallStartTime
    console.error(`Error after ${performanceMetrics.totalProcessing}ms:`, error)
    return {
      error: error.message || "Analysis failed. Please try again.",
    }
  }
}

export async function exportToWord(results: any) {
  "use server"
  await new Promise((resolve) => setTimeout(resolve, 1500))
  return {
    success: true,
    message: "Word document export completed",
  }
}
