"use client"

import { useState, useEffect } from "react"
import { X, AlertCircle } from "lucide-react"
import { initializeOpenAI } from "@/lib/api-config"

export function LimitedModeBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [showBanner, setShowBanner] = useState(true)

  useEffect(() => {
    // Check if user is in limited mode
    const isLimitedMode = localStorage.getItem("useLimitedMode") === "true"
    setIsVisible(isLimitedMode)
  }, [])

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      const result = await initializeOpenAI()
      if (result) {
        // API is now available
        localStorage.removeItem("useLimitedMode")
        setIsVisible(false)
        // Reload the page to reinitialize with API
        window.location.reload()
      }
    } catch (error) {
      console.error("Retry failed:", error)
    } finally {
      setIsRetrying(false)
    }
  }

  if (!isVisible || !showBanner) {
    return null
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 pointer-events-none">
      <div className="max-w-md mx-auto bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-4 pointer-events-auto">
        <div className="flex items-start gap-3">
          <div className="bg-amber-100 p-1.5 rounded-full">
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-amber-800">Limited Functionality Mode</h3>
              <button onClick={() => setShowBanner(false)} className="text-amber-500 hover:text-amber-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-sm text-amber-700 mt-1">
              You're currently using LoveLens with limited features. Some AI-powered analysis is unavailable.
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="text-xs font-medium bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1.5 rounded-full disabled:opacity-50"
              >
                {isRetrying ? "Checking connection..." : "Reconnect to API"}
              </button>

              <a href="/about" className="text-xs font-medium text-amber-700 hover:text-amber-900">
                Learn more
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
