"use client"

import { useEffect, useState } from "react"

export function DebugInfo() {
  const [info, setInfo] = useState<Record<string, any>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const gatherInfo = async () => {
      try {
        // Gather basic environment info
        const envInfo = {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          screenWidth: window.innerWidth,
          screenHeight: window.innerHeight,
          timestamp: new Date().toISOString(),
        }

        // Test localStorage
        let localStorageAvailable = false
        try {
          localStorage.setItem("test", "test")
          localStorage.removeItem("test")
          localStorageAvailable = true
        } catch (e) {
          console.error("localStorage test failed:", e)
        }

        // Test basic fetch
        let fetchWorking = false
        try {
          // Try to fetch a static asset from the same origin
          const response = await fetch("/favicon.ico")
          fetchWorking = response.ok
        } catch (e) {
          console.error("Fetch test failed:", e)
        }

        setInfo({
          ...envInfo,
          localStorageAvailable,
          fetchWorking,
        })
      } catch (e) {
        setError(`Error gathering debug info: ${e instanceof Error ? e.message : String(e)}`)
      }
    }

    gatherInfo()
  }, [])

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="font-bold text-red-700">Debug Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
      <h3 className="font-bold mb-2">Debug Information</h3>
      <pre className="text-xs overflow-auto max-h-40 p-2 bg-gray-100 rounded">{JSON.stringify(info, null, 2)}</pre>
    </div>
  )
}
