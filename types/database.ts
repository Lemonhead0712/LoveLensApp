export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface AnalysisResult {
  id: string
  user_id: string
  title: string
  analysis_data: any
  created_at: string
  updated_at: string
}

export interface CheckIn {
  id: string
  user_id: string
  mood: string
  note: string
  created_at: string
  updated_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface Analysis {
  id: string
  user_id: string
  ocr_complete: boolean
  created_at: string
  completed_at?: string
  error_message?: string
  status: string
  result?: string
}
