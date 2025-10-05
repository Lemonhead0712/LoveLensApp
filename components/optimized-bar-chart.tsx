"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useMemo } from "react"

interface OptimizedBarChartProps {
  data: Array<{
    category: string
    "Subject A": number
    "Subject B": number
  }>
  title: string
}

const COLORS = {
  subjectA: "#9333ea",
  subjectB: "#ec4899",
}

export default function OptimizedBarChart({ data, title }: OptimizedBarChartProps) {
  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return []
    }

    return data.map((item) => ({
      category: item.category || "Unknown",
      A: typeof item["Subject A"] === "number" ? item["Subject A"] : 0,
      B: typeof item["Subject B"] === "number" ? item["Subject B"] : 0,
    }))
  }, [data])

  if (chartData.length === 0) {
    return (
      <Card className="border-purple-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center text-gray-500">No data available for this chart</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-purple-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} layout="horizontal" margin={{ top: 15, right: 30, bottom: 15, left: 160 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              type="number"
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              tick={{ fontSize: 13, fill: "#4b5563", fontWeight: 500 }}
              stroke="#9ca3af"
              label={{
                value: "Score (0-10)",
                position: "insideBottom",
                offset: -10,
                style: { fontSize: 14, fontWeight: 600, fill: "#374151" },
              }}
            />
            <YAxis
              type="category"
              dataKey="category"
              width={150}
              tick={{
                fontSize: 13,
                fill: "#4b5563",
                fontWeight: 500,
              }}
              stroke="#9ca3af"
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "12px",
                fontSize: "13px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{ fontWeight: 600, marginBottom: "8px", color: "#1f2937" }}
              cursor={{ fill: "rgba(147, 51, 234, 0.05)" }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: "20px",
                fontSize: "14px",
                fontWeight: 600,
              }}
              iconType="circle"
            />
            <Bar
              dataKey="A"
              name="Subject A"
              fill={COLORS.subjectA}
              radius={[0, 8, 8, 0]}
              barSize={24}
              animationDuration={800}
              animationBegin={0}
            />
            <Bar
              dataKey="B"
              name="Subject B"
              fill={COLORS.subjectB}
              radius={[0, 8, 8, 0]}
              barSize={24}
              animationDuration={800}
              animationBegin={100}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
