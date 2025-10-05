"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Share2, Heart, TrendingUp, AlertCircle } from "lucide-react"
import { OptimizedBarChart } from "./optimized-bar-chart"

interface AnalysisResultsProps {
  analysisData: any
}

export default function EnhancedAnalysisResults({ analysisData }: AnalysisResultsProps) {
  const handleExport = async () => {
    try {
      const response = await fetch("/api/export-word", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(analysisData),
      })

      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "relationship-analysis.docx"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Export error:", error)
      alert("Failed to export results. Please try again.")
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "My Relationship Analysis",
        text: "Check out my relationship analysis results!",
        url: window.location.href,
      })
    } else {
      alert("Sharing is not supported on this browser")
    }
  }

  const getHealthColor = (score: number) => {
    if (score >= 8) return "text-green-600"
    if (score >= 6) return "text-yellow-600"
    return "text-red-600"
  }

  const getHealthBadge = (score: number) => {
    if (score >= 8) return { label: "Excellent", color: "bg-green-100 text-green-800 border-green-300" }
    if (score >= 6) return { label: "Good", color: "bg-yellow-100 text-yellow-800 border-yellow-300" }
    return { label: "Needs Attention", color: "bg-red-100 text-red-800 border-red-300" }
  }

  const healthBadge = getHealthBadge(analysisData.overallRelationshipHealth)

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Heart className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Relationship Analysis Results</h1>
          </div>
          <p className="text-gray-600">Your comprehensive relationship insights</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <Button onClick={handleExport} className="bg-purple-600 hover:bg-purple-700">
            <Download className="w-4 h-4 mr-2" />
            Export to Word
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            className="border-purple-300 text-purple-600 hover:bg-purple-50 bg-transparent"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Results
          </Button>
        </div>

        {/* Overall Health Score */}
        <Card className="mb-6 border-purple-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-xl font-semibold text-gray-800">Overall Relationship Health</span>
              <Badge className={healthBadge.color}>{healthBadge.label}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className={`text-5xl font-bold ${getHealthColor(analysisData.overallRelationshipHealth)}`}>
                {analysisData.overallRelationshipHealth.toFixed(1)}
                <span className="text-2xl text-gray-500">/10</span>
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full transition-all duration-1000"
                    style={{ width: `${(analysisData.overallRelationshipHealth / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="border-purple-200 shadow-lg">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Emotional Connection</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analysisData.emotionalConnection?.toFixed(1) || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 shadow-lg">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-pink-600" />
                <div>
                  <p className="text-sm text-gray-600">Communication Quality</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analysisData.communicationQuality?.toFixed(1) || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 shadow-lg">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Conflict Resolution</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analysisData.conflictResolution?.toFixed(1) || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        {analysisData.communicationPatterns && (
          <div className="mb-6">
            <OptimizedBarChart data={analysisData.communicationPatterns} title="Communication Patterns Analysis" />
          </div>
        )}

        {analysisData.emotionalIntelligence && (
          <div className="mb-6">
            <OptimizedBarChart data={analysisData.emotionalIntelligence} title="Emotional Intelligence Scores" />
          </div>
        )}

        {/* Detailed Sections */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Strengths */}
          {analysisData.strengths && analysisData.strengths.length > 0 && (
            <Card className="border-purple-200 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold text-gray-800">Relationship Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysisData.strengths.map((strength: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Areas for Growth */}
          {analysisData.areasForGrowth && analysisData.areasForGrowth.length > 0 && (
            <Card className="border-purple-200 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold text-gray-800">Areas for Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysisData.areasForGrowth.map((area: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-orange-600 mt-1">→</span>
                      <span className="text-gray-700">{area}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recommendations */}
        {analysisData.recommendations && analysisData.recommendations.length > 0 && (
          <Card className="border-purple-200 shadow-lg mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold text-gray-800">Personalized Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisData.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        {analysisData.summary && (
          <Card className="border-purple-200 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold text-gray-800">Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{analysisData.summary}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
