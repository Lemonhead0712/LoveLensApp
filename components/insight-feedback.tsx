"use client"

import { useState, useEffect } from "react"
import { ThumbsUp, ThumbsDown, Brain } from "lucide-react"
import { Button } from "@/components/ui/button-override"

interface InsightFeedbackProps {
  insightId: string
  analysisId: string
  onFeedback?: (insightId: string, feedbackType: "accurate" | "inaccurate" | "thoughtProvoking") => void
}

export function InsightFeedback({ insightId, analysisId, onFeedback }: InsightFeedbackProps) {
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if feedback was previously submitted
  useEffect(() => {
    try {
      const storedFeedback = JSON.parse(localStorage.getItem("insightFeedback") || "{}")
      if (storedFeedback[insightId]) {
        setSelectedFeedback(storedFeedback[insightId])
        setIsSubmitted(true)
      }
    } catch (e) {
      console.error("Failed to retrieve feedback from localStorage:", e)
    }
  }, [insightId])

  const handleFeedback = async (type: "accurate" | "inaccurate" | "thoughtProvoking") => {
    if (isSubmitted || isSubmitting) return

    setIsSubmitting(true)
    setSelectedFeedback(type)

    try {
      // Call the feedback API
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ insightId, feedbackType: type, analysisId }),
      })

      if (!response.ok) {
        throw new Error(`Failed to submit feedback: ${response.status}`)
      }

      // Store feedback in localStorage to persist across sessions
      const storedFeedback = JSON.parse(localStorage.getItem("insightFeedback") || "{}")
      storedFeedback[insightId] = type
      localStorage.setItem("insightFeedback", JSON.stringify(storedFeedback))

      // Call the onFeedback callback if provided
      if (onFeedback) {
        onFeedback(insightId, type)
      }

      setIsSubmitted(true)
    } catch (error) {
      console.error("Error submitting feedback:", error)
      // Still mark as submitted locally even if API fails
      setIsSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center gap-1 mt-2">
      <span className="text-xs text-gray-500 mr-1">Was this insight helpful?</span>
      <Button
        variant="ghost"
        size="sm"
        className={`p-1 h-8 w-8 rounded-full ${selectedFeedback === "accurate" ? "bg-green-100 text-green-600" : ""}`}
        onClick={() => handleFeedback("accurate")}
        disabled={isSubmitted || isSubmitting}
        title="Accurate"
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`p-1 h-8 w-8 rounded-full ${selectedFeedback === "inaccurate" ? "bg-red-100 text-red-600" : ""}`}
        onClick={() => handleFeedback("inaccurate")}
        disabled={isSubmitted || isSubmitting}
        title="Inaccurate"
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`p-1 h-8 w-8 rounded-full ${
          selectedFeedback === "thoughtProvoking" ? "bg-purple-100 text-purple-600" : ""
        }`}
        onClick={() => handleFeedback("thoughtProvoking")}
        disabled={isSubmitted || isSubmitting}
        title="Made me think"
      >
        <Brain className="h-4 w-4" />
      </Button>

      {isSubmitting && <span className="text-xs text-gray-500 ml-1">Submitting...</span>}
      {isSubmitted && !isSubmitting && <span className="text-xs text-gray-500 ml-1">Thanks for your feedback!</span>}
    </div>
  )
}
