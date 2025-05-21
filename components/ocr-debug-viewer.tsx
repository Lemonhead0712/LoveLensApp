"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Message } from "@/lib/types"
import PositionDetectionVisualizer from "./position-detection-visualizer"

interface OcrDebugViewerProps {
  ocrResults: any
  messages: Message[]
  imageData?: string
}

export default function OcrDebugViewer({ ocrResults, messages, imageData }: OcrDebugViewerProps) {
  const [activeTab, setActiveTab] = useState("text")

  // Extract image metadata if available
  const imageWidth = ocrResults?.imageMetadata?.width || 1000
  const imageHeight = ocrResults?.imageMetadata?.height || 800

  // Count messages by position
  const leftMessages = messages.filter((m) => m.position === "left").length
  const rightMessages = messages.filter((m) => m.position === "right").length
  const unknownMessages = messages.filter((m) => !m.position).length

  return (
    <div className="ocr-debug-viewer border rounded-lg p-4 bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">OCR Debug Information</h2>

      <div className="mb-4">
        <h3 className="text-lg font-semibold">Message Position Summary</h3>
        <div className="grid grid-cols-3 gap-4 mt-2">
          <div className="bg-blue-100 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold">{leftMessages}</div>
            <div className="text-sm">Left Messages</div>
          </div>
          <div className="bg-green-100 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold">{rightMessages}</div>
            <div className="text-sm">Right Messages</div>
          </div>
          {unknownMessages > 0 && (
            <div className="bg-yellow-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold">{unknownMessages}</div>
              <div className="text-sm">Unknown Position</div>
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="text">Extracted Text</TabsTrigger>
          <TabsTrigger value="position">Position Detection</TabsTrigger>
          <TabsTrigger value="raw">Raw OCR Data</TabsTrigger>
        </TabsList>

        <TabsContent value="text">
          <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2 mb-2 rounded ${
                    msg.position === "left" ? "bg-blue-50" : msg.position === "right" ? "bg-green-50" : "bg-gray-200"
                  }`}
                >
                  <strong>{msg.position || "unknown"}: </strong>
                  {msg.text}
                  {msg.confidence !== undefined && (
                    <span className="text-xs text-gray-500"> (Confidence: {Math.round(msg.confidence * 100)}%)</span>
                  )}
                </div>
              ))}
            </pre>
          </div>
        </TabsContent>

        <TabsContent value="position">
          <PositionDetectionVisualizer
            messages={messages}
            imageData={imageData}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
          />
        </TabsContent>

        <TabsContent value="raw">
          <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(ocrResults, null, 2)}</pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
