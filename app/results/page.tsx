"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card-override"
import { Button } from "@/components/ui/button-override"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Heart, AlertTriangle, ThumbsUp, MessageSquare, Zap, InfoIcon, Sparkles } from "lucide-react"
import type { AnalysisResults } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { EmotionalIntelligenceBreakdown } from "@/components/emotional-intelligence-breakdown"
import { InteractionPatternsChart } from "@/components/interaction-patterns-chart"
import { CommunicationStylesChart } from "@/components/communication-styles-chart"
import { CompatibilityChart } from "@/components/compatibility-chart"
import {
  generateCommunicationStyles,
  generateCompatibilityCategories,
  getCommunicationStyleLabel,
} from "@/lib/communication-styles"
import { PsychologicalProfilesTab } from "@/components/psychological-profiles-tab"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SparkleEffect } from "@/components/sparkle-effect"
import { getAnalysisResults } from "@/lib/storage-utils"
import { LoadingScreen } from "@/components/loading-screen"
import { EmotionalFlags } from "@/components/emotional-flags"
import { EmotionalInsightSummary } from "@/components/emotional-insight-summary"
import { EmotionalReflection } from "@/components/emotional-reflection"
import { CircularProgress } from "@/components/circular-progress"

export default function ResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const [results, setResults] = useState<AnalysisResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingStage, setLoadingStage] = useState<string>("Initializing analysis...")
  const [activeTab, setActiveTab] = useState("emotional")
  const [analysisMethod, setAnalysisMethod] = useState<"openai" | "rule-based">("rule-based")
  const [error, setError] = useState<string | null>(null)
  const [advancedView, setAdvancedView] = useState(false)

  useEffect(() => {
    // Check if we have an ID parameter
    if (!id) {
      console.error("No ID parameter provided in URL")
      setError("No analysis ID provided. Please upload conversation screenshots to get started.")
      setLoading(false)
      return
    }

    console.log("Loading analysis results with ID:", id)

    // Simulate the analysis stages with appropriate messages
    const loadingStages = [
      { message: "Initializing analysis...", duration: 800 },
      { message: "Processing conversation data...", duration: 1200 },
      { message: "Analyzing emotional patterns...", duration: 1500 },
      { message: "Evaluating relationship dynamics...", duration: 1300 },
      { message: "Generating psychological profiles...", duration: 1700 },
      { message: "Calculating compatibility metrics...", duration: 1000 },
      { message: "Preparing your results...", duration: 1200 },
    ]

    let currentStageIndex = 0
    const updateLoadingStage = () => {
      if (currentStageIndex < loadingStages.length) {
        setLoadingStage(loadingStages[currentStageIndex].message)
        setTimeout(() => {
          currentStageIndex++
          updateLoadingStage()
        }, loadingStages[currentStageIndex].duration)
      } else {
        // When all stages are complete, fetch the actual results
        fetchResults()
      }
    }

    // Start the loading sequence
    updateLoadingStage()

    // This function will be called after all loading stages are complete
    const fetchResults = () => {
      try {
        console.log("Fetching analysis results for ID:", id)
        const storedResults = getAnalysisResults(id)

        if (storedResults) {
          console.log("Analysis results found:", storedResults)
          setResults(storedResults)
          setAnalysisMethod(storedResults.analysisMethod || "rule-based")
        } else {
          console.error("No analysis results found for ID:", id)
          setError("No analysis results found. Please upload conversation screenshots to get started.")
        }
      } catch (error) {
        console.error("Error loading analysis results:", error)
        setError(
          `An error occurred while loading analysis results: ${error instanceof Error ? error.message : "Please try again."}`,
        )
      } finally {
        setLoading(false)
      }
    }
  }, [id])

  if (loading) {
    return <LoadingScreen message={loadingStage} fullScreen={true} />
  }

  if (error || !results) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-love-gradient">
        <div className="text-center max-w-md px-4">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">No Analysis Results Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "We couldn't find any analysis results. Please upload conversation screenshots to get started."}
          </p>
          <Link href="/upload">
            <Button className="h-12">Upload Conversations</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Find the first person (user) and second person (other participant)
  const firstPerson = results.participants.find((p) => p.isFirstPerson) || results.participants[0]
  const secondPerson = results.participants.find((p) => !p.isFirstPerson) || results.participants[1]

  // Get the emotional breakdowns for each participant
  const firstPersonBreakdown = results.emotionalBreakdown
  const secondPersonBreakdown = results.secondPersonEmotionalBreakdown || {
    empathy: 75,
    selfAwareness: 78,
    socialSkills: 82,
    emotionalRegulation: 70,
    motivation: 65,
    adaptability: 75,
  }

  // Generate communication styles
  const firstPersonStyles = generateCommunicationStyles(firstPersonBreakdown, results.gottmanScores, true)
  const secondPersonStyles = generateCommunicationStyles(secondPersonBreakdown, results.gottmanScores, false)

  // Get dominant styles
  const getDominantStyle = (styles: any[]): any => {
    return [...styles].sort((a, b) => b.score - a.score)[0]
  }

  const getSecondaryStyle = (styles: any[]): any | null => {
    const sortedStyles = [...styles].sort((a, b) => b.score - a.score)
    return sortedStyles[1].score > sortedStyles[0].score * 0.7 ? sortedStyles[1] : null
  }

  const firstPersonDominantStyle = getDominantStyle(firstPersonStyles)
  const firstPersonSecondaryStyle = getSecondaryStyle(firstPersonStyles)
  const secondPersonDominantStyle = getDominantStyle(secondPersonStyles)
  const secondPersonSecondaryStyle = getSecondaryStyle(secondPersonStyles)

  const firstPersonStyleLabel = getCommunicationStyleLabel(
    firstPersonDominantStyle.name,
    firstPersonSecondaryStyle?.name || null,
  )
  const secondPersonStyleLabel = getCommunicationStyleLabel(
    secondPersonDominantStyle.name,
    secondPersonSecondaryStyle?.name || null,
  )

  // Generate compatibility categories
  const compatibilityCategories = generateCompatibilityCategories(
    results.gottmanScores,
    firstPersonBreakdown,
    secondPersonBreakdown,
  )

  // Create default psychological profiles if not available in results
  const defaultFirstPersonProfile = {
    attachmentStyle: {
      primaryStyle: "Secure",
      secondaryStyle: null,
      confidence: 70,
    },
    transactionalAnalysis: {
      dominantEgoState: "Adult",
      egoStateDistribution: {
        parent: 30,
        adult: 40,
        child: 30,
      },
    },
    linguisticPatterns: {
      cognitiveComplexity: 60,
      emotionalExpressiveness: 55,
      socialEngagement: 65,
      dominantEmotions: ["Joy", "Trust", "Anticipation"],
    },
    cognitivePatterns: {
      topDistortions: [],
      topHealthyPatterns: ["Balanced Perspective", "Evidence-Based Thinking"],
      overallBalance: 65,
    },
    communicationStrengths: ["Clear communication", "Active listening"],
    growthAreas: ["Developing emotional awareness", "Practicing mindful responses"],
  }

  const defaultSecondPersonProfile = {
    attachmentStyle: {
      primaryStyle: "Anxious",
      secondaryStyle: "Secure",
      confidence: 65,
    },
    transactionalAnalysis: {
      dominantEgoState: "Parent",
      egoStateDistribution: {
        parent: 45,
        adult: 35,
        child: 20,
      },
    },
    linguisticPatterns: {
      cognitiveComplexity: 72,
      emotionalExpressiveness: 48,
      socialEngagement: 58,
      dominantEmotions: ["Trust", "Surprise", "Joy"],
    },
    cognitivePatterns: {
      topDistortions: ["Mental Filter", "Should Statements"],
      topHealthyPatterns: ["Acceptance", "Realistic Evaluation"],
      overallBalance: 58,
    },
    communicationStrengths: ["Emotional awareness", "Conflict resolution"],
    growthAreas: ["Reducing defensive reactions", "Improving active listening"],
  }

  // Use the profiles from results if available, otherwise use defaults
  const firstPersonProfile = results.firstPersonProfile || defaultFirstPersonProfile
  const secondPersonProfile = results.secondPersonProfile || defaultSecondPersonProfile

  // Extract insights from results for the emotional insight summary
  const emotionalInsights =
    results.insights?.filter(
      (insight) =>
        insight.includes("emotion") ||
        insight.includes("feel") ||
        insight.includes("empathy") ||
        insight.includes("tone") ||
        insight.includes("express"),
    ) || []

  // Get emoji representation based on emotional intelligence score
  const getEmotionalEmoji = (score: number) => {
    if (score >= 90) return "😊"
    if (score >= 80) return "🙂"
    if (score >= 70) return "😌"
    if (score >= 60) return "😐"
    if (score >= 50) return "🤔"
    if (score >= 40) return "😕"
    if (score >= 30) return "😟"
    return "😢"
  }

  // Ensure we have a valid ID for navigation
  const resultId = results.id || id

  return (
    <div className="flex flex-col min-h-screen bg-love-gradient">
      <SparkleEffect count={20} className="absolute inset-0 pointer-events-none" />

      <main className="flex-1 container px-4 py-6 sm:py-10 md:py-12 relative z-10">
        <div className="mb-6 sm:mb-10">
          <Link href="/upload" className="flex items-center text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 pl-1">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Upload
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient">Your Emotional Intelligence Analysis</h1>
            <Badge
              variant={analysisMethod === "openai" ? "default" : "outline"}
              className={`gap-1 px-3 py-1.5 text-sm self-start md:self-auto ${
                analysisMethod === "openai" ? "bg-gradient-to-r from-pink-500 to-purple-500" : ""
              }`}
            >
              {analysisMethod === "openai" ? (
                <>
                  <Zap className="h-3.5 w-3.5 mr-1" />
                  OpenAI Enhanced
                </>
              ) : (
                "Standard Analysis"
              )}
            </Badge>
          </div>
          <p className="text-gray-600 text-base sm:text-lg">
            Analysis based on {results.messageCount} messages between {firstPerson.name} and {secondPerson.name}
          </p>
        </div>

        <div className="flex items-center justify-end mb-6">
          <div className="flex items-center space-x-2">
            <Switch id="advanced-view" checked={advancedView} onCheckedChange={setAdvancedView} />
            <Label htmlFor="advanced-view">Advanced View</Label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 sm:mb-8 md:mb-12">
          <Card className="bg-love-card shadow-lg border-pink-100 overflow-hidden float-animation">
            <CardHeader className="pb-2 sm:pb-3 pt-4 sm:pt-6 px-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg flex items-center">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-rose-500 mr-1.5 sm:mr-2.5" />
                Overall Compatibility
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="text-center py-2 sm:py-4">
                <CircularProgress
                  value={results.finalCompatibilityScore || results.overallScore}
                  size={160}
                  strokeWidth={12}
                  className="mx-auto mb-3"
                  valueClassName="text-3xl sm:text-4xl font-bold text-gradient"
                  label={getCompatibilityMessage(results.finalCompatibilityScore || results.overallScore)}
                  labelClassName="text-gray-600 text-sm sm:text-base mt-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-love-card shadow-lg border-pink-100 overflow-hidden float-animation"
            style={{ animationDelay: "0.2s" }}
          >
            <CardHeader className="pb-2 sm:pb-3 pt-4 sm:pt-6 px-4 sm:px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg flex items-center">
                  <ThumbsUp className="h-4 w-4 sm:h-5 sm:w-5 text-rose-500 mr-1.5 sm:mr-2.5" />
                  Emotional Intelligence
                </CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs sm:text-sm">
                        Emotional Intelligence (EI) is the ability to understand and manage emotions effectively. Scores
                        are calculated based on empathy, self-awareness, and emotional regulation.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="space-y-4 sm:space-y-5 pt-2">
                {results.participants.map((participant, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1 sm:mb-2">
                      <span className="font-medium text-sm sm:text-base">{participant.name}</span>
                      <div className="flex items-center">
                        {!advancedView && (
                          <span className="text-2xl mr-2">{getEmotionalEmoji(participant.emotionalIntelligence)}</span>
                        )}
                        <span className="font-semibold text-sm sm:text-base">{participant.emotionalIntelligence}%</span>
                      </div>
                    </div>
                    <div className="relative h-2 sm:h-2.5 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className={`absolute top-0 left-0 h-full rounded-full ${
                          index === 0
                            ? "bg-gradient-to-r from-rose-400 to-rose-600"
                            : "bg-gradient-to-r from-blue-400 to-blue-600"
                        }`}
                        style={{ width: `${participant.emotionalIntelligence}%` }}
                      ></div>
                    </div>
                    {advancedView && index === 0 && (
                      <EmotionalFlags emotionalBreakdown={firstPersonBreakdown} personName={participant.name} />
                    )}
                    {advancedView && index === 1 && (
                      <EmotionalFlags emotionalBreakdown={secondPersonBreakdown} personName={participant.name} />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-love-card shadow-lg border-pink-100 overflow-hidden float-animation"
            style={{ animationDelay: "0.4s" }}
          >
            <CardHeader className="pb-2 sm:pb-3 pt-4 sm:pt-6 px-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg flex items-center">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-rose-500 mr-1.5 sm:mr-2.5" />
                Communication Style
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="space-y-4 sm:space-y-5 pt-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-rose-300 to-rose-500 flex items-center justify-center mr-3 sm:mr-4">
                    <span className="font-medium text-white text-base sm:text-lg">{firstPerson.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">{firstPerson.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5">{firstPersonStyleLabel}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center mr-3 sm:mr-4">
                    <span className="font-medium text-white text-base sm:text-lg">{secondPerson.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">{secondPerson.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5">{secondPersonStyleLabel}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {advancedView && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <EmotionalInsightSummary
              insights={emotionalInsights.length > 0 ? emotionalInsights : results.insights || []}
            />
            <EmotionalReflection
              firstPersonName={firstPerson.name}
              secondPersonName={secondPerson.name}
              firstPersonBreakdown={firstPersonBreakdown}
              secondPersonBreakdown={secondPersonBreakdown}
            />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => router.push(`/reflections?id=${resultId}`)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              View Reflections & Growth Plan
            </Button>
          </div>

          <div className="bg-love-card shadow-lg border border-pink-100 rounded-lg p-4 sm:p-6">
            <TabsContent value="emotional" className="mt-0">
              {!advancedView ? (
                <div className="text-center py-8">
                  <div className="flex justify-center space-x-8 mb-8">
                    <div className="text-center">
                      <div className="text-6xl mb-2">{getEmotionalEmoji(firstPerson.emotionalIntelligence)}</div>
                      <p className="font-medium">{firstPerson.name}</p>
                      <p className="text-sm text-gray-600">{firstPerson.emotionalIntelligence}% EI Score</p>
                    </div>
                    <div className="text-center">
                      <div className="text-6xl mb-2">{getEmotionalEmoji(secondPerson.emotionalIntelligence)}</div>
                      <p className="font-medium">{secondPerson.name}</p>
                      <p className="text-sm text-gray-600">{secondPerson.emotionalIntelligence}% EI Score</p>
                    </div>
                  </div>
                  <div className="max-w-2xl mx-auto">
                    <h3 className="text-xl font-semibold mb-3">Summary</h3>
                    <p className="text-gray-700">
                      {results.insights && results.insights.length > 0
                        ? results.insights[0]
                        : `Based on your conversation analysis, ${firstPerson.name} shows ${
                            firstPerson.emotionalIntelligence > secondPerson.emotionalIntelligence ? "higher" : "lower"
                          } emotional intelligence than ${secondPerson.name}. This affects how you communicate and connect with each other.`}
                    </p>
                  </div>
                </div>
              ) : (
                <EmotionalIntelligenceBreakdown
                  participant1={{
                    name: firstPerson.name,
                    emotionalBreakdown: firstPersonBreakdown,
                    score: firstPerson.emotionalIntelligence,
                  }}
                  participant2={{
                    name: secondPerson.name,
                    emotionalBreakdown: secondPersonBreakdown,
                    score: secondPerson.emotionalIntelligence,
                  }}
                  insights={results.insights}
                  recommendations={results.recommendations}
                />
              )}
            </TabsContent>

            <TabsContent value="communication" className="mt-0">
              <CommunicationStylesChart
                participant1={{
                  name: firstPerson.name,
                  styles: firstPersonStyles,
                }}
                participant2={{
                  name: secondPerson.name,
                  styles: secondPersonStyles,
                }}
              />
            </TabsContent>

            <TabsContent value="compatibility" className="mt-0">
              <CompatibilityChart
                overallScore={results.finalCompatibilityScore || results.overallScore}
                categories={compatibilityCategories}
              />
            </TabsContent>

            <TabsContent value="psychology" className="mt-0">
              <PsychologicalProfilesTab
                firstPersonName={firstPerson.name}
                secondPersonName={secondPerson.name}
                firstPersonProfile={firstPersonProfile}
                secondPersonProfile={secondPersonProfile}
                relationshipDynamics={results.relationshipDynamics || {}}
              />
            </TabsContent>

            <TabsContent value="relationship" className="mt-0">
              <InteractionPatternsChart
                gottmanScores={results.gottmanScores}
                participant1Name={firstPerson.name}
                participant2Name={secondPerson.name}
                summary={results.gottmanSummary}
                recommendations={results.gottmanRecommendations}
              />
            </TabsContent>
          </div>
        </Tabs>
        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => router.push(`/reflections?id=${resultId}`)}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
          >
            View Growth Recommendations
          </Button>
        </div>
      </main>

      <footer className="border-t border-pink-100 py-8 sm:py-10 bg-white bg-opacity-80 backdrop-blur-sm relative z-10">
        <div className="container px-4 sm:px-6 text-center text-gray-500">
          <p>© {new Date().getFullYear()} LoveLens. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function getCompatibilityMessage(score: number): string {
  if (score >= 90) return "Exceptional compatibility"
  if (score >= 80) return "Strong compatibility"
  if (score >= 70) return "Good compatibility"
  if (score >= 60) return "Moderate compatibility"
  if (score >= 50) return "Fair compatibility"
  return "Needs improvement"
}
