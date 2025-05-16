"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"
import type { AnalysisResults } from "@/lib/types"

interface ImprovementPlanProps {
  analysisResults: AnalysisResults
}

export function ImprovementPlan({ analysisResults }: ImprovementPlanProps) {
  if (!analysisResults) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No improvement plan data available.</p>
        </CardContent>
      </Card>
    )
  }

  const participant1 = analysisResults.participants?.[0] || { name: "Person 1" }
  const participant2 = analysisResults.participants?.[1] || { name: "Person 2" }

  // Generate suggested goals based on analysis results with null-safety
  const generateSuggestedGoals = (): { text: string; category: string }[] => {
    const suggestions: { text: string; category: string }[] = []
    const emotionalBreakdown = analysisResults.emotionalBreakdown || {}
    const gottmanScores = analysisResults.gottmanScores || {}

    // Add suggestions based on emotional intelligence
    if ((emotionalBreakdown.empathy || 70) < 60) {
      suggestions.push({
        text: "Practice perspective-taking in daily conversations",
        category: "Emotional Intelligence",
      })
    }

    if ((emotionalBreakdown.emotionalRegulation || 70) < 60) {
      suggestions.push({
        text: "Learn and practice 3 emotional regulation techniques",
        category: "Emotional Intelligence",
      })
    }

    // Add suggestions based on Gottman scores
    if ((gottmanScores.criticism || 30) > 30) {
      suggestions.push({
        text: "Replace criticism with gentle startups using the XYZ format",
        category: "Relationship",
      })
    }

    if ((gottmanScores.turnTowards || 70) < 60) {
      suggestions.push({
        text: "Notice and respond to emotional bids at least 3 times daily",
        category: "Relationship",
      })
    }

    // Add communication suggestions
    if (
      participant1.communicationStyle?.includes("Direct") &&
      participant2.communicationStyle?.includes("Supportive")
    ) {
      suggestions.push({
        text: "Practice softening my communication style when discussing sensitive topics",
        category: "Communication",
      })
    }

    // Add general suggestions if we don't have enough specific ones
    if (suggestions.length < 3) {
      suggestions.push({
        text: "Schedule a weekly relationship check-in to discuss needs and appreciation",
        category: "Communication",
      })

      suggestions.push({
        text: "Create a shared vision for our relationship's future",
        category: "Relationship",
      })
    }

    return suggestions.slice(0, 6) // Return at most 6 suggestions
  }

  const suggestedGoals = generateSuggestedGoals()

  return (
    <Card>
      <CardHeader className="pb-3 pt-6 px-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-rose-500" />
          <CardTitle className="text-xl sm:text-2xl">Recommended Growth Exercises</CardTitle>
        </div>
        <CardDescription className="text-base">
          Based on your analysis results, we recommend focusing on these specific areas
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {suggestedGoals.map((suggestion, index) => (
            <div
              key={index}
              className="p-4 sm:p-5 bg-rose-50 rounded-lg border border-rose-100 hover:shadow-md transition-shadow"
            >
              <div>
                <p className="font-medium text-gray-800 mb-3">{suggestion.text}</p>
                <Badge variant="outline" className="text-xs bg-rose-100 text-rose-800 border-rose-200 px-2.5 py-1">
                  {suggestion.category}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="p-5 bg-blue-50 rounded-lg border border-blue-100">
          <h4 className="font-medium text-blue-800 mb-2">Consistency is Key</h4>
          <p className="text-sm text-blue-700">
            Emotional intelligence and relationship skills improve with consistent practice. Try to incorporate these
            exercises into your daily routine for at least 3 weeks to see meaningful improvement.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
