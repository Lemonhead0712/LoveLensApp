/**
 * Utility functions to disable Grammarly on specific elements
 */

/**
 * Disables Grammarly on a specific DOM element
 */
export function disableGrammarlyOnElement(element: HTMLElement): void {
  if (!element) return

  element.setAttribute("data-gramm", "false")
  element.setAttribute("data-gramm_editor", "false")
  element.setAttribute("data-enable-grammarly", "false")
}

/**
 * Disables Grammarly on all elements matching a selector
 */
export function disableGrammarlyOnSelector(selector: string): void {
  if (typeof document === "undefined") return

  const elements = document.querySelectorAll(selector)
  elements.forEach((element) => {
    if (element instanceof HTMLElement) {
      disableGrammarlyOnElement(element)
    }
  })
}

/**
 * Disables Grammarly on Monaco Editor instances
 * Call this after Monaco Editor is mounted
 */
export function disableGrammarlyOnMonaco(): void {
  if (typeof document === "undefined") return

  // Target Monaco Editor's textarea elements
  disableGrammarlyOnSelector(".monaco-editor textarea")

  // Target Monaco Editor's content editable divs
  disableGrammarlyOnSelector('.monaco-editor [contenteditable="true"]')
}
