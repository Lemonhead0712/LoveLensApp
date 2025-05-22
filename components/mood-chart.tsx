"use client"

import { useState, useMemo } from "react"
import { ResponsiveLine } from "@nivo/line"
import type { CheckIn } from "@/types/database"

interface MoodChartProps {
  checkIns: CheckIn[]
}

// Map mood values to numeric values for the chart
const moodToValue = {
  Happy: 7,
  Content: 6,
  Neutral: 5,
  Concerned: 4,
  Sad: 3,
  Frustrated: 2,
  Angry: 1,
}

// Map mood values to colors
const moodToColor = {
  Happy: "#4ade80", // green-400
  Content: "#34d399", // emerald-400
  Neutral: "#9ca3af", // gray-400
  Concerned: "#fbbf24", // amber-400
  Sad: "#60a5fa", // blue-400
  Frustrated: "#fb923c", // orange-400
  Angry: "#f87171", // red-400
}

export default function MoodChart({ checkIns }: MoodChartProps) {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month")

  const chartData = useMemo(() => {
    if (!checkIns.length) return []

    // Filter check-ins based on selected time range
    const now = new Date()
    const filteredCheckIns = checkIns.filter((checkIn) => {
      const checkInDate = new Date(checkIn.created_at)
      if (timeRange === "week") {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return checkInDate >= oneWeekAgo
      } else if (timeRange === "month") {
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        return checkInDate >= oneMonthAgo
      } else {
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        return checkInDate >= oneYearAgo
      }
    })

    // Sort by date
    const sortedCheckIns = [...filteredCheckIns].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )

    // Format data for the chart
    return [
      {
        id: "Mood",
        data: sortedCheckIns.map((checkIn) => ({
          x: new Date(checkIn.created_at).toLocaleDateString(),
          y: moodToValue[checkIn.mood as keyof typeof moodToValue] || 0,
          mood: checkIn.mood,
          note: checkIn.note,
        })),
      },
    ]
  }, [checkIns, timeRange])

  const formatTickValue = (value: number) => {
    const moodEntries = Object.entries(moodToValue)
    const mood = moodEntries.find(([_, val]) => val === value)?.[0]
    return mood || ""
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setTimeRange("week")}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              timeRange === "week" ? "bg-rose-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
            } border border-gray-200`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => setTimeRange("month")}
            className={`px-4 py-2 text-sm font-medium ${
              timeRange === "month" ? "bg-rose-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
            } border-t border-b border-gray-200`}
          >
            Month
          </button>
          <button
            type="button"
            onClick={() => setTimeRange("year")}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              timeRange === "year" ? "bg-rose-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
            } border border-gray-200`}
          >
            Year
          </button>
        </div>
      </div>

      <div className="h-80 border rounded-lg bg-white p-4">
        {chartData.length > 0 && chartData[0].data.length > 0 ? (
          <ResponsiveLine
            data={chartData}
            margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
            xScale={{ type: "point" }}
            yScale={{
              type: "linear",
              min: 0,
              max: 8,
              stacked: false,
            }}
            curve="monotoneX"
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45,
              legend: "Date",
              legendOffset: 40,
              legendPosition: "middle",
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Mood",
              legendOffset: -50,
              legendPosition: "middle",
              format: formatTickValue,
            }}
            colors={["#ec4899"]} // pink-500
            pointSize={10}
            pointColor={{ theme: "background" }}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            pointLabelYOffset={-12}
            useMesh={true}
            tooltip={({ point }) => (
              <div className="bg-white p-2 shadow-md rounded-md border border-gray-200">
                <p className="font-bold">
                  {point.data.mood}{" "}
                  <span className="text-lg">
                    {point.data.mood === "Happy" && "😊"}
                    {point.data.mood === "Content" && "😌"}
                    {point.data.mood === "Neutral" && "😐"}
                    {point.data.mood === "Concerned" && "😟"}
                    {point.data.mood === "Sad" && "😢"}
                    {point.data.mood === "Frustrated" && "😤"}
                    {point.data.mood === "Angry" && "😠"}
                  </span>
                </p>
                <p className="text-sm text-gray-500">{point.data.x}</p>
                {point.data.note && <p className="text-sm mt-1">{point.data.note}</p>}
              </div>
            )}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">No data available for the selected time range</p>
          </div>
        )}
      </div>
    </div>
  )
}
