"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartSection } from "@/components/chart-section"
import { Button } from "@/components/ui/button"
import { Download, Printer, Share2 } from "lucide-react"
import { parseAnalysisData } from "@/lib/parse-analysis"

interface AnalysisResultProps {
  analysis: string
}

export function AnalysisResult({ analysis }: AnalysisResultProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // In a real implementation, you would parse the analysis text to extract
  // structured data for the charts and sections
  const parsedData = parseAnalysisData(analysis)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Relationship Analysis</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="prose max-w-none">
            <div className="bg-rose-50 border-l-4 border-rose-500 p-4 mb-6">
              <h3 className="text-lg font-medium text-rose-800 mb-2">📝 Note to Reader</h3>
              <p className="text-rose-700">
                This is a third-party relationship reflection based on real conversations. The goal? Clarity. All
                emotional tones are preserved as they were sent. We're not assigning blame—just holding up a mirror to
                the emotional patterns at play.
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-6 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="patterns">Patterns</TabsTrigger>
                <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
                <TabsTrigger value="obstacles">Obstacles</TabsTrigger>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
                <TabsTrigger value="charts">Charts</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <h2 className="text-2xl font-bold mb-4">💬 Communication Styles & Emotional Tone</h2>
                <div dangerouslySetInnerHTML={{ __html: parsedData.communicationStyles }} />
              </TabsContent>

              <TabsContent value="patterns" className="mt-6">
                <h2 className="text-2xl font-bold mb-4">🔁 Recurring Patterns Identified</h2>
                <div dangerouslySetInnerHTML={{ __html: parsedData.recurringPatterns }} />
              </TabsContent>

              <TabsContent value="frameworks" className="mt-6">
                <h2 className="text-2xl font-bold mb-4">🧠 Reflective Frameworks</h2>

                <h3 className="text-xl font-semibold mt-6 mb-3">Attachment-Style Energies</h3>
                <div dangerouslySetInnerHTML={{ __html: parsedData.attachmentStyles }} />

                <h3 className="text-xl font-semibold mt-6 mb-3">Love Language Tensions</h3>
                <div dangerouslySetInnerHTML={{ __html: parsedData.loveLanguages }} />

                <h3 className="text-xl font-semibold mt-6 mb-3">Gottman Conflict Behaviors</h3>
                <div dangerouslySetInnerHTML={{ __html: parsedData.gottmanBehaviors }} />
              </TabsContent>

              <TabsContent value="obstacles" className="mt-6">
                <h2 className="text-2xl font-bold mb-4">🚧 What's Getting in the Way</h2>
                <div dangerouslySetInnerHTML={{ __html: parsedData.obstacles }} />
              </TabsContent>

              <TabsContent value="feedback" className="mt-6">
                <h2 className="text-2xl font-bold mb-4">🌱 Constructive Feedback</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-blue-800 mb-4">Subject A</h3>

                    <h4 className="font-medium text-blue-700 mb-2">✅ Strength Snapshots</h4>
                    <div dangerouslySetInnerHTML={{ __html: parsedData.subjectAStrengths }} />

                    <h4 className="font-medium text-blue-700 mt-4 mb-2">🌀 Gentle Growth Nudges</h4>
                    <div dangerouslySetInnerHTML={{ __html: parsedData.subjectAGrowth }} />

                    <h4 className="font-medium text-blue-700 mt-4 mb-2">✨ Connection Boosters</h4>
                    <div dangerouslySetInnerHTML={{ __html: parsedData.subjectABoosters }} />
                  </div>

                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-purple-800 mb-4">Subject B</h3>

                    <h4 className="font-medium text-purple-700 mb-2">✅ Strength Snapshots</h4>
                    <div dangerouslySetInnerHTML={{ __html: parsedData.subjectBStrengths }} />

                    <h4 className="font-medium text-purple-700 mt-4 mb-2">🌀 Gentle Growth Nudges</h4>
                    <div dangerouslySetInnerHTML={{ __html: parsedData.subjectBGrowth }} />

                    <h4 className="font-medium text-purple-700 mt-4 mb-2">✨ Connection Boosters</h4>
                    <div dangerouslySetInnerHTML={{ __html: parsedData.subjectBBoosters }} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="charts" className="mt-6">
                <h2 className="text-2xl font-bold mb-6">📊 Visual Insights</h2>
                <ChartSection />
              </TabsContent>
            </Tabs>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold mb-4">🔮 Outlook</h2>
              <div dangerouslySetInnerHTML={{ __html: parsedData.outlook }} />
            </div>

            {parsedData.appendix && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h2 className="text-2xl font-bold mb-4">📎 Appendix</h2>
                <div dangerouslySetInnerHTML={{ __html: parsedData.appendix }} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
