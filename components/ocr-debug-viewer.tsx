"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card-override"
import { Button } from "@/components/ui/button-override"

interface OcrDebugViewerProps {
  debugInfo: any
}

export function OcrDebugViewer({ debugInfo }: OcrDebugViewerProps) {
  const [expanded, setExpanded] = useState(false)

  if (!debugInfo) return null

  return (
    <Card className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">OCR Debug Information</h3>
        <Button onClick={() => setExpanded(!expanded)} variant="outline" className="h-7 text-xs">
          {expanded ? "Hide Details" : "Show Details"}
        </Button>
      </div>

      {expanded && (
        <div className="space-y-2">
          <div>
            <span className="font-medium">Stage:</span> {debugInfo.stage || "Unknown"}
          </div>

          {debugInfo.ocrConfidence !== undefined && (
            <div>
              <span className="font-medium">OCR Confidence:</span> {debugInfo.ocrConfidence.toFixed(2)}%
            </div>
          )}

          {debugInfo.textLength !== undefined && (
            <div>
              <span className="font-medium">Text Length:</span> {debugInfo.textLength} characters
            </div>
          )}

          {debugInfo.messageCount !== undefined && (
            <div>
              <span className="font-medium">Messages Extracted:</span> {debugInfo.messageCount}
            </div>
          )}

          {debugInfo.ocrError && (
            <div>
              <span className="font-medium">OCR Error:</span> {debugInfo.ocrError}
            </div>
          )}

          {debugInfo.errorMessage && (
            <div>
              <span className="font-medium">Error Message:</span> {debugInfo.errorMessage}
            </div>
          )}

          <div className="mt-3">
            <details>
              <summary className="cursor-pointer font-medium">Raw Debug Data</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </Card>
  )
}
