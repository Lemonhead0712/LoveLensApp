"use client"

import { type ReactNode, useEffect } from "react"

interface MonacoProviderProps {
  children: ReactNode
}

export function MonacoProvider({ children }: MonacoProviderProps) {
  useEffect(() => {
    // Fallback configuration if the global one isn't set
    if (typeof window !== "undefined" && !window.MonacoEnvironment) {
      window.MonacoEnvironment = {
        getWorkerUrl: (_moduleId: string, label: string) => {
          if (label === "json") {
            return "/monaco-editor/json.worker.js"
          }
          if (label === "css" || label === "scss" || label === "less") {
            return "/monaco-editor/css.worker.js"
          }
          if (label === "html" || label === "handlebars" || label === "razor") {
            return "/monaco-editor/html.worker.js"
          }
          if (label === "typescript" || label === "javascript") {
            return "/monaco-editor/ts.worker.js"
          }
          return "/monaco-editor/editor.worker.js"
        },
      }
    }
  }, [])

  return (
    <div data-gramm="false" data-gramm_editor="false" data-enable-grammarly="false">
      {children}
    </div>
  )
}
