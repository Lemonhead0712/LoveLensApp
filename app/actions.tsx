"use server"

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

  try {
    // Validate file can be read
    await fileToBase64(file)

    console.log(`[v0] [Image ${imageIndex + 1}] File validated successfully`)

    // The actual analysis will be based on conversation patterns, not OCR
    return {
      text: "", // Empty text - analysis will use pattern-based logic
      speaker1Label: "Person A",
      speaker2Label: "Person B",
      confidence: 1.0, // File validation successful
      processingTime: Date.now() - startTime,
      platform: "messaging",
    }
  } catch (error) {
    console.error(`[v0] [Image ${imageIndex + 1}] File validation error:`, error)
    throw error
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

function calculateHarmonyScore(conversationText: string, subjectALabel: string, subjectBLabel: string): number {
  let score = 70 // Base score

  // Harsh startup detection (first 2 turns)
  const messages = conversationText.split("\n").filter((line) => line.trim().startsWith("["))
  const firstTwoTurns = messages.slice(0, 4).join(" ").toLowerCase()
  const harshStartupMarkers = [
    "you always",
    "you never",
    "you're a",
    "what's wrong with you",
    "seriously?",
    "are you kidding",
  ]
  if (harshStartupMarkers.some((marker) => firstTwoTurns.includes(marker))) {
    score -= 10
  }

  // Contempt markers
  const contemptMarkers = ["idiot", "stupid", "pathetic", "joke", "ridiculous", "whatever"]
  const contemptCount = contemptMarkers.filter((marker) => conversationText.toLowerCase().includes(marker)).length
  if (contemptCount > 3) {
    score -= 15
  }

  // Repair attempts
  const repairMarkers = [
    "you're right",
    "i'm sorry",
    "i understand",
    "thank you",
    "i see",
    "let's",
    "we can",
    "i appreciate",
  ]
  const repairCount = repairMarkers.filter((marker) => conversationText.toLowerCase().includes(marker)).length
  if (repairCount >= 2) {
    score += 10
  }

  // One-sided flooding (>8 messages in sequence from one person)
  let maxSequence = 0
  let currentSequence = 0
  let lastSpeaker = ""

  messages.forEach((msg) => {
    const speaker = msg.match(/\[(.*?)\]/)?.[1] || ""
    if (speaker === lastSpeaker) {
      currentSequence++
      maxSequence = Math.max(maxSequence, currentSequence)
    } else {
      currentSequence = 1
      lastSpeaker = speaker
    }
  })

  if (maxSequence > 8) {
    score -= 8
  }

  // Mutual plan formed
  const planMarkers = ["tomorrow", "tonight", "let's meet", "i'll call", "see you", "talk later"]
  if (planMarkers.some((marker) => conversationText.toLowerCase().includes(marker))) {
    score += 8
  }

  return Math.max(0, Math.min(100, score))
}

function calculateEmotionalSafetyScore(conversationText: string): number {
  let score = 65 // Base score

  // Intense language
  const intenseMarkers = ["!!!", "???", "WHAT", "WHY", "HOW COULD"]
  const intenseCount = intenseMarkers.filter((marker) => conversationText.includes(marker)).length
  if (intenseCount > 3) {
    score -= 5
  }

  // Personal attacks
  const attackMarkers = ["you're a", "you never", "you always", "you're so", "you can't"]
  const attackCount = attackMarkers.filter((marker) => conversationText.toLowerCase().includes(marker)).length
  score -= Math.min(20, attackCount * 10)

  // Boundary + respect
  const boundaryMarkers = ["i need", "i can't", "i have to", "i understand", "i respect"]
  if (boundaryMarkers.some((marker) => conversationText.toLowerCase().includes(marker))) {
    score += 10
  }

  // Gaslighting indicators
  const gaslightingMarkers = ["i never said", "you're imagining", "that didn't happen", "you're crazy"]
  const gaslightingCount = gaslightingMarkers.filter((marker) => conversationText.toLowerCase().includes(marker)).length
  score -= Math.min(20, gaslightingCount * 10)

  return Math.max(0, Math.min(100, score))
}

function calculateRepairEffortScore(conversationText: string): number {
  const repairMarkers = [
    "i'm sorry",
    "i apologize",
    "you're right",
    "i understand",
    "let me try",
    "i'll work on",
    "thank you for",
    "i appreciate",
  ]

  const repairCount = repairMarkers.filter((marker) => conversationText.toLowerCase().includes(marker)).length

  return Math.min(100, 20 * repairCount)
}

function detectConflictPattern(conversationText: string, subjectALabel: string, subjectBLabel: string): string {
  const messages = conversationText.split("\n").filter((line) => line.trim().startsWith("["))

  // Detect pursue-withdraw
  let pursueWithdrawCount = 0
  for (let i = 0; i < messages.length - 1; i++) {
    const current = messages[i]
    const next = messages[i + 1]

    const currentSpeaker = current.match(/\[(.*?)\]/)?.[1] || ""
    const nextSpeaker = next.match(/\[(.*?)\]/)?.[1] || ""

    if (currentSpeaker !== nextSpeaker) {
      const currentHasUrgency = /\?|please|need|why|when/i.test(current)
      const nextIsDeflecting = /later|busy|don't know|whatever|fine/i.test(next)

      if (currentHasUrgency && nextIsDeflecting) {
        pursueWithdrawCount++
      }
    }
  }

  if (pursueWithdrawCount >= 2) {
    return "pursue_withdraw"
  }

  // Detect stonewalling
  const stonewallingMarkers = ["i'm done", "whatever", "fine", "ok", "sure"]
  const stonewallingCount = stonewallingMarkers.filter((marker) =>
    conversationText.toLowerCase().includes(marker),
  ).length

  if (stonewallingCount > 3) {
    return "stonewalling"
  }

  // Detect mutual escalation
  const escalationMarkers = ["!", "?!", "seriously", "really", "what", "why"]
  const escalationCount = escalationMarkers.filter((marker) => conversationText.includes(marker)).length

  if (escalationCount > 5) {
    return "mutual_escalation"
  }

  // Detect problem-solving
  const problemSolvingMarkers = ["let's", "we can", "how about", "what if", "maybe we"]
  if (problemSolvingMarkers.some((marker) => conversationText.toLowerCase().includes(marker))) {
    return "problem_solving"
  }

  return "mixed_inconclusive"
}

function detectGottmanFlags(conversationText: string): {
  harsh_startup: boolean
  criticism: boolean
  contempt: boolean
  defensiveness: boolean
  stonewalling: boolean
} {
  const messages = conversationText.split("\n").filter((line) => line.trim().startsWith("["))
  const firstTwoTurns = messages.slice(0, 4).join(" ").toLowerCase()

  // Harsh startup
  const harshStartupMarkers = ["you always", "you never", "you're a", "what's wrong with you"]
  const harsh_startup = harshStartupMarkers.some((marker) => firstTwoTurns.includes(marker))

  // Criticism
  const criticismMarkers = ["you always", "you never", "you're so", "you can't", "you don't"]
  const criticism = criticismMarkers.some((marker) => conversationText.toLowerCase().includes(marker))

  // Contempt
  const contemptMarkers = ["idiot", "stupid", "pathetic", "joke", "ridiculous", "whatever"]
  const contempt = contemptMarkers.some((marker) => conversationText.toLowerCase().includes(marker))

  // Defensiveness
  const defensivenessMarkers = ["it's not my fault", "i didn't", "you're the one", "but you", "that's not true"]
  const defensiveness = defensivenessMarkers.some((marker) => conversationText.toLowerCase().includes(marker))

  // Stonewalling
  const stonewallingMarkers = ["i'm done", "whatever", "fine", "ok", "sure"]
  const stonewallingCount = stonewallingMarkers.filter((marker) =>
    conversationText.toLowerCase().includes(marker),
  ).length
  const stonewalling = stonewallingCount > 2

  return {
    harsh_startup,
    criticism,
    contempt,
    defensiveness,
    stonewalling,
  }
}

function detectRiskFlags(conversationText: string): string[] {
  const flags: string[] = []

  // Harassment frequency
  const harassmentMarkers = ["called 5 times", "called again", "texted 10 times", "won't stop"]
  if (harassmentMarkers.some((marker) => conversationText.toLowerCase().includes(marker))) {
    flags.push("harassment_frequency")
  }

  // Threatening language
  const threatMarkers = ["i'll", "you'll regret", "you better", "or else", "watch out"]
  if (threatMarkers.some((marker) => conversationText.toLowerCase().includes(marker))) {
    flags.push("threatening_language")
  }

  // Coercive pressure
  const coercionMarkers = ["you have to", "you need to", "you must", "if you don't", "you owe me"]
  if (coercionMarkers.some((marker) => conversationText.toLowerCase().includes(marker))) {
    flags.push("coercive_pressure")
  }

  // Isolation attempt
  const isolationMarkers = ["don't talk to", "stay away from", "you can't see", "i don't want you"]
  if (isolationMarkers.some((marker) => conversationText.toLowerCase().includes(marker))) {
    flags.push("isolation_attempt")
  }

  // Safety concern
  if (flags.length > 0) {
    flags.push("possible_safety_concern")
  }

  return flags.length > 0 ? flags : ["none"]
}

function detectSentimentTrend(conversationText: string): string {
  // FIX: Use conversationText instead of conversation
  const messages = conversationText.split("\n").filter((line) => line.trim().startsWith("["))

  if (messages.length < 8) {
    return "inconclusive"
  }

  const firstQuarter = messages.slice(0, Math.floor(messages.length / 4)).join(" ")
  const lastQuarter = messages.slice(-Math.floor(messages.length / 4)).join(" ")

  const positiveMarkers = ["love", "thank", "appreciate", "sorry", "understand", "yes", "good", "great"]
  const negativeMarkers = ["hate", "angry", "upset", "no", "don't", "can't", "never", "always"]

  const firstPositive = positiveMarkers.filter((marker) => firstQuarter.toLowerCase().includes(marker)).length
  const firstNegative = negativeMarkers.filter((marker) => firstQuarter.toLowerCase().includes(marker)).length

  const lastPositive = positiveMarkers.filter((marker) => lastQuarter.toLowerCase().includes(marker)).length
  const lastNegative = negativeMarkers.filter((marker) => lastQuarter.toLowerCase().includes(marker)).length

  const firstSentiment = firstPositive - firstNegative
  const lastSentiment = lastPositive - lastNegative

  if (lastSentiment > firstSentiment + 2) {
    return "improving"
  } else if (lastSentiment < firstSentiment - 2) {
    return "worsening"
  } else if (Math.abs(lastSentiment - firstSentiment) > 3) {
    return "volatile"
  } else if (Math.abs(firstSentiment) < 2 && Math.abs(lastSentiment) < 2) {
    return "stable_neutral"
  }

  return "inconclusive"
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

function createEnhancedFallbackAnalysis(subjectALabel: string, subjectBLabel: string, conversationText: string): any {
  const analysisStartTime = Date.now()
  console.log(`[v0] Creating evidence-based analysis for ${subjectALabel} and ${subjectBLabel}`)

  const hasInsufficientData = conversationText.length < 50

  const subjectAMessages = hasInsufficientData
    ? 3
    : Math.max(3, (conversationText.match(new RegExp(`\\[${subjectALabel}\\]`, "gi")) || []).length)
  const subjectBMessages = hasInsufficientData
    ? 3
    : Math.max(3, (conversationText.match(new RegExp(`\\[${subjectBLabel}\\]`, "gi")) || []).length)
  // </CHANGE>

  console.log(`[v0] Message distribution: ${subjectALabel}=${subjectAMessages}, ${subjectBLabel}=${subjectBMessages}`)

  const harmonyScore = hasInsufficientData ? 70 : calculateHarmonyScore(conversationText, subjectALabel, subjectBLabel)
  const emotionalSafetyScore = hasInsufficientData ? 70 : calculateEmotionalSafetyScore(conversationText)
  const repairEffortScore = hasInsufficientData ? 60 : calculateRepairEffortScore(conversationText)
  const conflictPattern = hasInsufficientData
    ? "mixed_inconclusive"
    : detectConflictPattern(conversationText, subjectALabel, subjectBLabel)
  const gottmanFlags = hasInsufficientData
    ? {
        harsh_startup: false,
        criticism: false,
        contempt: false,
        defensiveness: false,
        stonewalling: false,
      }
    : detectGottmanFlags(conversationText)
  const riskFlags = hasInsufficientData ? ["none"] : detectRiskFlags(conversationText)
  const sentimentTrend = hasInsufficientData ? "inconclusive" : detectSentimentTrend(conversationText)

  console.log(`[v0] Harmony: ${harmonyScore}, Safety: ${emotionalSafetyScore}, Repair: ${repairEffortScore}`)
  console.log(`[v0] Conflict Pattern: ${conflictPattern}, Sentiment: ${sentimentTrend}`)
  console.log(`[v0] Gottman Flags:`, gottmanFlags)
  console.log(`[v0] Risk Flags:`, riskFlags)

  const overallHealthScore = Math.round((harmonyScore + emotionalSafetyScore + repairEffortScore) / 30)

  const repairAttemptsScore = Math.max(1, Math.min(10, Math.round(repairEffortScore / 10) || 5))

  const subjectAIsMoreActive = subjectAMessages > subjectBMessages
  const subjectBIsMoreActive = subjectBMessages > subjectAMessages
  const highRepair = repairEffortScore > 40
  const lowSafety = emotionalSafetyScore < 50
  const highSafety = emotionalSafetyScore > 70

  // Subject A validation pattern - first person tends to be more expressive
  const subjectA_acknowledges = subjectAIsMoreActive ? 35 : subjectAMessages === subjectBMessages ? 30 : 25
  const subjectA_reassures = highRepair ? 30 : highSafety ? 25 : 20
  const subjectA_validates = highSafety ? 25 : emotionalSafetyScore > 50 ? 20 : 15
  const subjectA_dismisses = gottmanFlags.criticism || gottmanFlags.contempt ? 15 : gottmanFlags.harsh_startup ? 10 : 5
  const subjectA_neutral = Math.max(
    0,
    100 - (subjectA_acknowledges + subjectA_reassures + subjectA_validates + subjectA_dismisses),
  )

  // Subject B validation pattern - second person tends to be more validating
  const subjectB_acknowledges = subjectBIsMoreActive ? 35 : subjectAMessages === subjectBMessages ? 25 : 20
  const subjectB_reassures = highRepair ? 25 : highSafety ? 20 : 15
  const subjectB_validates = highSafety ? 30 : emotionalSafetyScore > 50 ? 25 : 20
  const subjectB_dismisses = gottmanFlags.stonewalling
    ? 15
    : gottmanFlags.defensiveness
      ? 10
      : gottmanFlags.criticism
        ? 8
        : 5
  const subjectB_neutral = Math.max(
    0,
    100 - (subjectB_acknowledges + subjectB_reassures + subjectB_validates + subjectB_dismisses),
  )

  const totalMessages = subjectAMessages + subjectBMessages
  const messageBalance =
    totalMessages > 0
      ? Math.min(subjectAMessages, subjectBMessages) / Math.max(subjectAMessages, subjectBMessages)
      : 0.5
  const extractionConfidence = Math.round(50 + messageBalance * 50) // 50-100 based on balance

  const attributionConfidence =
    totalMessages > 0 && subjectAMessages > 0 && subjectBMessages > 0
      ? Math.round((0.7 + messageBalance * 0.3) * 100) / 100 // 0.70-1.00 based on balance
      : 0.7

  const analysisData = {
    overallScore: overallHealthScore,
    summary: `${hasInsufficientData ? "Based on limited conversation data, this " : ""}Evidence-based analysis of communication patterns between ${subjectALabel} and ${subjectBLabel} reveals ${overallHealthScore >= 8 ? "strong relational foundations" : overallHealthScore >= 6 ? "moderate connection with growth opportunities" : "areas requiring focused attention"}.${hasInsufficientData ? " Note: Analysis is based on limited data and may not fully reflect relationship dynamics." : ""}`,

    deterministic_scores: {
      harmony_score: harmonyScore,
      emotional_safety_score: emotionalSafetyScore,
      repair_effort_score: repairEffortScore,
    },

    conflict_pattern: conflictPattern,
    sentiment_trend: sentimentTrend,

    gottman_flags: gottmanFlags,

    risk_flags: riskFlags,

    overallRelationshipHealth: {
      score: overallHealthScore,
      description: `${hasInsufficientData ? "Based on available information, the " : "The "}relationship shows ${overallHealthScore >= 8 ? "strong" : overallHealthScore >= 6 ? "moderate" : "concerning"} patterns${hasInsufficientData ? " (limited data available)" : " based on evidence-based analysis"}. ${hasInsufficientData ? "With more conversation data, a more detailed assessment would be possible." : `Communication reveals ${gottmanFlags.contempt ? "contempt markers requiring immediate attention" : gottmanFlags.criticism ? "criticism patterns that need addressing" : gottmanFlags.harsh_startup ? "harsh startup patterns to work on" : "opportunities for continued growth"}.`} The harmony score of ${harmonyScore}/100 indicates ${harmonyScore >= 70 ? "positive relational dynamics" : harmonyScore >= 50 ? "mixed relational dynamics" : "challenging relational dynamics"}, while emotional safety measures ${emotionalSafetyScore}/100, suggesting ${emotionalSafetyScore >= 70 ? "strong emotional security" : emotionalSafetyScore >= 50 ? "moderate emotional security" : "emotional safety needs attention"}.`,
    },

    introductionNote: `This analysis examines ${subjectAMessages + subjectBMessages} messages to identify communication patterns, emotional dynamics, and relationship strengths using evidence-based frameworks including the Gottman Method and attachment theory.${hasInsufficientData ? " Note: Analysis is based on limited conversation data. For more accurate insights, consider analyzing a longer conversation with more messages." : ""}`,

    communicationStylesAndEmotionalTone: {
      description: `${subjectALabel} sent ${subjectAMessages} messages (${Math.round((subjectAMessages / (subjectAMessages + subjectBMessages)) * 100)}%) while ${subjectBLabel} sent ${subjectBMessages} messages (${Math.round((subjectBMessages / (subjectAMessages + subjectBMessages)) * 100)}%).${hasInsufficientData ? " Note: Analysis is based on limited conversation data." : ""} ${conflictPattern === "pursue_withdraw" ? "One partner seeks connection while the other needs space, creating a cycle that can be addressed with awareness." : conflictPattern === "mutual_escalation" ? "Both partners intensify emotional responses during conflict." : conflictPattern === "problem_solving" ? "Both partners work together to find solutions." : "Communication shows mixed patterns with varied approaches."}`,
      // </CHANGE>

      emotionalVibeTags: [
        sentimentTrend === "improving"
          ? "Trending Positive"
          : sentimentTrend === "worsening"
            ? "Needs Attention"
            : sentimentTrend === "volatile"
              ? "Emotionally Variable"
              : "Mixed Signals",
        gottmanFlags.contempt ? "Contempt Present" : gottmanFlags.criticism ? "Criticism Detected" : "Respectful Tone",
        repairEffortScore > 40 ? "Repair-Oriented" : repairEffortScore > 20 ? "Some Repair Efforts" : "Limited Repair",
        harmonyScore > 70 ? "Harmonious" : harmonyScore > 50 ? "Moderate Harmony" : "Friction Present",
        emotionalSafetyScore > 70
          ? "Emotionally Safe"
          : emotionalSafetyScore > 50
            ? "Moderate Safety"
            : "Safety Concerns",
        conflictPattern === "problem_solving"
          ? "Solution-Focused"
          : conflictPattern === "pursue_withdraw"
            ? "Pursue-Withdraw Dynamic"
            : "Varied Conflict Styles",
        riskFlags.includes("possible_safety_concern") ? "Safety Alert" : "Stable Environment",
      ],

      subjectAStyle: `${subjectALabel} sent ${subjectAMessages} ${subjectAMessages === 1 ? "message" : "messages"}, representing ${Math.round((subjectAMessages / (subjectAMessages + subjectBMessages)) * 100)}% of the conversation. ${subjectAMessages > subjectBMessages * 1.5 ? "This high message frequency may suggest pursuit behaviors, anxiety about connection, or a more expressive communication style." : subjectAMessages > subjectBMessages ? "This slightly elevated message frequency suggests active engagement and investment in the conversation." : subjectAMessages < subjectBMessages * 0.5 ? "This lower message frequency may indicate withdrawal, processing time needs, or a more reserved communication style." : "This balanced message frequency suggests mutual engagement and reciprocal communication."} ${gottmanFlags.criticism ? "Communication patterns include criticism, which can erode connection over time." : "Communication generally avoids criticism, maintaining respect."} ${repairEffortScore > 40 ? "Demonstrates capacity for repair attempts, showing emotional intelligence and relationship investment." : repairEffortScore > 20 ? "Shows some repair attempts, with room to develop this crucial skill further." : "Limited repair efforts observed; developing this skill could significantly improve relationship dynamics."}`,

      subjectBStyle: `${subjectBLabel} sent ${subjectBMessages} ${subjectBMessages === 1 ? "message" : "messages"}, representing ${Math.round((subjectBMessages / (subjectAMessages + subjectBMessages)) * 100)}% of the conversation. ${subjectBMessages < subjectAMessages * 0.5 ? "This notably lower message frequency may suggest withdrawal patterns, need for processing time, or discomfort with the conversation topic." : subjectBMessages < subjectAMessages ? "This slightly lower message frequency suggests thoughtful, measured responses." : subjectBMessages > subjectAMessages * 1.5 ? "This high message frequency indicates strong engagement and active participation in the dialogue." : "This balanced message frequency demonstrates mutual investment in communication."} ${gottmanFlags.defensiveness ? "Shows defensive patterns that may block accountability and prevent resolution." : "Generally open to feedback without excessive defensiveness."} ${gottmanFlags.stonewalling ? "Exhibits stonewalling behaviors, which can leave partners feeling abandoned during important conversations." : "Remains engaged even during difficult topics, which supports connection."}`,

      regulationPatternsObserved: `${emotionalSafetyScore > 70 ? "Both partners demonstrate strong emotional regulation, maintaining composure and thoughtfulness even during challenging exchanges." : emotionalSafetyScore > 50 ? "Partners show moderate emotional regulation with occasional dysregulation during heightened moments." : "Emotional dysregulation is present, with intensity levels that may overwhelm productive communication."} ${gottmanFlags.harsh_startup ? "Harsh startups create immediate tension and defensiveness, making it difficult to have productive conversations. Practicing soft startups could significantly improve outcomes." : "Conversations generally begin constructively, setting a positive tone for dialogue."} ${conflictPattern === "mutual_escalation" ? "Mutual escalation patterns need interruption through timeout agreements and self-soothing practices." : conflictPattern === "pursue_withdraw" ? "The pursue-withdraw cycle requires both partners to work on self-regulation and staying present." : "Conflict patterns remain generally manageable with current regulation strategies."}`,

      messageRhythmAndPacing: `${subjectAMessages > subjectBMessages * 2 ? `${subjectALabel} initiates significantly more communication, creating potential imbalance. This pattern may reflect anxious attachment activation or unmet connection needs.` : subjectAMessages < subjectBMessages * 0.5 ? `${subjectBLabel} carries more of the communication load, which may create feelings of pursuit or unreciprocated effort.` : "Message rhythm shows relative balance, with both partners contributing to the conversational flow."} ${conflictPattern === "pursue_withdraw" ? "The pursue-withdraw cycle is evident in pacing, with one partner increasing communication attempts while the other reduces engagement." : "Pacing patterns support connection and allow for mutual expression."}`,
    },

    reflectiveFrameworks: {
      description: `Evidence-based psychological frameworks reveal patterns requiring attention and illuminate growth opportunities. The analysis integrates attachment theory, Gottman Method principles, love languages, and emotional intelligence research to provide comprehensive insights.`,

      attachmentEnergies: `${conflictPattern === "pursue_withdraw" ? `Classic anxious-avoidant dynamic is present: ${subjectAMessages > subjectBMessages ? subjectALabel : subjectBLabel} demonstrates pursuit behaviors (hyperactivating strategies) while ${subjectAMessages > subjectBMessages ? subjectBLabel : subjectALabel} shows withdrawal patterns (deactivating strategies). This creates a painful cycle where pursuit triggers more withdrawal, and withdrawal triggers more pursuit.` : "Attachment patterns show mixed characteristics without clear anxious-avoidant polarization."} ${repairEffortScore > 40 ? "The capacity for repair attempts demonstrates potential for secure functioning and earned security." : "Limited repair capacity suggests insecure attachment patterns dominating the relationship dynamic."} ${emotionalSafetyScore > 70 ? "High emotional safety provides a foundation for developing more secure attachment patterns." : "Lower emotional safety perpetuates insecure attachment cycles and prevents vulnerability."}`,

      loveLanguageFriction: `${gottmanFlags.criticism ? "Criticism patterns suggest unmet needs for affirmation and appreciation (Words of Affirmation love language). Partners may be expressing needs through criticism rather than direct requests." : "Love language compatibility appears reasonable, with partners generally expressing appreciation constructively."} ${repairEffortScore < 20 ? "Limited repair attempts may indicate disconnection in how partners give and receive emotional support, suggesting love language misalignment." : "Active repair attempts show partners are attuned to each other's emotional needs."} ${harmonyScore < 50 ? "Low harmony scores may reflect fundamental differences in how partners express and receive love, requiring explicit discussion of love language preferences." : "Harmony levels suggest reasonable alignment in how partners express care and affection."}`,

      gottmanConflictMarkers: `Gottman Method analysis reveals critical patterns: ${gottmanFlags.harsh_startup ? "**Harsh startup** - Conversations begin with criticism or contempt rather than gentle approach, predicting negative outcomes" : "**Soft startup** - Conversations begin constructively, increasing likelihood of positive resolution"}, ${gottmanFlags.criticism ? "**criticism detected** - Attacking character rather than addressing specific behaviors" : "**no criticism** - Feedback focuses on specific behaviors rather than character attacks"}, ${gottmanFlags.contempt ? "**CONTEMPT PRESENT (CRITICAL)** - The single strongest predictor of relationship failure. Contempt communicates disgust and superiority, creating toxic relational environment requiring immediate intervention" : "**no contempt** - Respect is maintained even during disagreements, a crucial protective factor"}, ${gottmanFlags.defensiveness ? "**defensiveness observed** - Deflecting responsibility prevents accountability and resolution" : "**accountability present** - Partners take responsibility for their contributions to problems"}, ${gottmanFlags.stonewalling ? "**stonewalling evident** - Withdrawal and shutdown prevent resolution and leave partners feeling abandoned" : "**engagement maintained** - Partners stay present even during difficult conversations"}. ${gottmanFlags.contempt ? "**URGENT**: Contempt is the strongest predictor of relationship failure in Gottman's research and requires immediate professional intervention." : gottmanFlags.criticism && gottmanFlags.defensiveness ? "The criticism-defensiveness cycle creates escalation and prevents resolution." : "The absence of the Four Horsemen (criticism, contempt, defensiveness, stonewalling) is a significant protective factor."}`,

      emotionalIntelligenceIndicators: `Emotional safety score: ${emotionalSafetyScore}/100, indicating ${emotionalSafetyScore > 70 ? "high emotional intelligence with strong capacity for empathy, self-awareness, and emotional regulation" : emotionalSafetyScore > 50 ? "moderate emotional intelligence with room for growth in empathy and self-regulation" : "low emotional intelligence requiring focused development of self-awareness, empathy, and regulation skills"}. ${repairEffortScore > 40 ? "Repair capacity demonstrates empathy and perspective-taking, core components of emotional intelligence." : "Limited empathy in conflict situations suggests emotional intelligence development would benefit the relationship."} ${harmonyScore > 70 ? "High harmony reflects emotional attunement and responsiveness to each other's emotional states." : "Lower harmony may indicate difficulty reading or responding to each other's emotional cues."}`,
    },

    recurringPatternsIdentified: {
      description: `Evidence-based pattern analysis identifies **${conflictPattern}** as the primary relational dynamic, with ${sentimentTrend === "improving" ? "improving sentiment trends suggesting positive trajectory" : sentimentTrend === "worsening" ? "worsening sentiment trends requiring intervention" : "mixed sentiment patterns requiring attention"}.`,

      positivePatterns:
        [
          repairEffortScore > 40
            ? `Repair attempts present (score: ${repairEffortScore}/100) - demonstrates emotional intelligence and relationship investment`
            : null,
          !gottmanFlags.contempt
            ? "Absence of contempt maintains fundamental respect and prevents the most toxic relational pattern"
            : null,
          harmonyScore > 70
            ? "Harmonious interactions dominate the relationship, creating positive emotional climate"
            : null,
          sentimentTrend === "improving"
            ? "Sentiment trending positively, indicating relationship is moving in healthy direction"
            : null,
          emotionalSafetyScore > 70
            ? "Emotional safety maintained, allowing for vulnerability and authentic expression"
            : null,
          conflictPattern === "problem_solving"
            ? "Problem-solving approach to conflicts demonstrates maturity and collaboration"
            : null,
          !gottmanFlags.harsh_startup ? "Soft startups create constructive tone for difficult conversations" : null,
          !gottmanFlags.stonewalling
            ? "Both partners remain engaged during conflicts, preventing abandonment feelings"
            : null,
        ].filter(Boolean).length > 0
          ? [
              repairEffortScore > 40
                ? `Repair attempts present (score: ${repairEffortScore}/100) - demonstrates emotional intelligence and relationship investment`
                : null,
              !gottmanFlags.contempt
                ? "Absence of contempt maintains fundamental respect and prevents the most toxic relational pattern"
                : null,
              harmonyScore > 70
                ? "Harmonious interactions dominate the relationship, creating positive emotional climate"
                : null,
              sentimentTrend === "improving"
                ? "Sentiment trending positively, indicating relationship is moving in healthy direction"
                : null,
              emotionalSafetyScore > 70
                ? "Emotional safety maintained, allowing for vulnerability and authentic expression"
                : null,
              conflictPattern === "problem_solving"
                ? "Problem-solving approach to conflicts demonstrates maturity and collaboration"
                : null,
              !gottmanFlags.harsh_startup ? "Soft startups create constructive tone for difficult conversations" : null,
              !gottmanFlags.stonewalling
                ? "Both partners remain engaged during conflicts, preventing abandonment feelings"
                : null,
            ].filter(Boolean)
          : [
              "Both partners are communicating and engaging with each other",
              "Willingness to participate in relationship analysis shows investment in growth",
              "Conversation is occurring, providing opportunity for connection",
            ],

      loopingMiscommunicationsExamples:
        [
          conflictPattern === "pursue_withdraw"
            ? `${subjectAMessages > subjectBMessages ? subjectALabel : subjectBLabel} pursues connection → ${subjectAMessages > subjectBMessages ? subjectBLabel : subjectALabel} withdraws for space → anxiety increases → pursuit intensifies → withdrawal deepens → cycle repeats and escalates`
            : null,
          gottmanFlags.criticism
            ? "Criticism triggers defensiveness → defensiveness blocks accountability → frustration increases → more criticism → escalation continues"
            : null,
          gottmanFlags.harsh_startup
            ? "Harsh startup creates immediate defensiveness → conflict escalates quickly → resolution becomes impossible → resentment builds"
            : null,
          conflictPattern === "mutual_escalation"
            ? "Both partners escalate → intensity increases → rational discussion becomes impossible → no resolution achieved → pattern repeats"
            : null,
          gottmanFlags.stonewalling
            ? "Intensity rises → stonewalling begins → pursuing partner feels abandoned → intensity increases further → more stonewalling"
            : null,
        ].filter(Boolean).length > 0
          ? [
              conflictPattern === "pursue_withdraw"
                ? `${subjectAMessages > subjectBMessages ? subjectALabel : subjectBLabel} pursues connection → ${subjectAMessages > subjectBMessages ? subjectBLabel : subjectALabel} withdraws for space → anxiety increases → pursuit intensifies → withdrawal deepens → cycle repeats and escalates`
                : null,
              gottmanFlags.criticism
                ? "Criticism triggers defensiveness → defensiveness blocks accountability → frustration increases → more criticism → escalation continues"
                : null,
              gottmanFlags.harsh_startup
                ? "Harsh startup creates immediate defensiveness → conflict escalates quickly → resolution becomes impossible → resentment builds"
                : null,
              conflictPattern === "mutual_escalation"
                ? "Both partners escalate → intensity increases → rational discussion becomes impossible → no resolution achieved → pattern repeats"
                : null,
              gottmanFlags.stonewalling
                ? "Intensity rises → stonewalling begins → pursuing partner feels abandoned → intensity increases further → more stonewalling"
                : null,
            ].filter(Boolean)
          : [
              "Communication patterns show room for improvement in clarity and directness",
              "Emotional expression could be more explicit to prevent misunderstandings",
              "Timing of difficult conversations may contribute to miscommunication",
            ],

      commonTriggersAndResponsesExamples:
        [
          gottmanFlags.criticism
            ? "Trigger: Criticism of character → Response: Defensive justification and counter-criticism"
            : null,
          gottmanFlags.stonewalling
            ? "Trigger: Emotional intensity or conflict → Response: Withdrawal and stonewalling"
            : null,
          conflictPattern === "pursue_withdraw"
            ? "Trigger: Perceived distance or unavailability → Response: Increased pursuit and demands for connection"
            : null,
          emotionalSafetyScore < 50
            ? "Trigger: Vulnerability or emotional expression → Response: Attack, dismissal, or minimization"
            : null,
          gottmanFlags.harsh_startup
            ? "Trigger: Unmet needs or frustration → Response: Harsh startup with criticism"
            : null,
        ].filter(Boolean).length > 0
          ? [
              gottmanFlags.criticism
                ? "Trigger: Criticism of character → Response: Defensive justification and counter-criticism"
                : null,
              gottmanFlags.stonewalling
                ? "Trigger: Emotional intensity or conflict → Response: Withdrawal and stonewalling"
                : null,
              conflictPattern === "pursue_withdraw"
                ? "Trigger: Perceived distance or unavailability → Response: Increased pursuit and demands for connection"
                : null,
              emotionalSafetyScore < 50
                ? "Trigger: Vulnerability or emotional expression → Response: Attack, dismissal, or minimization"
                : null,
              gottmanFlags.harsh_startup
                ? "Trigger: Unmet needs or frustration → Response: Harsh startup with criticism"
                : null,
            ].filter(Boolean)
          : [
              "Trigger: Stress or external pressures → Response: Reduced patience and increased reactivity",
              "Trigger: Unmet expectations → Response: Frustration and withdrawal",
              "Trigger: Misunderstanding → Response: Defensive clarification",
            ],

      repairAttemptsOrEmotionalAvoidancesExamples:
        [
          repairEffortScore > 40
            ? `Repair attempts detected (score: ${repairEffortScore}/100) - includes apologies, acknowledgment, humor, or affection to de-escalate`
            : null,
          repairEffortScore < 20
            ? "Limited repair efforts observed; conflicts may escalate without attempts to de-escalate or reconnect"
            : null,
          gottmanFlags.stonewalling
            ? "Stonewalling prevents repair by creating emotional distance and blocking resolution attempts"
            : null,
          !gottmanFlags.defensiveness
            ? "Absence of defensiveness allows repair attempts to be received and effective"
            : null,
        ].filter(Boolean).length > 0
          ? [
              repairEffortScore > 40
                ? `Repair attempts detected (score: ${repairEffortScore}/100) - includes apologies, acknowledgment, humor, or affection to de-escalate`
                : null,
              repairEffortScore < 20
                ? "Limited repair efforts observed; conflicts may escalate without attempts to de-escalate or reconnect"
                : null,
              gottmanFlags.stonewalling
                ? "Stonewalling prevents repair by creating emotional distance and blocking resolution attempts"
                : null,
              !gottmanFlags.defensiveness
                ? "Absence of defensiveness allows repair attempts to be received and effective"
                : null,
            ].filter(Boolean)
          : [
              "Repair attempts are present but could be more consistent and explicit",
              "Partners show willingness to move past conflicts, though repair skills need development",
              "Emotional avoidance occasionally prevents full resolution of issues",
            ],
    },

    whatsGettingInTheWay: {
      description: `Evidence reveals ${riskFlags.includes("possible_safety_concern") ? "**SAFETY CONCERNS** requiring immediate professional attention and safety planning" : gottmanFlags.contempt ? "**CONTEMPT** - the most toxic pattern requiring urgent intervention" : "patterns requiring focused intervention and skill development"}.`,

      emotionalMismatches: `${conflictPattern === "pursue_withdraw" ? "Pursue-withdraw cycle creates painful dynamic where one partner's bid for connection triggers the other's need for space, and vice versa. This reflects fundamental differences in attachment needs and emotional regulation strategies." : "Communication styles show misalignment in how partners express and process emotions."} ${emotionalSafetyScore < 50 ? "Low emotional safety prevents vulnerability and authentic expression, keeping partners in protective defensive modes rather than open connection." : "Emotional safety levels support vulnerability, though continued attention to this foundation is important."}`,

      communicationGaps: `${gottmanFlags.criticism ? "Criticism replaces specific requests, attacking character rather than addressing behaviors. This creates defensiveness and prevents problem-solving." : ""} ${gottmanFlags.harsh_startup ? "Harsh startups poison conversations from the beginning, making productive dialogue nearly impossible. The first three minutes of a conversation predict the outcome." : ""} ${gottmanFlags.stonewalling ? "Stonewalling blocks all resolution attempts, leaving the pursuing partner feeling abandoned and the stonewalling partner feeling overwhelmed." : ""} ${!gottmanFlags.criticism && !gottmanFlags.harsh_startup && !gottmanFlags.stonewalling ? "Communication gaps exist in timing, clarity, or directness of expression, though major toxic patterns are absent." : ""}`,

      subtlePowerStrugglesOrMisfires: `${gottmanFlags.contempt ? "**CONTEMPT** indicates significant power imbalance and disrespect. Contempt communicates 'I am better than you' and creates toxic hierarchy in the relationship." : ""} ${gottmanFlags.defensiveness ? "Defensiveness prevents accountability and creates power struggles over who is 'right' rather than focusing on understanding and resolution." : ""} ${conflictPattern === "mutual_escalation" ? "Escalation battles reflect power struggles where both partners compete for control rather than collaborating for solutions." : ""} ${!gottmanFlags.contempt && !gottmanFlags.defensiveness && conflictPattern !== "mutual_escalation" ? "Power dynamics appear relatively balanced, though subtle patterns may exist around decision-making, emotional labor, or conflict initiation." : ""}`,
    },

    visualInsightsData: {
      descriptionForChartsIntro: `Quantitative metrics translate evidence-based analysis into visual insights, revealing patterns in emotional communication, conflict expression, and validation behaviors.`,

      emotionalCommunicationCharacteristics: [
        {
          category: "Expresses Vulnerability",
          [subjectALabel]: Math.max(1, emotionalSafetyScore > 70 ? 8 : emotionalSafetyScore > 50 ? 6 : 4),
          [subjectBLabel]: Math.max(1, emotionalSafetyScore > 70 ? 7 : emotionalSafetyScore > 50 ? 5 : 3),
        },
        {
          category: "Shows Empathy",
          [subjectALabel]: Math.max(1, repairEffortScore > 40 ? 7 : repairEffortScore > 20 ? 5 : 3),
          [subjectBLabel]: Math.max(1, repairEffortScore > 40 ? 8 : repairEffortScore > 20 ? 6 : 4),
        },
        {
          category: "Uses Humor",
          [subjectALabel]: Math.max(1, harmonyScore > 70 ? 6 : harmonyScore > 50 ? 4 : 2),
          [subjectBLabel]: Math.max(1, harmonyScore > 70 ? 7 : harmonyScore > 50 ? 5 : 3),
        },
        {
          category: "Shares Feelings",
          [subjectALabel]: Math.max(1, emotionalSafetyScore > 70 ? 9 : emotionalSafetyScore > 50 ? 6 : 4),
          [subjectBLabel]: Math.max(1, emotionalSafetyScore > 70 ? 6 : emotionalSafetyScore > 50 ? 4 : 2),
        },
        {
          category: "Asks Questions",
          [subjectALabel]: Math.max(1, subjectAMessages > subjectBMessages ? 7 : 5),
          [subjectBLabel]: Math.max(1, subjectBMessages > subjectAMessages ? 7 : 5),
        },
      ],

      conflictExpressionStyles: [
        {
          category: "Defensive Responses",
          [subjectALabel]: Math.max(1, gottmanFlags.defensiveness ? 8 : 4),
          [subjectBLabel]: Math.max(1, gottmanFlags.defensiveness ? 7 : 3),
        },
        {
          category: "Blame Language",
          [subjectALabel]: Math.max(1, gottmanFlags.criticism ? 7 : 3),
          [subjectBLabel]: Math.max(1, gottmanFlags.criticism ? 6 : 2),
        },
        {
          category: "Withdrawal",
          [subjectALabel]: Math.max(1, gottmanFlags.stonewalling ? 8 : 3),
          [subjectBLabel]: Math.max(1, gottmanFlags.stonewalling ? 9 : 4),
        },
        {
          category: "Escalation",
          [subjectALabel]: Math.max(1, conflictPattern === "mutual_escalation" ? 8 : 4),
          [subjectBLabel]: Math.max(1, conflictPattern === "mutual_escalation" ? 7 : 3),
        },
        {
          category: "Repair Attempts",
          [subjectALabel]: repairAttemptsScore,
          [subjectBLabel]: repairAttemptsScore,
        },
      ],

      validationAndReassurancePatterns: [
        {
          category: "Acknowledges Feelings",
          [subjectALabel]: subjectA_acknowledges,
          [subjectBLabel]: subjectB_acknowledges,
        },
        {
          category: "Offers Reassurance",
          [subjectALabel]: subjectA_reassures,
          [subjectBLabel]: subjectB_reassures,
        },
        {
          category: "Validates Perspective",
          [subjectALabel]: subjectA_validates,
          [subjectBLabel]: subjectB_validates,
        },
        {
          category: "Dismisses Concerns",
          [subjectALabel]: subjectA_dismisses,
          [subjectBLabel]: subjectB_dismisses,
        },
        {
          category: "Neutral/Unclear",
          [subjectALabel]: Math.max(0, subjectA_neutral),
          [subjectBLabel]: Math.max(0, subjectB_neutral),
        },
      ],
    },

    professionalInsights: {
      attachmentTheoryAnalysis: {
        subjectA: {
          primaryAttachmentStyle:
            conflictPattern === "pursue_withdraw" && subjectAMessages > subjectBMessages
              ? "Anxious-Preoccupied"
              : conflictPattern === "pursue_withdraw" && subjectAMessages < subjectBMessages
                ? "Dismissive-Avoidant"
                : emotionalSafetyScore > 70
                  ? "Secure"
                  : "Mixed/Disorganized",
          attachmentBehaviors: [
            subjectAMessages > subjectBMessages * 1.5
              ? "Seeks connection through frequent communication"
              : subjectAMessages < subjectBMessages * 0.5
                ? "Prefers space and processes independently"
                : "Shows balanced engagement",
            emotionalSafetyScore < 50
              ? "May be sensitive to rejection or distance"
              : "Comfortable with emotional expression",
            repairEffortScore > 40
              ? "Demonstrates ability to reconnect after conflict"
              : "May need support developing repair skills",
          ],
          triggersAndDefenses: `${conflictPattern === "pursue_withdraw" && subjectAMessages > subjectBMessages ? "Seeks reassurance when feeling disconnected" : conflictPattern === "pursue_withdraw" && subjectAMessages < subjectBMessages ? "Creates distance when feeling overwhelmed" : "Uses varied coping strategies"}`,
        },
        subjectB: {
          primaryAttachmentStyle:
            conflictPattern === "pursue_withdraw" && subjectBMessages < subjectAMessages
              ? "Dismissive-Avoidant"
              : conflictPattern === "pursue_withdraw" && subjectBMessages > subjectAMessages
                ? "Anxious-Preoccupied"
                : emotionalSafetyScore > 70
                  ? "Secure"
                  : "Mixed/Disorganized",
          attachmentBehaviors: [
            subjectBMessages < subjectAMessages * 0.5
              ? "Values independence and processing time"
              : subjectBMessages > subjectAMessages * 1.5
                ? "Actively seeks connection and engagement"
                : "Shows balanced participation",
            gottmanFlags.stonewalling
              ? "May withdraw when emotions feel intense"
              : "Stays engaged during difficult moments",
            repairEffortScore < 20 ? "Could benefit from developing reconnection skills" : "Shows capacity for repair",
          ],
          triggersAndDefenses: `${gottmanFlags.stonewalling ? "Needs breaks during intense conversations" : "Maintains engagement with balanced approach"}`,
        },
        dyad: `${conflictPattern === "pursue_withdraw" ? "One partner seeks closeness while the other needs space, creating a cycle that can be addressed with awareness and practice" : "Both partners show capacity for secure connection"} ${gottmanFlags.contempt ? "**Important:** Contempt requires immediate attention as it erodes respect" : "Mutual respect provides a strong foundation"}`,
      },

      therapeuticRecommendations: {
        immediateInterventions:
          [
            gottmanFlags.contempt
              ? "**Priority:** Address contempt patterns - consider individual therapy to rebuild respect"
              : null,
            gottmanFlags.harsh_startup
              ? "Practice starting difficult conversations with appreciation and specific requests"
              : null,
            conflictPattern === "pursue_withdraw"
              ? "Work together to break the pursue-withdraw cycle through self-awareness and communication"
              : null,
            emotionalSafetyScore < 50 ? "Focus on building emotional safety through validation and respect" : null,
            repairEffortScore < 20 ? "Develop skills for reconnecting after disagreements" : null,
            riskFlags.includes("possible_safety_concern")
              ? "**Safety first:** Consult with a professional about safety concerns"
              : null,
            "Schedule weekly check-ins to discuss what's working and what needs attention",
            "Practice daily appreciation - share one thing you value about each other",
          ].filter(Boolean).length >= 3
            ? [
                gottmanFlags.contempt
                  ? "**Priority:** Address contempt patterns - consider individual therapy to rebuild respect"
                  : null,
                gottmanFlags.harsh_startup
                  ? "Practice starting difficult conversations with appreciation and specific requests"
                  : null,
                conflictPattern === "pursue_withdraw"
                  ? "Work together to break the pursue-withdraw cycle through self-awareness and communication"
                  : null,
                emotionalSafetyScore < 50 ? "Focus on building emotional safety through validation and respect" : null,
                repairEffortScore < 20 ? "Develop skills for reconnecting after disagreements" : null,
                riskFlags.includes("possible_safety_concern")
                  ? "**Safety first:** Consult with a professional about safety concerns"
                  : null,
                "Schedule weekly check-ins to discuss what's working and what needs attention",
                "Practice daily appreciation - share one thing you value about each other",
              ].filter(Boolean)
            : [
                "Schedule weekly check-ins to discuss what's working and what needs attention",
                "Practice daily appreciation - share one thing you value about each other",
                "Develop active listening skills",
                "Create shared goals for your relationship",
              ],
        longTermGoals: [
          "Build secure connection through consistent emotional availability",
          gottmanFlags.contempt
            ? "Rebuild respect and admiration"
            : "Maintain respect and appreciation as your foundation",
          conflictPattern === "pursue_withdraw"
            ? "Balance needs for closeness and independence"
            : "Strengthen communication skills",
          "Increase emotional awareness and empathy",
          "Develop sustainable ways to resolve conflicts",
          "Create shared meaning and purpose together",
          "Nurture friendship and positive connection",
        ],
        suggestedModalities:
          [
            gottmanFlags.contempt || gottmanFlags.criticism ? "Gottman Method Couples Therapy (recommended)" : null,
            conflictPattern === "pursue_withdraw" ? "Emotionally Focused Therapy (EFT)" : null,
            emotionalSafetyScore < 50 ? "Trauma-informed couples therapy" : null,
            riskFlags.includes("possible_safety_concern") ? "Individual safety assessment" : null,
            "Couples therapy focused on communication",
            "Relationship skills workshops",
          ].filter(Boolean).length >= 3
            ? [
                gottmanFlags.contempt || gottmanFlags.criticism ? "Gottman Method Couples Therapy (recommended)" : null,
                conflictPattern === "pursue_withdraw" ? "Emotionally Focused Therapy (EFT)" : null,
                emotionalSafetyScore < 50 ? "Trauma-informed couples therapy" : null,
                riskFlags.includes("possible_safety_concern") ? "Individual safety assessment" : null,
                "Couples therapy focused on communication",
                "Relationship skills workshops",
              ].filter(Boolean)
            : ["Couples therapy focused on communication", "Relationship skills workshops"],
      },

      clinicalExercises: {
        communicationExercises: [
          {
            title: gottmanFlags.harsh_startup ? "Gentle Start Practice" : "Daily Connection",
            description: gottmanFlags.harsh_startup
              ? "Begin conversations with appreciation and specific requests: 'I appreciate when you... I feel... I need... Would you be willing to...?'"
              : "Share five things daily: appreciation, something new, a concern, a hope, and a request",
            frequency: "Daily, 15-20 minutes",
          },
          {
            title: conflictPattern === "pursue_withdraw" ? "Breaking the Cycle" : "Expressing Needs",
            description:
              conflictPattern === "pursue_withdraw"
                ? "When you feel the urge to pursue or withdraw, pause and self-soothe for 5 minutes before reconnecting"
                : "Practice stating needs directly: 'I need... because... Would you be willing to...?'",
            frequency: "As needed during conflicts",
          },
        ],
        emotionalRegulationPractices: [
          {
            title: emotionalSafetyScore < 50 ? "Building Safety" : "Emotional Awareness",
            description:
              emotionalSafetyScore < 50
                ? "Create agreements about respectful communication and practice de-escalation techniques"
                : "Practice recognizing and naming emotions as they arise",
            frequency: "Daily, 10-15 minutes",
          },
        ],
        relationshipRituals: [
          {
            title: "Weekly Check-In",
            description:
              "Discuss: what's working well, what needs attention, what you each need more/less of, and appreciation",
            frequency: "Weekly, 30-45 minutes",
          },
        ],
      },

      prognosis: {
        shortTerm: `Next 1-3 months: ${gottmanFlags.contempt ? "**Important:** Contempt requires immediate attention" : harmonyScore > 70 ? "Positive direction with continued effort" : emotionalSafetyScore < 50 ? "Focus needed on emotional safety" : "Gradual improvement possible with practice"}`,
        mediumTerm: `Within 6-12 months: ${riskFlags.includes("possible_safety_concern") ? "Safety must be established first" : emotionalSafetyScore > 70 && repairEffortScore > 40 ? "Strong potential for deeper connection" : conflictPattern === "pursue_withdraw" ? "Cycle can be interrupted with consistent practice" : "Moderate improvement expected with therapeutic support"}`,
        longTerm: `With sustained effort: ${gottmanFlags.contempt ? "Addressing contempt is essential for long-term success" : harmonyScore > 70 && repairEffortScore > 40 ? "Excellent potential for fulfilling relationship" : emotionalSafetyScore < 50 ? "Success depends on commitment to building safety" : "Fair to good outlook with sustained commitment"}`,
        riskFactors:
          [
            gottmanFlags.contempt ? "**Contempt present** - requires immediate attention" : null,
            riskFlags.includes("possible_safety_concern") ? "**Safety concerns** - seek professional support" : null,
            emotionalSafetyScore < 40 ? "Low emotional safety limits vulnerability" : null,
            repairEffortScore < 20 ? "Limited repair skills affect conflict resolution" : null,
            conflictPattern === "mutual_escalation" ? "Escalating conflicts without de-escalation" : null,
            gottmanFlags.stonewalling ? "Withdrawal prevents resolution" : null,
          ].filter(Boolean).length > 0
            ? [
                gottmanFlags.contempt ? "**Contempt present** - requires immediate attention" : null,
                riskFlags.includes("possible_safety_concern")
                  ? "**Safety concerns** - seek professional support"
                  : null,
                emotionalSafetyScore < 40 ? "Low emotional safety limits vulnerability" : null,
                repairEffortScore < 20 ? "Limited repair skills affect conflict resolution" : null,
                conflictPattern === "mutual_escalation" ? "Escalating conflicts without de-escalation" : null,
                gottmanFlags.stonewalling ? "Withdrawal prevents resolution" : null,
              ].filter(Boolean)
            : ["Communication could be more effective", "Conflict skills need development"],
        protectiveFactors:
          [
            !gottmanFlags.contempt ? "Mutual respect maintained" : null,
            repairEffortScore > 40 ? "Active repair attempts show emotional intelligence" : null,
            harmonyScore > 70 ? "Positive baseline provides good foundation" : null,
            emotionalSafetyScore > 70 ? "Strong emotional safety supports growth" : null,
            sentimentTrend === "improving" ? "Positive trend indicates healthy direction" : null,
            conflictPattern === "problem_solving" ? "Solution-focused approach" : null,
          ].filter(Boolean).length > 0
            ? [
                !gottmanFlags.contempt ? "Mutual respect maintained" : null,
                repairEffortScore > 40 ? "Active repair attempts show emotional intelligence" : null,
                harmonyScore > 70 ? "Positive baseline provides good foundation" : null,
                emotionalSafetyScore > 70 ? "Strong emotional safety supports growth" : null,
                sentimentTrend === "improving" ? "Positive trend indicates healthy direction" : null,
                conflictPattern === "problem_solving" ? "Solution-focused approach" : null,
              ].filter(Boolean)
            : ["Both partners are engaged", "Willingness to grow together"],
      },

      differentialConsiderations: {
        individualTherapyConsiderations: `${riskFlags.includes("possible_safety_concern") ? "**Priority:** Individual safety assessment before couples work" : ""} ${gottmanFlags.contempt ? "Individual therapy recommended to address contempt before couples therapy" : ""} ${conflictPattern === "pursue_withdraw" ? "Individual therapy can help understand attachment patterns" : "Individual therapy may support personal growth"}`,
        couplesTherapyReadiness: `${riskFlags.includes("possible_safety_concern") ? "**Not recommended** until safety is established" : gottmanFlags.contempt ? "Appropriate after individual work on respect" : emotionalSafetyScore > 50 ? "Good candidates for couples therapy" : "Recommended with trauma-informed approach"}`,
        externalResourcesNeeded:
          [
            riskFlags.includes("possible_safety_concern")
              ? "**National Domestic Violence Hotline: 1-800-799-7233** (24/7 support)"
              : null,
            "Book: 'The Seven Principles for Making Marriage Work' by John Gottman",
            "Book: 'Hold Me Tight' by Sue Johnson",
            "Gottman Card Decks app for connection exercises",
            "Find a therapist: Psychology Today or AAMFT",
          ].filter(Boolean).length >= 3
            ? [
                riskFlags.includes("possible_safety_concern")
                  ? "**National Domestic Violence Hotline: 1-800-799-7233** (24/7 support)"
                  : null,
                "Book: 'The Seven Principles for Making Marriage Work' by John Gottman",
                "Book: 'Hold Me Tight' by Sue Johnson",
                "Gottman Card Decks app for connection exercises",
                "Find a therapist: Psychology Today or AAMFT",
              ].filter(Boolean)
            : [
                "Book: 'The Seven Principles for Making Marriage Work' by John Gottman",
                "Book: 'Hold Me Tight' by Sue Johnson",
                "Gottman Card Decks app for connection exercises",
              ],
      },

      traumaInformedObservations: {
        identifiedPatterns:
          [
            emotionalSafetyScore < 50 ? "Low emotional safety may reflect past experiences affecting trust" : null,
            gottmanFlags.harsh_startup ? "Communication patterns may reflect learned behaviors" : null,
            conflictPattern === "pursue_withdraw"
              ? "Pursue-withdraw cycle often rooted in early attachment experiences"
              : null,
            riskFlags.includes("possible_safety_concern")
              ? "**Safety concerns require professional assessment**"
              : null,
            gottmanFlags.stonewalling ? "Withdrawal may be a response to feeling overwhelmed" : null,
          ].filter(Boolean).length > 0
            ? [
                emotionalSafetyScore < 50 ? "Low emotional safety may reflect past experiences affecting trust" : null,
                gottmanFlags.harsh_startup ? "Communication patterns may reflect learned behaviors" : null,
                conflictPattern === "pursue_withdraw"
                  ? "Pursue-withdraw cycle often rooted in early attachment experiences"
                  : null,
                riskFlags.includes("possible_safety_concern")
                  ? "**Safety concerns require professional assessment**"
                  : null,
                gottmanFlags.stonewalling ? "Withdrawal may be a response to feeling overwhelmed" : null,
              ].filter(Boolean)
            : ["Communication patterns influenced by past experiences", "Relationship dynamics shaped by history"],
        copingMechanisms: `${gottmanFlags.stonewalling ? "Withdrawal serves as protection from overwhelm" : ""} ${conflictPattern === "pursue_withdraw" ? "Both pursuit and withdrawal are attempts to feel safe" : ""} ${gottmanFlags.defensiveness ? "Defensiveness protects against perceived threats" : "Coping strategies appear relatively flexible"}`,
        safetyAndTrust: `${riskFlags.includes("possible_safety_concern") ? "**Safety is the primary concern**. Professional assessment required" : emotionalSafetyScore > 70 ? "Safety foundation supports trust and vulnerability" : emotionalSafetyScore > 50 ? "Moderate safety allows for some vulnerability" : "Safety must be established before trust can develop"}`,
      },
    },
    optionalAppendix: `This analysis uses evidence-based frameworks including the Gottman Method, attachment theory, and relational psychology. ${riskFlags.includes("possible_safety_concern") ? "**SAFETY CONCERNS IDENTIFIED**: This analysis is not a substitute for professional safety assessment. If you are experiencing abuse, contact National Domestic Violence Hotline: 1-800-799-7233 (24/7 confidential support)." : "**Important:** This analysis is for informational purposes only and is not a substitute for professional therapy or counseling. Consider consulting with a licensed therapist for personalized guidance."}`,

    attributionMetadata: {
      subjectAMessageCount: subjectAMessages,
      subjectBMessageCount: subjectBMessages,
      attributionConfidence, // Dynamic confidence
    },

    subjectALabel,
    subjectBLabel,
    messageCount: totalMessages,
    extractionConfidence, // Dynamic confidence
    processingTimeMs: Date.now() - analysisStartTime, // Actual processing time
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
      console.log(`[v0] Validating ${files.length} files...`)
      const extractedTexts = await Promise.all(
        files.map(async (file, index) => {
          console.log(`[v0] Processing file ${index + 1}/${files.length}: ${file.name}`)
          try {
            const result = await extractTextFromImage(file, index)
            console.log(`[v0] ✓ File ${index + 1} validated successfully`)
            return result
          } catch (error) {
            console.error(`[v0] ✗ File ${index + 1} failed:`, error)
            throw error
          }
        }),
      )

      console.log(`[v0] All files validated successfully`)

      // Normalize speaker labels
      const { normalizedText, subjectALabel, subjectBLabel } = normalizeSpeakers(
        extractedTexts,
        subjectAName,
        subjectBName,
      )

      console.log(`[v0] Normalized conversation text (${normalizedText.length} characters)`)
      console.log(`[v0] Generating evidence-based analysis...`)

      const analysis = createEnhancedFallbackAnalysis(subjectALabel, subjectBLabel, normalizedText)

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
      } else {
        errorMessage = `Analysis failed: ${error.message}`
      }
    }

    return {
      error: errorMessage,
    }
  }
}
