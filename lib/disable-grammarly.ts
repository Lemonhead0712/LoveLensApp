"use client"

import React from "react"

/**
 * Utility to disable Grammarly on specific elements
 */
export function disableGrammarly(element: HTMLElement | null) {
  if (!element) return

  // Add attributes to disable Grammarly
  element.setAttribute("data-gramm", "false")
  element.setAttribute("data-gramm_editor", "false")
  element.setAttribute("data-enable-grammarly", "false")

  // Add inline style to prevent Grammarly icons
  element.style.setProperty("--grammarly-shadow-root", "none")
}

/**
 * React hook to disable Grammarly on a ref
 */
export function useDisableGrammarly(ref: React.RefObject<HTMLElement>) {
  React.useEffect(() => {
    disableGrammarly(ref.current)
  }, [ref])
}
