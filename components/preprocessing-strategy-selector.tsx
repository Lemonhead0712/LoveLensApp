"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { PreprocessingStrategy } from "@/lib/workers/worker-pool-manager"

interface PreprocessingStrategySelectorProps {
  value: PreprocessingStrategy
  onChange: (value: PreprocessingStrategy) => void
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
}

export function PreprocessingStrategySelector({
  value,
  onChange,
  enabled,
  onEnabledChange,
}: PreprocessingStrategySelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch id="preprocessing-enabled" checked={enabled} onCheckedChange={onEnabledChange} />
        <Label htmlFor="preprocessing-enabled">Enable Image Preprocessing</Label>
      </div>

      {enabled && (
        <div className="mt-2">
          <Label className="mb-2 block">Preprocessing Strategy</Label>
          <RadioGroup
            value={value}
            onValueChange={(val) => onChange(val as PreprocessingStrategy)}
            className="grid grid-cols-2 gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="default" id="default" />
              <Label htmlFor="default">Default (Auto)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="text-optimized" id="text-optimized" />
              <Label htmlFor="text-optimized">Text Optimized</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="chat-bubbles" id="chat-bubbles" />
              <Label htmlFor="chat-bubbles">Chat Bubbles</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark-mode" id="dark-mode" />
              <Label htmlFor="dark-mode">Dark Mode</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light-mode" id="light-mode" />
              <Label htmlFor="light-mode">Light Mode</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high-contrast" id="high-contrast" />
              <Label htmlFor="high-contrast">High Contrast</Label>
            </div>
          </RadioGroup>
        </div>
      )}
    </div>
  )
}
