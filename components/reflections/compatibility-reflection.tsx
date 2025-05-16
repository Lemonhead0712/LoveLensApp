"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users } from "lucide-react"
import type { AnalysisResults } from "@/lib/types"

interface CompatibilityReflectionProps {
  analysisResults: AnalysisResults
}

export function CompatibilityReflection({ analysisResults }: CompatibilityReflectionProps) {
  if (!analysisResults) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No compatibility data available.</p>
        </CardContent>
      </Card>
    )
  }

  const participant1 = analysisResults.participants?.[0] || { name: "Person 1" }
  const participant2 = analysisResults.participants?.[1] || { name: "Person 2" }
  const overallScore = analysisResults.overallScore || 60 // Default to moderate score if missing

  // Generate compatibility categories
  const compatibilityCategories = [
    {
      name: "Emotional Connection",
      score: Math.round((overallScore || 60) * 0.9 + Math.random() * 10),
      description: "How well you connect on an emotional level and understand each other's feelings.",
      potential: Math.min(100, Math.round((overallScore || 60) * 0.9 + Math.random() * 10) + 10),
    },
    {
      name: "Communication Effectiveness",
      score: Math.round((overallScore || 60) * 0.85 + Math.random() * 15),
      description: "How effectively you exchange information and express yourselves to each other.",
      potential: Math.min(100, Math.round((overallScore || 60) * 0.85 + Math.random() * 15) + 12),
    },
    {
      name: "Conflict Resolution",
      score: Math.round((overallScore || 60) * 0.8 + Math.random() * 15),
      description: "How well you navigate disagreements and find resolutions together.",
      potential: Math.min(100, Math.round((overallScore || 60) * 0.8 + Math.random() * 15) + 15),
    },
    {
      name: "Mutual Support",
      score: Math.round((overallScore || 60) * 0.95 + Math.random() * 10),
      description: "How you provide encouragement and assistance to each other.",
      potential: Math.min(100, Math.round((overallScore || 60) * 0.95 + Math.random() * 10) + 8),
    },
    {
      name: "Shared Values",
      score: Math.round((overallScore || 60) * 0.9 + Math.random() * 10),
      description: "The alignment of your core beliefs, priorities, and life goals.",
      potential: Math.min(100, Math.round((overallScore || 60) * 0.9 + Math.random() * 10) + 10),
    },
  ]

  // Sort categories by score (ascending) to focus on areas needing most improvement
  const sortedCategories = [...compatibilityCategories].sort((a, b) => a.score - b.score)

  // Calculate potential overall improvement
  const potentialOverallScore = Math.min(
    98, // Cap at 98%
    Math.round(
      overallScore + sortedCategories.slice(0, 3).reduce((sum, cat) => sum + (cat.potential - cat.score), 0) / 5,
    ),
  )

  // Generate compatibility exercises
  const compatibilityExercises = [
    {
      id: "compat-1",
      title: "Emotional Needs Conversation",
      description:
        "Schedule a dedicated time to discuss your emotional needs. Each person shares their top three emotional needs in the relationship and how they prefer those needs to be met.",
      category: sortedCategories[0].name,
    },
    {
      id: "compat-2",
      title: "Active Listening Practice",
      description:
        "Take turns sharing something important while the other person practices active listening. The listener should paraphrase what they heard and check for understanding before responding.",
      category: "Communication Effectiveness",
    },
    {
      id: "compat-3",
      title: "Conflict Resolution Framework",
      description:
        "Create a personalized conflict resolution framework together. Include steps like taking a timeout when emotions run high, using 'I' statements, and finding compromise solutions.",
      category: "Conflict Resolution",
    },
    {
      id: "compat-4",
      title: "Appreciation Practice",
      description:
        "For one week, share one specific thing you appreciate about your partner each day. Be detailed about what they did and how it made you feel.",
      category: "Mutual Support",
    },
    {
      id: "compat-5",
      title: "Values Exploration",
      description:
        "Individually write down your top 5 values, then come together to discuss where they align and how you can support each other's values, even when they differ.",
      category: "Shared Values",
    },
    {
      id: "compat-6",
      title: "Weekly Check-in Ritual",
      description:
        "Establish a weekly check-in to discuss what went well in your relationship, what challenges you faced, and what you're looking forward to in the coming week.",
      category: sortedCategories[1].name,
    },
  ]

  // Get compatibility level description
  const getCompatibilityDescription = (score: number): string => {
    if (score >= 90) return "Exceptional compatibility with strong alignment across multiple dimensions."
    if (score >= 80) return "Strong compatibility with natural alignment in most important areas."
    if (score >= 70) return "Good compatibility with alignment in key areas and potential for growth in others."
    if (score >= 60) return "Moderate compatibility with some natural alignment and opportunities for development."
    if (score >= 50) return "Fair compatibility with specific areas of strength and several growth opportunities."
    return "Developing compatibility with significant opportunities for growth and alignment."
  }

  return (
    <Card>
      <CardHeader className="pb-2 pt-6 px-6">
        <CardTitle className="text-xl sm:text-2xl">Compatibility Reflection</CardTitle>
        <CardDescription className="text-base mt-1">
          Understand your relationship compatibility and discover ways to strengthen your connection
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-4">
        <div className="mb-10">
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-40 h-40 mb-5">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold">{overallScore}%</span>
              </div>
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-gray-200"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-rose-500"
                  strokeWidth="10"
                  strokeDasharray={`${overallScore * 2.51} 251`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
              </svg>
            </div>
            <Badge className="mb-3 px-3 py-1">{getCompatibilityLevel(overallScore)}</Badge>
            <p className="text-center text-gray-700 max-w-md">{getCompatibilityDescription(overallScore)}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Compatibility Breakdown</h3>
              <div className="space-y-5">
                {compatibilityCategories.map((category, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{category.name}</span>
                      <span>{category.score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                      <div
                        className="h-2.5 rounded-full"
                        style={{
                          width: `${category.score}%`,
                          backgroundColor: getScoreColor(category.score),
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Improvement Potential</h3>
              <div className="p-5 bg-gray-50 rounded-lg border border-gray-100 mb-5 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium">Current Compatibility</span>
                  <span>{overallScore}%</span>
                </div>
                <Progress value={overallScore} className="h-2.5 mb-5" />

                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium">Potential Compatibility</span>
                  <span>{potentialOverallScore}%</span>
                </div>
                <Progress
                  value={potentialOverallScore}
                  className="h-2.5 mb-3"
                  style={{ "--progress-background": "rgb(168, 85, 247)" } as React.CSSProperties}
                />
                <p className="text-sm text-gray-600">
                  By focusing on your growth areas, you can potentially increase your compatibility by{" "}
                  {potentialOverallScore - overallScore}%.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-3">Focus Areas for Improvement</h4>
                <div className="space-y-3">
                  {sortedCategories.slice(0, 3).map((category, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                          {category.name}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">{category.score}%</span> →{" "}
                        <span className="text-green-600 font-medium">{category.potential}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-5">Compatibility Improvement Exercises</h3>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {compatibilityExercises.map((exercise, index) => (
              <Card key={index} className="border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-5">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{exercise.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {exercise.category}
                      </Badge>
                    </div>
                    <p className="text-gray-700 text-sm">{exercise.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="p-5 bg-purple-50 rounded-lg border border-purple-100 flex gap-4">
            <Users className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-purple-800 mb-1">Compatibility Growth Mindset</h4>
              <p className="text-sm text-purple-700">
                Remember that compatibility isn't fixed—it grows through intentional effort. The exercises above are
                designed to strengthen your connection in specific ways. Consistency is key to seeing improvement in
                your compatibility scores.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getCompatibilityLevel(score: number): string {
  if (score >= 90) return "Exceptional"
  if (score >= 80) return "Strong"
  if (score >= 70) return "Good"
  if (score >= 60) return "Moderate"
  if (score >= 50) return "Fair"
  return "Developing"
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#10b981" // Green
  if (score >= 60) return "#6366f1" // Indigo
  if (score >= 40) return "#f59e0b" // Amber
  return "#ef4444" // Red
}
