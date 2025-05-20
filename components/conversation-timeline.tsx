"use client"

import { useEffect, useRef, useState } from "react"
import type { ConversationTimelinePoint } from "@/lib/types"

interface ConversationTimelineProps {
  data: ConversationTimelinePoint[]
}

function ConversationTimeline({ data }: ConversationTimelineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 })

  // Resize handler to make the canvas responsive
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect()
        // Maintain aspect ratio
        setDimensions({
          width: width,
          height: width * 0.5, // 2:1 aspect ratio
        })
      }
    }

    // Initial sizing
    handleResize()

    // Add resize listener
    window.addEventListener("resize", handleResize)

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return

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
    const padding = Math.max(20, width * 0.05) // Responsive padding
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Draw axes
    drawAxes(ctx, padding, width, height, chartHeight)

    // Draw data
    drawData(ctx, data, padding, chartWidth, chartHeight)

    // Draw labels
    drawLabels(ctx, padding, width, height, chartHeight)
  }, [data, dimensions])

  const drawAxes = (
    ctx: CanvasRenderingContext2D,
    padding: number,
    width: number,
    height: number,
    chartHeight: number,
  ) => {
    // X-axis
    ctx.beginPath()
    ctx.moveTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.strokeStyle = "#9ca3af"
    ctx.stroke()

    // Y-axis
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.stroke()

    // Y-axis grid lines
    for (let i = 0; i <= 10; i++) {
      const y = height - padding - (i / 10) * chartHeight
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.strokeStyle = "#e5e7eb"
      ctx.stroke()
    }
  }

  const drawData = (
    ctx: CanvasRenderingContext2D,
    data: ConversationTimelinePoint[],
    padding: number,
    chartWidth: number,
    chartHeight: number,
  ) => {
    if (data.length === 0) return

    const xStep = chartWidth / (data.length - 1)

    // Draw lines for each participant
    const participants = [...new Set(data.map((point) => point.participant))]

    participants.forEach((participant, participantIndex) => {
      const participantData = data.filter((point) => point.participant === participant)

      // Skip if no data for this participant
      if (participantData.length === 0) return

      // Set color based on participant index
      const colors = ["rgba(244, 63, 94, 0.8)", "rgba(59, 130, 246, 0.8)", "rgba(16, 185, 129, 0.8)"]
      const color = colors[participantIndex % colors.length]

      // Draw line
      ctx.beginPath()
      participantData.forEach((point, i) => {
        const x = padding + i * xStep
        const y = padding + chartHeight - (point.sentiment / 100) * chartHeight

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw points
      participantData.forEach((point, i) => {
        const x = padding + i * xStep
        const y = padding + chartHeight - (point.sentiment / 100) * chartHeight

        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
      })

      // Add legend
      ctx.fillStyle = color
      ctx.fillRect(padding + 100 * participantIndex, padding - 20, 15, 15)
      ctx.fillStyle = "#4b5563"
      ctx.font = "12px sans-serif"
      ctx.fillText(participant, padding + 100 * participantIndex + 20, padding - 10)
    })
  }

  const drawLabels = (
    ctx: CanvasRenderingContext2D,
    padding: number,
    width: number,
    height: number,
    chartHeight: number,
  ) => {
    ctx.font = "12px sans-serif"
    ctx.fillStyle = "#4b5563"
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"

    // Y-axis labels
    for (let i = 0; i <= 10; i++) {
      const y = height - padding - (i / 10) * chartHeight
      ctx.fillText(`${i * 10}`, padding - 10, y)
    }

    // X-axis label
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.fillText("Conversation Timeline", width / 2, height - padding + 15)

    // Y-axis label
    ctx.save()
    ctx.translate(padding - 30, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = "center"
    ctx.fillText("Emotional Sentiment", 0, 0)
    ctx.restore()
  }

  return (
    <div ref={containerRef} className="w-full h-80">
      <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height} className="w-full h-full" />
    </div>
  )
}

export default ConversationTimeline
