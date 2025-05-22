"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SectionDisplay from "./section-display"
import BarChartDisplay from "./bar-chart-display"
import GottmanQuizResults from "./gottman-quiz-results"
import { exportToWord } from "@/app/actions"
import { Download } from "lucide-react"

interface AnalysisResultsProps {
  results: {
    communicationStyles: string
    recurringPatterns: string
    reflectiveFrameworks: string
    gettingInTheWay: string
    constructiveFeedback: string
    outlook: string
    optionalAppendix: string
    emotionalCharacteristics: any[]
    conflictStyles: any[]
    loveLanguages: any[]
    gottmanQuiz: {
      summary: string
      strengths: string[]
      improvements: string[]
      principles: any[]
      radarData: any[]
    }
  }
}

export default function AnalysisResults({ results }: AnalysisResultsProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportToWord(results)
    } catch (error) {
      console.error("Error exporting to Word:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 p-6 shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-rose-600">Analysis Results</h2>
          <Button onClick={handleExport} disabled={isExporting} className="bg-rose-600 hover:bg-rose-700">
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export as Word Doc"}
          </Button>
        </div>

        <Card className="mb-6 p-4 bg-rose-50 border-rose-200">
          <p className="text-gray-700">
            <strong>Note to Reader:</strong> This is a third-party relationship reflection based on real conversations.
            The goal? Clarity. All emotional tones are preserved as they were sent. We're not assigning blame—just
            holding up a mirror to the emotional patterns at play.
          </p>
        </Card>

        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="analysis">Written Analysis</TabsTrigger>
            <TabsTrigger value="charts">Visual Insights</TabsTrigger>
            <TabsTrigger value="gottman">Gottman Quiz</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <SectionDisplay title="💬 Communication Styles & Emotional Tone" content={results.communicationStyles} />
              <SectionDisplay title="🔁 Recurring Patterns Identified" content={results.recurringPatterns} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <SectionDisplay title="🧠 Reflective Frameworks" content={results.reflectiveFrameworks} />
              <SectionDisplay title="🚧 What's Getting in the Way" content={results.gettingInTheWay} />
            </div>

            <SectionDisplay title="🌱 Constructive Feedback" content={results.constructiveFeedback} />

            <div className="grid gap-6 md:grid-cols-2">
              <SectionDisplay title="🔮 Outlook" content={results.outlook} />
              <SectionDisplay title="📎 Optional Appendix" content={results.optionalAppendix} />
            </div>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
              <BarChartDisplay
                data={results.emotionalCharacteristics}
                title="Emotional Communication Characteristics"
              />

              <BarChartDisplay data={results.conflictStyles} title="Conflict Expression Styles" />

              <BarChartDisplay data={results.loveLanguages} title="Love Language Alignment" />
            </div>
          </TabsContent>

          <TabsContent value="gottman">
            <GottmanQuizResults
              summary={results.gottmanQuiz.summary}
              strengths={results.gottmanQuiz.strengths}
              improvements={results.gottmanQuiz.improvements}
              principles={results.gottmanQuiz.principles}
              radarData={results.gottmanQuiz.radarData}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
