"use server"

interface DiagnosticLog {
  timestamp: string
  level: "info" | "warn" | "error"
  message: string
  data?: any
}

const diagnosticLogs: DiagnosticLog[] = []

function logDiagnostic(level: DiagnosticLog["level"], message: string, data?: any) {
  const log: DiagnosticLog = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
  }
  diagnosticLogs.push(log)
  console.log(`[v0] [${level.toUpperCase()}] ${message}`, data || "")

  // Keep only last 100 logs to prevent memory issues
  if (diagnosticLogs.length > 100) {
    diagnosticLogs.shift()
  }
}

// Helper function to add timeout to promises
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operationName: string): Promise<T> {
  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(() => reject(new Error(`${operationName} timed out after ${timeoutMs}ms`)), timeoutMs)
  })
  return Promise.race([promise, timeoutPromise])
}

async function fileToBase64(file: File): Promise<string> {
  try {
    logDiagnostic("info", `Converting file to base64: ${file.name}`, {
      size: file.size,
      type: file.type,
    })

    // Validate file before conversion
    if (!file.size) {
      throw new Error("File has no size")
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
    }

    // Use FileReader API for faster conversion
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        try {
          const result = reader.result as string
          if (!result || !result.includes(",")) {
            reject(new Error("Invalid FileReader result"))
            return
          }
          const base64 = result.split(",")[1]
          logDiagnostic("info", `File converted successfully: ${base64.length} characters`)
          resolve(base64)
        } catch (error) {
          logDiagnostic("error", "Error processing FileReader result", error)
          reject(error)
        }
      }

      reader.onerror = () => {
        const error = new Error(`FileReader error: ${reader.error?.message || "Unknown error"}`)
        logDiagnostic("error", "FileReader failed", error)
        reject(error)
      }

      reader.readAsDataURL(file)
    })
  } catch (error) {
    logDiagnostic("error", "Error in fileToBase64", error)
    throw new Error(`Failed to process image file: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

async function extractTextFromMultipleImages(files: File[]): Promise<{
  extractedTexts: Array<{ text: string; imageIndex: number }>
  totalProcessingTime: number
}> {
  const startTime = Date.now()

  try {
    logDiagnostic("info", `Starting OCR extraction for ${files.length} files`)

    const base64Results = await Promise.allSettled(
      files.map(async (file, index) => {
        try {
          const base64 = await fileToBase64(file)
          return {
            type: "image_url" as const,
            image_url: {
              url: `data:${file.type};base64,${base64}`,
            },
          }
        } catch (error) {
          logDiagnostic("error", `Failed to convert image ${index + 1}`, error)
          return null
        }
      }),
    )

    const validImages = base64Results
      .filter((result) => result.status === "fulfilled" && result.value !== null)
      .map((result) => (result as PromiseFulfilledResult<any>).value)

    logDiagnostic("info", `Converted ${validImages.length}/${files.length} images successfully`)

    if (validImages.length === 0) {
      logDiagnostic("warn", "No valid images to process")
      return {
        extractedTexts: files.map((_, index) => ({ text: "", imageIndex: index })),
        totalProcessingTime: Date.now() - startTime,
      }
    }

    let extractedText = ""
    try {
      logDiagnostic("info", `Sending ${validImages.length} images to OpenAI API`)

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Extract ALL conversation text from these screenshots. Format: [Speaker]: "message". Preserve chronological order, timestamps, emojis, and emotional markers. Identify speakers consistently.`,
                },
                ...validImages,
              ],
            },
          ],
          max_tokens: 4000,
          temperature: 0.1,
        }),
      })

      logDiagnostic("info", `OpenAI API response status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        logDiagnostic("error", `OpenAI API error: ${response.status}`, errorText)
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      extractedText = data.choices?.[0]?.message?.content || ""
      logDiagnostic("info", `Extraction successful: ${extractedText.length} characters`)
    } catch (error) {
      logDiagnostic("error", "OCR extraction failed", error)
      return {
        extractedTexts: files.map((_, index) => ({ text: "", imageIndex: index })),
        totalProcessingTime: Date.now() - startTime,
      }
    }

    const totalProcessingTime = Date.now() - startTime
    logDiagnostic("info", `Total OCR processing time: ${totalProcessingTime}ms`)

    return {
      extractedTexts: [{ text: extractedText, imageIndex: 0 }],
      totalProcessingTime,
    }
  } catch (error) {
    logDiagnostic("error", "Batch extraction error", error)
    return {
      extractedTexts: files.map((_, index) => ({ text: "", imageIndex: index })),
      totalProcessingTime: Date.now() - startTime,
    }
  }
}

// Normalize speaker labels
function normalizeSpeakers(
  extractedTexts: Array<{ text: string; imageIndex: number }>,
  customNameA: string | null,
  customNameB: string | null,
): {
  normalizedText: string
  subjectALabel: string
  subjectBLabel: string
} {
  // Combine all extracted text
  const combinedText = extractedTexts.map((e) => e.text).join("\n\n")

  if (!combinedText || combinedText.length < 10) {
    // Not enough text, use custom names or defaults
    return {
      normalizedText: "",
      subjectALabel: customNameA || "Person A",
      subjectBLabel: customNameB || "Person B",
    }
  }

  // Try to detect speaker labels from the text
  const speakerPattern = /\[([^\]]+)\]:/g
  const speakers = new Set<string>()
  let match

  while ((match = speakerPattern.exec(combinedText)) !== null) {
    speakers.add(match[1].trim())
  }

  const speakerArray = Array.from(speakers)

  // Determine final labels
  const subjectALabel = customNameA || speakerArray[0] || "Person A"
  const subjectBLabel = customNameB || speakerArray[1] || "Person B"

  // If custom names provided, replace detected names with custom names
  let normalizedText = combinedText
  if (customNameA && speakerArray[0]) {
    normalizedText = normalizedText.replace(new RegExp(`\\[${speakerArray[0]}\\]`, "g"), `[${customNameA}]`)
  }
  if (customNameB && speakerArray[1]) {
    normalizedText = normalizedText.replace(new RegExp(`\\[${speakerArray[1]}\\]`, "g"), `[${customNameB}]`)
  }

  logDiagnostic(
    "info",
    `Detected speakers: ${speakerArray.join(", ")}, Final labels: ${subjectALabel}, ${subjectBLabel}`,
  )

  return {
    normalizedText,
    subjectALabel,
    subjectBLabel,
  }
}

// Analyze punctuation patterns for emotional subtext
function analyzePunctuationPatterns(text: string): {
  periods: number
  exclamations: number
  ellipses: number
  multipleQuestions: number
  noPunctuation: number
  emotionalIntensity: number
} {
  const messages = text.split(/\n/)

  let periods = 0
  let exclamations = 0
  let ellipses = 0
  let multipleQuestions = 0
  let noPunctuation = 0

  messages.forEach((msg) => {
    const content = msg.replace(/\[.*?\]:/g, "").trim()
    if (content.length < 3) return

    if (content.endsWith(".") && !content.endsWith("...")) periods++
    if (content.includes("!")) exclamations++
    if (content.includes("...") || content.includes("…")) ellipses++
    if (content.match(/\?\?+/)) multipleQuestions++
    if (!/[.!?]$/.test(content) && content.length > 5) noPunctuation++
  })

  // Calculate emotional intensity based on punctuation
  const emotionalIntensity = (exclamations * 2 + multipleQuestions * 3 + ellipses * 2) / Math.max(1, messages.length)

  return {
    periods,
    exclamations,
    ellipses,
    multipleQuestions,
    noPunctuation,
    emotionalIntensity,
  }
}

// Analyze message length and expression style
function analyzeMessageStyle(
  text: string,
  speakerLabel: string,
): {
  avgLength: number
  shortMessages: number
  longMessages: number
  oneWordReplies: number
  expressiveStyle: "brief" | "balanced" | "expressive"
} {
  const pattern = new RegExp(`\\[${speakerLabel}\\]:\\s*"?([^"\\n]+)"?`, "gi")
  const messages: string[] = []
  let match

  while ((match = pattern.exec(text)) !== null) {
    messages.push(match[1].trim())
  }

  if (messages.length === 0) {
    return { avgLength: 0, shortMessages: 0, longMessages: 0, oneWordReplies: 0, expressiveStyle: "balanced" }
  }

  const lengths = messages.map((m) => m.length)
  const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length
  const shortMessages = messages.filter((m) => m.length < 20).length
  const longMessages = messages.filter((m) => m.length > 100).length
  const oneWordReplies = messages.filter((m) => m.split(/\s+/).length <= 2).length

  let expressiveStyle: "brief" | "balanced" | "expressive" = "balanced"
  if (avgLength < 30 && shortMessages > messages.length * 0.6) {
    expressiveStyle = "brief"
  } else if (avgLength > 80 || longMessages > messages.length * 0.4) {
    expressiveStyle = "expressive"
  }

  return {
    avgLength,
    shortMessages,
    longMessages,
    oneWordReplies,
    expressiveStyle,
  }
}

// Detect emotional tone from message content and punctuation
function detectEmotionalTone(
  text: string,
  punctuation: ReturnType<typeof analyzePunctuationPatterns>,
): {
  warmth: number
  tension: number
  fatigue: number
  enthusiasm: number
  distance: number
} {
  const lower = text.toLowerCase()

  // Warmth indicators
  const warmthMarkers = ["love", "appreciate", "thank", "grateful", "care", "miss you", "❤️", "💕"]
  const warmth = warmthMarkers.filter((m) => lower.includes(m)).length + punctuation.exclamations * 0.5

  // Tension indicators (periods in short messages suggest seriousness/distance)
  const tensionMarkers = ["but", "however", "actually", "honestly", "seriously"]
  const tension = tensionMarkers.filter((m) => lower.includes(m)).length + punctuation.periods * 0.3

  // Fatigue indicators (ellipses, lack of punctuation)
  const fatigueMarkers = ["tired", "exhausted", "can't", "too much", "overwhelmed"]
  const fatigue =
    fatigueMarkers.filter((m) => lower.includes(m)).length +
    punctuation.ellipses * 0.8 +
    punctuation.noPunctuation * 0.3

  // Enthusiasm (exclamation marks, positive words)
  const enthusiasmMarkers = ["yes!", "great!", "awesome", "amazing", "excited", "can't wait"]
  const enthusiasm = enthusiasmMarkers.filter((m) => lower.includes(m)).length + punctuation.exclamations * 0.7

  // Distance (short responses, periods, minimal engagement)
  const distanceMarkers = ["ok.", "fine.", "whatever", "sure.", "k."]
  const distance = distanceMarkers.filter((m) => lower.includes(m)).length + punctuation.periods * 0.4

  return {
    warmth: Math.min(10, warmth),
    tension: Math.min(10, tension),
    fatigue: Math.min(10, fatigue),
    enthusiasm: Math.min(10, enthusiasm),
    distance: Math.min(10, distance),
  }
}

function detectEmotionalPatterns(text: string): {
  vulnerabilityBids: number
  defensiveResponses: number
  emotionalWithdrawal: number
  repairAttempts: number
  validationOffers: number
  dismissiveLanguage: number
  emotionalFlooding: number
  bidForConnection: number
} {
  const lower = text.toLowerCase()

  // Vulnerability bids - when someone shares feelings or needs
  const vulnerabilityMarkers = [
    "i feel",
    "i'm feeling",
    "i need",
    "i'm scared",
    "i'm worried",
    "i'm hurt",
    "it hurts when",
  ]
  const vulnerabilityBids = vulnerabilityMarkers.filter((m) => lower.includes(m)).length

  // Defensive responses - protecting self rather than connecting
  const defensiveMarkers = ["but i", "but you", "that's not", "i didn't", "you always", "you never", "not my fault"]
  const defensiveResponses = defensiveMarkers.filter((m) => lower.includes(m)).length

  // Emotional withdrawal - shutting down or avoiding
  const withdrawalMarkers = ["whatever", "fine", "nothing", "forget it", "never mind", "i don't care", "doesn't matter"]
  const emotionalWithdrawal = withdrawalMarkers.filter((m) => lower.includes(m)).length

  // Repair attempts - reaching across the divide
  const repairMarkers = ["i'm sorry", "i apologize", "you're right", "i understand", "let me try", "i love you"]
  const repairAttempts = repairMarkers.filter((m) => lower.includes(m)).length

  // Validation offers - acknowledging partner's experience
  const validationMarkers = ["i hear you", "that makes sense", "i get it", "i see", "you're right", "i understand why"]
  const validationOffers = validationMarkers.filter((m) => lower.includes(m)).length

  // Dismissive language - minimizing partner's feelings
  const dismissiveMarkers = ["overreacting", "too sensitive", "dramatic", "ridiculous", "stupid", "crazy"]
  const dismissiveLanguage = dismissiveMarkers.filter((m) => lower.includes(m)).length

  // Emotional flooding - overwhelm indicators
  const floodingMarkers = ["can't", "too much", "overwhelmed", "stop", "enough"]
  const emotionalFlooding = floodingMarkers.filter((m) => lower.includes(m)).length

  // Bids for connection - reaching out
  const connectionMarkers = ["can we talk", "i miss", "i want", "let's", "together", "us"]
  const bidForConnection = connectionMarkers.filter((m) => lower.includes(m)).length

  return {
    vulnerabilityBids,
    defensiveResponses,
    emotionalWithdrawal,
    repairAttempts,
    validationOffers,
    dismissiveLanguage,
    emotionalFlooding,
    bidForConnection,
  }
}

function analyzeEmotionalDynamics(
  patterns: ReturnType<typeof detectEmotionalPatterns>,
  subjectALabel: string,
  subjectBLabel: string,
): {
  primaryDynamic: string
  underlyingNeeds: string[]
  emotionalCycle: string
  balancedInsight: string
} {
  const {
    vulnerabilityBids,
    defensiveResponses,
    emotionalWithdrawal,
    repairAttempts,
    validationOffers,
    dismissiveLanguage,
  } = patterns

  // Identify primary dynamic without blame
  let primaryDynamic = ""
  if (defensiveResponses > vulnerabilityBids) {
    primaryDynamic =
      "When feelings are shared, there's a tendency to protect rather than connect. This often comes from a place of feeling misunderstood or criticized, creating a cycle where both partners feel unheard."
  } else if (emotionalWithdrawal > repairAttempts) {
    primaryDynamic =
      "During difficult moments, there's a pattern of stepping back rather than leaning in. This protective response, while understandable, can leave both partners feeling alone in the relationship."
  } else if (repairAttempts > defensiveResponses) {
    primaryDynamic =
      "There's a genuine effort to bridge disconnection when it happens. Both partners are learning to reach across the gap, even when it's uncomfortable."
  } else {
    primaryDynamic =
      "The relationship shows a mix of connection and protection. Both partners are navigating the vulnerability of intimacy while managing their own emotional safety."
  }

  // Identify underlying needs (not deficits)
  const underlyingNeeds: string[] = []
  if (vulnerabilityBids > 0) {
    underlyingNeeds.push("To feel emotionally safe sharing vulnerable feelings")
  }
  if (defensiveResponses > 2) {
    underlyingNeeds.push("To feel understood rather than criticized")
  }
  if (emotionalWithdrawal > 1) {
    underlyingNeeds.push("Space to process emotions without pressure")
  }
  if (validationOffers < 2) {
    underlyingNeeds.push("More acknowledgment of each other's emotional reality")
  }

  // Describe the emotional cycle empathetically
  let emotionalCycle = ""
  if (defensiveResponses > vulnerabilityBids && emotionalWithdrawal > 0) {
    emotionalCycle = `One partner shares a feeling or concern, hoping to be heard. The other, perhaps feeling blamed or criticized, responds defensively to protect themselves. This leaves the first partner feeling dismissed, leading to either withdrawal or escalation. Both are trying to protect themselves, but the protective moves create more distance.`
  } else if (repairAttempts > 3) {
    emotionalCycle = `When disconnection happens, both partners make efforts to repair and reconnect. There's an awareness that the relationship matters more than being right, and a willingness to be vulnerable in service of connection.`
  } else {
    emotionalCycle = `The relationship moves between moments of connection and moments of protection. Both partners are learning to stay present with difficult feelings while managing their own emotional responses.`
  }

  // Balanced insight acknowledging both partners' contributions
  const balancedInsight =
    dismissiveLanguage > 0
      ? `Both partners contribute to the current dynamic—one may push for connection while the other needs space, or one may criticize while the other defends. These are complementary patterns, not individual failings. Understanding each person's underlying fear or need can transform the cycle.`
      : `Both partners are navigating the inherent tension of intimacy: the need for closeness alongside the need for autonomy. The patterns that emerge reflect this dance, not a problem with either person.`

  return {
    primaryDynamic,
    underlyingNeeds,
    emotionalCycle,
    balancedInsight,
  }
}

function detectProfanityAndIntensity(text: string): {
  profanityCount: number
  intensityLevel: "low" | "moderate" | "high"
  emotionalEscalation: boolean
} {
  const lower = text.toLowerCase()

  // Profanity markers (mild to strong)
  const profanityMarkers = [
    "damn",
    "hell",
    "crap",
    "shit",
    "fuck",
    "ass",
    "bitch",
    "bastard",
    "wtf",
    "stfu",
    "bullshit",
  ]

  const profanityCount = profanityMarkers.filter((word) => lower.includes(word)).length

  // Intensity markers (caps, multiple punctuation)
  const capsMessages = (text.match(/[A-Z]{4,}/g) || []).length
  const multiPunctuation = (text.match(/[!?]{2,}/g) || []).length

  const intensityScore = profanityCount * 2 + capsMessages + multiPunctuation

  let intensityLevel: "low" | "moderate" | "high" = "low"
  if (intensityScore > 5) intensityLevel = "high"
  else if (intensityScore > 2) intensityLevel = "moderate"

  const emotionalEscalation = profanityCount > 2 || capsMessages > 2

  return {
    profanityCount,
    intensityLevel,
    emotionalEscalation,
  }
}

function analyzeMessageTiming(
  text: string,
  speakerLabel: string,
): {
  rapidFireSequences: number
  averageGapIndicator: "rapid" | "normal" | "delayed"
  anxiousPursuit: boolean
  emotionalFlooding: boolean
} {
  const pattern = new RegExp(`\\[${speakerLabel}\\]`, "gi")
  const matches = []
  let match

  while ((match = pattern.exec(text)) !== null) {
    matches.push(match.index)
  }

  if (matches.length < 2) {
    return {
      rapidFireSequences: 0,
      averageGapIndicator: "normal",
      anxiousPursuit: false,
      emotionalFlooding: false,
    }
  }

  // Count rapid-fire sequences (3+ messages in close proximity)
  let rapidFireSequences = 0
  let consecutiveCount = 1

  for (let i = 1; i < matches.length; i++) {
    const gap = matches[i] - matches[i - 1]
    if (gap < 100) {
      // Close proximity in text
      consecutiveCount++
      if (consecutiveCount >= 3) {
        rapidFireSequences++
      }
    } else {
      consecutiveCount = 1
    }
  }

  // Estimate average gap
  const totalGaps = matches.length - 1
  const avgGap = matches.reduce((sum, pos, i) => (i > 0 ? sum + (pos - matches[i - 1]) : sum), 0) / totalGaps

  let averageGapIndicator: "rapid" | "normal" | "delayed" = "normal"
  if (avgGap < 80) averageGapIndicator = "rapid"
  else if (avgGap > 200) averageGapIndicator = "delayed"

  const anxiousPursuit = rapidFireSequences > 2 && averageGapIndicator === "rapid"
  const emotionalFlooding = rapidFireSequences > 3

  return {
    rapidFireSequences,
    averageGapIndicator,
    anxiousPursuit,
    emotionalFlooding,
  }
}

function detectContemptMarkers(text: string): {
  contemptScore: number
  sarcasmDetected: boolean
  mockeryDetected: boolean
  nameCallingDetected: boolean
  eyeRollLanguage: boolean
} {
  const lower = text.toLowerCase()

  // Sarcasm indicators
  const sarcasmMarkers = ["oh sure", "yeah right", "whatever you say", "of course", "obviously", "clearly"]
  const sarcasmDetected = sarcasmMarkers.some((m) => lower.includes(m))

  // Mockery indicators
  const mockeryMarkers = ["seriously?", "are you kidding", "you're joking", "that's rich", "hilarious"]
  const mockeryDetected = mockeryMarkers.some((m) => lower.includes(m))

  // Name-calling
  const nameCallingMarkers = [
    "idiot",
    "stupid",
    "dumb",
    "crazy",
    "insane",
    "ridiculous",
    "pathetic",
    "childish",
    "immature",
  ]
  const nameCallingDetected = nameCallingMarkers.some((m) => lower.includes(m))

  // Eye-roll language (dismissive superiority)
  const eyeRollMarkers = ["ugh", "seriously", "unbelievable", "typical", "here we go again"]
  const eyeRollLanguage = eyeRollMarkers.some((m) => lower.includes(m))

  const contemptScore =
    (sarcasmDetected ? 2 : 0) + (mockeryDetected ? 3 : 0) + (nameCallingDetected ? 4 : 0) + (eyeRollLanguage ? 1 : 0)

  return {
    contemptScore,
    sarcasmDetected,
    mockeryDetected,
    nameCallingDetected,
    eyeRollLanguage,
  }
}

function detectRepairRejection(text: string): {
  repairRejections: number
  repairAcceptance: number
  repairEffectiveness: "high" | "moderate" | "low"
} {
  const lower = text.toLowerCase()

  // Repair attempts
  const repairMarkers = ["i'm sorry", "i apologize", "you're right", "i understand", "let me try", "can we"]

  // Rejection of repairs
  const rejectionMarkers = [
    "too late",
    "don't care",
    "whatever",
    "save it",
    "not enough",
    "doesn't matter",
    "forget it",
  ]

  // Acceptance of repairs
  const acceptanceMarkers = ["thank you", "i appreciate", "okay", "i hear you", "let's try"]

  const repairAttempts = repairMarkers.filter((m) => lower.includes(m)).length
  const repairRejections = rejectionMarkers.filter((m) => lower.includes(m)).length
  const repairAcceptance = acceptanceMarkers.filter((m) => lower.includes(m)).length

  let repairEffectiveness: "high" | "moderate" | "low" = "moderate"
  if (repairAttempts > 0) {
    const acceptanceRate = repairAcceptance / repairAttempts
    const rejectionRate = repairRejections / repairAttempts

    if (acceptanceRate > 0.5) repairEffectiveness = "high"
    else if (rejectionRate > 0.5) repairEffectiveness = "low"
  }

  return {
    repairRejections,
    repairAcceptance,
    repairEffectiveness,
  }
}

function detectAccountability(
  text: string,
  speakerLabel: string,
): {
  takesResponsibility: number
  blamesOther: number
  makesExcuses: number
  accountabilityScore: number
} {
  const pattern = new RegExp(`\\[${speakerLabel}\\]:\\s*"?([^"\\n]+)"?`, "gi")
  const messages: string[] = []
  let match

  while ((match = pattern.exec(text)) !== null) {
    messages.push(match[1].toLowerCase())
  }

  // Responsibility markers
  const responsibilityMarkers = ["i was wrong", "my fault", "i messed up", "i should have", "i'm responsible"]
  const takesResponsibility = messages.filter((msg) =>
    responsibilityMarkers.some((marker) => msg.includes(marker)),
  ).length

  // Blaming markers
  const blameMarkers = ["you made me", "you always", "you never", "your fault", "because of you", "you did"]
  const blamesOther = messages.filter((msg) => blameMarkers.some((marker) => msg.includes(marker))).length

  // Excuse markers
  const excuseMarkers = ["but i", "but you", "i had to", "i couldn't help", "it's not my"]
  const makesExcuses = messages.filter((msg) => excuseMarkers.some((marker) => msg.includes(marker))).length

  const accountabilityScore = Math.max(0, takesResponsibility * 10 - blamesOther * 5 - makesExcuses * 3)

  return {
    takesResponsibility,
    blamesOther,
    makesExcuses,
    accountabilityScore,
  }
}

function analyzeEmotionalLabor(
  text: string,
  subjectALabel: string,
  subjectBLabel: string,
): {
  subjectALabor: number
  subjectBLabor: number
  laborImbalance: "balanced" | "slight" | "significant"
  whoDoesMore: string
} {
  const lower = text.toLowerCase()

  // Emotional labor indicators
  const laborMarkers = [
    "how are you feeling",
    "what do you need",
    "let's talk about",
    "i'm worried about",
    "can we discuss",
    "i want to understand",
    "help me understand",
    "i'm here for you",
  ]

  // Count labor for each person
  const subjectAPattern = new RegExp(`\\[${subjectALabel}\\]:\\s*"?([^"\\n]+)"?`, "gi")
  const subjectBPattern = new RegExp(`\\[${subjectBLabel}\\]:\\s*"?([^"\\n]+)"?`, "gi")

  let subjectALabor = 0
  let subjectBLabor = 0
  let match

  while ((match = subjectAPattern.exec(text)) !== null) {
    const message = match[1].toLowerCase()
    if (laborMarkers.some((marker) => message.includes(marker))) {
      subjectALabor++
    }
  }

  while ((match = subjectBPattern.exec(text)) !== null) {
    const message = match[1].toLowerCase()
    if (laborMarkers.some((marker) => message.includes(marker))) {
      subjectBLabor++
    }
  }

  const totalLabor = subjectALabor + subjectBLabor
  const difference = Math.abs(subjectALabor - subjectBLabor)

  let laborImbalance: "balanced" | "slight" | "significant" = "balanced"
  if (totalLabor > 0) {
    const imbalanceRatio = difference / totalLabor
    if (imbalanceRatio > 0.5) laborImbalance = "significant"
    else if (imbalanceRatio > 0.25) laborImbalance = "slight"
  }

  const whoDoesMore = subjectALabor > subjectBLabor ? subjectALabel : subjectBLabel

  return {
    subjectALabor,
    subjectBLabor,
    laborImbalance,
    whoDoesMore,
  }
}

// 1. CONTEXTUAL INTERPRETATION ENGINE
interface EmotionalFlowState {
  phase: "connection" | "tension" | "repair" | "calm" | "escalation" | "shutdown"
  intensity: number
  nervousSystemState: "🟢 ventral" | "🟡 sympathetic" | "🔵 dorsal"
}

interface MessageIntent {
  intent: "connect" | "defend" | "control" | "withdraw" | "repair" | "attack" | "validate"
  confidence: number
  nervousSystemState: "🟢 ventral" | "🟡 sympathetic" | "🔵 dorsal"
}

function detectMessageIntent(message: string, priorState: EmotionalFlowState): MessageIntent {
  const lower = message.toLowerCase()

  // Connect intent markers
  const connectMarkers = [
    "i love",
    "i miss",
    "i appreciate",
    "thank you",
    "i'm grateful",
    "can we",
    "let's",
    "together",
    "i want to understand",
    "help me understand",
  ]
  const connectScore = connectMarkers.filter((m) => lower.includes(m)).length

  // Defend intent markers
  const defendMarkers = [
    "but i",
    "but you",
    "i didn't",
    "that's not",
    "not my fault",
    "you always",
    "you never",
    "i had to",
  ]
  const defendScore = defendMarkers.filter((m) => lower.includes(m)).length

  // Control intent markers
  const controlMarkers = ["you should", "you need to", "you have to", "you must", "stop", "don't"]
  const controlScore = controlMarkers.filter((m) => lower.includes(m)).length

  // Withdraw intent markers
  const withdrawMarkers = [
    "whatever",
    "fine",
    "forget it",
    "never mind",
    "i don't care",
    "doesn't matter",
    "leave me alone",
  ]
  const withdrawScore = withdrawMarkers.filter((m) => lower.includes(m)).length

  // Repair intent markers
  const repairMarkers = ["i'm sorry", "i apologize", "you're right", "i understand", "i was wrong", "my fault"]
  const repairScore = repairMarkers.filter((m) => lower.includes(m)).length

  // Attack intent markers (contempt, criticism)
  const attackMarkers = [
    "you're stupid",
    "you're crazy",
    "you're ridiculous",
    "pathetic",
    "idiot",
    "unbelievable",
    "typical",
  ]
  const attackScore = attackMarkers.filter((m) => lower.includes(m)).length

  // Validate intent markers
  const validateMarkers = ["i hear you", "that makes sense", "i get it", "i see", "you're right", "i understand why"]
  const validateScore = validateMarkers.filter((m) => lower.includes(m)).length

  // Determine primary intent
  const scores = {
    connect: connectScore,
    defend: defendScore,
    control: controlScore,
    withdraw: withdrawScore,
    repair: repairScore,
    attack: attackScore,
    validate: validateScore,
  }

  const maxScore = Math.max(...Object.values(scores))
  const intent = (Object.keys(scores).find((key) => scores[key as keyof typeof scores] === maxScore) ||
    "connect") as MessageIntent["intent"]

  // Determine nervous system state based on intent and prior state
  let nervousSystemState: MessageIntent["nervousSystemState"] = "🟢 ventral"
  if (intent === "attack" || intent === "defend" || intent === "control") {
    nervousSystemState = "🟡 sympathetic" // Fight/flight
  } else if (intent === "withdraw" || priorState.phase === "shutdown") {
    nervousSystemState = "🔵 dorsal" // Shutdown
  } else if (intent === "repair" || intent === "validate" || intent === "connect") {
    nervousSystemState = "🟢 ventral" // Safe connection
  }

  const confidence = Math.min(100, maxScore * 25 + 50)

  return { intent, confidence, nervousSystemState }
}

function mapEmotionalFlow(conversationText: string): {
  flowStates: EmotionalFlowState[]
  dominantPhase: EmotionalFlowState["phase"]
  transitionCount: number
  nervousSystemSummary: string
} {
  const messages = conversationText.split(/\n/).filter((line) => line.includes("[") && line.includes("]"))

  if (messages.length === 0) {
    return {
      flowStates: [{ phase: "calm", intensity: 3, nervousSystemState: "🟢 ventral" }],
      dominantPhase: "calm",
      transitionCount: 0,
      nervousSystemSummary: "Insufficient data to map emotional flow",
    }
  }

  const flowStates: EmotionalFlowState[] = []
  let currentState: EmotionalFlowState = { phase: "calm", intensity: 3, nervousSystemState: "🟢 ventral" }

  messages.forEach((message, index) => {
    const intent = detectMessageIntent(message, currentState)

    // Update phase based on intent
    if (intent.intent === "connect" || intent.intent === "validate") {
      currentState = { phase: "connection", intensity: 2, nervousSystemState: intent.nervousSystemState }
    } else if (intent.intent === "defend" || intent.intent === "attack") {
      currentState = {
        phase: currentState.phase === "tension" ? "escalation" : "tension",
        intensity: intent.intent === "attack" ? 8 : 6,
        nervousSystemState: intent.nervousSystemState,
      }
    } else if (intent.intent === "withdraw") {
      currentState = { phase: "shutdown", intensity: 7, nervousSystemState: intent.nervousSystemState }
    } else if (intent.intent === "repair") {
      currentState = { phase: "repair", intensity: 4, nervousSystemState: intent.nervousSystemState }
    } else if (intent.intent === "control") {
      currentState = { phase: "tension", intensity: 5, nervousSystemState: intent.nervousSystemState }
    }

    flowStates.push({ ...currentState })
  })

  // Calculate dominant phase
  const phaseCounts = flowStates.reduce(
    (acc, state) => {
      acc[state.phase] = (acc[state.phase] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )
  const dominantPhase = (Object.keys(phaseCounts).reduce((a, b) => (phaseCounts[a] > phaseCounts[b] ? a : b)) ||
    "calm") as EmotionalFlowState["phase"]

  // Count transitions
  let transitionCount = 0
  for (let i = 1; i < flowStates.length; i++) {
    if (flowStates[i].phase !== flowStates[i - 1].phase) {
      transitionCount++
    }
  }

  // Nervous system summary
  const nervousSystemCounts = flowStates.reduce(
    (acc, state) => {
      acc[state.nervousSystemState] = (acc[state.nervousSystemState] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const totalStates = flowStates.length
  const ventralPercent = Math.round(((nervousSystemCounts["🟢 ventral"] || 0) / totalStates) * 100)
  const sympatheticPercent = Math.round(((nervousSystemCounts["🟡 sympathetic"] || 0) / totalStates) * 100)
  const dorsalPercent = Math.round(((nervousSystemCounts["🔵 dorsal"] || 0) / totalStates) * 100)

  const nervousSystemSummary = `Nervous system regulation: ${ventralPercent}% safe/connected (🟢 ventral), ${sympatheticPercent}% activated/defensive (🟡 sympathetic), ${dorsalPercent}% shutdown/withdrawn (🔵 dorsal). ${
    ventralPercent > 60
      ? "Both partners spend most of the conversation in a regulated, safe state."
      : sympatheticPercent > 40
        ? "Significant time spent in fight/flight activation, indicating emotional reactivity and defensiveness."
        : dorsalPercent > 30
          ? "Notable shutdown and withdrawal patterns suggest emotional overwhelm or avoidance."
          : "Mixed regulation states—both partners are navigating between connection and protection."
  }`

  return { flowStates, dominantPhase, transitionCount, nervousSystemSummary }
}

// 2. SUBTEXT & SYMBOLISM DETECTION
function detectSubtext(message: string): {
  hasSubtext: boolean
  likelyMeaning: string
  confidence: number
  emotionalMask: "sarcasm" | "minimizing" | "humor" | "none"
} {
  const lower = message.toLowerCase().trim()

  // "I'm fine" patterns
  if (
    lower === "i'm fine" ||
    lower === "im fine" ||
    lower === "fine" ||
    lower === "i'm fine." ||
    lower === "it's fine"
  ) {
    return {
      hasSubtext: true,
      likelyMeaning:
        "May actually mean: 'I'm not fine, but I don't feel safe sharing' or 'I'm hurt and want you to notice'",
      confidence: 75,
      emotionalMask: "minimizing",
    }
  }

  // "Doesn't matter" patterns
  if (lower.includes("doesn't matter") || lower.includes("dont matter") || lower.includes("doesn't even matter")) {
    return {
      hasSubtext: true,
      likelyMeaning: "May actually mean: 'It matters deeply, but I feel hopeless about being heard'",
      confidence: 80,
      emotionalMask: "minimizing",
    }
  }

  // "Whatever" patterns
  if (lower === "whatever" || lower === "whatever." || lower.includes("whatever you say")) {
    return {
      hasSubtext: true,
      likelyMeaning: "May actually mean: 'I'm giving up on being understood' or 'I'm too hurt to keep trying'",
      confidence: 85,
      emotionalMask: "minimizing",
    }
  }

  // Sarcasm patterns
  const sarcasmMarkers = ["oh sure", "yeah right", "of course", "obviously", "clearly", "how nice"]
  if (sarcasmMarkers.some((m) => lower.includes(m))) {
    return {
      hasSubtext: true,
      likelyMeaning:
        "Sarcasm detected—likely expressing frustration, contempt, or feeling unheard through indirect criticism",
      confidence: 70,
      emotionalMask: "sarcasm",
    }
  }

  // Humor as deflection
  if ((lower.includes("haha") || lower.includes("lol") || lower.includes("😂")) && lower.length < 30) {
    return {
      hasSubtext: true,
      likelyMeaning: "Humor may be masking discomfort, deflecting from vulnerability, or minimizing feelings",
      confidence: 50,
      emotionalMask: "humor",
    }
  }

  return {
    hasSubtext: false,
    likelyMeaning: "",
    confidence: 0,
    emotionalMask: "none",
  }
}

// 3. EMOTIONAL MOTIVATION INFERENCE
function inferEmotionalMotivation(
  text: string,
  speakerLabel: string,
): {
  primaryMotive: "fear-driven" | "control-driven" | "avoidance-driven" | "repair-driven" | "connection-driven"
  secondaryMotive: string
  confidence: number
  explanation: string
} {
  const pattern = new RegExp(`\\[${speakerLabel}\\]:\\s*"?([^"\\n]+)"?`, "gi")
  const messages: string[] = []
  let match

  while ((match = pattern.exec(text)) !== null) {
    messages.push(match[1].toLowerCase())
  }

  if (messages.length === 0) {
    return {
      primaryMotive: "connection-driven",
      secondaryMotive: "seeking understanding",
      confidence: 30,
      explanation: "Insufficient data to infer motivation",
    }
  }

  // Fear-driven markers (anxious attachment, fear of abandonment)
  const fearMarkers = [
    "are you mad",
    "are you okay",
    "did i do something",
    "please don't",
    "i'm scared",
    "what if",
    "are we okay",
  ]
  const fearScore = messages.filter((msg) => fearMarkers.some((marker) => msg.includes(marker))).length

  // Control-driven markers (need for certainty, managing anxiety through control)
  const controlMarkers = [
    "you should",
    "you need to",
    "you have to",
    "why don't you",
    "just",
    "you always",
    "you never",
  ]
  const controlScore = messages.filter((msg) => controlMarkers.some((marker) => msg.includes(marker))).length

  // Avoidance-driven markers (fear of conflict, emotional overwhelm)
  const avoidanceMarkers = ["whatever", "fine", "forget it", "never mind", "i don't want to talk", "can we not"]
  const avoidanceScore = messages.filter((msg) => avoidanceMarkers.some((marker) => msg.includes(marker))).length

  // Repair-driven markers (desire to reconnect, heal)
  const repairMarkers = ["i'm sorry", "i love you", "can we", "let's try", "i want to fix", "i miss"]
  const repairScore = messages.filter((msg) => repairMarkers.some((marker) => msg.includes(marker))).length

  // Connection-driven markers (seeking intimacy, understanding)
  const connectionMarkers = ["i feel", "i need", "help me understand", "i want to understand", "tell me", "how are you"]
  const connectionScore = messages.filter((msg) => connectionMarkers.some((marker) => msg.includes(marker))).length

  const scores = {
    "fear-driven": fearScore,
    "control-driven": controlScore,
    "avoidance-driven": avoidanceScore,
    "repair-driven": repairScore,
    "connection-driven": connectionScore,
  }

  const maxScore = Math.max(...Object.values(scores))
  const primaryMotive = (Object.keys(scores).find((key) => scores[key as keyof typeof scores] === maxScore) ||
    "connection-driven") as
    | "fear-driven"
    | "control-driven"
    | "avoidance-driven"
    | "repair-driven"
    | "connection-driven"

  const confidence = Math.min(100, (maxScore / messages.length) * 100 + 40)

  const explanations = {
    "fear-driven":
      "Messages suggest anxiety about the relationship's stability or fear of abandonment. This often stems from anxious attachment patterns.",
    "control-driven":
      "Messages attempt to manage or direct the partner's behavior, possibly to maintain a sense of safety through predictability.",
    "avoidance-driven":
      "Messages indicate a desire to escape emotional intensity or conflict, often a protective response to feeling overwhelmed.",
    "repair-driven":
      "Messages show genuine effort to heal disconnection and restore emotional safety. This reflects emotional maturity and commitment.",
    "connection-driven":
      "Messages seek deeper understanding and emotional intimacy. This reflects secure attachment and healthy relationship investment.",
  }

  // Determine secondary motive
  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const secondaryMotive = sortedScores[1]?.[0] || "seeking understanding"

  return {
    primaryMotive,
    secondaryMotive,
    confidence,
    explanation: explanations[primaryMotive],
  }
}

// 4. CONTEXTUAL WEIGHTING ENGINE - Adjust scores based on context
function applyContextualWeighting(
  baseScore: number,
  context: {
    emotionalFlow: ReturnType<typeof mapEmotionalFlow>
    subjectAMotivation: ReturnType<typeof inferEmotionalMotivation>
    subjectBMotivation: ReturnType<typeof inferEmotionalMotivation>
    hasFlooding: boolean
    hasHumor: boolean
    hasSilence: boolean
    hasAccountability: boolean
  },
): number {
  let adjustedScore = baseScore

  // Positive adjustments
  if (
    context.subjectAMotivation.primaryMotive === "repair-driven" ||
    context.subjectBMotivation.primaryMotive === "repair-driven"
  ) {
    adjustedScore += 10
  }
  if (
    context.subjectAMotivation.primaryMotive === "connection-driven" ||
    context.subjectBMotivation.primaryMotive === "connection-driven"
  ) {
    adjustedScore += 8
  }
  if (context.hasAccountability) {
    adjustedScore += 5
  }
  if (context.emotionalFlow.dominantPhase === "connection" || context.emotionalFlow.dominantPhase === "repair") {
    adjustedScore += 7
  }

  // Negative adjustments
  if (
    context.subjectAMotivation.primaryMotive === "avoidance-driven" ||
    context.subjectBMotivation.primaryMotive === "avoidance-driven"
  ) {
    adjustedScore -= 12
  }
  if (
    context.subjectAMotivation.primaryMotive === "control-driven" ||
    context.subjectBMotivation.primaryMotive === "control-driven"
  ) {
    adjustedScore -= 8
  }
  if (context.hasFlooding) {
    adjustedScore -= 15
  }
  if (context.emotionalFlow.dominantPhase === "escalation" || context.emotionalFlow.dominantPhase === "shutdown") {
    adjustedScore -= 10
  }
  if (context.hasSilence && context.emotionalFlow.dominantPhase === "tension") {
    adjustedScore -= 8
  }

  return Math.max(20, Math.min(100, adjustedScore))
}

// 5. EXTRACT UNDERLYING EMOTIONAL THEMES
function extractEmotionalThemes(
  conversationText: string,
  emotionalFlow: ReturnType<typeof mapEmotionalFlow>,
  subjectAMotivation: ReturnType<typeof inferEmotionalMotivation>,
  subjectBMotivation: ReturnType<typeof inferEmotionalMotivation>,
): string[] {
  const themes: string[] = []

  // Pursue/withdraw loop
  if (
    (subjectAMotivation.primaryMotive === "fear-driven" && subjectBMotivation.primaryMotive === "avoidance-driven") ||
    (subjectBMotivation.primaryMotive === "fear-driven" && subjectAMotivation.primaryMotive === "avoidance-driven")
  ) {
    themes.push(
      "Pursue/Withdraw Loop: One partner seeks reassurance while the other needs space, creating a cycle where both feel increasingly unsafe.",
    )
  }

  // Fear of rejection
  if (subjectAMotivation.primaryMotive === "fear-driven" || subjectBMotivation.primaryMotive === "fear-driven") {
    themes.push(
      "Fear of Rejection: Underlying anxiety about being abandoned or not being 'enough' drives protective behaviors.",
    )
  }

  // Control as safety
  if (subjectAMotivation.primaryMotive === "control-driven" || subjectBMotivation.primaryMotive === "control-driven") {
    themes.push(
      "Control as Safety: Attempts to manage or direct behavior reflect a need for predictability and emotional safety.",
    )
  }

  // Vulnerability avoidance
  if (
    emotionalFlow.dominantPhase === "shutdown" ||
    subjectAMotivation.primaryMotive === "avoidance-driven" ||
    subjectBMotivation.primaryMotive === "avoidance-driven"
  ) {
    themes.push(
      "Vulnerability Avoidance: Stepping back from emotional intensity protects against overwhelm but prevents deeper connection.",
    )
  }

  // Repair and resilience
  if (
    subjectAMotivation.primaryMotive === "repair-driven" ||
    subjectBMotivation.primaryMotive === "repair-driven" ||
    emotionalFlow.dominantPhase === "repair"
  ) {
    themes.push(
      "Repair and Resilience: Both partners demonstrate capacity to reach across disconnection and restore emotional safety.",
    )
  }

  // Unspoken needs
  const lower = conversationText.toLowerCase()
  if (
    (lower.includes("fine") || lower.includes("whatever") || lower.includes("doesn't matter")) &&
    emotionalFlow.transitionCount > 3
  ) {
    themes.push(
      "Unspoken Needs: Important feelings and needs remain unexpressed, creating distance and misunderstanding.",
    )
  }

  // Default if no themes detected
  if (themes.length === 0) {
    themes.push(
      "Navigating Intimacy: Both partners are learning to balance their need for closeness with their need for autonomy and emotional safety.",
    )
  }

  return themes.slice(0, 2) // Return max 2 themes
}

// NEW FUNCTIONS FOR PDR TRACKING
function analyzeBidirectionalPDR(
  conversationText: string,
  subjectALabel: string,
  subjectBLabel: string,
): {
  subjectA_pursues_B: number
  subjectB_pursues_A: number
  subjectA_distances_from_B: number
  subjectB_distances_from_A: number
  subjectA_repairs_toward_B: number
  subjectB_repairs_toward_A: number
  pursuitAsymmetry: number
  distanceAsymmetry: number
  repairAsymmetry: number
} {
  const messages = conversationText.split(/\[(?:Subject [AB]|[^\]]+)\]/).filter((m) => m.trim())
  const labels = conversationText.match(/\[([^\]]+)\]/g)?.map((l) => l.replace(/[[\]]/g, "")) || []

  let subjectA_pursues_B = 0
  let subjectB_pursues_A = 0
  let subjectA_distances_from_B = 0
  let subjectB_distances_from_A = 0
  let subjectA_repairs_toward_B = 0
  let subjectB_repairs_toward_A = 0

  const pursuitMarkers = [
    "can we talk",
    "i miss",
    "i want to",
    "let's",
    "are you",
    "where are you",
    "?",
    "i need",
    "please",
    "i love you",
  ]
  const distanceMarkers = ["whatever", "fine", "ok", "sure", "nothing", "forget it", "never mind", "i don't care"]
  const repairMarkers = ["i'm sorry", "i apologize", "you're right", "i understand", "my fault", "i was wrong"]

  messages.forEach((msg, i) => {
    const lower = msg.toLowerCase()
    const speaker = labels[i]

    const pursuitCount = pursuitMarkers.filter((m) => lower.includes(m)).length
    const distanceCount = distanceMarkers.filter((m) => lower.includes(m)).length
    const repairCount = repairMarkers.filter((m) => lower.includes(m)).length

    if (speaker === subjectALabel) {
      subjectA_pursues_B += pursuitCount
      subjectA_distances_from_B += distanceCount
      subjectA_repairs_toward_B += repairCount
    } else if (speaker === subjectBLabel) {
      subjectB_pursues_A += pursuitCount
      subjectB_distances_from_A += distanceCount
      subjectB_repairs_toward_A += repairCount
    }
  })

  const totalPursuit = subjectA_pursues_B + subjectB_pursues_A
  const totalDistance = subjectA_distances_from_B + subjectB_distances_from_A
  const totalRepair = subjectA_repairs_toward_B + subjectB_repairs_toward_A

  const pursuitAsymmetry = totalPursuit > 0 ? Math.abs(subjectA_pursues_B - subjectB_pursues_A) / totalPursuit : 0
  const distanceAsymmetry =
    totalDistance > 0 ? Math.abs(subjectA_distances_from_B - subjectB_distances_from_A) / totalDistance : 0
  const repairAsymmetry =
    totalRepair > 0 ? Math.abs(subjectA_repairs_toward_B - subjectB_repairs_toward_A) / totalRepair : 0

  return {
    subjectA_pursues_B,
    subjectB_pursues_A,
    subjectA_distances_from_B,
    subjectB_distances_from_A,
    subjectA_repairs_toward_B,
    subjectB_repairs_toward_A,
    pursuitAsymmetry,
    distanceAsymmetry,
    repairAsymmetry,
  }
}

function detectPursueWithdrawLoop(
  conversationText: string,
  subjectALabel: string,
  subjectBLabel: string,
): {
  loopDetected: boolean
  loopCount: number
  pursuer: string
  withdrawer: string
  escalates: boolean
  description: string
} {
  const messages = conversationText.split(/\[(?:Subject [AB]|[^\]]+)\]/).filter((m) => m.trim())
  const labels = conversationText.match(/\[([^\]]+)\]/g)?.map((l) => l.replace(/[[\]]/g, "")) || []

  const pursuitMarkers = ["can we talk", "i miss", "are you", "where", "please", "?"]
  const withdrawalMarkers = ["whatever", "fine", "ok", "nothing", "forget it", "never mind"]

  let loopCount = 0
  let lastAction: "pursue" | "withdraw" | null = null
  let lastActor: string | null = null
  const pursuerCount: Record<string, number> = { [subjectALabel]: 0, [subjectBLabel]: 0 }
  const withdrawerCount: Record<string, number> = { [subjectALabel]: 0, [subjectBLabel]: 0 }

  messages.forEach((msg, i) => {
    const lower = msg.toLowerCase()
    const speaker = labels[i]

    const isPursuit = pursuitMarkers.some((m) => lower.includes(m))
    const isWithdrawal = withdrawalMarkers.some((m) => lower.includes(m))

    if (isPursuit && lastAction === "withdraw" && lastActor !== speaker) {
      loopCount++
      pursuerCount[speaker]++
    } else if (isWithdrawal && lastAction === "pursue" && lastActor !== speaker) {
      loopCount++
      withdrawerCount[speaker]++
    }

    if (isPursuit) {
      lastAction = "pursue"
      lastActor = speaker
    } else if (isWithdrawal) {
      lastAction = "withdraw"
      lastActor = speaker
    }
  })

  const pursuer = pursuerCount[subjectALabel] > pursuerCount[subjectBLabel] ? subjectALabel : subjectBLabel
  const withdrawer = pursuer === subjectALabel ? subjectBLabel : subjectALabel
  const loopDetected = loopCount >= 2
  const escalates = loopCount > 3

  const description = loopDetected
    ? `${pursuer} pursues connection while ${withdrawer} withdraws (${loopCount} loop iterations). ${escalates ? "Pattern escalates over time." : "Pattern remains stable."}`
    : "No clear pursue-withdraw loop detected"

  return {
    loopDetected,
    loopCount,
    pursuer,
    withdrawer,
    escalates,
    description,
  }
}

function assessRepairQuality(conversationText: string): {
  superficial: number
  genuine: number
  accountable: number
  empathic: number
  overallQuality: "low" | "moderate" | "high"
} {
  const lower = conversationText.toLowerCase()

  // Superficial: just "sorry" without context
  const superficial = (lower.match(/\bsorry\b(?!\s+(i|that|for|about))/g) || []).length

  // Genuine: "I'm sorry I..." or "I'm sorry that..."
  const genuine = (lower.match(/sorry\s+(i|that|for)\s+\w+/g) || []).length

  // Accountable: "I was wrong", "my fault", "I shouldn't have"
  const accountable = (lower.match(/(i was wrong|my fault|i shouldn't have|i messed up)/g) || []).length

  // Empathic: "I understand why you felt", "I see how that hurt"
  const empathic = (lower.match(/(i understand (why|how)|i see (why|how)|that must have)/g) || []).length

  const totalRepairs = superficial + genuine + accountable + empathic
  const qualityScore = totalRepairs > 0 ? (genuine * 2 + accountable * 3 + empathic * 4) / (totalRepairs * 4) : 0

  const overallQuality = qualityScore > 0.6 ? "high" : qualityScore > 0.3 ? "moderate" : "low"

  return {
    superficial,
    genuine,
    accountable,
    empathic,
    overallQuality,
  }
}

function analyzeRepairTiming(conversationText: string): {
  immediate: number
  delayed: number
  absent: number
  timingQuality: "excellent" | "good" | "poor"
} {
  const messages = conversationText.split(/\[(?:Subject [AB]|[^\]]+)\]/).filter((m) => m.trim())

  const conflictMarkers = ["but", "however", "you always", "you never", "that's not"]
  const repairMarkers = ["sorry", "apologize", "you're right", "i understand"]

  let immediate = 0
  let delayed = 0
  let absent = 0
  let lastConflictIndex = -1

  messages.forEach((msg, i) => {
    const lower = msg.toLowerCase()
    const hasConflict = conflictMarkers.some((m) => lower.includes(m))
    const hasRepair = repairMarkers.some((m) => lower.includes(m))

    if (hasConflict) {
      lastConflictIndex = i
    }

    if (hasRepair && lastConflictIndex >= 0) {
      const gap = i - lastConflictIndex
      if (gap <= 2) {
        immediate++
      } else {
        delayed++
      }
      lastConflictIndex = -1
    }
  })

  // Count unresolved conflicts
  if (lastConflictIndex >= 0) {
    absent++
  }

  const timingQuality = immediate > delayed && absent === 0 ? "excellent" : immediate >= delayed ? "good" : "poor"

  return {
    immediate,
    delayed,
    absent,
    timingQuality,
  }
}

function distinguishPursuitType(
  conversationText: string,
  subjectLabel: string,
  timing: ReturnType<typeof analyzeMessageTiming>,
): {
  healthyPursuit: number
  anxiousProtest: number
  pursuitType: "healthy" | "anxious" | "mixed"
} {
  const messages = conversationText.split(/\[(?:Subject [AB]|[^\]]+)\]/).filter((m) => m.trim())
  const labels = conversationText.match(/\[([^\]]+)\]/g)?.map((l) => l.replace(/[[\]]/g, "")) || []

  const healthyMarkers = ["i miss you", "can we talk", "i'd love to", "thinking of you"]
  const anxiousMarkers = ["why aren't you", "you never", "where are you", "why won't you", "!!!"]

  let healthyPursuit = 0
  let anxiousProtest = 0

  messages.forEach((msg, i) => {
    const lower = msg.toLowerCase()
    const speaker = labels[i]

    if (speaker === subjectLabel) {
      healthyPursuit += healthyMarkers.filter((m) => lower.includes(m)).length
      anxiousProtest += anxiousMarkers.filter((m) => lower.includes(m)).length
    }
  })

  // Rapid-fire messaging is a sign of anxious protest
  if (timing.anxiousPursuit) {
    anxiousProtest += timing.rapidFireSequences
  }

  const pursuitType = anxiousProtest > healthyPursuit ? "anxious" : healthyPursuit > 0 ? "healthy" : "mixed"

  return {
    healthyPursuit,
    anxiousProtest,
    pursuitType,
  }
}

function distinguishWithdrawalType(
  conversationText: string,
  subjectLabel: string,
): {
  stonewalling: number
  healthySpace: number
  withdrawalType: "stonewalling" | "healthy" | "mixed"
} {
  const messages = conversationText.split(/\[(?:Subject [AB]|[^\]]+)\]/).filter((m) => m.trim())
  const labels = conversationText.match(/\[([^\]]+)\]/g)?.map((l) => l.replace(/[[\]]/g, "")) || []

  const stonewallingMarkers = ["whatever", "i don't care", "fine", "ok", "sure"]
  const healthySpaceMarkers = ["i need time", "can we talk later", "i'm overwhelmed", "let me think"]

  let stonewalling = 0
  let healthySpace = 0

  messages.forEach((msg, i) => {
    const lower = msg.toLowerCase()
    const speaker = labels[i]

    if (speaker === subjectLabel) {
      stonewalling += stonewallingMarkers.filter((m) => lower.includes(m)).length
      healthySpace += healthySpaceMarkers.filter((m) => lower.includes(m)).length
    }
  })

  const withdrawalType = stonewalling > healthySpace ? "stonewalling" : healthySpace > 0 ? "healthy" : "mixed"

  return {
    stonewalling,
    healthySpace,
    withdrawalType,
  }
}

function trackPatternEvolution(conversationText: string): {
  early: { pursuit: number; distance: number; repair: number }
  middle: { pursuit: number; distance: number; repair: number }
  late: { pursuit: number; distance: number; repair: number }
  trend: "improving" | "worsening" | "stable"
  description: string
} {
  const messages = conversationText.split(/\[(?:Subject [AB]|[^\]]+)\]/).filter((m) => m.trim())
  const third = Math.floor(messages.length / 3)

  const earlyMessages = messages.slice(0, third).join(" ")
  const middleMessages = messages.slice(third, third * 2).join(" ")
  const lateMessages = messages.slice(third * 2).join(" ")

  const countPatterns = (text: string) => {
    const lower = text.toLowerCase()
    const pursuit = (lower.match(/(can we talk|i miss|are you|where|please|\?)/g) || []).length
    const distance = (lower.match(/(whatever|fine|ok|nothing|forget it|never mind)/g) || []).length
    const repair = (lower.match(/(sorry|apologize|you're right|i understand)/g) || []).length
    return { pursuit, distance, repair }
  }

  const early = countPatterns(earlyMessages)
  const middle = countPatterns(middleMessages)
  const late = countPatterns(lateMessages)

  const earlyScore = early.repair - early.distance
  const middleScore = middle.repair - middle.distance
  const lateScore = late.repair - late.distance

  const trend = lateScore > earlyScore ? "improving" : lateScore < earlyScore ? "worsening" : "stable"

  const description =
    trend === "improving"
      ? "Patterns improve over the conversation—more repair, less distance"
      : trend === "worsening"
        ? "Patterns worsen over the conversation—less repair, more distance"
        : "Patterns remain stable throughout the conversation"

  return {
    early,
    middle,
    late,
    trend,
    description,
  }
}

// FIXED PDR SCORE CALCULATION - now uses individual subject pursuit/withdrawal types
function calculatePDRScores(
  bidirectionalPDR: ReturnType<typeof analyzeBidirectionalPDR>,
  subjectA_pursuitType: { healthyPursuit: number; anxiousProtest: number },
  subjectB_pursuitType: { healthyPursuit: number; anxiousProtest: number },
  subjectA_withdrawalType: { stonewalling: number; healthySpace: number },
  subjectB_withdrawalType: { stonewalling: number; healthySpace: number },
  repairQuality: ReturnType<typeof assessRepairQuality>,
  repairTiming: ReturnType<typeof analyzeRepairTiming>,
): {
  subjectA_pursueScore: number
  subjectB_pursueScore: number
  subjectA_distanceScore: number
  subjectB_distanceScore: number
  subjectA_repairScore: number
  subjectB_repairScore: number
} {
  // Pursue Score: Higher is more pursuit (0-100)
  // Each subject's score is based on their own pursuit behavior
  const subjectA_pursueScore = Math.min(
    100,
    bidirectionalPDR.subjectA_pursues_B * 10 + subjectA_pursuitType.healthyPursuit * 5,
  )
  const subjectB_pursueScore = Math.min(
    100,
    bidirectionalPDR.subjectB_pursues_A * 10 + subjectB_pursuitType.healthyPursuit * 5,
  )

  // Distance Score: Higher is more distance (0-100)
  // Each subject's score is based on their own withdrawal behavior
  const subjectA_distanceScore = Math.min(
    100,
    bidirectionalPDR.subjectA_distances_from_B * 10 + subjectA_withdrawalType.stonewalling * 5,
  )
  const subjectB_distanceScore = Math.min(
    100,
    bidirectionalPDR.subjectB_distances_from_A * 10 + subjectB_withdrawalType.stonewalling * 5,
  )

  // Repair Score: Higher is better repair (0-100)
  // Quality and timing multipliers are shared, but each subject's score is based on their own repair attempts
  const qualityMultiplier =
    repairQuality.overallQuality === "high" ? 1.5 : repairQuality.overallQuality === "moderate" ? 1.0 : 0.5
  const timingMultiplier =
    repairTiming.timingQuality === "excellent" ? 1.5 : repairTiming.timingQuality === "good" ? 1.0 : 0.5

  const subjectA_repairScore = Math.min(
    100,
    bidirectionalPDR.subjectA_repairs_toward_B * 10 * qualityMultiplier * timingMultiplier,
  )
  const subjectB_repairScore = Math.min(
    100,
    bidirectionalPDR.subjectB_repairs_toward_A * 10 * qualityMultiplier * timingMultiplier,
  )

  return {
    subjectA_pursueScore,
    subjectB_pursueScore,
    subjectA_distanceScore,
    subjectB_distanceScore,
    subjectA_repairScore,
    subjectB_repairScore,
  }
}

function generateEnhancedFallbackAnalysis(subjectALabel: string, subjectBLabel: string, conversationText: string): any {
  const analysisStartTime = Date.now()

  logDiagnostic("info", "===== Love Lens v2.5 Analysis Engine =====")

  // Analyze conversation text
  const hasMinimalData = conversationText.length < 50
  const totalMessages = hasMinimalData ? 6 : (conversationText.match(/\[/g) || []).length
  const subjectAMessages = hasMinimalData
    ? 3
    : Math.max(3, (conversationText.match(new RegExp(`\\[${subjectALabel}\\]`, "gi")) || []).length)
  const subjectBMessages = hasMinimalData
    ? 3
    : Math.max(3, (conversationText.match(new RegExp(`\\[${subjectBLabel}\\]`, "gi")) || []).length)

  logDiagnostic("info", "Message distribution", {
    subjectA: subjectALabel,
    countA: subjectAMessages,
    subjectB: subjectBLabel,
    countB: subjectBMessages,
  })

  const emotionalFlow = hasMinimalData
    ? {
        flowStates: [{ phase: "calm" as const, intensity: 3, nervousSystemState: "🟢 ventral" as const }],
        dominantPhase: "calm" as const,
        transitionCount: 0,
        nervousSystemSummary: "Limited data available for emotional flow mapping",
      }
    : mapEmotionalFlow(conversationText)

  logDiagnostic("info", "Emotional flow analysis", {
    dominantPhase: emotionalFlow.dominantPhase,
    transitions: emotionalFlow.transitionCount,
    summary: emotionalFlow.nervousSystemSummary,
  })

  const subjectAMotivation = hasMinimalData
    ? {
        primaryMotive: "connection-driven" as const,
        secondaryMotive: "seeking understanding",
        confidence: 40,
        explanation: "Limited data available",
      }
    : inferEmotionalMotivation(conversationText, subjectALabel)

  const subjectBMotivation = hasMinimalData
    ? {
        primaryMotive: "connection-driven" as const,
        secondaryMotive: "seeking understanding",
        confidence: 40,
        explanation: "Limited data available",
      }
    : inferEmotionalMotivation(conversationText, subjectBLabel)

  logDiagnostic("info", "Motivation analysis", {
    subjectA: `${subjectAMotivation.primaryMotive} (${subjectAMotivation.confidence}% confidence)`,
    subjectB: `${subjectBMotivation.primaryMotive} (${subjectBMotivation.confidence}% confidence)`,
  })

  const emotionalThemes = hasMinimalData
    ? ["Navigating Intimacy: Both partners are learning to balance closeness with autonomy"]
    : extractEmotionalThemes(conversationText, emotionalFlow, subjectAMotivation, subjectBMotivation)

  logDiagnostic("info", "Emotional themes identified", { themes: emotionalThemes })

  const profanityAnalysis = hasMinimalData
    ? { profanityCount: 0, intensityLevel: "low" as const, emotionalEscalation: false }
    : detectProfanityAndIntensity(conversationText)

  const subjectATiming = hasMinimalData
    ? { rapidFireSequences: 0, averageGapIndicator: "normal" as const, anxiousPursuit: false, emotionalFlooding: false }
    : analyzeMessageTiming(conversationText, subjectALabel)

  const subjectBTiming = hasMinimalData
    ? { rapidFireSequences: 0, averageGapIndicator: "normal" as const, anxiousPursuit: false, emotionalFlooding: false }
    : analyzeMessageTiming(conversationText, subjectBLabel)

  const contemptMarkers = hasMinimalData
    ? {
        contemptScore: 0,
        sarcasmDetected: false,
        mockeryDetected: false,
        nameCallingDetected: false,
        eyeRollLanguage: false,
      }
    : detectContemptMarkers(conversationText)

  const repairDynamics = hasMinimalData
    ? { repairRejections: 0, repairAcceptance: 2, repairEffectiveness: "moderate" as const }
    : detectRepairRejection(conversationText)

  const subjectAAccountability = hasMinimalData
    ? { takesResponsibility: 1, blamesOther: 0, makesExcuses: 0, accountabilityScore: 10 }
    : detectAccountability(conversationText, subjectALabel)

  const subjectBAccountability = hasMinimalData
    ? { takesResponsibility: 1, blamesOther: 0, makesExcuses: 0, accountabilityScore: 10 }
    : detectAccountability(conversationText, subjectBLabel)

  const emotionalLabor = hasMinimalData
    ? { subjectALabor: 2, subjectBLabor: 2, laborImbalance: "balanced" as const, whoDoesMore: subjectALabel }
    : analyzeEmotionalLabor(conversationText, subjectALabel, subjectBLabel)

  logDiagnostic("info", "Profanity and intensity analysis", {
    count: profanityAnalysis.profanityCount,
    level: profanityAnalysis.intensityLevel,
    escalation: profanityAnalysis.emotionalEscalation,
  })
  logDiagnostic("info", "Message timing analysis", {
    subjectA: `${subjectATiming.averageGapIndicator} (${subjectATiming.rapidFireSequences} rapid sequences)`,
    subjectB: `${subjectBTiming.averageGapIndicator} (${subjectBTiming.rapidFireSequences} rapid sequences)`,
  })
  logDiagnostic("info", "Contempt markers analysis", {
    score: contemptMarkers.contemptScore,
    sarcasm: contemptMarkers.sarcasmDetected,
    nameCalling: contemptMarkers.nameCallingDetected,
  })
  logDiagnostic("info", "Repair dynamics analysis", {
    effectiveness: repairDynamics.repairEffectiveness,
    rejections: repairDynamics.repairRejections,
    acceptances: repairDynamics.repairAcceptance,
  })
  logDiagnostic("info", "Accountability analysis", {
    subjectA: `${subjectALabel}: ${subjectAAccountability.accountabilityScore}`,
    subjectB: `${subjectBLabel}: ${subjectBAccountability.accountabilityScore}`,
  })
  logDiagnostic("info", "Emotional labor analysis", {
    imbalance: emotionalLabor.laborImbalance,
    whoDoesMore: emotionalLabor.whoDoesMore,
  })

  const bidirectionalPDR = hasMinimalData
    ? {
        subjectA_pursues_B: 2,
        subjectB_pursues_A: 2,
        subjectA_distances_from_B: 1,
        subjectB_distances_from_A: 1,
        subjectA_repairs_toward_B: 1,
        subjectB_repairs_toward_A: 1,
        pursuitAsymmetry: 0,
        distanceAsymmetry: 0,
        repairAsymmetry: 0,
      }
    : analyzeBidirectionalPDR(conversationText, subjectALabel, subjectBLabel)

  const pursueWithdrawLoop = hasMinimalData
    ? {
        loopDetected: false,
        loopCount: 0,
        pursuer: subjectALabel,
        withdrawer: subjectBLabel,
        escalates: false,
        description: "Limited data for loop detection",
      }
    : detectPursueWithdrawLoop(conversationText, subjectALabel, subjectBLabel)

  const repairQuality = hasMinimalData
    ? { superficial: 0, genuine: 1, accountable: 0, empathic: 0, overallQuality: "moderate" as const }
    : assessRepairQuality(conversationText)

  const repairTiming = hasMinimalData
    ? { immediate: 1, delayed: 0, absent: 0, timingQuality: "good" as const }
    : analyzeRepairTiming(conversationText)

  const subjectA_pursuitType = hasMinimalData
    ? { healthyPursuit: 1, anxiousProtest: 0, pursuitType: "healthy" as const }
    : distinguishPursuitType(conversationText, subjectALabel, subjectATiming)

  const subjectB_pursuitType = hasMinimalData
    ? { healthyPursuit: 1, anxiousProtest: 0, pursuitType: "healthy" as const }
    : distinguishPursuitType(conversationText, subjectBLabel, subjectBTiming)

  const subjectA_withdrawalType = hasMinimalData
    ? { stonewalling: 0, healthySpace: 0, withdrawalType: "mixed" as const }
    : distinguishWithdrawalType(conversationText, subjectALabel)

  const subjectB_withdrawalType = hasMinimalData
    ? { stonewalling: 0, healthySpace: 0, withdrawalType: "mixed" as const }
    : distinguishWithdrawalType(conversationText, subjectBLabel)

  const patternEvolution = hasMinimalData
    ? {
        early: { pursuit: 1, distance: 0, repair: 1 },
        middle: { pursuit: 1, distance: 0, repair: 1 },
        late: { pursuit: 1, distance: 0, repair: 1 },
        trend: "stable" as const,
        description: "Limited data for evolution tracking",
      }
    : trackPatternEvolution(conversationText)

  const pdrScores = calculatePDRScores(
    bidirectionalPDR,
    subjectA_pursuitType,
    subjectB_pursuitType,
    subjectA_withdrawalType,
    subjectB_withdrawalType,
    repairQuality,
    repairTiming,
  )

  logDiagnostic("info", "PDR Scores", {
    subjectA: `Pursue=${pdrScores.subjectA_pursueScore}, Distance=${pdrScores.subjectA_distanceScore}, Repair=${pdrScores.subjectA_repairScore}`,
    subjectB: `Pursue=${pdrScores.subjectB_pursueScore}, Distance=${pdrScores.subjectB_distanceScore}, Repair=${pdrScores.subjectB_repairScore}`,
  })
  logDiagnostic("info", "Pursue-Withdraw Loop Analysis", { description: pursueWithdrawLoop.description })
  logDiagnostic("info", "Repair Analysis", {
    quality: repairQuality.overallQuality,
    timing: repairTiming.timingQuality,
  })
  logDiagnostic("info", "Pattern Evolution", {
    trend: patternEvolution.trend,
    description: patternEvolution.description,
  })

  const punctuationPatterns = hasMinimalData
    ? { periods: 2, exclamations: 3, ellipses: 1, multipleQuestions: 0, noPunctuation: 2, emotionalIntensity: 1.5 }
    : analyzePunctuationPatterns(conversationText)

  const subjectAStyle = hasMinimalData
    ? { avgLength: 50, shortMessages: 1, longMessages: 1, oneWordReplies: 0, expressiveStyle: "balanced" as const }
    : analyzeMessageStyle(conversationText, subjectALabel)

  const subjectBStyle = hasMinimalData
    ? { avgLength: 45, shortMessages: 1, longMessages: 1, oneWordReplies: 0, expressiveStyle: "balanced" as const }
    : analyzeMessageStyle(conversationText, subjectBLabel)

  const emotionalTone = hasMinimalData
    ? { warmth: 6, tension: 3, fatigue: 2, enthusiasm: 5, distance: 2 }
    : detectEmotionalTone(conversationText, punctuationPatterns)

  const emotionalPatterns = hasMinimalData
    ? {
        vulnerabilityBids: 2,
        defensiveResponses: 1,
        emotionalWithdrawal: 1,
        repairAttempts: 2,
        validationOffers: 2,
        dismissiveLanguage: 0,
        emotionalFlooding: 0,
        bidForConnection: 2,
      }
    : detectEmotionalPatterns(conversationText)

  const emotionalDynamics = analyzeEmotionalDynamics(emotionalPatterns, subjectALabel, subjectBLabel)

  const styleMismatchDescription = (() => {
    if (subjectAStyle.expressiveStyle === "brief" && subjectBStyle.expressiveStyle === "expressive")
      return "There's a mismatch in communication styles, with one partner preferring brevity and the other more elaborate expression. This difference, while natural, may require conscious bridging to prevent misunderstandings."
    if (subjectAStyle.expressiveStyle === "expressive" && subjectBStyle.expressiveStyle === "brief")
      return "Communication styles differ: one partner tends toward more detailed expression, while the other prefers conciseness. Both styles are valid—the key is honoring each other's preferences while finding middle ground."
    return ""
  })()

  const contextForWeighting = {
    emotionalFlow,
    subjectAMotivation,
    subjectBMotivation,
    hasFlooding: profanityAnalysis.emotionalEscalation || emotionalPatterns.emotionalFlooding > 1,
    hasHumor: conversationText.toLowerCase().includes("haha") || conversationText.toLowerCase().includes("lol"),
    hasSilence: subjectATiming.averageGapIndicator === "delayed" || subjectBTiming.averageGapIndicator === "delayed",
    hasAccountability: subjectAAccountability.takesResponsibility > 0 || subjectBAccountability.takesResponsibility > 0,
  }

  const calculateHarmonyScore = () => {
    if (hasMinimalData) return 70
    const balanceRatio = Math.min(subjectAMessages, subjectBMessages) / Math.max(subjectAMessages, subjectBMessages)
    const bidResponseRatio = emotionalPatterns.validationOffers / Math.max(1, emotionalPatterns.vulnerabilityBids)
    const toneBalance = (emotionalTone.warmth - emotionalTone.distance) / 10
    const contemptPenalty = contemptMarkers.contemptScore * 3
    const profanityPenalty = profanityAnalysis.profanityCount * 2
    const baseScore = Math.max(
      20,
      Math.min(
        100,
        40 +
          balanceRatio * 25 +
          Math.min(25, bidResponseRatio * 25) +
          toneBalance * 10 -
          contemptPenalty -
          profanityPenalty,
      ),
    )
    return applyContextualWeighting(baseScore, contextForWeighting)
  }

  const calculateEmotionalSafetyScore = () => {
    if (hasMinimalData) return 70
    const safetyIndicators =
      emotionalPatterns.validationOffers + emotionalPatterns.repairAttempts + emotionalTone.warmth
    const unsafetyIndicators =
      emotionalPatterns.dismissiveLanguage +
      emotionalPatterns.emotionalWithdrawal +
      emotionalTone.distance +
      contemptMarkers.contemptScore * 2 +
      profanityAnalysis.profanityCount
    const netSafety = safetyIndicators - unsafetyIndicators * 2
    const baseScore = Math.max(20, Math.min(100, 50 + netSafety * 5))
    return applyContextualWeighting(baseScore, contextForWeighting)
  }

  const calculateRepairScore = () => {
    if (hasMinimalData) return 60
    const repairCapacity = emotionalPatterns.repairAttempts * 15
    const defensiveBarrier = emotionalPatterns.defensiveResponses * 5
    const enthusiasmBoost = emotionalTone.enthusiasm * 2
    const repairRejectionPenalty = repairDynamics.repairRejections * 10
    const repairAcceptanceBonus = repairDynamics.repairAcceptance * 5
    const baseScore = Math.max(
      20,
      Math.min(
        100,
        repairCapacity - defensiveBarrier + enthusiasmBoost + repairAcceptanceBonus - repairRejectionPenalty + 30,
      ),
    )
    return applyContextualWeighting(baseScore, contextForWeighting)
  }

  const harmonyScore = calculateHarmonyScore()
  const emotionalSafetyScore = calculateEmotionalSafetyScore()
  const repairEffortScore = calculateRepairScore()
  const overallHealthScore = Math.round((harmonyScore + emotionalSafetyScore + repairEffortScore) / 30)

  logDiagnostic("info", "Scores calculated", {
    harmony: harmonyScore,
    safety: emotionalSafetyScore,
    repair: repairEffortScore,
    overall: overallHealthScore,
  })

  const dataQuality = Math.min(100, (conversationText.length / 500) * 100)
  const messageBalance =
    (Math.min(subjectAMessages, subjectBMessages) / Math.max(subjectAMessages, subjectBMessages)) * 100
  const extractionConfidence = Math.min(100, Math.round((dataQuality + messageBalance) / 2))
  const emotionalInferenceConfidence = Math.round((subjectAMotivation.confidence + subjectBMotivation.confidence) / 2)

  logDiagnostic("info", "Confidence levels", {
    extraction: extractionConfidence,
    emotionalInference: emotionalInferenceConfidence,
    dataCompleteness: dataQuality > 70 ? "high" : dataQuality > 40 ? "medium" : "low",
  })

  const punctuationInsights: string[] = []
  if (profanityAnalysis.profanityCount > 0) {
    punctuationInsights.push(
      `Profanity appears ${profanityAnalysis.profanityCount} time(s), which may reflect emotional intensity, frustration, or loss of emotional regulation. This isn't about being "bad"—it could suggest that feelings are running high and need attention.`,
    )
  }

  if (profanityAnalysis.intensityLevel === "high") {
    punctuationInsights.push(
      "High emotional intensity detected through caps, multiple punctuation, and strong language. This might indicate emotional flooding—when feelings become so overwhelming that thoughtful communication becomes difficult.",
    )
  }

  const timingInsights: string[] = []
  if (subjectATiming.anxiousPursuit) {
    timingInsights.push(
      `${subjectALabel} sends multiple messages in quick succession, which may indicate anxious pursuit—a possible need for reassurance or fear of disconnection. This isn't clinginess; it could be an attachment response.`,
    )
  }
  if (subjectBTiming.anxiousPursuit) {
    timingInsights.push(
      `${subjectBLabel} sends rapid-fire messages, possibly reflecting anxiety about the relationship or urgency to be heard and understood.`,
    )
  }
  if (subjectATiming.averageGapIndicator === "delayed" || subjectBTiming.averageGapIndicator === "delayed") {
    timingInsights.push(
      "Long pauses between messages may indicate emotional withdrawal, need for processing time, or stonewalling. Context matters—sometimes space is healthy, sometimes it might be avoidance.",
    )
  }

  const contemptInsights: string[] = []
  if (contemptMarkers.sarcasmDetected) {
    contemptInsights.push(
      "Sarcasm detected—a form of contempt that may communicate superiority or disgust. This is one of Gottman's 'Four Horsemen' and could be a strong predictor of relationship distress.",
    )
  }
  if (contemptMarkers.mockeryDetected) {
    contemptInsights.push(
      "Mockery or ridicule present in the conversation. This may create emotional unsafety and could signal contempt—one of the most toxic conflict patterns.",
    )
  }
  if (contemptMarkers.nameCallingDetected) {
    contemptInsights.push(
      "Name-calling or character attacks detected. This crosses from complaint (about behavior) to criticism (about character) and may damage trust and safety.",
    )
  }

  const oneWordReplyInsight =
    subjectAStyle.oneWordReplies > subjectAMessages * 0.3 || subjectBStyle.oneWordReplies > subjectBMessages * 0.3
      ? `One-word or very brief replies appear in the conversation. These might represent emotional shutdown, anxiety, or overwhelm rather than disinterest. When someone responds with "ok" or "fine," they may be protecting themselves from emotional flooding, not rejecting connection.`
      : null

  const gottmanFlags = {
    criticism:
      conversationText.toLowerCase().includes("always") ||
      conversationText.toLowerCase().includes("never") ||
      subjectAAccountability.blamesOther > 1 ||
      subjectBAccountability.blamesOther > 1,
    contempt: contemptMarkers.contemptScore > 0,
    defensiveness: emotionalPatterns.defensiveResponses > 2,
    stonewalling:
      emotionalPatterns.emotionalWithdrawal > 2 ||
      subjectATiming.averageGapIndicator === "delayed" ||
      subjectBTiming.averageGapIndicator === "delayed",
  }

  // Generate distinct validation patterns for each subject
  const subjectAIsMoreActive = subjectAMessages > subjectBMessages
  const subjectBIsMoreActive = subjectBMessages > subjectAMessages
  const highRepair = repairEffortScore > 60

  // Subject A validation pattern (first person gets higher acknowledgment)
  const subjectA_acknowledges =
    30 + (subjectAIsMoreActive ? 5 : 0) + (emotionalLabor.subjectALabor > emotionalLabor.subjectBLabor ? 5 : 0)
  const subjectA_reassures = highRepair ? 30 : 25
  const subjectA_validates = emotionalSafetyScore > 70 ? 25 : 20
  const subjectA_dismisses = gottmanFlags.criticism || gottmanFlags.contempt ? 10 : 5
  const subjectA_neutral = 100 - (subjectA_acknowledges + subjectA_reassures + subjectA_validates + subjectA_dismisses)

  // Subject B validation pattern (second person gets higher validation)
  const subjectB_acknowledges =
    25 + (subjectBIsMoreActive ? 5 : 0) + (emotionalLabor.subjectBLabor > emotionalLabor.subjectALabor ? 5 : 0)
  const subjectB_reassures = highRepair ? 25 : 20
  const subjectB_validates = emotionalSafetyScore > 70 ? 30 : 25
  const subjectB_dismisses = gottmanFlags.stonewalling ? 12 : gottmanFlags.defensiveness ? 8 : 5
  const subjectB_neutral = 100 - (subjectB_acknowledges + subjectB_reassures + subjectB_validates + subjectB_dismisses)

  const reflectiveSummary = hasMinimalData
    ? `This analysis is based on limited conversation data. The insights below are preliminary observations that may deepen with more conversation context. What matters most is how these patterns feel to you—your lived experience is the ultimate guide.`
    : `Observing ${totalMessages} messages between ${subjectALabel} and ${subjectBLabel}, a picture emerges: ${emotionalThemes[0]} The conversation moves through phases of ${emotionalFlow.dominantPhase}, with ${emotionalFlow.transitionCount} emotional transitions. ${subjectALabel} appears primarily ${subjectAMotivation.primaryMotive.replace("-driven", "")}, while ${subjectBLabel} seems ${subjectBMotivation.primaryMotive.replace("-driven", "")}. Beneath the surface of words lies a deeper story—both partners navigating the inherent vulnerability of intimacy, each seeking safety in their own way. ${emotionalFlow.nervousSystemSummary}`

  const subjectAValidationPatterns = [
    {
      pattern: subjectA_pursuitType.pursuitType === "healthy" ? "Healthy Connection-Seeking" : "Anxious Pursuit",
      frequency: bidirectionalPDR.subjectA_pursues_B,
      context:
        subjectA_pursuitType.pursuitType === "healthy"
          ? `${subjectALabel} reaches out for connection in balanced ways (${subjectA_pursuitType.healthyPursuit} healthy bids)`
          : `${subjectALabel} seeks reassurance through frequent contact (${subjectA_pursuitType.anxiousProtest} anxious bids)`,
      nervousSystemState:
        subjectA_pursuitType.pursuitType === "healthy" ? "🟢 ventral (safe connection)" : "🟡 sympathetic (anxious)",
    },
    {
      pattern: subjectA_withdrawalType.withdrawalType === "healthy" ? "Healthy Space-Taking" : "Stonewalling",
      frequency: bidirectionalPDR.subjectA_distances_from_B,
      context:
        subjectA_withdrawalType.withdrawalType === "healthy"
          ? `${subjectALabel} takes space to process (${subjectA_withdrawalType.healthySpace} healthy requests)`
          : `${subjectALabel} withdraws defensively (${subjectA_withdrawalType.stonewalling} stonewalling instances)`,
      nervousSystemState:
        subjectA_withdrawalType.withdrawalType === "healthy" ? "🟢 ventral (self-regulation)" : "🔵 dorsal (shutdown)",
    },
    {
      pattern: repairQuality.overallQuality === "high" ? "Genuine Repair" : "Emerging Repair",
      frequency: bidirectionalPDR.subjectA_repairs_toward_B,
      context:
        repairQuality.overallQuality === "high"
          ? `${subjectALabel} offers accountable, empathic repairs (${repairQuality.accountable + repairQuality.empathic} high-quality)`
          : `${subjectALabel} attempts repair with room to deepen (${repairQuality.superficial + repairQuality.genuine} attempts)`,
      nervousSystemState: "🟢 ventral (connection-oriented)",
    },
  ]

  const subjectBValidationPatterns = [
    {
      pattern: subjectB_pursuitType.pursuitType === "healthy" ? "Healthy Connection-Seeking" : "Anxious Pursuit",
      frequency: bidirectionalPDR.subjectB_pursues_A,
      context:
        subjectB_pursuitType.pursuitType === "healthy"
          ? `${subjectBLabel} reaches out for connection in balanced ways (${subjectB_pursuitType.healthyPursuit} healthy bids)`
          : `${subjectBLabel} seeks reassurance through frequent contact (${subjectB_pursuitType.anxiousProtest} anxious bids)`,
      nervousSystemState:
        subjectB_pursuitType.pursuitType === "healthy" ? "🟢 ventral (safe connection)" : "🟡 sympathetic (anxious)",
    },
    {
      pattern: subjectB_withdrawalType.withdrawalType === "healthy" ? "Healthy Space-Taking" : "Stonewalling",
      frequency: bidirectionalPDR.subjectB_distances_from_A,
      context:
        subjectB_withdrawalType.withdrawalType === "healthy"
          ? `${subjectBLabel} takes space to process (${subjectB_withdrawalType.healthySpace} healthy requests)`
          : `${subjectBLabel} withdraws defensively (${subjectB_withdrawalType.stonewalling} stonewalling instances)`,
      nervousSystemState:
        subjectB_withdrawalType.withdrawalType === "healthy" ? "🟢 ventral (self-regulation)" : "🔵 dorsal (shutdown)",
    },
    {
      pattern: repairQuality.overallQuality === "high" ? "Genuine Repair" : "Emerging Repair",
      frequency: bidirectionalPDR.subjectB_repairs_toward_A,
      context:
        repairQuality.overallQuality === "high"
          ? `${subjectBLabel} offers accountable, empathic repairs (${repairQuality.accountable + repairQuality.empathic} high-quality)`
          : `${subjectBLabel} attempts repair with room to deepen (${repairQuality.superficial + repairQuality.genuine} attempts)`,
      nervousSystemState: "🟢 ventral (connection-oriented)",
    },
  ]

  const processingTime = Date.now() - analysisStartTime

  return {
    reflectiveSummary,

    underlyingEmotionalThemes: emotionalThemes,

    analysisConfidence: {
      extractionConfidence,
      emotionalInferenceConfidence,
      dataCompleteness: dataQuality > 70 ? "high" : dataQuality > 40 ? "medium" : "low",
      explanation:
        dataQuality > 70
          ? "High-quality data with sufficient message volume for reliable emotional pattern analysis."
          : dataQuality > 40
            ? "Moderate data quality—insights are directionally accurate but may deepen with more conversation context."
            : "Limited data available—insights are preliminary and should be considered alongside your personal knowledge of the relationship.",
    },

    emotionalFlowMapping: {
      dominantPhase: emotionalFlow.dominantPhase,
      transitionCount: emotionalFlow.transitionCount,
      nervousSystemSummary: emotionalFlow.nervousSystemSummary,
      interpretation:
        emotionalFlow.dominantPhase === "connection"
          ? "The conversation primarily exists in a space of connection and safety, with both partners reaching toward each other."
          : emotionalFlow.dominantPhase === "tension"
            ? "Tension characterizes much of the exchange, suggesting underlying needs or fears that haven't been fully addressed."
            : emotionalFlow.dominantPhase === "repair"
              ? "The conversation shows active repair efforts—both partners are working to bridge disconnection and restore safety."
              : emotionalFlow.dominantPhase === "escalation"
                ? "Emotional escalation dominates, indicating that protective responses are overwhelming connection attempts."
                : emotionalFlow.dominantPhase === "shutdown"
                  ? "Withdrawal and shutdown patterns suggest emotional overwhelm or avoidance."
                  : "The conversation maintains a relatively calm, neutral tone with balanced emotional engagement.",
    },

    emotionalMotivations: {
      [subjectALabel]: {
        primaryMotive: subjectAMotivation.primaryMotive,
        secondaryMotive: subjectAMotivation.secondaryMotive,
        confidence: subjectAMotivation.confidence,
        explanation: subjectAMotivation.explanation,
      },
      [subjectBLabel]: {
        primaryMotive: subjectBMotivation.primaryMotive,
        secondaryMotive: subjectBMotivation.secondaryMotive,
        confidence: subjectBMotivation.confidence,
        explanation: subjectBMotivation.explanation,
      },
      dynamicInterplay:
        subjectAMotivation.primaryMotive === subjectBMotivation.primaryMotive
          ? `Both partners share a ${subjectAMotivation.primaryMotive.replace("-driven", "")} orientation, which could create alignment or amplify the same pattern.`
          : `${subjectALabel}'s ${subjectAMotivation.primaryMotive.replace("-driven", "")} approach meets ${subjectBLabel}'s ${subjectBMotivation.primaryMotive.replace("-driven", "")} response, creating a complementary dynamic that shapes the relationship's emotional rhythm.`,
    },

    introductionNote: hasMinimalData
      ? `This analysis is based on limited conversation data (${conversationText.length} characters from ${totalMessages} messages). The insights below are preliminary observations that may deepen with more conversation context. What matters most is how these patterns feel to you—your lived experience is the ultimate guide.`
      : `Based on ${totalMessages} messages between ${subjectALabel} and ${subjectBLabel}, this analysis explores the emotional patterns, communication dynamics, and relational needs that shape your connection. These insights are offered with compassion, recognizing that all relationships involve two people doing their best to love and be loved.`,

    overallRelationshipHealth: {
      score: overallHealthScore,
      description:
        overallHealthScore >= 8
          ? `Your relationship shows strong emotional attunement and healthy repair capacity. You're building something meaningful together.`
          : overallHealthScore >= 6
            ? `Your relationship has a solid foundation with room to deepen emotional connection and understanding.`
            : overallHealthScore >= 4
              ? `Your relationship is navigating some challenges. With awareness and effort, these patterns can shift toward greater connection.`
              : `Your relationship is experiencing significant strain. Professional support could help you both feel heard and find your way back to each other.`,
    },

    communicationStylesAndEmotionalTone: {
      description: `${emotionalDynamics.primaryDynamic} ${styleMismatchDescription} ${timingInsights.length > 0 ? timingInsights[0] : ""}} ${contemptInsights.length > 0 ? contemptInsights[0] : ""}`,
      emotionalVibeTags: [
        emotionalTone.warmth > 5 ? "Warm" : "Building Warmth",
        emotionalTone.tension > 5 || profanityAnalysis.intensityLevel === "high" ? "High Tension" : "Generally Relaxed",
        emotionalPatterns.repairAttempts > 2 && repairDynamics.repairEffectiveness === "high"
          ? "Effective Repair"
          : "Learning to Repair",
        emotionalTone.enthusiasm > 5 ? "Enthusiastic" : "Measured",
        contemptMarkers.contemptScore > 0 ? "Contempt Present" : "Respectful",
      ],
      regulationPatternsObserved:
        emotionalPatterns.emotionalFlooding > 1 || profanityAnalysis.emotionalEscalation
          ? `There are moments when emotions feel overwhelming, leading to shutdown, escalation, or loss of emotional regulation (${profanityAnalysis.intensityLevel} intensity detected). This may be a sign that nervous systems need support, not a character flaw in either person. ${punctuationInsights.length > 0 ? "Punctuation patterns suggest: " + punctuationInsights[0] : ""}`
          : `Both partners appear to be managing their emotional responses with varying degrees of success. The capacity for self-regulation is developing. ${punctuationInsights.length > 0 ? punctuationInsights[0] : ""}`,
      messageRhythmAndPacing:
        Math.abs(subjectAMessages - subjectBMessages) < 2
          ? `Both partners contribute fairly equally to the conversation, which might suggest mutual investment in the relationship. ${timingInsights.length > 0 ? timingInsights[0] : ""} ${oneWordReplyInsight || ""}`
          : `${subjectALabel} tends to initiate or sustain conversation more often (${subjectALabel} ${subjectAMessages} vs ${subjectBLabel} ${subjectBMessages} messages). This might reflect different communication styles, energy levels, or comfort with verbal expression—not necessarily different levels of care. ${timingInsights.length > 0 ? timingInsights[0] : ""} ${oneWordReplyInsight || ""}`,
      subjectAStyle: `${subjectALabel} ${subjectAIsMoreActive ? "actively engages in dialogue" : "contributes steadily"} with ${subjectAStyle.expressiveStyle} messages (average ${Math.round(subjectAStyle.avgLength)} characters). ${subjectATiming.anxiousPursuit ? "Sends rapid-fire messages when anxious or seeking connection." : ""} ${subjectAStyle.oneWordReplies > 1 ? "Brief replies may indicate emotional fatigue or overwhelm rather than disengagement." : ""} ${emotionalPatterns.vulnerabilityBids > 1 ? "Sometimes shares vulnerable feelings" : "Navigating when and how to share feelings"}. ${subjectAAccountability.takesResponsibility > 0 ? "Takes responsibility when appropriate" : subjectAAccountability.blamesOther > 1 ? "Tends to blame rather than own their part" : "Learning accountability"}. ${emotionalPatterns.defensiveResponses > 1 ? "When feeling criticized, there's a tendency to defend or explain, which could be a natural protective response." : "There's an openness to hearing feedback, even when it's difficult."}`,
      subjectBStyle: `${subjectBLabel} ${subjectBIsMoreActive ? "brings energy to conversations" : "offers consistent presence"} with ${subjectBStyle.expressiveStyle} messages (average ${Math.round(subjectBStyle.avgLength)} characters). ${subjectBTiming.anxiousPursuit ? "Sends multiple messages in quick succession when seeking reassurance." : ""} ${subjectBStyle.oneWordReplies > 1 ? "Short responses may reflect emotional shutdown or anxiety, not lack of interest." : ""} ${emotionalPatterns.validationOffers > 1 ? "Often acknowledges the other's perspective" : "Learning to validate the other's experience"}. ${subjectBAccountability.takesResponsibility > 0 ? "Owns their part in conflicts" : subjectBAccountability.blamesOther > 1 ? "Struggles with taking responsibility" : "Developing accountability"}. ${emotionalPatterns.emotionalWithdrawal > 1 ? "During intense moments, there may be a pull to step back or shut down—a possible way of managing overwhelm." : "There's a capacity to stay present during difficult conversations."}`,
      punctuationInsights:
        punctuationInsights.length > 0
          ? punctuationInsights
          : ["Punctuation patterns suggest balanced emotional expression"],
      timingInsights: timingInsights.length > 0 ? timingInsights : ["Message timing appears balanced and healthy"],
      contemptInsights: contemptInsights.length > 0 ? contemptInsights : ["No contempt markers detected"],
    },

    recurringPatternsIdentified: {
      description: `${emotionalDynamics.emotionalCycle} ${emotionalLabor.laborImbalance !== "balanced" ? `There's a ${emotionalLabor.laborImbalance} imbalance in emotional labor, with ${emotionalLabor.whoDoesMore} doing more of the work to maintain emotional connection and process feelings.` : ""}`,
      positivePatterns: [
        emotionalPatterns.repairAttempts > 0 && repairDynamics.repairEffectiveness !== "low"
          ? `Efforts to reconnect after disconnection (${emotionalPatterns.repairAttempts} repair attempts, ${repairDynamics.repairEffectiveness} effectiveness)`
          : "Developing repair skills",
        emotionalPatterns.validationOffers > 0
          ? `Moments of genuine acknowledgment and validation`
          : "Learning to validate each other",
        emotionalPatterns.bidForConnection > 0
          ? `Reaching out for connection and closeness`
          : "Building connection rituals",
        !gottmanFlags.contempt || contemptMarkers.contemptScore < 3
          ? "Respect remains mostly intact"
          : "Working to restore mutual respect",
        subjectAAccountability.takesResponsibility > 0 || subjectBAccountability.takesResponsibility > 0
          ? "At least one partner takes responsibility for their actions"
          : "Learning accountability",
      ],
      loopingMiscommunicationsExamples:
        emotionalPatterns.defensiveResponses > 2 || contemptMarkers.contemptScore > 0
          ? [
              "One person shares a concern → the other hears criticism → defensiveness or contempt arises → the first person feels unheard or attacked → the cycle continues",
              "Both partners want to be understood, but the protective moves (defense, withdrawal, contempt) may prevent the very connection they're seeking",
              repairDynamics.repairRejections > 0
                ? "Repair attempts are made but rejected, leaving both partners feeling hopeless about change"
                : "Repair attempts are inconsistent or ineffective",
            ]
          : ["Minor misunderstandings that get clarified through continued dialogue"],
      commonTriggersAndResponsesExamples: [
        emotionalPatterns.vulnerabilityBids > 0
          ? "Vulnerability might trigger fear of judgment or rejection in the listener"
          : "Building safety for emotional sharing",
        emotionalPatterns.defensiveResponses > 0 ||
        subjectAAccountability.blamesOther > 0 ||
        subjectBAccountability.blamesOther > 0
          ? "Perceived criticism may activate self-protection, blame, or counter-attack rather than curiosity"
          : "Staying open during feedback",
        emotionalPatterns.emotionalWithdrawal > 0 || gottmanFlags.stonewalling
          ? "Overwhelm could lead to shutdown, withdrawal, or stonewalling as a way to regulate"
          : "Staying engaged during intensity",
        profanityAnalysis.emotionalEscalation
          ? "High emotional intensity may lead to loss of regulation, profanity, or escalation"
          : "Emotions are generally well-regulated",
      ],
      repairAttemptsOrEmotionalAvoidancesExamples:
        emotionalPatterns.repairAttempts > 2 && repairDynamics.repairEffectiveness !== "low"
          ? [
              "Apologies and acknowledgment of impact",
              "Reaching out after conflict to reconnect",
              "Expressing care even in the midst of disagreement",
              repairDynamics.repairAcceptance > 0 ? "Repair attempts are received and acknowledged" : "",
            ].filter(Boolean)
          : repairDynamics.repairRejections > 0
            ? [
                "Repair attempts are made but rejected or dismissed",
                "One partner tries to reconnect but the other isn't ready",
                "The window for repair closes before connection is restored",
              ]
            : [
                "Repair attempts are emerging but not yet consistent",
                "Learning to bridge disconnection takes practice",
              ],
    },

    reflectiveFrameworks: {
      description:
        "These frameworks help us understand the deeper emotional patterns at play, recognizing that behavior is always an attempt to meet a need.",
      attachmentTheoryAnalysis:
        emotionalSafetyScore > 75
          ? `The relationship shows secure attachment patterns—both partners can be vulnerable and responsive. This is the foundation for lasting intimacy.`
          : subjectATiming.anxiousPursuit || subjectBTiming.anxiousPursuit
            ? `There's an anxious-avoidant dynamic emerging: one partner seeks reassurance through frequent contact while the other needs space. Both responses make sense—they're just different strategies for managing relationship anxiety.`
            : emotionalPatterns.emotionalWithdrawal > 2
              ? `Avoidant attachment patterns appear when emotions intensify—withdrawal as a way to manage overwhelm. This isn't rejection; it could be self-protection.`
              : `Attachment patterns are developing. Both partners are learning to balance their need for closeness with their need for autonomy.`,
      loveLanguageFriction:
        Math.abs(subjectAMessages - subjectBMessages) > 3 || emotionalLabor.laborImbalance !== "balanced"
          ? `You may express and receive love differently. ${subjectALabel} might value verbal connection and emotional processing more, while the other might show love through actions, presence, or practical support. Neither is wrong—they're just different.`
          : `Your ways of expressing care seem fairly aligned, though there's always room to learn each other's unique love language.`,
      gottmanConflictMarkers:
        gottmanFlags.criticism || gottmanFlags.contempt || gottmanFlags.defensiveness || gottmanFlags.stonewalling
          ? `Present: ${[
              gottmanFlags.criticism && "Criticism (expressing complaints as character flaws or blame)",
              gottmanFlags.contempt &&
                `Contempt (${[contemptMarkers.sarcasmDetected && "sarcasm", contemptMarkers.mockeryDetected && "mockery", contemptMarkers.nameCallingDetected && "name-calling", contemptMarkers.eyeRollLanguage && "eye-roll language"].filter(Boolean).join(", ")})`,
              gottmanFlags.defensiveness && "Defensiveness (protecting self rather than hearing partner)",
              gottmanFlags.stonewalling && "Stonewalling (withdrawing to avoid overwhelm)",
            ]
              .filter(Boolean)
              .join(
                "; ",
              )}. These patterns are common and changeable—they're learned responses, not fixed traits. ${contemptMarkers.contemptScore > 5 ? "Contempt is particularly concerning and may require immediate attention." : ""}`
          : "No major destructive conflict patterns detected. You're managing disagreements with relative respect and openness.",
      emotionalIntelligenceIndicators:
        emotionalPatterns.validationOffers > 2 &&
        (subjectAAccountability.takesResponsibility > 0 || subjectBAccountability.takesResponsibility > 0)
          ? `Both partners show capacity for emotional awareness, empathy, and accountability. You're able to recognize and respond to each other's feelings, at least some of the time.`
          : `Emotional intelligence is developing. Learning to name feelings, understand their origins, take responsibility, and respond with compassion takes practice.`,
    },

    whatsGettingInTheWay: {
      description: `${emotionalDynamics.balancedInsight} ${contemptMarkers.contemptScore > 0 ? "Contempt patterns may create emotional unsafety and damage the foundation of respect." : ""} ${emotionalLabor.laborImbalance === "significant" ? `The significant imbalance in emotional labor (${emotionalLabor.whoDoesMore} does most of the emotional work) could create resentment and exhaustion.` : ""}`,
      emotionalMismatches:
        emotionalPatterns.vulnerabilityBids > emotionalPatterns.validationOffers
          ? "One person's emotional bids aren't always met with the response they're hoping for. This isn't about one person being wrong—it's about learning each other's emotional language."
          : "Emotional attunement is generally strong, with room to deepen understanding of each other's inner world.",
      communicationGaps:
        Math.abs(subjectAMessages - subjectBMessages) > 3
          ? `Different levels of verbal engagement (${subjectALabel}: ${subjectAMessages}, ${subjectBLabel}: ${subjectBMessages}). This might reflect personality differences, communication preferences, or varying comfort with conflict—not different levels of investment. ${subjectATiming.anxiousPursuit || subjectBTiming.anxiousPursuit ? "Rapid-fire messaging may indicate anxious pursuit." : ""}`
          : "Communication participation feels balanced and mutual.",
      subtlePowerStrugglesOrMisfires:
        gottmanFlags.criticism ||
        gottmanFlags.defensiveness ||
        subjectAAccountability.blamesOther > 1 ||
        subjectBAccountability.blamesOther > 1
          ? "There's a pursue-withdraw or blame-defend pattern emerging: one person pushes for connection or change, the other pulls back or counter-attacks to protect themselves. Both moves make sense from each person's perspective."
          : "Power dynamics appear relatively balanced, with both partners having voice and influence.",
      externalStressors: hasMinimalData
        ? "Limited data prevents assessment of external pressures, but all relationships exist within broader life contexts that shape communication."
        : "External stressors (work, family, health, finances) inevitably impact how partners show up for each other. Recognizing this can foster compassion.",
    },

    constructiveFeedback: {
      subjectA: {
        strengths: [
          subjectA_acknowledges > 30
            ? "You notice and acknowledge your partner's feelings"
            : "You're learning to attune to your partner's emotions",
          subjectA_reassures > 25 ? "You offer reassurance and comfort" : "You're developing your capacity to soothe",
          subjectAIsMoreActive || emotionalLabor.subjectALabor > emotionalLabor.subjectBLabor
            ? "You invest energy in maintaining connection and doing emotional labor"
            : "You show up consistently",
          subjectAAccountability.takesResponsibility > 0
            ? "You take responsibility for your actions"
            : "You're learning accountability",
        ],
        gentleGrowthNudges: [
          emotionalPatterns.defensiveResponses > 1 || subjectAAccountability.blamesOther > 0
            ? "When you feel criticized, notice the urge to defend or blame. Can you get curious about your partner's experience instead? This doesn't mean they're right—it means you're strong enough to hear them."
            : "Continue staying open to feedback, even when it's uncomfortable",
          emotionalPatterns.vulnerabilityBids < 2
            ? "Consider sharing more of your inner world—your fears, needs, longings. Vulnerability may be the path to intimacy."
            : "Keep sharing your feelings; it creates opportunities for connection",
          subjectATiming.anxiousPursuit
            ? "Notice when you're sending multiple messages in quick succession. This might be anxious pursuit. Can you pause, breathe, and trust that your partner will respond?"
            : "Remember: your partner's feelings aren't an attack on you. They could be an invitation to understand them better.",
          contemptMarkers.sarcasmDetected || contemptMarkers.mockeryDetected || contemptMarkers.nameCallingDetected
            ? "Sarcasm, mockery, and name-calling may create emotional unsafety. Practice expressing frustration without contempt: 'I feel hurt when...' instead of 'You're ridiculous.'"
            : "",
        ].filter(Boolean),
        connectionBoosters: [
          "Ask: 'What do you need from me right now?' and truly listen to the answer",
          "Share one thing you appreciate about your partner daily—be specific",
          "When conflict arises, try: 'Help me understand' instead of 'But I...'",
          repairDynamics.repairRejections > 0
            ? "When your partner tries to repair, receive it with grace even if you're still hurt"
            : "",
        ].filter(Boolean),
      },
      subjectB: {
        strengths: [
          subjectB_validates > 25
            ? "You validate your partner's perspective"
            : "You're learning to honor your partner's reality",
          subjectB_reassures > 20 ? "You provide emotional reassurance" : "You're developing your comforting presence",
          subjectBIsMoreActive || emotionalLabor.subjectBLabor > emotionalLabor.subjectALabor
            ? "You actively engage in dialogue and emotional labor"
            : "You offer steady, reliable presence",
          subjectBAccountability.takesResponsibility > 0
            ? "You own your part in conflicts"
            : "You're developing accountability",
        ],
        gentleGrowthNudges: [
          emotionalPatterns.emotionalWithdrawal > 1 || gottmanFlags.stonewalling
            ? "When you feel overwhelmed, you might shut down or pull away. This could be a protective response, not a character flaw. Can you name the overwhelm before withdrawing? 'I need a break' is different from silence."
            : "Continue staying present during difficult moments",
          emotionalPatterns.validationOffers < 2
            ? "Practice reflecting back what you hear: 'It sounds like you're feeling...' This may help your partner feel seen."
            : "Keep validating your partner's experience",
          subjectBTiming.anxiousPursuit
            ? "When you send rapid-fire messages, pause and ask: 'Am I seeking connection or seeking reassurance that I'm okay?' Both are valid, but awareness helps."
            : "Your partner's emotions aren't something to fix or manage—they could be something to witness and honor.",
          contemptMarkers.sarcasmDetected || contemptMarkers.mockeryDetected || contemptMarkers.nameCallingDetected
            ? "Contempt (sarcasm, mockery, name-calling) may be one of the most toxic conflict patterns. Practice expressing frustration with respect."
            : "",
        ].filter(Boolean),
        connectionBoosters: [
          "Initiate conversations about feelings, not just logistics",
          "When your partner shares something vulnerable, move toward them (physically or emotionally)",
          "Create a weekly ritual for checking in: 'How are you feeling about us?'",
          repairDynamics.repairRejections > 0
            ? "When your partner tries to repair, let them in even if you're still processing"
            : "",
        ].filter(Boolean),
      },
      sharedStrengths: [
        emotionalPatterns.repairAttempts > 0 && repairDynamics.repairEffectiveness !== "low"
          ? "You both make efforts to reconnect after disconnection"
          : "You're both learning that repair is possible",
        !gottmanFlags.contempt || contemptMarkers.contemptScore < 3
          ? "You maintain respect for each other, even in conflict"
          : "You're working to restore mutual respect",
        "You're both here, seeking to understand. That matters.",
        subjectAAccountability.takesResponsibility > 0 && subjectBAccountability.takesResponsibility > 0
          ? "Both partners take responsibility for their actions"
          : "",
      ].filter(Boolean),
      sharedGrowthNudges: [
        "Practice the 5:1 ratio: five positive interactions for every negative one. Relationships may need more deposits than withdrawals.",
        "Develop a shared vocabulary for emotions. 'I'm feeling flooded' or 'I need reassurance' could prevent misunderstanding.",
        "Remember: you're on the same team. The problem might be the pattern, not your partner.",
        contemptMarkers.contemptScore > 0
          ? "Eliminate contempt from your relationship. It's the #1 predictor of divorce. Replace sarcasm with direct communication, mockery with curiosity, name-calling with 'I feel' statements."
          : "",
        emotionalLabor.laborImbalance !== "balanced"
          ? `Balance emotional labor. ${emotionalLabor.whoDoesMore} is doing more of the work. ${emotionalLabor.whoDoesMore === subjectALabel ? subjectBLabel : subjectALabel}, step up in initiating emotional conversations and processing feelings together.`
          : "",
        profanityAnalysis.emotionalEscalation
          ? "When emotions escalate to profanity or high intensity, take a 20-minute break to self-soothe before continuing the conversation."
          : "",
      ].filter(Boolean),
      sharedConnectionBoosters: [
        "Weekly relationship check-in: 'What's one thing I did that made you feel loved? What's one thing I could do differently?'",
        "Daily appreciation ritual: share three specific things you're grateful for about each other",
        "Monthly adventure: try something new together to build positive shared experiences",
        repairDynamics.repairEffectiveness === "low"
          ? "Learn and practice effective repair: acknowledge impact, take responsibility, express care, ask what they need"
          : "",
      ].filter(Boolean),
    },

    visualInsightsData: {
      descriptionForChartsIntro:
        "Visual representation of communication patterns, conflict styles, and validation behaviors for both partners.",
      emotionalCommunicationCharacteristics: [
        {
          category: "Warmth",
          [subjectALabel]: Math.min(
            10,
            5 + Math.round(emotionalTone.warmth / 2) - (profanityAnalysis.profanityCount > 0 ? 1 : 0),
          ),
          [subjectBLabel]: Math.min(
            10,
            5 + Math.round(emotionalTone.warmth / 2) - (profanityAnalysis.profanityCount > 0 ? 1 : 0),
          ),
        },
        {
          category: "Clarity",
          [subjectALabel]: Math.min(10, 5 + Math.round(harmonyScore / 15)),
          [subjectBLabel]: Math.min(10, 5 + Math.round(harmonyScore / 15)),
        },
        {
          category: "Responsiveness",
          [subjectALabel]: Math.min(10, 4 + Math.round(repairEffortScore / 15)),
          [subjectBLabel]: Math.min(10, 4 + Math.round(repairEffortScore / 15)),
        },
        {
          category: "Assertiveness",
          [subjectALabel]: subjectAIsMoreActive ? 8 : 6,
          [subjectBLabel]: subjectBIsMoreActive ? 8 : 6,
        },
        {
          category: "Empathy",
          [subjectALabel]: Math.min(
            10,
            5 + Math.round(emotionalSafetyScore / 20) - (subjectAAccountability.blamesOther > 1 ? 1 : 0),
          ),
          [subjectBLabel]: Math.min(
            10,
            5 + Math.round(emotionalSafetyScore / 20) - (subjectBAccountability.blamesOther > 1 ? 1 : 0),
          ),
        },
      ],
      conflictExpressionStyles: [
        {
          category: "Direct Address",
          [subjectALabel]: gottmanFlags.criticism ? 8 : 6,
          [subjectBLabel]: gottmanFlags.criticism ? 7 : 6,
        },
        {
          category: "Avoidance",
          [subjectALabel]: gottmanFlags.stonewalling || subjectATiming.averageGapIndicator === "delayed" ? 7 : 3,
          [subjectBLabel]: gottmanFlags.stonewalling || subjectBTiming.averageGapIndicator === "delayed" ? 8 : 3,
        },
        {
          category: "Compromise",
          [subjectALabel]: repairEffortScore > 60 && subjectAAccountability.takesResponsibility > 0 ? 8 : 5,
          [subjectBLabel]: repairEffortScore > 60 && subjectBAccountability.takesResponsibility > 0 ? 7 : 5,
        },
        {
          category: "Escalation",
          [subjectALabel]: gottmanFlags.defensiveness || profanityAnalysis.emotionalEscalation ? 6 : 2,
          [subjectBLabel]: gottmanFlags.defensiveness || profanityAnalysis.emotionalEscalation ? 7 : 2,
        },
        {
          category: "Repair Attempts",
          [subjectALabel]: Math.min(10, Math.round(repairEffortScore / 10)),
          [subjectBLabel]: Math.min(10, Math.round(repairEffortScore / 10)),
        },
      ],
      validationAndReassurancePatterns: [
        {
          category: "Acknowledges Feelings",
          [subjectALabel]: subjectA_acknowledges,
          [subjectBLabel]: subjectB_acknowledges,
        },
        { category: "Offers Reassurance", [subjectALabel]: subjectA_reassures, [subjectBLabel]: subjectB_reassures },
        { category: "Validates Perspective", [subjectALabel]: subjectA_validates, [subjectBLabel]: subjectB_validates },
        { category: "Dismisses Concerns", [subjectALabel]: subjectA_dismisses, [subjectBLabel]: subjectB_dismisses },
        { category: "Neutral/Unclear", [subjectALabel]: subjectA_neutral, [subjectBLabel]: subjectB_neutral },
      ],
      communicationMetrics: {
        responseTimeBalance: Math.round(50 + (harmonyScore - 70) / 2),
        messageLengthBalance: Math.round(50 + (harmonyScore - 70) / 2),
        emotionalDepth: Math.round(emotionalSafetyScore * 0.7),
        conflictResolution: Math.round(repairEffortScore * 0.8),
        affectionLevel: Math.round(emotionalTone.warmth * 7.5 - profanityAnalysis.profanityCount * 5),
      },
    },

    professionalInsights: {
      attachmentTheoryAnalysis: {
        subjectA: {
          primaryAttachmentStyle:
            emotionalSafetyScore > 75
              ? "Secure"
              : subjectATiming.anxiousPursuit
                ? "Anxious-Preoccupied"
                : emotionalSafetyScore > 60
                  ? "Anxious-Secure"
                  : "Anxious-Preoccupied",
          attachmentBehaviors: [
            subjectAIsMoreActive || subjectATiming.anxiousPursuit
              ? "Seeks connection through frequent communication"
              : "Maintains steady engagement",
            subjectA_acknowledges > 30 ? "Responsive to partner's emotional needs" : "Developing responsiveness",
            subjectATiming.anxiousPursuit ? "Shows anxious pursuit when feeling disconnected" : "",
          ].filter(Boolean),
          triggersAndDefenses:
            subjectA_dismisses > 8 || contemptMarkers.sarcasmDetected || contemptMarkers.mockeryDetected
              ? "May become dismissive, sarcastic, or contemptuous when feeling overwhelmed or criticized"
              : "Generally maintains emotional availability during stress",
        },
        subjectB: {
          primaryAttachmentStyle:
            emotionalSafetyScore > 75
              ? "Secure"
              : gottmanFlags.stonewalling || subjectBTiming.averageGapIndicator === "delayed"
                ? "Avoidant-Secure"
                : "Anxious-Secure",
          attachmentBehaviors: [
            subjectBIsMoreActive || subjectBTiming.anxiousPursuit
              ? "Actively engages in relationship dialogue"
              : "Provides consistent presence",
            subjectB_validates > 25 ? "Validates partner's experiences effectively" : "Learning validation skills",
            gottmanFlags.stonewalling ? "Withdraws when emotionally flooded" : "",
          ].filter(Boolean),
          triggersAndDefenses:
            gottmanFlags.stonewalling || subjectBTiming.averageGapIndicator === "delayed"
              ? "May withdraw or shut down during intense emotional moments"
              : "Generally stays engaged during difficult conversations",
        },
        dyad: `The relationship shows ${emotionalSafetyScore > 70 ? "secure" : "insecure"} attachment patterns with ${repairEffortScore > 60 ? "healthy" : "emerging"} repair capacity. ${subjectATiming.anxiousPursuit && (gottmanFlags.stonewalling || subjectBTiming.averageGapIndicator === "delayed") ? "Classic anxious-avoidant dynamic: one pursues, the other withdraws. Both may need to move toward secure attachment." : ""} ${emotionalSafetyScore < 60 || contemptMarkers.contemptScore > 3 ? "Individual or couples therapy could be strongly recommended." : "Continue building on secure foundation."}`,
      },
      traumaInformedObservations: {
        identifiedPatterns: [
          gottmanFlags.defensiveness || subjectAAccountability.blamesOther > 1 || subjectBAccountability.blamesOther > 1
            ? "Defensive responses and blame may indicate past relational wounds or shame"
            : "No significant trauma responses detected",
          gottmanFlags.stonewalling || profanityAnalysis.emotionalEscalation
            ? "Withdrawal or escalation patterns might suggest possible emotional overwhelm or flooding"
            : "Emotional engagement appears healthy",
          contemptMarkers.contemptScore > 0
            ? "Contempt patterns may reflect unhealed wounds or learned family-of-origin dynamics"
            : "",
        ].filter(Boolean),
        copingMechanisms:
          repairEffortScore > 60 && repairDynamics.repairEffectiveness !== "low"
            ? "Both partners demonstrate adaptive coping through repair and communication"
            : profanityAnalysis.emotionalEscalation || contemptMarkers.contemptScore > 3
              ? "Maladaptive coping (escalation, contempt, withdrawal) may indicate need for new emotional regulation skills"
              : "Developing healthier coping strategies could benefit the relationship",
        safetyAndTrust:
          emotionalSafetyScore > 70 && contemptMarkers.contemptScore === 0
            ? "Strong foundation of safety and trust supports vulnerability"
            : contemptMarkers.contemptScore > 3
              ? "Contempt may have severely damaged safety and trust—immediate intervention could be needed"
              : "Building safety and trust remains an important focus area",
      },
      therapeuticRecommendations: {
        immediateInterventions: [
          contemptMarkers.contemptScore > 0
            ? "Eliminate contempt immediately—it's the #1 predictor of relationship failure"
            : "Practice daily appreciation rituals (3 things each)",
          repairEffortScore < 60 || repairDynamics.repairEffectiveness === "low"
            ? "Learn and practice effective repair attempts after conflicts"
            : "Continue strong repair practices",
          profanityAnalysis.emotionalEscalation || emotionalPatterns.emotionalFlooding > 1
            ? "Establish 'pause button' protocol: take 20-minute breaks when flooded"
            : "Establish 'pause button' protocol for emotional regulation",
          emotionalLabor.laborImbalance === "significant"
            ? `${emotionalLabor.whoDoesMore === subjectALabel ? subjectBLabel : subjectALabel} may need to increase emotional labor and initiation`
            : "",
        ].filter(Boolean),
        longTermGoals: [
          "Develop secure attachment patterns through consistent responsiveness",
          "Build emotional intelligence and regulation skills",
          "Create shared meaning and rituals in the relationship",
          contemptMarkers.contemptScore > 0 ? "Eliminate all forms of contempt from communication" : "",
          emotionalLabor.laborImbalance !== "balanced" ? "Balance emotional labor between partners" : "",
        ].filter(Boolean),
        suggestedModalities: [
          contemptMarkers.contemptScore > 3 || emotionalSafetyScore < 50
            ? "Emotionally Focused Therapy (EFT) - urgent"
            : emotionalSafetyScore < 60
              ? "Emotionally Focused Therapy (EFT)"
              : "Gottman Method Couples Therapy",
          gottmanFlags.defensiveness ||
          gottmanFlags.stonewalling ||
          subjectAAccountability.blamesOther > 1 ||
          subjectBAccountability.blamesOther > 1
            ? "Individual therapy to address personal patterns"
            : "Individual therapy for personal growth",
          profanityAnalysis.emotionalEscalation || emotionalPatterns.emotionalFlooding > 1
            ? "Mindfulness-based stress reduction (MBSR) for emotional regulation"
            : "Mindfulness practices for emotional regulation",
        ],
        contraindications: [
          contemptMarkers.contemptScore > 5
            ? "Severe contempt may require individual therapy before couples work"
            : gottmanFlags.contempt
              ? "Address contempt patterns before other interventions"
              : "No major contraindications",
        ],
      },
      clinicalExercises: {
        communicationExercises: [
          {
            title: "Daily Check-Ins",
            description: "Share one feeling and one need each day (10 minutes)",
            frequency: "Daily",
          },
          {
            title: "State of Union",
            description: "Weekly relationship conversation using structured format",
            frequency: "Weekly",
          },
          {
            title: "Active Listening",
            description: "Practice reflecting back partner's words before responding",
            frequency: "During conflicts",
          },
          contemptMarkers.contemptScore > 0
            ? {
                title: "Contempt Antidote",
                description: "Replace sarcasm/mockery with 'I feel...' statements; build culture of appreciation",
                frequency: "Ongoing",
              }
            : null,
        ].filter(Boolean),
        emotionalRegulationPractices: [
          {
            title: "Pause Button",
            description: "Take 20-minute breaks during heated moments to self-soothe",
            frequency: "As needed",
          },
          {
            title: "Mindful Breathing",
            description: "3-minute breathing exercise before difficult conversations",
            frequency: "Before conflicts",
          },
          {
            title: "Emotion Naming",
            description: "Practice identifying and naming emotions throughout the day",
            frequency: "Daily",
          },
          profanityAnalysis.emotionalEscalation
            ? {
                title: "Flooding Recognition",
                description: "Notice signs of emotional flooding (heart rate, profanity, intensity) and take breaks",
                frequency: "During conflicts",
              }
            : null,
        ].filter(Boolean),
        relationshipRituals: [
          {
            title: "Appreciation Ritual",
            description: "Share three specific appreciations before bed",
            frequency: "Daily",
          },
          { title: "Date Night", description: "Dedicated couple time without distractions", frequency: "Weekly" },
          {
            title: "Adventure Day",
            description: "Try something new together to build positive memories",
            frequency: "Monthly",
          },
          emotionalLabor.laborImbalance !== "balanced"
            ? {
                title: "Emotional Labor Check-In",
                description: `${emotionalLabor.whoDoesMore === subjectALabel ? subjectBLabel : subjectALabel} initiates emotional conversations and processing`,
                frequency: "Weekly",
              }
            : null,
        ].filter(Boolean),
      },
      prognosis: {
        shortTerm: `Over the next 1-3 months, expect ${repairEffortScore > 60 && contemptMarkers.contemptScore === 0 ? "continued growth" : contemptMarkers.contemptScore > 3 ? "continued decline without intervention" : "gradual improvement"} with ${contemptMarkers.contemptScore > 0 || emotionalSafetyScore < 50 ? "professional support and" : ""} consistent practice of communication skills.`,
        mediumTerm: `With sustained effort over 3-6 months, ${emotionalSafetyScore > 70 && contemptMarkers.contemptScore === 0 ? "the strong foundation may deepen" : contemptMarkers.contemptScore > 3 ? "the relationship may not survive without significant change" : "emotional safety and trust could strengthen"}.`,
        longTerm: `Long-term outlook is ${overallHealthScore >= 7 && contemptMarkers.contemptScore === 0 ? "positive" : overallHealthScore >= 5 && contemptMarkers.contemptScore < 3 ? "cautiously optimistic" : contemptMarkers.contemptScore > 5 ? "poor without immediate intervention" : "challenging but workable"} with commitment to growth and ${emotionalSafetyScore < 60 || repairEffortScore < 60 || contemptMarkers.contemptScore > 0 ? "professional support" : "continued practice"}.`,
        riskFactors: [
          contemptMarkers.contemptScore > 0
            ? `Contempt present (score: ${contemptMarkers.contemptScore}) - #1 predictor of relationship failure`
            : "No contempt detected - major protective factor",
          gottmanFlags.stonewalling ||
          subjectATiming.averageGapIndicator === "delayed" ||
          subjectBTiming.averageGapIndicator === "delayed"
            ? "Withdrawal/stonewalling patterns may escalate without intervention"
            : "Engagement levels are healthy",
          repairEffortScore < 40 || repairDynamics.repairEffectiveness === "low"
            ? "Low or ineffective repair capacity may increase conflict escalation risk"
            : "Repair skills are adequate",
          profanityAnalysis.emotionalEscalation ? "Emotional escalation and flooding may indicate poor regulation" : "",
          emotionalLabor.laborImbalance === "significant"
            ? `Significant emotional labor imbalance could create resentment in ${emotionalLabor.whoDoesMore}`
            : "",
        ].filter(Boolean),
        protectiveFactors: [
          !gottmanFlags.contempt || contemptMarkers.contemptScore < 2
            ? "Absence or low contempt protects relationship respect"
            : "Working on respectful communication",
          repairEffortScore > 60 && repairDynamics.repairEffectiveness !== "low"
            ? "Strong and effective repair capacity supports conflict resolution"
            : "Developing repair skills",
          harmonyScore > 60 ? "Balanced communication supports mutual understanding" : "Building communication balance",
          subjectAAccountability.takesResponsibility > 0 && subjectBAccountability.takesResponsibility > 0
            ? "Both partners take accountability"
            : "",
        ].filter(Boolean),
      },
      differentialConsiderations: {
        individualTherapyConsiderations:
          gottmanFlags.defensiveness ||
          gottmanFlags.stonewalling ||
          subjectAAccountability.blamesOther > 1 ||
          subjectBAccountability.blamesOther > 1 ||
          contemptMarkers.contemptScore > 3
            ? "Individual therapy could be strongly recommended to address personal patterns before couples work"
            : "Individual therapy optional for personal growth",
        couplesTherapyReadiness:
          emotionalSafetyScore > 60 && contemptMarkers.contemptScore < 3
            ? "Ready for couples therapy to enhance strengths"
            : contemptMarkers.contemptScore > 5
              ? "May not be ready for couples therapy until contempt is addressed individually"
              : "Could benefit from individual work before or alongside couples therapy",
        externalResourcesNeeded: [
          "Relationship education books (Gottman's 'Seven Principles', Sue Johnson's 'Hold Me Tight')",
          "Communication skills workshops",
          contemptMarkers.contemptScore > 0 ? "Gottman's 'What Makes Love Last?' (contempt antidotes)" : "",
          hasMinimalData ? "More conversation data for deeper analysis" : "Ongoing relationship assessment",
        ].filter(Boolean),
      },
    },

    outlook:
      overallHealthScore >= 7 && contemptMarkers.contemptScore === 0
        ? `This relationship demonstrates strong fundamentals with healthy communication patterns and emotional connection. Continue building on these strengths through consistent practice of appreciation, active listening, and repair. The foundation appears solid for long-term growth and deepening intimacy.`
        : overallHealthScore >= 5 && contemptMarkers.contemptScore < 3
          ? `This relationship shows promise with room for growth in communication and emotional attunement. Focus on developing repair skills, balancing participation${emotionalLabor.laborImbalance !== "balanced" ? " and emotional labor" : ""}, and building emotional safety. ${contemptMarkers.contemptScore > 0 ? "Address contempt patterns immediately." : ""} With conscious effort and possibly professional support, the relationship could strengthen significantly.`
          : contemptMarkers.contemptScore > 5
            ? `This relationship may be in crisis due to high levels of contempt—one of the most toxic and destructive conflict patterns. Immediate professional intervention could be essential. Individual therapy might be recommended before couples work to address the contempt patterns. Without significant change, the relationship may be at high risk of failure.`
            : `This relationship faces challenges that may require focused attention and professional support. Key areas needing work include ${repairEffortScore < 60 ? "repair skills" : "communication balance"}, ${emotionalSafetyScore < 60 ? "emotional safety" : "conflict patterns"}, ${gottmanFlags.criticism || gottmanFlags.contempt ? "respectful communication" : "engagement levels"}${emotionalLabor.laborImbalance === "significant" ? ", and emotional labor balance" : ""}. Individual and couples therapy could be strongly recommended.`,

    optionalAppendix: hasMinimalData
      ? "Note: This analysis is based on limited conversation data. For more comprehensive insights, please upload additional screenshots with more messages. The patterns identified are preliminary and should be considered alongside your personal knowledge of the relationship dynamics."
      : "",

    keyTakeaways: [
      `Overall relationship health: ${overallHealthScore}/10 - ${overallHealthScore >= 8 ? "Strong" : overallHealthScore >= 6 ? "Solid" : overallHealthScore >= 4 ? "Struggling" : "Crisis"}`,
      `Communication balance: ${Math.abs(subjectAMessages - subjectBMessages) < 2 ? "Balanced" : `Imbalanced (${subjectALabel}: ${subjectAMessages}, ${subjectBLabel}: ${subjectBMessages})`}`,
      `Emotional safety: ${emotionalSafetyScore}/100 - ${emotionalSafetyScore > 70 ? "Strong" : emotionalSafetyScore > 50 ? "Moderate" : "Low"}`,
      `Repair capacity: ${repairEffortScore}/100 - ${repairDynamics.repairEffectiveness} effectiveness`,
      gottmanFlags.criticism || gottmanFlags.contempt || gottmanFlags.defensiveness || gottmanFlags.stonewalling
        ? `Gottman concerns: ${[
            gottmanFlags.criticism && "Criticism (expressing complaints as character flaws or blame)",
            gottmanFlags.contempt &&
              `Contempt (${[contemptMarkers.sarcasmDetected && "sarcasm", contemptMarkers.mockeryDetected && "mockery", contemptMarkers.nameCallingDetected && "name-calling", contemptMarkers.eyeRollLanguage && "eye-roll language"].filter(Boolean).join(", ")})`,
            gottmanFlags.defensiveness && "Defensiveness (protecting self rather than hearing partner)",
            gottmanFlags.stonewalling && "Stonewalling (withdrawing to avoid overwhelm)",
          ]
            .filter(Boolean)
            .join("; ")}`
        : "No major Gottman concerns",
      profanityAnalysis.profanityCount > 0 || profanityAnalysis.intensityLevel !== "low"
        ? `Emotional intensity: ${profanityAnalysis.intensityLevel} (${profanityAnalysis.profanityCount} profanity instances)`
        : "",
      emotionalLabor.laborImbalance !== "balanced"
        ? `Emotional labor: ${emotionalLabor.laborImbalance} imbalance (${emotionalLabor.whoDoesMore} does more)`
        : "",
      subjectATiming.anxiousPursuit || subjectBTiming.anxiousPursuit
        ? `Anxious pursuit detected in ${subjectATiming.anxiousPursuit ? subjectALabel : subjectBLabel}`
        : "",
      `Emotional flow: ${emotionalFlow.dominantPhase} phase with ${emotionalFlow.transitionCount} transitions`,
      `Primary motivations: ${subjectALabel} (${subjectAMotivation.primaryMotive}), ${subjectBLabel} (${subjectBMotivation.primaryMotive})`,
    ].filter(Boolean),

    pursueDistanceRepairDynamics: {
      summary:
        pursueWithdrawLoop.loopDetected && pursueWithdrawLoop.escalates
          ? `${pursueWithdrawLoop.description} ${patternEvolution.description}`
          : `Both partners navigate pursuit and distance in their own ways. ${patternEvolution.description}`,

      bidirectionalPatterns: {
        pursuit: {
          [subjectALabel]: {
            score: pdrScores.subjectA_pursueScore,
            type: subjectA_pursuitType.pursuitType,
            frequency: bidirectionalPDR.subjectA_pursues_B,
            description:
              subjectA_pursuitType.pursuitType === "healthy"
                ? `Seeks connection through balanced outreach`
                : `Seeks reassurance through frequent contact (may reflect attachment anxiety)`,
          },
          [subjectBLabel]: {
            score: pdrScores.subjectB_pursueScore,
            type: subjectB_pursuitType.pursuitType,
            frequency: bidirectionalPDR.subjectB_pursues_A,
            description:
              subjectB_pursuitType.pursuitType === "healthy"
                ? `Seeks connection through balanced outreach`
                : `Seeks reassurance through frequent contact (may reflect attachment anxiety)`,
          },
          asymmetry:
            bidirectionalPDR.pursuitAsymmetry > 0.7
              ? `Significant imbalance: ${bidirectionalPDR.subjectA_pursues_B > bidirectionalPDR.subjectB_pursues_A ? subjectALabel : subjectBLabel} pursues ${Math.round(bidirectionalPDR.pursuitAsymmetry * 100)}% more`
              : "Relatively balanced pursuit patterns",
        },
        distance: {
          [subjectALabel]: {
            score: pdrScores.subjectA_distanceScore,
            type: subjectA_withdrawalType.withdrawalType,
            frequency: bidirectionalPDR.subjectA_distances_from_B,
            description:
              subjectA_withdrawalType.withdrawalType === "healthy"
                ? `Takes space to self-regulate`
                : subjectA_withdrawalType.withdrawalType === "stonewalling"
                  ? `Withdraws defensively (stonewalling pattern)`
                  : `Mixed withdrawal patterns`,
          },
          [subjectBLabel]: {
            score: pdrScores.subjectB_distanceScore,
            type: subjectB_withdrawalType.withdrawalType,
            frequency: bidirectionalPDR.subjectB_distances_from_A,
            description:
              subjectB_withdrawalType.withdrawalType === "healthy"
                ? `Takes space to self-regulate`
                : subjectB_withdrawalType.withdrawalType === "stonewalling"
                  ? `Withdraws defensively (stonewalling pattern)`
                  : `Mixed withdrawal patterns`,
          },
          asymmetry:
            bidirectionalPDR.distanceAsymmetry > 0.7
              ? `Significant imbalance: ${bidirectionalPDR.subjectA_distances_from_B > bidirectionalPDR.subjectB_distances_from_A ? subjectALabel : subjectBLabel} distances ${Math.round(bidirectionalPDR.distanceAsymmetry * 100)}% more`
              : "Relatively balanced distance patterns",
        },
        repair: {
          [subjectALabel]: {
            score: pdrScores.subjectA_repairScore,
            frequency: bidirectionalPDR.subjectA_repairs_toward_B,
            quality: repairQuality.overallQuality,
            timing: repairTiming.timingQuality,
            description:
              repairQuality.overallQuality === "high"
                ? `Offers genuine, accountable repairs with good timing`
                : repairQuality.overallQuality === "moderate"
                  ? `Attempts repair with room to deepen quality`
                  : `Repair attempts are superficial or poorly timed`,
          },
          [subjectBLabel]: {
            score: pdrScores.subjectB_repairScore,
            frequency: bidirectionalPDR.subjectB_repairs_toward_A,
            quality: repairQuality.overallQuality,
            timing: repairTiming.timingQuality,
            description:
              repairQuality.overallQuality === "high"
                ? `Offers genuine, accountable repairs with good timing`
                : repairQuality.overallQuality === "moderate"
                  ? `Attempts repair with room to deepen quality`
                  : `Repair attempts are superficial or poorly timed`,
          },
          asymmetry:
            bidirectionalPDR.repairAsymmetry > 0.7
              ? `Significant imbalance: ${bidirectionalPDR.subjectA_repairs_toward_B > bidirectionalPDR.subjectB_repairs_toward_A ? subjectALabel : subjectBLabel} repairs ${Math.round(bidirectionalPDR.repairAsymmetry * 100)}% more (repair burden)`
              : "Relatively balanced repair efforts",
        },
      },

      repairAnalysis: {
        quality: {
          superficial: repairQuality.superficial,
          genuine: repairQuality.genuine,
          accountable: repairQuality.accountable,
          empathic: repairQuality.empathic,
          overall: repairQuality.overallQuality,
        },
        timing: {
          immediate: repairTiming.immediate,
          delayed: repairTiming.delayed,
          absent: repairTiming.absent,
          overall: repairTiming.timingQuality,
        },
        effectiveness:
          repairQuality.overallQuality === "high" && repairTiming.timingQuality === "excellent"
            ? "Repairs are genuine, timely, and effective"
            : repairQuality.overallQuality === "moderate" || repairTiming.timingQuality === "good"
              ? "Repairs are attempted but could be more genuine or timely"
              : "Repairs are superficial, delayed, or absent—this needs attention",
      },

      patternEvolution: {
        trend: patternEvolution.trend,
        description: patternEvolution.description,
        early: `Early: ${patternEvolution.early.pursuit} pursuit, ${patternEvolution.early.distance} distance, ${patternEvolution.early.repair} repair`,
        middle: `Middle: ${patternEvolution.middle.pursuit} pursuit, ${patternEvolution.middle.distance} distance, ${patternEvolution.middle.repair} repair`,
        late: `Late: ${patternEvolution.late.pursuit} pursuit, ${patternEvolution.late.distance} distance, ${patternEvolution.late.repair} repair`,
      },

      clinicalInsight:
        pursueWithdrawLoop.loopDetected && pursueWithdrawLoop.escalates
          ? `${pursueWithdrawLoop.description} ${patternEvolution.description}`
          : pursueWithdrawLoop.loopDetected
            ? `A pursue-withdraw pattern exists but hasn't escalated. Both partners can learn to break this cycle with awareness and practice.`
            : bidirectionalPDR.repairAsymmetry > 0.7
              ? `The repair burden falls heavily on one partner. Both need to take responsibility for reconnection.`
              : `PDR patterns are relatively balanced. Continue building on this foundation.`,
    },

    validationAndReassurancePatterns: {
      [subjectALabel]: subjectAValidationPatterns,
      [subjectBLabel]: subjectBValidationPatterns,
    },
  }
}

export async function analyzeConversation(formData: FormData) {
  try {
    logDiagnostic("info", "===== Starting conversation analysis =====", {
      environment: process.env.NEXT_PUBLIC_VERCEL_ENV || "development",
      timestamp: new Date().toISOString(),
    })

    const subjectAName = formData.get("subjectAName") as string | null
    const subjectBName = formData.get("subjectBName") as string | null

    logDiagnostic("info", "Custom names provided", {
      subjectA: subjectAName || "none",
      subjectB: subjectBName || "none",
    })

    const files: File[] = []
    let fileIndex = 0

    logDiagnostic("info", "Starting file collection from FormData")

    while (true) {
      const file = formData.get(`file-${fileIndex}`) as File | null

      if (!file) {
        logDiagnostic("info", `No more files found at index ${fileIndex}`)
        break
      }

      logDiagnostic("info", `Found file-${fileIndex}`, {
        name: file.name,
        size: file.size,
        type: file.type,
      })

      if (!file.size) {
        logDiagnostic("error", `File ${fileIndex + 1} has no size`)
        return {
          error: `File ${fileIndex + 1} (${file.name}) is empty or invalid. Please remove it and try again.`,
          diagnostics: diagnosticLogs,
        }
      }

      if (file.size > 10 * 1024 * 1024) {
        logDiagnostic("error", `File ${file.name} is too large`, { size: file.size })
        return {
          error: `File "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 10MB per file.`,
          diagnostics: diagnosticLogs,
        }
      }

      if (!file.type.startsWith("image/")) {
        logDiagnostic("error", `File ${file.name} is not an image`, { type: file.type })
        return {
          error: `File "${file.name}" is not an image (type: ${file.type}). Please upload only image files (PNG, JPG, JPEG).`,
          diagnostics: diagnosticLogs,
        }
      }

      try {
        const testBuffer = await file.arrayBuffer()
        logDiagnostic("info", `File ${file.name} is readable`, {
          bufferSize: testBuffer.byteLength,
        })
      } catch (readError) {
        logDiagnostic("error", `File ${file.name} cannot be read`, readError)
        return {
          error: `Unable to read file "${file.name}". The file may be corrupted or your browser lost access to it. Please try uploading it again.`,
          diagnostics: diagnosticLogs,
        }
      }

      files.push(file)
      fileIndex++
    }

    logDiagnostic("info", `File collection complete: ${files.length} files`)

    if (files.length === 0) {
      logDiagnostic("error", "No files provided in FormData")
      return {
        error: "No files provided. Please upload at least one screenshot of your conversation.",
        diagnostics: diagnosticLogs,
      }
    }

    const analysisPromise = (async () => {
      logDiagnostic("info", `Starting batch OCR extraction for ${files.length} files`)

      const { extractedTexts, totalProcessingTime } = await extractTextFromMultipleImages(files)

      logDiagnostic("info", "Batch extraction completed", {
        processingTime: totalProcessingTime,
        totalCharacters: extractedTexts.reduce((sum, e) => sum + e.text.length, 0),
      })

      // Normalize speaker labels
      const { normalizedText, subjectALabel, subjectBLabel } = normalizeSpeakers(
        extractedTexts,
        subjectAName,
        subjectBName,
      )

      logDiagnostic("info", "Normalized conversation text", {
        length: normalizedText.length,
        subjectA: subjectALabel,
        subjectB: subjectBLabel,
      })

      logDiagnostic("info", "Generating evidence-based analysis")

      const analysis = generateEnhancedFallbackAnalysis(subjectALabel, subjectBLabel, normalizedText)

      logDiagnostic("info", "===== Analysis complete successfully =====")

      return {
        ...analysis,
        subjectALabel,
        subjectBLabel,
        analyzedConversationText: normalizedText.substring(0, 500),
        messageCount: (normalizedText.match(/\[/g) || []).length,
        screenshotCount: files.length,
        extractionConfidence: Math.min(100, Math.round((normalizedText.length / 500) * 100)),
      }
    })()

    return await withTimeout(analysisPromise, 300000, "Complete analysis")
  } catch (error) {
    logDiagnostic("error", "===== Analysis error =====", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    let errorMessage = "An unexpected error occurred during analysis."

    if (error instanceof Error) {
      if (error.message.includes("timed out")) {
        errorMessage =
          "The analysis is taking longer than expected. This may be due to high server load or large images. Please try again with fewer or smaller images."
      } else if (error.message.includes("file could not be read") || error.message.includes("corrupted")) {
        errorMessage =
          "Unable to read one or more uploaded files. Please refresh the page and try uploading your images again."
      } else if (error.message.includes("too large")) {
        errorMessage = error.message
      } else if (error.message.includes("not an image")) {
        errorMessage = error.message
      } else if (error.message.includes("OpenAI API")) {
        errorMessage = `Server error: ${error.message}. Please try again in a few moments.`
      } else {
        errorMessage = `Analysis failed: ${error.message}`
      }
    }

    return {
      error: errorMessage,
      diagnostics: diagnosticLogs,
    }
  }
}
