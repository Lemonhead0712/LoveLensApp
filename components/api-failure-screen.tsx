"use client"

import { useState } from "react"
import {
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  Wifi,
  WifiOff,
  Settings,
  Mail,
} from "lucide-react"
import { initializeOpenAI } from "@/lib/api-config"
import { Logo } from "./logo"

interface ApiFailureScreenProps {
  onRetrySuccess: () => void
  onContinueWithoutApi: () => void
  errorDetails?: string
}

export function ApiFailureScreen({
  onRetrySuccess,
  onContinueWithoutApi,
  errorDetails = "Connection to the API service failed",
}: ApiFailureScreenProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [showTroubleshooting, setShowTroubleshooting] = useState(false)
  const [showFeatureComparison, setShowFeatureComparison] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [retryError, setRetryError] = useState<string | null>(null)

  const handleRetry = async () => {
    setIsRetrying(true)
    setRetryError(null)

    try {
      const result = await Promise.race([
        initializeOpenAI(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Connection timed out")), 8000)),
      ])

      if (result) {
        onRetrySuccess()
      } else {
        setRetryError("API returned an invalid response")
      }
    } catch (error) {
      console.error("Retry failed:", error)
      setRetryError(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setIsRetrying(false)
      setRetryCount((prev) => prev + 1)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-purple-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 to-purple-500 p-6">
          <div className="flex justify-between items-center">
            <Logo size="medium" showText={true} asLink={false} />
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-white text-sm">
              <WifiOff className="h-4 w-4" />
              <span>API Unavailable</span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-amber-100 p-2 rounded-full">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">API Connection Issue</h2>
              <p className="text-gray-600 mt-1">
                We're unable to connect to our AI analysis services. This may affect some features of the application.
              </p>
              {errorDetails && (
                <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700 font-mono">
                  {errorDetails}
                </div>
              )}
              {retryError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                  <strong>Error:</strong> {retryError}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:opacity-70 disabled:cursor-not-allowed h-12 px-6 rounded-lg text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5" />
                  {retryCount > 0 ? "Try Again" : "Retry Connection"}
                </>
              )}
            </button>

            <button
              onClick={onContinueWithoutApi}
              className="flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 h-12 px-6 rounded-lg text-gray-700 font-medium transition-all duration-200"
            >
              Continue with Limited Features
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>

          {/* Feature comparison */}
          <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowFeatureComparison(!showFeatureComparison)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 text-left"
            >
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Available Features Comparison</span>
              </div>
              {showFeatureComparison ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {showFeatureComparison && (
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="flex items-center gap-2 font-medium text-green-700 mb-2">
                      <Wifi className="h-4 w-4" />
                      Available without API
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 flex items-center justify-center mt-0.5">
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        </div>
                        <span>Screenshot uploads & viewing</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 flex items-center justify-center mt-0.5">
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        </div>
                        <span>Basic OCR text extraction</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 flex items-center justify-center mt-0.5">
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        </div>
                        <span>Conversation timeline view</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 flex items-center justify-center mt-0.5">
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        </div>
                        <span>Educational resources</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="flex items-center gap-2 font-medium text-red-700 mb-2">
                      <WifiOff className="h-4 w-4" />
                      Unavailable without API
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 flex items-center justify-center mt-0.5">
                          <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                        </div>
                        <span>AI-powered emotional analysis</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 flex items-center justify-center mt-0.5">
                          <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                        </div>
                        <span>Psychological profiles</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 flex items-center justify-center mt-0.5">
                          <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                        </div>
                        <span>Relationship dynamics insights</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 flex items-center justify-center mt-0.5">
                          <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                        </div>
                        <span>Personalized improvement plans</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Troubleshooting guide */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowTroubleshooting(!showTroubleshooting)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 text-left"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Troubleshooting Guide</span>
              </div>
              {showTroubleshooting ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {showTroubleshooting && (
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Settings className="h-4 w-4 text-gray-700" />
                    Check your API key
                  </h3>
                  <p className="text-sm text-gray-600">
                    Ensure your OpenAI API key is valid and has not expired. You can verify this in your OpenAI
                    dashboard.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-gray-700" />
                    Check your internet connection
                  </h3>
                  <p className="text-sm text-gray-600">
                    Verify that your device has a stable internet connection. Try accessing other websites to confirm
                    connectivity.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-gray-700" />
                    Clear browser cache
                  </h3>
                  <p className="text-sm text-gray-600">
                    Clearing your browser's cache and cookies might resolve persistent connection issues.
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <a
                    href="https://help.openai.com/en/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-800"
                  >
                    Visit OpenAI Help Center
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">Need help? Our support team is available to assist you.</p>
            <a
              href="mailto:support@lovelens.app"
              className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-800"
            >
              <Mail className="h-4 w-4" />
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
