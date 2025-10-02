"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Heart,
  MessageSquare,
  BarChart3,
  Brain,
  Shield,
  Sparkles,
  Users,
  Zap,
  ArrowLeft,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { exportToWord } from "@/app/actions"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

interface EnhancedAnalysisResultsProps {
  results: any
}

// Helper function to ensure we have an array
const ensureArray = (value: any): string[] => {
  if (Array.isArray(value)) {
    return value
  }
  if (typeof value === "string" && value.trim()) {
    // If it's a string, split by newlines or return as single item
    if (value.includes("\n")) {
      return value.split("\n").filter((item) => item.trim())
    }
    return [value]
  }
  return []
}

const MetricCard = ({ icon: Icon, label, value, color }: any) => (
  <Card className="border-purple-100 bg-gradient-to-br from-white to-purple-50">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`h-5 w-5 ${color}`} />
        <span className="text-2xl font-bold text-gray-900">{value}/10</span>
      </div>
      <p className="text-sm text-gray-600 font-medium">{label}</p>
      <Progress value={value * 10} className="mt-2 h-2" />
    </CardContent>
  </Card>
)

const InsightCard = ({ icon: Icon, title, children, color = "purple" }: any) => (
  <Card className={`border-${color}-100 bg-gradient-to-br from-white to-${color}-50`}>
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-lg">
        <div className={`p-2 rounded-lg bg-${color}-100`}>
          <Icon className={`h-5 w-5 text-${color}-600`} />
        </div>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="text-sm text-gray-700">{children}</CardContent>
  </Card>
)

export default function EnhancedAnalysisResults({ results }: EnhancedAnalysisResultsProps) {
  const router = useRouter()
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    setExportSuccess(false)
    try {
      await exportToWord(results)
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 5000)
    } catch (error) {
      console.error("Error exporting to Word:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleNewAnalysis = () => {
    router.push("/")
  }

  // Prepare radar chart data with safe array handling
  const emotionalData =
    results.visualInsightsData?.emotionalCommunicationCharacteristics?.map((item: any) => ({
      category: item.category,
      A: item["Subject A"],
      B: item["Subject B"],
    })) || []

  const conflictData =
    results.visualInsightsData?.conflictExpressionStyles?.map((item: any) => ({
      category: item.category,
      A: item["Subject A"],
      B: item["Subject B"],
    })) || []

  const validationData =
    results.visualInsightsData?.validationAndReassurancePatterns?.map((item: any) => ({
      category: item.category,
      A: item["Subject A"],
      B: item["Subject B"],
    })) || []

  const metrics = results.visualInsightsData?.communicationMetrics || {}

  // Safely get array data
  const emotionalVibeTags = ensureArray(results.communicationStylesAndEmotionalTone?.emotionalVibeTags)
  const positivePatterns = ensureArray(results.recurringPatternsIdentified?.positivePatterns)
  const loopingMiscommunications = ensureArray(results.recurringPatternsIdentified?.loopingMiscommunicationsExamples)
  const triggersAndResponses = ensureArray(results.recurringPatternsIdentified?.commonTriggersAndResponsesExamples)
  const repairAttempts = ensureArray(results.recurringPatternsIdentified?.repairAttemptsOrEmotionalAvoidancesExamples)
  const keyTakeaways = ensureArray(results.keyTakeaways)
  const subjectAStrengths = ensureArray(results.constructiveFeedback?.subjectA?.strengths)
  const subjectAGrowth = ensureArray(results.constructiveFeedback?.subjectA?.gentleGrowthNudges)
  const subjectABoosters = ensureArray(results.constructiveFeedback?.subjectA?.connectionBoosters)
  const subjectBStrengths = ensureArray(results.constructiveFeedback?.subjectB?.strengths)
  const subjectBGrowth = ensureArray(results.constructiveFeedback?.subjectB?.gentleGrowthNudges)
  const subjectBBoosters = ensureArray(results.constructiveFeedback?.subjectB?.connectionBoosters)
  const sharedStrengths = ensureArray(results.constructiveFeedback?.forBoth?.sharedStrengths)
  const sharedGrowth = ensureArray(results.constructiveFeedback?.forBoth?.sharedGrowthNudges)
  const sharedBoosters = ensureArray(results.constructiveFeedback?.forBoth?.sharedConnectionBoosters)

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewAnalysis}
            className="text-purple-600 hover:text-purple-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            New Analysis
          </Button>
        </div>

        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-full bg-white shadow-sm">
                    <Heart className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Relationship Analysis</h1>
                    {results.overallRelationshipHealth && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-semibold text-purple-700">
                          Health Score: {results.overallRelationshipHealth.score}/10
                        </span>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                          {results.overallRelationshipHealth.score >= 7
                            ? "Strong"
                            : results.overallRelationshipHealth.score >= 5
                              ? "Moderate"
                              : "Needs Attention"}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 max-w-2xl">{results.introductionNote}</p>
                {(results.messageCount || results.screenshotCount) && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {results.messageCount && (
                      <Badge variant="outline" className="border-purple-200">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {results.messageCount} messages
                      </Badge>
                    )}
                    {results.screenshotCount && (
                      <Badge variant="outline" className="border-purple-200">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        {results.screenshotCount} screenshots
                      </Badge>
                    )}
                    {results.extractionConfidence && (
                      <Badge variant="outline" className="border-purple-200">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {results.extractionConfidence}% confidence
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="bg-purple-600 hover:bg-purple-700 text-white w-full lg:w-auto"
                size="lg"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Export Report
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {exportSuccess && (
          <Alert className="border-green-200 bg-green-50 mt-4">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Export initiated! Your document should download shortly.
            </AlertDescription>
          </Alert>
        )}

        {results.confidenceWarning && (
          <Alert className="border-amber-200 bg-amber-50 mt-4">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <AlertDescription className="text-amber-800">{results.confidenceWarning}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Key Metrics */}
      {metrics && Object.keys(metrics).length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-purple-600" />
            Key Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <MetricCard
              icon={TrendingUp}
              label="Response Balance"
              value={metrics.responseTimeBalance || 5}
              color="text-blue-600"
            />
            <MetricCard
              icon={MessageSquare}
              label="Message Balance"
              value={metrics.messageLengthBalance || 5}
              color="text-green-600"
            />
            <MetricCard icon={Heart} label="Emotional Depth" value={metrics.emotionalDepth || 5} color="text-red-600" />
            <MetricCard
              icon={Shield}
              label="Conflict Resolution"
              value={metrics.conflictResolution || 5}
              color="text-purple-600"
            />
            <MetricCard
              icon={Sparkles}
              label="Affection Level"
              value={metrics.affectionLevel || 5}
              color="text-pink-600"
            />
          </div>
        </div>
      )}

      {/* Key Takeaways */}
      {keyTakeaways.length > 0 && (
        <Card className="mb-8 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
              Key Takeaways
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {keyTakeaways.map((takeaway: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-100">
                  <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">{takeaway}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6 bg-purple-50 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <MessageSquare className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="patterns" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Zap className="h-4 w-4 mr-2" />
            Patterns
          </TabsTrigger>
          <TabsTrigger value="feedback" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Users className="h-4 w-4 mr-2" />
            Feedback
          </TabsTrigger>
          <TabsTrigger value="visuals" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <BarChart3 className="h-4 w-4 mr-2" />
            Visuals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Communication Styles */}
          <InsightCard icon={MessageSquare} title="Communication Styles & Emotional Tone">
            <p className="mb-4">{results.communicationStylesAndEmotionalTone?.description}</p>

            {emotionalVibeTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {emotionalVibeTags.map((tag: string, index: number) => (
                  <Badge key={index} className="bg-purple-100 text-purple-700 border-purple-200">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {results.communicationStylesAndEmotionalTone?.subjectAStyle && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-700 mb-2">Subject A's Style</h4>
                  <p className="text-sm">{results.communicationStylesAndEmotionalTone.subjectAStyle}</p>
                </div>
              )}
              {results.communicationStylesAndEmotionalTone?.subjectBStyle && (
                <div className="p-4 bg-pink-50 rounded-lg">
                  <h4 className="font-semibold text-pink-600 mb-2">Subject B's Style</h4>
                  <p className="text-sm">{results.communicationStylesAndEmotionalTone.subjectBStyle}</p>
                </div>
              )}
            </div>

            {results.communicationStylesAndEmotionalTone?.regulationPatternsObserved && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-700 mb-2">Emotional Regulation</h4>
                <p className="text-sm">{results.communicationStylesAndEmotionalTone.regulationPatternsObserved}</p>
              </div>
            )}

            {results.communicationStylesAndEmotionalTone?.messageRhythmAndPacing && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-700 mb-2">Rhythm & Pacing</h4>
                <p className="text-sm">{results.communicationStylesAndEmotionalTone.messageRhythmAndPacing}</p>
              </div>
            )}
          </InsightCard>

          {/* Reflective Frameworks */}
          <InsightCard icon={Brain} title="Psychological Frameworks" color="blue">
            <div className="space-y-4">
              {results.reflectiveFrameworks?.attachmentEnergies && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Attachment Patterns
                  </h4>
                  <p className="text-sm">{results.reflectiveFrameworks.attachmentEnergies}</p>
                </div>
              )}

              {results.reflectiveFrameworks?.loveLanguageFriction && (
                <div className="p-4 bg-pink-50 rounded-lg">
                  <h4 className="font-semibold text-pink-600 mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Love Languages
                  </h4>
                  <p className="text-sm">{results.reflectiveFrameworks.loveLanguageFriction}</p>
                </div>
              )}

              {results.reflectiveFrameworks?.gottmanConflictMarkers && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-700 mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Gottman Method Insights
                  </h4>
                  <p className="text-sm">{results.reflectiveFrameworks.gottmanConflictMarkers}</p>
                </div>
              )}

              {results.reflectiveFrameworks?.emotionalIntelligenceIndicators && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Emotional Intelligence
                  </h4>
                  <p className="text-sm">{results.reflectiveFrameworks.emotionalIntelligenceIndicators}</p>
                </div>
              )}
            </div>
          </InsightCard>

          {/* What's Getting in the Way */}
          <InsightCard icon={Shield} title="Growth Opportunities" color="amber">
            <p className="mb-4">{results.whatsGettingInTheWay?.description}</p>

            <div className="space-y-3">
              {results.whatsGettingInTheWay?.emotionalMismatches && (
                <div className="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                  <h4 className="font-semibold text-amber-700 text-sm mb-1">Emotional Mismatches</h4>
                  <p className="text-sm text-gray-700">{results.whatsGettingInTheWay.emotionalMismatches}</p>
                </div>
              )}

              {results.whatsGettingInTheWay?.communicationGaps && (
                <div className="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                  <h4 className="font-semibold text-amber-700 text-sm mb-1">Communication Gaps</h4>
                  <p className="text-sm text-gray-700">{results.whatsGettingInTheWay.communicationGaps}</p>
                </div>
              )}

              {results.whatsGettingInTheWay?.subtlePowerStrugglesOrMisfires && (
                <div className="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                  <h4 className="font-semibold text-amber-700 text-sm mb-1">Dynamic Imbalances</h4>
                  <p className="text-sm text-gray-700">{results.whatsGettingInTheWay.subtlePowerStrugglesOrMisfires}</p>
                </div>
              )}

              {results.whatsGettingInTheWay?.externalStressors && (
                <div className="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                  <h4 className="font-semibold text-amber-700 text-sm mb-1">External Pressures</h4>
                  <p className="text-sm text-gray-700">{results.whatsGettingInTheWay.externalStressors}</p>
                </div>
              )}
            </div>
          </InsightCard>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <InsightCard icon={Zap} title="Recurring Patterns">
            <p className="mb-4">{results.recurringPatternsIdentified?.description}</p>

            {positivePatterns.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Positive Patterns
                </h4>
                <div className="space-y-2">
                  {positivePatterns.map((pattern: string, index: number) => (
                    <div key={index} className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                      <p className="text-sm text-gray-700">{pattern}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loopingMiscommunications.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-purple-700 mb-3">Looping Miscommunications</h4>
                <ul className="space-y-2">
                  {loopingMiscommunications.map((example: string, index: number) => (
                    <li key={index} className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-700">{example}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {triggersAndResponses.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-blue-700 mb-3">Triggers & Responses</h4>
                <ul className="space-y-2">
                  {triggersAndResponses.map((example: string, index: number) => (
                    <li key={index} className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700">{example}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {repairAttempts.length > 0 && (
              <div>
                <h4 className="font-semibold text-pink-600 mb-3">Repair & Avoidance</h4>
                <ul className="space-y-2">
                  {repairAttempts.map((example: string, index: number) => (
                    <li key={index} className="p-3 bg-pink-50 rounded-lg">
                      <p className="text-sm text-gray-700">{example}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </InsightCard>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Subject A */}
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-lg">
                    A
                  </div>
                  For Subject A
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subjectAStrengths.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {subjectAStrengths.map((strength: string, index: number) => (
                        <li
                          key={index}
                          className="text-sm text-gray-700 pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-green-600 before:font-bold"
                        >
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {subjectAGrowth.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-amber-700 mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Growth Opportunities
                    </h4>
                    <ul className="space-y-1">
                      {subjectAGrowth.map((nudge: string, index: number) => (
                        <li
                          key={index}
                          className="text-sm text-gray-700 pl-6 relative before:content-['→'] before:absolute before:left-0 before:text-amber-600 before:font-bold"
                        >
                          {nudge}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {subjectABoosters.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Connection Boosters
                    </h4>
                    <ul className="space-y-1">
                      {subjectABoosters.map((booster: string, index: number) => (
                        <li
                          key={index}
                          className="text-sm text-gray-700 pl-6 relative before:content-['✨'] before:absolute before:left-0 before:text-blue-600"
                        >
                          {booster}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subject B */}
            <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-pink-600">
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center font-bold text-lg">
                    B
                  </div>
                  For Subject B
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subjectBStrengths.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {subjectBStrengths.map((strength: string, index: number) => (
                        <li
                          key={index}
                          className="text-sm text-gray-700 pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-green-600 before:font-bold"
                        >
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {subjectBGrowth.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-amber-700 mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Growth Opportunities
                    </h4>
                    <ul className="space-y-1">
                      {subjectBGrowth.map((nudge: string, index: number) => (
                        <li
                          key={index}
                          className="text-sm text-gray-700 pl-6 relative before:content-['→'] before:absolute before:left-0 before:text-amber-600 before:font-bold"
                        >
                          {nudge}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {subjectBBoosters.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Connection Boosters
                    </h4>
                    <ul className="space-y-1">
                      {subjectBBoosters.map((booster: string, index: number) => (
                        <li
                          key={index}
                          className="text-sm text-gray-700 pl-6 relative before:content-['✨'] before:absolute before:left-0 before:text-blue-600"
                        >
                          {booster}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* For Both */}
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Users className="h-6 w-6" />
                For Both Partners
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6">
              {sharedStrengths.length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Shared Strengths
                  </h4>
                  <ul className="space-y-2">
                    {sharedStrengths.map((strength: string, index: number) => (
                      <li key={index} className="p-2 bg-green-50 rounded text-sm text-gray-700">
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {sharedGrowth.length > 0 && (
                <div>
                  <h4 className="font-semibold text-amber-700 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Growth Together
                  </h4>
                  <ul className="space-y-2">
                    {sharedGrowth.map((nudge: string, index: number) => (
                      <li key={index} className="p-2 bg-amber-50 rounded text-sm text-gray-700">
                        {nudge}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {sharedBoosters.length > 0 && (
                <div>
                  <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Boost Connection
                  </h4>
                  <ul className="space-y-2">
                    {sharedBoosters.map((booster: string, index: number) => (
                      <li key={index} className="p-2 bg-blue-50 rounded text-sm text-gray-700">
                        {booster}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visuals" className="space-y-8">
          <div className="mb-6">
            <p className="text-center text-gray-600 bg-purple-50 p-4 rounded-lg">
              {results.visualInsightsData?.descriptionForChartsIntro}
            </p>
          </div>

          {/* Radar Charts - Improved Layout */}
          <div className="space-y-8">
            {/* Emotional Communication */}
            {emotionalData.length > 0 && (
              <Card className="border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-semibold">Emotional Communication Characteristics</CardTitle>
                  <p className="text-sm text-gray-600 mt-2">
                    Compare how each person expresses emotions and communicates feelings
                  </p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={emotionalData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                      <PolarGrid stroke="#e0e0e0" strokeWidth={1} />
                      <PolarAngleAxis
                        dataKey="category"
                        tick={{
                          fontSize: 12,
                          fill: "#4a5568",
                          fontWeight: 500,
                        }}
                        tickLine={false}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 10]}
                        tick={{ fontSize: 11, fill: "#718096" }}
                        tickCount={6}
                      />
                      <Radar
                        name="Subject A"
                        dataKey="A"
                        stroke="#9333ea"
                        fill="#9333ea"
                        fillOpacity={0.4}
                        strokeWidth={2}
                      />
                      <Radar
                        name="Subject B"
                        dataKey="B"
                        stroke="#ec4899"
                        fill="#ec4899"
                        fillOpacity={0.4}
                        strokeWidth={2}
                      />
                      <Legend
                        wrapperStyle={{
                          paddingTop: "20px",
                          fontSize: "14px",
                          fontWeight: 600,
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Conflict Expression */}
            {conflictData.length > 0 && (
              <Card className="border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-semibold">Conflict Expression Styles</CardTitle>
                  <p className="text-sm text-gray-600 mt-2">
                    How each person handles disagreements and difficult conversations
                  </p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={conflictData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                      <PolarGrid stroke="#e0e0e0" strokeWidth={1} />
                      <PolarAngleAxis
                        dataKey="category"
                        tick={{
                          fontSize: 12,
                          fill: "#4a5568",
                          fontWeight: 500,
                        }}
                        tickLine={false}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 10]}
                        tick={{ fontSize: 11, fill: "#718096" }}
                        tickCount={6}
                      />
                      <Radar
                        name="Subject A"
                        dataKey="A"
                        stroke="#9333ea"
                        fill="#9333ea"
                        fillOpacity={0.4}
                        strokeWidth={2}
                      />
                      <Radar
                        name="Subject B"
                        dataKey="B"
                        stroke="#ec4899"
                        fill="#ec4899"
                        fillOpacity={0.4}
                        strokeWidth={2}
                      />
                      <Legend
                        wrapperStyle={{
                          paddingTop: "20px",
                          fontSize: "14px",
                          fontWeight: 600,
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Bar Chart for Validation - Much Improved */}
          {validationData.length > 0 && (
            <Card className="border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold">Validation & Reassurance Patterns</CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  How each person provides emotional support and acknowledgment
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={450}>
                  <BarChart
                    data={validationData}
                    layout="horizontal"
                    margin={{ top: 20, right: 30, bottom: 20, left: 160 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      type="number"
                      domain={[0, 10]}
                      ticks={[0, 2, 4, 6, 8, 10]}
                      tick={{ fontSize: 12, fill: "#4a5568" }}
                      label={{
                        value: "Score (0-10)",
                        position: "insideBottom",
                        offset: -10,
                        style: { fontSize: 13, fontWeight: 600, fill: "#2d3748" },
                      }}
                    />
                    <YAxis
                      type="category"
                      dataKey="category"
                      width={150}
                      tick={{
                        fontSize: 13,
                        fill: "#4a5568",
                        fontWeight: 500,
                      }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "12px",
                        fontSize: "13px",
                      }}
                      labelStyle={{ fontWeight: 600, marginBottom: "8px" }}
                    />
                    <Legend
                      wrapperStyle={{
                        paddingTop: "20px",
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    />
                    <Bar dataKey="A" name="Subject A" fill="#9333ea" radius={[0, 8, 8, 0]} barSize={20} />
                    <Bar dataKey="B" name="Subject B" fill="#ec4899" radius={[0, 8, 8, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Individual Scores Comparison - Improved Layout */}
          {emotionalData.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-purple-600" />
                Detailed Score Breakdown
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Individual scores for each category showing specific strengths and growth areas
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {emotionalData.map((item: any, index: number) => (
                  <Card key={index} className="border-purple-100 bg-gradient-to-br from-white to-purple-50">
                    <CardContent className="p-5">
                      <h4 className="font-semibold text-base text-gray-900 mb-4 min-h-[2.5rem] flex items-center">
                        {item.category}
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-purple-700 font-semibold">Subject A</span>
                            <span className="text-purple-900 font-bold text-lg">{item.A}/10</span>
                          </div>
                          <Progress value={item.A * 10} className="h-3 bg-purple-100" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-pink-600 font-semibold">Subject B</span>
                            <span className="text-pink-900 font-bold text-lg">{item.B}/10</span>
                          </div>
                          <Progress value={item.B * 10} className="h-3 bg-pink-100" indicatorClassName="bg-pink-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Add a summary section */}
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-600" />
                Visual Insights Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-purple-700 mb-3">Key Observations</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Review the radar charts to see overall communication patterns</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Higher scores indicate stronger presence of that characteristic</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Look for significant differences between partners</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-pink-600 mb-3">How to Use These Charts</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>Identify areas where one partner scores higher than the other</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>Notice patterns across multiple categories</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>Use insights to guide growth conversations together</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Outlook Section */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Zap className="h-6 w-6 text-purple-600" />
            Outlook & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            {results.outlook?.split("\n\n").map((paragraph: string, index: number) => (
              <p key={index} className="text-gray-700 mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optional Appendix */}
      {results.optionalAppendix && (
        <Card className="border-gray-200 bg-gray-50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-gray-700">
              <ExternalLink className="h-5 w-5" />
              Additional Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm">{results.optionalAppendix}</p>
          </CardContent>
        </Card>
      )}

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center py-8">
        <Button
          onClick={handleNewAnalysis}
          size="lg"
          className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
        >
          <RefreshCw className="mr-2 h-5 w-5" />
          Analyze Another Conversation
        </Button>
        <Button
          onClick={handleExport}
          disabled={isExporting}
          size="lg"
          variant="outline"
          className="border-purple-200 text-purple-600 hover:bg-purple-50 w-full sm:w-auto bg-transparent"
        >
          <Download className="mr-2 h-5 w-5" />
          Download Full Report
        </Button>
      </div>
    </div>
  )
}
