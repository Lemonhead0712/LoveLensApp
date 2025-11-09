"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Heart,
  MessageCircle,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  Star,
  ArrowRight,
  Download,
  Sparkles,
} from "lucide-react"
import type { AnalysisResults } from "@/types/analysis"
import { exportToWord } from "@/app/actions"

interface EnhancedAnalysisResultsProps {
  results: AnalysisResults
}

export function EnhancedAnalysisResults({ results }: EnhancedAnalysisResultsProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    communicationPatterns: true,
    emotionalDynamics: true,
    insights: true,
    strengths: true,
    growth: true,
    recommendations: true,
  })

  const subjectALabel = results.subjectALabel || "Person A"
  const subjectBLabel = results.subjectBLabel || "Person B"

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportToWord(results)
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getToneIcon = (tone: string) => {
    switch (tone) {
      case "positive":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "concerning":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <MessageCircle className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl flex items-center gap-2">
                <Heart className="h-8 w-8 text-red-500" />
                Relationship Analysis: {subjectALabel} & {subjectBLabel}
              </CardTitle>
              <CardDescription className="text-base">
                A comprehensive look at your communication dynamics
              </CardDescription>
            </div>
            <Button onClick={handleExport} disabled={isExporting} size="lg" className="gap-2">
              <Download className="h-4 w-4" />
              {isExporting ? "Exporting..." : "Export Report"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Overall Relationship Health</span>
                <span className="text-sm font-bold">{results.overallScore}/100</span>
              </div>
              <Progress value={results.overallScore} className="h-3" />
            </div>
          </div>

          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription className="text-base leading-relaxed">{results.summary}</AlertDescription>
          </Alert>

          {results.extractionConfidence && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">
                {results.messageCount} messages analyzed from {results.screenshotCount} screenshots
              </Badge>
              <Badge variant="outline">Extraction confidence: {results.extractionConfidence}%</Badge>
            </div>
          )}

          {exportSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">Report exported successfully!</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Opening Thoughts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Opening Thoughts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-base leading-relaxed whitespace-pre-line">{results.openingThoughts}</p>
          </div>
        </CardContent>
      </Card>

      {/* Communication Patterns */}
      <Card>
        <CardHeader>
          <button
            onClick={() => toggleSection("communicationPatterns")}
            className="w-full flex items-center justify-between text-left"
          >
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Communication Patterns
            </CardTitle>
            {openSections.communicationPatterns ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </CardHeader>
        {openSections.communicationPatterns && (
          <CardContent className="space-y-6">
            {/* Person A */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-primary">{subjectALabel}</h3>
              <p className="text-base leading-relaxed">{results.communicationPatterns.personA.style}</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Strengths
                  </h4>
                  <ul className="space-y-1">
                    {results.communicationPatterns.personA.strengths.map((strength, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    Areas for Growth
                  </h4>
                  <ul className="space-y-1">
                    {results.communicationPatterns.personA.areasForGrowth.map((area, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {results.communicationPatterns.personA.notableQuotes.length > 0 && (
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium text-sm">Notable Observations</h4>
                  {results.communicationPatterns.personA.notableQuotes.map((quote, idx) => (
                    <p key={idx} className="text-sm italic">
                      &ldquo;{quote}&rdquo;
                    </p>
                  ))}
                </div>
              )}

              <div className="bg-primary/5 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Communication Tendencies</h4>
                <p className="text-sm leading-relaxed">
                  {results.communicationPatterns.personA.communicationTendencies}
                </p>
              </div>
            </div>

            <Separator />

            {/* Person B */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-primary">{subjectBLabel}</h3>
              <p className="text-base leading-relaxed">{results.communicationPatterns.personB.style}</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Strengths
                  </h4>
                  <ul className="space-y-1">
                    {results.communicationPatterns.personB.strengths.map((strength, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    Areas for Growth
                  </h4>
                  <ul className="space-y-1">
                    {results.communicationPatterns.personB.areasForGrowth.map((area, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {results.communicationPatterns.personB.notableQuotes.length > 0 && (
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium text-sm">Notable Observations</h4>
                  {results.communicationPatterns.personB.notableQuotes.map((quote, idx) => (
                    <p key={idx} className="text-sm italic">
                      &ldquo;{quote}&rdquo;
                    </p>
                  ))}
                </div>
              )}

              <div className="bg-primary/5 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Communication Tendencies</h4>
                <p className="text-sm leading-relaxed">
                  {results.communicationPatterns.personB.communicationTendencies}
                </p>
              </div>
            </div>

            <Separator />

            {/* Dynamic Between Them */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-primary">The Dynamic Between You</h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-base leading-relaxed whitespace-pre-line">
                  {results.communicationPatterns.dynamicBetweenThem}
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Emotional Dynamics */}
      <Card>
        <CardHeader>
          <button
            onClick={() => toggleSection("emotionalDynamics")}
            className="w-full flex items-center justify-between text-left"
          >
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Emotional Dynamics
            </CardTitle>
            {openSections.emotionalDynamics ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </CardHeader>
        {openSections.emotionalDynamics && (
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  Positive Indicators
                </h4>
                <ul className="space-y-2">
                  {results.emotionalDynamics.positiveIndicators.map((indicator, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Star className="h-4 w-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                      <span className="text-sm">{indicator}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2 text-orange-600">
                  <AlertCircle className="h-5 w-5" />
                  Areas to Watch
                </h4>
                <ul className="space-y-2">
                  {results.emotionalDynamics.concerningPatterns.map((pattern, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 text-orange-500 flex-shrink-0" />
                      <span className="text-sm">{pattern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium text-lg">Emotional Balance</h4>
              <div className="prose prose-sm max-w-none">
                <p className="text-base leading-relaxed whitespace-pre-line">
                  {results.emotionalDynamics.emotionalBalance}
                </p>
              </div>
            </div>

            {results.emotionalDynamics.emotionalHighlights.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium text-lg">Emotional Highlights</h4>
                  <div className="space-y-3">
                    {results.emotionalDynamics.emotionalHighlights.map((highlight, idx) => (
                      <div key={idx} className="bg-muted/50 p-4 rounded-lg space-y-2">
                        <div className="flex items-start gap-2">
                          {getToneIcon(highlight.tone)}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{highlight.moment}</p>
                            <p className="text-sm text-muted-foreground mt-1">{highlight.significance}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        )}
      </Card>

      {/* Deeper Insights */}
      {results.deeperInsights.length > 0 && (
        <Card>
          <CardHeader>
            <button
              onClick={() => toggleSection("insights")}
              className="w-full flex items-center justify-between text-left"
            >
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Deeper Insights
              </CardTitle>
              {openSections.insights ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </CardHeader>
          {openSections.insights && (
            <CardContent className="space-y-6">
              {results.deeperInsights.map((insight, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">
                      {insight.category}
                    </Badge>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-2">{insight.title}</h4>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-base leading-relaxed whitespace-pre-line">{insight.observation}</p>
                      </div>
                      <div className="mt-3 p-3 bg-primary/5 rounded-lg">
                        <p className="text-sm">
                          <span className="font-medium">Impact: </span>
                          {insight.impact}
                        </p>
                      </div>
                    </div>
                  </div>
                  {idx < results.deeperInsights.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* Strengths to Celebrate */}
      {results.strengthsToGelebrate.length > 0 && (
        <Card>
          <CardHeader>
            <button
              onClick={() => toggleSection("strengths")}
              className="w-full flex items-center justify-between text-left"
            >
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Strengths to Celebrate
              </CardTitle>
              {openSections.strengths ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </CardHeader>
          {openSections.strengths && (
            <CardContent className="space-y-6">
              {results.strengthsToGelebrate.map((item, idx) => (
                <div key={idx} className="space-y-3 bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-lg text-green-900">{item.strength}</h4>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-base leading-relaxed text-green-800">{item.whyItMatters}</p>
                  </div>
                  {item.examples.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-green-900">Examples:</p>
                      <ul className="space-y-1">
                        {item.examples.map((example, exIdx) => (
                          <li key={exIdx} className="text-sm text-green-800 flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{example}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* Growth Opportunities */}
      {results.growthOpportunities.length > 0 && (
        <Card>
          <CardHeader>
            <button
              onClick={() => toggleSection("growth")}
              className="w-full flex items-center justify-between text-left"
            >
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Growth Opportunities
              </CardTitle>
              {openSections.growth ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </CardHeader>
          {openSections.growth && (
            <CardContent className="space-y-6">
              {results.growthOpportunities.map((opportunity, idx) => (
                <div key={idx} className="space-y-3 border-l-4 border-blue-500 pl-4">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-lg">{opportunity.area}</h4>
                    <Badge variant={getPriorityColor(opportunity.priority)}>{opportunity.priority} priority</Badge>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Current Pattern:</p>
                      <p className="text-sm">{opportunity.currentPattern}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Why It Matters:</p>
                      <p className="text-sm">{opportunity.whyItMatters}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Suggestions:</p>
                      <ul className="space-y-1">
                        {opportunity.suggestions.map((suggestion, sugIdx) => (
                          <li key={sugIdx} className="text-sm flex items-start gap-2">
                            <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* Recommendations */}
      {results.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <button
              onClick={() => toggleSection("recommendations")}
              className="w-full flex items-center justify-between text-left"
            >
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Actionable Recommendations
              </CardTitle>
              {openSections.recommendations ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </CardHeader>
          {openSections.recommendations && (
            <CardContent className="space-y-6">
              {results.recommendations.map((rec, idx) => (
                <div key={idx} className="space-y-3 bg-primary/5 p-5 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-lg">{rec.title}</h4>
                    <Badge variant={getPriorityColor(rec.priority)}>{rec.priority} priority</Badge>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-base leading-relaxed whitespace-pre-line">{rec.description}</p>
                  </div>
                  <div className="bg-background p-3 rounded-lg mt-3">
                    <p className="text-sm">
                      <span className="font-medium">Expected Outcome: </span>
                      {rec.expectedOutcome}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* Conversation Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Conversation Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Total Messages</p>
              <p className="text-2xl font-bold">{results.conversationMetrics.totalMessages}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Message Balance</p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{subjectALabel}</span>
                  <span className="font-medium">{results.conversationMetrics.messageBalance.personA}%</span>
                </div>
                <Progress value={results.conversationMetrics.messageBalance.personA} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>{subjectBLabel}</span>
                  <span className="font-medium">{results.conversationMetrics.messageBalance.personB}%</span>
                </div>
                <Progress value={results.conversationMetrics.messageBalance.personB} className="h-2" />
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-1">Emotional Tone</p>
              <p className="text-sm">{results.conversationMetrics.emotionalTone}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Engagement Level</p>
              <p className="text-sm">{results.conversationMetrics.engagementLevel}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">Conversation Flow</p>
            <p className="text-sm">{results.conversationMetrics.conversationFlow}</p>
          </div>
        </CardContent>
      </Card>

      {/* Closing Thoughts */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Closing Thoughts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-base leading-relaxed whitespace-pre-line">{results.closingThoughts}</p>
          </div>
        </CardContent>
      </Card>

      {/* Confidence Warning */}
      {results.confidenceWarning && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{results.confidenceWarning}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default EnhancedAnalysisResults
