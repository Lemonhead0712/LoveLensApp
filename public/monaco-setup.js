// This file is loaded by a script tag in the HTML
// It configures Monaco Editor's worker setup
self.MonacoEnvironment = {
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
