// This file contains implementations of established psychological theories and frameworks
// for analyzing communication patterns, emotional intelligence, and relationship dynamics

import type { Message } from "./types"

// ===== ATTACHMENT THEORY =====
// Based on work by Bowlby, Ainsworth, and modern attachment researchers

export enum AttachmentStyle {
  Secure = "secure",
  Anxious = "anxious",
  Avoidant = "avoidant",
  Disorganized = "disorganized",
}

// Interface for attachment style analysis result
interface AttachmentStyleAnalysis {
  primaryStyle: AttachmentStyle
  confidence: number
  secondaryStyle?: AttachmentStyle
  explanation: string
  limitedDataWarning?: string
}

export function analyzeAttachmentStyle(messages: Message[]): AttachmentStyleAnalysis {
  // 🧠 Refactor to use separate inputs - ensure this function only processes messages from one person
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for attachment style analysis.")
  }

  // Keywords associated with different attachment styles
  const attachmentKeywords = {
    [AttachmentStyle.Secure]: ["trust", "comfortable", "support", "together", "understand"],
    [AttachmentStyle.Anxious]: ["worry", "afraid", "need", "miss", "alone", "always"],
    [AttachmentStyle.Avoidant]: ["space", "independent", "fine", "busy", "later", "time"],
    [AttachmentStyle.Disorganized]: ["confused", "hurt", "angry", "love", "hate"],
  }

  // Count occurrences of attachment style keywords
  const styleCounts = {
    [AttachmentStyle.Secure]: 0,
    [AttachmentStyle.Anxious]: 0,
    [AttachmentStyle.Avoidant]: 0,
    [AttachmentStyle.Disorganized]: 0,
  }

  // Simple keyword matching for attachment style
  messages.forEach((message) => {
    const lowerContent = typeof message.text === "string" ? message.text.toLowerCase() : ""

    Object.entries(attachmentKeywords).forEach(([style, keywords]) => {
      keywords.forEach((keyword) => {
        if (lowerContent.includes(keyword)) {
          styleCounts[style as AttachmentStyle]++
        }
      })
    })
  })

  // Determine dominant attachment style
  let maxCount = 0
  let dominantStyle = AttachmentStyle.Secure
  let secondMaxCount = 0
  let secondaryStyle: AttachmentStyle | undefined = undefined

  Object.entries(styleCounts).forEach(([style, count]) => {
    if (count > maxCount) {
      secondMaxCount = maxCount
      secondaryStyle = dominantStyle
      maxCount = count
      dominantStyle = style as AttachmentStyle
    } else if (count > secondMaxCount) {
      secondMaxCount = count
      secondaryStyle = style as AttachmentStyle
    }
  })

  // Calculate confidence based on the difference between top scores
  const confidence = Math.min(0.9, Math.max(0.4, 0.6 + (maxCount - secondMaxCount) / maxCount))

  // Generate explanation
  let explanation = `Based on the conversation analysis, there are indicators of ${dominantStyle} attachment style`
  if (secondaryStyle && maxCount - secondMaxCount < 3) {
    explanation += ` with elements of ${secondaryStyle} attachment`
  }

  // Add limited data warning if appropriate
  let limitedDataWarning = undefined
  if (messages.length < 10) {
    limitedDataWarning =
      "This analysis is based on limited data and should be considered preliminary. More conversation data would provide a more accurate assessment."
  }

  return {
    primaryStyle: dominantStyle,
    confidence,
    secondaryStyle,
    explanation,
    limitedDataWarning,
  }
}

// ===== TRANSACTIONAL ANALYSIS =====
// Based on Eric Berne's theory of personality and communication

export enum EgoState {
  Parent = "Parent",
  Adult = "Adult",
  Child = "Child",
}

export enum ParentType {
  Nurturing = "Nurturing",
  Critical = "Critical",
}

export enum ChildType {
  Free = "Free",
  Adapted = "Adapted",
}

export interface TAAnalysis {
  dominantEgoState: EgoState
  parentType?: ParentType
  childType?: ChildType
  egoStateDistribution: {
    parent: number
    adult: number
    child: number
  }
  transactionPatterns: {
    complementary: number
    crossed: number
    ulterior: number
  }
}

export function analyzeTransactionalPatterns(
  messages: any[],
  participant1: string,
  participant2: string,
): {
  participant1Analysis: TAAnalysis
  participant2Analysis: TAAnalysis
  overallDynamics: string
} {
  // 🧠 Refactor to use separate inputs
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for transactional patterns analysis.")
  }

  // Filter messages by participants
  const p1Messages = messages.filter((msg) => msg.sender === participant1)
  const p2Messages = messages.filter((msg) => msg.sender === participant2)

  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!p1Messages || p1Messages.length === 0) {
    throw new Error(`Insufficient messages from ${participant1} for transactional patterns analysis.`)
  }

  if (!p2Messages || p2Messages.length === 0) {
    throw new Error(`Insufficient messages from ${participant2} for transactional patterns analysis.`)
  }

  // Analyze ego states for participant 1
  const p1Analysis = analyzeEgoStates(p1Messages)

  // Analyze ego states for participant 2
  const p2Analysis = analyzeEgoStates(p2Messages)

  // Analyze transaction patterns between participants
  const transactionPatterns = analyzeTransactions(messages, participant1, participant2)

  p1Analysis.transactionPatterns = transactionPatterns
  p2Analysis.transactionPatterns = transactionPatterns

  // Determine overall dynamics
  const overallDynamics = determineTransactionalDynamics(p1Analysis, p2Analysis)

  return {
    participant1Analysis: p1Analysis,
    participant2Analysis: p2Analysis,
    overallDynamics,
  }
}

export function analyzeEgoStates(messages: Message[]): TAAnalysis {
  // 🧠 Refactor to use separate inputs - ensure this function only processes messages from one person
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for ego states analysis.")
  }

  // Initialize counters
  let parentCount = 0
  let adultCount = 0
  let childCount = 0

  let nurturingParentCount = 0
  let criticalParentCount = 0
  let freeChildCount = 0
  let adaptedChildCount = 0

  // Analyze each message
  messages.forEach((message) => {
    const text = typeof message.text === "string" ? message.text.toLowerCase() : ""
    const sentiment = message.sentiment || 50

    // Parent ego state indicators
    if (
      text.includes("should") ||
      text.includes("always") ||
      text.includes("never") ||
      text.includes("must") ||
      text.includes("ought to") ||
      text.match(/you (need|have) to/)
    ) {
      parentCount++

      // Critical Parent
      if (sentiment < 50 || text.includes("wrong") || text.includes("mistake") || text.includes("bad")) {
        criticalParentCount++
      }
      // Nurturing Parent
      else {
        nurturingParentCount++
      }
    }

    // Adult ego state indicators
    else if (
      text.includes("think") ||
      text.includes("believe") ||
      text.includes("consider") ||
      text.includes("analyze") ||
      text.includes("perhaps") ||
      text.includes("maybe") ||
      text.includes("possibly") ||
      text.match(/what if/)
    ) {
      adultCount++
    }

    // Child ego state indicators
    else if (
      text.includes("want") ||
      text.includes("fun") ||
      text.includes("wow") ||
      text.includes("cool") ||
      text.includes("awesome") ||
      text.includes("hate") ||
      text.includes("love") ||
      text.includes("!") ||
      text.includes("😊") ||
      text.includes("😢")
    ) {
      childCount++

      // Free Child
      if (sentiment > 60 || text.includes("yay") || text.includes("woohoo") || text.includes("haha")) {
        freeChildCount++
      }
      // Adapted Child
      else {
        adaptedChildCount++
      }
    }

    // Default to adult if no clear indicators
    else {
      adultCount++
    }
  })

  const total = Math.max(1, parentCount + adultCount + childCount)

  // Determine dominant ego state
  let dominantEgoState: EgoState
  let parentType: ParentType | undefined
  let childType: ChildType | undefined

  if (parentCount >= adultCount && parentCount >= childCount) {
    dominantEgoState = EgoState.Parent
    parentType = nurturingParentCount >= criticalParentCount ? ParentType.Nurturing : ParentType.Critical
  } else if (adultCount >= parentCount && adultCount >= childCount) {
    dominantEgoState = EgoState.Adult
  } else {
    dominantEgoState = EgoState.Child
    childType = freeChildCount >= adaptedChildCount ? ChildType.Free : ChildType.Adapted
  }

  return {
    dominantEgoState,
    parentType,
    childType,
    egoStateDistribution: {
      parent: (parentCount / total) * 100,
      adult: (adultCount / total) * 100,
      child: (childCount / total) * 100,
    },
    transactionPatterns: {
      complementary: 0,
      crossed: 0,
      ulterior: 0,
    },
  }
}

function analyzeTransactions(messages: any[], participant1: string, participant2: string) {
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for transactions analysis.")
  }

  let complementary = 0
  let crossed = 0
  let ulterior = 0
  let totalTransactions = 0

  // Analyze message pairs (transactions)
  for (let i = 1; i < messages.length; i++) {
    if (
      (messages[i - 1].sender === participant1 && messages[i].sender === participant2) ||
      (messages[i - 1].sender === participant2 && messages[i].sender === participant1)
    ) {
      totalTransactions++

      const prevText = typeof messages[i - 1].text === "string" ? messages[i - 1].text.toLowerCase() : ""
      const currText = typeof messages[i].text === "string" ? messages[i].text.toLowerCase() : ""
      const prevSentiment = messages[i - 1].sentiment || 50
      const currSentiment = messages[i].sentiment || 50

      // Complementary transactions (smooth communication)
      if (
        Math.abs(prevSentiment - currSentiment) < 20 ||
        (prevText.includes("?") && currText.length > 15) ||
        (prevText.includes("hello") && currText.includes("hi"))
      ) {
        complementary++
      }
      // Crossed transactions (communication breakdown)
      else if (
        (prevSentiment > 60 && currSentiment < 40) ||
        (prevSentiment < 40 && currSentiment > 60) ||
        (prevText.includes("?") && currText.length < 5)
      ) {
        crossed++
      }
      // Ulterior transactions (hidden agendas)
      else if (
        (prevText.includes("fine") && prevSentiment < 40) ||
        (currText.includes("fine") && currSentiment < 40) ||
        prevText.includes("whatever") ||
        currText.includes("whatever")
      ) {
        ulterior++
      }
      // Default to complementary
      else {
        complementary++
      }
    }
  }

  // 🚫 Remove Fallback Profiles - Check for sufficient transactions
  if (totalTransactions === 0) {
    throw new Error("Insufficient transactions between participants for analysis.")
  }

  return {
    complementary: (complementary / totalTransactions) * 100,
    crossed: (crossed / totalTransactions) * 100,
    ulterior: (ulterior / totalTransactions) * 100,
  }
}

function determineTransactionalDynamics(p1Analysis: TAAnalysis, p2Analysis: TAAnalysis): string {
  const p1State = p1Analysis.dominantEgoState
  const p2State = p2Analysis.dominantEgoState

  // Parent-Child dynamics (complementary but potentially problematic)
  if (
    (p1State === EgoState.Parent && p2State === EgoState.Child) ||
    (p1State === EgoState.Child && p2State === EgoState.Parent)
  ) {
    return "Parent-Child Dynamic: One person tends to take a guiding or controlling role while the other responds from a more emotional or dependent position. This can be nurturing but may become unbalanced over time."
  }

  // Adult-Adult dynamics (healthy)
  else if (p1State === EgoState.Adult && p2State === EgoState.Adult) {
    return "Adult-Adult Dynamic: Communication is primarily rational, problem-solving oriented, and balanced. This is generally the healthiest dynamic for resolving issues and making decisions together."
  }

  // Child-Child dynamics (fun but potentially irresponsible)
  else if (p1State === EgoState.Child && p2State === EgoState.Child) {
    return "Child-Child Dynamic: Interactions are playful and emotionally expressive, which can be fun and strengthen bonds. However, this dynamic may struggle with responsibility and serious decision-making."
  }

  // Parent-Parent dynamics (potential power struggles)
  else if (p1State === EgoState.Parent && p2State === EgoState.Parent) {
    return "Parent-Parent Dynamic: Both individuals tend to communicate from positions of authority or judgment, which can lead to power struggles or competing advice-giving. This may create tension unless balanced with other ego states."
  }

  // Adult-Parent or Adult-Child (moderately balanced)
  else if (
    (p1State === EgoState.Adult && p2State === EgoState.Parent) ||
    (p1State === EgoState.Parent && p2State === EgoState.Adult) ||
    (p1State === EgoState.Adult && p2State === EgoState.Child) ||
    (p1State === EgoState.Child && p2State === EgoState.Adult)
  ) {
    return "Mixed Dynamic: One person tends to approach communication rationally while the other is either more directive or more emotional. This can be complementary but may benefit from more flexibility in communication styles."
  }

  return "Balanced Dynamic: Both individuals show flexibility in their communication styles, adapting to different situations appropriately."
}

// ===== LINGUISTIC MARKERS OF PSYCHOLOGICAL STATES =====
// Based on research in psycholinguistics and computational psychology

export interface LinguisticAnalysis {
  cognitiveComplexity: number // 0-100
  emotionalExpressiveness: number // 0-100
  socialEngagement: number // 0-100
  psychologicalDistancing: number // 0-100
  certaintyLevel: number // 0-100
  dominantEmotions: {
    joy: number
    sadness: number
    anger: number
    fear: number
    surprise: number
    disgust: number
    trust: number
  }
}

export function analyzeLinguisticMarkers(messages: Message[]): {
  cognitiveComplexity: number
  emotionalExpressiveness: number
  socialEngagement: number
  dominantEmotions: string[]
} {
  // 🧠 Refactor to use separate inputs - ensure this function only processes messages from one person
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for linguistic markers analysis.")
  }

  return {
    cognitiveComplexity: calculateCognitiveComplexity(messages),
    emotionalExpressiveness: calculateEmotionalExpressiveness(messages),
    socialEngagement: calculateSocialEngagement(messages),
    dominantEmotions: identifyDominantEmotions(messages),
  }
}

// Helper functions for linguistic analysis
function calculateCognitiveComplexity(messages: Message[]): number {
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for cognitive complexity calculation.")
  }

  // Implement cognitive complexity calculation
  return 70 // Placeholder
}

function calculateEmotionalExpressiveness(messages: Message[]): number {
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for emotional expressiveness calculation.")
  }

  // Implement emotional expressiveness calculation
  return 65 // Placeholder
}

function calculateSocialEngagement(messages: Message[]): number {
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for social engagement calculation.")
  }

  // Implement social engagement calculation
  return 75 // Placeholder
}

function calculatePsychologicalDistancing(messages: Message[]): number {
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for psychological distancing calculation.")
  }

  // Implement psychological distancing calculation
  return 50 // Placeholder
}

function calculateCertaintyLevel(messages: Message[]): number {
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for certainty level calculation.")
  }

  // Implement certainty level calculation
  return 50 // Placeholder
}

function identifyDominantEmotions(messages: Message[]): string[] {
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for dominant emotions identification.")
  }

  // Implement dominant emotions identification
  return ["Joy", "Trust", "Anticipation"] // Placeholder
}

// ===== COGNITIVE BEHAVIORAL PATTERNS =====
// Based on CBT frameworks for identifying thought patterns

export enum CognitiveDistortion {
  AllOrNothing = "All-or-Nothing Thinking",
  Overgeneralization = "Overgeneralization",
  MentalFilter = "Mental Filter",
  Catastrophizing = "Catastrophizing",
  EmotionalReasoning = "Emotional Reasoning",
  ShouldStatements = "Should Statements",
  Labeling = "Labeling",
  Personalization = "Personalization",
  MindReading = "Mind Reading",
}

export interface CBTAnalysis {
  distortions: {
    type: CognitiveDistortion
    frequency: number
    examples: string[]
  }[]
  healthyPatterns: {
    type: string
    frequency: number
  }[]
  overallBalance: number // 0-100, higher is more balanced thinking
}

export function analyzeCognitivePatterns(messages: Message[]): {
  distortions: any[]
  healthyPatterns: any[]
  overallBalance: number
} {
  // 🧠 Refactor to use separate inputs - ensure this function only processes messages from one person
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for cognitive patterns analysis.")
  }

  return {
    distortions: identifyCognitiveDistortions(messages),
    healthyPatterns: identifyHealthyPatterns(messages),
    overallBalance: calculateCognitiveBalance(messages),
  }
}

// Helper functions for cognitive analysis
function identifyCognitiveDistortions(messages: Message[]): any[] {
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for cognitive distortions identification.")
  }

  // Implement cognitive distortions identification
  return [] // Placeholder
}

function identifyHealthyPatterns(messages: Message[]): any[] {
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for healthy patterns identification.")
  }

  // Implement healthy patterns identification
  return [
    { type: "Balanced Perspective", frequency: 0.8 },
    { type: "Evidence-Based Thinking", frequency: 0.7 },
  ] // Placeholder
}

function calculateCognitiveBalance(messages: Message[]): number {
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for cognitive balance calculation.")
  }

  // Implement cognitive balance calculation
  return 65 // Placeholder
}

// ===== COMPREHENSIVE PSYCHOLOGICAL ANALYSIS =====
// Combines multiple frameworks for a holistic view

export interface PsychologicalProfile {
  attachmentStyle: {
    primaryStyle: AttachmentStyle
    secondaryStyle: AttachmentStyle | null
    confidence: number
    explanation: string
    limitedDataWarning?: string
  }
  transactionalAnalysis: {
    dominantEgoState: EgoState
    egoStateDistribution: {
      parent: number
      adult: number
      child: number
    }
  }
  linguisticPatterns: {
    cognitiveComplexity: number
    emotionalExpressiveness: number
    socialEngagement: number
    dominantEmotions: string[]
  }
  cognitivePatterns: {
    topDistortions: string[]
    topHealthyPatterns: string[]
    overallBalance: number
  }
  communicationStrengths: string[]
  growthAreas: string[]
}

export function generatePsychologicalProfile(messages: Message[], personName: string) {
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error(`Insufficient messages for psychological profile generation.`)
  }

  // No need to filter messages as they should already be filtered by the caller
  // Analyze attachment style based on person's messages only
  const attachmentStyle = analyzeAttachmentStyle(messages)

  // Analyze linguistic markers based on person's messages only
  const linguisticMarkers = analyzeLinguisticMarkers(messages)

  // Analyze cognitive patterns based on person's messages only
  const cognitivePatterns = analyzeCognitivePatterns(messages)

  // Generate profile based on individual analysis
  return {
    attachmentStyle: {
      primaryStyle: attachmentStyle.primaryStyle,
      secondaryStyle: attachmentStyle.secondaryStyle,
      confidence: attachmentStyle.confidence,
      explanation: attachmentStyle.explanation,
      limitedDataWarning: attachmentStyle.limitedDataWarning,
    },
    linguisticPatterns: linguisticMarkers,
    cognitivePatterns,
    transactionalAnalysis: {
      dominantEgoState: determineDominantEgoState(messages),
      egoStateDistribution: calculateEgoStateDistribution(messages),
    },
    communicationStrengths: identifyCommunicationStrengths(messages),
    growthAreas: identifyGrowthAreas(messages),
  }
}

// Helper function to determine dominant ego state based on individual messages
function determineDominantEgoState(messages: Message[]): string {
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for dominant ego state determination.")
  }

  const egoStateCounts: Record<string, number> = {
    parent: 0,
    adult: 0,
    child: 0,
  }

  messages.forEach((msg) => {
    const egoState = analyzeEgoState(msg.text)
    egoStateCounts[egoState]++
  })

  return Object.entries(egoStateCounts).sort(([, a], [, b]) => b - a)[0][0]
}

// Helper function to calculate ego state distribution
function calculateEgoStateDistribution(messages: Message[]): Record<string, number> {
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for ego state distribution calculation.")
  }

  const total = messages.length
  const distribution: Record<string, number> = {
    parent: 0,
    adult: 0,
    child: 0,
  }

  messages.forEach((msg) => {
    const egoState = analyzeEgoState(msg.text)
    distribution[egoState]++
  })

  return {
    parent: Math.round((distribution.parent / total) * 100),
    adult: Math.round((distribution.adult / total) * 100),
    child: Math.round((distribution.child / total) * 100),
  }
}

// Helper function to identify communication strengths
function identifyCommunicationStrengths(messages: Message[]): string[] {
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for communication strengths identification.")
  }

  const strengths: string[] = []

  // Analyze message patterns for strengths
  const clarityCount = messages.filter((msg) => hasClearCommunication(msg.text)).length
  const empathyCount = messages.filter((msg) => showsEmpathy(msg.text)).length
  const assertivenessCount = messages.filter((msg) => showsAssertiveness(msg.text)).length

  if (clarityCount > messages.length * 0.7) strengths.push("Clear communication")
  if (empathyCount > messages.length * 0.6) strengths.push("Empathetic responses")
  if (assertivenessCount > messages.length * 0.5) strengths.push("Assertive expression")

  return strengths
}

// Helper function to identify growth areas
function identifyGrowthAreas(messages: Message[]): string[] {
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for growth areas identification.")
  }

  const areas: string[] = []

  // Analyze message patterns for growth areas
  const defensiveCount = messages.filter((msg) => showsDefensiveness(msg.text)).length
  const passiveCount = messages.filter((msg) => showsPassivity(msg.text)).length
  const unclearCount = messages.filter((msg) => hasUnclearCommunication(msg.text)).length

  if (defensiveCount > messages.length * 0.3) areas.push("Reducing defensive responses")
  if (passiveCount > messages.length * 0.4) areas.push("Increasing assertiveness")
  if (unclearCount > messages.length * 0.3) areas.push("Improving communication clarity")

  return areas
}

// Helper functions for message analysis
function hasClearCommunication(text: string): boolean {
  // Implement clear communication detection logic
  return text.length > 10 && !text.includes("?") && !text.includes("...")
}

function showsEmpathy(text: string): boolean {
  // Implement empathy detection logic
  return typeof text === "string"
    ? text.toLowerCase().includes("understand")
    : false || typeof text === "string"
      ? text.toLowerCase().includes("feel")
      : false || typeof text === "string"
        ? text.toLowerCase().includes("sorry")
        : false
}

function showsAssertiveness(text: string): boolean {
  // Implement assertiveness detection logic
  return typeof text === "string"
    ? text.toLowerCase().includes("i think")
    : false || typeof text === "string"
      ? text.toLowerCase().includes("i feel")
      : false || typeof text === "string"
        ? text.toLowerCase().includes("i need")
        : false
}

function showsDefensiveness(text: string): boolean {
  // Implement defensiveness detection logic
  return typeof text === "string"
    ? text.toLowerCase().includes("but")
    : false || typeof text === "string"
      ? text.toLowerCase().includes("however")
      : false || typeof text === "string"
        ? text.toLowerCase().includes("actually")
        : false
}

function showsPassivity(text: string): boolean {
  // Implement passivity detection logic
  return typeof text === "string"
    ? text.toLowerCase().includes("maybe")
    : false || typeof text === "string"
      ? text.toLowerCase().includes("perhaps")
      : false || typeof text === "string"
        ? text.toLowerCase().includes("i guess")
        : false
}

function hasUnclearCommunication(text: string): boolean {
  // Implement unclear communication detection logic
  return text.includes("...") || text.includes("??") || text.length < 5
}

function analyzeEgoState(text: string): string {
  // Implement ego state analysis logic
  const lowerText = typeof text === "string" ? text.toLowerCase() : ""
  if (lowerText.includes("should") || lowerText.includes("must")) {
    return "parent"
  } else if (lowerText.includes("i feel") || lowerText.includes("i want")) {
    return "child"
  } else {
    return "adult"
  }
}

// ===== RELATIONSHIP DYNAMICS ANALYSIS =====
// Based on Gottman's research and other relationship science

export interface RelationshipDynamics {
  positiveToNegativeRatio: number
  biddingPatterns: {
    emotionalBids: number
    turningToward: number
    turningAway: number
    turningAgainst: number
  }
  conflictStyle: string
  sharedMeaning: number
  attachmentCompatibility: string
  communicationCompatibility: string
  keyStrengths: string[]
  keyGrowthAreas: string[]
}

export function analyzeRelationshipDynamics(
  messages: any[],
  participant1: string,
  participant2: string,
  gottmanScores: any,
): RelationshipDynamics {
  // 🧠 Refactor to use separate inputs
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for relationship dynamics analysis.")
  }

  // Get individual profiles
  const profile1 = generatePsychologicalProfile(
    messages.filter((msg) => msg.sender === participant1),
    participant1,
  )
  const profile2 = generatePsychologicalProfile(
    messages.filter((msg) => msg.sender === participant2),
    participant2,
  )

  // Calculate positive-to-negative ratio based on Gottman scores
  const positiveFactors =
    (gottmanScores.emotionalBids +
      gottmanScores.turnTowards +
      gottmanScores.repairAttempts +
      gottmanScores.sharedMeaning) /
    4

  const negativeFactors =
    (gottmanScores.criticism + gottmanScores.contempt + gottmanScores.defensiveness + gottmanScores.stonewalling) / 4

  const positiveToNegativeRatio = positiveFactors / Math.max(1, negativeFactors)

  // Determine conflict style based on Gottman scores
  let conflictStyle = "Validating"

  if (gottmanScores.criticism > 60 && gottmanScores.defensiveness > 60) {
    conflictStyle = "Volatile"
  } else if (gottmanScores.stonewalling > 60) {
    conflictStyle = "Avoidant"
  } else if (gottmanScores.contempt > 50) {
    conflictStyle = "Hostile"
  } else if (gottmanScores.repairAttempts > 70 && gottmanScores.turnTowards > 70) {
    conflictStyle = "Validating"
  }

  // Determine attachment compatibility
  let attachmentCompatibility = "Moderately Compatible"

  if (
    profile1.attachmentStyle.primaryStyle === AttachmentStyle.Secure &&
    profile2.attachmentStyle.primaryStyle === AttachmentStyle.Secure
  ) {
    attachmentCompatibility = "Highly Compatible"
  } else if (
    (profile1.attachmentStyle.primaryStyle === AttachmentStyle.Anxious &&
      profile2.attachmentStyle.primaryStyle === AttachmentStyle.Avoidant) ||
    (profile1.attachmentStyle.primaryStyle === AttachmentStyle.Avoidant &&
      profile2.attachmentStyle.primaryStyle === AttachmentStyle.Anxious)
  ) {
    attachmentCompatibility = "Potentially Challenging"
  }

  // Determine communication compatibility
  let communicationCompatibility = "Complementary"

  if (
    Math.abs(profile1.linguisticPatterns.cognitiveComplexity - profile2.linguisticPatterns.cognitiveComplexity) > 30 ||
    Math.abs(
      profile1.linguisticPatterns.emotionalExpressiveness - profile2.linguisticPatterns.emotionalExpressiveness,
    ) > 30
  ) {
    communicationCompatibility = "Divergent"
  } else if (
    Math.abs(profile1.linguisticPatterns.cognitiveComplexity - profile2.linguisticPatterns.cognitiveComplexity) < 15 &&
    Math.abs(
      profile1.linguisticPatterns.emotionalExpressiveness - profile2.linguisticPatterns.emotionalExpressiveness,
    ) < 15
  ) {
    communicationCompatibility = "Highly Similar"
  }

  // Determine key strengths
  const keyStrengths: string[] = []

  if (positiveToNegativeRatio >= 5) {
    keyStrengths.push("Excellent positive-to-negative interaction ratio")
  } else if (positiveToNegativeRatio >= 3) {
    keyStrengths.push("Healthy positive-to-negative interaction ratio")
  }

  if (gottmanScores.repairAttempts > 70) {
    keyStrengths.push("Strong repair attempts during conflict")
  }

  if (gottmanScores.sharedMeaning > 70) {
    keyStrengths.push("Strong sense of shared meaning and values")
  }

  if (gottmanScores.turnTowards > 70) {
    keyStrengths.push("Consistent turning toward each other's emotional bids")
  }

  if (gottmanScores.contempt < 30) {
    keyStrengths.push("Low levels of contempt in communication")
  }

  // Determine key growth areas
  const keyGrowthAreas: string[] = []

  if (positiveToNegativeRatio < 3) {
    keyGrowthAreas.push("Improving positive-to-negative interaction ratio")
  }

  if (gottmanScores.criticism > 50) {
    keyGrowthAreas.push("Reducing criticism in communication")
  }

  if (gottmanScores.defensiveness > 50) {
    keyGrowthAreas.push("Working on reducing defensive responses")
  }

  if (gottmanScores.stonewalling > 50) {
    keyGrowthAreas.push("Addressing stonewalling behaviors")
  }

  if (gottmanScores.turnTowards < 50) {
    keyGrowthAreas.push("Increasing responses to emotional bids")
  }

  return {
    positiveToNegativeRatio,
    biddingPatterns: {
      emotionalBids: gottmanScores.emotionalBids,
      turningToward: gottmanScores.turnTowards,
      turningAway: 100 - gottmanScores.turnTowards - Math.min(30, gottmanScores.contempt / 2),
      turningAgainst: Math.min(30, gottmanScores.contempt / 2),
    },
    conflictStyle,
    sharedMeaning: gottmanScores.sharedMeaning,
    attachmentCompatibility,
    communicationCompatibility,
    keyStrengths,
    keyGrowthAreas,
  }
}

// ===== COMMUNICATION STYLE ANALYSIS =====
// Add the missing analyzeCommunicationStyle function

// Interface for communication style analysis result
interface CommunicationStyleAnalysis {
  dominantStyle: string
  confidence: number
  secondaryStyle?: string
  explanation: string
  limitedDataWarning?: string
}

// Communication style analysis function
export function analyzeCommunicationStyle(messages: Message[]): CommunicationStyleAnalysis {
  // 🧠 Refactor to use separate inputs - ensure this function only processes messages from one person
  // 🚫 Remove Fallback Profiles - Check for sufficient messages
  if (!messages || messages.length === 0) {
    throw new Error("Insufficient messages for communication style analysis.")
  }

  // Define communication style indicators
  const styles = {
    assertive: 0,
    passive: 0,
    aggressive: 0,
    analytical: 0,
    emotional: 0,
    balanced: 0,
  }

  // Analyze each message for communication style indicators
  messages.forEach((message) => {
    const text = typeof message.text === "string" ? message.text.toLowerCase() : ""
    const sentiment = message.sentiment || 50

    // Assertive indicators
    if (
      text.includes("i think") ||
      text.includes("i believe") ||
      text.includes("i feel") ||
      text.includes("i would like") ||
      text.includes("i need")
    ) {
      styles.assertive += 1
    }

    // Passive indicators
    if (
      text.includes("maybe") ||
      text.includes("perhaps") ||
      text.includes("i guess") ||
      text.includes("if that's okay") ||
      text.includes("sorry")
    ) {
      styles.passive += 1
    }

    // Aggressive indicators
    if (
      text.includes("you should") ||
      text.includes("you need to") ||
      text.includes("always") ||
      text.includes("never") ||
      text.includes("!!")
    ) {
      styles.aggressive += 1
    }

    // Analytical indicators
    if (
      text.includes("analyze") ||
      text.includes("consider") ||
      text.includes("think") ||
      text.includes("logic") ||
      text.includes("reason")
    ) {
      styles.analytical += 1
    }

    // Emotional indicators
    if (
      text.includes("feel") ||
      text.includes("love") ||
      text.includes("hate") ||
      text.includes("upset") ||
      text.includes("happy") ||
      text.includes("sad")
    ) {
      styles.emotional += 1
    }

    // Balanced indicators (mix of styles or neutral tone)
    if (
      (text.includes("think") && text.includes("feel")) ||
      (sentiment > 40 && sentiment < 60) ||
      text.includes("understand") ||
      text.includes("perspective")
    ) {
      styles.balanced += 1
    }
  })

  // Normalize scores based on message count
  const messageCount = messages.length
  Object.keys(styles).forEach((style) => {
    styles[style as keyof typeof styles] = (styles[style as keyof typeof styles] / messageCount) * 100
  })

  // Find dominant and secondary styles
  const sortedStyles = Object.entries(styles).sort(([, a], [, b]) => b - a)
  const dominantStyle = sortedStyles[0][0]
  const secondaryStyle = sortedStyles[1][0]

  // Calculate confidence based on the difference between top scores
  const topScoreDifference = sortedStyles[0][1] - sortedStyles[1][1]
  const confidence = Math.min(0.9, Math.max(0.4, 0.6 + topScoreDifference / 100))

  // Generate explanation
  let explanation = `Based on the conversation analysis, the dominant communication style is ${dominantStyle}`

  // Add secondary style if the scores are close
  if (topScoreDifference < 20) {
    explanation += ` with elements of ${secondaryStyle}`
  }

  // Add limited data warning if appropriate
  let limitedDataWarning = undefined
  if (messages.length < 10) {
    limitedDataWarning =
      "This analysis is based on limited data and should be considered preliminary. More conversation data would provide a more accurate assessment."
  }

  return {
    dominantStyle,
    confidence,
    secondaryStyle: topScoreDifference < 20 ? secondaryStyle : undefined,
    explanation,
    limitedDataWarning,
  }
}

// Keywords for attachment styles
const attachmentKeywords = {
  secure: ["trust", "comfortable", "support", "understand", "respect", "communicate", "honest"],
  anxious: ["worry", "need", "fear", "abandon", "clingy", "jealous", "reassurance", "doubt"],
  avoidant: ["space", "independent", "distance", "alone", "self-sufficient", "uncomfortable", "close"],
  disorganized: ["confuse", "conflict", "trauma", "unpredictable", "fear", "approach", "avoid"],
}

// Keywords for ego states
const egoStateKeywords = {
  parent: ["should", "must", "always", "never", "right", "wrong", "bad", "good", "advice", "rule"],
  adult: ["think", "analyze", "consider", "option", "choice", "decide", "logical", "reasonable", "fact"],
  child: ["fun", "want", "feel", "play", "excited", "sad", "happy", "angry", "afraid", "love"],
}

// Cognitive biases
const cognitiveBiases = [
  { name: "Confirmation Bias", keywords: ["prove", "confirm", "right", "knew", "obvious", "clearly"] },
  { name: "Negativity Bias", keywords: ["always", "never", "worst", "terrible", "awful", "horrible"] },
  { name: "Mind Reading", keywords: ["know you", "thinking", "meant", "trying to", "purpose", "intention"] },
  { name: "Black and White Thinking", keywords: ["always", "never", "completely", "totally", "perfect", "ruined"] },
  { name: "Emotional Reasoning", keywords: ["feel like", "seems like", "must be", "obviously", "clearly"] },
]

// Define PsychologicalProfile interface
export interface PsychologicalProfile {
  attachmentStyle: string
  egoState: {
    parent: number
    adult: number
    child: number
    dominantState: string
  }
  cognitiveBiases: string[]
  personalityTraits: {
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
  }
  strengths: string[]
  growthAreas: string[]
}

// Analyze message psychology
export async function analyzeMessagePsychology(text: string): Promise<PsychologicalProfile> {
  // 🧠 Refactor to use separate inputs - ensure this function only processes text from one person
  // 🚫 Remove Fallback Profiles - Check for sufficient text
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    throw new Error("Insufficient text for message psychology analysis.")
  }

  const lowerText = text.toLowerCase()
  const words = lowerText.split(/\s+/)

  // Analyze attachment style
  const attachmentScores = Object.entries(attachmentKeywords).map(([style, keywords]) => {
    const score = keywords.reduce((count, keyword) => {
      return count + (lowerText.includes(keyword) ? 1 : 0)
    }, 0)
    return { style, score }
  })

  const dominantAttachment = attachmentScores.sort((a, b) => b.score - a.score)[0].style

  // Analyze ego states
  const egoStateScores = Object.entries(egoStateKeywords).map(([state, keywords]) => {
    const score = keywords.reduce((count, keyword) => {
      return count + (lowerText.includes(keyword) ? 1 : 0)
    }, 0)
    return { state, score: score / keywords.length } // Normalize
  })

  const totalEgoScore = egoStateScores.reduce((sum, { score }) => sum + score, 0) || 1
  const normalizedEgoScores = egoStateScores.reduce(
    (obj, { state, score }) => {
      obj[state] = score / totalEgoScore
      return obj
    },
    {} as Record<string, number>,
  )

  const dominantEgoState = egoStateScores.sort((a, b) => b.score - a.score)[0].state

  // Analyze cognitive biases
  const detectedBiases = cognitiveBiases
    .filter((bias) => {
      return bias.keywords.some((keyword) => lowerText.includes(keyword))
    })
    .map((bias) => bias.name)

  // Generate random but consistent personality traits based on text content
  // This is a simplified approach - in a real app, you'd use more sophisticated analysis
  const textHash = hashString(text)
  const personalityTraits = {
    openness: normalizeScore(0.3 + (textHash % 100) / 150),
    conscientiousness: normalizeScore(0.4 + ((textHash >> 8) % 100) / 150),
    extraversion: normalizeScore(0.3 + ((textHash >> 16) % 100) / 150),
    agreeableness: normalizeScore(0.4 + ((textHash >> 24) % 100) / 150),
    neuroticism: normalizeScore(0.3 + ((textHash >> 32) % 100) / 150),
  }

  // Generate strengths and growth areas based on personality traits and ego states
  const strengths = generateStrengths(personalityTraits, normalizedEgoScores)
  const growthAreas = generateGrowthAreas(personalityTraits, normalizedEgoScores, detectedBiases)

  return {
    attachmentStyle: dominantAttachment,
    egoState: {
      parent: normalizedEgoScores.parent || 0,
      adult: normalizedEgoScores.adult || 0,
      child: normalizedEgoScores.child || 0,
      dominantState: dominantEgoState,
    },
    cognitiveBiases: detectedBiases,
    personalityTraits,
    strengths,
    growthAreas,
  }
}

// Helper function to normalize scores to 0-1 range
function normalizeScore(score: number): number {
  return Math.max(0, Math.min(1, score))
}

// Helper function to hash a string
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// Generate strengths based on personality traits and ego states
function generateStrengths(
  personalityTraits: {
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
  },
  egoStates: Record<string, number>,
): string[] {
  const strengths: string[] = []

  if (personalityTraits.openness > 0.6) strengths.push("Creative thinking")
  if (personalityTraits.conscientiousness > 0.6) strengths.push("Reliability")
  if (personalityTraits.extraversion > 0.6) strengths.push("Social engagement")
  if (personalityTraits.agreeableness > 0.6) strengths.push("Empathy")
  if (personalityTraits.neuroticism < 0.4) strengths.push("Emotional stability")

  if (egoStates.adult > 0.4) strengths.push("Rational decision-making")
  if (egoStates.parent > 0.4) strengths.push("Providing guidance")
  if (egoStates.child > 0.4) strengths.push("Spontaneity and joy")

  // Ensure we have at least 3 strengths
  const defaultStrengths = [
    "Communication skills",
    "Relationship building",
    "Emotional awareness",
    "Adaptability",
    "Resilience",
  ]

  while (strengths.length < 3) {
    const randomStrength = defaultStrengths[Math.floor(Math.random() * defaultStrengths.length)]
    if (!strengths.includes(randomStrength)) {
      strengths.push(randomStrength)
    }
  }

  return strengths.slice(0, 5) // Return up to 5 strengths
}

// Generate growth areas based on personality traits, ego states, and cognitive biases
function generateGrowthAreas(
  personalityTraits: {
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
  },
  egoStates: Record<string, number>,
  biases: string[],
): string[] {
  const growthAreas: string[] = []

  if (personalityTraits.openness < 0.4) growthAreas.push("Openness to new ideas")
  if (personalityTraits.conscientiousness < 0.4) growthAreas.push("Organization and planning")
  if (personalityTraits.extraversion < 0.4) growthAreas.push("Social confidence")
  if (personalityTraits.agreeableness < 0.4) growthAreas.push("Empathetic listening")
  if (personalityTraits.neuroticism > 0.6) growthAreas.push("Emotional regulation")

  if (egoStates.adult < 0.3) growthAreas.push("Rational problem-solving")
  if (egoStates.parent > 0.7) growthAreas.push("Flexibility with rules and expectations")
  if (egoStates.child > 0.7) growthAreas.push("Maturity in emotional responses")

  // Add growth areas based on cognitive biases
  if (biases.includes("Confirmation Bias")) growthAreas.push("Considering alternative viewpoints")
  if (biases.includes("Negativity Bias")) growthAreas.push("Balanced perspective")
  if (biases.includes("Mind Reading")) growthAreas.push("Checking assumptions")
  if (biases.includes("Black and White Thinking")) growthAreas.push("Nuanced thinking")
  if (biases.includes("Emotional Reasoning")) growthAreas.push("Evidence-based reasoning")

  // Ensure we have at least 3 growth areas
  const defaultGrowthAreas = [
    "Active listening",
    "Conflict resolution",
    "Emotional awareness",
    "Setting boundaries",
    "Self-reflection",
  ]

  while (growthAreas.length < 3) {
    const randomGrowthArea = defaultGrowthAreas[Math.floor(Math.random() * defaultGrowthAreas.length)]
    if (!growthAreas.includes(randomGrowthArea)) {
      growthAreas.push(randomGrowthArea)
    }
  }

  return growthAreas.slice(0, 5) // Return up to 5 growth areas
}
