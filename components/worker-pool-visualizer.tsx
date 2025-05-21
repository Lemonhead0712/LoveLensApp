"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import workerPoolManager from "@/lib/workers/worker-pool-manager"

export function WorkerPoolVisualizer() {
  const [stats, setStats] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only run in debug mode
    const debugMode = localStorage.getItem("debug_mode") === "true"
    setIsVisible(debugMode)

    if (!debugMode) return

    const interval = setInterval(() => {
      setStats(workerPoolManager.getStats())
    }, 500)

    return () => clearInterval(interval)
  }, [])

  if (!isVisible || !stats) return null

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Worker Pool Activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {Object.entries(stats).map(([poolName, poolStats]: [string, any]) => (
          <div key={poolName} className="mb-3">
            <h4 className="text-xs font-medium">{poolName} Pool</h4>

            <div className="mt-1 h-6 bg-gray-100 rounded-full overflow-hidden">
              {/* Worker visualization */}
              <div className="flex h-full">
                {Array.from({ length: poolStats.totalWorkers }).map((_, i) => {
                  const isBusy = i < poolStats.busyWorkers
                  return (
                    <div
                      key={i}
                      className={`flex-1 ${isBusy ? "bg-green-500" : "bg-gray-200"} border-r border-white last:border-r-0`}
                      title={isBusy ? "Busy worker" : "Idle worker"}
                    />
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
              <div>
                <span className="font-medium">Active:</span> {poolStats.activeTasks}
              </div>
              <div>
                <span className="font-medium">Queued:</span> {poolStats.queuedTasks}
              </div>
              <div>
                <span className="font-medium">Completed:</span> {poolStats.completedTasks}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
