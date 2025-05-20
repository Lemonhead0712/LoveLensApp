"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import EmotionalRadarChart from "@/components/emotional-radar-chart"
import { InfoIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { EmotionalBreakdown } from "@/lib/types"

interface EmotionalIntelligenceBreakdownProps {
  participant1: {
    name: string
    emotionalBreakdown: EmotionalBreakdown
    score: number
  }
  participant2: {
    name: string
    emotionalBreakdown: EmotionalBreakdown
    score: number
  }
  insights: string[]
  recommendations: string[]
}

function EmotionalIntelligenceBreakdown({
  participant1,
  participant2,
  insights,
  recommendations,
}: EmotionalIntelligenceBreakdownProps) {
  const eiCategories = [
    {
      name: "Empathy",
      key: "empathy",
      description: "The ability to understand and share the feelings of another.",
    },
    {
      name: "Self-Awareness",
      key: "selfAwareness",
      description: "Conscious knowledge of one's own character, feelings, motives, and desires.",
    },
    {
      name: "Social Skills",
      key: "socialSkills",
      description: "Skills used to communicate and interact with others, both verbally and non-verbally.",
    },
    {
      name: "Emotional Regulation",
      key: "emotionalRegulation",
      description: "The ability to respond to ongoing demands with a range of emotions that are socially acceptable.",
    },
    {
      name: "Motivation",
      key: "motivation",
      description: "Internal and external factors that stimulate desire and energy to be continually interested.",
    },
    {
      name: "Adaptability",
      key: "adaptability",
      description: "The quality of being able to adjust to new conditions or changing circumstances.",
    },
  ]

  // Verify that we have valid data
  const hasValidData =
    participant1 &&
    participant2 &&
    participant1.emotionalBreakdown &&
    participant2.emotionalBreakdown &&
    typeof participant1.score === "number" &&
    typeof participant2.score === "number"

  if (!hasValidData) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Emotional intelligence data is not available or is being processed.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        <CardHeader className="pb-4 pt-6 px-6">
          <CardTitle className="text-xl">Emotional Intelligence Comparison</CardTitle>
          <CardDescription className="text-base">
            Comparing emotional intelligence dimensions between {participant1.name} and {participant2.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h3 className="text-lg font-medium mb-5 text-center">{participant1.name}</h3>
              <div className="mb-6">
                <EmotionalRadarChart data={participant1.emotionalBreakdown} color="rgba(244, 63, 94, 0.8)" />
              </div>
              <div className="text-center">
                <span className="text-4xl font-bold">{participant1.score}%</span>
                <p className="text-gray-600 mt-1">Overall EI Score</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-5 text-center">{participant2.name}</h3>
              <div className="mb-6">
                <EmotionalRadarChart data={participant2.emotionalBreakdown} color="rgba(59, 130, 246, 0.8)" />
              </div>
              <div className="text-center">
                <span className="text-4xl font-bold">{participant2.score}%</span>
                <p className="text-gray-600 mt-1">Overall EI Score</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="pb-4 pt-6 px-6">
          <CardTitle className="text-xl">Emotional Intelligence Components</CardTitle>
          <CardDescription className="text-base">
            Detailed breakdown of each emotional intelligence dimension
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h3 className="text-lg font-medium mb-5">{participant1.name}'s EI Breakdown</h3>
              <div className="space-y-6">
                {eiCategories.map((category, index) => {
                  const score = participant1.emotionalBreakdown[category.key as keyof EmotionalBreakdown]
                  if (typeof score !== "number") return null

                  return (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <span className="font-medium">{category.name}</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InfoIcon className="h-4 w-4 text-gray-400 ml-1.5 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{category.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <span className="font-semibold">{score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div
                          className="h-2.5 rounded-full"
                          style={{
                            width: `${score}%`,
                            backgroundColor: getScoreColor(score),
                          }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-5">{participant2.name}'s EI Breakdown</h3>
              <div className="space-y-6">
                {eiCategories.map((category, index) => {
                  const score = participant2.emotionalBreakdown[category.key as keyof EmotionalBreakdown]
                  if (typeof score !== "number") return null

                  return (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <span className="font-medium">{category.name}</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InfoIcon className="h-4 w-4 text-gray-400 ml-1.5 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{category.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <span className="font-semibold">{score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div
                          className="h-2.5 rounded-full"
                          style={{
                            width: `${score}%`,
                            backgroundColor: getScoreColor(score),
                          }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="pb-4 pt-6 px-6">
          <CardTitle className="text-xl">Insights & Recommendations</CardTitle>
          <CardDescription className="text-base">Based on the emotional intelligence analysis</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h3 className="text-lg font-medium mb-4">Key Insights</h3>
              {insights && insights.length > 0 ? (
                <ul className="space-y-3">
                  {insights.map((insight, index) => (
                    <li key={index} className="flex">
                      <span className="mr-2.5 text-rose-500">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No insights available from the analysis.</p>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Recommendations</h3>
              {recommendations && recommendations.length > 0 ? (
                <ul className="space-y-3">
                  {recommendations.map((recommendation, index) => (
                    <li key={index} className="flex">
                      <span className="mr-2.5 text-blue-500">•</span>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No recommendations available from the analysis.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#10b981" // Green
  if (score >= 60) return "#6366f1" // Indigo
  if (score >= 40) return "#f59e0b" // Amber
  return "#ef4444" // Red
}

// Add named export for backward compatibility
export { EmotionalIntelligenceBreakdown }

export default EmotionalIntelligenceBreakdown
