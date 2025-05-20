"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { initializeOpenAI } from "@/lib/api-config"
import ApiKeyForm from "./api-key-form"
import { LoadingScreen } from "./loading-screen"

function ApiInitializer({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [apiAvailable, setApiAvailable] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function init() {
      setIsLoading(true)
      try {
        // Check if we have an API key available
        const result = await initializeOpenAI()
        setApiAvailable(result)
      } catch (error) {
        console.error("Error initializing API:", error)
        setApiAvailable(false)
      } finally {
        setLoading(false)
        setInitialized(true)
        setIsLoading(false)
      }
    }

    init()
  }, [])

  if (isLoading) {
    return <LoadingScreen fullScreen={false} message="Initializing API..." />
  }

  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-love-gradient">
        <div className="text-center px-4">
          <div className="h-12 w-12 border-4 border-t-rose-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-medium">Initializing AI Analysis Engine...</h2>
          <p className="text-gray-600 mt-2">Preparing for advanced emotional intelligence analysis</p>
        </div>
      </div>
    )
  }

  if (!apiAvailable) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-love-gradient">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6 text-gradient">AI-Powered Analysis Setup</h2>
          <p className="text-gray-600 mb-6 text-center">
            LoveLens uses advanced AI to analyze emotional intelligence and relationship dynamics. Please provide your
            OpenAI API key to enable the full AI-powered analysis.
          </p>
          <ApiKeyForm onSuccess={() => setApiAvailable(true)} />
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Your API key is stored locally and used only for analysis within this application.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Export both as default and named export for backward compatibility
export { ApiInitializer }
export default ApiInitializer
