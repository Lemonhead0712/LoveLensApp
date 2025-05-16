"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { InfoIcon } from "lucide-react"
import { getCommunicationStyleLabel, getStyleCompatibilityDescription } from "@/lib/communication-styles"

interface CommunicationStyle {
  name: string
  score: number
  traits: string[]
  color: string
  description?: string
}

interface CommunicationStylesChartProps {
  participant1: {
    name: string
    styles: CommunicationStyle[]
  }
  participant2: {
    name: string
    styles: CommunicationStyle[]
  }
}

export function CommunicationStylesChart({ participant1, participant2 }: CommunicationStylesChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Remove the canvas-based chart at the top of the component since it's redundant
  // The detailed breakdown below provides better information

  // Find this section in the component:
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

    // Draw communication styles
    drawCommunicationStyles(ctx, width, height, participant1, participant2)
  }, [participant1, participant2])

  const drawCommunicationStyles = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    participant1: { name: string; styles: CommunicationStyle[] },
    participant2: { name: string; styles: CommunicationStyle[] },
  ) => {
    const centerY = height / 2
    const barHeight = 30
    const barSpacing = 60 // Increased spacing between bars
    const barWidth = width * 0.4
    const gap = 40

    // Draw title
    ctx.font = "bold 18px sans-serif"
    ctx.fillStyle = "#111827"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("Communication Style Comparison", width / 2, 30)

    // Draw participant names
    ctx.font = "bold 16px sans-serif"
    ctx.textAlign = "center"
    ctx.fillStyle = "#4b5563"
    ctx.fillText(participant1.name, width / 4, 70)
    ctx.fillText(participant2.name, (width / 4) * 3, 70)

    // Draw styles for participant 1
    participant1.styles.forEach((style, index) => {
      const y = centerY - (participant1.styles.length * barSpacing) / 2 + index * barSpacing

      // Draw style name
      ctx.font = "14px sans-serif"
      ctx.fillStyle = "#111827"
      ctx.textAlign = "right"
      ctx.textBaseline = "middle"
      ctx.fillText(style.name, width / 2 - gap / 2, y)

      // Draw bar background
      ctx.beginPath()
      ctx.rect(width / 2 - gap / 2 - barWidth, y - barHeight / 2, barWidth, barHeight)
      ctx.fillStyle = "#e5e7eb"
      ctx.fill()

      // Draw score bar
      ctx.beginPath()
      ctx.rect(width / 2 - gap / 2 - barWidth, y - barHeight / 2, (barWidth * style.score) / 100, barHeight)
      ctx.fillStyle = style.color
      ctx.fill()

      // Draw score
      ctx.font = "bold 14px sans-serif"
      ctx.fillStyle = "#ffffff"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      if (style.score > 15) {
        ctx.fillText(`${style.score}%`, width / 2 - gap / 2 - barWidth + (barWidth * style.score) / 100 / 2, y)
      }
    })

    // Draw styles for participant 2
    participant2.styles.forEach((style, index) => {
      const y = centerY - (participant2.styles.length * barSpacing) / 2 + index * barSpacing

      // Draw style name
      ctx.font = "14px sans-serif"
      ctx.fillStyle = "#111827"
      ctx.textAlign = "left"
      ctx.textBaseline = "middle"
      ctx.fillText(style.name, width / 2 + gap / 2, y)

      // Draw bar background
      ctx.beginPath()
      ctx.rect(width / 2 + gap / 2, y - barHeight / 2, barWidth, barHeight)
      ctx.fillStyle = "#e5e7eb"
      ctx.fill()

      // Draw score bar
      ctx.beginPath()
      ctx.rect(width / 2 + gap / 2, y - barHeight / 2, (barWidth * style.score) / 100, barHeight)
      ctx.fillStyle = style.color
      ctx.fill()

      // Draw score
      ctx.font = "bold 14px sans-serif"
      ctx.fillStyle = "#ffffff"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      if (style.score > 15) {
        ctx.fillText(`${style.score}%`, width / 2 + gap / 2 + (barWidth * style.score) / 100 / 2, y)
      }
    })
  }

  // Get dominant styles for each participant
  const getDominantStyle = (styles: CommunicationStyle[]): CommunicationStyle => {
    return [...styles].sort((a, b) => b.score - a.score)[0]
  }

  const getSecondaryStyle = (styles: CommunicationStyle[]): CommunicationStyle | null => {
    const sortedStyles = [...styles].sort((a, b) => b.score - a.score)
    return sortedStyles[1].score > sortedStyles[0].score * 0.7 ? sortedStyles[1] : null
  }

  const participant1DominantStyle = getDominantStyle(participant1.styles)
  const participant1SecondaryStyle = getSecondaryStyle(participant1.styles)
  const participant2DominantStyle = getDominantStyle(participant2.styles)
  const participant2SecondaryStyle = getSecondaryStyle(participant2.styles)

  const participant1StyleLabel = getCommunicationStyleLabel(
    participant1DominantStyle.name,
    participant1SecondaryStyle?.name || null,
  )
  const participant2StyleLabel = getCommunicationStyleLabel(
    participant2DominantStyle.name,
    participant2SecondaryStyle?.name || null,
  )

  const compatibilityDescription = getStyleCompatibilityDescription(participant1StyleLabel, participant2StyleLabel)

  // And replace the canvas rendering section with:
  return (
    <Card>
      <CardHeader>
        <CardTitle>Communication Styles</CardTitle>
        <CardDescription>
          How you and your conversation partner tend to express yourselves and exchange information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-8 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <h3 className="text-lg font-medium mb-2">Communication Compatibility</h3>
          <p className="text-gray-700">{compatibilityDescription}</p>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-medium">{participant1.name}'s Communication Style</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Communication styles are based on patterns in messages, emotional expression, and response
                      dynamics. Each person typically has a primary style with elements of secondary styles.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 mb-4">
              <p className="font-medium text-gray-900">{participant1StyleLabel}</p>
            </div>
            <div className="space-y-6">
              {participant1.styles.map((style, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{style.name}</span>
                    <span>{style.score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div
                      className="h-2.5 rounded-full"
                      style={{ width: `${style.score}%`, backgroundColor: style.color }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{style.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {style.traits.map((trait, i) => (
                      <span key={i} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-medium">{participant2.name}'s Communication Style</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Communication styles are based on patterns in messages, emotional expression, and response
                      dynamics. Each person typically has a primary style with elements of secondary styles.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 mb-4">
              <p className="font-medium text-gray-900">{participant2StyleLabel}</p>
            </div>
            <div className="space-y-6">
              {participant2.styles.map((style, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{style.name}</span>
                    <span>{style.score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div
                      className="h-2.5 rounded-full"
                      style={{ width: `${style.score}%`, backgroundColor: style.color }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{style.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {style.traits.map((trait, i) => (
                      <span key={i} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
