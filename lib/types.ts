export interface Message {
  id: string
  text: string
  timestamp?: string
  sender?: string
  position?: "left" | "right" // Add position property
  confidence?: number // Add confidence score for OCR quality
  bbox?: { x0: number; y0: number; x1: number; y1: number } // Store bounding box for debugging
}

export interface OcrResult {
  text: string
  confidence: number
  bbox: {
    x0: number
    y0: number
    x1: number
    y1: number
  }
  imageWidth?: number // Add image width for position detection
  imageHeight?: number // Add image height for completeness
}

// Add a new interface for OCR processing results
export interface OcrProcessingResult {
  success: boolean
  messages: Message[]
  text?: string
  words?: any[]
  confidence?: number
  error?: string
  imageWidth?: number
  imageHeight?: number
  debugInfo?: any
}

// Add a new interface for positioned text blocks
export interface PositionedTextBlock {
  text: string
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
  position: "left" | "right"
  confidence: number
  sender?: string
}

// Sentiment analysis result
export interface SentimentResult {
  score: number
  comparative: number
  tokens: string[]
  words: string[]
  positive: string[]
  negative: string[]
}

// Communication style result
export interface CommunicationStyleResult {
  assertiveness: number
  responsiveness: number
  emotionalExpressiveness: number
  clarity: number
  dominantStyle: string
  secondaryStyle: string
}

// Psychological profile
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

// Emotional intelligence result
export interface EmotionalIntelligenceResult {
  selfAwareness: number
  selfRegulation: number
  motivation: number
  empathy: number
  socialSkills: number
  overallScore: number
}

// Person data
export interface PersonData {
  messages: Message[]
  sentimentResults: SentimentResult[]
  communicationStyle: CommunicationStyleResult
  psychologicalProfile: PsychologicalProfile
  emotionalIntelligence: EmotionalIntelligenceResult
}

// Conversation data
export interface ConversationData {
  personA: {
    name: string
    communicationStyle: string
    emotionalIntelligence: {
      empathy: number
      selfAwareness: number
      socialSkills: number
      emotionalRegulation: number
      motivation: number
      adaptability: number
    }
    psychologicalProfile: {
      attachmentStyle: {
        primaryStyle: string
        secondaryStyle?: string | null
      }
      transactionalAnalysis: {
        dominantEgoState: string
      }
    }
    sentiment: number
    insights: string[]
    recommendations: string[]
  }
  personB: {
    name: string
    communicationStyle: string
    emotionalIntelligence: {
      empathy: number
      selfAwareness: number
      socialSkills: number
      emotionalRegulation: number
      motivation: number
      adaptability: number
    }
    psychologicalProfile: {
      attachmentStyle: {
        primaryStyle: string
        secondaryStyle?: string | null
      }
      transactionalAnalysis: {
        dominantEgoState: string
      }
    }
    sentiment: number
    insights: string[]
    recommendations: string[]
  }
}

// Analysis result
export interface AnalysisResult {
  id: string
  timestamp: string
  conversationData: ConversationData
  compatibility: {
    finalScore: number
    attachment: number
    communication: number
    emotionalSync: number
    gottmanScores: {
      criticism: number
      contempt: number
      defensiveness: number
      stonewalling: number
      partnerCriticism?: number
      partnerContempt?: number
      partnerDefensiveness?: number
      partnerStonewalling?: number
      positiveNegativeRatio?: number
    }
    gottmanSummary: string
  }
  messagesWithSentiment: Message[]
  validationWarnings?: string[]
}

export interface ExtractedConversation {
  messages: Message[]
  imageMetadata?: {
    width: number
    height: number
  }
}
