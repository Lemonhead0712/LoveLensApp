// Helper functions for data storage and retrieval

/**
 * Generate a unique ID for analysis results
 * @returns A unique ID string
 */
export function generateResultId(): string {
  // Generate a random ID with timestamp to ensure uniqueness
  const timestamp = new Date().getTime()
  const random = Math.floor(Math.random() * 1000000)
  return `${timestamp}-${random}`
}

/**
 * Save analysis results to localStorage with a specific ID
 * @param results The analysis results to save
 * @param id Optional ID to use for storage (will generate one if not provided)
 * @returns Boolean indicating success
 */
export async function saveAnalysisResults(results: any, id?: string): Promise<boolean> {
  try {
    // Use provided ID or generate a new one
    const resultId = id || generateResultId()

    // Add the ID to the results object if not already present
    if (!results.id) {
      results.id = resultId
    }

    // Serialize the results
    const serializedResults = JSON.stringify(results)

    // Save to localStorage with the ID as key
    localStorage.setItem(`analysisResults_${resultId}`, serializedResults)

    // Also save the ID in a list of all analysis IDs for retrieval
    const existingIds = getAnalysisIds()
    if (!existingIds.includes(resultId)) {
      existingIds.push(resultId)
      localStorage.setItem("analysisResultIds", JSON.stringify(existingIds))
    }

    // Set a timestamp for debugging
    localStorage.setItem(`analysisResultsTimestamp_${resultId}`, new Date().toISOString())

    console.log(`Analysis results saved successfully with ID: ${resultId}`)
    return true
  } catch (error) {
    console.error("Failed to save analysis results:", error)
    return false
  }
}

/**
 * Get all analysis result IDs
 * @returns Array of analysis result IDs
 */
export function getAnalysisIds(): string[] {
  try {
    const idsJson = localStorage.getItem("analysisResultIds")
    return idsJson ? JSON.parse(idsJson) : []
  } catch (error) {
    console.error("Failed to get analysis IDs:", error)
    return []
  }
}

/**
 * Get analysis results from localStorage by ID
 * @param id The ID of the analysis results to retrieve
 * @returns The analysis results or null if not found
 */
export function getAnalysisResults(id?: string | null): any | null {
  try {
    // If no ID is provided, try to get the most recent analysis
    if (!id) {
      const ids = getAnalysisIds()
      if (ids.length === 0) {
        console.log("No analysis results found in localStorage")
        return null
      }
      // Use the most recent ID (last in the array)
      id = ids[ids.length - 1]
    }

    // Get the results with the ID
    const serializedResults = localStorage.getItem(`analysisResults_${id}`)
    if (!serializedResults) {
      console.log(`No analysis results found for ID: ${id}`)
      return null
    }

    const results = JSON.parse(serializedResults)

    // Ensure the ID is included in the results
    if (!results.id) {
      results.id = id
    }

    return results
  } catch (error) {
    console.error("Failed to get analysis results:", error)
    return null
  }
}

/**
 * Check if analysis results exist for a specific ID
 * @param id The ID to check
 * @returns True if analysis results exist
 */
export function hasAnalysisResults(id?: string): boolean {
  if (!id) {
    return getAnalysisIds().length > 0
  }
  return !!localStorage.getItem(`analysisResults_${id}`)
}

/**
 * Clear analysis results from localStorage
 * @param id Optional ID to clear specific results (clears all if not provided)
 */
export function clearAnalysisResults(id?: string): void {
  if (id) {
    // Clear specific analysis
    localStorage.removeItem(`analysisResults_${id}`)
    localStorage.removeItem(`analysisResultsTimestamp_${id}`)

    // Update the IDs list
    const ids = getAnalysisIds().filter((existingId) => existingId !== id)
    localStorage.setItem("analysisResultIds", JSON.stringify(ids))
  } else {
    // Clear all analyses
    const ids = getAnalysisIds()
    ids.forEach((existingId) => {
      localStorage.removeItem(`analysisResults_${existingId}`)
      localStorage.removeItem(`analysisResultsTimestamp_${existingId}`)
    })
    localStorage.removeItem("analysisResultIds")
  }
}
