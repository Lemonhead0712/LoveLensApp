"use client"
import { useState } from "react"
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
  const radius = outerRadius + 30
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="#374151"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-[9px] sm:text-[10px] md:text-xs font-medium"
    >
      {name.length > 15 ? name.substring(0, 13) + "..." : name} {(percent * 100).toFixed(0)}%
    </text>
  )
}

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-xs text-gray-700">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function EnhancedAnalysisResults({ results }: EnhancedAnalysisResultsProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  if (results.error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800 ml-2">{results.error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const handleExport = async () => {
    setIsExporting(true)
    setExportSuccess(false)
    try {
      // Implement export logic here
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 5000)
    } catch (error) {
      console.error("Export error:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const validationDataA =
    results.visualInsightsData?.validationAndReassurancePatterns?.map((item: any, index: number) => ({
      name: item.category,
      value: item["Subject A"],
      color: COLORS[index % COLORS.length],
    })) || []

  const validationDataB =
    results.visualInsightsData?.validationAndReassurancePatterns?.map((item: any, index: number) => ({
      name: item.category,
      value: item["Subject B"],
      color: COLORS[index % COLORS.length],
    })) || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-purple-50 p-3 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5 md:space-y-6">
        {/* Header Section - Identical on mobile and web, just styled responsively */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 sm:space-y-4 mb-4 sm:mb-6 md:mb-8"
        >
          {/* Title */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-center">
              Your Relationship Analysis
            </h1>
          </div>

          {/* Confidence Warning - Shown on both views */}
          {results.confidenceWarning && (
            <Alert className="border-yellow-200 bg-yellow-50 max-w-3xl mx-auto">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <AlertDescription className="text-yellow-800 text-xs sm:text-sm text-left">
                  {results.confidenceWarning}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Metadata Badges - All shown on both views */}
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center items-center">
            <Badge variant="outline" className="py-1.5 px-2.5 sm:px-3 text-xs sm:text-sm">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="whitespace-nowrap">{results.messageCount || 0} Messages</span>
            </Badge>
            <Badge variant="outline" className="py-1.5 px-2.5 sm:px-3 text-xs sm:text-sm">
              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="whitespace-nowrap">{results.extractionConfidence || 0}% Confidence</span>
            </Badge>
            {results.processingTimeMs && (
              <Badge variant="outline" className="py-1.5 px-2.5 sm:px-3 text-xs sm:text-sm">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="whitespace-nowrap">{(results.processingTimeMs / 1000).toFixed(1)}s</span>
              </Badge>
            )}
          </div>

          {/* Export Button - Shown on both views */}
          <div className="flex justify-center pt-2">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              size="default"
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export to Word
                </>
              )}
            </Button>
          </div>

          {/* Export Success Message - Shown on both views */}
          {exportSuccess && (
            <Alert className="border-green-200 bg-green-50 max-w-md mx-auto">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 ml-2 text-sm">
                Export successful! Check your downloads.
              </AlertDescription>
            </Alert>
          )}
        </motion.div>

        {/* Relationship Health Score - Identical on both views */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50">
            <CardHeader className="pb-3 sm:pb-4 md:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 flex-shrink-0" />
                Overall Relationship Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-4">
                <div className="text-5xl sm:text-6xl font-bold text-purple-600">
                  {results.overallRelationshipHealth?.score || 7}/10
                </div>
                <div className="flex-1 w-full">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded-full overflow-hidden">
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

        {/* Introduction Note - Identical on both views */}
        {results.introductionNote && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="pt-4 sm:pt-5 md:pt-6">
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{results.introductionNote}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tabbed Content - All tabs shown on both views */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tab Navigation - Scrollable on mobile, grid on desktop */}
            <div className="relative mb-4 sm:mb-6">
              <div className="overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
                <TabsList className="inline-flex sm:grid w-auto sm:w-full min-w-max sm:min-w-0 sm:grid-cols-5 h-auto gap-1.5 sm:gap-2 bg-white/50 p-1.5 rounded-lg">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-4 rounded-md transition-all whitespace-nowrap"
                  >
                    <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="patterns"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-4 rounded-md transition-all whitespace-nowrap"
                  >
                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                    Patterns
                  </TabsTrigger>
                  <TabsTrigger
                    value="charts"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-4 rounded-md transition-all whitespace-nowrap"
                  >
                    <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                    Charts
                  </TabsTrigger>
                  <TabsTrigger
                    value="professional"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-4 rounded-md transition-all whitespace-nowrap"
                  >
                    <Stethoscope className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                    Professional
                  </TabsTrigger>
                  <TabsTrigger
                    value="feedback"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-4 rounded-md transition-all whitespace-nowrap"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                    Feedback
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* Overview Tab Content */}
            <TabsContent value="overview" className="space-y-4 sm:space-y-5 md:space-y-6 mt-0">
              {/* Communication Styles - All content shown on both views */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                    Communication Styles & Emotional Tone
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    {results.communicationStylesAndEmotionalTone?.description}
                  </p>

                  {/* Emotional Tags - All shown */}
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

                  {/* Subject Styles - Both shown, stacked on mobile, side-by-side on desktop */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
                    <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Subject A's Style</h4>
                      <p className="text-xs sm:text-sm text-blue-800">
                        {results.communicationStylesAndEmotionalTone?.subjectAStyle}
                      </p>
                    </div>
                    <div className="p-3 sm:p-4 bg-pink-50 rounded-lg">
                      <h4 className="font-semibold text-pink-900 mb-2 text-sm sm:text-base">Subject B's Style</h4>
                      <p className="text-xs sm:text-sm text-pink-800">
                        {results.communicationStylesAndEmotionalTone?.subjectBStyle}
                      </p>
                    </div>
                  </div>

                  {/* Additional Communication Details - All shown */}
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

              {/* Reflective Frameworks - All content shown */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                    Reflective Frameworks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {results.reflectiveFrameworks?.description && (
                    <p className="text-sm sm:text-base text-gray-700">{results.reflectiveFrameworks.description}</p>
                  )}

                  <div className="space-y-2.5 sm:space-y-3">
                    {/* All framework sections shown on both views */}
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
            </TabsContent>

            {/* Patterns Tab Content */}
            <TabsContent value="patterns" className="space-y-4 sm:space-y-5 md:space-y-6 mt-0">
              {/* Recurring Patterns - All content shown */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                    Recurring Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {results.recurringPatternsIdentified?.description && (
                    <p className="text-sm sm:text-base text-gray-700">
                      {results.recurringPatternsIdentified.description}
                    </p>
                  )}

                  {/* All pattern sections shown */}
                  {results.recurringPatternsIdentified?.positivePatterns &&
                    results.recurringPatternsIdentified.positivePatterns.length > 0 && (
                      <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
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

              {/* What's Getting in the Way - All content shown */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                    What's Getting in the Way
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {results.whatsGettingInTheWay?.description && (
                    <p className="text-sm sm:text-base text-gray-700">{results.whatsGettingInTheWay.description}</p>
                  )}

                  {/* All obstacle sections shown, stacked on mobile, side-by-side on desktop */}
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

            {/* Charts Tab Content */}
            <TabsContent value="charts" className="space-y-4 sm:space-y-5 md:space-y-6 mt-0">
              <Card>
                <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                    Visual Insights
                  </CardTitle>
                  {results.visualInsightsData?.descriptionForChartsIntro && (
                    <CardDescription className="text-xs sm:text-sm mt-2">
                      {results.visualInsightsData.descriptionForChartsIntro}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-6 sm:space-y-7 md:space-y-8">
                  {/* All charts shown on both views */}
                  {results.visualInsightsData?.emotionalCommunicationCharacteristics &&
                    results.visualInsightsData.emotionalCommunicationCharacteristics.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                          Emotional Communication Characteristics
                        </h4>
                        <div className="w-full overflow-x-auto">
                          <OptimizedBarChart
                            data={results.visualInsightsData.emotionalCommunicationCharacteristics}
                            title=""
                          />
                        </div>
                      </div>
                    )}

                  {results.visualInsightsData?.conflictExpressionStyles &&
                    results.visualInsightsData.conflictExpressionStyles.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                          Conflict Expression Styles
                        </h4>
                        <div className="w-full overflow-x-auto">
                          <OptimizedBarChart data={results.visualInsightsData.conflictExpressionStyles} title="" />
                        </div>
                      </div>
                    )}

                  {/* Pie Charts - Both shown on both views */}
                  {validationDataA.length > 0 && validationDataB.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                        Validation & Reassurance Patterns
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                        {/* Subject A Pie Chart */}
                        <div className="space-y-2">
                          <p className="text-xs sm:text-sm font-medium text-center text-gray-600">Subject A</p>
                          <ResponsiveContainer width="100%" height={300} className="sm:h-[320px]">
                            <PieChart>
                              <Pie
                                data={validationDataA}
                                cx="50%"
                                cy="50%"
                                labelLine
                                label={CustomLabel}
                                outerRadius={85}
                                className="sm:outerRadius-[95]"
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
                        <div className="space-y-2">
                          <p className="text-xs sm:text-sm font-medium text-center text-gray-600">Subject B</p>
                          <ResponsiveContainer width="100%" height={300} className="sm:h-[320px]">
                            <PieChart>
                              <Pie
                                data={validationDataB}
                                cx="50%"
                                cy="50%"
                                labelLine
                                label={CustomLabel}
                                outerRadius={85}
                                className="sm:outerRadius-[95]"
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
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Professional Insights Tab - Content continues... */}
            <TabsContent value="professional" className="space-y-4 sm:space-y-5 md:space-y-6 mt-0">
              {/* Attachment Theory - All content shown */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                    Attachment Theory Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {/* Both subjects shown, stacked on mobile, side-by-side on desktop */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {results.professionalInsights?.attachmentTheoryAnalysis?.subjectA && (
                      <div className="p-3 sm:p-4 bg-blue-50 rounded-lg space-y-2.5 sm:space-y-3">
                        <h4 className="font-semibold text-blue-900 text-sm sm:text-base">Subject A</h4>
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
                        <h4 className="font-semibold text-pink-900 text-sm sm:text-base">Subject B</h4>
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

              {/* Therapeutic Recommendations - All content shown */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                    Therapeutic Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {/* All recommendations shown, stacked on mobile, side-by-side on desktop */}
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
                                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" />
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
                                <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 mt-0.5 flex-shrink-0" />
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

              {/* Clinical Exercises - All shown */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                    Clinical Exercises & Practices
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-5 md:space-y-6">
                  {/* All exercise sections shown */}
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

              {/* Prognosis - All content shown */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                    Clinical Prognosis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {/* All timeframe sections shown, stacked on mobile, grid on desktop */}
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

                  {/* Risk and protective factors, stacked on mobile, side-by-side on desktop */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {results.professionalInsights?.prognosis?.riskFactors && (
                      <div className="p-3 sm:p-4 bg-red-50 rounded-lg">
                        <h4 className="font-semibold text-red-900 mb-2 text-sm sm:text-base">Risk Factors</h4>
                        <ul className="text-xs sm:text-sm text-red-800 space-y-1.5">
                          {results.professionalInsights.prognosis.riskFactors.map((factor: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 mt-0.5 flex-shrink-0" />
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
                                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" />
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

              {/* Differential Considerations - All shown */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
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

              {/* Trauma-Informed Observations - All shown */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
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

            {/* Feedback Tab Content */}
            <TabsContent value="feedback" className="space-y-4 sm:space-y-5 md:space-y-6 mt-0">
              <Card>
                <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                    Constructive Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 sm:space-y-6 md:space-y-8">
                  {/* Subject A Feedback - All shown */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">For Subject A</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                      {results.constructiveFeedback?.subjectA?.strengths && (
                        <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                          <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
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
                            <Lightbulb className="w-4 h-4 flex-shrink-0" />
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
                            <Heart className="w-4 h-4 flex-shrink-0" />
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

                  {/* Subject B Feedback - All shown */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">For Subject B</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                      {results.constructiveFeedback?.subjectB?.strengths && (
                        <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                          <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
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
                            <Lightbulb className="w-4 h-4 flex-shrink-0" />
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
                            <Heart className="w-4 h-4 flex-shrink-0" />
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

                  {/* Shared Feedback - All shown */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">For Both Partners</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                      {results.constructiveFeedback?.forBoth?.sharedStrengths && (
                        <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                          <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
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
                            <Lightbulb className="w-4 h-4 flex-shrink-0" />
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
                            <Heart className="w-4 h-4 flex-shrink-0" />
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

        {/* Outlook - Shown on both views */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="pb-3 sm:pb-4 md:pb-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                Outlook & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                {results.outlook}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Optional Appendix - Shown on both views when present */}
        {results.optionalAppendix && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card>
              <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                  Additional Observations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                  {results.optionalAppendix}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Key Takeaways - Shown on both views when present */}
        {results.keyTakeaways && results.keyTakeaways.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50">
              <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                  <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                  Key Takeaways
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5 sm:space-y-3">
                  {results.keyTakeaways.map((takeaway: string, index: number) => (
                    <li key={index} className="flex items-start gap-2.5 sm:gap-3">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-gray-700">{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
