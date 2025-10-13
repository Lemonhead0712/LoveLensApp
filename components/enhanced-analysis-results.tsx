"use client"
import { useState, useRef, useEffect } from "react"
import type React from "react"

import { motion } from "framer-motion"
import {
  Heart,
  TrendingUp,
  Users,
  MessageCircle,
  Lightbulb,
  AlertCircle,
  ThumbsUp,
  FileText,
  Download,
  CheckCircle2,
  BarChart3,
  Brain,
  Stethoscope,
  BookOpen,
  Target,
  Calendar,
  Clock,
  RefreshCw,
  Info,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import OptimizedBarChart from "@/components/optimized-bar-chart"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend as RechartLegend } from "recharts"

const COLORS = [
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
  "#6366f1",
  "#14b8a6",
  "#f97316",
  "#a855f7",
]

interface EnhancedAnalysisResultsProps {
  results: any
}

const CustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}: {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
  name: string
}) => {
  const RADIAN = Math.PI / 180
  const radius = outerRadius + 30 // Increased from 25 to 30 for better label spacing
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="#374151"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-[8px] sm:text-[9px] md:text-[10px] font-medium"
    >
      {name.length > 12 ? name.substring(0, 10) + "..." : name} {(percent * 100).toFixed(0)}%
    </text>
  )
}

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 px-2">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center gap-1">
          <div
            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[10px] sm:text-xs text-gray-700 leading-tight">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

const ChartInsight = ({
  children,
  type = "info",
}: { children: React.ReactNode; type?: "info" | "positive" | "caution" }) => {
  const bgColor = type === "positive" ? "bg-green-50" : type === "caution" ? "bg-amber-50" : "bg-blue-50"
  const textColor = type === "positive" ? "text-green-900" : type === "caution" ? "text-amber-900" : "text-blue-900"
  const iconColor = type === "positive" ? "text-green-600" : type === "caution" ? "text-amber-600" : "text-blue-600"

  return (
    <div
      className={`${bgColor} rounded-lg p-3 sm:p-4 mt-4 border-l-4 ${type === "positive" ? "border-green-500" : type === "caution" ? "border-amber-500" : "border-blue-500"}`}
    >
      <div className="flex items-start gap-2.5">
        <Info className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor} flex-shrink-0 mt-0.5`} aria-hidden="true" />
        <p className={`text-xs sm:text-sm ${textColor} leading-relaxed`}>{children}</p>
      </div>
    </div>
  )
}

export default function EnhancedAnalysisResults({ results }: EnhancedAnalysisResultsProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const tabsListRef = useRef<HTMLDivElement>(null)
  const activeTabRef = useRef<HTMLButtonElement>(null)

  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const minSwipeDistance = 50

  const tabs = ["overview", "patterns", "charts", "professional", "feedback"]

  useEffect(() => {
    if (activeTabRef.current && tabsListRef.current) {
      const tabElement = activeTabRef.current
      const containerElement = tabsListRef.current

      // Calculate the position to scroll to center the active tab
      const tabLeft = tabElement.offsetLeft
      const tabWidth = tabElement.offsetWidth
      const containerWidth = containerElement.offsetWidth
      const scrollLeft = tabLeft - containerWidth / 2 + tabWidth / 2

      // Smooth scroll to the active tab
      containerElement.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      })
    }
  }, [activeTab])

  const handleTabSwipe = () => {
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = tabs.indexOf(activeTab)
      if (isLeftSwipe && currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1])
      } else if (isRightSwipe && currentIndex > 0) {
        setActiveTab(tabs[currentIndex - 1])
      }
    }
  }

  const handleTabKeyDown = (e: React.KeyboardEvent, tabValue: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      setActiveTab(tabValue)
    }
  }

  // 1. Update the imports at the top to add the subjectALabel and subjectBLabel from results:
  const subjectALabel = results.subjectALabel || "Subject A"
  const subjectBLabel = results.subjectBLabel || "Subject B"

  if (results.error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-5 w-5 text-red-600" aria-hidden="true" />
            <AlertDescription className="text-red-800 ml-2">{results.error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const handleExport = async () => {
    setIsExporting(true)
    setExportSuccess(false)
    setExportError(null)
    try {
      console.log("[v0] Starting Word document export...")

      const response = await fetch("/api/export-word", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(results),
      })

      if (!response.ok) {
        throw new Error("Failed to generate Word document")
      }

      // Get the blob from the response
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `love-lens-analysis-${Date.now()}.doc`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      console.log("[v0] Word document downloaded successfully")
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 5000)
    } catch (error) {
      console.error("[v0] Export error:", error)
      setExportError("Failed to export document. Please try again.")
      setTimeout(() => setExportError(null), 5000)
    } finally {
      setIsExporting(false)
    }
  }

  // 2. Update all chart data transformations to use the dynamic labels:
  const validationDataA =
    results.visualInsightsData?.validationAndReassurancePatterns?.map((item: any, index: number) => ({
      name: item.category,
      value: item[subjectALabel],
      color: COLORS[index % COLORS.length],
    })) || []

  const validationDataB =
    results.visualInsightsData?.validationAndReassurancePatterns?.map((item: any, index: number) => ({
      name: item.category,
      value: item[subjectBLabel],
      color: COLORS[index % COLORS.length],
    })) || []

  // Calculate insights for emotional communication
  const getEmotionalCommunicationInsight = () => {
    if (!results.visualInsightsData?.emotionalCommunicationCharacteristics) return null

    const data = results.visualInsightsData.emotionalCommunicationCharacteristics
    const differences = data.map((item: any) => Math.abs(item[subjectALabel] - item[subjectBLabel]))
    const maxDiff = Math.max(...differences)
    const maxDiffIndex = differences.indexOf(maxDiff)
    const category = data[maxDiffIndex]?.category

    if (maxDiff > 3) {
      return {
        type: "caution" as const,
        text: `The largest difference appears in "${category}" (${maxDiff.toFixed(1)} points). This suggests an area where your emotional communication styles differ significantly. Consider discussing how each of you experiences and expresses emotions in this domain.`,
      }
    } else if (maxDiff < 2) {
      return {
        type: "positive" as const,
        text: `Your emotional communication styles are remarkably aligned across all categories (maximum difference: ${maxDiff.toFixed(1)} points). This harmony in emotional expression is a strong foundation for your relationship.`,
      }
    }

    return {
      type: "info" as const,
      text: `The chart shows moderate variation in emotional communication styles. The area with the greatest difference is "${category}" (${maxDiff.toFixed(1)} points). Understanding these differences can help you navigate emotional conversations more effectively.`,
    }
  }

  // Calculate insights for conflict expression
  const getConflictExpressionInsight = () => {
    if (!results.visualInsightsData?.conflictExpressionStyles) return null

    const data = results.visualInsightsData.conflictExpressionStyles
    const avgScores = data.map((item: any) => ({
      category: item.category,
      avg: (item[subjectALabel] + item[subjectBLabel]) / 2,
    }))

    const lowestCategory = avgScores.reduce((min: any, item: any) => (item.avg < min.avg ? item : min), avgScores[0])
    const highestCategory = avgScores.reduce((max: any, item: any) => (item.avg > max.avg ? item : max), avgScores[0])

    if (lowestCategory.avg < 4) {
      return {
        type: "caution" as const,
        text: `Both partners score low on "${lowestCategory.category}" (average: ${lowestCategory.avg.toFixed(1)}/10). This may indicate a growth area in how you both handle conflicts. Consider working together to develop healthier conflict resolution strategies in this area.`,
      }
    } else if (highestCategory.avg > 7) {
      return {
        type: "positive" as const,
        text: `You both excel at "${highestCategory.category}" (average: ${highestCategory.avg.toFixed(1)}/10). This strength can serve as a model for improving other aspects of conflict resolution. Recognize and reinforce this positive pattern.`,
      }
    }

    return {
      type: "info" as const,
      text: `Your strongest conflict expression area is "${highestCategory.category}" (${highestCategory.avg.toFixed(1)}/10), while "${lowestCategory.category}" (${lowestCategory.avg.toFixed(1)}/10) could benefit from attention. Use your strengths to support growth in challenging areas.`,
    }
  }

  // Calculate insights for validation patterns
  const getValidationInsight = () => {
    if (!validationDataA.length || !validationDataB.length) return null

    const subjectAHighest = validationDataA.reduce(
      (max: any, item: any) => (item.value > max.value ? item : max),
      validationDataA[0],
    )
    const subjectBHighest = validationDataB.reduce(
      (max: any, item: any) => (item.value > max.value ? item : max),
      validationDataB[0],
    )

    if (subjectAHighest.name === subjectBHighest.name) {
      return {
        type: "positive" as const,
        text: `Both partners primarily use "${subjectAHighest.name}" for validation and reassurance (${subjectALabel}: ${subjectAHighest.value}%, ${subjectBLabel}: ${subjectBHighest.value}%). This alignment in how you seek and provide emotional support is a significant relationship strength.`,
      }
    }

    return {
      type: "info" as const,
      text: `${subjectALabel} relies most on "${subjectAHighest.name}" (${subjectAHighest.value}%) while ${subjectBLabel} favors "${subjectBHighest.name}" (${subjectBHighest.value}%). Understanding these different preferences can help you provide validation in ways that resonate most with your partner.`,
    }
  }

  const emotionalInsight = getEmotionalCommunicationInsight()
  const conflictInsight = getConflictExpressionInsight()
  const validationInsight = getValidationInsight()

  return (
    // Added safe area padding and improved mobile spacing
    <div
      className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-purple-50 p-4 sm:p-6 md:p-8 pb-safe"
      onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
      onTouchMove={(e) => setTouchEnd(e.targetTouches[0].clientX)}
      onTouchEnd={handleTabSwipe}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-md"
      >
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5 md:space-y-6" id="main-content">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 sm:space-y-4 mb-4 sm:mb-6 md:mb-8"
          role="banner"
          aria-label="Analysis results header"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 flex-shrink-0" aria-hidden="true" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-center leading-tight">
              Your Relationship Analysis
            </h1>
          </div>

          {results.confidenceWarning && (
            <Alert className="border-yellow-200 bg-yellow-50 max-w-3xl mx-auto">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <AlertDescription className="text-yellow-800 text-xs sm:text-sm text-left">
                  {results.confidenceWarning}
                </AlertDescription>
              </div>
            </Alert>
          )}

          <Alert className="border-blue-200 bg-blue-50 max-w-3xl mx-auto">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <AlertDescription className="text-blue-800 text-xs sm:text-sm text-left">
                <strong>Note:</strong> This analysis is for informational purposes only and is not a substitute for
                professional therapy or counseling. If you're experiencing relationship difficulties, consider
                consulting a licensed therapist.
              </AlertDescription>
            </div>
          </Alert>

          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center items-center">
            <Badge variant="outline" className="py-1.5 px-2.5 sm:px-3 text-xs sm:text-sm">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" aria-hidden="true" />
              <span className="whitespace-nowrap">{results.messageCount || 0} Messages</span>
            </Badge>
            <Badge variant="outline" className="py-1.5 px-2.5 sm:px-3 text-xs sm:text-sm">
              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" aria-hidden="true" />
              <span className="whitespace-nowrap">{results.extractionConfidence || 0}% Confidence</span>
            </Badge>
            {results.processingTimeMs && (
              <Badge variant="outline" className="py-1.5 px-2.5 sm:px-3 text-xs sm:text-sm">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" aria-hidden="true" />
                <span className="whitespace-nowrap">{(results.processingTimeMs / 1000).toFixed(1)}s</span>
              </Badge>
            )}
          </div>

          <div className="flex justify-center pt-2 px-4 sm:px-0">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              size="default"
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:from-purple-800 active:to-pink-800 text-white shadow-lg min-h-[48px] sm:min-h-[44px] touch-manipulation focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 text-base"
              aria-label={isExporting ? "Exporting analysis to Word document" : "Export analysis to Word document"}
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                  Export to Word
                </>
              )}
            </Button>
          </div>

          {exportSuccess && (
            <Alert className="border-green-200 bg-green-50 max-w-md mx-auto">
              <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />
              <AlertDescription className="text-green-800 ml-2 text-sm">
                Export successful! Check your downloads.
              </AlertDescription>
            </Alert>
          )}

          {exportError && (
            <Alert className="border-red-200 bg-red-50 max-w-md mx-auto">
              <AlertCircle className="h-4 w-4 text-red-600" aria-hidden="true" />
              <AlertDescription className="text-red-800 ml-2 text-sm">{exportError}</AlertDescription>
            </Alert>
          )}
        </motion.div>

        {/* Relationship Health Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          role="region"
          aria-label="Overall relationship health score"
        >
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50">
            <CardHeader className="pb-3 sm:pb-4 md:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 flex-shrink-0" aria-hidden="true" />
                Overall Relationship Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-4">
                <div
                  className="text-5xl sm:text-6xl font-bold text-purple-600"
                  aria-label={`Relationship health score: ${results.overallRelationshipHealth?.score || 7} out of 10`}
                >
                  {results.overallRelationshipHealth?.score || 7}/10
                </div>
                <div className="flex-1 w-full">
                  <div
                    className="h-3 sm:h-4 bg-gray-200 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={results.overallRelationshipHealth?.score || 7}
                    aria-valuemin={0}
                    aria-valuemax={10}
                    aria-label="Relationship health score progress bar"
                  >
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-1000"
                      style={{ width: `${((results.overallRelationshipHealth?.score || 7) / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                {results.overallRelationshipHealth?.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Introduction Note */}
        {results.introductionNote && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="pt-4 sm:pt-5 md:pt-6">
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{results.introductionNote}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tabbed Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          role="region"
          aria-label="Analysis details organized by category"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="relative mb-4 sm:mb-6">
              {/* Left fade indicator */}
              <div
                className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-purple-50 to-transparent z-10 pointer-events-none sm:hidden"
                aria-hidden="true"
              />

              {/* Right fade indicator */}
              <div
                className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-purple-50 to-transparent z-10 pointer-events-none sm:hidden"
                aria-hidden="true"
              />

              <div
                ref={tabsListRef}
                className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide scroll-smooth"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <TabsList
                  className="inline-flex sm:grid w-auto sm:w-full min-w-max sm:min-w-0 sm:grid-cols-5 h-auto gap-2 bg-white/50 p-2 rounded-lg"
                  role="tablist"
                  aria-label="Analysis categories"
                >
                  <TabsTrigger
                    ref={activeTab === "overview" ? activeTabRef : null}
                    value="overview"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-sm py-3 px-5 rounded-md transition-all whitespace-nowrap touch-manipulation min-h-[48px] min-w-[100px] active:scale-95 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                    role="tab"
                    aria-selected={activeTab === "overview"}
                    aria-controls="overview-panel"
                    id="overview-tab"
                    onKeyDown={(e) => handleTabKeyDown(e, "overview")}
                  >
                    <MessageCircle
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0"
                      aria-hidden="true"
                    />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    ref={activeTab === "patterns" ? activeTabRef : null}
                    value="patterns"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-sm py-3 px-5 rounded-md transition-all whitespace-nowrap touch-manipulation min-h-[48px] min-w-[100px] active:scale-95 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                    role="tab"
                    aria-selected={activeTab === "patterns"}
                    aria-controls="patterns-panel"
                    id="patterns-tab"
                    onKeyDown={(e) => handleTabKeyDown(e, "patterns")}
                  >
                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" aria-hidden="true" />
                    Patterns
                  </TabsTrigger>
                  <TabsTrigger
                    ref={activeTab === "charts" ? activeTabRef : null}
                    value="charts"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-sm py-3 px-5 rounded-md transition-all whitespace-nowrap touch-manipulation min-h-[48px] min-w-[100px] active:scale-95 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                    role="tab"
                    aria-selected={activeTab === "charts"}
                    aria-controls="charts-panel"
                    id="charts-tab"
                    onKeyDown={(e) => handleTabKeyDown(e, "charts")}
                  >
                    <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" aria-hidden="true" />
                    Charts
                  </TabsTrigger>
                  <TabsTrigger
                    ref={activeTab === "professional" ? activeTabRef : null}
                    value="professional"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-sm py-3 px-5 rounded-md transition-all whitespace-nowrap touch-manipulation min-h-[48px] min-w-[100px] active:scale-95 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                    role="tab"
                    aria-selected={activeTab === "professional"}
                    aria-controls="professional-panel"
                    id="professional-tab"
                    onKeyDown={(e) => handleTabKeyDown(e, "professional")}
                  >
                    <Stethoscope
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0"
                      aria-hidden="true"
                    />
                    Professional
                  </TabsTrigger>
                  <TabsTrigger
                    ref={activeTab === "feedback" ? activeTabRef : null}
                    value="feedback"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-sm py-3 px-5 rounded-md transition-all whitespace-nowrap touch-manipulation min-h-[48px] min-w-[100px] active:scale-95 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                    role="tab"
                    aria-selected={activeTab === "feedback"}
                    aria-controls="feedback-panel"
                    id="feedback-tab"
                    onKeyDown={(e) => handleTabKeyDown(e, "feedback")}
                  >
                    <ThumbsUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" aria-hidden="true" />
                    Feedback
                  </TabsTrigger>
                </TabsList>
              </div>
              <p
                className="text-xs text-center mt-3 sm:hidden bg-purple-50 py-2 px-3 rounded-md text-purple-700 font-medium"
                aria-live="polite"
              >
                👆 Swipe or slide to navigate tabs
              </p>
            </div>

            <TabsContent
              value="overview"
              className="space-y-4 sm:space-y-5 md:space-y-6 mt-0"
              role="tabpanel"
              id="overview-panel"
              aria-labelledby="overview-tab"
            >
              {/* Communication Styles */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" aria-hidden="true" />
                    Communication Styles & Emotional Tone
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    {results.communicationStylesAndEmotionalTone?.description}
                  </p>

                  {results.communicationStylesAndEmotionalTone?.emotionalVibeTags && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {results.communicationStylesAndEmotionalTone.emotionalVibeTags.map(
                        (tag: string, index: number) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-purple-100 text-purple-700 text-xs sm:text-sm"
                          >
                            {tag}
                          </Badge>
                        ),
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
                    <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">{subjectALabel}'s Style</h4>
                      <p className="text-xs sm:text-sm text-blue-800">
                        {results.communicationStylesAndEmotionalTone?.subjectAStyle}
                      </p>
                    </div>
                    <div className="p-3 sm:p-4 bg-pink-50 rounded-lg">
                      <h4 className="font-semibold text-pink-900 mb-2 text-sm sm:text-base">{subjectBLabel}'s Style</h4>
                      <p className="text-xs sm:text-sm text-pink-800">
                        {results.communicationStylesAndEmotionalTone?.subjectBStyle}
                      </p>
                    </div>
                  </div>

                  {results.communicationStylesAndEmotionalTone?.regulationPatternsObserved && (
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg mt-3">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Regulation Patterns</h4>
                      <p className="text-xs sm:text-sm text-gray-700">
                        {results.communicationStylesAndEmotionalTone.regulationPatternsObserved}
                      </p>
                    </div>
                  )}

                  {results.communicationStylesAndEmotionalTone?.messageRhythmAndPacing && (
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Rhythm & Pacing</h4>
                      <p className="text-xs sm:text-sm text-gray-700">
                        {results.communicationStylesAndEmotionalTone.messageRhythmAndPacing}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Reflective Frameworks */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" aria-hidden="true" />
                    Reflective Frameworks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {results.reflectiveFrameworks?.description && (
                    <p className="text-sm sm:text-base text-gray-700">{results.reflectiveFrameworks.description}</p>
                  )}

                  <div className="space-y-2.5 sm:space-y-3">
                    {results.reflectiveFrameworks?.attachmentEnergies && (
                      <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-semibold text-purple-900 mb-2 text-sm sm:text-base">Attachment Energies</h4>
                        <p className="text-xs sm:text-sm text-purple-800">
                          {results.reflectiveFrameworks.attachmentEnergies}
                        </p>
                      </div>
                    )}

                    {results.reflectiveFrameworks?.loveLanguageFriction && (
                      <div className="p-3 sm:p-4 bg-pink-50 rounded-lg">
                        <h4 className="font-semibold text-pink-900 mb-2 text-sm sm:text-base">
                          Love Language Friction
                        </h4>
                        <p className="text-xs sm:text-sm text-pink-800">
                          {results.reflectiveFrameworks.loveLanguageFriction}
                        </p>
                      </div>
                    )}

                    {results.reflectiveFrameworks?.gottmanConflictMarkers && (
                      <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">
                          Gottman Conflict Markers
                        </h4>
                        <p className="text-xs sm:text-sm text-blue-800">
                          {results.reflectiveFrameworks.gottmanConflictMarkers}
                        </p>
                      </div>
                    )}

                    {results.reflectiveFrameworks?.emotionalIntelligenceIndicators && (
                      <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2 text-sm sm:text-base">
                          Emotional Intelligence Indicators
                        </h4>
                        <p className="text-xs sm:text-sm text-green-800">
                          {results.reflectiveFrameworks.emotionalIntelligenceIndicators}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Outlook */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" aria-hidden="true" />
                    Outlook & Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                    {results.outlook}
                  </p>
                </CardContent>
              </Card>

              {/* Optional Appendix */}
              {results.optionalAppendix && (
                <Card>
                  <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" aria-hidden="true" />
                      Additional Observations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                      {results.optionalAppendix}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Key Takeaways */}
              {results.keyTakeaways && results.keyTakeaways.length > 0 && (
                <Card className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50">
                  <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                      <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" aria-hidden="true" />
                      Key Takeaways
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2.5 sm:space-y-3">
                      {results.keyTakeaways.map((takeaway: string, index: number) => (
                        <li key={index} className="flex items-start gap-2.5 sm:gap-3">
                          <CheckCircle2
                            className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mt-0.5 flex-shrink-0"
                            aria-hidden="true"
                          />
                          <span className="text-sm sm:text-base text-gray-700">{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent
              value="patterns"
              className="space-y-4 sm:space-y-5 md:space-y-6 mt-0"
              role="tabpanel"
              id="patterns-panel"
              aria-labelledby="patterns-tab"
            >
              <Card>
                <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" aria-hidden="true" />
                    Recurring Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {results.recurringPatternsIdentified?.description && (
                    <p className="text-sm sm:text-base text-gray-700">
                      {results.recurringPatternsIdentified.description}
                    </p>
                  )}

                  {results.recurringPatternsIdentified?.positivePatterns &&
                    results.recurringPatternsIdentified.positivePatterns.length > 0 && (
                      <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                          Positive Patterns
                        </h4>
                        <ul className="space-y-1.5">
                          {results.recurringPatternsIdentified.positivePatterns.map(
                            (pattern: string, index: number) => (
                              <li key={index} className="text-xs sm:text-sm text-green-800 flex items-start gap-2">
                                <span className="text-green-600 mt-1 flex-shrink-0">•</span>
                                <span>{pattern}</span>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}

                  {results.recurringPatternsIdentified?.loopingMiscommunicationsExamples &&
                    results.recurringPatternsIdentified.loopingMiscommunicationsExamples.length > 0 && (
                      <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg">
                        <h4 className="font-semibold text-yellow-900 mb-2 text-sm sm:text-base">
                          Looping Miscommunications
                        </h4>
                        <ul className="space-y-1.5">
                          {results.recurringPatternsIdentified.loopingMiscommunicationsExamples.map(
                            (example: string, index: number) => (
                              <li key={index} className="text-xs sm:text-sm text-yellow-800 flex items-start gap-2">
                                <span className="text-yellow-600 mt-1 flex-shrink-0">•</span>
                                <span>{example}</span>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}

                  {results.recurringPatternsIdentified?.commonTriggersAndResponsesExamples &&
                    results.recurringPatternsIdentified.commonTriggersAndResponsesExamples.length > 0 && (
                      <div className="p-3 sm:p-4 bg-orange-50 rounded-lg">
                        <h4 className="font-semibold text-orange-900 mb-2 text-sm sm:text-base">
                          Common Triggers & Responses
                        </h4>
                        <ul className="space-y-1.5">
                          {results.recurringPatternsIdentified.commonTriggersAndResponsesExamples.map(
                            (example: string, index: number) => (
                              <li key={index} className="text-xs sm:text-sm text-orange-800 flex items-start gap-2">
                                <span className="text-orange-600 mt-1 flex-shrink-0">•</span>
                                <span>{example}</span>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}

                  {results.recurringPatternsIdentified?.repairAttemptsOrEmotionalAvoidancesExamples &&
                    results.recurringPatternsIdentified.repairAttemptsOrEmotionalAvoidancesExamples.length > 0 && (
                      <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">
                          Repair Attempts & Emotional Avoidances
                        </h4>
                        <ul className="space-y-1.5">
                          {results.recurringPatternsIdentified.repairAttemptsOrEmotionalAvoidancesExamples.map(
                            (example: string, index: number) => (
                              <li key={index} className="text-xs sm:text-sm text-blue-800 flex items-start gap-2">
                                <span className="text-blue-600 mt-1 flex-shrink-0">•</span>
                                <span>{example}</span>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" aria-hidden="true" />
                    What's Getting in the Way
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {results.whatsGettingInTheWay?.description && (
                    <p className="text-sm sm:text-base text-gray-700">{results.whatsGettingInTheWay.description}</p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {results.whatsGettingInTheWay?.emotionalMismatches && (
                      <div className="p-3 sm:p-4 bg-red-50 rounded-lg">
                        <h4 className="font-semibold text-red-900 mb-2 text-sm sm:text-base">Emotional Mismatches</h4>
                        <p className="text-xs sm:text-sm text-red-800">
                          {results.whatsGettingInTheWay.emotionalMismatches}
                        </p>
                      </div>
                    )}

                    {results.whatsGettingInTheWay?.communicationGaps && (
                      <div className="p-3 sm:p-4 bg-orange-50 rounded-lg">
                        <h4 className="font-semibold text-orange-900 mb-2 text-sm sm:text-base">Communication Gaps</h4>
                        <p className="text-xs sm:text-sm text-orange-800">
                          {results.whatsGettingInTheWay.communicationGaps}
                        </p>
                      </div>
                    )}
                  </div>

                  {results.whatsGettingInTheWay?.subtlePowerStrugglesOrMisfires && (
                    <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2 text-sm sm:text-base">
                        Subtle Power Struggles
                      </h4>
                      <p className="text-xs sm:text-sm text-purple-800">
                        {results.whatsGettingInTheWay.subtlePowerStrugglesOrMisfires}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent
              value="charts"
              className="space-y-6 sm:space-y-7 md:space-y-8 mt-0"
              role="tabpanel"
              id="charts-panel"
              aria-labelledby="charts-tab"
            >
              <Card>
                <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" aria-hidden="true" />
                    Visual Insights
                  </CardTitle>
                  {results.visualInsightsData?.descriptionForChartsIntro && (
                    <CardDescription className="text-xs sm:text-sm mt-2">
                      {results.visualInsightsData.descriptionForChartsIntro}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-8 sm:space-y-10 md:space-y-12">
                  {/* Emotional Communication Chart */}
                  {results.visualInsightsData?.emotionalCommunicationCharacteristics &&
                    results.visualInsightsData.emotionalCommunicationCharacteristics.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                          Emotional Communication Characteristics
                        </h4>
                        <div className="w-full">
                          <OptimizedBarChart
                            data={results.visualInsightsData.emotionalCommunicationCharacteristics}
                            title=""
                          />
                        </div>

                        {/* Insight for Emotional Communication */}
                        {emotionalInsight && (
                          <ChartInsight type={emotionalInsight.type}>{emotionalInsight.text}</ChartInsight>
                        )}
                      </div>
                    )}

                  {/* Conflict Expression Chart */}
                  {results.visualInsightsData?.conflictExpressionStyles &&
                    results.visualInsightsData.conflictExpressionStyles.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                          Conflict Expression Styles
                        </h4>
                        <div className="w-full">
                          <OptimizedBarChart data={results.visualInsightsData.conflictExpressionStyles} title="" />
                        </div>

                        {/* Insight for Conflict Expression */}
                        {conflictInsight && (
                          <ChartInsight type={conflictInsight.type}>{conflictInsight.text}</ChartInsight>
                        )}
                      </div>
                    )}

                  {/* Validation Patterns Pie Charts */}
                  {validationDataA.length > 0 && validationDataB.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                        Validation & Reassurance Patterns
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                        {/* Subject A Pie Chart */}
                        <div className="space-y-3">
                          {/* 3. Update the Subject Name labels in the charts sections */}
                          <p className="text-xs sm:text-sm font-medium text-center text-gray-600">{subjectALabel}</p>
                          <ResponsiveContainer width="100%" height={300} className="sm:h-[340px] md:h-[380px]">
                            <PieChart>
                              <Pie
                                data={validationDataA}
                                cx="50%"
                                cy="50%"
                                labelLine
                                label={CustomLabel}
                                outerRadius={75} // Increased from 70 to 75 for better proportion
                                className="sm:outerRadius-[85] md:outerRadius-[95]"
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {validationDataA.map((entry: any, index: number) => (
                                  <Cell key={`cell-a-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <RechartLegend content={<CustomLegend />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Subject B Pie Chart */}
                        <div className="space-y-3">
                          {/* 3. Update the Subject Name labels in the charts sections */}
                          <p className="text-xs sm:text-sm font-medium text-center text-gray-600">{subjectBLabel}</p>
                          <ResponsiveContainer width="100%" height={300} className="sm:h-[340px] md:h-[380px]">
                            <PieChart>
                              <Pie
                                data={validationDataB}
                                cx="50%"
                                cy="50%"
                                labelLine
                                label={CustomLabel}
                                outerRadius={75} // Increased from 70 to 75 for better proportion
                                className="sm:outerRadius-[85] md:outerRadius-[95]"
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {validationDataB.map((entry: any, index: number) => (
                                  <Cell key={`cell-b-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <RechartLegend content={<CustomLegend />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Insight for Validation Patterns */}
                      {validationInsight && (
                        <ChartInsight type={validationInsight.type}>{validationInsight.text}</ChartInsight>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent
              value="professional"
              className="space-y-4 sm:space-y-5 md:space-y-6 mt-0"
              role="tabpanel"
              id="professional-panel"
              aria-labelledby="professional-tab"
            >
              {/* Attachment Theory */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" aria-hidden="true" />
                    Attachment Theory Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {results.professionalInsights?.attachmentTheoryAnalysis?.subjectA && (
                      <div className="p-3 sm:p-4 bg-blue-50 rounded-lg space-y-2.5 sm:space-y-3">
                        {/* 5. In the Professional Insights tab, update all section headers that reference subjects: */}
                        <h4 className="font-semibold text-blue-900 text-sm sm:text-base">{subjectALabel}</h4>
                        <div>
                          <p className="text-[10px] sm:text-xs font-medium text-blue-700 mb-1">Attachment Style</p>
                          <Badge className="bg-blue-600 text-xs">
                            {results.professionalInsights.attachmentTheoryAnalysis.subjectA.primaryAttachmentStyle}
                          </Badge>
                        </div>
                        {results.professionalInsights.attachmentTheoryAnalysis.subjectA.attachmentBehaviors && (
                          <div>
                            <p className="text-[10px] sm:text-xs font-medium text-blue-700 mb-1.5">
                              Observable Behaviors
                            </p>
                            <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                              {results.professionalInsights.attachmentTheoryAnalysis.subjectA.attachmentBehaviors.map(
                                (behavior: string, index: number) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5 flex-shrink-0">•</span>
                                    <span>{behavior}</span>
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}
                        {results.professionalInsights.attachmentTheoryAnalysis.subjectA.triggersAndDefenses && (
                          <p className="text-xs sm:text-sm text-blue-800">
                            {results.professionalInsights.attachmentTheoryAnalysis.subjectA.triggersAndDefenses}
                          </p>
                        )}
                      </div>
                    )}

                    {results.professionalInsights?.attachmentTheoryAnalysis?.subjectB && (
                      <div className="p-3 sm:p-4 bg-pink-50 rounded-lg space-y-2.5 sm:space-y-3">
                        {/* 5. In the Professional Insights tab, update all section headers that reference subjects: */}
                        <h4 className="font-semibold text-pink-900 text-sm sm:text-base">{subjectBLabel}</h4>
                        <div>
                          <p className="text-[10px] sm:text-xs font-medium text-pink-700 mb-1">Attachment Style</p>
                          <Badge className="bg-pink-600 text-xs">
                            {results.professionalInsights.attachmentTheoryAnalysis.subjectB.primaryAttachmentStyle}
                          </Badge>
                        </div>
                        {results.professionalInsights.attachmentTheoryAnalysis.subjectB.attachmentBehaviors && (
                          <div>
                            <p className="text-[10px] sm:text-xs font-medium text-pink-700 mb-1.5">
                              Observable Behaviors
                            </p>
                            <ul className="text-xs sm:text-sm text-pink-800 space-y-1">
                              {results.professionalInsights.attachmentTheoryAnalysis.subjectB.attachmentBehaviors.map(
                                (behavior: string, index: number) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-pink-600 mt-0.5 flex-shrink-0">•</span>
                                    <span>{behavior}</span>
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}
                        {results.professionalInsights.attachmentTheoryAnalysis.subjectB.triggersAndDefenses && (
                          <p className="text-xs sm:text-sm text-pink-800">
                            {results.professionalInsights.attachmentTheoryAnalysis.subjectB.triggersAndDefenses}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {results.professionalInsights?.attachmentTheoryAnalysis?.dyad && (
                    <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2 text-sm sm:text-base">Dyadic Dynamics</h4>
                      <p className="text-xs sm:text-sm text-purple-800">
                        {results.professionalInsights.attachmentTheoryAnalysis.dyad}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Therapeutic Recommendations */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" aria-hidden="true" />
                    Therapeutic Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {results.professionalInsights?.therapeuticRecommendations?.immediateInterventions && (
                      <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2 text-sm sm:text-base">
                          Immediate Interventions
                        </h4>
                        <ul className="text-xs sm:text-sm text-green-800 space-y-1.5">
                          {results.professionalInsights.therapeuticRecommendations.immediateInterventions.map(
                            (intervention: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle2
                                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0"
                                  aria-hidden="true"
                                />
                                <span>{intervention}</span>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}

                    {results.professionalInsights?.therapeuticRecommendations?.longTermGoals && (
                      <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Long-Term Goals</h4>
                        <ul className="text-xs sm:text-sm text-blue-800 space-y-1.5">
                          {results.professionalInsights.therapeuticRecommendations.longTermGoals.map(
                            (goal: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <Target
                                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 mt-0.5 flex-shrink-0"
                                  aria-hidden="true"
                                />
                                <span>{goal}</span>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  {results.professionalInsights?.therapeuticRecommendations?.suggestedModalities && (
                    <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2 text-sm sm:text-base">
                        Suggested Therapeutic Modalities
                      </h4>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {results.professionalInsights.therapeuticRecommendations.suggestedModalities.map(
                          (modality: string, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-purple-100 text-purple-700 text-xs sm:text-sm"
                            >
                              {modality}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Clinical Exercises */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" aria-hidden="true" />
                    Clinical Exercises & Practices
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-5 md:space-y-6">
                  {results.professionalInsights?.clinicalExercises?.communicationExercises && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2.5 sm:mb-3 text-sm sm:text-base">
                        Communication Exercises
                      </h4>
                      <div className="space-y-2.5 sm:space-y-3">
                        {results.professionalInsights.clinicalExercises.communicationExercises.map(
                          (exercise: any, index: number) => (
                            <div key={index} className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                <h5 className="font-semibold text-blue-900 text-sm sm:text-base">{exercise.title}</h5>
                                <Badge variant="outline" className="text-[10px] sm:text-xs w-fit flex-shrink-0">
                                  {exercise.frequency}
                                </Badge>
                              </div>
                              <p className="text-xs sm:text-sm text-blue-800">{exercise.description}</p>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {results.professionalInsights?.clinicalExercises?.emotionalRegulationPractices && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2.5 sm:mb-3 text-sm sm:text-base">
                        Emotional Regulation Practices
                      </h4>
                      <div className="space-y-2.5 sm:space-y-3">
                        {results.professionalInsights.clinicalExercises.emotionalRegulationPractices.map(
                          (practice: any, index: number) => (
                            <div key={index} className="p-3 sm:p-4 bg-green-50 rounded-lg">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                <h5 className="font-semibold text-green-900 text-sm sm:text-base">{practice.title}</h5>
                                <Badge variant="outline" className="text-[10px] sm:text-xs w-fit flex-shrink-0">
                                  {practice.frequency}
                                </Badge>
                              </div>
                              <p className="text-xs sm:text-sm text-green-800">{practice.description}</p>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {results.professionalInsights?.clinicalExercises?.relationshipRituals && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2.5 sm:mb-3 text-sm sm:text-base">
                        Relationship Rituals
                      </h4>
                      <div className="space-y-2.5 sm:space-y-3">
                        {results.professionalInsights.clinicalExercises.relationshipRituals.map(
                          (ritual: any, index: number) => (
                            <div key={index} className="p-3 sm:p-4 bg-purple-50 rounded-lg">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                <h5 className="font-semibold text-purple-900 text-sm sm:text-base">{ritual.title}</h5>
                                <Badge variant="outline" className="text-[10px] sm:text-xs w-fit flex-shrink-0">
                                  {ritual.frequency}
                                </Badge>
                              </div>
                              <p className="text-xs sm:text-sm text-purple-800">{ritual.description}</p>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Prognosis */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" aria-hidden="true" />
                    Clinical Prognosis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                    {results.professionalInsights?.prognosis?.shortTerm && (
                      <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2 text-sm sm:text-base">
                          Short-Term (1-3 months)
                        </h4>
                        <p className="text-xs sm:text-sm text-green-800">
                          {results.professionalInsights.prognosis.shortTerm}
                        </p>
                      </div>
                    )}

                    {results.professionalInsights?.prognosis?.mediumTerm && (
                      <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">
                          Medium-Term (6-12 months)
                        </h4>
                        <p className="text-xs sm:text-sm text-blue-800">
                          {results.professionalInsights.prognosis.mediumTerm}
                        </p>
                      </div>
                    )}

                    {results.professionalInsights?.prognosis?.longTerm && (
                      <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-semibold text-purple-900 mb-2 text-sm sm:text-base">Long-Term Outlook</h4>
                        <p className="text-xs sm:text-sm text-purple-800">
                          {results.professionalInsights.prognosis.longTerm}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {results.professionalInsights?.prognosis?.riskFactors && (
                      <div className="p-3 sm:p-4 bg-red-50 rounded-lg">
                        <h4 className="font-semibold text-red-900 mb-2 text-sm sm:text-base">Risk Factors</h4>
                        <ul className="text-xs sm:text-sm text-red-800 space-y-1.5">
                          {results.professionalInsights.prognosis.riskFactors.map((factor: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <AlertCircle
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 mt-0.5 flex-shrink-0"
                                aria-hidden="true"
                              />
                              <span>{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {results.professionalInsights?.prognosis?.protectiveFactors && (
                      <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2 text-sm sm:text-base">Protective Factors</h4>
                        <ul className="text-xs sm:text-sm text-green-800 space-y-1.5">
                          {results.professionalInsights.prognosis.protectiveFactors.map(
                            (factor: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle2
                                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0"
                                  aria-hidden="true"
                                />
                                <span>{factor}</span>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Differential Considerations */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" aria-hidden="true" />
                    Differential Considerations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {results.professionalInsights?.differentialConsiderations?.individualTherapyConsiderations && (
                    <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">
                        Individual Therapy Considerations
                      </h4>
                      <p className="text-xs sm:text-sm text-blue-800">
                        {results.professionalInsights.differentialConsiderations.individualTherapyConsiderations}
                      </p>
                    </div>
                  )}

                  {results.professionalInsights?.differentialConsiderations?.couplesTherapyReadiness && (
                    <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2 text-sm sm:text-base">
                        Couples Therapy Readiness
                      </h4>
                      <p className="text-xs sm:text-sm text-purple-800">
                        {results.professionalInsights.differentialConsiderations.couplesTherapyReadiness}
                      </p>
                    </div>
                  )}

                  {results.professionalInsights?.differentialConsiderations?.externalResourcesNeeded && (
                    <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2 text-sm sm:text-base">
                        External Resources Needed
                      </h4>
                      <ul className="text-xs sm:text-sm text-green-800 space-y-1.5">
                        {results.professionalInsights.differentialConsiderations.externalResourcesNeeded.map(
                          (resource: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-600 mt-0.5 flex-shrink-0">•</span>
                              <span>{resource}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Trauma-Informed Observations */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" aria-hidden="true" />
                    Trauma-Informed Observations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {results.professionalInsights?.traumaInformedObservations?.identifiedPatterns && (
                    <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-semibold text-yellow-900 mb-2 text-sm sm:text-base">Identified Patterns</h4>
                      <ul className="text-xs sm:text-sm text-yellow-800 space-y-1.5">
                        {results.professionalInsights.traumaInformedObservations.identifiedPatterns.map(
                          (pattern: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-yellow-600 mt-0.5 flex-shrink-0">•</span>
                              <span>{pattern}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}

                  {results.professionalInsights?.traumaInformedObservations?.copingMechanisms && (
                    <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Coping Mechanisms</h4>
                      <p className="text-xs sm:text-sm text-blue-800">
                        {results.professionalInsights.traumaInformedObservations.copingMechanisms}
                      </p>
                    </div>
                  )}

                  {results.professionalInsights?.traumaInformedObservations?.safetyAndTrust && (
                    <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2 text-sm sm:text-base">Safety and Trust</h4>
                      <p className="text-xs sm:text-sm text-green-800">
                        {results.professionalInsights.traumaInformedObservations.safetyAndTrust}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent
              value="feedback"
              className="space-y-4 sm:space-y-5 md:space-y-6 mt-0"
              role="tabpanel"
              id="feedback-panel"
              aria-labelledby="feedback-tab"
            >
              <Card>
                <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" aria-hidden="true" />
                    Constructive Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 sm:space-y-6 md:space-y-8">
                  {/* Subject A Feedback */}
                  <div className="space-y-3 sm:space-y-4">
                    {/* 4. Update the feedback section headers to use dynamic labels */}
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">For {subjectALabel}</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                      {results.constructiveFeedback?.subjectA?.strengths && (
                        <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                          <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                            Strengths
                          </h4>
                          <ul className="text-xs sm:text-sm text-green-800 space-y-1.5">
                            {results.constructiveFeedback.subjectA.strengths.map((strength: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-green-600 mt-0.5 flex-shrink-0">•</span>
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {results.constructiveFeedback?.subjectA?.gentleGrowthNudges && (
                        <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg">
                          <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                            <Lightbulb className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                            Growth Nudges
                          </h4>
                          <ul className="text-xs sm:text-sm text-yellow-800 space-y-1.5">
                            {results.constructiveFeedback.subjectA.gentleGrowthNudges.map(
                              (nudge: string, index: number) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-yellow-600 mt-0.5 flex-shrink-0">•</span>
                                  <span>{nudge}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}

                      {results.constructiveFeedback?.subjectA?.connectionBoosters && (
                        <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
                          <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                            <Heart className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                            Connection Boosters
                          </h4>
                          <ul className="text-xs sm:text-sm text-purple-800 space-y-1.5">
                            {results.constructiveFeedback.subjectA.connectionBoosters.map(
                              (booster: string, index: number) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-purple-600 mt-0.5 flex-shrink-0">•</span>
                                  <span>{booster}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subject B Feedback */}
                  <div className="space-y-3 sm:space-y-4">
                    {/* 4. Update the feedback section headers to use dynamic labels */}
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">For {subjectBLabel}</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                      {results.constructiveFeedback?.subjectB?.strengths && (
                        <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                          <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                            Strengths
                          </h4>
                          <ul className="text-xs sm:text-sm text-green-800 space-y-1.5">
                            {results.constructiveFeedback.subjectB.strengths.map((strength: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-green-600 mt-0.5 flex-shrink-0">•</span>
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {results.constructiveFeedback?.subjectB?.gentleGrowthNudges && (
                        <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg">
                          <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                            <Lightbulb className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                            Growth Nudges
                          </h4>
                          <ul className="text-xs sm:text-sm text-yellow-800 space-y-1.5">
                            {results.constructiveFeedback.subjectB.gentleGrowthNudges.map(
                              (nudge: string, index: number) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-yellow-600 mt-0.5 flex-shrink-0">•</span>
                                  <span>{nudge}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}

                      {results.constructiveFeedback?.subjectB?.connectionBoosters && (
                        <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
                          <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                            <Heart className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                            Connection Boosters
                          </h4>
                          <ul className="text-xs sm:text-sm text-purple-800 space-y-1.5">
                            {results.constructiveFeedback.subjectB.connectionBoosters.map(
                              (booster: string, index: number) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-purple-600 mt-0.5 flex-shrink-0">•</span>
                                  <span>{booster}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shared Feedback */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">For Both Partners</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                      {results.constructiveFeedback?.forBoth?.sharedStrengths && (
                        <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                          <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                            Shared Strengths
                          </h4>
                          <ul className="text-xs sm:text-sm text-green-800 space-y-1.5">
                            {results.constructiveFeedback.forBoth.sharedStrengths.map(
                              (strength: string, index: number) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-green-600 mt-0.5 flex-shrink-0">•</span>
                                  <span>{strength}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}

                      {results.constructiveFeedback?.forBoth?.sharedGrowthNudges && (
                        <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg">
                          <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                            <Lightbulb className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                            Shared Growth Nudges
                          </h4>
                          <ul className="text-xs sm:text-sm text-yellow-800 space-y-1.5">
                            {results.constructiveFeedback.forBoth.sharedGrowthNudges.map(
                              (nudge: string, index: number) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-yellow-600 mt-0.5 flex-shrink-0">•</span>
                                  <span>{nudge}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}

                      {results.constructiveFeedback?.forBoth?.sharedConnectionBoosters && (
                        <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
                          <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                            <Heart className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                            Shared Connection Boosters
                          </h4>
                          <ul className="text-xs sm:text-sm text-purple-800 space-y-1.5">
                            {results.constructiveFeedback.forBoth.sharedConnectionBoosters.map(
                              (booster: string, index: number) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-purple-600 mt-0.5 flex-shrink-0">•</span>
                                  <span>{booster}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
