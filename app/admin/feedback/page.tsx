"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card-override"
import { Button } from "@/components/ui/button-override"
import { ThumbsUp, ThumbsDown, Brain, RefreshCw } from "lucide-react"

interface FeedbackItem {
  insightId: string
  feedbackType: "accurate" | "inaccurate" | "thoughtProvoking"
  analysisId: string
  timestamp: string
  anonymizedIp: string
}

interface FeedbackCounts {
  [key: string]: number
}

export default function FeedbackDashboard() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [counts, setCounts] = useState<FeedbackCounts>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFeedback = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/feedback")
      if (!response.ok) {
        throw new Error(`Failed to fetch feedback: ${response.status}`)
      }
      const data = await response.json()
      setFeedback(data.feedback || [])
      setCounts(data.counts || {})
    } catch (error) {
      console.error("Error fetching feedback:", error)
      setError("Failed to load feedback data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeedback()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Insight Feedback Dashboard</h1>
        <Button onClick={fetchFeedback} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <FeedbackSummaryCard
          title="Accurate Insights"
          icon={<ThumbsUp className="h-5 w-5 text-green-600" />}
          count={Object.entries(counts).reduce(
            (sum, [key, value]) => (key.includes(":accurate") ? sum + value : sum),
            0,
          )}
          color="green"
        />
        <FeedbackSummaryCard
          title="Inaccurate Insights"
          icon={<ThumbsDown className="h-5 w-5 text-red-600" />}
          count={Object.entries(counts).reduce(
            (sum, [key, value]) => (key.includes(":inaccurate") ? sum + value : sum),
            0,
          )}
          color="red"
        />
        <FeedbackSummaryCard
          title="Thought-Provoking Insights"
          icon={<Brain className="h-5 w-5 text-purple-600" />}
          count={Object.entries(counts).reduce(
            (sum, [key, value]) => (key.includes(":thoughtProvoking") ? sum + value : sum),
            0,
          )}
          color="purple"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
          <CardDescription>The most recent user feedback on insights</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : feedback.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No feedback data available yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Insight ID</th>
                    <th className="px-4 py-2 text-left">Feedback</th>
                    <th className="px-4 py-2 text-left">Analysis ID</th>
                    <th className="px-4 py-2 text-left">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {feedback.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{item.insightId}</td>
                      <td className="px-4 py-2">
                        <FeedbackTypeIcon type={item.feedbackType} />
                      </td>
                      <td className="px-4 py-2">{item.analysisId}</td>
                      <td className="px-4 py-2">{new Date(item.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function FeedbackSummaryCard({
  title,
  icon,
  count,
  color,
}: {
  title: string
  icon: React.ReactNode
  count: number
  color: "green" | "red" | "purple"
}) {
  const bgColor = {
    green: "bg-green-50",
    red: "bg-red-50",
    purple: "bg-purple-50",
  }[color]

  return (
    <Card className={bgColor}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold">{count}</p>
          </div>
          <div className="p-3 rounded-full bg-white">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function FeedbackTypeIcon({ type }: { type: "accurate" | "inaccurate" | "thoughtProvoking" }) {
  switch (type) {
    case "accurate":
      return <ThumbsUp className="h-4 w-4 text-green-600" />
    case "inaccurate":
      return <ThumbsDown className="h-4 w-4 text-red-600" />
    case "thoughtProvoking":
      return <Brain className="h-4 w-4 text-purple-600" />
  }
}
