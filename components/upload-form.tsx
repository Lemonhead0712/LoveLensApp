"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { analyzeScreenshots } from "@/lib/analyze-screenshots"
import { storeAnalysisResult } from "@/lib/storage-utils"
import { validateExtractedMessages } from "@/lib/ocr-service"
import { extractTextFromImagesWithWorkerPool, subscribeToPartialResults } from "@/lib/ocr-service-enhanced"
import type { AnalysisResult, Message } from "@/lib/types"
import { LoadingScreen } from "./loading-screen"
import { OCRDebugViewer } from "./ocr-debug-viewer"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import workerPoolManager from "@/lib/workers/worker-pool-manager"
import { PreprocessingStrategySelector } from "./preprocessing-strategy-selector"
import { PartialResultsViewer } from "./partial-results-viewer"
import type { PreprocessingStrategy } from "@/lib/workers/worker-pool-manager"

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
  const [useWorkerPool, setUseWorkerPool] = useState(true)
  const [workersSupported, setWorkersSupported] = useState(false)
  const [poolStats, setPoolStats] = useState<any>(null)
  const [preprocessingEnabled, setPreprocessingEnabled] = useState(true)
  const [preprocessingStrategy, setPreprocessingStrategy] = useState<PreprocessingStrategy>("default")
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [partialMessages, setPartialMessages] = useState<Message[]>([])
  const [processedImages, setProcessedImages] = useState(0)
  const [processingComplete, setProcessingComplete] = useState(false)
  const [showPartialResults, setShowPartialResults] = useState(true)
  const [analysisReady, setAnalysisReady] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Check if Web Workers are supported
  useEffect(() => {
    const supported = workerPoolManager.supportsWorkers()
    setWorkersSupported(supported)
    setUseWorkerPool(supported)
  }, [])

  // Clean up workers when component unmounts
  useEffect(() => {
    return () => {
      workerPoolManager.terminateAll()
    }
  }, [])

  // Update pool stats periodically when in debug mode
  useEffect(() => {
    if (!debugMode) return

    const interval = setInterval(() => {
      if (isLoading) {
        setPoolStats(workerPoolManager.getStats())
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [debugMode, isLoading])

  // Subscribe to partial results
  useEffect(() => {
    const unsubscribe = subscribeToPartialResults((results) => {
      if (results.messages) {
        setPartialMessages(results.messages)
      }
      if (results.processedImages !== undefined) {
        setProcessedImages(results.processedImages)
      }
      if (results.complete !== undefined) {
        setProcessingComplete(results.complete)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

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

  const handleUseWorkerPoolChange = (checked: boolean) => {
    setUseWorkerPool(checked)
  }

  const handleSelectDebugFile = (file: File) => {
    setSelectedDebugFile(file)
  }

  const handleAdvancedOptionsToggle = (checked: boolean) => {
    setShowAdvancedOptions(checked)
  }

  const handleShowPartialResultsChange = (checked: boolean) => {
    setShowPartialResults(checked)
  }

  const handleContinueToAnalysis = () => {
    if (analysisReady && analysisResult) {
      // Store the analysis result and navigate to results page
      storeAnalysisResult(analysisResult)
        .then(() => {
          router.push("/results")
        })
        .catch((error) => {
          console.error("Error storing analysis result:", error)
          setError({
            type: "storage_failed",
            message: "Failed to store analysis results. Please check your browser storage settings.",
            recoverable: true,
          })
        })
    }
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

    // Reset state
    setIsLoading(true)
    setProgress(5)
    setStatusMessage("Preparing files...")
    setPartialMessages([])
    setProcessedImages(0)
    setProcessingComplete(false)
    setAnalysisReady(false)
    setAnalysisResult(null)

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

      // Process images with OCR
      const processingMethod = useWorkerPool && workersSupported ? "Worker Pool" : "Sequential"
      const preprocessingInfo = preprocessingEnabled ? ` with ${preprocessingStrategy} preprocessing` : ""
      setStatusMessage(
        `Extracting text from ${files.length} image${files.length > 1 ? "s" : ""} (${processingMethod}${preprocessingInfo})...`,
      )

      let allMessages: Message[] = []

      try {
        if (useWorkerPool && workersSupported) {
          // Use the worker pool for parallel processing with progressive results
          allMessages = await extractTextFromImagesWithWorkerPool(
            base64Files,
            (ocrProgress) => {
              setProgress(10 + Math.round(ocrProgress * 0.6)) // 10-70% range for OCR
            },
            {
              enableProgressiveResults: showPartialResults,
              preprocessingStrategy: preprocessingEnabled ? preprocessingStrategy : "none",
              firstPersonName: "User",
              secondPersonName: "Friend",
            },
          )
        } else {
          // Use sequential processing
          const { extractTextFromImage } = await import("@/lib/ocr-service")

          // Process each image sequentially
          for (let i = 0; i < base64Files.length; i++) {
            setStatusMessage(`Processing image ${i + 1} of ${base64Files.length}...`)

            const messages = await extractTextFromImage(base64Files[i], (ocrProgress) => {
              // Calculate overall progress (10-70% range for OCR)
              const fileWeight = 60 / base64Files.length
              const overallProgress = 10 + i * fileWeight + (ocrProgress * fileWeight) / 100
              setProgress(Math.round(overallProgress))
            })

            // Update partial results
            if (showPartialResults) {
              setPartialMessages((prev) => [...prev, ...messages])
              setProcessedImages(i + 1)
            }

            allMessages = [...allMessages, ...messages]
          }

          // Mark processing as complete
          setProcessingComplete(true)
        }

        // Validate extracted messages
        if (!validateExtractedMessages(allMessages)) {
          throw new Error("OCR_FAILED")
        }

        setProgress(70)
        setStatusMessage("Analyzing conversation...")

        // Analyze screenshots
        try {
          // Pass the extracted messages directly to the analysis function
          const result = await analyzeScreenshots(base64Files, allMessages)
          setProgress(90)
          setStatusMessage("Analysis complete!")

          // Store the result for later use
          setAnalysisResult(result)
          setAnalysisReady(true)

          // If not showing partial results, navigate directly to results page
          if (!showPartialResults) {
            setProgress(100)
            setStatusMessage("Saving results...")

            await storeAnalysisResult(result)
            router.push("/results")
          }
        } catch (analysisError) {
          console.error("Analysis error:", analysisError)
          throw new Error("ANALYSIS_FAILED")
        }
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
      setIsLoading(false)
    } finally {
      // Only set loading to false if we're not showing partial results
      // Otherwise, we'll keep the loading state until the user continues to analysis
      if (!showPartialResults) {
        setIsLoading(false)
      }

      // Clean up worker pool if we're done
      if (useWorkerPool && workersSupported) {
        // Keep the pool alive for a bit in case the user wants to process more images
        setTimeout(() => {
          if (!isLoading) {
            workerPoolManager.terminateAll()
          }
        }, 30000) // Clean up after 30 seconds of inactivity
      }
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

  // Determine if we should show the loading screen or partial results
  const showLoadingScreen = isLoading && (!showPartialResults || !processingComplete)

  return (
    <div className="w-full max-w-md mx-auto">
      {showLoadingScreen ? (
        <LoadingScreen progress={progress} message={statusMessage} />
      ) : (
        <>
          <Card className="w-full">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col space-y-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="debug-mode" checked={debugMode} onCheckedChange={handleDebugModeChange} />
                    <Label htmlFor="debug-mode">Debug Mode</Label>
                  </div>

                  {workersSupported && (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="use-worker-pool"
                        checked={useWorkerPool}
                        onCheckedChange={handleUseWorkerPoolChange}
                      />
                      <Label htmlFor="use-worker-pool">
                        Use Worker Pool
                        <span className="ml-2 text-xs text-green-600 font-medium">
                          (Recommended for multiple images)
                        </span>
                      </Label>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-partial-results"
                      checked={showPartialResults}
                      onCheckedChange={handleShowPartialResultsChange}
                    />
                    <Label htmlFor="show-partial-results">
                      Show Partial Results
                      <span className="ml-2 text-xs text-green-600 font-medium">
                        (See results as they're processed)
                      </span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="advanced-options"
                      checked={showAdvancedOptions}
                      onCheckedChange={handleAdvancedOptionsToggle}
                    />
                    <Label htmlFor="advanced-options">Show Advanced Options</Label>
                  </div>

                  {!workersSupported && (
                    <div className="text-xs text-amber-600">
                      Web Workers are not supported in your browser. Processing will happen sequentially.
                    </div>
                  )}
                </div>

                {showAdvancedOptions && (
                  <div className="mb-4">
                    <PreprocessingStrategySelector
                      value={preprocessingStrategy}
                      onChange={setPreprocessingStrategy}
                      enabled={preprocessingEnabled}
                      onEnabledChange={setPreprocessingEnabled}
                    />
                  </div>
                )}

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

                <Button type="submit" className="w-full mt-4" disabled={files.length === 0 || isLoading}>
                  {isLoading ? "Processing..." : "Analyze Conversation"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {isLoading && showPartialResults && (
            <PartialResultsViewer
              partialMessages={partialMessages}
              processedImages={processedImages}
              totalImages={files.length}
              processingComplete={processingComplete}
              onContinueToAnalysis={handleContinueToAnalysis}
            />
          )}

          {debugMode && (
            <div className="mt-6">
              {selectedDebugFile && (
                <OCRDebugViewer
                  imageFile={selectedDebugFile}
                  preprocessingEnabled={preprocessingEnabled}
                  preprocessingStrategy={preprocessingStrategy}
                />
              )}

              {poolStats && (
                <Card className="mt-4">
                  <CardContent className="pt-4">
                    <h3 className="text-sm font-medium mb-2">Worker Pool Stats</h3>
                    {Object.entries(poolStats).map(([poolName, stats]: [string, any]) => (
                      <div key={poolName} className="mb-3">
                        <h4 className="text-xs font-medium text-gray-700">{poolName} Pool</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            Workers: {stats.busyWorkers}/{stats.totalWorkers}
                          </div>
                          <div>Queued: {stats.queuedTasks}</div>
                          <div>Active: {stats.activeTasks}</div>
                          <div>Completed: {stats.completedTasks}</div>
                          <div>Failed: {stats.failedTasks}</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default UploadForm
