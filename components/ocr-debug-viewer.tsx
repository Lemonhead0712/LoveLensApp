"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-override"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OcrExtractionVisualizer } from "./ocr-extraction-visualizer"
import { PositionDetectionVisualizer } from "./position-detection-visualizer"
import type { Message } from "@/lib/types"

interface OcrDebugViewerProps {
  imageData: string | null
  ocrResult: {
    success: boolean
    messages: Message[]
    text?: string
    words?: any[]
    confidence?: number
    imageWidth?: number
    imageHeight?: number
    error?: string
    debugInfo?: any
  }
  onReprocess?: (options: any) => void
}

export function OcrDebugViewer({ imageData, ocrResult, onReprocess }: OcrDebugViewerProps) {
  const [activeTab, setActiveTab] = useState("extraction")

  // Extract text blocks from OCR result
  const textBlocks = ocrResult.words
    ? ocrResult.words.map((word) => ({
        text: word.text || "",
        boundingBox: {
          x: word.bbox?.x0 || 0,
          y: word.bbox?.y0 || 0,
          width: (word.bbox?.x1 || 0) - (word.bbox?.x0 || 0),
          height: (word.bbox?.y1 || 0) - (word.bbox?.y0 || 0),
        },
        confidence: word.confidence || 0,
      }))
    : []

  // Prepare data for the extraction visualizer
  const preprocessingSteps = ocrResult.debugInfo?.preprocessingSteps || []
  const errors = ocrResult.error ? [ocrResult.error] : []

  return (
    <Card className="w-full shadow-md border-pink-100 mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-pink-700">OCR Debug Viewer</CardTitle>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="extraction">Text Extraction</TabsTrigger>
            <TabsTrigger value="position">Position Detection</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="p-0">
        <TabsContent value="extraction" className="mt-0 p-4">
          <OcrExtractionVisualizer
            originalImage={imageData}
            preprocessingSteps={preprocessingSteps}
            rawText={ocrResult.text || ""}
            textBlocks={textBlocks}
            extractedMessages={ocrResult.messages || []}
            ocrConfidence={ocrResult.confidence || 0}
            processingTime={ocrResult.debugInfo?.processingTime || 0}
            errors={errors}
            onReprocess={onReprocess}
          />
        </TabsContent>

        <TabsContent value="position" className="mt-0 p-4">
          <PositionDetectionVisualizer
            originalImage={imageData}
            messages={ocrResult.messages || []}
            textBlocks={textBlocks}
            imageWidth={ocrResult.imageWidth || 800}
            imageHeight={ocrResult.imageHeight || 600}
            onReprocess={onReprocess ? () => onReprocess({ updatePositions: true }) : undefined}
          />
        </TabsContent>
      </CardContent>
    </Card>
  )
}
