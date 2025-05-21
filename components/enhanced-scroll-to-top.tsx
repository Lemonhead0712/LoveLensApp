"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export default function EnhancedScrollToTop() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const prevPathRef = useRef<string | null>(null)
  const prevSearchParamsRef = useRef<URLSearchParams | null>(null)

  useEffect(() => {
    // Check if this is a new navigation (not just a re-render)
    const currentFullPath = `${pathname}?${searchParams?.toString() || ""}`
    const prevFullPath =
      prevPathRef.current && prevSearchParamsRef.current
        ? `${prevPathRef.current}?${prevSearchParamsRef.current.toString() || ""}`
        : null

    if (currentFullPath !== prevFullPath) {
      // Update refs for next comparison
      prevPathRef.current = pathname
      prevSearchParamsRef.current = searchParams

      // Scroll to top with a slight delay to ensure content has rendered
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "instant",
        })
      }, 0)
    }
  }, [pathname, searchParams])

  // Also handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      })
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  return null
}
