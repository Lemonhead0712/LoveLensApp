export interface Message {
  id: string
  text: string
  timestamp: string
  sender: string
  sentiment?: number
  status: "sent" | "delivered" | "read"
}

export interface EmotionalBreakdown {
  empathy: number
  selfAwareness: number
  socialSkills: number
  emotionalRegulation: number
  motivation: number
  adaptability: number
}

export interface CommunicationStyle {
  primary: string
  secondary: string | null
  uniqueTraits: string[]
  preferredApproaches: string[]
  contextualAdaptations: string[]
}

export interface PersonalizedInsights {
  communicationStrengths: string[]
  growthAreas: string[]
  recurringThemes: string[]
  uniqueCharacteristics: string[]
}

export interface Participant {
  name: string
  emotionalIntelligence: number
  communicationStyle: string
  isFirstPerson: boolean
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

export interface Person {
  name: string
}

export interface AnalysisResults {
  id?: string
  participants: Participant[]
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
  categoryScores?: CategoryScores
  fallbackOccurred?: boolean
  fallbackReason?: string
  fallbackDetails?: {
    sentiment: boolean
    profiles: boolean
    dynamics: boolean
  }
  negativeInsights?: NegativeInsights
}

export interface CategoryScores {
  emotionalIntelligence: number
  communicationStyles: number
  compatibility: number
  psychology: number
  relationshipDynamics: number
}

export interface NegativeInsights {
  patterns: {
    criticism: {
      percentage: number
      examples: string[]
      description: string
    }
    contempt: {
      percentage: number
      examples: string[]
      description: string
    }
    defensiveness: {
      percentage: number
      examples: string[]
      description: string
    }
    stonewalling: {
      percentage: number
      examples: string[]
      description: string
    }
  }
  primaryPattern: string | null
  secondaryPattern: string | null
  personInsights: {
    [personName: string]: {
      primaryPattern: string | null
      suggestions: string[]
    }
  }
}
