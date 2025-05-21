"use client"

import type React from "react"

import { useCallback, useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { analyzeScreenshots } from "@/lib/analyze-screenshots"
import { storeAnalysisResult, saveAnalysisResults, generateResultId } from "@/lib/storage-utils"
import { validateExtractedMessages } from "@/lib/ocr-service"
import { extractTextFromImagesWithWorkerPool, subscribeToPartialResults } from "@/lib/ocr-service-enhanced"
import type { AnalysisResult, Message } from "@/lib/types"
import { LoadingScreen } from "./loading-screen"
import { OCRDebugViewer } from "./ocr-debug-viewer"
import workerPoolManager from "@/lib/workers/worker-pool-manager"
import { PreprocessingStrategySelector } from "./preprocessing-strategy-selector"
import { PartialResultsViewer } from "./partial-results-viewer"
import type { PreprocessingStrategy } from "@/lib/workers/worker-pool-manager"
import { isClient } from "@/lib/utils"
import { DebugModeToggle } from "./debug-mode-toggle"
import { OcrMethodToggle } from "./ocr-method-toggle"

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
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [firstPersonName, setFirstPersonName] = useState("You")
  const [secondPersonName, setSecondPersonName] = useState("Partner")
  const [isSubmitting, setIsSubmitting] = useState(isSubmitting)
  const [error, setError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [processingStage, setProcessingStage] = useState<string | null>(null)
  const [isClientSide, setIsClientSide] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [debugData, setDebugData] = useState<any>(null)
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [partialResults, setPartialResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState<string>("Preparing...")
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

  // Check if we're on the client side
  useEffect(() => {
    setIsClientSide(isClient())
  }, [])

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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter out non-image files
    const imageFiles = acceptedFiles.filter((file) => file.type.startsWith("image/"))
    setFiles((prev) => [...prev, ...imageFiles])
    setValidationError(null)
    setError(null) // Clear any previous errors when new files are added

    // Reset debug data when new files are added
    setDebugData(null)
    setPartialResults(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxSize: 10485760, // 10MB
    onDropRejected: (fileRejections) => {
      if (fileRejections.some((r) => r.errors.some((e) => e.code === "file-too-large"))) {
        setValidationError("File is too large. Maximum size is 10MB.")
      } else if (fileRejections.some((r) => r.errors.some((e) => e.code === "file-invalid-type"))) {
        setValidationError("Invalid file type. Only images are accepted.")
      } else {
        setValidationError("File upload failed. Please try again.")
      }
    },
  })

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))

    // Reset debug data when files are removed
    setDebugData(null)
    setPartialResults(null)
  }

  // Process a single file for debugging
  const processFileForDebug = async (fileIndex: number) => {
    if (!files[fileIndex]) return

    setIsSubmitting(true)
    setError(null)
    setProcessingStage("Extracting text for debug visualization...")

    try {
      // Create a FileList-like object with just the selected file
      const singleFile = [files[fileIndex]]

      // Process with debug flag enabled
      const results = await analyzeScreenshots(singleFile, firstPersonName, secondPersonName, {
        debug: true,
        collectDebugInfo: true,
      })

      // Get debug data from the results
      if (results && results.debugInfo) {
        setDebugData(results.debugInfo)
      } else {
        throw new Error("No debug information available")
      }
    } catch (error) {
      console.error("Error processing file for debug:", error)
      setError(`Debug processing failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSubmitting(false)
      setProcessingStage(null)
    }
  }

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

  const handleSubmitOld = async (e: React.FormEvent) => {
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

  const handleSubmit = async () => {
    if (files.length === 0) {
      setValidationError("Please upload at least one conversation screenshot.")
      return
    }

    if (!firstPersonName.trim() || !secondPersonName.trim()) {
      setValidationError("Please enter names for both participants.")
      return
    }

    // Check if we're on the client side
    if (!isClientSide) {
      setValidationError("This feature requires client-side processing. Please try again in the browser.")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setValidationError(null)
    setPartialResults(null)

    try {
      // Set processing stages for better user feedback
      setProcessingStage("Extracting text from screenshots...")
      console.log("Starting analysis...")

      // Process the screenshots through the enhanced pipeline
      const results = await analyzeScreenshots(files, firstPersonName, secondPersonName, {
        debug: debugMode,
      })

      // Check if results are valid
      if (!results) {
        throw new Error("Analysis failed to produce valid results")
      }

      console.log(
        "Analysis completed, extracted text length:",
        results.messages?.length || 0,
        "messages with sentiment data",
      )

      // Generate a unique ID for this analysis
      setProcessingStage("Saving analysis results...")
      const resultId = generateResultId()

      // Add the ID to the results
      results.id = resultId

      // Save results to localStorage with the ID
      const saveSuccess = await saveAnalysisResults(results, resultId)

      if (!saveSuccess) {
        throw new Error("Failed to save analysis results")
      }

      console.log("Results saved successfully with ID:", resultId)

      // Verify the ID exists before redirecting
      if (!resultId) {
        throw new Error("No result ID generated")
      }

      // Navigate to results page with the ID
      console.log("Redirecting to results page with ID:", resultId)
      router.push(`/results?id=${resultId}`)
    } catch (error) {
      console.error("Error analyzing screenshots:", error)

      // Provide more specific error messages based on the error type
      if (error instanceof Error) {
        if (error.message.includes("OCR failed") || error.message.includes("No messages")) {
          setError(
            "We couldn't extract any messages from your screenshots. Please make sure your screenshots clearly show both sides of the conversation and follow our screenshot guidelines.",
          )
        } else if (error.message.includes("message separation failed")) {
          setError(
            "We couldn't identify messages from both participants. Please ensure your screenshots show messages from both people in the conversation.",
          )
        } else {
          setError(`An error occurred: ${error.message}. Please try again with different screenshots.`)
        }
      } else {
        setError("An unexpected error occurred. Please try again with different screenshots.")
      }

      setProcessingStage(null)
    } finally {
      setIsSubmitting(false)
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

  // Handle partial results updates from worker
  const handlePartialResults = (results: any) => {
    setPartialResults(results)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {showLoadingScreen ? (
        <LoadingScreen progress={progress} message={statusMessage} />
      ) : (
        <>
          <Card className="w-full">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmitOld}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={firstPersonName}
                    onChange={(e) => setFirstPersonName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your name"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Partner's Name</label>
                  <input
                    type="text"
                    value={secondPersonName}
                    onChange={(e) => setSecondPersonName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Partner's name"
                  />
                </div>

                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center cursor-pointer transition-colors ${
                    isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
                  }`}
                >
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <p className="text-blue-500">Drop the files here...</p>
                  ) : (
                    <div>
                      <p className="mb-2">Drag and drop your screenshots here, or click to select files</p>
                      <p className="text-sm text-gray-500">PNG, JPG, JPEG, GIF or WEBP (max 10MB)</p>
                    </div>
                  )}
                </div>

                {files.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Uploaded Screenshots ({files.length})</h3>
                    <ul className="space-y-2">
                      {files.map((file, index) => (
                        <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <div className="flex items-center">
                            <span className="text-sm truncate max-w-xs">{file.name}</span>
                            <span className="text-xs text-gray-500 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <div className="flex space-x-2">
                            {debugMode && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCurrentFileIndex(index)
                                  processFileForDebug(index)
                                }}
                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                                disabled={isSubmitting}
                              >
                                Debug
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                              disabled={isSubmitting}
                            >
                              Remove
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {validationError && <div className="text-red-500 mb-4 text-sm">{validationError}</div>}

                {/* Debug mode toggle */}
                <div className="mb-4">
                  <DebugModeToggle enabled={debugMode} onChange={setDebugMode} />
                </div>

                {/* Show advanced options when debug mode is enabled */}
                {debugMode && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-3">Advanced Options</h3>

                    <div className="space-y-4">
                      <OcrMethodToggle />
                      <PreprocessingStrategySelector />
                    </div>
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

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}

          {processingStage && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-blue-700">{processingStage}</span>
              </div>
            </div>
          )}

          {/* Debug data viewer */}
          {debugData && (
            <div className="mt-6">
              <OCRDebugViewer debugData={debugData} fileName={files[currentFileIndex]?.name || "Unknown file"} />
            </div>
          )}

          {/* Partial results viewer */}
          {partialResults && (
            <div className="mt-6">
              <PartialResultsViewer
                results={partialResults}
                firstPersonName={firstPersonName}
                secondPersonName={secondPersonName}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default UploadForm
