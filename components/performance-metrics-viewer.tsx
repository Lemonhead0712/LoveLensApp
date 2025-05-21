"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPerformanceMetrics, clearPerformanceMetrics, type PerformanceMetrics } from "@/lib/performance-monitor"

export function PerformanceMetricsViewer() {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([])
  const [autoRefresh, setAutoRefresh] = useState(false)

  // Fetch metrics on mount and when autoRefresh is enabled
  useEffect(() => {
    const fetchMetrics = () => {
      setMetrics(getPerformanceMetrics())
    }

    fetchMetrics()

    let intervalId: NodeJS.Timeout | null = null

    if (autoRefresh) {
      intervalId = setInterval(fetchMetrics, 2000)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [autoRefresh])

  const handleClearMetrics = () => {
    clearPerformanceMetrics()
    setMetrics([])
  }

  const handleToggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh)
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Performance Metrics</CardTitle>
        <div className="flex space-x-2">
          <button
            onClick={handleToggleAutoRefresh}
            className={`px-3 py-1 text-xs rounded ${
              autoRefresh ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
            }`}
          >
            {autoRefresh ? "Auto-refresh: On" : "Auto-refresh: Off"}
          </button>
          <button onClick={handleClearMetrics} className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded">
            Clear
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {metrics.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No performance data available</p>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-1">Operation</th>
                    <th className="text-right py-2 px-1">Duration (ms)</th>
                    <th className="text-center py-2 px-1">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 px-1">{metric.operation}</td>
                      <td className="text-right py-2 px-1 font-mono">{metric.duration.toFixed(2)}</td>
                      <td className="text-center py-2 px-1">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs ${
                            metric.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {metric.success ? "Success" : "Failed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-xs text-gray-500">
              <p>Total operations: {metrics.length}</p>
              <p>
                Average duration:{" "}
                {(metrics.reduce((sum, metric) => sum + metric.duration, 0) / metrics.length).toFixed(2)} ms
              </p>
              <p>Success rate: {((metrics.filter((m) => m.success).length / metrics.length) * 100).toFixed(0)}%</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
