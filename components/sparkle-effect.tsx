"use client"

import { useEffect, useRef } from "react"

interface SparkleEffectProps {
  count?: number
  minSize?: number
  maxSize?: number
  className?: string
}

export function SparkleEffect({ count = 15, minSize = 4, maxSize = 8, className = "" }: SparkleEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()
    const sparkles: HTMLDivElement[] = []

    // Create sparkles
    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement("div")
      sparkle.className = "sparkle"

      // Random position
      const x = Math.random() * containerRect.width
      const y = Math.random() * containerRect.height
      sparkle.style.left = `${x}px`
      sparkle.style.top = `${y}px`

      // Random size
      const size = minSize + Math.random() * (maxSize - minSize)
      sparkle.style.width = `${size}px`
      sparkle.style.height = `${size}px`

      // Random delay
      const delay = Math.random() * 4
      sparkle.style.animationDelay = `${delay}s`

      container.appendChild(sparkle)
      sparkles.push(sparkle)
    }

    // Cleanup
    return () => {
      sparkles.forEach((sparkle) => {
        if (sparkle.parentNode === container) {
          container.removeChild(sparkle)
        }
      })
    }
  }, [count, minSize, maxSize])

  return (
    <div ref={containerRef} className={`sparkle-container ${className}`}>
      {/* Sparkles will be added here dynamically */}
    </div>
  )
}
