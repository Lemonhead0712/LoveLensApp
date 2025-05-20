"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  createDebugVisualization,
  preprocessImage,
  type PreprocessingOptions,
  defaultOptions,
} from "@/lib/image-preprocessing"

interface OCRDebugViewerProps {
  imageFile: File
}

export function OCRDebugViewer({ imageFile }: OCRDebugViewerProps) {
  const [originalImage, setOriginalImage] = useState<string>("")
  const [processedImages, setProcessedImages] = useState<{ [key: string]: string }>({})
  const [selectedOption, setSelectedOption] = useState<string>("default")
  const [isProcessing, setIsProcessing] = useState(false)

  // Preprocessing options
  const options: { [key: string]: Partial<PreprocessingOptions> } = {
    default: defaultOptions,
    grayscale: {
      grayscale: true,
      normalize: false,
      threshold: false,
      adaptiveThreshold: false,
      sharpen: false,
      despeckle: false,
    },
    contrast: {
      grayscale: true,
      normalize: true,
      threshold: false,
      adaptiveThreshold: false,
      sharpen: false,
      despeckle: false,
    },
    threshold: {
      grayscale: true,
      normalize: true,
      threshold: true,
      thresholdValue: 128,
      adaptiveThreshold: false,
      sharpen: false,
      despeckle: false,
    },
    adaptive: {
      grayscale: true,
      normalize: true,
      threshold: false,
      adaptiveThreshold: true,
      sharpen: false,
      despeckle: false,
    },
    sharpen: {
      grayscale: true,
      normalize: true,
      threshold: false,
      adaptiveThreshold: false,
      sharpen: true,
      despeckle: false,
    },
    despeckle: {
      grayscale: true,
      normalize: true,
      threshold: false,
      adaptiveThreshold: false,
      sharpen: false,
      despeckle: true,
    },
    full: {
      grayscale: true,
      normalize: true,
      threshold: false,
      adaptiveThreshold: true,
      sharpen: true,
      despeckle: true,
    },
    invert: {
      grayscale: true,
      normalize: true,
      threshold: false,
      adaptiveThreshold: true,
      sharpen: true,
      despeckle: true,
      invert: true,
    },
  }

  // Load original image
  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setOriginalImage(e.target.result as string)
        }
      }
      reader.readAsDataURL(imageFile)
    }
  }, [imageFile])

  // Process image with selected option
  const processImage = async (optionKey: string) => {
    if (!originalImage) return

    setIsProcessing(true)
    try {
      const processed = await preprocessImage(originalImage, options[optionKey])
      setProcessedImages((prev) => ({ ...prev, [optionKey]: processed }))
    } catch (error) {
      console.error("Error processing image:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Process all options
  const processAllOptions = async () => {
    setIsProcessing(true)
    try {
      const results: { [key: string]: string } = {}
      for (const [key, option] of Object.entries(options)) {
        results[key] = await preprocessImage(originalImage, option)
      }
      setProcessedImages(results)
    } catch (error) {
      console.error("Error processing all options:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Create side-by-side comparison
  const createComparison = async () => {
    if (!originalImage || !selectedOption) return

    setIsProcessing(true)
    try {
      const comparison = await createDebugVisualization(originalImage, options[selectedOption])
      // Open in new tab
      const win = window.open()
      if (win) {
        win.document.write(`<img src="${comparison}" alt="Comparison" style="max-width: 100%;" />`)
      }
    } catch (error) {
      console.error("Error creating comparison:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>OCR Image Preprocessing Debug</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex space-x-4">
            <Button onClick={processAllOptions} disabled={!originalImage || isProcessing}>
              Process All Options
            </Button>
            <Button
              onClick={createComparison}
              disabled={!originalImage || isProcessing || !processedImages[selectedOption]}
            >
              Show Side-by-Side Comparison
            </Button>
          </div>

          <Tabs defaultValue="default" value={selectedOption} onValueChange={setSelectedOption}>
            <TabsList className="grid grid-cols-4 md:grid-cols-8">
              {Object.keys(options).map((key) => (
                <TabsTrigger key={key} value={key} onClick={() => !processedImages[key] && processImage(key)}>
                  {key}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.keys(options).map((key) => (
              <TabsContent key={key} value={key} className="mt-4">
                <div className="flex flex-col space-y-4">
                  <div className="text-sm font-medium">
                    {key === "default"
                      ? "Default preprocessing (grayscale + normalize + adaptive threshold)"
                      : key === "grayscale"
                        ? "Grayscale only"
                        : key === "contrast"
                          ? "Grayscale + contrast normalization"
                          : key === "threshold"
                            ? "Simple thresholding"
                            : key === "adaptive"
                              ? "Adaptive thresholding"
                              : key === "sharpen"
                                ? "Sharpening filter"
                                : key === "despeckle"
                                  ? "Noise reduction"
                                  : key === "full"
                                    ? "Full preprocessing pipeline"
                                    : "Inverted colors (for dark mode)"}
                  </div>

                  {!processedImages[key] ? (
                    <div className="flex justify-center p-4 border rounded">
                      <Button onClick={() => processImage(key)} disabled={isProcessing}>
                        {isProcessing ? "Processing..." : "Process Image"}
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Original</p>
                        <img
                          src={originalImage || "/placeholder.svg"}
                          alt="Original"
                          className="border rounded max-h-[400px] object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Processed</p>
                        <img
                          src={processedImages[key] || "/placeholder.svg"}
                          alt="Processed"
                          className="border rounded max-h-[400px] object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}
