"use client"

import { type ReactNode, useEffect } from "react"

interface MonacoProviderProps {
  children: ReactNode
}

export function MonacoProvider({ children }: MonacoProviderProps) {
  useEffect(() => {
    // Ensure MonacoEnvironment is configured
    if (typeof window !== "undefined" && !window.MonacoEnvironment) {
      window.MonacoEnvironment = {
        getWorkerUrl: (moduleId, label) => {
          if (label === "json") {
            return "./json.worker.bundle.js"
          }
          if (label === "css" || label === "scss" || label === "less") {
            return "./css.worker.bundle.js"
          }
          if (label === "html" || label === "handlebars" || label === "razor") {
            return "./html.worker.bundle.js"
          }
          if (label === "typescript" || label === "javascript") {
            return "./ts.worker.bundle.js"
          }
          return "./editor.worker.bundle.js"
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
