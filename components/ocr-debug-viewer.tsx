"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { isDevelopment } from "@/lib/env-utils"

interface OcrDebugViewerProps {
  rawText: string
  preprocessedText?: string
  extractedMessages: any[]
  processingTime?: number
  confidence?: number
  errors?: string[]
}

export function OcrDebugViewer({
  rawText,
  preprocessedText,
  extractedMessages,
  processingTime,
  confidence,
  errors = [],
}: OcrDebugViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Only show in development mode
  if (!isDevelopment()) {
    return null
  }

  return (
    <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
      <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
        <h3 className="font-medium text-gray-700">OCR Debug Information</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
        >
          {isExpanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white p-3 rounded border border-gray-200">
              <div className="text-xs font-medium text-gray-500 mb-1">Processing Time</div>
              <div className="font-mono">{processingTime ? `${processingTime.toFixed(2)}ms` : "N/A"}</div>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200">
              <div className="text-xs font-medium text-gray-500 mb-1">Confidence</div>
              <div className="font-mono">{confidence ? `${(confidence * 100).toFixed(1)}%` : "N/A"}</div>
            </div>
            <div className="bg-white p-3 rounded border border-gray-200">
              <div className="text-xs font-medium text-gray-500 mb-1">Messages Extracted</div>
              <div className="font-mono">{extractedMessages.length}</div>
            </div>
          </div>

          {errors.length > 0 && (
            <div className="mb-4 bg-red-50 border border-red-200 p-3 rounded">
              <div className="text-xs font-medium text-red-700 mb-1">Errors</div>
              <ul className="text-xs text-red-600 font-mono">
                {errors.map((error, i) => (
                  <li key={i} className="mb-1">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Tabs defaultValue="raw">
            <TabsList className="mb-2">
              <TabsTrigger value="raw">Raw Text</TabsTrigger>
              <TabsTrigger value="preprocessed">Preprocessed</TabsTrigger>
              <TabsTrigger value="messages">Extracted Messages</TabsTrigger>
            </TabsList>
            <TabsContent value="raw" className="mt-0">
              <pre className="bg-white p-3 rounded border border-gray-200 text-xs font-mono overflow-auto max-h-60">
                {rawText || "No raw text available"}
              </pre>
            </TabsContent>
            <TabsContent value="preprocessed" className="mt-0">
              <pre className="bg-white p-3 rounded border border-gray-200 text-xs font-mono overflow-auto max-h-60">
                {preprocessedText || "No preprocessed text available"}
              </pre>
            </TabsContent>
            <TabsContent value="messages" className="mt-0">
              <pre className="bg-white p-3 rounded border border-gray-200 text-xs font-mono overflow-auto max-h-60">
                {JSON.stringify(extractedMessages, null, 2) || "No messages extracted"}
              </pre>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
