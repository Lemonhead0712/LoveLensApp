import { format, isToday, isYesterday } from "date-fns"
import { AlertTriangle, CheckCircle, Heart, ThumbsUp, ThumbsDown } from "lucide-react"
import type { Message } from "@/lib/types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface MessageListProps {
  messages: Message[]
  firstPersonName: string
  highlightedMessageId?: string
}

function MessageList({ messages, firstPersonName, highlightedMessageId }: MessageListProps) {
  // Group messages by date
  const groupedMessages: { [key: string]: Message[] } = {}

  messages.forEach((message) => {
    const date = new Date(message.timestamp)
    const dateKey = format(date, "yyyy-MM-dd")

    if (!groupedMessages[dateKey]) {
      groupedMessages[dateKey] = []
    }

    groupedMessages[dateKey].push(message)
  })

  // Sort dates
  const sortedDates = Object.keys(groupedMessages).sort()

  return (
    <div className="space-y-6">
      {sortedDates.map((dateKey) => (
        <div key={dateKey} className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">{formatDateHeader(dateKey)}</div>
          </div>

          {groupedMessages[dateKey].map((message, index) => {
            // Use position property if available, otherwise fall back to sender comparison
            const isFirstPerson =
              message.position === "right" || (message.position === undefined && message.sender === firstPersonName)
            const prevMessage = index > 0 ? groupedMessages[dateKey][index - 1] : null
            const isSameSenderAsPrev = prevMessage && prevMessage.sender === message.sender
            const showSender = !isSameSenderAsPrev
            const isHighlighted = message.id === highlightedMessageId

            // Determine sentiment class and icon
            const sentimentData = getSentimentData(message.sentiment || 50)

            return (
              <div
                key={message.id || index}
                id={`message-${message.id || index}`}
                className={`flex ${isFirstPerson ? "justify-end" : "justify-start"} ${
                  isHighlighted ? "animate-pulse" : ""
                }`}
              >
                <div
                  className={`max-w-[80%] md:max-w-[70%] rounded-lg p-3 ${
                    isFirstPerson
                      ? "bg-rose-100 text-gray-800 rounded-tr-none"
                      : "bg-gray-100 text-gray-800 rounded-tl-none"
                  } ${showSender ? "" : isFirstPerson ? "mr-4" : "ml-4"} ${
                    isHighlighted ? "ring-2 ring-rose-500 ring-offset-2" : ""
                  }`}
                >
                  {showSender && (
                    <div className="flex items-center mb-1">
                      <span className={`text-xs font-medium ${isFirstPerson ? "text-rose-600" : "text-gray-600"}`}>
                        {message.sender}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">{formatTime(message.timestamp)}</span>

                      {/* Add confidence indicator if available */}
                      {message.confidence && (
                        <span className="ml-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  className={`inline-block w-2 h-2 rounded-full ${
                                    message.confidence >= 80
                                      ? "bg-green-500"
                                      : message.confidence >= 60
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                  }`}
                                ></span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>OCR Confidence: {message.confidence.toFixed(1)}%</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-start">
                    <p className="flex-1">{message.text}</p>

                    {message.sentiment && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`ml-2 mt-1 text-${sentimentData.color}-500`}>{sentimentData.icon}</div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Sentiment: {sentimentData.label} ({message.sentiment}%)
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>

                  <div className="flex justify-end mt-1">
                    <span className="text-xs text-gray-500">{!showSender && formatTime(message.timestamp)}</span>

                    {message.status && (
                      <span className="text-xs text-gray-500 ml-1">
                        {message.status === "read" ? (
                          <CheckCircle className="h-3 w-3 text-blue-500 inline ml-1" />
                        ) : (
                          <CheckCircle className="h-3 w-3 text-gray-400 inline ml-1" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function formatDateHeader(dateKey: string): string {
  const date = new Date(dateKey)

  if (isToday(date)) {
    return "Today"
  } else if (isYesterday(date)) {
    return "Yesterday"
  } else {
    return format(date, "MMMM d, yyyy")
  }
}

function formatTime(timestamp: string): string {
  try {
    return format(new Date(timestamp), "h:mm a")
  } catch (error) {
    return ""
  }
}

function getSentimentData(sentiment: number) {
  if (sentiment >= 80) {
    return {
      icon: <Heart className="h-3 w-3" />,
      color: "rose",
      label: "Very Positive",
    }
  } else if (sentiment >= 60) {
    return {
      icon: <ThumbsUp className="h-3 w-3" />,
      color: "green",
      label: "Positive",
    }
  } else if (sentiment >= 40) {
    return {
      icon: null,
      color: "gray",
      label: "Neutral",
    }
  } else if (sentiment >= 20) {
    return {
      icon: <ThumbsDown className="h-3 w-3" />,
      color: "amber",
      label: "Negative",
    }
  } else {
    return {
      icon: <AlertTriangle className="h-3 w-3" />,
      color: "red",
      label: "Very Negative",
    }
  }
}

export default MessageList
