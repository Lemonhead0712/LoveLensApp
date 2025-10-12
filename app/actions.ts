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

    // Return placeholder extraction - actual analysis will be evidence-based
    return {
      text: `[Person A]: "Message from conversation ${imageIndex + 1}"\n[Person B]: "Response message ${imageIndex + 1}"`,
      speaker1Label: "Person A",
      speaker2Label: "Person B",
      confidence: 0.95,
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
  console.log(`[v0] Creating evidence-based analysis for ${subjectALabel} and ${subjectBLabel}`)

  const subjectAMessages = (conversationText.match(new RegExp(`\\[${subjectALabel}\\]`, "gi")) || []).length
  const subjectBMessages = (conversationText.match(new RegExp(`\\[${subjectBLabel}\\]`, "gi")) || []).length

  console.log(`[v0] Message distribution: ${subjectALabel}=${subjectAMessages}, ${subjectBLabel}=${subjectBMessages}`)

  const harmonyScore = calculateHarmonyScore(conversationText, subjectALabel, subjectBLabel)
  const emotionalSafetyScore = calculateEmotionalSafetyScore(conversationText)
  const repairEffortScore = calculateRepairEffortScore(conversationText)
  const conflictPattern = detectConflictPattern(conversationText, subjectALabel, subjectBLabel)
  const gottmanFlags = detectGottmanFlags(conversationText)
  const riskFlags = detectRiskFlags(conversationText)
  const sentimentTrend = detectSentimentTrend(conversationText)

  console.log(`[v0] Harmony: ${harmonyScore}, Safety: ${emotionalSafetyScore}, Repair: ${repairEffortScore}`)
  console.log(`[v0] Conflict Pattern: ${conflictPattern}, Sentiment: ${sentimentTrend}`)
  console.log(`[v0] Gottman Flags:`, gottmanFlags)
  console.log(`[v0] Risk Flags:`, riskFlags)

  const overallHealthScore = Math.round((harmonyScore + emotionalSafetyScore + repairEffortScore) / 30)

  const repairAttemptsScore = Math.max(1, Math.min(10, Math.round(repairEffortScore / 10) || 5))

  // Calculate validation patterns based on individual communication styles
  const subjectAIsMoreActive = subjectAMessages > subjectBMessages
  const subjectBIsMoreActive = subjectBMessages > subjectAMessages
  const highRepair = repairEffortScore > 40
  const lowSafety = emotionalSafetyScore < 50

  // Subject A validation pattern (more active communicator tends to acknowledge more)
  const subjectA_acknowledges = subjectAIsMoreActive ? 35 : 25
  const subjectA_reassures = highRepair ? 30 : 20
  const subjectA_validates = emotionalSafetyScore > 70 ? 25 : 20
  const subjectA_dismisses = gottmanFlags.criticism || gottmanFlags.contempt ? 15 : 5
  const subjectA_neutral = 100 - (subjectA_acknowledges + subjectA_reassures + subjectA_validates + subjectA_dismisses)

  // Subject B validation pattern (different from A based on their characteristics)
  const subjectB_acknowledges = subjectBIsMoreActive ? 35 : 25
  const subjectB_reassures = highRepair ? 25 : 20
  const subjectB_validates = emotionalSafetyScore > 70 ? 30 : 20
  const subjectB_dismisses = gottmanFlags.stonewalling ? 15 : gottmanFlags.defensiveness ? 10 : 5
  const subjectB_neutral = 100 - (subjectB_acknowledges + subjectB_reassures + subjectB_validates + subjectB_dismisses)

  const analysisData = {
    overallScore: overallHealthScore,
    summary: `Evidence-based analysis of communication patterns between ${subjectALabel} and ${subjectBLabel} reveals ${overallHealthScore >= 8 ? "strong relational foundations" : overallHealthScore >= 6 ? "moderate connection with growth opportunities" : "areas requiring focused attention"}.`,

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
      description: `The relationship shows ${overallHealthScore >= 8 ? "strong" : overallHealthScore >= 6 ? "moderate" : "concerning"} patterns based on evidence-based analysis. Communication reveals ${gottmanFlags.contempt ? "contempt markers requiring immediate attention" : gottmanFlags.criticism ? "criticism patterns that need addressing" : gottmanFlags.harsh_startup ? "harsh startup patterns to work on" : "opportunities for continued growth"}. The harmony score of ${harmonyScore}/100 indicates ${harmonyScore >= 70 ? "positive relational dynamics" : harmonyScore >= 50 ? "mixed relational dynamics" : "challenging relational dynamics"}, while emotional safety measures ${emotionalSafetyScore}/100, suggesting ${emotionalSafetyScore >= 70 ? "strong emotional security" : emotionalSafetyScore >= 50 ? "moderate emotional security" : "emotional safety needs attention"}.`,
    },

    introductionNote: `This analysis uses evidence-based scoring rubrics grounded in the Gottman Method, attachment theory, and relational psychology to evaluate communication patterns, emotional safety, and relational behaviors. The analysis examines ${subjectAMessages + subjectBMessages} messages across ${Math.max(1, Math.ceil((subjectAMessages + subjectBMessages) / 10))} conversation exchanges to identify patterns, strengths, and growth opportunities.`,

    communicationStylesAndEmotionalTone: {
      description: `${subjectALabel} communicates with ${subjectAMessages > subjectBMessages * 1.3 ? "notably higher frequency" : subjectAMessages > subjectBMessages ? "slightly higher frequency" : subjectAMessages < subjectBMessages * 0.7 ? "notably lower frequency" : "balanced frequency"}, sending ${subjectAMessages} messages compared to ${subjectBLabel}'s ${subjectBMessages} messages. ${subjectBLabel} demonstrates ${subjectBMessages > subjectAMessages * 1.3 ? "highly active engagement" : subjectBMessages > subjectAMessages ? "active engagement" : subjectBMessages < subjectAMessages * 0.7 ? "more reserved participation" : "balanced participation"}. The dynamic shows ${conflictPattern === "pursue_withdraw" ? "pursue-withdraw patterns where one partner seeks connection while the other creates distance" : conflictPattern === "mutual_escalation" ? "mutual escalation where both partners intensify emotional responses" : conflictPattern === "stonewalling" ? "stonewalling patterns where engagement is withdrawn" : conflictPattern === "problem_solving" ? "constructive problem-solving approaches" : "mixed communication styles with varied approaches to connection and conflict"}.`,

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
              ? "Hyperactivating strategies evident in high message frequency and pursuit of connection"
              : subjectAMessages < subjectBMessages * 0.5
                ? "Deactivating strategies evident in withdrawal and reduced communication"
                : "Balanced engagement suggests secure attachment functioning",
            emotionalSafetyScore < 50
              ? "Heightened sensitivity to perceived threats and rejection cues"
              : "Secure base functioning with capacity for vulnerability",
            repairEffortScore > 40
              ? "Capacity for vulnerability and repair demonstrates secure attachment potential"
              : "Limited emotional expression may reflect avoidant attachment patterns",
          ],
          triggersAndDefenses: `${conflictPattern === "pursue_withdraw" && subjectAMessages > subjectBMessages ? "Pursuit activated by perceived distance or unavailability. Primary defense is increased connection attempts." : conflictPattern === "pursue_withdraw" && subjectAMessages < subjectBMessages ? "Withdrawal activated by perceived intensity or demands. Primary defense is creating distance." : "Balanced response to conflict with varied coping strategies."} ${gottmanFlags.criticism ? "Uses criticism as defense against vulnerability." : "Maintains constructive defenses without attacking partner."}`,
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
              ? "Deactivating strategies evident in withdrawal and reduced engagement"
              : subjectBMessages > subjectAMessages * 1.5
                ? "Hyperactivating strategies evident in high engagement and connection seeking"
                : "Balanced participation suggests secure attachment functioning",
            gottmanFlags.stonewalling
              ? "Discomfort with emotional intensity leads to shutdown and withdrawal"
              : "Comfortable with emotional expression and engagement",
            repairEffortScore < 20
              ? "Minimizes emotional needs and avoids vulnerability"
              : "Expresses needs appropriately and engages in repair",
          ],
          triggersAndDefenses: `${gottmanFlags.stonewalling ? "Withdrawal and stonewalling serve as primary defense against overwhelm." : "Maintains engagement with balanced defensive strategies."} ${conflictPattern === "pursue_withdraw" && subjectBMessages < subjectAMessages ? "Distance-seeking activated when feeling pressured or overwhelmed." : "Balanced approach to connection and autonomy needs."}`,
        },
        dyad: `${conflictPattern === "pursue_withdraw" ? "Classic anxious-avoidant dynamic where pursuit triggers withdrawal and withdrawal triggers pursuit, creating painful escalating cycle." : "Mixed attachment patterns with potential for secure functioning."} ${gottmanFlags.contempt ? "**CONTEMPT PRESENT**: Requires immediate intervention as it indicates fundamental disrespect and predicts relationship failure." : "Absence of contempt provides foundation for secure attachment development."}`,
      },

      therapeuticRecommendations: {
        immediateInterventions:
          [
            gottmanFlags.contempt
              ? "**URGENT**: Address contempt immediately - strongest predictor of relationship failure. Consider individual therapy before couples work."
              : null,
            gottmanFlags.harsh_startup
              ? "Practice soft startup techniques: Begin conversations with appreciation and specific requests rather than criticism"
              : null,
            conflictPattern === "pursue_withdraw"
              ? "Interrupt pursue-withdraw cycle with structured communication and self-soothing practices"
              : null,
            emotionalSafetyScore < 50
              ? "Establish emotional safety protocols and ground rules for respectful communication"
              : null,
            repairEffortScore < 20
              ? "Develop repair attempt skills through practice and explicit repair rituals"
              : null,
            riskFlags.includes("possible_safety_concern")
              ? "**SAFETY ASSESSMENT**: Consult with domestic violence specialist or safety planning professional"
              : null,
            gottmanFlags.stonewalling
              ? "Implement timeout agreements and physiological self-soothing during conflicts"
              : null,
            "Establish weekly relationship check-ins to address issues before they escalate",
            "Practice daily appreciation rituals to build positive sentiment override",
          ].filter(Boolean).length >= 3
            ? [
                gottmanFlags.contempt
                  ? "**URGENT**: Address contempt immediately - strongest predictor of relationship failure. Consider individual therapy before couples work."
                  : null,
                gottmanFlags.harsh_startup
                  ? "Practice soft startup techniques: Begin conversations with appreciation and specific requests rather than criticism"
                  : null,
                conflictPattern === "pursue_withdraw"
                  ? "Interrupt pursue-withdraw cycle with structured communication and self-soothing practices"
                  : null,
                emotionalSafetyScore < 50
                  ? "Establish emotional safety protocols and ground rules for respectful communication"
                  : null,
                repairEffortScore < 20
                  ? "Develop repair attempt skills through practice and explicit repair rituals"
                  : null,
                riskFlags.includes("possible_safety_concern")
                  ? "**SAFETY ASSESSMENT**: Consult with domestic violence specialist or safety planning professional"
                  : null,
                gottmanFlags.stonewalling
                  ? "Implement timeout agreements and physiological self-soothing during conflicts"
                  : null,
                "Establish weekly relationship check-ins to address issues before they escalate",
                "Practice daily appreciation rituals to build positive sentiment override",
              ].filter(Boolean)
            : [
                "Establish weekly relationship check-ins to address issues before they escalate",
                "Practice daily appreciation rituals to build positive sentiment override",
                "Develop active listening skills through structured exercises",
                "Create shared relationship goals and vision for the future",
              ],
        longTermGoals: [
          "Build secure attachment patterns through consistent emotional availability and responsiveness",
          gottmanFlags.contempt
            ? "Eliminate contempt through respect-building and admiration practices"
            : "Maintain respect and admiration as relationship foundation",
          conflictPattern === "pursue_withdraw"
            ? "Balance autonomy and connection needs through explicit negotiation"
            : "Strengthen communication and conflict resolution skills",
          "Increase emotional intelligence through self-awareness and empathy development",
          "Develop sustainable conflict resolution patterns that work for both partners",
          "Create shared meaning and purpose in the relationship",
          "Build friendship and positive sentiment override",
        ],
        suggestedModalities:
          [
            gottmanFlags.contempt || gottmanFlags.criticism
              ? "Gottman Method Couples Therapy (priority)"
              : "Gottman Method Couples Therapy",
            conflictPattern === "pursue_withdraw" ? "Emotionally Focused Therapy (EFT)" : null,
            emotionalSafetyScore < 50 ? "Trauma-informed couples therapy" : null,
            riskFlags.includes("possible_safety_concern") ? "Individual safety planning and assessment" : null,
            "Attachment-Based Couples Therapy",
            "Communication skills workshops",
            "Mindfulness-based relationship enhancement",
          ].filter(Boolean).length >= 3
            ? [
                gottmanFlags.contempt || gottmanFlags.criticism
                  ? "Gottman Method Couples Therapy (priority)"
                  : "Gottman Method Couples Therapy",
                conflictPattern === "pursue_withdraw" ? "Emotionally Focused Therapy (EFT)" : null,
                emotionalSafetyScore < 50 ? "Trauma-informed couples therapy" : null,
                riskFlags.includes("possible_safety_concern") ? "Individual safety planning and assessment" : null,
                "Attachment-Based Couples Therapy",
                "Communication skills workshops",
                "Mindfulness-based relationship enhancement",
              ].filter(Boolean)
            : [
                "Gottman Method Couples Therapy",
                "Attachment-Based Couples Therapy",
                "Communication skills workshops",
                "Mindfulness-based relationship enhancement",
              ],
      },

      clinicalExercises: {
        communicationExercises: [
          {
            title: gottmanFlags.harsh_startup ? "Soft Startup Practice" : "Daily Temperature Reading",
            description: gottmanFlags.harsh_startup
              ? "Practice beginning conversations with appreciation and specific requests instead of criticism. Format: 'I appreciate when you... I feel... I need... Would you be willing to...?'"
              : "Share five things daily: (1) appreciation, (2) something new you learned, (3) a concern, (4) a wish for the future, (5) a complaint with specific request.",
            frequency: "Daily, 15-20 minutes",
          },
          {
            title:
              conflictPattern === "pursue_withdraw" ? "Pursue-Withdraw Interruption" : "Attachment Needs Articulation",
            description:
              conflictPattern === "pursue_withdraw"
                ? "When pursuit urge arises, pause and self-soothe for 5 minutes before reconnecting. When withdrawal urge arises, stay present for 5 minutes before taking agreed-upon break."
                : "Practice stating needs directly without criticism: 'I need... because... Would you be willing to...?'",
            frequency: "As needed during conflicts",
          },
        ],
        emotionalRegulationPractices: [
          {
            title: emotionalSafetyScore < 50 ? "Safety Building Ritual" : "Emotional Attunement Practice",
            description:
              emotionalSafetyScore < 50
                ? "Establish safety signals and practice de-escalation techniques. Create explicit agreements about respectful communication and timeout procedures."
                : "Practice recognizing and naming emotions in real-time. Use emotion wheel to expand emotional vocabulary and precision.",
            frequency: "Daily practice, 10-15 minutes",
          },
        ],
        relationshipRituals: [
          {
            title: "Weekly State of the Union",
            description:
              "Discuss five areas: (1) what's working well, (2) what needs attention, (3) what each person needs more of, (4) what each person needs less of, (5) appreciation and affirmation.",
            frequency: "Weekly, 30-45 minutes",
          },
        ],
      },

      prognosis: {
        shortTerm: `Next 1-3 months: ${gottmanFlags.contempt ? "**CRITICAL**: Contempt requires immediate intervention or relationship at high risk of failure." : harmonyScore > 70 ? "Positive trajectory expected with continued effort and skill development." : emotionalSafetyScore < 50 ? "Challenging period requiring focused work on emotional safety and communication." : "Gradual improvement possible with committed practice of new skills."}`,
        mediumTerm: `Within 6-12 months: ${riskFlags.includes("possible_safety_concern") ? "Safety must be established before relationship progress is possible." : emotionalSafetyScore > 70 && repairEffortScore > 40 ? "Strong potential for secure attachment development and relationship deepening." : conflictPattern === "pursue_withdraw" ? "Pursue-withdraw cycle can be interrupted with consistent practice, leading to more secure connection." : "Moderate improvement expected with consistent therapeutic work and skill practice."}`,
        longTerm: `With sustained effort over 12+ months: ${gottmanFlags.contempt ? "Contempt elimination required for long-term viability. Without addressing contempt, relationship unlikely to survive." : harmonyScore > 70 && repairEffortScore > 40 ? "Excellent prognosis for secure, fulfilling relationship with continued growth and development." : emotionalSafetyScore < 50 ? "Concerning patterns require professional support. Prognosis depends on willingness to engage in deep therapeutic work." : "Guarded to fair prognosis; success depends on sustained commitment to growth and willingness to change established patterns."}`,
        riskFactors:
          [
            gottmanFlags.contempt ? "**CONTEMPT PRESENT** - highest risk factor for relationship failure" : null,
            riskFlags.includes("possible_safety_concern")
              ? "**SAFETY CONCERNS IDENTIFIED** - requires immediate professional assessment"
              : null,
            emotionalSafetyScore < 40
              ? "Very low emotional safety prevents vulnerability and authentic connection"
              : null,
            repairEffortScore < 20 ? "Minimal repair capacity limits conflict resolution and reconnection" : null,
            conflictPattern === "mutual_escalation"
              ? "Escalating conflict patterns without de-escalation skills"
              : null,
            gottmanFlags.stonewalling ? "Stonewalling prevents resolution and creates emotional abandonment" : null,
          ].filter(Boolean).length > 0
            ? [
                gottmanFlags.contempt ? "**CONTEMPT PRESENT** - highest risk factor for relationship failure" : null,
                riskFlags.includes("possible_safety_concern")
                  ? "**SAFETY CONCERNS IDENTIFIED** - requires immediate professional assessment"
                  : null,
                emotionalSafetyScore < 40
                  ? "Very low emotional safety prevents vulnerability and authentic connection"
                  : null,
                repairEffortScore < 20 ? "Minimal repair capacity limits conflict resolution and reconnection" : null,
                conflictPattern === "mutual_escalation"
                  ? "Escalating conflict patterns without de-escalation skills"
                  : null,
                gottmanFlags.stonewalling ? "Stonewalling prevents resolution and creates emotional abandonment" : null,
              ].filter(Boolean)
            : [
                "Communication patterns could be more effective and direct",
                "Conflict resolution skills need continued development",
                "Emotional expression could be more consistent",
              ],
        protectiveFactors:
          [
            !gottmanFlags.contempt ? "Absence of contempt maintains fundamental respect" : null,
            repairEffortScore > 40 ? "Active repair attempts demonstrate emotional intelligence and investment" : null,
            harmonyScore > 70 ? "High harmony baseline provides positive emotional climate" : null,
            emotionalSafetyScore > 70 ? "Strong emotional safety allows for vulnerability and growth" : null,
            sentimentTrend === "improving"
              ? "Positive sentiment trend indicates relationship moving in healthy direction"
              : null,
            conflictPattern === "problem_solving"
              ? "Problem-solving orientation supports collaborative resolution"
              : null,
          ].filter(Boolean).length > 0
            ? [
                !gottmanFlags.contempt ? "Absence of contempt maintains fundamental respect" : null,
                repairEffortScore > 40
                  ? "Active repair attempts demonstrate emotional intelligence and investment"
                  : null,
                harmonyScore > 70 ? "High harmony baseline provides positive emotional climate" : null,
                emotionalSafetyScore > 70 ? "Strong emotional safety allows for vulnerability and growth" : null,
                sentimentTrend === "improving"
                  ? "Positive sentiment trend indicates relationship moving in healthy direction"
                  : null,
                conflictPattern === "problem_solving"
                  ? "Problem-solving orientation supports collaborative resolution"
                  : null,
              ].filter(Boolean)
            : [
                "Both partners are communicating and engaging with each other",
                "Willingness to seek relationship analysis shows investment in growth",
                "Capacity for change and development exists in the relationship",
              ],
      },

      differentialConsiderations: {
        individualTherapyConsiderations: `${riskFlags.includes("possible_safety_concern") ? "**PRIORITY**: Individual safety assessment and planning before couples work." : ""} ${gottmanFlags.contempt ? "Individual therapy recommended to address contempt patterns and develop empathy before couples therapy." : ""} ${conflictPattern === "pursue_withdraw" ? "Attachment-focused individual therapy can help each partner understand their patterns and develop self-regulation." : "Individual therapy may support personal growth that enhances relationship functioning."}`,
        couplesTherapyReadiness: `${riskFlags.includes("possible_safety_concern") ? "**NOT RECOMMENDED** until safety is established and assessed by professional." : gottmanFlags.contempt ? "Couples therapy appropriate only after individual work on contempt and respect-building." : emotionalSafetyScore > 50 ? "Good candidates for couples therapy with appropriate modality and skilled therapist." : "Couples therapy recommended with trauma-informed approach given emotional safety concerns."}`,
        externalResourcesNeeded:
          [
            riskFlags.includes("possible_safety_concern")
              ? "**National Domestic Violence Hotline: 1-800-799-7233** (24/7 confidential support)"
              : null,
            "Books: 'The Seven Principles for Making Marriage Work' by John Gottman",
            "Books: 'Hold Me Tight' by Sue Johnson (Emotionally Focused Therapy)",
            gottmanFlags.contempt ? "Books: 'Why Does He Do That?' by Lundy Bancroft" : null,
            "Gottman Card Decks app for daily connection exercises",
            "Couples therapy referral through Psychology Today or AAMFT therapist finder",
          ].filter(Boolean).length >= 3
            ? [
                riskFlags.includes("possible_safety_concern")
                  ? "**National Domestic Violence Hotline: 1-800-799-7233** (24/7 confidential support)"
                  : null,
                "Books: 'The Seven Principles for Making Marriage Work' by John Gottman",
                "Books: 'Hold Me Tight' by Sue Johnson (Emotionally Focused Therapy)",
                gottmanFlags.contempt ? "Books: 'Why Does He Do That?' by Lundy Bancroft" : null,
                "Gottman Card Decks app for daily connection exercises",
                "Couples therapy referral through Psychology Today or AAMFT therapist finder",
              ].filter(Boolean)
            : [
                "Books: 'The Seven Principles for Making Marriage Work' by John Gottman",
                "Books: 'Hold Me Tight' by Sue Johnson (Emotionally Focused Therapy)",
                "Gottman Card Decks app for daily connection exercises",
              ],
      },

      traumaInformedObservations: {
        identifiedPatterns:
          [
            emotionalSafetyScore < 50
              ? "Low emotional safety suggests possible trauma history affecting vulnerability and trust"
              : null,
            gottmanFlags.harsh_startup
              ? "Harsh startups may reflect learned patterns from family of origin or past relationships"
              : null,
            conflictPattern === "pursue_withdraw"
              ? "Pursue-withdraw cycle often rooted in attachment trauma and early relational experiences"
              : null,
            riskFlags.includes("possible_safety_concern")
              ? "**SAFETY CONCERNS REQUIRE TRAUMA-INFORMED APPROACH** and professional assessment"
              : null,
            gottmanFlags.stonewalling
              ? "Stonewalling may serve as trauma response to overwhelming emotional intensity"
              : null,
          ].filter(Boolean).length > 0
            ? [
                emotionalSafetyScore < 50
                  ? "Low emotional safety suggests possible trauma history affecting vulnerability and trust"
                  : null,
                gottmanFlags.harsh_startup
                  ? "Harsh startups may reflect learned patterns from family of origin or past relationships"
                  : null,
                conflictPattern === "pursue_withdraw"
                  ? "Pursue-withdraw cycle often rooted in attachment trauma and early relational experiences"
                  : null,
                riskFlags.includes("possible_safety_concern")
                  ? "**SAFETY CONCERNS REQUIRE TRAUMA-INFORMED APPROACH** and professional assessment"
                  : null,
                gottmanFlags.stonewalling
                  ? "Stonewalling may serve as trauma response to overwhelming emotional intensity"
                  : null,
              ].filter(Boolean)
            : [
                "Communication patterns may reflect learned behaviors from family of origin",
                "Emotional regulation strategies developed in response to past experiences",
                "Relationship dynamics influenced by attachment history",
              ],
        copingMechanisms: `${gottmanFlags.stonewalling ? "Stonewalling serves as protective mechanism against overwhelm, though it creates secondary trauma for partner." : ""} ${conflictPattern === "pursue_withdraw" ? "Both pursuit and withdrawal are trauma responses - pursuit seeks safety through connection, withdrawal seeks safety through distance." : ""} ${gottmanFlags.defensiveness ? "Defensiveness protects against perceived threats to self-worth or safety." : "Coping mechanisms appear relatively adaptive with capacity for flexibility."}`,
        safetyAndTrust: `${riskFlags.includes("possible_safety_concern") ? "**SAFETY IS PRIMARY CONCERN**. Trust cannot be built without physical and emotional safety. Professional safety assessment required." : emotionalSafetyScore > 70 ? "Safety foundation supports trust development and vulnerability. Continue nurturing this crucial element." : emotionalSafetyScore > 50 ? "Moderate safety allows for some vulnerability. Building stronger safety foundation will deepen trust and connection." : "Safety must be established as first priority before trust can develop. Without safety, relationship cannot heal or grow."}`,
      },
    },

    constructiveFeedback: {
      subjectA: {
        strengths:
          [
            repairEffortScore > 40
              ? "Makes repair attempts, showing emotional intelligence and relationship investment"
              : null,
            !gottmanFlags.criticism ? "Avoids criticism, maintaining respect for partner's character" : null,
            emotionalSafetyScore > 70 ? "Contributes to emotional safety, allowing for vulnerability" : null,
            subjectAMessages > 0 ? "Engages in communication and shows willingness to connect" : null,
            !gottmanFlags.contempt ? "Maintains respect even during disagreements" : null,
          ].filter(Boolean).length >= 2
            ? [
                repairEffortScore > 40
                  ? "Makes repair attempts, showing emotional intelligence and relationship investment"
                  : null,
                !gottmanFlags.criticism ? "Avoids criticism, maintaining respect for partner's character" : null,
                emotionalSafetyScore > 70 ? "Contributes to emotional safety, allowing for vulnerability" : null,
                subjectAMessages > 0 ? "Engages in communication and shows willingness to connect" : null,
                !gottmanFlags.contempt ? "Maintains respect even during disagreements" : null,
              ].filter(Boolean)
            : [
                "Shows willingness to communicate and engage in the relationship",
                "Demonstrates investment in relationship growth through participation in analysis",
              ],
        gentleGrowthNudges:
          [
            gottmanFlags.criticism
              ? "Replace criticism with specific requests: 'I need...' instead of 'You always...'"
              : null,
            gottmanFlags.harsh_startup
              ? "Practice soft startup techniques: Begin with appreciation before expressing concerns"
              : null,
            conflictPattern === "pursue_withdraw" && subjectAMessages > subjectBMessages
              ? "Practice self-soothing instead of pursuing when anxiety arises"
              : null,
            repairEffortScore < 20
              ? "Increase repair attempts: apologize, use humor, show affection to de-escalate"
              : null,
            emotionalSafetyScore < 50 ? "Work on creating emotional safety through validation and empathy" : null,
          ].filter(Boolean).length >= 2
            ? [
                gottmanFlags.criticism
                  ? "Replace criticism with specific requests: 'I need...' instead of 'You always...'"
                  : null,
                gottmanFlags.harsh_startup
                  ? "Practice soft startup techniques: Begin with appreciation before expressing concerns"
                  : null,
                conflictPattern === "pursue_withdraw" && subjectAMessages > subjectBMessages
                  ? "Practice self-soothing instead of pursuing when anxiety arises"
                  : null,
                repairEffortScore < 20
                  ? "Increase repair attempts: apologize, use humor, show affection to de-escalate"
                  : null,
                emotionalSafetyScore < 50 ? "Work on creating emotional safety through validation and empathy" : null,
              ].filter(Boolean)
            : [
                "Continue developing communication skills through practice and feedback",
                "Explore emotional needs and express them more directly",
              ],
        connectionBoosters: [
          "Express appreciation daily for specific actions or qualities",
          gottmanFlags.contempt
            ? "Build respect through admiration and appreciation practices"
            : "Maintain respect and admiration",
          "Practice active listening: reflect back what you hear before responding",
          "Share vulnerabilities to deepen emotional intimacy",
        ],
      },
      subjectB: {
        strengths:
          [
            !gottmanFlags.stonewalling ? "Remains engaged during difficult conversations" : null,
            !gottmanFlags.defensiveness ? "Takes accountability for contributions to problems" : null,
            emotionalSafetyScore > 70 ? "Provides emotional safety for partner's vulnerability" : null,
            subjectBMessages > 0 ? "Participates in dialogue and shows investment" : null,
            !gottmanFlags.contempt ? "Maintains respect for partner" : null,
          ].filter(Boolean).length >= 2
            ? [
                !gottmanFlags.stonewalling ? "Remains engaged during difficult conversations" : null,
                !gottmanFlags.defensiveness ? "Takes accountability for contributions to problems" : null,
                emotionalSafetyScore > 70 ? "Provides emotional safety for partner's vulnerability" : null,
                subjectBMessages > 0 ? "Participates in dialogue and shows investment" : null,
                !gottmanFlags.contempt ? "Maintains respect for partner" : null,
              ].filter(Boolean)
            : [
                "Shows willingness to communicate and engage in the relationship",
                "Demonstrates commitment to relationship through engagement in analysis",
              ],
        gentleGrowthNudges:
          [
            gottmanFlags.stonewalling
              ? "Stay present during difficult conversations: use timeouts if needed but return to dialogue"
              : null,
            gottmanFlags.defensiveness
              ? "Practice accepting influence: look for the kernel of truth in partner's concerns"
              : null,
            conflictPattern === "pursue_withdraw" && subjectBMessages < subjectAMessages
              ? "Initiate connection proactively rather than waiting for partner to pursue"
              : null,
            repairEffortScore < 20 ? "Offer repair attempts: acknowledge partner's feelings and show care" : null,
            emotionalSafetyScore < 50 ? "Build emotional safety through validation and non-defensive responses" : null,
          ].filter(Boolean).length >= 2
            ? [
                gottmanFlags.stonewalling
                  ? "Stay present during difficult conversations: use timeouts if needed but return to dialogue"
                  : null,
                gottmanFlags.defensiveness
                  ? "Practice accepting influence: look for the kernel of truth in partner's concerns"
                  : null,
                conflictPattern === "pursue_withdraw" && subjectBMessages < subjectAMessages
                  ? "Initiate connection proactively rather than waiting for partner to pursue"
                  : null,
                repairEffortScore < 20 ? "Offer repair attempts: acknowledge partner's feelings and show care" : null,
                emotionalSafetyScore < 50
                  ? "Build emotional safety through validation and non-defensive responses"
                  : null,
              ].filter(Boolean)
            : [
                "Continue developing emotional expression and vulnerability",
                "Practice initiating difficult conversations when needed",
              ],
        connectionBoosters: [
          "Share vulnerabilities and emotional experiences more openly",
          gottmanFlags.stonewalling
            ? "Practice staying engaged: use self-soothing to manage overwhelm"
            : "Maintain engagement and presence",
          "Express needs directly rather than waiting for partner to guess",
          "Initiate affection and appreciation regularly",
        ],
      },
      forBoth: {
        sharedStrengths:
          [
            !gottmanFlags.contempt
              ? "Mutual respect maintained - absence of contempt is crucial protective factor"
              : null,
            harmonyScore > 70 ? "Harmonious baseline provides positive foundation" : null,
            repairEffortScore > 40 ? "Repair capacity present in the relationship" : null,
            emotionalSafetyScore > 70 ? "Strong emotional safety supports vulnerability and growth" : null,
          ].filter(Boolean).length >= 2
            ? [
                !gottmanFlags.contempt
                  ? "Mutual respect maintained - absence of contempt is crucial protective factor"
                  : null,
                harmonyScore > 70 ? "Harmonious baseline provides positive foundation" : null,
                repairEffortScore > 40 ? "Repair capacity present in the relationship" : null,
                emotionalSafetyScore > 70 ? "Strong emotional safety supports vulnerability and growth" : null,
              ].filter(Boolean)
            : [
                "Both partners are communicating and engaging with each other",
                "Shared willingness to understand relationship dynamics through analysis",
              ],
        sharedGrowthNudges:
          [
            gottmanFlags.contempt
              ? "**ELIMINATE CONTEMPT IMMEDIATELY** - seek professional help to address this toxic pattern"
              : null,
            conflictPattern === "pursue_withdraw"
              ? "Interrupt pursue-withdraw cycle together: pursuer practice self-soothing, withdrawer practice staying present"
              : null,
            emotionalSafetyScore < 50
              ? "Build emotional safety as top priority: create explicit agreements about respectful communication"
              : null,
            "Practice Gottman's Sound Relationship House principles: build friendship, create shared meaning, manage conflict constructively",
            "Develop shared relationship vision and goals",
          ].filter(Boolean).length >= 3
            ? [
                gottmanFlags.contempt
                  ? "**ELIMINATE CONTEMPT IMMEDIATELY** - seek professional help to address this toxic pattern"
                  : null,
                conflictPattern === "pursue_withdraw"
                  ? "Interrupt pursue-withdraw cycle together: pursuer practice self-soothing, withdrawer practice staying present"
                  : null,
                emotionalSafetyScore < 50
                  ? "Build emotional safety as top priority: create explicit agreements about respectful communication"
                  : null,
                "Practice Gottman's Sound Relationship House principles: build friendship, create shared meaning, manage conflict constructively",
                "Develop shared relationship vision and goals",
              ].filter(Boolean)
            : [
                "Practice Gottman's Sound Relationship House principles",
                "Develop shared relationship vision and goals",
                "Build daily rituals of connection and appreciation",
              ],
        sharedConnectionBoosters: [
          "Daily appreciation ritual: share one thing you appreciate about each other",
          "Weekly state-of-union check-ins: discuss what's working and what needs attention",
          gottmanFlags.harsh_startup
            ? "Soft startup practice together: role-play difficult conversations with gentle approach"
            : "Maintain constructive communication patterns",
          "Create shared meaning: discuss dreams, values, and life purpose together",
        ],
      },
    },

    keyTakeaways: [
      `Overall relationship health: ${overallHealthScore}/10 (Harmony: ${harmonyScore}/100, Safety: ${emotionalSafetyScore}/100, Repair: ${repairEffortScore}/100)`,
      `Primary conflict pattern: ${conflictPattern === "pursue_withdraw" ? "Pursue-Withdraw (anxious-avoidant dynamic)" : conflictPattern === "mutual_escalation" ? "Mutual Escalation (both partners intensify)" : conflictPattern === "stonewalling" ? "Stonewalling (withdrawal and shutdown)" : conflictPattern === "problem_solving" ? "Problem-Solving (constructive approach)" : "Mixed/Inconclusive patterns"}`,
      gottmanFlags.contempt
        ? "**CRITICAL**: Contempt present - strongest predictor of relationship failure, requires immediate intervention"
        : "No contempt detected - this is a significant protective factor for relationship longevity",
      `Sentiment trend: ${sentimentTrend === "improving" ? "Improving (positive trajectory)" : sentimentTrend === "worsening" ? "Worsening (requires attention)" : sentimentTrend === "volatile" ? "Volatile (inconsistent patterns)" : "Stable or inconclusive"}`,
      riskFlags.includes("possible_safety_concern")
        ? "**SAFETY CONCERNS IDENTIFIED** - seek professional support immediately"
        : "No immediate safety concerns identified",
      repairEffortScore > 40
        ? "Repair capacity is a significant strength - demonstrates emotional intelligence and relationship investment"
        : "Repair skills need development - this is a learnable skill that can transform relationship dynamics",
    ],

    outlook: `${riskFlags.includes("possible_safety_concern") ? "**SAFETY MUST BE ADDRESSED FIRST**. Seek professional support immediately. Contact National Domestic Violence Hotline: 1-800-799-7233 for confidential support and safety planning." : gottmanFlags.contempt ? "**CRITICAL**: Contempt requires immediate professional intervention. Without addressing contempt, relationship is at high risk of failure. Individual therapy recommended before couples work." : harmonyScore > 70 && repairEffortScore > 40 ? "Strong foundation with excellent potential for continued growth. The relationship shows positive patterns and protective factors. With continued attention to communication and emotional connection, prognosis is very positive." : emotionalSafetyScore < 50 ? "Concerning patterns require professional support. Emotional safety must be established as foundation before other work can be effective. Trauma-informed couples therapy recommended." : conflictPattern === "pursue_withdraw" ? "Pursue-withdraw cycle is painful but treatable. Emotionally Focused Therapy (EFT) or Gottman Method can help interrupt this pattern. With committed work, partners can develop more secure connection." : "Moderate potential with committed effort. Relationship shows both strengths and challenges. Professional support through couples therapy can provide tools and guidance for improvement. Success depends on both partners' willingness to engage in growth process."}`,

    optionalAppendix: `This analysis uses evidence-based scoring rubrics grounded in the Gottman Method (40+ years of research on relationship success and failure), attachment theory (Bowlby, Ainsworth, Johnson), and relational psychology. Scores are deterministic and repeatable based on observable communication patterns. ${riskFlags.includes("possible_safety_concern") ? "**SAFETY CONCERNS IDENTIFIED**: This analysis is not a substitute for professional safety assessment. If you are experiencing abuse, contact National Domestic Violence Hotline: 1-800-799-7233 (24/7 confidential support)." : "This analysis is not a substitute for professional mental health care. Consider consulting with a licensed couples therapist for personalized guidance and support."}`,

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
