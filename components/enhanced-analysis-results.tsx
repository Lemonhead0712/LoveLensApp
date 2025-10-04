"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BarChart3, Download, Heart, MessageSquare, TrendingUp, Users, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts"

interface AnalysisResultsProps {
  results: any
}

export default function EnhancedAnalysisResults({ results }: AnalysisResultsProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [isExporting, setIsExporting] = useState(false)

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Process and validate chart data
  const emotionalChartData = useMemo(() => {
    const data = results?.visualInsightsData?.emotionalCommunicationCharacteristics
    if (!Array.isArray(data) || data.length === 0) return []

    return data.map((item: any) => ({
      category: item.category || "Unknown",
      "Subject A": typeof item["Subject A"] === "number" ? item["Subject A"] : 0,
      "Subject B": typeof item["Subject B"] === "number" ? item["Subject B"] : 0,
    }))
  }, [results])

  const conflictChartData = useMemo(() => {
    const data = results?.visualInsightsData?.conflictExpressionStyles
    if (!Array.isArray(data) || data.length === 0) return []

    return data.map((item: any) => ({
      category: item.category || "Unknown",
      "Subject A": typeof item["Subject A"] === "number" ? item["Subject A"] : 0,
      "Subject B": typeof item["Subject B"] === "number" ? item["Subject B"] : 0,
    }))
  }, [results])

  const validationChartData = useMemo(() => {
    const data = results?.visualInsightsData?.validationAndReassurancePatterns
    if (!Array.isArray(data) || data.length === 0) return []

    return data.map((item: any) => ({
      category: item.category || "Unknown",
      "Subject A": typeof item["Subject A"] === "number" ? item["Subject A"] : 0,
      "Subject B": typeof item["Subject B"] === "number" ? item["Subject B"] : 0,
    }))
  }, [results])

  const metricsData = useMemo(() => {
    const metrics = results?.visualInsightsData?.communicationMetrics
    if (!metrics || typeof metrics !== "object") return []

    return Object.entries(metrics).map(([key, value]) => ({
      name: key.replace(/([A-Z])/g, " $1").trim(),
      value: typeof value === "number" ? value : 0,
    }))
  }, [results])

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      alert("Export feature coming soon!")
    } catch (error) {
      console.error("Export error:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const healthScore = results?.overallRelationshipHealth?.score || 0
  const healthColor = healthScore >= 7 ? "text-green-600" : healthScore >= 5 ? "text-yellow-600" : "text-red-600"
  const healthBg = healthScore >= 7 ? "bg-green-50" : healthScore >= 5 ? "bg-yellow-50" : "bg-red-50"

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white py-6">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {/* Header */}
          <div className="mb-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="mb-1.5 text-2xl font-bold text-gray-900">Relationship Analysis Results</h1>
              <p className="text-sm text-gray-600">
                Based on {results.messageCount} messages from {results.screenshotCount} screenshots
              </p>
            </div>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? "Exporting..." : "Export Report"}
            </Button>
          </div>

          {results.confidenceWarning && (
            <Alert className="mb-5 border-yellow-200 bg-yellow-50">
              <AlertDescription className="text-sm text-yellow-800">{results.confidenceWarning}</AlertDescription>
            </Alert>
          )}

          {/* Overall Health Score */}
          <Card className={`mb-5 border-2 ${healthBg}`}>
            <CardContent className="pt-5">
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white shadow-md">
                  <Heart className={`h-10 w-10 ${healthColor}`} fill="currentColor" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="mb-1 text-base font-semibold text-gray-900">Overall Relationship Health</h2>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className={`text-3xl font-bold ${healthColor}`}>{healthScore}/10</span>
                    <Badge variant={healthScore >= 7 ? "default" : "secondary"} className="text-xs">
                      {healthScore >= 7 ? "Strong" : healthScore >= 5 ? "Moderate" : "Needs Attention"}
                    </Badge>
                  </div>
                  <Progress value={healthScore * 10} className="mb-1.5 h-2" />
                  <p className="text-sm text-gray-600">{results.overallRelationshipHealth?.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Introduction Note */}
          {results.introductionNote && (
            <Card className="mb-5">
              <CardContent className="pt-5">
                <p className="text-sm leading-relaxed text-gray-700">{results.introductionNote}</p>
              </CardContent>
            </Card>
          )}

          {/* Main Content Tabs */}
          <Tabs defaultValue="insights" className="space-y-3">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              <TabsTrigger value="insights" className="text-xs sm:text-sm">
                <MessageSquare className="mr-2 h-4 w-4" />
                Insights
              </TabsTrigger>
              <TabsTrigger value="charts" className="text-xs sm:text-sm">
                <BarChart3 className="mr-2 h-4 w-4" />
                Charts
              </TabsTrigger>
              <TabsTrigger value="feedback" className="text-xs sm:text-sm">
                <Users className="mr-2 h-4 w-4" />
                Feedback
              </TabsTrigger>
              <TabsTrigger value="outlook" className="text-xs sm:text-sm">
                <TrendingUp className="mr-2 h-4 w-4" />
                Outlook
              </TabsTrigger>
            </TabsList>

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-2">
              {/* Communication Styles */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Communication Styles & Emotional Tone</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-gray-700">{results.communicationStylesAndEmotionalTone?.description}</p>

                  <div>
                    <h4 className="mb-1 text-sm font-semibold">Emotional Vibe</h4>
                    <div className="flex flex-wrap gap-2">
                      {results.communicationStylesAndEmotionalTone?.emotionalVibeTags?.map(
                        (tag: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-purple-50 p-4">
                      <h4 className="mb-1 text-sm font-semibold text-purple-900">Subject A's Style</h4>
                      <p className="text-xs text-purple-800">
                        {results.communicationStylesAndEmotionalTone?.subjectAStyle}
                      </p>
                    </div>
                    <div className="rounded-lg bg-pink-50 p-4">
                      <h4 className="mb-1 text-sm font-semibold text-pink-900">Subject B's Style</h4>
                      <p className="text-xs text-pink-800">
                        {results.communicationStylesAndEmotionalTone?.subjectBStyle}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recurring Patterns */}
              <Card>
                <CardHeader className="cursor-pointer" onClick={() => toggleSection("patterns")}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Recurring Patterns</CardTitle>
                    {expandedSections.patterns ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </CardHeader>
                <AnimatePresence>
                  {expandedSections.patterns && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="space-y-2">
                        <p className="text-sm text-gray-700">{results.recurringPatternsIdentified?.description}</p>

                        {results.recurringPatternsIdentified?.positivePatterns?.length > 0 && (
                          <div>
                            <h4 className="mb-1 text-sm font-semibold text-green-900">Positive Patterns</h4>
                            <ul className="space-y-1">
                              {results.recurringPatternsIdentified.positivePatterns.map(
                                (pattern: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-2 text-xs text-green-800">
                                    <span className="text-green-600">✓</span>
                                    <span>{pattern}</span>
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>

              {/* Reflective Frameworks */}
              <Card>
                <CardHeader className="cursor-pointer" onClick={() => toggleSection("frameworks")}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Psychological Frameworks</CardTitle>
                    {expandedSections.frameworks ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </CardHeader>
                <AnimatePresence>
                  {expandedSections.frameworks && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="space-y-2">
                        <div>
                          <h4 className="mb-1 text-sm font-semibold">Attachment Patterns</h4>
                          <p className="text-xs text-gray-700">{results.reflectiveFrameworks?.attachmentEnergies}</p>
                        </div>
                        <div>
                          <h4 className="mb-1 text-sm font-semibold">Love Language Dynamics</h4>
                          <p className="text-xs text-gray-700">{results.reflectiveFrameworks?.loveLanguageFriction}</p>
                        </div>
                        <div>
                          <h4 className="mb-1 text-sm font-semibold">Emotional Intelligence</h4>
                          <p className="text-xs text-gray-700">
                            {results.reflectiveFrameworks?.emotionalIntelligenceIndicators}
                          </p>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>

              {/* What's Getting in the Way */}
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-base text-orange-900">Areas for Growth</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-orange-800">{results.whatsGettingInTheWay?.description}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <h4 className="mb-1 text-sm font-semibold text-orange-900">Communication Gaps</h4>
                      <p className="text-xs text-orange-800">{results.whatsGettingInTheWay?.communicationGaps}</p>
                    </div>
                    <div>
                      <h4 className="mb-1 text-sm font-semibold text-orange-900">Emotional Mismatches</h4>
                      <p className="text-xs text-orange-800">{results.whatsGettingInTheWay?.emotionalMismatches}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Charts Tab */}
            <TabsContent value="charts" className="space-y-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Communication Metrics</CardTitle>
                  <p className="text-xs text-gray-600">{results.visualInsightsData?.descriptionForChartsIntro}</p>
                </CardHeader>
                <CardContent>
                  {metricsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={metricsData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 10]} />
                        <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ fontSize: "12px", borderRadius: "8px" }}
                          formatter={(value: any) => [`${value}/10`, "Score"]}
                        />
                        <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                          {metricsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(${280 + index * 20}, 70%, 60%)`} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="py-8 text-center text-sm text-gray-500">No metrics data available</p>
                  )}
                </CardContent>
              </Card>

              {emotionalChartData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Emotional Communication Patterns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <RadarChart data={emotionalChartData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 10 }} />
                        <Radar name="Subject A" dataKey="Subject A" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
                        <Radar name="Subject B" dataKey="Subject B" stroke="#ec4899" fill="#ec4899" fillOpacity={0.3} />
                        <Legend wrapperStyle={{ fontSize: "12px" }} />
                        <Tooltip contentStyle={{ fontSize: "12px", borderRadius: "8px" }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {conflictChartData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Conflict Resolution Styles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <RadarChart data={conflictChartData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 10 }} />
                        <Radar name="Subject A" dataKey="Subject A" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
                        <Radar name="Subject B" dataKey="Subject B" stroke="#ec4899" fill="#ec4899" fillOpacity={0.3} />
                        <Legend wrapperStyle={{ fontSize: "12px" }} />
                        <Tooltip contentStyle={{ fontSize: "12px", borderRadius: "8px" }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {validationChartData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Validation & Reassurance Patterns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <RadarChart data={validationChartData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 10 }} />
                        <Radar name="Subject A" dataKey="Subject A" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
                        <Radar name="Subject B" dataKey="Subject B" stroke="#ec4899" fill="#ec4899" fillOpacity={0.3} />
                        <Legend wrapperStyle={{ fontSize: "12px" }} />
                        <Tooltip contentStyle={{ fontSize: "12px", borderRadius: "8px" }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Feedback Tab */}
            <TabsContent value="feedback" className="space-y-2">
              <div className="grid gap-3 lg:grid-cols-2">
                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader>
                    <CardTitle className="text-sm text-purple-900">Subject A</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <h4 className="mb-1 text-xs font-semibold text-purple-900">Strengths</h4>
                      <ul className="space-y-1">
                        {results.constructiveFeedback?.subjectA?.strengths?.map((strength: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-purple-800">
                            <span className="text-purple-600">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="mb-1 text-xs font-semibold text-purple-900">Growth Areas</h4>
                      <ul className="space-y-1">
                        {results.constructiveFeedback?.subjectA?.gentleGrowthNudges?.map(
                          (nudge: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-purple-800">
                              <span className="text-purple-600">→</span>
                              <span>{nudge}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-pink-200 bg-pink-50">
                  <CardHeader>
                    <CardTitle className="text-sm text-pink-900">Subject B</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <h4 className="mb-1 text-xs font-semibold text-pink-900">Strengths</h4>
                      <ul className="space-y-1">
                        {results.constructiveFeedback?.subjectB?.strengths?.map((strength: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-pink-800">
                            <span className="text-pink-600">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="mb-1 text-xs font-semibold text-pink-900">Growth Areas</h4>
                      <ul className="space-y-1">
                        {results.constructiveFeedback?.subjectB?.gentleGrowthNudges?.map(
                          (nudge: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-pink-800">
                              <span className="text-pink-600">→</span>
                              <span>{nudge}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-indigo-200 bg-indigo-50">
                <CardHeader>
                  <CardTitle className="text-sm text-indigo-900">For Both of You</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <h4 className="mb-1 text-xs font-semibold text-indigo-900">Shared Strengths</h4>
                    <ul className="space-y-1">
                      {results.constructiveFeedback?.forBoth?.sharedStrengths?.map((strength: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-indigo-800">
                          <span className="text-indigo-600">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-1 text-xs font-semibold text-indigo-900">Growth Together</h4>
                    <ul className="space-y-1">
                      {results.constructiveFeedback?.forBoth?.sharedGrowthNudges?.map((nudge: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-indigo-800">
                          <span className="text-indigo-600">→</span>
                          <span>{nudge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Outlook Tab */}
            <TabsContent value="outlook" className="space-y-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Relationship Outlook</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{results.outlook}</p>
                </CardContent>
              </Card>

              {results.keyTakeaways && results.keyTakeaways.length > 0 && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-sm text-green-900">Key Takeaways</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {results.keyTakeaways.map((takeaway: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-green-800">
                          <span className="text-green-600">•</span>
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {results.optionalAppendix && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Additional Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-gray-700">{results.optionalAppendix}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
