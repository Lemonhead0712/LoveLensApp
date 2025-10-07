"use client"

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
  "Subject A": "#3b82f6",
  "Subject B": "#ec4899",
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900 mb-2 text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-700">
              {entry.name}: <span className="font-semibold">{entry.value}/10</span>
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function OptimizedBarChart({ data, title }: OptimizedBarChartProps) {
  const chartData = useMemo(() => data, [data])

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400} className="sm:h-[450px] md:h-[500px]">
        <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 80 }} barGap={8} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="category"
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
            tick={{ fill: "#4b5563", fontSize: 11 }}
            tickMargin={10}
          />
          <YAxis
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fill: "#4b5563", fontSize: 12 }}
            tickMargin={8}
            label={{ value: "Score (0-10)", angle: -90, position: "insideLeft", style: { fontSize: 12 } }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0, 0, 0, 0.05)" }} />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="circle"
            iconSize={10}
            formatter={(value) => <span className="text-sm text-gray-700">{value}</span>}
          />
          <Bar dataKey="Subject A" fill={COLORS["Subject A"]} radius={[6, 6, 0, 0]} maxBarSize={60} />
          <Bar dataKey="Subject B" fill={COLORS["Subject B"]} radius={[6, 6, 0, 0]} maxBarSize={60} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
