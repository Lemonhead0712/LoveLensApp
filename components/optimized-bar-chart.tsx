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
        <ResponsiveContainer width="100%" height={380} className="sm:h-[420px] md:h-[450px]">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 20,
              left: 20,
              bottom: 80,
            }}
            className="sm:mb-4 md:mb-6"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
            <XAxis
              dataKey="category"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              tick={{ fontSize: 9, fill: "#4b5563", fontWeight: 500 }}
              className="sm:text-[10px] md:text-xs"
              stroke="#9ca3af"
            />
            <YAxis
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              tick={{ fontSize: 10, fill: "#4b5563", fontWeight: 500 }}
              className="sm:text-xs"
              stroke="#9ca3af"
              label={{
                value: "Score (0-10)",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 11, fontWeight: 600, fill: "#374151" },
                className: "sm:text-xs md:text-sm",
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "10px 12px",
                fontSize: "11px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              className="sm:text-xs sm:p-3"
              labelStyle={{ fontWeight: 600, marginBottom: "6px", color: "#1f2937" }}
              cursor={{ fill: "rgba(147, 51, 234, 0.05)" }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: "16px",
                fontSize: "11px",
                fontWeight: 600,
              }}
              className="sm:text-xs sm:pt-5 md:text-sm md:pt-6"
              iconType="circle"
            />
            <Bar
              dataKey="A"
              name="Subject A"
              fill={COLORS.subjectA}
              radius={[8, 8, 0, 0]}
              maxBarSize={50}
              animationDuration={800}
              animationBegin={0}
            />
            <Bar
              dataKey="B"
              name="Subject B"
              fill={COLORS.subjectB}
              radius={[8, 8, 0, 0]}
              maxBarSize={50}
              animationDuration={800}
              animationBegin={100}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
