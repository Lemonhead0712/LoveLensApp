// This file provides Monaco Editor configuration
// It's used to configure the Monaco Editor workers

export function configureMonaco() {
  if (typeof window !== "undefined") {
    window.MonacoEnvironment = {
      getWorkerUrl: (_moduleId: string, label: string) => {
        if (label === "json") {
          return "/_next/static/monaco-editor/json.worker.js"
        }
        if (label === "css" || label === "scss" || label === "less") {
          return "/_next/static/monaco-editor/css.worker.js"
        }
        if (label === "html" || label === "handlebars" || label === "razor") {
          return "/_next/static/monaco-editor/html.worker.js"
        }
        if (label === "typescript" || label === "javascript") {
          return "/_next/static/monaco-editor/ts.worker.js"
        }
        return "/_next/static/monaco-editor/editor.worker.js"
      },
    }
  }
}
