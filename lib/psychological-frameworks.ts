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

interface AttachmentIndicators {
  secureIndicators: number
  anxiousIndicators: number
  avoidantIndicators: number
  disorganizedIndicators: number
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
  if (!messages || messages.length === 0) {
    return {
      primaryStyle: AttachmentStyle.Secure,
      confidence: 0.3,
      explanation: "Based on the limited conversation data available.",
      limitedDataWarning: "This analysis is based on very limited data and should be considered preliminary.",
    }
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
    const lowerContent = message.text.toLowerCase()

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
  // Filter messages by participants
  const p1Messages = messages.filter((msg) => msg.sender === participant1)
  const p2Messages = messages.filter((msg) => msg.sender === participant2)

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

function analyzeEgoStates(messages: any[]): TAAnalysis {
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
    const text = message.text.toLowerCase()
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

      const prevText = messages[i - 1].text.toLowerCase()
      const currText = messages[i].text.toLowerCase()
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

  totalTransactions = Math.max(1, totalTransactions)

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
  return {
    cognitiveComplexity: calculateCognitiveComplexity(messages),
    emotionalExpressiveness: calculateEmotionalExpressiveness(messages),
    socialEngagement: calculateSocialEngagement(messages),
    dominantEmotions: identifyDominantEmotions(messages),
  }
}

// Helper functions for linguistic analysis
function calculateCognitiveComplexity(messages: Message[]): number {
  // Implement cognitive complexity calculation
  return 70 // Placeholder
}

function calculateEmotionalExpressiveness(messages: Message[]): number {
  // Implement emotional expressiveness calculation
  return 65 // Placeholder
}

function calculateSocialEngagement(messages: Message[]): number {
  // Implement social engagement calculation
  return 75 // Placeholder
}

function calculatePsychologicalDistancing(messages: Message[]): number {
  // Implement psychological distancing calculation
  return 50 // Placeholder
}

function calculateCertaintyLevel(messages: Message[]): number {
  // Implement certainty level calculation
  return 50 // Placeholder
}

function identifyDominantEmotions(messages: Message[]): string[] {
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
  return {
    distortions: identifyCognitiveDistortions(messages),
    healthyPatterns: identifyHealthyPatterns(messages),
    overallBalance: calculateCognitiveBalance(messages),
  }
}

// Helper functions for cognitive analysis
function identifyCognitiveDistortions(messages: Message[]): any[] {
  // Implement cognitive distortions identification
  return [] // Placeholder
}

function identifyHealthyPatterns(messages: Message[]): any[] {
  // Implement healthy patterns identification
  return [
    { type: "Balanced Perspective", frequency: 0.8 },
    { type: "Evidence-Based Thinking", frequency: 0.7 },
  ] // Placeholder
}

function calculateCognitiveBalance(messages: Message[]): number {
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
  // Filter messages to only include those from the specified person
  const personMessages = messages.filter((msg) => msg.sender === personName)

  // Analyze attachment style based on person's messages only
  const attachmentStyle = analyzeAttachmentStyle(personMessages)

  // Analyze linguistic markers based on person's messages only
  const linguisticMarkers = analyzeLinguisticMarkers(personMessages)

  // Analyze cognitive patterns based on person's messages only
  const cognitivePatterns = analyzeCognitivePatterns(personMessages)

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
      dominantEgoState: determineDominantEgoState(personMessages),
      egoStateDistribution: calculateEgoStateDistribution(personMessages),
    },
    communicationStrengths: identifyCommunicationStrengths(personMessages),
    growthAreas: identifyGrowthAreas(personMessages),
  }
}

// Helper function to determine dominant ego state based on individual messages
function determineDominantEgoState(messages: Message[]): string {
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
  return (
    text.toLowerCase().includes("understand") ||
    text.toLowerCase().includes("feel") ||
    text.toLowerCase().includes("sorry")
  )
}

function showsAssertiveness(text: string): boolean {
  // Implement assertiveness detection logic
  return (
    text.toLowerCase().includes("i think") ||
    text.toLowerCase().includes("i feel") ||
    text.toLowerCase().includes("i need")
  )
}

function showsDefensiveness(text: string): boolean {
  // Implement defensiveness detection logic
  return (
    text.toLowerCase().includes("but") ||
    text.toLowerCase().includes("however") ||
    text.toLowerCase().includes("actually")
  )
}

function showsPassivity(text: string): boolean {
  // Implement passivity detection logic
  return (
    text.toLowerCase().includes("maybe") ||
    text.toLowerCase().includes("perhaps") ||
    text.toLowerCase().includes("i guess")
  )
}

function hasUnclearCommunication(text: string): boolean {
  // Implement unclear communication detection logic
  return text.includes("...") || text.includes("??") || text.length < 5
}

function analyzeEgoState(text: string): string {
  // Implement ego state analysis logic
  if (text.toLowerCase().includes("should") || text.toLowerCase().includes("must")) {
    return "parent"
  } else if (text.toLowerCase().includes("i feel") || text.toLowerCase().includes("i want")) {
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
  // Get individual profiles
  const profile1 = generatePsychologicalProfile(messages, participant1)
  const profile2 = generatePsychologicalProfile(messages, participant2)

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
  // Handle edge case: very short conversations
  if (!messages || messages.length < 5) {
    return {
      dominantStyle: "balanced",
      confidence: 0.3,
      explanation: "Based on the limited conversation data available.",
      limitedDataWarning:
        "This analysis is based on very limited data and should be considered preliminary. More conversation data would provide a more accurate assessment.",
    }
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
    const text = message.text.toLowerCase()
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
