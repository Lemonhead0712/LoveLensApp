"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import {
  enhanceContrast,
  sharpenImage,
  reduceNoise,
  binarizeImage,
  fileToCanvas,
  canvasToFile,
  deskewImage,
  normalizeResolution,
} from "@/lib/image-processing"

interface ImageEnhancementPreviewProps {
  file: File
  onEnhanced: (enhancedFile: File) => void
  onCancel: () => void
}

export default function ImageEnhancementPreview({ file, onEnhanced, onCancel }: ImageEnhancementPreviewProps) {
  const [originalUrl, setOriginalUrl] = useState<string>("")
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  const [settings, setSettings] = useState({
    contrast: 1.5,
    sharpness: 0.3,
    noise: 1,
    binarize: false,
    deskew: true,
    adaptiveThreshold: true,
    normalizeResolution: true,
  })
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setOriginalUrl(url)
    setPreviewUrl(url)

    // Load image into canvas
    const loadCanvas = async () => {
      try {
        const canvas = await fileToCanvas(file)
        setCanvas(canvas)
      } catch (error) {
        console.error("Failed to load image into canvas:", error)
      }
    }

    loadCanvas()

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])

  const applyEnhancements = async () => {
    if (!canvas) return

    setProcessing(true)

    try {
      // Create a copy of the original canvas
      const enhancedCanvas = document.createElement("canvas")
      enhancedCanvas.width = canvas.width
      enhancedCanvas.height = canvas.height
      const ctx = enhancedCanvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(canvas, 0, 0)
      }

      // Apply enhancements in sequence based on settings
      let processedCanvas = enhancedCanvas

      if (settings.normalizeResolution) {
        processedCanvas = normalizeResolution(processedCanvas)
      }

      if (settings.deskew) {
        processedCanvas = deskewImage(processedCanvas)
      }

      processedCanvas = reduceNoise(processedCanvas, settings.noise)
      processedCanvas = enhanceContrast(processedCanvas, settings.contrast)
      processedCanvas = sharpenImage(processedCanvas, settings.sharpness)

      if (settings.binarize) {
        if (settings.adaptiveThreshold) {
          processedCanvas = binarizeImage(processedCanvas, -1) // Adaptive threshold
        } else {
          processedCanvas = binarizeImage(processedCanvas, 128) // Fixed threshold
        }
      }

      // Update preview
      const newUrl = processedCanvas.toDataURL("image/jpeg")
      setPreviewUrl(newUrl)

      // Convert back to file
      const enhancedFile = await canvasToFile(
        processedCanvas,
        `${file.name.split(".")[0]}_enhanced.jpg`,
        "image/jpeg",
        0.9,
      )

      onEnhanced(enhancedFile)
    } catch (error) {
      console.error("Enhancement failed:", error)
    } finally {
      setProcessing(false)
    }
  }

  const handleSettingChange = (setting: keyof typeof settings, value: number | boolean) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }))
  }

  return (
    <Card className="p-6 border-gray-200 shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-gray-900">Image Enhancement</h3>
      <p className="text-gray-600 mb-4">
        Enhance your screenshot to improve text extraction accuracy. Adjust the settings and preview the results.
      </p>

      <Tabs defaultValue="preview" className="w-full mb-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="pt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-sm mb-2 text-gray-700">Original</p>
              <div className="border border-gray-200 rounded-md overflow-hidden bg-gray-50 h-64 flex items-center justify-center">
                {originalUrl && (
                  <img
                    src={originalUrl || "/placeholder.svg"}
                    alt="Original screenshot"
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </div>
            </div>
            <div>
              <p className="font-medium text-sm mb-2 text-gray-700">Enhanced</p>
              <div className="border border-gray-200 rounded-md overflow-hidden bg-gray-50 h-64 flex items-center justify-center">
                {previewUrl && (
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Enhanced screenshot"
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 pt-4">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Contrast</label>
              <span className="text-sm text-gray-500">{settings.contrast.toFixed(1)}</span>
            </div>
            <Slider
              value={[settings.contrast]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(value) => handleSettingChange("contrast", value[0])}
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Sharpness</label>
              <span className="text-sm text-gray-500">{settings.sharpness.toFixed(1)}</span>
            </div>
            <Slider
              value={[settings.sharpness]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={(value) => handleSettingChange("sharpness", value[0])}
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Noise Reduction</label>
              <span className="text-sm text-gray-500">{settings.noise.toFixed(1)}</span>
            </div>
            <Slider
              value={[settings.noise]}
              min={0}
              max={2}
              step={0.1}
              onValueChange={(value) => handleSettingChange("noise", value[0])}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="binarize"
              checked={settings.binarize}
              onChange={(e) => handleSettingChange("binarize", e.target.checked)}
              className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
            />
            <label htmlFor="binarize" className="text-sm font-medium text-gray-700">
              Binarize (black & white for text extraction)
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="deskew"
              checked={settings.deskew}
              onChange={(e) => handleSettingChange("deskew", e.target.checked)}
              className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
            />
            <label htmlFor="deskew" className="text-sm font-medium text-gray-700">
              Auto-correct skewed text
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="normalizeResolution"
              checked={settings.normalizeResolution}
              onChange={(e) => handleSettingChange("normalizeResolution", e.target.checked)}
              className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
            />
            <label htmlFor="normalizeResolution" className="text-sm font-medium text-gray-700">
              Normalize image resolution
            </label>
          </div>

          <div className="flex items-center space-x-2 mt-2">
            <input
              type="checkbox"
              id="adaptiveThreshold"
              checked={settings.adaptiveThreshold}
              onChange={(e) => handleSettingChange("adaptiveThreshold", e.target.checked)}
              disabled={!settings.binarize}
              className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
            />
            <label htmlFor="adaptiveThreshold" className="text-sm font-medium text-gray-700">
              Use adaptive thresholding (better for uneven lighting)
            </label>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-3 mt-4">
        <Button variant="outline" onClick={onCancel} disabled={processing}>
          Cancel
        </Button>
        <Button className="bg-rose-600 hover:bg-rose-700 text-white" onClick={applyEnhancements} disabled={processing}>
          {processing ? "Processing..." : "Apply Enhancements"}
        </Button>
      </div>
    </Card>
  )
}
