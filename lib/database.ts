import { getSupabaseBrowserClient } from "./supabase"
import type { AnalysisResult, UserProfile } from "@/types/database"

// User profile functions
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching user profile:", error)
    return null
  }

  return data
}

export async function updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile | null> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...profile,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    console.error("Error updating user profile:", error)
    return null
  }

  return data
}

// Analysis results functions
export async function getAnalysisResults(userId: string): Promise<AnalysisResult[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("analysis_results")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching analysis results:", error)
    return []
  }

  return data || []
}

export async function getAnalysisResult(id: string): Promise<AnalysisResult | null> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.from("analysis_results").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching analysis result:", error)
    return null
  }

  return data
}

export async function saveAnalysisResult(
  userId: string,
  title: string,
  analysisData: any,
): Promise<AnalysisResult | null> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("analysis_results")
    .insert({
      user_id: userId,
      title,
      analysis_data: analysisData,
    })
    .select()
    .single()

  if (error) {
    console.error("Error saving analysis result:", error)
    return null
  }

  return data
}

export async function deleteAnalysisResult(id: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.from("analysis_results").delete().eq("id", id)

  if (error) {
    console.error("Error deleting analysis result:", error)
    return false
  }

  return true
}

// Check-ins functions
export async function getCheckIns(userId: string) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("check_ins")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching check-ins:", error)
    return []
  }

  return data || []
}

export async function saveCheckIn(userId: string, mood: string, note: string) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("check_ins")
    .insert({
      user_id: userId,
      mood,
      note,
    })
    .select()
    .single()

  if (error) {
    console.error("Error saving check-in:", error)
    return null
  }

  return data
}

// Journal entries functions
export async function getJournalEntries(userId: string) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching journal entries:", error)
    return []
  }

  return data || []
}

export async function saveJournalEntry(userId: string, content: string) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from("journal_entries")
    .insert({
      user_id: userId,
      content,
    })
    .select()
    .single()

  if (error) {
    console.error("Error saving journal entry:", error)
    return null
  }

  return data
}
