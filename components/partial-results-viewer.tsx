"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Message } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

interface PartialResultsViewerProps {
  partialMessages: Message[]
  processedImages: number
  totalImages: number
  processingComplete: boolean
  onContinueToAnalysis: () => void
}

export function PartialResultsViewer({
  partialMessages,
  processedImages,
  totalImages,
  processingComplete,
  onContinueToAnalysis,
}: PartialResultsViewerProps) {
  const [groupedMessages, setGroupedMessages] = useState<{ [sender: string]: Message[] }>({})
  const [selectedTab, setSelectedTab] = useState<string>("all")

  // Group messages by sender
  useEffect(() => {
    const grouped: { [sender: string]: Message[] } = {}

    partialMessages.forEach((message) => {
      const sender = message.isFromMe ? "User" : "Friend"
      if (!grouped[sender]) {
        grouped[sender] = []
      }
      grouped[sender].push(message)
    })

    setGroupedMessages(grouped)

    // Set default tab
    if (Object.keys(grouped).length > 0 && !Object.keys(grouped).includes(selectedTab) && selectedTab !== "all") {
      setSelectedTab("all")
    }
  }, [partialMessages, selectedTab])

  // Sort messages by timestamp
  const sortedMessages = [...partialMessages].sort((a, b) => {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  })

  return (
    <Card className="w-full mt-6 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            Partial Results
            <Badge variant="outline" className="ml-2">
              {processedImages} of {totalImages} images processed
            </Badge>
          </CardTitle>
          {processingComplete && <Button onClick={onContinueToAnalysis}>Continue to Analysis</Button>}
        </div>
        <p className="text-sm text-muted-foreground">
          {processingComplete
            ? "All images have been processed. You can now continue to the full analysis."
            : "Showing extracted messages as they are processed. Please wait while we complete the processing."}
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Messages ({partialMessages.length})</TabsTrigger>
            {Object.keys(groupedMessages).map((sender) => (
              <TabsTrigger key={sender} value={sender}>
                {sender} ({groupedMessages[sender].length})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {sortedMessages.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto p-1">
                {sortedMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${message.isFromMe ? "bg-blue-100 ml-12" : "bg-gray-100 mr-12"}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium">{message.isFromMe ? "User" : "Friend"}</span>
                      <span className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm">{message.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-12 w-5/6" />
                <p className="text-center text-sm text-gray-500 mt-4">Waiting for messages to be extracted...</p>
              </div>
            )}
          </TabsContent>

          {Object.keys(groupedMessages).map((sender) => (
            <TabsContent key={sender} value={sender} className="space-y-4">
              <div className="space-y-4 max-h-[400px] overflow-y-auto p-1">
                {groupedMessages[sender]
                  .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                  .map((message, index) => (
                    <div key={index} className={`p-3 rounded-lg ${message.isFromMe ? "bg-blue-100" : "bg-gray-100"}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium">{message.isFromMe ? "User" : "Friend"}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{message.text}</p>
                    </div>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
