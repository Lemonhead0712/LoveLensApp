import type React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface OptimizedBarChartProps {
  data: Array<{ category: string; [key: string]: string | number }>
}

const OptimizedBarChart: React.FC<OptimizedBarChartProps> = ({ data }) => {
  console.log("[v0] OptimizedBarChart received data:", data)

  // Extract subject labels from data keys (excluding 'category')
  const subjectKeys =
    data.length > 0 ? Object.keys(data[0]).filter((key) => key !== "category") : ["Subject A", "Subject B"]
  const subjectALabel = subjectKeys[0] || "Subject A"
  const subjectBLabel = subjectKeys[1] || "Subject B"

  console.log("[v0] Extracted labels:", { subjectALabel, subjectBLabel, allKeys: subjectKeys })

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={subjectALabel} fill="#8b5cf6" radius={[4, 4, 0, 0]} name={subjectALabel} />
        <Bar dataKey={subjectBLabel} fill="#ec4899" radius={[4, 4, 0, 0]} name={subjectBLabel} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default OptimizedBarChart
