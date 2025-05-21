"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export function RouteDebugger() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV === "development") {
      const showDebug = searchParams?.get("debug") === "true"
      setIsVisible(showDebug)
    }
  }, [searchParams])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-80 text-white p-4 z-50 text-sm font-mono">
      <div>Current Path: {pathname}</div>
      <div>
        Search Params:{" "}
        {searchParams
          ? Array.from(searchParams.entries())
              .map(([key, value]) => `${key}=${value}`)
              .join("&")
          : "none"}
      </div>
    </div>
  )
}
