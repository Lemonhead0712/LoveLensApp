export interface Message {
  sender: string
  content: string
  timestamp: string
  sentiment?: number
  [key: string]: any
}

export interface CategoryScores {
  criticism: number
  defensiveness: number
  contempt: number
  stonewalling: number
  emotional_awareness: number
  repair_attempts: number
  positive_communication: number
  [key: string]: number
}

export interface NegativeInsights {
  criticism_examples: string[]
  defensiveness_examples: string[]
  contempt_examples: string[]
  stonewalling_examples: string[]
}

export interface SentimentAnalysis {
  scores: CategoryScores
  negative_insights: NegativeInsights
  summary: string
}

export interface AnalysisResults {
  participants: {
    name: string
    emotionalIntelligence: number
    communicationStyle: string
    isFirstPerson: boolean
  }[]
  messageCount: number
  overallScore: number
  finalCompatibilityScore?: number
  emotionalBreakdown: EmotionalBreakdown
  secondPersonEmotionalBreakdown: EmotionalBreakdown
  gottmanScores: GottmanScores
  insights: string[]
  recommendations: string[]
  gottmanSummary: string
  gottmanRecommendations: string[]
  conversationTimeline: ConversationTimelinePoint[]
  keyMoments: KeyMoment[]
  messages: Message[]
  firstPersonProfile: any
  secondPersonProfile: any
  relationshipDynamics: RelationshipDynamics
  analysisMethod: string
  fallbackOccurred: boolean
  fallbackReason: string
  fallbackDetails: {
    sentiment: boolean
    profiles: boolean
    dynamics: boolean
  }
  negativeInsights: any
  id: string
}

export interface EmotionalBreakdown {
  empathy: number
  selfAwareness: number
  socialSkills: number
  emotionalRegulation: number
  motivation: number
  adaptability: number
}

export interface GottmanScores {
  criticism: number
  contempt: number
  defensiveness: number
  stonewalling: number
  emotionalBids: number
  turnTowards: number
  repairAttempts: number
  sharedMeaning: number
}

export interface ConversationTimelinePoint {
  participant: string
  timestamp: string
  sentiment: number
}

export interface KeyMoment {
  title: string
  description: string
  timestamp: string
  messageText: string
  sender: string
  sentiment?: number
}

export interface Person {
  name: string
}

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

export type AnalysisResult = AnalysisResults
export type RelationshipDynamics = RelationshipDynamics
