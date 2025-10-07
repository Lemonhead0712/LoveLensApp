"use client"

import type React from "react"
import { AlertCircle, Download, RefreshCw } from "lucide-react"
import { useState } from "react"
import type { AnalysisResultsData } from "@/types/analysis"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import BarChartDisplay from "./bar-chart-display"
import {
  MessageSquareQuote,
  Zap,
  Recycle,
  BrainCircuit,
  ShieldAlert,
  CheckCircle,
  TrendingUp,
  Sparkles,
  Users,
  HeartHandshake,
} from "lucide-react"

interface AnalysisResultsProps {
  results: AnalysisResultsData
}

async function exportToWord(results: any) {
  try {
    console.log("[v0] Starting Word document export")

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/export-word`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(results),
    })

    if (!response.ok) {
      throw new Error("Failed to generate Word document")
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `relationship-analysis-${Date.now()}.docx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    console.log("[v0] Word document export complete")
    return { success: true }
  } catch (error) {
    console.error("[v0] Export error:", error)
    throw error
  }
}

const ConfidenceWarning = ({ warning }: { warning?: string }) => {
  if (!warning) return null

  return (
    <Alert className="border-amber-200 bg-amber-50 mb-4">
      <AlertCircle className="h-5 w-5 text-amber-600" />
      <AlertDescription className="text-amber-800">{warning}</AlertDescription>
    </Alert>
  )
}

const InfoList = ({ title, items }: { title: string; items: string[] }) => (
  <div>
    <h4 className="font-semibold text-gray-700 mb-2">{title}</h4>
    <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </div>
)

const FeedbackCard = ({
  title,
  icon,
  strengths,
  nudges,
  boosters,
  color,
}: {
  title: string
  icon: React.ReactNode
  strengths: string[]
  nudges: string[]
  boosters: string[]
  color: "purple" | "pink"
}) => (
  <Card className={`border-${color}-100 bg-${color}-50/30`}>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4 text-sm">
      <div className="space-y-1">
        <h4 className="font-semibold flex items-center gap-1.5 text-green-700">
          <CheckCircle size={16} />
          Strengths
        </h4>
        <ul className="list-disc pl-5 text-gray-700">
          {strengths.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>
      <div className="space-y-1">
        <h4 className="font-semibold flex items-center gap-1.5 text-amber-700">
          <TrendingUp size={16} />
          Gentle Growth Nudges
        </h4>
        <ul className="list-disc pl-5 text-gray-700">
          {nudges.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      </div>
      <div className="space-y-1">
        <h4 className="font-semibold flex items-center gap-1.5 text-blue-700">
          <Sparkles size={16} />
          Connection Boosters
        </h4>
        <ul className="list-disc pl-5 text-gray-700">
          {boosters.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </div>
    </CardContent>
  </Card>
)

export default function AnalysisResults({ results }: AnalysisResultsProps) {
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

  if (!results) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No analysis results available.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 p-6 shadow-lg bg-white">
        <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-purple-700">Relationship Analysis</h2>
            <p className="text-gray-500 mt-1">A reflection of the emotional patterns at play.</p>
            {results.messageCount && (
              <p className="text-sm text-gray-400 mt-1">
                Based on {results.messageCount} message{results.messageCount !== 1 ? "s" : ""} from{" "}
                {results.screenshotCount} screenshot{results.screenshotCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-purple-600 hover:bg-purple-700 w-full md:w-auto flex-shrink-0 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export as Word Doc
              </>
            )}
          </Button>
        </div>

        {exportSuccess && (
          <Alert className="border-green-200 bg-green-50 mb-4">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Export initiated! Your document should download shortly.
            </AlertDescription>
          </Alert>
        )}

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <p className="text-sm text-gray-800">{results.introductionNote}</p>
          </CardContent>
        </Card>
      </Card>

      <ConfidenceWarning warning={results.confidenceWarning} />

      <Tabs defaultValue="written-analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-6 bg-purple-50">
          <TabsTrigger
            value="written-analysis"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Written Analysis
          </TabsTrigger>
          <TabsTrigger
            value="constructive-feedback"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Constructive Feedback
          </TabsTrigger>
          <TabsTrigger
            value="visual-insights"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Visual Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="written-analysis">
          <Accordion type="multiple" className="w-full space-y-4" defaultValue={["communication", "patterns"]}>
            <AccordionItem value="communication" className="border-purple-100">
              <AccordionTrigger className="text-lg font-semibold flex items-center gap-2 p-4 bg-white rounded-lg shadow-sm hover:bg-purple-50">
                <MessageSquareQuote size={20} className="text-purple-600" />
                Communication Styles & Emotional Tone
              </AccordionTrigger>
              <AccordionContent className="p-6 bg-white rounded-b-lg shadow-sm space-y-4">
                <p className="text-gray-700">{results.communicationStylesAndEmotionalTone?.description}</p>
                <div className="flex flex-wrap gap-2">
                  {results.communicationStylesAndEmotionalTone?.emotionalVibeTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-purple-100 text-purple-700">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p>
                  <strong className="font-medium text-purple-700">Regulation Patterns:</strong>{" "}
                  {results.communicationStylesAndEmotionalTone?.regulationPatternsObserved}
                </p>
                <p>
                  <strong className="font-medium text-purple-700">Rhythm & Pacing:</strong>{" "}
                  {results.communicationStylesAndEmotionalTone?.messageRhythmAndPacing}
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="patterns" className="border-purple-100">
              <AccordionTrigger className="text-lg font-semibold flex items-center gap-2 p-4 bg-white rounded-lg shadow-sm hover:bg-purple-50">
                <Recycle size={20} className="text-purple-600" />
                Recurring Patterns Identified
              </AccordionTrigger>
              <AccordionContent className="p-6 bg-white rounded-b-lg shadow-sm space-y-4">
                <p className="text-gray-700">{results.recurringPatternsIdentified?.description}</p>
                <InfoList
                  title="Looping Miscommunications"
                  items={results.recurringPatternsIdentified?.loopingMiscommunicationsExamples || []}
                />
                <InfoList
                  title="Common Triggers & Responses"
                  items={results.recurringPatternsIdentified?.commonTriggersAndResponsesExamples || []}
                />
                <InfoList
                  title="Repair Attempts or Avoidances"
                  items={results.recurringPatternsIdentified?.repairAttemptsOrEmotionalAvoidancesExamples || []}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="frameworks" className="border-purple-100">
              <AccordionTrigger className="text-lg font-semibold flex items-center gap-2 p-4 bg-white rounded-lg shadow-sm hover:bg-purple-50">
                <BrainCircuit size={20} className="text-purple-600" />
                Reflective Frameworks
              </AccordionTrigger>
              <AccordionContent className="p-6 bg-white rounded-b-lg shadow-sm space-y-4 text-gray-700">
                <p>
                  <strong className="font-medium text-purple-700">Attachment Energies:</strong>{" "}
                  {results.reflectiveFrameworks?.attachmentEnergies}
                </p>
                <p>
                  <strong className="font-medium text-purple-700">Love Language Friction:</strong>{" "}
                  {results.reflectiveFrameworks?.loveLanguageFriction}
                </p>
                <p>
                  <strong className="font-medium text-purple-700">Gottman Conflict Markers:</strong>{" "}
                  {results.reflectiveFrameworks?.gottmanConflictMarkers}
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="obstacles" className="border-purple-100">
              <AccordionTrigger className="text-lg font-semibold flex items-center gap-2 p-4 bg-white rounded-lg shadow-sm hover:bg-purple-50">
                <ShieldAlert size={20} className="text-purple-600" />
                What's Getting in the Way
              </AccordionTrigger>
              <AccordionContent className="p-6 bg-white rounded-b-lg shadow-sm space-y-4 text-gray-700">
                <p>
                  <strong className="font-medium text-purple-700">Emotional Mismatches:</strong>{" "}
                  {results.whatsGettingInTheWay?.emotionalMismatches}
                </p>
                <p>
                  <strong className="font-medium text-purple-700">Communication Gaps:</strong>{" "}
                  {results.whatsGettingInTheWay?.communicationGaps}
                </p>
                <p>
                  <strong className="font-medium text-purple-700">Subtle Power Struggles:</strong>{" "}
                  {results.whatsGettingInTheWay?.subtlePowerStrugglesOrMisfires}
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value="constructive-feedback">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <FeedbackCard
              title="For Subject A"
              icon={<span className="text-purple-600 font-bold">A</span>}
              strengths={results.constructiveFeedback?.subjectA?.strengths || []}
              nudges={results.constructiveFeedback?.subjectA?.gentleGrowthNudges || []}
              boosters={results.constructiveFeedback?.subjectA?.connectionBoosters || []}
              color="purple"
            />
            <FeedbackCard
              title="For Subject B"
              icon={<span className="text-pink-600 font-bold">B</span>}
              strengths={results.constructiveFeedback?.subjectB?.strengths || []}
              nudges={results.constructiveFeedback?.subjectB?.gentleGrowthNudges || []}
              boosters={results.constructiveFeedback?.subjectB?.connectionBoosters || []}
              color="pink"
            />
          </div>
          <Card className="border-purple-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <HeartHandshake />
                For Both
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <h4 className="font-semibold flex items-center gap-1.5 text-green-700">
                  <CheckCircle size={16} />
                  Shared Strengths
                </h4>
                <ul className="list-disc pl-5 text-gray-700">
                  {results.constructiveFeedback?.forBoth?.sharedStrengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold flex items-center gap-1.5 text-amber-700">
                  <TrendingUp size={16} />
                  Shared Growth Nudges
                </h4>
                <ul className="list-disc pl-5 text-gray-700">
                  {results.constructiveFeedback?.forBoth?.sharedGrowthNudges.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold flex items-center gap-1.5 text-blue-700">
                  <Sparkles size={16} />
                  Shared Connection Boosters
                </h4>
                <ul className="list-disc pl-5 text-gray-700">
                  {results.constructiveFeedback?.forBoth?.sharedConnectionBoosters.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visual-insights" className="space-y-6">
          <p className="text-center text-gray-600 bg-purple-50 p-4 rounded-lg">
            {results.visualInsightsData?.descriptionForChartsIntro}
          </p>
          <BarChartDisplay
            data={results.visualInsightsData?.emotionalCommunicationCharacteristics || []}
            title="Emotional Communication Characteristics"
          />
          <BarChartDisplay
            data={results.visualInsightsData?.conflictExpressionStyles || []}
            title="Conflict Expression Styles"
          />
          <BarChartDisplay
            data={results.visualInsightsData?.validationAndReassurancePatterns || []}
            title="Validation & Reassurance Patterns"
          />
        </TabsContent>
      </Tabs>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="outlook" className="border-purple-100">
          <AccordionTrigger className="text-lg font-semibold flex items-center gap-2 p-4 bg-white rounded-lg shadow-sm hover:bg-purple-50">
            <Zap size={20} className="text-purple-600" />
            Outlook
          </AccordionTrigger>
          <AccordionContent className="p-6 bg-white rounded-b-lg shadow-sm">
            <p className="text-gray-700">{results.outlook}</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="appendix" className="border-purple-100">
          <AccordionTrigger className="text-lg font-semibold flex items-center gap-2 p-4 bg-white rounded-lg shadow-sm hover:bg-purple-50 mt-4">
            <Users size={20} className="text-purple-600" />
            Optional Appendix
          </AccordionTrigger>
          <AccordionContent className="p-6 bg-white rounded-b-lg shadow-sm">
            <p className="text-gray-700">{results.optionalAppendix}</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
