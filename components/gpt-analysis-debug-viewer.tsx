"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-override"
import { Button } from "@/components/ui/button-override"
import type { GPTEmotionalAnalysis } from "@/lib/gpt-ei-service"

interface GPTAnalysisDebugViewerProps {
  analysis: GPTEmotionalAnalysis | null
  error?: string | null
}

export function GPTAnalysisDebugViewer({ analysis, error }: GPTAnalysisDebugViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Only show in development mode
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  if (!analysis && !error) {
    return null
  }

  return (
    <Card className="mt-4 border-dashed border-amber-300 bg-amber-50">
      <CardHeader className="py-2 flex flex-row items-center justify-between bg-amber-100">
        <CardTitle className="text-sm font-medium text-amber-800">
          GPT Analysis Debug {error ? "(Error)" : ""}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 px-2 text-xs text-amber-800 hover:bg-amber-200"
        >
          {isExpanded ? "Hide" : "Show"}
        </Button>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-4 text-xs font-mono overflow-auto max-h-96 bg-amber-50">
          {error ? (
            <div className="text-red-500">
              <h3 className="font-bold mb-2">Error:</h3>
              <p>{error}</p>
            </div>
          ) : (
            <>
              <h3 className="font-bold mb-2">Metadata:</h3>
              <pre className="bg-amber-100 p-2 rounded mb-4 overflow-auto">
                {JSON.stringify(analysis?._metadata || {}, null, 2)}
              </pre>

              <h3 className="font-bold mb-2">Raw Analysis:</h3>
              <pre className="bg-amber-100 p-2 rounded overflow-auto">{JSON.stringify(analysis, null, 2)}</pre>
            </>
          )}
        </CardContent>
      )}
    </Card>
  )
}
