"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { GottmanScores } from "@/lib/types"

interface InteractionPatternsChartProps {
  gottmanScores: GottmanScores
  participant1Name: string
  participant2Name: string
  summary: string
  recommendations: string[]
}

export function InteractionPatternsChart({
  gottmanScores,
  participant1Name,
  participant2Name,
  summary,
  recommendations,
}: InteractionPatternsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw interaction patterns
    drawInteractionPatterns(ctx, canvas.width, canvas.height, gottmanScores)
  }, [gottmanScores])

  const drawInteractionPatterns = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scores: GottmanScores,
  ) => {
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - 80

    // Calculate positive-to-negative ratio
    const positiveAvg = (scores.emotionalBids + scores.turnTowards + scores.repairAttempts + scores.sharedMeaning) / 4
    const negativeAvg = (scores.criticism + scores.contempt + scores.defensiveness + scores.stonewalling) / 4
    const ratio = positiveAvg / (negativeAvg || 1) // Avoid division by zero

    // Define the categories
    const categories = [
      { name: "Criticism", score: scores.criticism, angle: 0, isNegative: true },
      { name: "Emotional Bids", score: scores.emotionalBids, angle: Math.PI / 4, isNegative: false },
      { name: "Contempt", score: scores.contempt, angle: Math.PI / 2, isNegative: true },
      { name: "Turn Towards", score: scores.turnTowards, angle: (3 * Math.PI) / 4, isNegative: false },
      { name: "Defensiveness", score: scores.defensiveness, angle: Math.PI, isNegative: true },
      { name: "Repair Attempts", score: scores.repairAttempts, angle: (5 * Math.PI) / 4, isNegative: false },
      { name: "Stonewalling", score: scores.stonewalling, angle: (3 * Math.PI) / 2, isNegative: true },
      { name: "Shared Meaning", score: scores.sharedMeaning, angle: (7 * Math.PI) / 4, isNegative: false },
    ]

    // Draw background circles and axis lines
    drawChartBackground(ctx, centerX, centerY, radius)

    // Draw data points and connecting lines
    drawDataPoints(ctx, centerX, centerY, radius, categories)

    // Draw center circle with ratio
    drawCenterRatio(ctx, centerX, centerY, radius, ratio)

    // Draw category labels
    drawCategoryLabels(ctx, centerX, centerY, radius, categories)
  }

  const drawChartBackground = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => {
    // Draw concentric circles at 25%, 50%, 75%, and 100%
    ;[0.25, 0.5, 0.75, 1].forEach((scale) => {
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * scale, 0, Math.PI * 2)
      ctx.strokeStyle = "#e5e7eb"
      ctx.lineWidth = 1
      ctx.stroke()

      // Add percentage labels on the top vertical axis
      if (scale < 1) {
        ctx.font = "10px sans-serif"
        ctx.fillStyle = "#9ca3af"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(`${scale * 100}%`, centerX, centerY - radius * scale - 10)
      }
    })

    // Draw axis lines
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle))
      ctx.strokeStyle = "#e5e7eb"
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }

  const drawDataPoints = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    categories: { name: string; score: number; angle: number; isNegative: boolean }[],
  ) => {
    // Draw positive indicators (green)
    const positivePoints: [number, number][] = []
    const negativePoints: [number, number][] = []

    categories.forEach((category) => {
      const value = category.score / 100
      const x = centerX + radius * value * Math.cos(category.angle)
      const y = centerY + radius * value * Math.sin(category.angle)

      if (category.isNegative) {
        negativePoints.push([x, y])
      } else {
        positivePoints.push([x, y])
      }

      // Draw data point
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fillStyle = category.isNegative ? "#ef4444" : "#10b981"
      ctx.fill()

      // Draw score percentage
      ctx.font = "bold 12px sans-serif"
      ctx.fillStyle = category.isNegative ? "#ef4444" : "#10b981"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Position the text slightly away from the point
      const textDistance = 15
      const textX = x + textDistance * Math.cos(category.angle)
      const textY = y + textDistance * Math.sin(category.angle)

      ctx.fillText(`${category.score}%`, textX, textY)
    })

    // Connect positive points with a line
    ctx.beginPath()
    positivePoints.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point[0], point[1])
      } else {
        ctx.lineTo(point[0], point[1])
      }
    })
    // Close the path by connecting back to the first point
    if (positivePoints.length > 0) {
      ctx.lineTo(positivePoints[0][0], positivePoints[0][1])
    }
    ctx.strokeStyle = "rgba(16, 185, 129, 0.7)"
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = "rgba(16, 185, 129, 0.1)"
    ctx.fill()

    // Connect negative points with a line
    ctx.beginPath()
    negativePoints.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point[0], point[1])
      } else {
        ctx.lineTo(point[0], point[1])
      }
    })
    // Close the path by connecting back to the first point
    if (negativePoints.length > 0) {
      ctx.lineTo(negativePoints[0][0], negativePoints[0][1])
    }
    ctx.strokeStyle = "rgba(239, 68, 68, 0.7)"
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = "rgba(239, 68, 68, 0.1)"
    ctx.fill()
  }

  const drawCenterRatio = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    ratio: number,
  ) => {
    // Draw center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius / 5, 0, Math.PI * 2)
    ctx.fillStyle = "#f9fafb"
    ctx.fill()
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw ratio text
    ctx.font = "bold 16px sans-serif"
    ctx.fillStyle = "#111827"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(`${ratio.toFixed(1)}:1`, centerX, centerY - 10)

    ctx.font = "11px sans-serif"
    ctx.fillStyle = "#6b7280"
    ctx.fillText("Positive to", centerX, centerY + 8)
    ctx.fillText("Negative Ratio", centerX, centerY + 22)
  }

  const drawCategoryLabels = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    categories: { name: string; score: number; angle: number; isNegative: boolean }[],
  ) => {
    categories.forEach((category) => {
      const labelDistance = radius + 30
      const x = centerX + labelDistance * Math.cos(category.angle)
      const y = centerY + labelDistance * Math.sin(category.angle)

      ctx.font = "12px sans-serif"
      ctx.fillStyle = category.isNegative ? "#ef4444" : "#10b981"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(category.name, x, y)
    })

    // Add title
    ctx.font = "bold 16px sans-serif"
    ctx.fillStyle = "#111827"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.fillText("Gottman Relationship Dynamics", centerX, 20)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relationship Dynamics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full aspect-square max-w-md mx-auto mb-6">
          <canvas ref={canvasRef} width={500} height={500} className="w-full h-full"></canvas>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-3">The Four Horsemen</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">Criticism</span>
                  <span>{gottmanScores.criticism}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full bg-red-500" style={{ width: `${gottmanScores.criticism}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">Contempt</span>
                  <span>{gottmanScores.contempt}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full bg-red-500" style={{ width: `${gottmanScores.contempt}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">Defensiveness</span>
                  <span>{gottmanScores.defensiveness}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full bg-red-500"
                    style={{ width: `${gottmanScores.defensiveness}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">Stonewalling</span>
                  <span>{gottmanScores.stonewalling}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full bg-red-500"
                    style={{ width: `${gottmanScores.stonewalling}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Positive Indicators</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">Emotional Bids</span>
                  <span>{gottmanScores.emotionalBids}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full bg-green-500"
                    style={{ width: `${gottmanScores.emotionalBids}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">Turn Towards</span>
                  <span>{gottmanScores.turnTowards}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full bg-green-500"
                    style={{ width: `${gottmanScores.turnTowards}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">Repair Attempts</span>
                  <span>{gottmanScores.repairAttempts}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full bg-green-500"
                    style={{ width: `${gottmanScores.repairAttempts}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">Shared Meaning</span>
                  <span>{gottmanScores.sharedMeaning}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full bg-green-500"
                    style={{ width: `${gottmanScores.sharedMeaning}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium mb-3">Relationship Summary</h3>
          <p className="text-gray-700 mb-4">{summary}</p>

          <h3 className="text-lg font-medium mb-3">Recommendations</h3>
          <ul className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="flex">
                <span className="mr-2">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
