"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  const [activeTab, setActiveTab] = useState<string>("basic")

  const handleStrategyChange = (newValue: string) => {
    onChange(newValue as PreprocessingStrategy)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Image Preprocessing</CardTitle>
            <CardDescription>Optimize images before OCR processing</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="preprocessing-enabled" checked={enabled} onCheckedChange={onEnabledChange} />
            <Label htmlFor="preprocessing-enabled">Enabled</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {enabled && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="pt-4">
              <RadioGroup value={value} onValueChange={handleStrategyChange}>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="default" id="default" />
                    <Label htmlFor="default" className="font-normal">
                      Auto (Recommended)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="textOptimized" id="textOptimized" />
                    <Label htmlFor="textOptimized" className="font-normal">
                      Text Optimized
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="chatBubbles" id="chatBubbles" />
                    <Label htmlFor="chatBubbles" className="font-normal">
                      Chat Bubbles
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="darkMode" id="darkMode" />
                    <Label htmlFor="darkMode" className="font-normal">
                      Dark Mode
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lightMode" id="lightMode" />
                    <Label htmlFor="lightMode" className="font-normal">
                      Light Mode
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </TabsContent>
            <TabsContent value="advanced" className="pt-4">
              <RadioGroup value={value} onValueChange={handleStrategyChange}>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="highContrast" id="highContrast" />
                    <Label htmlFor="highContrast" className="font-normal">
                      High Contrast
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="binarize" id="binarize" />
                    <Label htmlFor="binarize" className="font-normal">
                      Binarize
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sharpen" id="sharpen" />
                    <Label htmlFor="sharpen" className="font-normal">
                      Sharpen
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="despeckle" id="despeckle" />
                    <Label htmlFor="despeckle" className="font-normal">
                      Despeckle
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normalize" id="normalize" />
                    <Label htmlFor="normalize" className="font-normal">
                      Normalize
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="invert" id="invert" />
                    <Label htmlFor="invert" className="font-normal">
                      Invert
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </TabsContent>
          </Tabs>
        )}
        {!enabled && (
          <div className="text-sm text-muted-foreground">
            Enable preprocessing to improve OCR accuracy for different types of screenshots.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
