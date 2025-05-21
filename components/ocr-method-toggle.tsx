"use client"

import { useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { isDevelopment } from "@/lib/env-utils"

interface OcrMethodToggleProps {
  onChange: (method: "auto" | "primary" | "fallback") => void
  defaultMethod?: "auto" | "primary" | "fallback"
}

export function OcrMethodToggle({ onChange, defaultMethod = "auto" }: OcrMethodToggleProps) {
  const [method, setMethod] = useState<"auto" | "primary" | "fallback">(defaultMethod)

  // Only show in development mode
  if (!isDevelopment()) {
    return null
  }

  const handleChange = (value: string) => {
    const newMethod = value as "auto" | "primary" | "fallback"
    setMethod(newMethod)
    onChange(newMethod)
    localStorage.setItem("ocr_method", newMethod)
  }

  return (
    <div className="p-3 border border-gray-200 rounded-md bg-gray-50 mt-4">
      <h3 className="text-sm font-medium mb-2">OCR Method</h3>
      <RadioGroup value={method} onValueChange={handleChange} className="space-y-1">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="auto" id="ocr-auto" />
          <Label htmlFor="ocr-auto" className="text-sm">
            Auto (Try primary, fall back if needed)
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="primary" id="ocr-primary" />
          <Label htmlFor="ocr-primary" className="text-sm">
            Primary OCR only
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="fallback" id="ocr-fallback" />
          <Label htmlFor="ocr-fallback" className="text-sm">
            Fallback OCR only
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
}
