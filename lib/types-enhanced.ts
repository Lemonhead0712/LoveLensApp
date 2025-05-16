// Message interface
export interface Message {
  sender: string
  content: string
  timestamp?: string
}

// Category scores interface
export interface CategoryScores {
  criticism: number
  defensiveness: number
  contempt: number
  stonewalling: number
  emotional_awareness: number
  repair_attempts: number
  positive_communication: number
}

// Negative insights interface
export interface NegativeInsights {
  criticism_examples: string[]
  defensiveness_examples: string[]
  contempt_examples: string[]
  stonewalling_examples: string[]
}

// Sentiment analysis interface
export interface SentimentAnalysis {
  scores: CategoryScores
  negative_insights: NegativeInsights
  summary: string
}

// Analysis metadata interface
export interface AnalysisMetadata {
  analysis_method: "ai" | "rule-based"
  confidence_level: number
  attachment_confidence?: number
  communication_confidence?: number
  limited_data_warning?: string
  fallback_reason?: string
}

// Analysis result interface
export interface AnalysisResult {
  messages: Message[]
  sentiment: SentimentAnalysis
  attachment_style: string
  communication_style: string
  category_scores: CategoryScores
  metadata?: AnalysisMetadata
}

// Error types
export type ErrorType =
  | "api_key_missing"
  | "upload_failed"
  | "analysis_failed"
  | "ocr_failed"
  | "storage_failed"
  | "unknown"

// Error details interface
export interface ErrorDetails {
  type: ErrorType
  message: string
  recoverable: boolean
  action?: string
}
