"use client"

import { useState } from "react"
import { AlertTriangle, RefreshCw, Info, ArrowRight } from "lucide-react"
import { initializeOpenAI } from "@/lib/api-config"
import { Logo } from "./logo"

interface ApiConnectionErrorProps {
  onRetrySuccess: () => void
  onContinueWithoutApi: () => void
}

export function ApiConnectionError({ onRetrySuccess, onContinueWithoutApi }: ApiConnectionErrorProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      const result = await initializeOpenAI()
      if (result) {
        onRetrySuccess()
      }
    } catch (error) {
      console.error("Retry failed:", error)
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-love-gradient">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-center mb-6">
          <Logo size="medium" showText={true} asLink={false} />
        </div>

        <div className="flex items-center gap-3 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <h2 className="text-lg font-medium text-amber-800">API Connection Issue</h2>
        </div>

        <p className="text-gray-600 mb-6">
          We're having trouble connecting to our AI analysis services. You can retry the connection or continue with
          limited functionality.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed border-none h-12 px-6 rounded-md text-white font-medium"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Retry Connection
              </>
            )}
          </button>

          <button
            onClick={onContinueWithoutApi}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 h-12 px-6 rounded-md text-gray-700 font-medium"
          >
            Continue with Limited Features
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <Info className="h-4 w-4 mr-1" />
            {showDetails ? "Hide details" : "Show details"}
          </button>

          {showDetails && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
              <p className="font-medium mb-2">Available without API connection:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Basic conversation viewing</li>
                <li>Screenshot uploads</li>
                <li>OCR text extraction</li>
              </ul>

              <p className="font-medium mt-4 mb-2">Unavailable features:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>AI-powered emotional intelligence analysis</li>
                <li>Relationship dynamics insights</li>
                <li>Psychological profiles</li>
                <li>Personalized reflections</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
