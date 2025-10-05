export interface StoredResults {
  timestamp: number
  results: any
}

export function saveResults(results: any): void {
  try {
    const stored: StoredResults = {
      timestamp: Date.now(),
      results,
    }
    sessionStorage.setItem("love-lens-results", JSON.stringify(stored))
    console.log("Results saved successfully")
  } catch (error) {
    console.error("Error saving results:", error)
    throw new Error("Failed to save results")
  }
}

export function getResults(): any | null {
  try {
    const stored = sessionStorage.getItem("love-lens-results")
    if (!stored) return null

    const parsed: StoredResults = JSON.parse(stored)
    return parsed.results
  } catch (error) {
    console.error("Error retrieving results:", error)
    return null
  }
}

export function clearResults(): void {
  try {
    sessionStorage.removeItem("love-lens-results")
    console.log("Results cleared successfully")
  } catch (error) {
    console.error("Error clearing results:", error)
  }
}
