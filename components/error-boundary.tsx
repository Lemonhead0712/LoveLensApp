"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      console.error("Error caught by boundary:", event.error)
      setHasError(true)
    }

    window.addEventListener("error", errorHandler)
    return () => window.removeEventListener("error", errorHandler)
  }, [])

  if (hasError) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex items-center justify-center min-h-[50vh] p-6">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-medium text-red-600 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">
            We encountered an error while loading this page. Please try refreshing the browser.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
