"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-override"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button-override"
import { Download, BarChart3, Clock, Cpu, Gauge } from "lucide-react"
import type { OCRMetrics } from "@/lib/ocr-metrics"

interface OCRPerformanceMetricsProps {
  metrics: OCRMetrics
  historicalMetrics?: OCRMetrics[]
  onExport?: () => void
}

export function OCRPerformanceMetrics({ metrics, historicalMetrics = [], onExport }: OCRPerformanceMetricsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Format time in ms with appropriate units
  const formatTime = (ms: number): string => {
    if (ms < 1) {
      return `${(ms * 1000).toFixed(2)}μs`
    }
    if (ms < 1000) {
      return `${ms.toFixed(2)}ms`
    }
    return `${(ms / 1000).toFixed(2)}s`
  }

  // Format number with appropriate units
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`
    }
    return num.toFixed(2)
  }

  // Get color based on performance score
  const getPerformanceColor = (score: number, isTime = false): string => {
    // For time metrics, lower is better
    if (isTime) {
      if (score < 100) return "text-green-500"
      if (score < 500) return "text-yellow-500"
      return "text-red-500"
    }

    // For other metrics, higher is better
    if (score >= 80) return "text-green-500"
    if (score >= 50) return "text-yellow-500"
    return "text-red-500"
  }

  // Calculate total processing time
  const totalProcessingTime = metrics.timings.find((t) => t.name === "total")?.duration || 0

  // Find the longest timing operation
  const longestOperation = [...metrics.timings].sort((a, b) => b.duration - a.duration)[0]

  // Calculate timing percentages for visualization
  const timingPercentages = metrics.timings.map((timing) => ({
    ...timing,
    percentage: (timing.duration / totalProcessingTime) * 100,
  }))

  return (
    <Card className="w-full shadow-md border-pink-100">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl text-pink-700">OCR Performance Metrics</CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                metrics.overallConfidence >= 80
                  ? "success"
                  : metrics.overallConfidence >= 50
                    ? "warning"
                    : "destructive"
              }
            >
              {metrics.overallConfidence.toFixed(1)}% Confidence
            </Badge>
            <Badge variant="outline">{formatTime(totalProcessingTime)}</Badge>
            {onExport && (
              <Button size="sm" variant="outline" onClick={onExport}>
                <Download className="h-4 w-4 mr-1" />
                Export Metrics
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview">
              <Gauge className="h-4 w-4 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="timing">
              <Clock className="h-4 w-4 mr-1" />
              Timing
            </TabsTrigger>
            <TabsTrigger value="accuracy">
              <BarChart3 className="h-4 w-4 mr-1" />
              Accuracy
            </TabsTrigger>
            <TabsTrigger value="resources">
              <Cpu className="h-4 w-4 mr-1" />
              Resources
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Key Performance Indicators */}
              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Processing Speed</h3>
                <div className="flex items-baseline">
                  <span className={`text-2xl font-bold ${getPerformanceColor(metrics.recognizedCharactersPerSecond)}`}>
                    {formatNumber(metrics.recognizedCharactersPerSecond)}
                  </span>
                  <span className="ml-1 text-gray-500 text-sm">chars/sec</span>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {metrics.recognizedCharactersPerSecond > 1000
                    ? "Excellent processing speed"
                    : metrics.recognizedCharactersPerSecond > 500
                      ? "Good processing speed"
                      : "Processing speed could be improved"}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Overall Confidence</h3>
                <div className="flex items-baseline">
                  <span className={`text-2xl font-bold ${getPerformanceColor(metrics.overallConfidence)}`}>
                    {metrics.overallConfidence.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {metrics.overallConfidence > 80
                    ? "High confidence in OCR results"
                    : metrics.overallConfidence > 50
                      ? "Moderate confidence in OCR results"
                      : "Low confidence, results may be unreliable"}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Extraction Results</h3>
                <div className="flex items-baseline">
                  <span className={`text-2xl font-bold ${getPerformanceColor(metrics.extractedMessageCount * 10)}`}>
                    {metrics.extractedMessageCount}
                  </span>
                  <span className="ml-1 text-gray-500 text-sm">messages</span>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {metrics.extractedWordCount} words, {metrics.extractedTextLength} characters extracted
                </div>
              </div>

              {/* Image Information */}
              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Image Information</h3>
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dimensions:</span>
                    <span className="font-medium">
                      {metrics.imageInfo.width} × {metrics.imageInfo.height}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-600">File size:</span>
                    <span className="font-medium">{(metrics.imageInfo.fileSize / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-600">Format:</span>
                    <span className="font-medium">{metrics.imageInfo.format.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Processing Efficiency</h3>
                <div className="flex items-baseline">
                  <span
                    className={`text-2xl font-bold ${getPerformanceColor(1 / metrics.processingTimePerPixel, true)}`}
                  >
                    {formatTime(metrics.processingTimePerPixel * 1000000)}
                  </span>
                  <span className="ml-1 text-gray-500 text-sm">per pixel</span>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {metrics.processingTimePerPixel < 0.0001
                    ? "Very efficient processing"
                    : metrics.processingTimePerPixel < 0.001
                      ? "Good processing efficiency"
                      : "Processing efficiency could be improved"}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Preprocessing Option</h3>
                <div className="flex items-baseline">
                  <span className="text-lg font-medium">{metrics.preprocessingOption}</span>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {metrics.successRate >= 0.8
                    ? "This preprocessing option worked well"
                    : metrics.successRate >= 0.5
                      ? "This preprocessing option was moderately effective"
                      : "Consider trying a different preprocessing option"}
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="mt-4 bg-white rounded-lg p-4 border shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Performance Summary</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-32 text-sm text-gray-600">Total time:</div>
                  <div className="font-medium">{formatTime(totalProcessingTime)}</div>
                </div>
                <div className="flex items-center">
                  <div className="w-32 text-sm text-gray-600">Bottleneck:</div>
                  <div className="font-medium">
                    {longestOperation?.name || "None"} ({formatTime(longestOperation?.duration || 0)})
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-32 text-sm text-gray-600">Success rate:</div>
                  <div className="font-medium">{(metrics.successRate * 100).toFixed(1)}%</div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Timing Tab */}
          <TabsContent value="timing" className="mt-4">
            <div className="bg-white rounded-lg p-4 border shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Processing Time Breakdown</h3>
              <div className="space-y-3">
                {timingPercentages.map((timing, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">{timing.name}</span>
                      <span className="font-medium">{formatTime(timing.duration)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full bg-pink-500" style={{ width: `${timing.percentage}%` }}></div>
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      {timing.percentage.toFixed(1)}% of total time
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timing Metrics Table */}
            <div className="mt-4 bg-white rounded-lg p-4 border shadow-sm overflow-x-auto">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Detailed Timing Metrics</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Operation
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Time
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Time
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      % of Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {metrics.timings.map((timing, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="px-4 py-2 text-sm text-gray-900">{timing.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{formatTime(timing.startTime)}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{formatTime(timing.endTime)}</td>
                      <td className="px-4 py-2 text-sm font-medium">{formatTime(timing.duration)}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {((timing.duration / totalProcessingTime) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Accuracy Tab */}
          <TabsContent value="accuracy" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Confidence by Stage</h3>
                <div className="space-y-3">
                  {metrics.accuracy.map((accuracy, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">{accuracy.name}</span>
                        <span className={`font-medium ${getPerformanceColor(accuracy.confidence)}`}>
                          {accuracy.confidence.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            accuracy.confidence >= 80
                              ? "bg-green-500"
                              : accuracy.confidence >= 50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${accuracy.confidence}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {accuracy.wordCount} words, {accuracy.characterCount} characters
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Extraction Statistics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-700 mb-1">Character Recognition Rate</div>
                    <div className="flex items-baseline">
                      <span
                        className={`text-2xl font-bold ${getPerformanceColor(metrics.recognizedCharactersPerSecond)}`}
                      >
                        {formatNumber(metrics.recognizedCharactersPerSecond)}
                      </span>
                      <span className="ml-1 text-gray-500 text-sm">chars/sec</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-700 mb-1">Text Extraction</div>
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">Characters: {metrics.extractedTextLength}</div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-blue-500"
                            style={{ width: `${Math.min(100, metrics.extractedTextLength / 10)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center mt-2">
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">Words: {metrics.extractedWordCount}</div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-green-500"
                            style={{ width: `${Math.min(100, metrics.extractedWordCount / 2)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center mt-2">
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">Messages: {metrics.extractedMessageCount}</div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-pink-500"
                            style={{ width: `${Math.min(100, metrics.extractedMessageCount * 10)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Rate */}
            <div className="mt-4 bg-white rounded-lg p-4 border shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Overall Success Rate</h3>
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        metrics.successRate >= 0.8
                          ? "bg-green-500"
                          : metrics.successRate >= 0.5
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${metrics.successRate * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4">
                  <span
                    className={`text-2xl font-bold ${
                      metrics.successRate >= 0.8
                        ? "text-green-500"
                        : metrics.successRate >= 0.5
                          ? "text-yellow-500"
                          : "text-red-500"
                    }`}
                  >
                    {(metrics.successRate * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {metrics.successRate >= 0.8
                  ? "Excellent OCR performance"
                  : metrics.successRate >= 0.5
                    ? "Acceptable OCR performance, but could be improved"
                    : "Poor OCR performance, consider using different preprocessing options or improving image quality"}
              </div>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Processing Efficiency</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-700 mb-1">Time per Pixel</div>
                    <div className="flex items-baseline">
                      <span
                        className={`text-2xl font-bold ${getPerformanceColor(1 / metrics.processingTimePerPixel, true)}`}
                      >
                        {formatTime(metrics.processingTimePerPixel * 1000000)}
                      </span>
                      <span className="ml-1 text-gray-500 text-sm">per pixel</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Total pixels: {metrics.imageInfo.width * metrics.imageInfo.height}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-700 mb-1">Processing Time vs. Image Size</div>
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">
                          {formatTime(totalProcessingTime)} for {(metrics.imageInfo.fileSize / 1024).toFixed(1)} KB
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-blue-500"
                            style={{
                              width: `${Math.min(100, (totalProcessingTime / metrics.imageInfo.fileSize) * 10000)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Resource Usage</h3>
                <div className="space-y-3">
                  {metrics.resources.map((resource, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">{resource.name}</span>
                        <span className="font-medium">
                          {resource.memoryUsage ? `${(resource.memoryUsage / (1024 * 1024)).toFixed(1)} MB` : "N/A"}
                        </span>
                      </div>
                      {resource.memoryUsage && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-purple-500"
                            style={{ width: `${Math.min(100, (resource.memoryUsage / (50 * 1024 * 1024)) * 100)}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Preprocessing Comparison */}
            {historicalMetrics && historicalMetrics.length > 0 && (
              <div className="mt-4 bg-white rounded-lg p-4 border shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Preprocessing Option Comparison</h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Option
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg. Confidence
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg. Processing Time
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Success Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(
                      historicalMetrics.reduce(
                        (acc, metric) => {
                          if (!acc[metric.preprocessingOption]) {
                            acc[metric.preprocessingOption] = {
                              confidence: [],
                              time: [],
                              success: [],
                            }
                          }
                          acc[metric.preprocessingOption].confidence.push(metric.overallConfidence)
                          const totalTime = metric.timings.find((t) => t.name === "total")?.duration || 0
                          acc[metric.preprocessingOption].time.push(totalTime)
                          acc[metric.preprocessingOption].success.push(metric.successRate)
                          return acc
                        },
                        {} as Record<string, { confidence: number[]; time: number[]; success: number[] }>,
                      ),
                    ).map(([option, data], index) => {
                      const avgConfidence = data.confidence.reduce((sum, val) => sum + val, 0) / data.confidence.length
                      const avgTime = data.time.reduce((sum, val) => sum + val, 0) / data.time.length
                      const avgSuccess = data.success.reduce((sum, val) => sum + val, 0) / data.success.length

                      return (
                        <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                          <td className="px-4 py-2 text-sm text-gray-900">{option}</td>
                          <td className="px-4 py-2 text-sm">
                            <span className={getPerformanceColor(avgConfidence)}>{avgConfidence.toFixed(1)}%</span>
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <span className={getPerformanceColor(1000 / avgTime, true)}>{formatTime(avgTime)}</span>
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <span className={getPerformanceColor(avgSuccess * 100)}>
                              {(avgSuccess * 100).toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
