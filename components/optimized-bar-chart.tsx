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
  title?: string
}

const COLORS = {
  subjectA: "#9333ea",
  subjectB: "#ec4899",
}

export default function OptimizedBarChart({ data, title }: OptimizedBarChartProps) {
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
        {title && (
          <CardHeader>
            <CardTitle className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="h-64 md:h-96 flex items-center justify-center text-xs sm:text-sm text-gray-500">
            No data available for this chart
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-purple-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-2 sm:p-4 md:p-6">
        <ResponsiveContainer width="100%" height={350} className="sm:h-[380px] md:h-[400px]">
          <BarChart
            data={chartData}
            layout="horizontal"
            margin={{
              top: 10,
              right: 10,
              bottom: 10,
              left: 80,
            }}
            className="sm:ml-8 md:ml-16"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              type="number"
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              tick={{ fontSize: 10, fill: "#4b5563", fontWeight: 500 }}
              className="sm:text-xs"
              stroke="#9ca3af"
              label={{
                value: "Score (0-10)",
                position: "insideBottom",
                offset: -5,
                style: { fontSize: 10, fontWeight: 600, fill: "#374151" },
                className: "sm:text-xs md:text-sm",
              }}
            />
            <YAxis
              type="category"
              dataKey="category"
              width={75}
              className="sm:w-[120px] md:w-[150px]"
              tick={{
                fontSize: 9,
                fill: "#4b5563",
                fontWeight: 500,
              }}
              className="sm:text-[10px] md:text-xs"
              stroke="#9ca3af"
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "8px 10px",
                fontSize: "11px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              className="sm:text-xs sm:p-3"
              labelStyle={{ fontWeight: 600, marginBottom: "6px", color: "#1f2937" }}
              cursor={{ fill: "rgba(147, 51, 234, 0.05)" }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: "12px",
                fontSize: "11px",
                fontWeight: 600,
              }}
              className="sm:text-xs sm:pt-4 md:text-sm md:pt-5"
              iconType="circle"
            />
            <Bar
              dataKey="A"
              name="Subject A"
              fill={COLORS.subjectA}
              radius={[0, 6, 6, 0]}
              barSize={16}
              className="sm:h-5 md:h-6"
              animationDuration={800}
              animationBegin={0}
            />
            <Bar
              dataKey="B"
              name="Subject B"
              fill={COLORS.subjectB}
              radius={[0, 6, 6, 0]}
              barSize={16}
              className="sm:h-5 md:h-6"
              animationDuration={800}
              animationBegin={100}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
