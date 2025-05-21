"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-override"
import { Button } from "@/components/ui/button-override"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Eye,
  EyeOff,
  ImageIcon,
  FileText,
  MessageSquare,
  Layers,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
} from "lucide-react"
import type { Message } from "@/lib/types"

interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

interface TextBlock {
  text: string
  boundingBox: BoundingBox
  confidence: number
  isMessage?: boolean
  sender?: string
}

interface PreprocessingStep {
  name: string
  description: string
  imageDataUrl: string
}

interface OcrExtractionVisualizerProps {
  originalImage: string | null
  preprocessingSteps: PreprocessingStep[]
  rawText: string
  textBlocks: TextBlock[]
  extractedMessages: Message[]
  ocrConfidence: number
  processingTime: number
  errors: string[]
  onReprocess?: (options: any) => void
}

export function OcrExtractionVisualizer({
  originalImage,
  preprocessingSteps,
  rawText,
  textBlocks,
  extractedMessages,
  ocrConfidence,
  processingTime,
  errors,
  onReprocess,
}: OcrExtractionVisualizerProps) {
  const [activeTab, setActiveTab] = useState("original")
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true)
  const [highlightMessages, setHighlightMessages] = useState(true)
  const [selectedBlock, setSelectedBlock] = useState<TextBlock | null>(null)
  const [zoomLevel, setZoomLevel] = useState(100)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Draw the image and bounding boxes on the canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Get the active image
    let activeImage = originalImage
    if (activeTab !== "original" && preprocessingSteps.length > 0) {
      const step = preprocessingSteps.find((step) => step.name === activeTab)
      if (step) {
        activeImage = step.imageDataUrl
      }
    }

    if (!activeImage) return

    // Load and draw the image
    const img = new Image()
    img.crossOrigin = "anonymous" // Prevent CORS issues
    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width * (zoomLevel / 100)
      canvas.height = img.height * (zoomLevel / 100)

      // Draw the image scaled by zoom level
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Draw bounding boxes if enabled
      if (showBoundingBoxes && textBlocks.length > 0) {
        textBlocks.forEach((block, index) => {
          const isSelected = selectedBlock === block
          const isMessage = block.isMessage

          // Scale bounding box coordinates by zoom level
          const scaledBox = {
            x: block.boundingBox.x * (zoomLevel / 100),
            y: block.boundingBox.y * (zoomLevel / 100),
            width: block.boundingBox.width * (zoomLevel / 100),
            height: block.boundingBox.height * (zoomLevel / 100),
          }

          // Set styles based on block type and selection
          if (isSelected) {
            ctx.strokeStyle = "#ff3366"
            ctx.lineWidth = 3
          } else if (isMessage && highlightMessages) {
            ctx.strokeStyle = "#22c55e"
            ctx.lineWidth = 2
          } else {
            ctx.strokeStyle = "#3b82f6"
            ctx.lineWidth = 1
          }

          // Draw the bounding box
          ctx.strokeRect(scaledBox.x, scaledBox.y, scaledBox.width, scaledBox.height)

          // Add block index for reference
          ctx.fillStyle = ctx.strokeStyle
          ctx.font = "12px sans-serif"
          ctx.fillText(String(index), scaledBox.x, scaledBox.y - 5)

          // Add confidence indicator
          const confidenceWidth = 30
          const confidenceHeight = 4
          ctx.fillStyle = "#e5e7eb"
          ctx.fillRect(scaledBox.x, scaledBox.y + scaledBox.height + 5, confidenceWidth, confidenceHeight)

          ctx.fillStyle = getConfidenceColor(block.confidence)
          ctx.fillRect(
            scaledBox.x,
            scaledBox.y + scaledBox.height + 5,
            confidenceWidth * (block.confidence / 100),
            confidenceHeight,
          )
        })
      }
    }
    img.src = activeImage
  }, [
    activeTab,
    originalImage,
    preprocessingSteps,
    showBoundingBoxes,
    highlightMessages,
    selectedBlock,
    textBlocks,
    zoomLevel,
  ])

  // Helper function to get color based on confidence
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return "#22c55e" // green
    if (confidence >= 50) return "#eab308" // yellow
    return "#ef4444" // red
  }

  // Download debug data as JSON
  const downloadDebugData = () => {
    const debugData = {
      ocrConfidence,
      processingTime,
      rawText,
      textBlocks,
      extractedMessages,
      errors,
    }

    const dataStr = JSON.stringify(debugData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportName = "ocr-debug-data-" + new Date().toISOString() + ".json"

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportName)
    linkElement.click()
  }

  return (
    <Card className="w-full shadow-md border-pink-100">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl text-pink-700">OCR Extraction Visualizer</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={ocrConfidence >= 80 ? "success" : ocrConfidence >= 50 ? "warning" : "destructive"}>
              {ocrConfidence.toFixed(1)}% Confidence
            </Badge>
            <Badge variant="outline">{processingTime}ms</Badge>
            <Button size="sm" variant="outline" onClick={downloadDebugData}>
              <Download className="h-4 w-4 mr-1" />
              Export Debug Data
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Processing Errors</h4>
                <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4">
          {/* Left panel - Image visualization */}
          <div className="w-full md:w-3/5 space-y-3">
            <div className="flex justify-between items-center">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 lg:grid-cols-5">
                  <TabsTrigger value="original">Original</TabsTrigger>
                  {preprocessingSteps.map((step) => (
                    <TabsTrigger key={step.name} value={step.name}>
                      {step.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

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
                  <Switch id="highlight-messages" checked={highlightMessages} onCheckedChange={setHighlightMessages} />
                  <Label htmlFor="highlight-messages" className="text-sm">
                    <MessageSquare className="h-4 w-4 inline mr-1" />
                    Highlight Messages
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

            <div className="relative border rounded-md overflow-auto h-[400px] bg-gray-100 flex items-center justify-center">
              {originalImage ? (
                <canvas
                  ref={canvasRef}
                  className="max-w-full"
                  onClick={(e) => {
                    const canvas = canvasRef.current
                    if (!canvas) return

                    const rect = canvas.getBoundingClientRect()
                    const x = (e.clientX - rect.left) / (zoomLevel / 100)
                    const y = (e.clientY - rect.top) / (zoomLevel / 100)

                    // Find if we clicked on a text block
                    const clickedBlock = textBlocks.find((block) => {
                      const { boundingBox } = block
                      return (
                        x >= boundingBox.x &&
                        x <= boundingBox.x + boundingBox.width &&
                        y >= boundingBox.y &&
                        y <= boundingBox.y + boundingBox.height
                      )
                    })

                    setSelectedBlock(clickedBlock || null)
                  }}
                />
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <ImageIcon className="h-12 w-12 mb-2" />
                  <p>No image available</p>
                </div>
              )}
            </div>

            {selectedBlock && (
              <div className="p-3 bg-gray-50 border rounded-md">
                <h4 className="font-medium mb-1">Selected Text Block</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Text:</span> {selectedBlock.text}
                  </div>
                  <div>
                    <span className="font-medium">Confidence:</span> {selectedBlock.confidence.toFixed(1)}%
                  </div>
                  <div>
                    <span className="font-medium">Position:</span> x:{selectedBlock.boundingBox.x}, y:
                    {selectedBlock.boundingBox.y}
                  </div>
                  <div>
                    <span className="font-medium">Size:</span> w:{selectedBlock.boundingBox.width}, h:
                    {selectedBlock.boundingBox.height}
                  </div>
                  {selectedBlock.isMessage && (
                    <div className="col-span-2">
                      <span className="font-medium">Identified as:</span> Message from{" "}
                      {selectedBlock.sender || "unknown"}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right panel - Text and messages */}
          <div className="w-full md:w-2/5 space-y-3">
            <Tabs defaultValue="extracted">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="extracted">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Messages ({extractedMessages.length})
                </TabsTrigger>
                <TabsTrigger value="raw">
                  <FileText className="h-4 w-4 mr-1" />
                  Raw Text
                </TabsTrigger>
                <TabsTrigger value="blocks">
                  <Layers className="h-4 w-4 mr-1" />
                  Text Blocks ({textBlocks.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="extracted" className="mt-2">
                <div className="border rounded-md h-[400px] overflow-y-auto p-3 bg-white">
                  {extractedMessages.length > 0 ? (
                    <div className="space-y-3">
                      {extractedMessages.map((message, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg ${
                            message.sender === extractedMessages[0]?.sender
                              ? "bg-blue-50 border-blue-100 ml-4"
                              : "bg-gray-50 border-gray-100 mr-4"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-sm">{message.sender}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm">{message.text}</p>
                          {message.sentiment && (
                            <Badge
                              variant={
                                message.sentiment === "positive"
                                  ? "success"
                                  : message.sentiment === "negative"
                                    ? "destructive"
                                    : "outline"
                              }
                              className="mt-1 text-xs"
                            >
                              {message.sentiment}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <MessageSquare className="h-12 w-12 mb-2" />
                      <p>No messages extracted</p>
                    </div>
                  )}
                </div>

                <div className="mt-2 flex justify-between items-center">
                  <div>
                    <Badge variant={extractedMessages.length > 0 ? "success" : "destructive"}>
                      {extractedMessages.length} Messages Extracted
                    </Badge>
                  </div>

                  {onReprocess && (
                    <Button size="sm" onClick={() => onReprocess({ forceExtraction: true })}>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reprocess
                    </Button>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="raw" className="mt-2">
                <div className="border rounded-md h-[400px] overflow-y-auto p-3 bg-white">
                  {rawText ? (
                    <pre className="text-xs whitespace-pre-wrap font-mono">{rawText}</pre>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <FileText className="h-12 w-12 mb-2" />
                      <p>No raw text available</p>
                    </div>
                  )}
                </div>

                <div className="mt-2">
                  <Badge variant={rawText.length > 100 ? "success" : "warning"}>{rawText.length} Characters</Badge>
                </div>
              </TabsContent>

              <TabsContent value="blocks" className="mt-2">
                <div className="border rounded-md h-[400px] overflow-y-auto p-3 bg-white">
                  {textBlocks.length > 0 ? (
                    <div className="space-y-2">
                      {textBlocks.map((block, index) => (
                        <div
                          key={index}
                          className={`p-2 border rounded text-xs ${
                            selectedBlock === block
                              ? "border-pink-300 bg-pink-50"
                              : block.isMessage
                                ? "border-green-200 bg-green-50"
                                : "border-gray-200"
                          }`}
                          onClick={() => setSelectedBlock(block)}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-medium">Block #{index}</span>
                            <Badge
                              variant={
                                block.confidence >= 80 ? "success" : block.confidence >= 50 ? "warning" : "destructive"
                              }
                            >
                              {block.confidence.toFixed(1)}%
                            </Badge>
                          </div>
                          <p className="mt-1 font-mono">{block.text}</p>
                          <div className="mt-1 text-[10px] text-gray-500">
                            x:{block.boundingBox.x}, y:{block.boundingBox.y}, w:{block.boundingBox.width}, h:
                            {block.boundingBox.height}
                          </div>
                          {block.isMessage && (
                            <div className="mt-1 flex items-center">
                              <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                              <span className="text-green-700">Message from {block.sender}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <Layers className="h-12 w-12 mb-2" />
                      <p>No text blocks detected</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
