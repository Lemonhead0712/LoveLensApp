"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card-override"
import { Button } from "@/components/ui/button-override"

interface OcrProcessingOptionsProps {
  onOptionSelected: (option: string) => void
}

export function OcrProcessingOptions({ onOptionSelected }: OcrProcessingOptionsProps) {
  const [selectedOption, setSelectedOption] = useState("default")

  const options = [
    { id: "default", label: "Default Processing" },
    { id: "highContrast", label: "High Contrast" },
    { id: "binarize", label: "Binarize (Black & White)" },
    { id: "sharpen", label: "Sharpen" },
    { id: "despeckle", label: "Despeckle (Remove Noise)" },
    { id: "normalize", label: "Normalize" },
    { id: "invert", label: "Invert Colors" },
  ]

  const handleOptionChange = (option: string) => {
    setSelectedOption(option)
  }

  const handleApply = () => {
    onOptionSelected(selectedOption)
  }

  return (
    <Card className="p-4 mt-4">
      <h3 className="font-medium text-lg mb-2">Advanced OCR Options</h3>
      <p className="text-sm text-gray-600 mb-3">
        If OCR is having trouble with your image, try different processing options:
      </p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {options.map((option) => (
          <div
            key={option.id}
            className={`
              border rounded-md p-2 cursor-pointer text-sm
              ${selectedOption === option.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}
            `}
            onClick={() => handleOptionChange(option.id)}
          >
            {option.label}
          </div>
        ))}
      </div>

      <Button onClick={handleApply} className="w-full">
        Apply Processing Option
      </Button>
    </Card>
  )
}
