"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { isDevelopment } from "@/lib/env-utils"

interface DebugModeToggleProps {
  onChange: (enabled: boolean) => void
  defaultEnabled?: boolean
}

export function DebugModeToggle({ onChange, defaultEnabled = false }: DebugModeToggleProps) {
  const [enabled, setEnabled] = useState(defaultEnabled)

  // Check if we should show the debug toggle
  const showDebugToggle = isDevelopment()

  useEffect(() => {
    // Check if debug mode was previously enabled
    const savedDebugMode = localStorage.getItem("debug_mode") === "true"
    if (savedDebugMode !== enabled) {
      setEnabled(savedDebugMode)
      onChange(savedDebugMode)
    }
  }, [enabled, onChange])

  const handleToggle = (checked: boolean) => {
    setEnabled(checked)
    onChange(checked)
    localStorage.setItem("debug_mode", checked.toString())
  }

  if (!showDebugToggle) return null

  return (
    <div className="flex items-center space-x-2 mt-4 p-2 bg-gray-50 border border-gray-200 rounded">
      <Switch id="debug-mode" checked={enabled} onCheckedChange={handleToggle} />
      <Label htmlFor="debug-mode" className="text-sm text-gray-700">
        Enable Debug Mode
      </Label>
      {enabled && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full ml-auto">Active</span>}
    </div>
  )
}
