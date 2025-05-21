"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import BarChartDisplay from "./bar-chart-display"
import GottmanQuizResults from "./gottman-quiz-results"
import { exportToWord } from "@/app/actions"
import { Download } from "lucide-react"

interface CompactAnalysisResultsProps {
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

export default function CompactAnalysisResults({ results }: CompactAnalysisResultsProps) {
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
    <div className="space-y-4">
      <Card className="border-gray-200 p-4 md:p-6 shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
          <h2 className="text-xl md:text-2xl font-bold text-rose-600">Analysis Results</h2>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-rose-600 hover:bg-rose-700 w-full md:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export as Word Doc"}
          </Button>
        </div>

        <Card className="mb-4 p-3 bg-rose-50 border-rose-200 text-sm">
          <p className="text-gray-700">
            <strong>Note:</strong> This is a third-party relationship reflection based on real conversations. We're not
            assigning blame—just holding up a mirror to the emotional patterns at play.
          </p>
        </Card>

        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="charts">Visual Insights</TabsTrigger>
            <TabsTrigger value="gottman">Gottman Quiz</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="communication">
                <AccordionTrigger className="text-base font-medium">
                  💬 Communication Styles & Emotional Tone
                </AccordionTrigger>
                <AccordionContent>
                  <div className="prose max-w-none text-sm">
                    {results.communicationStyles.split("\n").map((paragraph, index) => (
                      <p key={index} className="mb-2 text-gray-700">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="patterns">
                <AccordionTrigger className="text-base font-medium">🔁 Recurring Patterns Identified</AccordionTrigger>
                <AccordionContent>
                  <div className="prose max-w-none text-sm">
                    {results.recurringPatterns.split("\n").map((paragraph, index) => (
                      <p key={index} className="mb-2 text-gray-700">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="frameworks">
                <AccordionTrigger className="text-base font-medium">🧠 Reflective Frameworks</AccordionTrigger>
                <AccordionContent>
                  <div className="prose max-w-none text-sm">
                    {results.reflectiveFrameworks.split("\n").map((paragraph, index) => (
                      <p key={index} className="mb-2 text-gray-700">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="obstacles">
                <AccordionTrigger className="text-base font-medium">🚧 What's Getting in the Way</AccordionTrigger>
                <AccordionContent>
                  <div className="prose max-w-none text-sm">
                    {results.gettingInTheWay.split("\n").map((paragraph, index) => (
                      <p key={index} className="mb-2 text-gray-700">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="feedback">
                <AccordionTrigger className="text-base font-medium">🌱 Constructive Feedback</AccordionTrigger>
                <AccordionContent>
                  <div className="prose max-w-none text-sm">
                    {results.constructiveFeedback.split("\n").map((paragraph, index) => (
                      <p key={index} className="mb-2 text-gray-700">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="outlook">
                <AccordionTrigger className="text-base font-medium">🔮 Outlook</AccordionTrigger>
                <AccordionContent>
                  <div className="prose max-w-none text-sm">
                    {results.outlook.split("\n").map((paragraph, index) => (
                      <p key={index} className="mb-2 text-gray-700">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="appendix">
                <AccordionTrigger className="text-base font-medium">📎 Optional Appendix</AccordionTrigger>
                <AccordionContent>
                  <div className="prose max-w-none text-sm">
                    {results.optionalAppendix.split("\n").map((paragraph, index) => (
                      <p key={index} className="mb-2 text-gray-700">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="charts" className="space-y-4">
            <div className="grid gap-4">
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
