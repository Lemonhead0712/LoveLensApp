// Create a new debug component to help diagnose data issues
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button-override"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-override"

interface DebugDataViewerProps {
  data: any
  title?: string
  initialCollapsed?: boolean
}

export default function DebugDataViewer({
  data,
  title = "Debug Data Viewer",
  initialCollapsed = true,
}: DebugDataViewerProps) {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed)
  const [expandedPaths, setExpandedPaths] = useState<string[]>([])

  const togglePath = (path: string) => {
    if (expandedPaths.includes(path)) {
      setExpandedPaths(expandedPaths.filter((p) => p !== path))
    } else {
      setExpandedPaths([...expandedPaths, path])
    }
  }

  const renderValue = (value: any, path = "") => {
    if (value === null) return <span className="text-gray-500">null</span>
    if (value === undefined) return <span className="text-gray-500">undefined</span>

    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-gray-500">[]</span>

      const isExpanded = expandedPaths.includes(path)

      return (
        <div>
          <button onClick={() => togglePath(path)} className="text-blue-500 hover:underline">
            {isExpanded ? "[-]" : "[+]"} Array({value.length})
          </button>

          {isExpanded && (
            <div className="pl-4 border-l border-gray-300 mt-1">
              {value.slice(0, 5).map((item, i) => (
                <div key={i} className="mt-1">
                  <span className="text-gray-500">{i}: </span>
                  {renderValue(item, `${path}.${i}`)}
                </div>
              ))}
              {value.length > 5 && <div className="text-gray-500 mt-1">...{value.length - 5} more items</div>}
            </div>
          )}
        </div>
      )
    }

    if (typeof value === "object") {
      const keys = Object.keys(value)
      if (keys.length === 0) return <span className="text-gray-500">{"{}"}</span>

      const isExpanded = expandedPaths.includes(path)

      return (
        <div>
          <button onClick={() => togglePath(path)} className="text-blue-500 hover:underline">
            {isExpanded ? "{-}" : "{+}"} Object({keys.length} props)
          </button>

          {isExpanded && (
            <div className="pl-4 border-l border-gray-300 mt-1">
              {keys.map((key) => (
                <div key={key} className="mt-1">
                  <span className="font-medium">{key}: </span>
                  {renderValue(value[key], `${path}.${key}`)}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (typeof value === "string") {
      return <span className="text-green-600">"{value}"</span>
    }

    if (typeof value === "number") {
      return <span className="text-blue-600">{value}</span>
    }

    if (typeof value === "boolean") {
      return <span className="text-purple-600">{value.toString()}</span>
    }

    return <span>{String(value)}</span>
  }

  return (
    <Card className="mt-4 bg-gray-50 border-dashed border-gray-300">
      <CardHeader className="py-2 px-4 flex flex-row items-center justify-between bg-gray-100">
        <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="h-8 px-2 text-xs">
          {isCollapsed ? "Show" : "Hide"}
        </Button>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="p-4 text-xs font-mono overflow-auto max-h-96">{renderValue(data, "root")}</CardContent>
      )}
    </Card>
  )
}
