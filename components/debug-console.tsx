"use client"

import { useState, useEffect } from "react"
import { MonacoProvider } from "./monaco-provider"
import dynamic from "next/dynamic"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Dynamically import Monaco Editor
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md"></div>,
})

interface DebugConsoleProps {
  analysisData?: any
  processingLogs?: string[]
  showInProduction?: boolean
}

export function DebugConsole({ analysisData, processingLogs = [], showInProduction = false }: DebugConsoleProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [environment, setEnvironment] = useState<string | null>(null)

  useEffect(() => {
    // Check if we're in development environment
    setEnvironment(process.env.NODE_ENV)
  }, [])

  // Only show in development or if explicitly allowed in production
  if (environment === "production" && !showInProduction) {
    return null
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={() => setIsVisible(true)} variant="outline" size="sm">
          Show Debug Console
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg h-96">
      <Card className="rounded-none h-full">
        <CardHeader className="py-2 px-4 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm">Debug Console</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100%-49px)]">
          <MonacoProvider>
            <Tabs defaultValue="data" className="h-full">
              <TabsList className="px-4 pt-2">
                <TabsTrigger value="data">Analysis Data</TabsTrigger>
                <TabsTrigger value="logs">Processing Logs</TabsTrigger>
              </TabsList>
              <TabsContent value="data" className="h-[calc(100%-40px)]">
                <MonacoEditor
                  height="100%"
                  language="json"
                  value={analysisData ? JSON.stringify(analysisData, null, 2) : "No data available"}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    folding: true,
                    lineNumbers: "on",
                    wordWrap: "on",
                    automaticLayout: true,
                  }}
                />
              </TabsContent>
              <TabsContent value="logs" className="h-[calc(100%-40px)]">
                <MonacoEditor
                  height="100%"
                  language="text"
                  value={processingLogs.join("\n") || "No logs available"}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    folding: true,
                    lineNumbers: "on",
                    wordWrap: "on",
                    automaticLayout: true,
                  }}
                />
              </TabsContent>
            </Tabs>
          </MonacoProvider>
        </CardContent>
      </Card>
    </div>
  )
}
