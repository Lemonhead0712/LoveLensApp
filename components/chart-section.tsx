"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

// Sample data - in a real implementation, this would come from the analysis
const emotionalCommunicationData = [
  { category: "Emotionally steady", "Subject A": 8, "Subject B": 4 },
  { category: "Reassurance-seeking", "Subject A": 3, "Subject B": 9 },
  { category: "Critical phrasing", "Subject A": 2, "Subject B": 7 },
  { category: "Withdraws in conflict", "Subject A": 6, "Subject B": 2 },
  { category: "Tone softening", "Subject A": 7, "Subject B": 5 },
]

const conflictExpressionData = [
  { category: "Criticism", "Subject A": 1, "Subject B": 7 },
  { category: "Contempt", "Subject A": 0, "Subject B": 6 },
  { category: "Defensiveness", "Subject A": 5, "Subject B": 5 },
  { category: "Stonewalling", "Subject A": 6, "Subject B": 2 },
  { category: "Softened start-ups", "Subject A": 6, "Subject B": 3 },
  { category: "Repair attempts", "Subject A": 4, "Subject B": 6 },
]

const loveLanguageData = [
  { category: "Acts of service", "Subject A": 8, "Subject B": 3 },
  { category: "Words of affirmation", "Subject A": 3, "Subject B": 9 },
  { category: "Emotional availability", "Subject A": 6, "Subject B": 7 },
  { category: "Physical affection cues", "Subject A": 2, "Subject B": 5 },
  { category: "Consistency over intensity", "Subject A": 9, "Subject B": 4 },
  { category: "Emotional intensity preference", "Subject A": 4, "Subject B": 8 },
]

export function ChartSection() {
  return (
    <div className="space-y-12">
      <div>
        <h3 className="text-xl font-semibold mb-4">Emotional Communication Characteristics</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={emotionalCommunicationData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 10]} />
              <YAxis type="category" dataKey="category" width={140} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Subject A" fill="#3b82f6" />
              <Bar dataKey="Subject B" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Conflict Expression Styles (Gottman Lens)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={conflictExpressionData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 10]} />
              <YAxis type="category" dataKey="category" width={140} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Subject A" fill="#3b82f6" />
              <Bar dataKey="Subject B" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Love Language Alignment Patterns</h3>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={loveLanguageData} layout="vertical" margin={{ top: 20, right: 30, left: 150, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 10]} />
              <YAxis type="category" dataKey="category" width={140} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Subject A" fill="#3b82f6" />
              <Bar dataKey="Subject B" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
