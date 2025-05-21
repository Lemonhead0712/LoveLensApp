"use client"

import React, { useState, useEffect } from "react"
import type { Message } from "@/lib/types"

interface PositionDetectionVisualizerProps {
  messages: Message[]
  imageData?: string
  imageWidth?: number
  imageHeight?: number
}

export default function PositionDetectionVisualizer({
  messages,
  imageData,
  imageWidth = 1000,
  imageHeight = 800,
}: PositionDetectionVisualizerProps) {
  const [canvasReady, setCanvasReady] = useState(false)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !messages.length) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw image if available
    if (imageData) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        drawMessageBoundingBoxes()
      }
      img.src = imageData
    } else {
      drawMessageBoundingBoxes()
    }

    function drawMessageBoundingBoxes() {
      // Draw center line
      ctx.beginPath()
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
      ctx.setLineDash([5, 5])
      ctx.moveTo(canvas.width / 2, 0)
      ctx.lineTo(canvas.width / 2, canvas.height)
      ctx.stroke()
      ctx.setLineDash([])

      // Draw bounding boxes for each message
      messages.forEach((message) => {
        if (!message.bbox) return

        // Scale bbox to canvas size
        const scaleX = canvas.width / imageWidth
        const scaleY = canvas.height / imageHeight

        const x = message.bbox.x0 * scaleX
        const y = message.bbox.y0 * scaleY
        const width = (message.bbox.x1 - message.bbox.x0) * scaleX
        const height = (message.bbox.y1 - message.bbox.y0) * scaleY

        // Draw bounding box
        ctx.strokeStyle = message.position === "left" ? "rgba(0, 255, 0, 0.7)" : "rgba(0, 0, 255, 0.7)"
        ctx.lineWidth = 2
        ctx.strokeRect(x, y, width, height)

        // Draw position label
        ctx.fillStyle = message.position === "left" ? "rgba(0, 255, 0, 0.9)" : "rgba(0, 0, 255, 0.9)"
        ctx.font = "12px Arial"
        ctx.fillText(message.position || "unknown", x, y - 5)
      })
    }

    setCanvasReady(true)
  }, [messages, imageData, imageWidth, imageHeight])

  return (
    <div className="position-detection-visualizer">
      <h3 className="text-lg font-semibold mb-2">Message Position Detection</h3>
      <div className="relative border border-gray-300 rounded">
        <canvas ref={canvasRef} width={imageWidth} height={imageHeight} className="w-full h-auto" />
        {!canvasReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
            <p>Loading visualization...</p>
          </div>
        )}
      </div>
      <div className="mt-2 text-sm text-gray-600">
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 bg-green-500 mr-1"></span>
          <span>Left side messages</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 bg-blue-500 mr-1"></span>
          <span>Right side messages</span>
        </div>
      </div>
    </div>
  )
}
