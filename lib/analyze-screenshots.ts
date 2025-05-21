// Export the analyzeText function that's missing
export function analyzeText(text: string): { sentiment: number; keywords: string[] } {
  // Simple implementation to analyze text sentiment and extract keywords
  const sentiment =
    text.toLowerCase().includes("love") || text.toLowerCase().includes("happy")
      ? 0.8
      : text.toLowerCase().includes("sad") || text.toLowerCase().includes("angry")
        ? -0.5
        : 0

  // Extract simple keywords
  const keywords = text
    .split(/\s+/)
    .filter((word) => word.length > 4)
    .filter((word) => !["about", "there", "their", "would", "could", "should"].includes(word.toLowerCase()))
    .slice(0, 5)

  return { sentiment, keywords }
}

interface AnalyzeOptions {
  debug?: boolean
  collectDebugInfo?: boolean
}

// Main function to analyze screenshots
/**
 * Analyzes conversation screenshots to extract messages and perform sentiment analysis
 *
 * @param
