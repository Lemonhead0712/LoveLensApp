const STORAGE_KEY = "lovelens_results"
const MAX_RESULTS = 10
const EXPIRY_TIME = 7 * 24 * 60 * 60 * 1000 // 7 days

interface StoredResult {
  id: string
  analysis: any
  timestamp: number
}

export function saveResults(analysis: any): string {
  if (typeof window === "undefined") {
    console.error("saveResults called on server side")
    return ""
  }

  try {
    const id = `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const result: StoredResult = {
      id,
      analysis,
      timestamp: Date.now(),
    }

    // Get existing results
    const existing = getStoredResults()

    // Remove expired results
    const validResults = existing.filter((r) => Date.now() - r.timestamp < EXPIRY_TIME)

    // Add new result at the beginning
    validResults.unshift(result)

    // Keep only MAX_RESULTS
    const toStore = validResults.slice(0, MAX_RESULTS)

    // Store
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))

    console.log("Results saved successfully with ID:", id)
    return id
  } catch (error) {
    console.error("Error saving results:", error)
    throw new Error("Failed to store results")
  }
}

export function getResults(id: string): any | null {
  if (typeof window === "undefined") return null

  try {
    const results = getStoredResults()
    const result = results.find((r) => r.id === id)

    if (!result) return null

    // Check if expired
    if (Date.now() - result.timestamp > EXPIRY_TIME) {
      return null
    }

    return result.analysis
  } catch (error) {
    console.error("Error getting results:", error)
    return null
  }
}

export function getAllResults(): StoredResult[] {
  if (typeof window === "undefined") return []

  try {
    const results = getStoredResults()
    // Filter out expired results
    return results.filter((r) => Date.now() - r.timestamp < EXPIRY_TIME)
  } catch (error) {
    console.error("Error getting all results:", error)
    return []
  }
}

export function deleteResult(id: string): boolean {
  if (typeof window === "undefined") return false

  try {
    const results = getStoredResults()
    const filtered = results.filter((r) => r.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error("Error deleting result:", error)
    return false
  }
}

export function clearAllResults(): boolean {
  if (typeof window === "undefined") return false

  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.error("Error clearing results:", error)
    return false
  }
}

function getStoredResults(): StoredResult[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch (error) {
    console.error("Error parsing stored results:", error)
    return []
  }
}

// Alias for backwards compatibility
export const storeResults = saveResults
