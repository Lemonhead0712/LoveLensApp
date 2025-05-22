"use client"

import { useState } from "react"
import { MonacoProvider } from "./monaco-provider"
import dynamic from "next/dynamic"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Dynamically import Monaco Editor
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md"></div>,
})

interface JsonViewerProps {
  data: any
  title?: string
  collapsible?: boolean
  initialCollapsed?: boolean
}

export function JsonViewer({
  data,
  title = "JSON Data",
  collapsible = true,
  initialCollapsed = false,
}: JsonViewerProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed)
  const jsonString = JSON.stringify(data, null, 2)

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          {collapsible && (
            <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? "Expand" : "Collapse"}
            </Button>
          )}
        </div>
      </CardHeader>
      {!collapsed && (
        <CardContent data-gramm="false" data-gramm_editor="false" data-enable-grammarly="false">
          <MonacoProvider>
            <MonacoEditor
              height="300px"
              language="json"
              value={jsonString}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                folding: true,
                lineNumbers: "on",
                wordWrap: "on",
                automaticLayout: true,
              }}
            />
          </MonacoProvider>
        </CardContent>
      )}
    </Card>
  )
}
