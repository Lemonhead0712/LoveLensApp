"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-override"
import { Lightbulb } from "lucide-react"

interface EmotionalInsightSummaryProps {
  insights: string[]
  title?: string
}

function EmotionalInsightSummary({ insights, title = "Emotional Insights" }: EmotionalInsightSummaryProps) {
  if (!insights || insights.length === 0) {
    return null
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg md:text-xl flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-purple-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {insights.map((insight, index) => (
            <li key={index} className="flex gap-2">
              <span className="text-purple-500 font-medium">•</span>
              <p className="text-gray-700">{insight}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export default EmotionalInsightSummary
