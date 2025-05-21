"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface BarChartDisplayProps {
  data: Array<{
    category: string
    "Subject A": number
    "Subject B": number
  }>
  title: string
}

export default function BarChartDisplay({ data, title }: BarChartDisplayProps) {
  return (
    <Card className="border-gray-200 p-6 shadow-md">
      <h3 className="mb-6 text-xl font-semibold text-rose-600">{title}</h3>
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 150,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" domain={[0, 10]} />
            <YAxis dataKey="category" type="category" tick={{ fontSize: 12 }} width={140} />
            <Tooltip />
            <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: 10 }} />
            <Bar dataKey="Subject A" fill="#f43f5e" barSize={20} />
            <Bar dataKey="Subject B" fill="#3b82f6" barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
