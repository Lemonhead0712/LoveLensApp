import type { AnalysisResult } from "./types"

// Key for storing analysis results in localStorage
const STORAGE_KEY = "lovelens_analysis_results"

// Generate a unique ID for analysis results
export function generateResultId(): string {
  return `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Save analysis results to localStorage
export async function saveAnalysisResults(results: AnalysisResult, resultId?: string): Promise<boolean> {
  try {
    // Use provided ID or generate a new one
    const id = resultId || generateResultId()

    // Add ID to results if not already present
    if (!results.id) {
      results.id = id
    }

    // Get existing results
    const existingResults = await getStoredAnalysisResults()

    // Add new results
    existingResults[id] = {
      ...results,
      timestamp: new Date().toISOString(),
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingResults))

    // Also save in the old format for backward compatibility
    localStorage.setItem(`analysisResults_${id}`, JSON.stringify(results))

    // Update the IDs list for backward compatibility
    const existingIds = getAnalysisIds()
    if (!existingIds.includes(id)) {
      existingIds.push(id)
      localStorage.setItem("analysisResultIds", JSON.stringify(existingIds))
    }

    return true
  } catch (error) {
    console.error("Error saving analysis results:", error)
    return false
  }
}

// Alias for saveAnalysisResults to maintain backward compatibility
export const storeAnalysisResult = saveAnalysisResults

// Get all stored analysis results
export async function getStoredAnalysisResults(): Promise<Record<string, AnalysisResult>> {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY)

    if (!storedData) {
      return {}
    }

    return JSON.parse(storedData)
  } catch (error) {
    console.error("Error retrieving stored analysis results:", error)
    return {}
  }
}

// Get a specific analysis result by ID
export async function getAnalysisResultById(id: string): Promise<AnalysisResult | null> {
  try {
    const allResults = await getStoredAnalysisResults()

    return allResults[id] || null
  } catch (error) {
    console.error(`Error retrieving analysis result with ID ${id}:`, error)
    return null
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

    // First try the new storage format
    const allResults = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
    if (allResults[id]) {
      return allResults[id]
    }

    // If not found, try the old format
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
 * Get all analysis result IDs
 * @returns Array of analysis result IDs
 */
export function getAnalysisIds(): string[] {
  try {
    // First try to get IDs from the new storage format
    const allResults = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
    const newFormatIds = Object.keys(allResults)

    // Then get IDs from the old format
    const idsJson = localStorage.getItem("analysisResultIds")
    const oldFormatIds = idsJson ? JSON.parse(idsJson) : []

    // Combine and deduplicate IDs
    const allIds = [...new Set([...newFormatIds, ...oldFormatIds])]

    return allIds
  } catch (error) {
    console.error("Failed to get analysis IDs:", error)
    return []
  }
}

// Delete a specific analysis result by ID
export async function deleteAnalysisResult(id: string): Promise<boolean> {
  try {
    // Delete from new format
    const allResults = await getStoredAnalysisResults()
    if (allResults[id]) {
      delete allResults[id]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allResults))
    }

    // Delete from old format
    localStorage.removeItem(`analysisResults_${id}`)
    localStorage.removeItem(`analysisResultsTimestamp_${id}`)

    // Update the IDs list for old format
    const ids = getAnalysisIds().filter((existingId) => existingId !== id)
    localStorage.setItem("analysisResultIds", JSON.stringify(ids))

    return true
  } catch (error) {
    console.error(`Error deleting analysis result with ID ${id}:`, error)
    return false
  }
}

// Clear all stored analysis results
export async function clearAllAnalysisResults(): Promise<boolean> {
  try {
    // Clear new format
    localStorage.removeItem(STORAGE_KEY)

    // Clear old format
    const ids = getAnalysisIds()
    ids.forEach((id) => {
      localStorage.removeItem(`analysisResults_${id}`)
      localStorage.removeItem(`analysisResultsTimestamp_${id}`)
    })
    localStorage.removeItem("analysisResultIds")

    return true
  } catch (error) {
    console.error("Error clearing all analysis results:", error)
    return false
  }
}
