/**
 * Ensures that emotional intelligence data has all required fields
 * @param data The emotional intelligence data to validate
 * @returns Validated data with default values for missing fields
 */
export function ensureValidEmotionalIntelligenceData(data: any): any {
  // Default values for emotional intelligence metrics
  const defaultValues = {
    empathy: 50,
    selfAwareness: 50,
    socialSkills: 50,
    emotionalRegulation: 50,
    motivation: 50,
    adaptability: 50,
  }

  // If data is null or undefined, return default values
  if (!data) {
    console.warn("Empty emotional intelligence data, using defaults")
    return { ...defaultValues }
  }

  // Ensure all required fields exist
  const result = { ...defaultValues, ...data }

  // Validate that all values are numbers between 0 and 100
  Object.keys(result).forEach((key) => {
    if (typeof result[key] !== "number" || isNaN(result[key])) {
      console.warn(`Invalid value for ${key}, using default`)
      result[key] = defaultValues[key as keyof typeof defaultValues]
    } else {
      // Ensure values are within 0-100 range
      result[key] = Math.min(100, Math.max(0, result[key]))
    }
  })

  return result
}

/**
 * Validates emotional intelligence data structure
 * @param data The data to validate
 * @returns Object with validation result and missing keys
 */
export function validateEmotionalIntelligenceData(data: any): { isValid: boolean; missingKeys: string[] } {
  const requiredKeys = ["empathy", "selfAwareness", "socialSkills", "emotionalRegulation", "motivation", "adaptability"]

  // If data is null or undefined, it's invalid
  if (!data) {
    return { isValid: false, missingKeys: requiredKeys }
  }

  // Check for missing keys
  const missingKeys = requiredKeys.filter((key) => {
    return typeof data[key] !== "number" || isNaN(data[key])
  })

  return {
    isValid: missingKeys.length === 0,
    missingKeys,
  }
}

/**
 * Creates a sample emotional intelligence data object for testing
 * @returns Sample emotional intelligence data
 */
export function createSampleEmotionalIntelligenceData(): any {
  return {
    empathy: 65,
    selfAwareness: 70,
    socialSkills: 60,
    emotionalRegulation: 55,
    motivation: 75,
    adaptability: 68,
  }
}
