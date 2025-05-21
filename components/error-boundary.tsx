"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { isDevelopment } from "@/lib/env-utils"

interface Props {
  children?: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // Show detailed error in development, fallback in production
      if (isDevelopment()) {
        return (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-xl font-bold text-red-700 mb-4">Something went wrong</h2>
            <div className="bg-white p-4 rounded overflow-auto max-h-[400px] text-sm font-mono">
              <p className="text-red-600">{this.state.error?.toString()}</p>
              <p className="mt-2 text-gray-700">{this.state.error?.stack}</p>
            </div>
          </div>
        )
      }

      // Use provided fallback or default error message
      return (
        this.props.fallback || (
          <div className="p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-600">Please try refreshing the page</p>
          </div>
        )
      )
    }

    return this.props.children
  }
}
