"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { analyzeScreenshots } from "@/lib/analyze-screenshots"
import { storeAnalysisResult } from "@/lib/storage-utils"
import { extractTextFromImage, validateExtractedMessages } from "@/lib/ocr-service"
import type { AnalysisResult, Message } from "@/lib/types"
import { LoadingScreen } from "./loading-screen"
import { OCRDebugViewer } from "./ocr-debug-viewer"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Error types for better error handling
type ErrorType = "api_key_missing" | "upload_failed" | "analysis_failed" | "ocr_failed" | "storage_failed" | "unknown"

// Error interface
interface ErrorDetails {
  type: ErrorType
  message: string
  recoverable: boolean
  action?: string
}

function UploadForm() {
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>("Preparing...")
  const [debugMode, setDebugMode] = useState(false)
  const [selectedDebugFile, setSelectedDebugFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files))
      setError(null) // Clear any previous errors

      // Set the first file as the debug file
      if (debugMode && e.target.files.length > 0) {
        setSelectedDebugFile(e.target.files[0])
      }
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files))
      setError(null) // Clear any previous errors

      // Set the first file as the debug file
      if (debugMode && e.dataTransfer.files.length > 0) {
        setSelectedDebugFile(e.dataTransfer.files[0])
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDebugModeChange = (checked: boolean) => {
    setDebugMode(checked)
    if (checked && files.length > 0) {
      setSelectedDebugFile(files[0])
    } else {
      setSelectedDebugFile(null)
    }
  }

  const handleSelectDebugFile = (file: File) => {
    setSelectedDebugFile(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (files.length === 0) {
      setError({
        type: "upload_failed",
        message: "Please select at least one screenshot to analyze.",
        recoverable: true,
      })
      return
    }

    setIsLoading(true)
    setProgress(5)
    setStatusMessage("Preparing files...")

    try {
      // Convert files to base64
      const filePromises = files.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = () => reject(new Error("Failed to read file"))
          reader.readAsDataURL(file)
        })
      })

      setProgress(10)
      const base64Files = await Promise.all(filePromises)

      // Check if OpenAI API key is available
      const apiKey = localStorage.getItem("openai_api_key")
      if (!apiKey) {
        setError({
          type: "api_key_missing",
          message: "OpenAI API key is missing. Please add your API key in the settings.",
          recoverable: true,
          action: "Add API Key",
        })
        setIsLoading(false)
        return
      }

      // Process each image with OCR
      setStatusMessage("Extracting text from images...")
      const messagesPromises = base64Files.map((base64File, index) => {
        return extractTextFromImage(base64File, (ocrProgress) => {
          // Calculate overall progress (10-70% range for OCR)
          const fileWeight = 60 / base64Files.length
          const overallProgress = 10 + index * fileWeight + (ocrProgress * fileWeight) / 100
          setProgress(Math.round(overallProgress))
        })
      })

      try {
        const extractedMessagesArrays = await Promise.all(messagesPromises)

        // Combine and deduplicate messages from all images
        let allMessages: Message[] = []
        extractedMessagesArrays.forEach((messages) => {
          allMessages = [...allMessages, ...messages]
        })

        // Validate extracted messages
        if (!validateExtractedMessages(allMessages)) {
          throw new Error("OCR_FAILED")
        }

        setProgress(70)
        setStatusMessage("Analyzing conversation...")

        // Analyze screenshots
        let analysisResult: AnalysisResult
        try {
          // Pass the extracted messages directly to the analysis function
          analysisResult = await analyzeScreenshots(base64Files, allMessages)
          setProgress(90)
          setStatusMessage("Saving results...")
        } catch (analysisError) {
          console.error("Analysis error:", analysisError)
          throw new Error("ANALYSIS_FAILED")
        }

        // Store analysis result
        try {
          await storeAnalysisResult(analysisResult)
          setProgress(100)
          setStatusMessage("Complete!")
        } catch (storageError) {
          throw new Error("STORAGE_FAILED")
        }

        // Navigate to results page
        router.push("/results")
      } catch (ocrError) {
        console.error("OCR error:", ocrError)
        throw new Error("OCR_FAILED")
      }
    } catch (error) {
      console.error("Error processing screenshots:", error)

      // Handle different error types
      let errorDetails: ErrorDetails = {
        type: "unknown",
        message: "An unexpected error occurred. Please try again.",
        recoverable: true,
      }

      if (error instanceof Error) {
        switch (error.message) {
          case "OCR_FAILED":
            errorDetails = {
              type: "ocr_failed",
              message:
                "Primary OCR failed, but we used a local fallback to extract some text. Results may be less accurate.",
              recoverable: true,
            }
            break
          case "ANALYSIS_FAILED":
            errorDetails = {
              type: "analysis_failed",
              message: "Failed to analyze the conversation. Please try again with different screenshots.",
              recoverable: true,
            }
            break
          case "STORAGE_FAILED":
            errorDetails = {
              type: "storage_failed",
              message: "Failed to store analysis results. Please check your browser storage settings.",
              recoverable: true,
            }
            break
          default:
            // Use default error details
            errorDetails.message = `Error: ${error.message}`
            break
        }
      }

      setError(errorDetails)
    } finally {
      setIsLoading(false)
    }
  }

  const handleErrorAction = () => {
    if (error?.type === "api_key_missing") {
      router.push("/settings")
    }
  }

  const handleRetry = () => {
    setError(null)
    if (error?.type === "upload_failed") {
      if (fileInputRef.current) {
        fileInputRef.current.click()
      }
    } else {
      handleSubmit({ preventDefault: () => {} } as React.FormEvent)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {isLoading ? (
        <LoadingScreen progress={progress} message={statusMessage} />
      ) : (
        <Card className="w-full">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit}>
              <div className="flex items-center space-x-2 mb-4">
                <Switch id="debug-mode" checked={debugMode} onCheckedChange={handleDebugModeChange} />
                <Label htmlFor="debug-mode">Debug Mode</Label>
              </div>

              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-sm text-gray-600">Drag and drop screenshots here, or click to select files</p>
                  <p className="text-xs text-gray-500">Supported formats: PNG, JPG, JPEG, GIF</p>
                </div>
              </div>

              {files.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700">Selected files ({files.length}):</p>
                  <ul className="mt-2 text-sm text-gray-500 max-h-32 overflow-y-auto">
                    {files.map((file, index) => (
                      <li
                        key={index}
                        className={`truncate p-1 rounded cursor-pointer ${debugMode && selectedDebugFile === file ? "bg-blue-100" : ""}`}
                        onClick={() => debugMode && handleSelectDebugFile(file)}
                      >
                        {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm font-medium text-red-800">{error.message}</p>
                  {error.recoverable && (
                    <div className="mt-2 flex space-x-2">
                      <Button type="button" variant="outline" size="sm" onClick={handleRetry}>
                        Retry
                      </Button>
                      {error.action && (
                        <Button type="button" variant="outline" size="sm" onClick={handleErrorAction}>
                          {error.action}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full mt-4" disabled={files.length === 0}>
                Analyze Conversation
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {debugMode && selectedDebugFile && (
        <div className="mt-6">
          <OCRDebugViewer imageFile={selectedDebugFile} />
        </div>
      )}
    </div>
  )
}

export default UploadForm
