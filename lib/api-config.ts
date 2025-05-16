// API configuration for OpenAI integration

// Check if OpenAI API is enabled
let openAIEnabled = false
let openAIKey: string | null = null

// Initialize OpenAI configuration
export async function initializeOpenAI() {
  try {
    // Try to get the API key from server actions
    const { getServerOpenAIKey } = await import("@/app/actions/api-actions")
    const result = await getServerOpenAIKey()

    if (result.available && result.key) {
      openAIEnabled = true
      openAIKey = result.key
      console.log("OpenAI API initialized successfully from server")
      return true
    }

    // If server key is not available, check for client-side key
    const clientKey = localStorage.getItem("openai_api_key")
    if (clientKey) {
      // Validate the client key
      const { validateApiKey } = await import("@/app/actions/api-actions")
      const validation = await validateApiKey(clientKey)

      if (validation.valid) {
        openAIEnabled = true
        openAIKey = clientKey
        console.log("OpenAI API initialized successfully from client storage")
        return true
      }
    }

    console.log("OpenAI API not initialized - no valid key found")
    return false
  } catch (error) {
    console.error("Error initializing OpenAI:", error)
    return false
  }
}

// Check if OpenAI is enabled
export function isOpenAIEnabled(): boolean {
  return openAIEnabled && !!openAIKey
}

// Get the OpenAI API key
export async function getOpenAIKey(): Promise<string | null> {
  if (openAIKey) {
    return openAIKey
  }

  // Try to initialize if not already done
  await initializeOpenAI()
  return openAIKey
}

// Set the OpenAI API key
export function setOpenAIKey(key: string): void {
  openAIKey = key
  openAIEnabled = true

  // Store in localStorage for persistence
  try {
    localStorage.setItem("openai_api_key", key)
  } catch (error) {
    console.error("Error storing API key:", error)
  }
}

// Clear the OpenAI API key
export function clearOpenAIKey(): void {
  openAIKey = null
  openAIEnabled = false

  // Remove from localStorage
  try {
    localStorage.removeItem("openai_api_key")
  } catch (error) {
    console.error("Error removing API key:", error)
  }
}

export function configureOpenAI(key: string): void {
  setOpenAIKey(key)
}
