"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children?: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="mb-4">Please try refreshing the page</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
            >
              Try again
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
