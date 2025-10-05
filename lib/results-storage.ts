// Utility for storing and retrieving analysis results
// Using sessionStorage for temporary client-side storage

export interface AnalysisResults {
  [key: string]: any
}

export function storeResults(results: AnalysisResults): string {
  if (typeof window === "undefined") return ""

  const resultId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

  try {
    sessionStorage.setItem(`love-lens-results-${resultId}`, JSON.stringify(results))
    return resultId
  } catch (error) {
    console.error("Error storing results:", error)
    return ""
  }
}

// Add saveResults as an alias for storeResults for backward compatibility
export const saveResults = storeResults

export function getResults(resultId: string): AnalysisResults | null {
  if (typeof window === "undefined") return null

  try {
    const stored = sessionStorage.getItem(`love-lens-results-${resultId}`)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("Error retrieving results:", error)
  }

  return null
}

export function clearResults(resultId: string): void {
  if (typeof window === "undefined") return

  try {
    sessionStorage.removeItem(`love-lens-results-${resultId}`)
  } catch (error) {
    console.error("Error clearing results:", error)
  }
}
