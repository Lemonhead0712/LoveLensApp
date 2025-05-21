"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { isDevelopment } from "@/lib/env-utils"

export function RouteDebugger() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show in development and when debug=true is in the URL
    const showDebugger = isDevelopment() && searchParams.get("debug") === "true"
    setIsVisible(showDebugger)
  }, [searchParams])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 text-white p-4 z-50 text-xs font-mono">
      <div>
        <strong>Path:</strong> {pathname}
      </div>
      <div>
        <strong>Query:</strong>{" "}
        {Array.from(searchParams.entries()).map(([key, value]) => (
          <span key={key} className="mr-2">
            {key}={value}
          </span>
        ))}
      </div>
      <div>
        <strong>Environment:</strong> {isDevelopment() ? "Development" : "Production"}
      </div>
    </div>
  )
}
