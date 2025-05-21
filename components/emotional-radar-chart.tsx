"use client"

import { useEffect, useRef, useState } from "react"
import type { EmotionalBreakdown } from "@/lib/types"

interface EmotionalRadarChartProps {
  data: EmotionalBreakdown
  color?: string
  showLabels?: boolean
  showValues?: boolean
}

function EmotionalRadarChart({
  data,
  color = "rgba(244, 63, 94, 0.8)",
  showLabels = true,
  showValues = true,
}: EmotionalRadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 })
  const [error, setError] = useState<string | null>(null)

  // Validate data
  useEffect(() => {
    if (!data) {
      setError("No data provided")
      console.error("EmotionalRadarChart received no data")
      return
    }

    // Check if data is empty object
    if (Object.keys(data).length === 0) {
      setError("Empty data object provided")
      console.error("EmotionalRadarChart received empty data object")
      return
    }

    const requiredKeys = [
      "empathy",
      "selfAwareness",
      "socialSkills",
      "emotionalRegulation",
      "motivation",
      "adaptability",
    ]
    const missingKeys = requiredKeys.filter((key) => typeof data[key as keyof typeof data] !== "number")

    if (missingKeys.length > 0) {
      setError(`Missing required data: ${missingKeys.join(", ")}`)
      console.error("EmotionalRadarChart data validation failed:", { data, missingKeys })
      return
    }

    setError(null)
  }, [data])

  useEffect(() => {
    if (!canvasRef.current || error) return

    // Verify data is available
    if (!data || Object.keys(data).length === 0) {
      console.error("No data provided to EmotionalRadarChart")
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Update canvas dimensions
    canvas.width = dimensions.width
    canvas.height = dimensions.height

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - Math.max(15, width * 0.075) // Responsive radius

    // Draw radar background
    drawRadarBackground(ctx, centerX, centerY, radius)

    // Draw data
    drawData(ctx, centerX, centerY, radius, data, color)

    // Draw labels
    if (showLabels) {
      drawLabels(ctx, centerX, centerY, radius, data, showValues)
    }
  }, [data, color, showLabels, showValues, dimensions, error])

  const drawRadarBackground = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => {
    const categories = [
      "Empathy",
      "Self-Awareness",
      "Social Skills",
      "Emotional Regulation",
      "Motivation",
      "Adaptability",
    ]
    const angleStep = (Math.PI * 2) / categories.length

    // Draw circles for 20%, 40%, 60%, 80%, 100%
    for (let i = 1; i <= 5; i++) {
      const circleRadius = (radius * i) / 5
      ctx.beginPath()
      ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2)
      ctx.strokeStyle = "#e5e7eb"
      ctx.stroke()

      // Draw scale labels (20%, 40%, etc.)
      ctx.font = "10px sans-serif"
      ctx.fillStyle = "#9ca3af"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(`${i * 20}%`, centerX, centerY - circleRadius)
    }

    // Draw lines
    for (let i = 0; i < categories.length; i++) {
      const angle = i * angleStep - Math.PI / 2
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle))
      ctx.strokeStyle = "#e5e7eb"
      ctx.stroke()
    }
  }

  const drawData = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    data: EmotionalBreakdown,
    color: string,
  ) => {
    const categories = [
      "empathy",
      "selfAwareness",
      "socialSkills",
      "emotionalRegulation",
      "motivation",
      "adaptability",
    ] as const
    const angleStep = (Math.PI * 2) / categories.length

    // Check if we have valid data for all categories
    const hasValidData = categories.every((category) => typeof data[category] === "number")

    if (!hasValidData) {
      console.error("Invalid data provided to EmotionalRadarChart:", data)
      return
    }

    // Draw data polygon
    ctx.beginPath()
    categories.forEach((category, i) => {
      const value = data[category] / 100
      const angle = i * angleStep - Math.PI / 2
      const x = centerX + radius * value * Math.cos(angle)
      const y = centerY + radius * value * Math.sin(angle)

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.closePath()
    ctx.fillStyle = color.replace("0.8", "0.2") // Lighter fill
    ctx.fill()
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw data points
    categories.forEach((category, i) => {
      const value = data[category] / 100
      const angle = i * angleStep - Math.PI / 2
      const x = centerX + radius * value * Math.cos(angle)
      const y = centerY + radius * value * Math.sin(angle)

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
    })
  }

  const drawLabels = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    data: EmotionalBreakdown,
    showValues: boolean,
  ) => {
    const categories = [
      "Empathy",
      "Self-Awareness",
      "Social Skills",
      "Emotional Regulation",
      "Motivation",
      "Adaptability",
    ]
    const dataKeys = [
      "empathy",
      "selfAwareness",
      "socialSkills",
      "emotionalRegulation",
      "motivation",
      "adaptability",
    ] as const
    const angleStep = (Math.PI * 2) / categories.length

    ctx.font = "12px sans-serif"
    ctx.fillStyle = "#4b5563"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    categories.forEach((category, i) => {
      const angle = i * angleStep - Math.PI / 2
      const labelDistance = radius + 20
      const x = centerX + labelDistance * Math.cos(angle)
      const y = centerY + labelDistance * Math.sin(angle)

      // Draw category label
      ctx.fillText(category, x, y)

      // Draw value if enabled
      if (showValues && typeof data[dataKeys[i]] === "number") {
        const value = data[dataKeys[i]]
        const valueDistance = (radius * value) / 100
        const valueX = centerX + valueDistance * Math.cos(angle)
        const valueY = centerY + valueDistance * Math.sin(angle)

        // Draw value background for better readability
        const valueText = `${value}%`
        const textWidth = ctx.measureText(valueText).width
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
        ctx.fillRect(valueX - textWidth / 2 - 2, valueY - 7, textWidth + 4, 14)

        // Draw value text
        ctx.font = "10px sans-serif"
        ctx.fillStyle = "#4b5563"
        ctx.fillText(valueText, valueX, valueY)
      }
    })
  }

  // Add error display
  if (error) {
    return (
      <div className="w-full aspect-square flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-red-500 text-sm p-4 text-center">
          <p>Error rendering chart: {error}</p>
          <p className="text-xs mt-2">Please check the console for more details.</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full aspect-square">
      <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height} className="w-full h-full" />
    </div>
  )
}

export default EmotionalRadarChart
