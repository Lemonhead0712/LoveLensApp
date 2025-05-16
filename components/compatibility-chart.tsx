"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CompatibilityChartProps {
  overallScore: number
  categories: {
    name: string
    score: number
    description: string
  }[]
}

export function CompatibilityChart({ overallScore, categories }: CompatibilityChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - 60

    // Draw compatibility gauge
    drawCompatibilityGauge(ctx, centerX, centerY, radius, overallScore)

    // Remove the call to drawCategoryBars since we're removing that visualization
    // drawCategoryBars(ctx, width, height, categories);
  }, [overallScore, categories])

  const drawCompatibilityGauge = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    score: number,
  ) => {
    // Draw outer circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 10
    ctx.stroke()

    // Draw score arc
    const startAngle = -Math.PI / 2
    const endAngle = startAngle + (Math.PI * 2 * score) / 100

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.strokeStyle = getScoreColor(score)
    ctx.lineWidth = 10
    ctx.stroke()

    // Draw score text
    ctx.font = "bold 48px sans-serif"
    ctx.fillStyle = "#111827"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(`${score}%`, centerX, centerY - 15)

    // Draw label
    ctx.font = "16px sans-serif"
    ctx.fillStyle = "#4b5563"
    ctx.fillText("Compatibility", centerX, centerY + 15)

    // Draw quality label with more space
    ctx.font = "bold 18px sans-serif"
    ctx.fillStyle = getScoreColor(score)
    ctx.fillText(getCompatibilityLabel(score), centerX, centerY + 45)
  }

  const drawCategoryBars = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    categories: { name: string; score: number; description: string }[],
  ) => {
    // Remove the canvas-based category bars since they're redundant with the detailed breakdown below
    // We'll rely on the HTML-based category breakdown that's already in the component
    // This prevents the overlap with the compatibility gauge
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10b981" // Green
    if (score >= 60) return "#6366f1" // Indigo
    if (score >= 40) return "#f59e0b" // Amber
    return "#ef4444" // Red
  }

  const getCompatibilityLabel = (score: number) => {
    if (score >= 90) return "Exceptional"
    if (score >= 80) return "Strong"
    if (score >= 70) return "Good"
    if (score >= 60) return "Moderate"
    if (score >= 50) return "Fair"
    return "Needs Improvement"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emotional Compatibility</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full aspect-square max-w-md mx-auto">
          <canvas ref={canvasRef} width={500} height={500} className="w-full h-full"></canvas>
        </div>
        <div className="mt-6 space-y-4">
          {categories.map((category, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-medium">{category.name}</span>
                <span className="text-sm">{category.score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full"
                  style={{
                    width: `${category.score}%`,
                    backgroundColor: getScoreColor(category.score),
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
