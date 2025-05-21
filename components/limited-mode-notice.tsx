"use client"

import { useApiStatus } from "@/lib/api-context"
import { AlertCircle } from "lucide-react"

export function LimitedModeNotice() {
  const { isLimitedMode } = useApiStatus()

  if (!isLimitedMode) return null

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-amber-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-amber-700">
            You're currently in limited functionality mode. Some AI-powered features are unavailable.
          </p>
        </div>
      </div>
    </div>
  )
}
