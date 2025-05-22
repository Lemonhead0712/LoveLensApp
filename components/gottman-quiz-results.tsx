"use client"

import { Card } from "@/components/ui/card"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface GottmanPrinciple {
  id: string
  title: string
  description: string
  subjectAScore: number
  subjectBScore: number
  combined: number
  interpretation: string
  recommendations: string[]
}

interface GottmanQuizResultsProps {
  summary: string
  strengths: string[]
  improvements: string[]
  principles: GottmanPrinciple[]
  radarData: Array<{
    principle: string
    "Subject A": number
    "Subject B": number
  }>
}

export default function GottmanQuizResults({
  summary,
  strengths,
  improvements,
  principles,
  radarData,
}: GottmanQuizResultsProps) {
  return (
    <div className="space-y-4">
      <Card className="border-rose-200 bg-rose-50 p-4">
        <h3 className="text-lg font-semibold mb-2 text-rose-700">The Gottman Method: Understanding Your Results</h3>
        <p className="text-gray-700 text-sm">{summary}</p>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-3 border-green-200 bg-green-50">
          <h4 className="font-medium text-green-800 mb-2 text-sm">Relationship Strengths</h4>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            {strengths.map((strength, index) => (
              <li key={index} className="text-gray-700">
                {strength}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-3 border-amber-200 bg-amber-50">
          <h4 className="font-medium text-amber-800 mb-2 text-sm">Areas for Growth</h4>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            {improvements.map((improvement, index) => (
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
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
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
        {principles.map((principle) => (
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
                  {principle.recommendations.map((recommendation, idx) => (
                    <li key={idx} className="text-gray-700">
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
  )
}
