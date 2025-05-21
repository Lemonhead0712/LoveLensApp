"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Message } from "@/lib/types"

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
  const [activeTab, setActiveTab] = useState("all")

  // Group messages by sender
  const messagesBySender: Record<string, Message[]> = {}
  partialMessages.forEach((message) => {
    if (!messagesBySender[message.sender]) {
      messagesBySender[message.sender] = []
    }
    messagesBySender[message.sender].push(message)
  })

  // Get unique senders
  const senders = Object.keys(messagesBySender)

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Partial Results</span>
          <span className="text-sm font-normal">
            {processedImages} of {totalImages} images processed
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="all" className="flex-1">
              All Messages ({partialMessages.length})
            </TabsTrigger>
            {senders.map((sender) => (
              <TabsTrigger key={sender} value={sender} className="flex-1">
                {sender} ({messagesBySender[sender].length})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="max-h-80 overflow-y-auto space-y-2">
              {partialMessages.length > 0 ? (
                partialMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${message.isFromMe ? "bg-blue-100 ml-8" : "bg-gray-100 mr-8"}`}
                  >
                    <div className="text-xs text-gray-500 mb-1">{message.sender}</div>
                    <div>{message.text}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No messages processed yet</div>
              )}
            </div>
          </TabsContent>

          {senders.map((sender) => (
            <TabsContent key={sender} value={sender} className="space-y-4">
              <div className="max-h-80 overflow-y-auto space-y-2">
                {messagesBySender[sender].map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${message.isFromMe ? "bg-blue-100 ml-8" : "bg-gray-100 mr-8"}`}
                  >
                    <div className="text-xs text-gray-500 mb-1">{message.sender}</div>
                    <div>{message.text}</div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {processingComplete && (
          <Button onClick={onContinueToAnalysis} className="w-full mt-4">
            Continue to Analysis
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
