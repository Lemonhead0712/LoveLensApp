"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SectionDisplay from "./section-display"
import BarChartDisplay from "./bar-chart-display"
import { exportToWord } from "@/app/actions"
import { Download } from "lucide-react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Progress } from "@/components/ui/progress"

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
            <div className="space-y-4">
              <Card className="border-rose-200 bg-rose-50 p-4">
                <h3 className="text-lg font-semibold mb-2 text-rose-700">
                  The Gottman Method: Understanding Your Results
                </h3>
                <p className="text-gray-700 text-sm">{results.gottmanQuiz.summary}</p>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-3 border-green-200 bg-green-50">
                  <h4 className="font-medium text-green-800 mb-2 text-sm">Relationship Strengths</h4>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    {results.gottmanQuiz.strengths.map((strength, index) => (
                      <li key={index} className="text-gray-700">
                        {strength}
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-3 border-amber-200 bg-amber-50">
                  <h4 className="font-medium text-amber-800 mb-2 text-sm">Areas for Growth</h4>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    {results.gottmanQuiz.improvements.map((improvement, index) => (
                      <li key={index} className="text-gray-700">
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

              <Card className="border-gray-200 p-4 shadow-md">
                <h3 className="text-lg font-semibold mb-4 text-rose-600">Gottman Principles Visualization</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={results.gottmanQuiz.radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="principle" tick={{ fill: "#4b5563", fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} />
                      <Radar name="Subject A" dataKey="Subject A" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.3} />
                      <Radar name="Subject B" dataKey="Subject B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Accordion type="single" collapsible className="w-full">
                {results.gottmanQuiz.principles.map((principle) => (
                  <AccordionItem key={principle.id} value={principle.id}>
                    <AccordionTrigger className="text-base font-medium py-2">{principle.title}</AccordionTrigger>
                    <AccordionContent>
                      <div className="text-sm text-gray-700 mb-2">{principle.description}</div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-gray-700">Subject A</span>
                            <span className="text-xs font-medium text-gray-700">{principle.subjectAScore}/10</span>
                          </div>
                          <Progress
                            value={principle.subjectAScore * 10}
                            className="h-1.5 bg-gray-200"
                            indicatorClassName="bg-rose-600"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-gray-700">Subject B</span>
                            <span className="text-xs font-medium text-gray-700">{principle.subjectBScore}/10</span>
                          </div>
                          <Progress
                            value={principle.subjectBScore * 10}
                            className="h-1.5 bg-gray-200"
                            indicatorClassName="bg-blue-600"
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-gray-700">Combined Score</span>
                          <span className="text-xs font-medium text-gray-700">{principle.combined}/10</span>
                        </div>
                        <Progress
                          value={principle.combined * 10}
                          className="h-1.5 bg-gray-200"
                          indicatorClassName="bg-purple-600"
                        />
                      </div>

                      <div className="bg-gray-50 p-3 rounded-md text-xs">
                        <p className="text-gray-700 mb-2">{principle.interpretation}</p>
                        <h5 className="font-medium text-gray-900 mb-1">Recommendations:</h5>
                        <ul className="list-disc pl-5 space-y-1">
                          {principle.recommendations.map((recommendation, index) => (
                            <li key={index} className="text-gray-700">
                              {recommendation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
