"use client"

import { Card } from "@/components/ui/card"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts"
import { Progress } from "@/components/ui/progress"

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
    <div className="space-y-6">
      <Card className="border-rose-200 bg-rose-50 p-6">
        <h3 className="text-xl font-semibold mb-3 text-rose-700">The Gottman Method: Understanding Your Results</h3>
        <p className="text-gray-700">
          The Gottman Method is based on over 40 years of research on thousands of couples. It identifies key patterns
          that predict relationship success or failure. This analysis shows how your communication patterns align with
          the Gottman principles.
        </p>
      </Card>

      <Card className="border-gray-200 p-6 shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-rose-600">Summary</h3>
        <p className="text-gray-700 mb-6">{summary}</p>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-4 border-green-200 bg-green-50">
            <h4 className="font-medium text-green-800 mb-2">Relationship Strengths</h4>
            <ul className="list-disc pl-5 space-y-1">
              {strengths.map((strength, index) => (
                <li key={index} className="text-gray-700">
                  {strength}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4 border-amber-200 bg-amber-50">
            <h4 className="font-medium text-amber-800 mb-2">Areas for Growth</h4>
            <ul className="list-disc pl-5 space-y-1">
              {improvements.map((improvement, index) => (
                <li key={index} className="text-gray-700">
                  {improvement}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Card>

      <Card className="border-gray-200 p-6 shadow-md">
        <h3 className="text-xl font-semibold mb-6 text-rose-600">Gottman Principles Visualization</h3>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="principle" tick={{ fill: "#4b5563", fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} />
              <Radar name="Subject A" dataKey="Subject A" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.3} />
              <Radar name="Subject B" dataKey="Subject B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
        {principles.map((principle) => (
          <Card key={principle.id} className="border-gray-200 p-6 shadow-md">
            <h4 className="text-lg font-medium text-gray-900 mb-3">{principle.title}</h4>
            <p className="text-gray-700 mb-4">{principle.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Card className="p-4 border-gray-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Subject A</span>
                  <span className="text-sm font-medium text-gray-700">{principle.subjectAScore}/10</span>
                </div>
                <Progress
                  value={principle.subjectAScore * 10}
                  className="h-2 bg-gray-200"
                  indicatorClassName="bg-rose-600"
                />
              </Card>

              <Card className="p-4 border-gray-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Subject B</span>
                  <span className="text-sm font-medium text-gray-700">{principle.subjectBScore}/10</span>
                </div>
                <Progress
                  value={principle.subjectBScore * 10}
                  className="h-2 bg-gray-200"
                  indicatorClassName="bg-blue-600"
                />
              </Card>
            </div>

            <Card className="p-4 border-gray-100 mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Combined Score</span>
                <span className="text-sm font-medium text-gray-700">{principle.combined}/10</span>
              </div>
              <Progress
                value={principle.combined * 10}
                className="h-2 bg-gray-200"
                indicatorClassName="bg-purple-600"
              />
            </Card>

            <Card className="bg-gray-50 p-4 border-gray-100">
              <p className="text-gray-700 mb-3">{principle.interpretation}</p>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Recommendations:</h5>
              <ul className="list-disc pl-5 space-y-1">
                {principle.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-gray-700 text-sm">
                    {recommendation}
                  </li>
                ))}
              </ul>
            </Card>
          </Card>
        ))}
      </div>
    </div>
  )
}
