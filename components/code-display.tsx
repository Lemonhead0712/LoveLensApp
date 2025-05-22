"use client"

import { useEffect, useState } from "react"
import { MonacoProvider } from "./monaco-provider"
import dynamic from "next/dynamic"

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md"></div>,
})

interface CodeDisplayProps {
  code: string
  language?: string
  readOnly?: boolean
  height?: string
  onChange?: (value: string | undefined) => void
}

export function CodeDisplay({
  code,
  language = "json",
  readOnly = true,
  height = "300px",
  onChange,
}: CodeDisplayProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md"></div>
  }

  return (
    <MonacoProvider>
      <div
        className="border rounded-md overflow-hidden"
        data-gramm="false"
        data-gramm_editor="false"
        data-enable-grammarly="false"
      >
        <MonacoEditor
          height={height}
          language={language}
          value={code}
          options={{
            readOnly,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            folding: true,
            lineNumbers: "on",
            wordWrap: "on",
            automaticLayout: true,
          }}
          onChange={onChange}
        />
      </div>
    </MonacoProvider>
  )
}
