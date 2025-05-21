"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import workerPoolManager, { type PreprocessingStrategy } from "@/lib/workers/worker-pool-manager"

interface OCRDebugViewerProps {
  imageFile: File
  preprocessingEnabled?: boolean
  preprocessingStrategy?: PreprocessingStrategy
}

export function OCRDebugViewer({
  imageFile,
  preprocessingEnabled = true,
  preprocessingStrategy = "default",
}: OCRDebugViewerProps) {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [preprocessedImage, setPreprocessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingTime, setProcessingTime] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("original")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load the original image
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setOriginalImage(e.target.result as string)
      }
    }
    reader.readAsDataURL(imageFile)

    // Reset state when file changes
    setPreprocessedImage(null)
    setProcessingTime(null)
    setError(null)
  }, [imageFile])

  const handlePreprocess = async () => {
    if (!originalImage) return

    setIsProcessing(true)
    setError(null)

    try {
      const startTime = performance.now()

      // Use the worker pool manager to preprocess the image
      const result = await workerPoolManager.preprocessImage(originalImage, preprocessingStrategy, {}, (progress) => {
        // Progress updates if needed
      })

      const endTime = performance.now()
      setProcessingTime(endTime - startTime)
      setPreprocessedImage(result)
      setActiveTab("preprocessed")
    } catch (err) {
      console.error("Error preprocessing image:", err)
      setError(err instanceof Error ? err.message : "Unknown error preprocessing image")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">OCR Debug Viewer</CardTitle>
        <CardDescription>Examine image preprocessing and OCR results</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium">File: {imageFile.name}</h3>
              <p className="text-xs text-muted-foreground">
                {imageFile.type} • {Math.round(imageFile.size / 1024)} KB
              </p>
            </div>
            <Button size="sm" onClick={handlePreprocess} disabled={isProcessing || !originalImage}>
              {isProcessing ? "Processing..." : "Preprocess Image"}
            </Button>
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">{error}</div>}

          {processingTime !== null && (
            <div className="text-xs text-muted-foreground">Processing time: {processingTime.toFixed(2)} ms</div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="original">Original</TabsTrigger>
              <TabsTrigger value="preprocessed" disabled={!preprocessedImage}>
                Preprocessed
              </TabsTrigger>
            </TabsList>
            <TabsContent value="original" className="pt-4">
              {originalImage && (
                <div className="border rounded-md overflow-hidden">
                  <img
                    src={originalImage || "/placeholder.svg"}
                    alt="Original"
                    className="w-full h-auto max-h-[400px] object-contain"
                  />
                </div>
              )}
            </TabsContent>
            <TabsContent value="preprocessed" className="pt-4">
              {preprocessedImage ? (
                <div className="border rounded-md overflow-hidden">
                  <img
                    src={preprocessedImage || "/placeholder.svg"}
                    alt="Preprocessed"
                    className="w-full h-auto max-h-[400px] object-contain"
                  />
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  Click "Preprocess Image" to see the preprocessed version
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}
