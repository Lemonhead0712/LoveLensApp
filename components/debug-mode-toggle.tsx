"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bug } from "lucide-react"

interface DebugModeToggleProps {
  onChange: (enabled: boolean) => void
  defaultEnabled?: boolean
}

export function DebugModeToggle({ onChange, defaultEnabled = false }: DebugModeToggleProps) {
  const [enabled, setEnabled] = useState(defaultEnabled)

  // Check if debug mode was previously enabled in localStorage
  useEffect(() => {
    const savedDebugMode = localStorage.getItem("ocrDebugMode")
    if (savedDebugMode) {
      const isEnabled = savedDebugMode === "true"
      setEnabled(isEnabled)
      onChange(isEnabled)
    }
  }, [onChange])

  const handleToggle = (checked: boolean) => {
    setEnabled(checked)
    onChange(checked)
    // Save preference to localStorage
    localStorage.setItem("ocrDebugMode", String(checked))
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch id="debug-mode" checked={enabled} onCheckedChange={handleToggle} />
      <Label htmlFor="debug-mode" className="flex items-center cursor-pointer">
        <Bug className="h-4 w-4 mr-1" />
        <span>Debug Mode</span>
      </Label>
    </div>
  )
}
