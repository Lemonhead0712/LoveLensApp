"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  BarChart3,
  Download,
  Heart,
  MessageSquare,
  TrendingUp,
  Users,
  Info,
  Lightbulb,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Target,
  Sparkles,
  Brain,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"

interface AnalysisResultsProps {
  results: any
}

export default function EnhancedAnalysisResults({ results }: AnalysisResultsProps) {
  const [isExporting, setIsExporting] = useState(false)

  // Optimized chart data processing with memoization
  const emotionalChartData = useMemo(() => {
    const data = results?.visualInsightsData?.emotionalCommunicationCharacteristics
    if (!Array.isArray(data) || data.length === 0) return []

    return data.map((item: any) => ({
      category: item.category || "Unknown",
      "Subject A": typeof item["Subject A"] === "number" ? Math.round(item["Subject A"] * 10) / 10 : 0,
      "Subject B": typeof item["Subject B"] === "number" ? Math.round(item["Subject B"] * 10) / 10 : 0,
    }))
  }, [results])

  const conflictChartData = useMemo(() => {
    const data = results?.visualInsightsData?.conflictExpressionStyles
    if (!Array.isArray(data) || data.length === 0) return []

    return data.map((item: any) => ({
      category: item.category || "Unknown",
      "Subject A": typeof item["Subject A"] === "number" ? Math.round(item["Subject A"] * 10) / 10 : 0,
      "Subject B": typeof item["Subject B"] === "number" ? Math.round(item["Subject B"] * 10) / 10 : 0,
    }))
  }, [results])

  const validationChartData = useMemo(() => {
    const data = results?.visualInsightsData?.validationAndReassurancePatterns
    if (!Array.isArray(data) || data.length === 0) return []

    return data.map((item: any) => ({
      category: item.category || "Unknown",
      "Subject A": typeof item["Subject A"] === "number" ? Math.round(item["Subject A"] * 10) / 10 : 0,
      "Subject B": typeof item["Subject B"] === "number" ? Math.round(item["Subject B"] * 10) / 10 : 0,
    }))
  }, [results])

  const metricsData = useMemo(() => {
    const metrics = results?.visualInsightsData?.communicationMetrics
    if (!metrics || typeof metrics !== "object") return []

    return Object.entries(metrics).map(([key, value]) => ({
      name: key
        .replace(/([A-Z])/g, " $1")
        .trim()
        .replace(/^./, (str) => str.toUpperCase()),
      value: typeof value === "number" ? Math.round(value * 10) / 10 : 0,
    }))
  }, [results])

  // Calculate comprehensive insights
  const comprehensiveInsights = useMemo(() => {
    const healthScore = results?.overallRelationshipHealth?.score || 0
    const emotionalTags = results?.communicationStylesAndEmotionalTone?.emotionalVibeTags || []
    const strengths = [
      ...(results?.constructiveFeedback?.forBoth?.sharedStrengths || []),
      ...(results?.constructiveFeedback?.subjectA?.strengths || []).slice(0, 2),
      ...(results?.constructiveFeedback?.subjectB?.strengths || []).slice(0, 2),
    ]

    return {
      overallHealth: healthScore >= 7 ? "Strong" : healthScore >= 5 ? "Moderate" : "Needs Attention",
      primaryStrengths: strengths.slice(0, 3),
      emotionalClimate: emotionalTags.slice(0, 3),
      growthPotential: healthScore >= 7 ? "High" : healthScore >= 5 ? "Moderate" : "Significant",
    }
  }, [results])

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch("/api/export-word", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(results),
      })

      if (!response.ok) {
        throw new Error("Export failed")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `relationship-analysis-${Date.now()}.docx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Export error:", error)
      alert("Failed to export analysis. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const healthScore = results?.overallRelationshipHealth?.score || 0
  const healthColor = healthScore >= 7 ? "text-green-600" : healthScore >= 5 ? "text-yellow-600" : "text-red-600"
  const healthBg = healthScore >= 7 ? "bg-green-50" : healthScore >= 5 ? "bg-yellow-50" : "bg-red-50"
  const healthBorder = healthScore >= 7 ? "border-green-200" : healthScore >= 5 ? "border-yellow-200" : "border-red-200"

  // Define distinct colors for each validation category
  const validationColors = {
    "Provides Validation": "#8b5cf6", // Purple
    "Acknowledges Feelings": "#ec4899", // Pink
    "Shows Appreciation": "#f59e0b", // Amber
    "Offers Reassurance": "#10b981", // Emerald
    default: "#6366f1", // Indigo fallback
  }

  const getColorForCategory = (category: string) => {
    return validationColors[category as keyof typeof validationColors] || validationColors.default
  }

  // Custom label renderer with better overflow handling
  const renderCustomLabel = (props: any) => {
    const { cx, cy, midAngle, outerRadius, percent, name } = props
    const RADIAN = Math.PI / 180
    const radius = outerRadius + 25
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    // Shorten the label text
    const shortName = name.replace(/^(Provides|Acknowledges|Shows|Offers)\s+/, "")

    return (
      <text
        x={x}
        y={y}
        fill="#374151"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        style={{
          fontSize: "11px",
          fontWeight: 600,
        }}
      >
        {`${shortName}: ${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Enhanced Header with Quick Stats */}
          <div className="mb-8">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center mb-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Relationship Analysis Results</h1>
                <p className="text-base text-gray-600">
                  Comprehensive analysis based on {results.messageCount} messages from {results.screenshotCount}{" "}
                  screenshots
                </p>
              </div>
              <Button
                onClick={handleExport}
                disabled={isExporting}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Download className="mr-2 h-5 w-5" />
                {isExporting ? "Exporting..." : "Export Report"}
              </Button>
            </div>

            {/* Quick Insights Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                      <Heart className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 font-medium leading-tight">Overall Health</p>
                      <p className="text-lg font-bold text-purple-900 leading-tight truncate">
                        {comprehensiveInsights.overallHealth}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-white">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-100 rounded-lg flex-shrink-0">
                      <Zap className="h-5 w-5 text-pink-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 font-medium leading-tight">Growth Potential</p>
                      <p className="text-lg font-bold text-pink-900 leading-tight truncate">
                        {comprehensiveInsights.growthPotential}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                      <MessageSquare className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 font-medium leading-tight">Messages Analyzed</p>
                      <p className="text-lg font-bold text-indigo-900 leading-tight truncate">{results.messageCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 font-medium leading-tight">Key Strengths</p>
                      <p className="text-lg font-bold text-green-900 leading-tight truncate">
                        {comprehensiveInsights.primaryStrengths.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {results.confidenceWarning && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <Info className="h-5 w-5 text-yellow-600" />
              <AlertTitle className="text-yellow-900 font-semibold">Analysis Confidence Note</AlertTitle>
              <AlertDescription className="text-sm text-yellow-800 leading-relaxed mt-1">
                {results.confidenceWarning}
              </AlertDescription>
            </Alert>
          )}

          {/* Overall Health Score - Enhanced */}
          <Card className={`border-2 ${healthBorder} ${healthBg} shadow-xl`}>
            <CardContent className="p-8">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-white shadow-lg ring-4 ring-white ring-opacity-50">
                  <Heart className={`h-14 w-14 ${healthColor}`} fill="currentColor" />
                </div>
                <div className="flex-1 space-y-4 text-center sm:text-left w-full">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Overall Relationship Health</h2>
                    <p className="text-sm text-gray-600">Comprehensive assessment of relationship dynamics</p>
                  </div>
                  <div className="flex items-center justify-center gap-4 sm:justify-start flex-wrap">
                    <span className={`text-6xl font-bold ${healthColor}`}>{healthScore.toFixed(1)}/10</span>
                    <Badge
                      variant={healthScore >= 7 ? "default" : "secondary"}
                      className="text-base px-5 py-2 font-semibold"
                    >
                      {healthScore >= 7 ? "Strong Connection" : healthScore >= 5 ? "Moderate Bond" : "Needs Attention"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 font-medium">Health Score</span>
                      <span className={`font-bold ${healthColor}`}>{Math.round(healthScore * 10)}%</span>
                    </div>
                    <Progress value={healthScore * 10} className="h-4 w-full" />
                  </div>
                  <p className="text-base leading-relaxed text-gray-700">
                    {results.overallRelationshipHealth?.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Introduction Note - Enhanced */}
          {results.introductionNote && (
            <Card className="shadow-lg border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-lg">Analysis Overview</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-relaxed text-gray-700">{results.introductionNote}</p>
              </CardContent>
            </Card>
          )}

          {/* Main Content Tabs */}
          <Tabs defaultValue="insights" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 h-auto lg:grid-cols-4 bg-white shadow-md p-1.5 rounded-xl">
              <TabsTrigger
                value="insights"
                className="text-sm py-3 px-4 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Insights</span>
                <span className="sm:hidden">Info</span>
              </TabsTrigger>
              <TabsTrigger
                value="charts"
                className="text-sm py-3 px-4 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Charts
              </TabsTrigger>
              <TabsTrigger
                value="feedback"
                className="text-sm py-3 px-4 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
              >
                <Users className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Feedback</span>
                <span className="sm:hidden">Tips</span>
              </TabsTrigger>
              <TabsTrigger
                value="outlook"
                className="text-sm py-3 px-4 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Outlook
              </TabsTrigger>
            </TabsList>

            {/* INSIGHTS TAB */}
            <TabsContent value="insights" className="space-y-6">
              <div className="grid gap-6">
                {/* Communication Styles */}
                <Card className="border-2 border-purple-100 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">Communication Styles & Emotional Tone</CardTitle>
                        <p className="text-sm text-gray-600 font-normal">
                          Analysis of how each person expresses themselves and manages emotions
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-600" />
                        Overall Communication Pattern
                      </h4>
                      <p className="text-gray-700 leading-relaxed">
                        {results.communicationStylesAndEmotionalTone?.description}
                      </p>
                    </div>

                    {results.communicationStylesAndEmotionalTone?.emotionalVibeTags && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Emotional Climate</h4>
                        <div className="flex flex-wrap gap-2">
                          {results.communicationStylesAndEmotionalTone.emotionalVibeTags.map(
                            (tag: string, i: number) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="bg-purple-100 text-purple-700 hover:bg-purple-200"
                              >
                                {tag}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <h4 className="font-semibold text-purple-900 flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-200 text-purple-900 text-xs font-bold">
                            A
                          </span>
                          Subject A's Communication Style
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {results.communicationStylesAndEmotionalTone?.subjectAStyle}
                        </p>
                      </div>

                      <div className="space-y-3 p-4 bg-pink-50 rounded-lg border border-pink-200">
                        <h4 className="font-semibold text-pink-900 flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-200 text-pink-900 text-xs font-bold">
                            B
                          </span>
                          Subject B's Communication Style
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {results.communicationStylesAndEmotionalTone?.subjectBStyle}
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Emotion Regulation Patterns</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {results.communicationStylesAndEmotionalTone?.regulationPatternsObserved}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Message Rhythm & Pacing</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {results.communicationStylesAndEmotionalTone?.messageRhythmAndPacing}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recurring Patterns */}
                <Card className="border-2 border-indigo-100 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Target className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">Recurring Patterns Identified</CardTitle>
                        <p className="text-sm text-gray-600 font-normal">
                          Cycles and themes that appear consistently in your interactions
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <p className="text-gray-700 leading-relaxed">{results.recurringPatternsIdentified?.description}</p>

                    {results.recurringPatternsIdentified?.positivePatterns &&
                      results.recurringPatternsIdentified.positivePatterns.length > 0 && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Positive Patterns to Celebrate
                          </h4>
                          <ul className="space-y-2">
                            {results.recurringPatternsIdentified.positivePatterns.map((pattern: string, i: number) => (
                              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                <Sparkles className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                {pattern}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    <div className="grid md:grid-cols-3 gap-4">
                      {results.recurringPatternsIdentified?.loopingMiscommunicationsExamples &&
                        results.recurringPatternsIdentified.loopingMiscommunicationsExamples.length > 0 && (
                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <h4 className="font-semibold text-amber-900 mb-2 text-sm flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              Communication Loops
                            </h4>
                            <ul className="space-y-1.5">
                              {results.recurringPatternsIdentified.loopingMiscommunicationsExamples.map(
                                (example: string, i: number) => (
                                  <li key={i} className="text-xs text-gray-700">
                                    • {example}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}

                      {results.recurringPatternsIdentified?.commonTriggersAndResponsesExamples &&
                        results.recurringPatternsIdentified.commonTriggersAndResponsesExamples.length > 0 && (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2 text-sm flex items-center gap-2">
                              <Zap className="h-4 w-4" />
                              Triggers & Responses
                            </h4>
                            <ul className="space-y-1.5">
                              {results.recurringPatternsIdentified.commonTriggersAndResponsesExamples.map(
                                (example: string, i: number) => (
                                  <li key={i} className="text-xs text-gray-700">
                                    • {example}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}

                      {results.recurringPatternsIdentified?.repairAttemptsOrEmotionalAvoidancesExamples &&
                        results.recurringPatternsIdentified.repairAttemptsOrEmotionalAvoidancesExamples.length > 0 && (
                          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <h4 className="font-semibold text-purple-900 mb-2 text-sm flex items-center gap-2">
                              <Heart className="h-4 w-4" />
                              Repair Attempts
                            </h4>
                            <ul className="space-y-1.5">
                              {results.recurringPatternsIdentified.repairAttemptsOrEmotionalAvoidancesExamples.map(
                                (example: string, i: number) => (
                                  <li key={i} className="text-xs text-gray-700">
                                    • {example}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}
                    </div>
                  </CardContent>
                </Card>

                {/* Reflective Frameworks */}
                <Card className="border-2 border-pink-100 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <Brain className="h-5 w-5 text-pink-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">Reflective Frameworks</CardTitle>
                        <p className="text-sm text-gray-600 font-normal">
                          Understanding your relationship through established psychological models
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <p className="text-gray-700 leading-relaxed">{results.reflectiveFrameworks?.description}</p>

                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                        <h4 className="font-semibold text-purple-900 mb-2">Attachment Theory Lens</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {results.reflectiveFrameworks?.attachmentEnergies}
                        </p>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg">
                        <h4 className="font-semibold text-pink-900 mb-2">Love Languages Analysis</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {results.reflectiveFrameworks?.loveLanguageFriction}
                        </p>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Gottman Method Insights</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {results.reflectiveFrameworks?.gottmanConflictMarkers}
                        </p>
                      </div>

                      {results.reflectiveFrameworks?.emotionalIntelligenceIndicators && (
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                          <h4 className="font-semibold text-green-900 mb-2">Emotional Intelligence Markers</h4>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {results.reflectiveFrameworks.emotionalIntelligenceIndicators}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* What's Getting in the Way */}
                <Card className="border-2 border-red-100 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">What's Getting in the Way</CardTitle>
                        <p className="text-sm text-gray-600 font-normal">
                          Obstacles and challenges affecting connection and understanding
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <p className="text-gray-700 leading-relaxed">{results.whatsGettingInTheWay?.description}</p>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-semibold text-red-900 mb-2 text-sm">Emotional Mismatches</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {results.whatsGettingInTheWay?.emotionalMismatches}
                        </p>
                      </div>

                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <h4 className="font-semibold text-orange-900 mb-2 text-sm">Communication Gaps</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {results.whatsGettingInTheWay?.communicationGaps}
                        </p>
                      </div>

                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-semibold text-yellow-900 mb-2 text-sm">Power Dynamics</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {results.whatsGettingInTheWay?.subtlePowerStrugglesOrMisfires}
                        </p>
                      </div>

                      {results.whatsGettingInTheWay?.externalStressors && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <h4 className="font-semibold text-amber-900 mb-2 text-sm">External Stressors</h4>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {results.whatsGettingInTheWay.externalStressors}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* CHARTS TAB */}
            <TabsContent value="charts" className="space-y-8">
              <div className="text-center mb-6">
                <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
                  {results.visualInsightsData?.descriptionForChartsIntro ||
                    "The following charts provide a visual representation of communication dynamics, conflict resolution styles, and emotional support patterns based on the analyzed conversation."}
                </p>
              </div>

              {/* Emotional Communication - Radar Chart */}
              {emotionalChartData.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Heart className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Emotional Communication Characteristics</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        This radar chart compares how each person expresses vulnerability, listens actively,
                        demonstrates emotional awareness, and shows empathy and openness.
                      </p>
                    </div>
                  </div>

                  <Card className="border-2 border-purple-200 shadow-lg bg-gradient-to-br from-purple-50 to-white">
                    <CardContent className="p-6">
                      <div className="w-full h-[400px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={emotionalChartData}>
                            <PolarGrid stroke="#e9d5ff" />
                            <PolarAngleAxis dataKey="category" tick={{ fill: "#6b7280", fontSize: 12 }} />
                            <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: "#6b7280" }} />
                            <Radar
                              name="Subject A"
                              dataKey="Subject A"
                              stroke="#a855f7"
                              fill="#a855f7"
                              fillOpacity={0.5}
                              strokeWidth={2}
                            />
                            <Radar
                              name="Subject B"
                              dataKey="Subject B"
                              stroke="#ec4899"
                              fill="#ec4899"
                              fillOpacity={0.5}
                              strokeWidth={2}
                            />
                            <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "white",
                                border: "2px solid #e9d5ff",
                                borderRadius: "12px",
                                padding: "12px",
                              }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Center Score Display */}
                      <div className="text-center mt-4 p-4 bg-white border-2 border-purple-200 rounded-xl">
                        <p className="text-sm text-gray-600 mb-1">Emotional Balance Score</p>
                        <p className="text-3xl font-bold text-purple-600">
                          {(() => {
                            const avgA =
                              emotionalChartData.reduce((sum, item) => sum + item["Subject A"], 0) /
                              emotionalChartData.length
                            const avgB =
                              emotionalChartData.reduce((sum, item) => sum + item["Subject B"], 0) /
                              emotionalChartData.length
                            return ((avgA + avgB) / 2).toFixed(1)
                          })()}/10
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-purple-900 mb-2">Key Observations:</h4>
                      <ul className="space-y-1.5 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          Higher scores (7-10) indicate strong emotional communication skills in that area
                        </li>
                        <li className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          Large gaps between partners may suggest different communication styles or emotional needs
                        </li>
                        <li className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          Areas with lower scores present opportunities for growth and connection
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Conflict Expression - Vertical Bar Chart */}
              {conflictChartData.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Conflict Expression Styles</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        This vertical bar chart shows how each person handles disagreements, takes responsibility, and
                        manages emotional reactivity during challenging moments.
                      </p>
                    </div>
                  </div>

                  <Card className="border-2 border-pink-200 shadow-lg bg-gradient-to-br from-pink-50 to-white">
                    <CardContent className="p-6">
                      <div className="w-full h-[450px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={conflictChartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" vertical={false} />
                            <XAxis
                              dataKey="category"
                              tick={{ fill: "#6b7280", fontSize: 12 }}
                              interval={0}
                              angle={0}
                              textAnchor="middle"
                              height={80}
                            />
                            <YAxis
                              tick={{ fill: "#6b7280" }}
                              domain={[0, 10]}
                              label={{ value: "Score (0-10)", angle: -90, position: "insideLeft", fill: "#6b7280" }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "white",
                                border: "2px solid #fce7f3",
                                borderRadius: "12px",
                                padding: "12px",
                              }}
                            />
                            <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
                            <Bar dataKey="Subject A" fill="#a855f7" radius={[8, 8, 0, 0]} maxBarSize={60} />
                            <Bar dataKey="Subject B" fill="#ec4899" radius={[8, 8, 0, 0]} maxBarSize={60} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-pink-50 border-pink-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-pink-900 mb-2">Interpretation Guide:</h4>
                      <ul className="space-y-1.5 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-pink-600 mt-0.5 flex-shrink-0" />
                          "Uses I Statements" measures personal ownership vs. accusatory language
                        </li>
                        <li className="flex items-start gap-2">
                          <Shield className="h-4 w-4 text-pink-600 mt-0.5 flex-shrink-0" />
                          "Avoids Blame Language" indicates constructive vs. defensive communication
                        </li>
                        <li className="flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 text-pink-600 mt-0.5 flex-shrink-0" />
                          Higher scores correlate with healthier conflict resolution patterns
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-pink-600 mt-0.5 flex-shrink-0" />
                          Similar heights between purple and pink bars show balanced conflict styles
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Validation & Reassurance - Pie Charts */}
              {validationChartData.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Users className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Validation & Reassurance Patterns</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        These pie charts show the distribution of emotional support behaviors for each person, including
                        how they provide validation, acknowledgment, appreciation, and reassurance.
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Subject A Pie Chart */}
                    <Card className="border-2 border-purple-200 shadow-lg bg-gradient-to-br from-purple-50 to-white">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-200">
                            <span className="text-purple-900 text-sm font-bold">A</span>
                          </div>
                          <CardTitle className="text-base">Subject A Support Patterns</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="w-full h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={validationChartData.map((item) => ({
                                  name: item.category,
                                  value: item["Subject A"],
                                }))}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={renderCustomLabel}
                                outerRadius={90}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {validationChartData.map((entry, index) => (
                                  <Cell key={`cell-a-${index}`} fill={getColorForCategory(entry.category)} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "white",
                                  border: "2px solid #e9d5ff",
                                  borderRadius: "12px",
                                  padding: "12px",
                                  fontSize: "12px",
                                }}
                                formatter={(value: any) => `${value}/10`}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="flex flex-wrap gap-2 justify-center">
                            {validationChartData.map((item, index) => (
                              <div key={index} className="flex items-center gap-1.5">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: getColorForCategory(item.category) }}
                                />
                                <span className="text-xs text-gray-700">
                                  {item.category.replace(/^(Provides|Acknowledges|Shows|Offers)\s+/, "")}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="text-center pt-2 border-t border-purple-200">
                            <p className="text-sm text-gray-600">
                              Total Support Score:
                              <span className="font-bold text-purple-700 ml-2">
                                {validationChartData.reduce((sum, item) => sum + item["Subject A"], 0).toFixed(1)}/
                                {validationChartData.length * 10}
                              </span>
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Subject B Pie Chart */}
                    <Card className="border-2 border-pink-200 shadow-lg bg-gradient-to-br from-pink-50 to-white">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-200">
                            <span className="text-pink-900 text-sm font-bold">B</span>
                          </div>
                          <CardTitle className="text-base">Subject B Support Patterns</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="w-full h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={validationChartData.map((item) => ({
                                  name: item.category,
                                  value: item["Subject B"],
                                }))}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={renderCustomLabel}
                                outerRadius={90}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {validationChartData.map((entry, index) => (
                                  <Cell key={`cell-b-${index}`} fill={getColorForCategory(entry.category)} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "white",
                                  border: "2px solid #fce7f3",
                                  borderRadius: "12px",
                                  padding: "12px",
                                  fontSize: "12px",
                                }}
                                formatter={(value: any) => `${value}/10`}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="flex flex-wrap gap-2 justify-center">
                            {validationChartData.map((item, index) => (
                              <div key={index} className="flex items-center gap-1.5">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: getColorForCategory(item.category) }}
                                />
                                <span className="text-xs text-gray-700">
                                  {item.category.replace(/^(Provides|Acknowledges|Shows|Offers)\s+/, "")}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="text-center pt-2 border-t border-pink-200">
                            <p className="text-sm text-gray-600">
                              Total Support Score:
                              <span className="font-bold text-pink-700 ml-2">
                                {validationChartData.reduce((sum, item) => sum + item["Subject B"], 0).toFixed(1)}/
                                {validationChartData.length * 10}
                              </span>
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-indigo-50 border-indigo-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-indigo-900 mb-2">What This Reveals:</h4>
                      <ul className="space-y-1.5 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <Heart className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                          Each color represents a different support behavior - larger slices indicate that person's
                          strongest patterns
                        </li>
                        <li className="flex items-start gap-2">
                          <Sparkles className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                          Similar distributions suggest compatible support styles
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                          Total scores show overall capacity for emotional support
                        </li>
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                          Distinct colors help identify which support behaviors are most prevalent
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Communication Metrics - Gauge Charts */}
              {metricsData.length > 0 && (
                <Card className="border-2 border-gray-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-gray-600" />
                      Communication Metrics Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {metricsData.map((metric, i) => {
                        const percentage = (metric.value / 10) * 100
                        const color = percentage >= 70 ? "#10b981" : percentage >= 40 ? "#f59e0b" : "#ef4444"

                        return (
                          <div key={i} className="relative">
                            <div className="text-center mb-2">
                              <p className="text-sm font-semibold text-gray-700">{metric.name}</p>
                            </div>
                            <div className="relative w-full h-32 flex items-end justify-center">
                              <svg viewBox="0 0 200 120" className="w-full h-full">
                                {/* Background arc */}
                                <path
                                  d="M 20 100 A 80 80 0 0 1 180 100"
                                  fill="none"
                                  stroke="#e5e7eb"
                                  strokeWidth="20"
                                  strokeLinecap="round"
                                />
                                {/* Colored arc */}
                                <path
                                  d="M 20 100 A 80 80 0 0 1 180 100"
                                  fill="none"
                                  stroke={color}
                                  strokeWidth="20"
                                  strokeLinecap="round"
                                  strokeDasharray={`${percentage * 2.51} 251`}
                                  style={{ transition: "stroke-dasharray 1s ease" }}
                                />
                                {/* Center text */}
                                <text x="100" y="95" textAnchor="middle" fontSize="28" fontWeight="bold" fill={color}>
                                  {metric.value}
                                </text>
                                <text x="100" y="110" textAnchor="middle" fontSize="12" fill="#6b7280">
                                  /10
                                </text>
                              </svg>
                            </div>
                            <div className="text-center mt-2">
                              <Badge variant={percentage >= 70 ? "default" : "secondary"} className="text-xs">
                                {percentage >= 70 ? "Strong" : percentage >= 40 ? "Moderate" : "Needs Work"}
                              </Badge>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* FEEDBACK TAB */}
            <TabsContent value="feedback" className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Personalized Feedback & Growth Opportunities</h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Constructive insights tailored to each person's communication style, along with shared growth areas
                  for strengthening your connection together.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Subject A Feedback */}
                <Card className="border-2 border-purple-200 shadow-lg bg-gradient-to-br from-purple-50 to-white">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-200">
                        <span className="text-purple-900 text-lg font-bold">A</span>
                      </div>
                      <CardTitle className="text-lg">For Subject A</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Strengths */}
                    <div>
                      <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        Communication Strengths
                      </h4>
                      <ul className="space-y-2">
                        {results.constructiveFeedback?.subjectA?.strengths?.map((strength: string, i: number) => (
                          <li
                            key={i}
                            className="text-sm text-gray-700 flex items-start gap-2 p-3 bg-green-50 rounded-lg"
                          >
                            <Sparkles className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Growth Areas */}
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-amber-600" />
                        Growth Opportunities
                      </h4>
                      <ul className="space-y-2">
                        {results.constructiveFeedback?.subjectA?.gentleGrowthNudges?.map((nudge: string, i: number) => (
                          <li
                            key={i}
                            className="text-sm text-gray-700 flex items-start gap-2 p-3 bg-amber-50 rounded-lg"
                          >
                            <Target className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            {nudge}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Connection Boosters */}
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                        <Heart className="h-5 w-5 text-purple-600" />
                        Connection Boosters
                      </h4>
                      <ul className="space-y-2">
                        {results.constructiveFeedback?.subjectA?.connectionBoosters?.map(
                          (booster: string, i: number) => (
                            <li
                              key={i}
                              className="text-sm text-gray-700 flex items-start gap-2 p-3 bg-purple-100 rounded-lg"
                            >
                              <Zap className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                              {booster}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Subject B Feedback */}
                <Card className="border-2 border-pink-200 shadow-lg bg-gradient-to-br from-pink-50 to-white">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-200">
                        <span className="text-pink-900 text-lg font-bold">B</span>
                      </div>
                      <CardTitle className="text-lg">For Subject B</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Strengths */}
                    <div>
                      <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        Communication Strengths
                      </h4>
                      <ul className="space-y-2">
                        {results.constructiveFeedback?.subjectB?.strengths?.map((strength: string, i: number) => (
                          <li
                            key={i}
                            className="text-sm text-gray-700 flex items-start gap-2 p-3 bg-green-50 rounded-lg"
                          >
                            <Sparkles className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Growth Areas */}
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-amber-600" />
                        Growth Opportunities
                      </h4>
                      <ul className="space-y-2">
                        {results.constructiveFeedback?.subjectB?.gentleGrowthNudges?.map((nudge: string, i: number) => (
                          <li
                            key={i}
                            className="text-sm text-gray-700 flex items-start gap-2 p-3 bg-amber-50 rounded-lg"
                          >
                            <Target className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            {nudge}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Connection Boosters */}
                    <div>
                      <h4 className="font-semibold text-pink-900 mb-3 flex items-center gap-2">
                        <Heart className="h-5 w-5 text-pink-600" />
                        Connection Boosters
                      </h4>
                      <ul className="space-y-2">
                        {results.constructiveFeedback?.subjectB?.connectionBoosters?.map(
                          (booster: string, i: number) => (
                            <li
                              key={i}
                              className="text-sm text-gray-700 flex items-start gap-2 p-3 bg-pink-100 rounded-lg"
                            >
                              <Zap className="h-4 w-4 text-pink-600 mt-0.5 flex-shrink-0" />
                              {booster}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Shared Feedback */}
              <Card className="border-2 border-indigo-200 shadow-lg bg-gradient-to-br from-indigo-50 to-white">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-200">
                      <Users className="h-5 w-5 text-indigo-900" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">For Both Partners</CardTitle>
                      <p className="text-sm text-gray-600 font-normal mt-1">
                        Shared strengths and collaborative growth opportunities
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Shared Strengths */}
                    <div>
                      <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        Together You Excel At
                      </h4>
                      <ul className="space-y-2">
                        {results.constructiveFeedback?.forBoth?.sharedStrengths?.map((strength: string, i: number) => (
                          <li
                            key={i}
                            className="text-sm text-gray-700 flex items-start gap-2 p-3 bg-green-50 rounded-lg"
                          >
                            <Heart className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Shared Growth */}
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-amber-600" />
                        Grow Together By
                      </h4>
                      <ul className="space-y-2">
                        {results.constructiveFeedback?.forBoth?.sharedGrowthNudges?.map((nudge: string, i: number) => (
                          <li
                            key={i}
                            className="text-sm text-gray-700 flex items-start gap-2 p-3 bg-amber-50 rounded-lg"
                          >
                            <Target className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            {nudge}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Shared Boosters */}
                    <div>
                      <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-indigo-600" />
                        Connection Activities
                      </h4>
                      <ul className="space-y-2">
                        {results.constructiveFeedback?.forBoth?.sharedConnectionBoosters?.map(
                          (booster: string, i: number) => (
                            <li
                              key={i}
                              className="text-sm text-gray-700 flex items-start gap-2 p-3 bg-indigo-100 rounded-lg"
                            >
                              <Users className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                              {booster}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* OUTLOOK TAB */}
            <TabsContent value="outlook" className="space-y-6">
              <Card className="border-2 border-green-200 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">Relationship Outlook & Future Path</CardTitle>
                      <p className="text-sm text-gray-600 font-normal">
                        Forward-looking analysis based on current dynamics and growth potential
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="prose max-w-none">
                    {results.outlook?.split("\n\n").map((paragraph: string, i: number) => (
                      <p key={i} className="text-gray-700 leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Key Takeaways */}
              {results.keyTakeaways && results.keyTakeaways.length > 0 && (
                <Card className="border-2 border-blue-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-blue-600" />
                      </div>
                      <CardTitle className="text-xl">Key Takeaways</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-4">
                      {results.keyTakeaways.map((takeaway: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-200 text-blue-900 text-sm font-bold flex-shrink-0">
                            {i + 1}
                          </div>
                          <p className="text-gray-700 leading-relaxed flex-1">{takeaway}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Optional Appendix */}
              {results.optionalAppendix && (
                <Card className="border-2 border-gray-200 shadow-lg">
                  <CardHeader className="bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-200 rounded-lg">
                        <Info className="h-5 w-5 text-gray-600" />
                      </div>
                      <CardTitle className="text-xl">Additional Observations</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="prose max-w-none">
                      {results.optionalAppendix.split("\n\n").map((paragraph: string, i: number) => (
                        <p key={i} className="text-gray-700 leading-relaxed mb-4">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Next Steps */}
              <Card className="border-2 border-purple-200 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Target className="h-5 w-5 text-purple-600" />
                    </div>
                    <CardTitle className="text-xl">Recommended Next Steps</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 p-4 bg-white rounded-lg border border-purple-200">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Review this analysis together</p>
                        <p className="text-sm text-gray-600">
                          Set aside time to discuss the insights, being open and non-defensive
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-4 bg-white rounded-lg border border-purple-200">
                      <CheckCircle2 className="h-5 w-5 text-pink-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Choose one growth area to focus on</p>
                        <p className="text-sm text-gray-600">
                          Pick a single pattern or skill to work on together over the next month
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-4 bg-white rounded-lg border border-purple-200">
                      <CheckCircle2 className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Implement connection boosters</p>
                        <p className="text-sm text-gray-600">
                          Try the suggested activities to strengthen your bond and create positive patterns
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-4 bg-white rounded-lg border border-purple-200">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Check in regularly</p>
                        <p className="text-sm text-gray-600">
                          Schedule weekly conversations to discuss progress and celebrate small wins
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 p-4 bg-white rounded-lg border border-purple-200">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Consider professional support</p>
                        <p className="text-sm text-gray-600">
                          If challenges persist, working with a couples therapist can provide additional tools
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Analysis Metadata Footer */}
          <Card className="border border-gray-200 bg-gray-50">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span>
                    Analysis generated on{" "}
                    {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Confidence: {results.extractionConfidence || 85}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>{results.messageCount} messages analyzed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
