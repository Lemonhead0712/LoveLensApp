export function saveResults(analysis: any): string {
  try {
    const resultId = `result_${Date.now()}_${Math.random().toString(36).substring(7)}`

    if (typeof window !== "undefined") {
      localStorage.setItem(resultId, JSON.stringify(analysis))
      localStorage.setItem("latestResultId", resultId)
      console.log("Results saved to localStorage with ID:", resultId)
    }

    return resultId
  } catch (error) {
    console.error("Error saving results:", error)
    throw new Error("Failed to save analysis results")
  }
}

export function storeResults(analysis: any): string {
  return saveResults(analysis)
}

export function getResults(resultId?: string): any {
  try {
    if (typeof window === "undefined") {
      return null
    }

    const id = resultId || localStorage.getItem("latestResultId")

    if (!id) {
      console.log("No result ID provided or found")
      return null
    }

    const data = localStorage.getItem(id)

    if (!data) {
      console.log("No data found for result ID:", id)
      return null
    }

    return JSON.parse(data)
  } catch (error) {
    console.error("Error retrieving results:", error)
    return null
  }
}

export function getLatestResults(): any {
  return getResults()
}

export function clearResults(resultId?: string): void {
  try {
    if (typeof window === "undefined") {
      return
    }

    if (resultId) {
      localStorage.removeItem(resultId)
    } else {
      const latestId = localStorage.getItem("latestResultId")
      if (latestId) {
        localStorage.removeItem(latestId)
      }
      localStorage.removeItem("latestResultId")
    }
  } catch (error) {
    console.error("Error clearing results:", error)
  }
}
