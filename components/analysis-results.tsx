"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import BarChartDisplay from "@/components/bar-chart-display"
import GottmanQuizResults from "@/components/gottman-quiz-results"
import { Download, Save } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { saveAnalysisResult } from "@/lib/database"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface AnalysisResultsProps {
  analysis: {
    summary: string
    keyInsights: string[]
    emotionalPatterns: {
      subject: string
      emotions: {
        emotion: string
        percentage: number
      }[]
    }[]
    communicationStyle: {
      subject: string
      styles: {
        style: string
        percentage: number
      }[]
    }[]
    recommendations: string[]
    gottmanQuiz?: {
      summary: string
      strengths: string[]
      improvements: string[]
      principles: {
        id: string
        title: string
        description: string
        subjectAScore: number
        subjectBScore: number
        combined: number
        interpretation: string
        recommendations: string[]
      }[]
      radarData: {
        principle: string
        "Subject A": number
        "Subject B": number
      }[]
    }
  }
  onExport?: () => void
}

export default function AnalysisResults({ analysis, onExport }: AnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState("analysis")
  const [isSaving, setIsSaving] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to save your analysis results",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setIsSaving(true)
    try {
      const title = `Relationship Analysis - ${new Date().toLocaleDateString()}`
      const result = await saveAnalysisResult(user.id, title, analysis)

      if (result) {
        toast({
          title: "Analysis saved",
          description: "Your analysis has been saved successfully",
        })
      } else {
        throw new Error("Failed to save analysis")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save your analysis. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 border-purple-200 bg-purple-50">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-purple-900 mb-4">Analysis Results</h2>
            <p className="text-gray-700">{analysis.summary}</p>
          </div>
          <div className="flex gap-2">
            {user && (
              <Button onClick={handleSave} variant="outline" className="flex items-center gap-2" disabled={isSaving}>
                <Save size={16} />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            )}
            {onExport && (
              <Button onClick={onExport} variant="outline" className="flex items-center gap-2">
                <Download size={16} />
                Export
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Key Insights</h3>
        <ul className="list-disc pl-5 space-y-2">
          {analysis.keyInsights.map((insight, index) => (
            <li key={index} className="text-gray-700">
              {insight}
            </li>
          ))}
        </ul>
      </Card>

      <Tabs defaultValue="analysis" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="analysis">Written Analysis</TabsTrigger>
          <TabsTrigger value="charts">Visual Insights</TabsTrigger>
          {analysis.gottmanQuiz && <TabsTrigger value="gottman">Gottman Quiz</TabsTrigger>}
        </TabsList>

        <TabsContent value="analysis" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Emotional Patterns</h3>
            {analysis.emotionalPatterns.map((subject, index) => (
              <div key={index} className="mb-6 last:mb-0">
                <h4 className="font-medium text-lg mb-2 text-gray-700">{subject.subject}</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {subject.emotions.map((emotion, idx) => (
                    <li key={idx} className="text-gray-600">
                      {emotion.emotion}: {emotion.percentage}%
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Communication Styles</h3>
            {analysis.communicationStyle.map((subject, index) => (
              <div key={index} className="mb-6 last:mb-0">
                <h4 className="font-medium text-lg mb-2 text-gray-700">{subject.subject}</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {subject.styles.map((style, idx) => (
                    <li key={idx} className="text-gray-600">
                      {style.style}: {style.percentage}%
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Recommendations</h3>
            <ul className="list-disc pl-5 space-y-2">
              {analysis.recommendations.map((recommendation, index) => (
                <li key={index} className="text-gray-700">
                  {recommendation}
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="charts">
          <div className="space-y-6">
            {analysis.emotionalPatterns.map((subject, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">{subject.subject} - Emotional Patterns</h3>
                <BarChartDisplay
                  data={subject.emotions.map((e) => ({
                    category: e.emotion,
                    "Subject A": e.percentage,
                    "Subject B": 0,
                  }))}
                  title={`${subject.subject} - Emotional Patterns`}
                />
              </Card>
            ))}

            {analysis.communicationStyle.map((subject, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">{subject.subject} - Communication Styles</h3>
                <BarChartDisplay
                  data={subject.styles.map((s) => ({
                    category: s.style,
                    "Subject A": s.percentage,
                    "Subject B": 0,
                  }))}
                  title={`${subject.subject} - Communication Styles`}
                />
              </Card>
            ))}
          </div>
        </TabsContent>

        {analysis.gottmanQuiz && (
          <TabsContent value="gottman">
            <GottmanQuizResults
              summary={analysis.gottmanQuiz.summary}
              strengths={analysis.gottmanQuiz.strengths}
              improvements={analysis.gottmanQuiz.improvements}
              principles={analysis.gottmanQuiz.principles}
              radarData={analysis.gottmanQuiz.radarData}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
