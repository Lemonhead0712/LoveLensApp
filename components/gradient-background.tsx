"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"

function GradientBackground({ children }: { children: React.ReactNode }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)
  const throttleRef = useRef<number | null>(null)

  // Check if we're on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  useEffect(() => {
    // Only add mousemove on desktop - it's heavy on mobile
    if (isMobile) return

    const handleMouseMove = (e: MouseEvent) => {
      // Throttle to improve performance
      if (throttleRef.current !== null) return

      throttleRef.current = window.setTimeout(() => {
        // Subtle movement - divide by large number to make the effect very subtle
        setMousePosition({
          x: e.clientX / 120,
          y: e.clientY / 120,
        })
        throttleRef.current = null
      }, 100) // 100ms throttle
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      if (throttleRef.current) {
        clearTimeout(throttleRef.current)
      }
    }
  }, [isMobile])

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Gradient background - simpler on mobile */}
      <div
        className="fixed inset-0 w-full h-full bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 z-0"
        style={
          isMobile
            ? {}
            : {
                backgroundPosition: `${50 + mousePosition.x}% ${50 + mousePosition.y}%`,
                transition: "background-position 0.8s ease-out",
              }
        }
      />

      {/* Subtle gradient overlay - lighter on mobile for better performance */}
      <div
        className={`fixed inset-0 w-full h-full bg-gradient-to-tr from-transparent via-white/10 to-purple-100/30 z-0 ${isMobile ? "opacity-50" : "opacity-70"}`}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// Named export for backward compatibility
export { GradientBackground }

// Default export
export default GradientBackground
