"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { enhanceImages } from "@/lib/image-processing"
import { detectMessagingAppType, getOptimizedProcessingParams } from "@/lib/aspect-ratio-detection"
import { fileToCanvas } from "@/lib/image-processing"
import { analyzeConversation } from "@/app/actions"
import AnalysisResults from "./analysis-results"
import LoadingAnalysis from "./loading-analysis"
import JSZip from "jszip"

export default function TestAnalysis() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState("")
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [processingLogs, setProcessingLogs] = useState<string[]>([])
  const [imageData, setImageData] = useState<{
    original: string[]
    enhanced: string[]
    metadata: any[]
  }>({
    original: [],
    enhanced: [],
    metadata: [],
  })

  const addLog = (message: string) => {
    setProcessingLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const testImages = [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot_20250515-215425.Messages-W4n3oIiIOAsbMQ0XD7sSEyTDtlahf3.png",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot_20250515-215503.Messages-bSEseQdaOzxCReqjzh41v0aC9jOGRP.png",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot_20250323-152643.Messages-ZXcRZFhCzkcYCVuv0P1UXbsHTIJR5P.png",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot_20250323-152638.Messages-3uA4LyxEgXuOY9AHIWYayXQjesHTw8.png",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot_20250323-152624.Messages-8TgHR4nYE7StxObdnYCjlUWEMZVUwz.png",
  ]

  const runAnalysis = async () => {
    if (isProcessing) return

    setIsProcessing(true)
    setProcessingLogs([])
    setAnalysisResults(null)
    setImageData({
      original: [],
      enhanced: [],
      metadata: [],
    })

    try {
      addLog("Starting analysis process")
      setProcessingStep("Downloading images")

      // Download the images
      const imageFiles = await Promise.all(
        testImages.map(async (url, index) => {
          addLog(`Downloading image ${index + 1}`)
          const response = await fetch(url)
          const blob = await response.blob()
          return new File([blob], `screenshot-${index + 1}.png`, { type: "image/png" })
        }),
      )

      // Store original images
      const originalUrls = imageFiles.map((file) => URL.createObjectURL(file))
      setImageData((prev) => ({
        ...prev,
        original: originalUrls,
      }))

      addLog("Images downloaded successfully")
      setProcessingStep("Detecting message app type")

      // Detect message app type for optimized processing
      const appTypeDetections = await Promise.all(
        imageFiles.map(async (file, index) => {
          const canvas = await fileToCanvas(file)
          const detection = await detectMessagingAppType(canvas)
          addLog(
            `Image ${index + 1} detected as ${detection.appType} (confidence: ${Math.round(detection.confidence * 100)}%)`,
          )
          return detection
        }),
      )

      // Get optimized processing parameters
      const processingParams = appTypeDetections.map((detection) => getOptimizedProcessingParams(detection.appType))

      addLog("Message app type detection complete")
      setProcessingStep("Enhancing images")

      // Enhance the images
      const enhancedFiles = await enhanceImages(imageFiles)
      const enhancedUrls = enhancedFiles.map((file) => URL.createObjectURL(file))

      setImageData((prev) => ({
        ...prev,
        enhanced: enhancedUrls,
        metadata: processingParams,
      }))

      addLog("Image enhancement complete")
      setProcessingStep("Analyzing conversation")

      // Create FormData with enhanced images
      const formData = new FormData()
      enhancedFiles.forEach((file, index) => {
        formData.append(`file-${index}`, file)
      })

      // Send to analysis
      const results = await analyzeConversation(formData)

      addLog("Analysis complete")
      setAnalysisResults(results)
    } catch (error) {
      console.error("Error in test analysis:", error)
      addLog(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsProcessing(false)
      setProcessingStep("")
    }
  }

  const downloadEnhancedImages = async () => {
    if (imageData.enhanced.length === 0) return

    try {
      const zip = new JSZip()

      // Convert each enhanced image URL to blob and add to ZIP
      for (let i = 0; i < imageData.enhanced.length; i++) {
        const response = await fetch(imageData.enhanced[i])
        const blob = await response.blob()
        zip.file(`enhanced-screenshot-${i + 1}.png`, blob)
      }

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" })

      // Create download link
      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `enhanced-screenshots-${new Date().toISOString().split("T")[0]}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      addLog("Enhanced images downloaded successfully")
    } catch (error) {
      console.error("Error downloading images:", error)
      addLog(`Error downloading images: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className="space-y-8">
      <Card className="p-6 border-gray-200 shadow-md">
        <h2 className="text-2xl font-bold text-rose-600 mb-4">Test Analysis with Sample Screenshots</h2>
        <p className="text-gray-700 mb-6">
          This test will process 5 conversation screenshots through our enhanced OCR pipeline and generate relationship
          insights.
        </p>

        <div className="flex gap-3">
          <Button onClick={runAnalysis} disabled={isProcessing} className="bg-rose-600 hover:bg-rose-700 text-white">
            {isProcessing ? `Processing: ${processingStep}` : "Run Test Analysis"}
          </Button>

          <Button
            onClick={downloadEnhancedImages}
            disabled={imageData.enhanced.length === 0}
            variant="outline"
            className="border-rose-600 text-rose-600 hover:bg-rose-50 bg-transparent"
          >
            Download Enhanced Images
          </Button>
        </div>
      </Card>

      {isProcessing && <LoadingAnalysis />}

      {processingLogs.length > 0 && (
        <Card className="p-6 border-gray-200 shadow-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Processing Log</h3>
          <div className="bg-gray-50 p-4 rounded-md h-60 overflow-y-auto font-mono text-sm">
            {processingLogs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
          </div>
        </Card>
      )}

      {imageData.original.length > 0 && (
        <Card className="p-6 border-gray-200 shadow-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Image Processing Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {imageData.original.map((originalUrl, index) => (
              <div key={index} className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Screenshot {index + 1}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Original</p>
                    <div className="h-48 border rounded bg-gray-100 overflow-hidden">
                      <img
                        src={originalUrl || "/placeholder.svg"}
                        alt={`Original screenshot ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Enhanced</p>
                    <div className="h-48 border rounded bg-gray-100 overflow-hidden">
                      {imageData.enhanced[index] ? (
                        <img
                          src={imageData.enhanced[index] || "/placeholder.svg"}
                          alt={`Enhanced screenshot ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">Processing...</div>
                      )}
                    </div>
                  </div>
                </div>
                {imageData.metadata[index] && (
                  <div className="mt-3 text-xs text-gray-600">
                    <p>Processing parameters:</p>
                    <ul className="list-disc pl-5 mt-1">
                      <li>Contrast: {imageData.metadata[index].contrastLevel}</li>
                      <li>Noise reduction: {imageData.metadata[index].noiseReduction}</li>
                      <li>Sharpness: {imageData.metadata[index].sharpness}</li>
                      <li>Binarize threshold: {imageData.metadata[index].binarizeThreshold}</li>
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {analysisResults && (
        <div>
          <Card className="p-6 border-gray-200 shadow-md mb-6">
            <h3 className="text-xl font-semibold text-rose-600 mb-4">OCR Text Extraction Results</h3>
            <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(analysisResults.extractedText, null, 2)}
              </pre>
            </div>
          </Card>

          <AnalysisResults results={analysisResults} />
        </div>
      )}
    </div>
  )
}
