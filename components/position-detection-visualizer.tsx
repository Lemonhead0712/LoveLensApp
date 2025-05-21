"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-override"
import { Button } from "@/components/ui/button-override"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ImageIcon, MessageSquare, ArrowLeftRight, RefreshCw } from "lucide-react"
import type { Message } from "@/lib/types"
import { detectMessageSide, detectMessageSideAdvanced } from "@/lib/ocr/position-detection"

interface PositionDetectionVisualizerProps {
  originalImage: string | null
  messages: Message[]
  textBlocks: Array<{
    text: string
    boundingBox: {
      x: number
      y: number
      width: number
      height: number
    }
    position?: "left" | "right"
    confidence?: number
  }>
  imageWidth: number
  imageHeight: number
  onReprocess?: () => void
}

export function PositionDetectionVisualizer({
  originalImage,
  messages,
  textBlocks,
  imageWidth,
  imageHeight,
  onReprocess,
}: PositionDetectionVisualizerProps) {
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true)
  const [showPositions, setShowPositions] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [threshold, setThreshold] = useState(50)
  const [useAdvancedDetection, setUseAdvancedDetection] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Draw the image and bounding boxes on the canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !originalImage) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Load and draw the image
    const img = new Image()
    img.crossOrigin = "anonymous" // Prevent CORS issues
    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width * (zoomLevel / 100)
      canvas.height = img.height * (zoomLevel / 100)

      // Draw the image scaled by zoom level
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Draw threshold line
      const thresholdX = ((imageWidth * threshold) / 100) * (zoomLevel / 100)
      ctx.strokeStyle = "#ff3366"
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(thresholdX, 0)
      ctx.lineTo(thresholdX, canvas.height)
      ctx.stroke()
      ctx.setLineDash([])

      // Draw bounding boxes if enabled
      if (showBoundingBoxes && textBlocks.length > 0) {
        textBlocks.forEach((block) => {
          // Scale bounding box coordinates by zoom level
          const scaledBox = {
            x: block.boundingBox.x * (zoomLevel / 100),
            y: block.boundingBox.y * (zoomLevel / 100),
            width: block.boundingBox.width * (zoomLevel / 100),
            height: block.boundingBox.height * (zoomLevel / 100),
          }

          // Determine position based on current threshold
          const actualThreshold = (imageWidth * threshold) / 100
          let position: "left" | "right"

          if (useAdvancedDetection) {
            position = detectMessageSideAdvanced(block.boundingBox.x, block.boundingBox.width, imageWidth)
          } else {
            position = detectMessageSide(block.boundingBox.x, actualThreshold)
          }

          // Set styles based on position
          ctx.strokeStyle = position === "left" ? "#3b82f6" : "#ef4444"
          ctx.lineWidth = 2

          // Draw the bounding box
          ctx.strokeRect(scaledBox.x, scaledBox.y, scaledBox.width, scaledBox.height)

          // Add position label if enabled
          if (showPositions) {
            ctx.fillStyle = position === "left" ? "#3b82f6" : "#ef4444"
            ctx.font = "12px sans-serif"
            ctx.fillText(position, scaledBox.x, scaledBox.y - 5)
          }
        })
      }
    }
    img.src = originalImage
  }, [
    originalImage,
    showBoundingBoxes,
    showPositions,
    zoomLevel,
    threshold,
    textBlocks,
    useAdvancedDetection,
    imageWidth,
  ])

  // Calculate message distribution
  const leftMessages = messages.filter((m) => m.position === "left").length
  const rightMessages = messages.filter((m) => m.position === "right").length
  const totalMessages = messages.length
  const leftPercentage = totalMessages > 0 ? Math.round((leftMessages / totalMessages) * 100) : 0
  const rightPercentage = totalMessages > 0 ? Math.round((rightMessages / totalMessages) * 100) : 0

  return (
    <Card className="w-full shadow-md border-pink-100">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl text-pink-700">Position Detection Visualizer</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Left: {leftMessages} ({leftPercentage}%)
            </Badge>
            <Badge variant="outline">
              Right: {rightMessages} ({rightPercentage}%)
            </Badge>
            {onReprocess && (
              <Button size="sm" variant="outline" onClick={onReprocess}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Reprocess
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch id="show-boxes" checked={showBoundingBoxes} onCheckedChange={setShowBoundingBoxes} />
                <Label htmlFor="show-boxes" className="text-sm">
                  {showBoundingBoxes ? (
                    <Eye className="h-4 w-4 inline mr-1" />
                  ) : (
                    <EyeOff className="h-4 w-4 inline mr-1" />
                  )}
                  Bounding Boxes
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="show-positions" checked={showPositions} onCheckedChange={setShowPositions} />
                <Label htmlFor="show-positions" className="text-sm">
                  <MessageSquare className="h-4 w-4 inline mr-1" />
                  Show Positions
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="advanced-detection"
                  checked={useAdvancedDetection}
                  onCheckedChange={setUseAdvancedDetection}
                />
                <Label htmlFor="advanced-detection" className="text-sm">
                  <ArrowLeftRight className="h-4 w-4 inline mr-1" />
                  Advanced Detection
                </Label>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="zoom" className="text-sm">
                Zoom: {zoomLevel}%
              </Label>
              <Slider
                id="zoom"
                min={50}
                max={200}
                step={10}
                value={[zoomLevel]}
                onValueChange={(value) => setZoomLevel(value[0])}
                className="w-32"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Label htmlFor="threshold" className="text-sm">
              Position Threshold: {threshold}%
            </Label>
            <Slider
              id="threshold"
              min={10}
              max={90}
              step={5}
              value={[threshold]}
              onValueChange={(value) => setThreshold(value[0])}
              className="w-full"
            />
          </div>

          <div className="relative border rounded-md overflow-auto h-[400px] bg-gray-100 flex items-center justify-center">
            {originalImage ? (
              <canvas ref={canvasRef} className="max-w-full" />
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                <ImageIcon className="h-12 w-12 mb-2" />
                <p>No image available</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
