import type React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface OptimizedBarChartProps {
  data: Array<{ category: string; [key: string]: string | number }>
}

const OptimizedBarChart: React.FC<OptimizedBarChartProps> = ({ data }) => {
  const subjectKeys =
    data.length > 0 ? Object.keys(data[0]).filter((key) => key !== "category") : ["Subject A", "Subject B"]
  const subjectALabel = subjectKeys[0] || "Subject A"
  const subjectBLabel = subjectKeys[1] || "Subject B"

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 70, // Increased from 60 to 70 for better diagonal label spacing
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="category"
          angle={-45}
          textAnchor="end"
          height={90} // Increased from 80 to 90 to accommodate longer labels
          interval={0}
          tick={{ fontSize: 12 }} // Added explicit font size for consistency
        />
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
