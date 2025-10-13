"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Upload, X, Sparkles, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { analyzeConversation } from "@/app/actions"
import { storeResults } from "@/lib/results-storage"
import ModernAnalysisLoading from "@/components/modern-analysis-loading"
import { enhanceImages } from "@/lib/image-processing"

const SAMPLE_IMAGES = ["/sample-conversation-1.jpg", "/sample-conversation-2.jpg", "/sample-conversation-3.jpg"]

interface StoredFile {
  name: string
  type: string
  size: number
  base64: string
  timestamp: number
}

export default function EnhancedCompactUpload() {
  const [files, setFiles] = useState<StoredFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState("Analyzing your conversation...")
  const [error, setError] = useState<string | null>(null)
  const [subject1Name, setSubject1Name] = useState("")
  const [subject2Name, setSubject2Name] = useState("")
  const [isUsingSample, setIsUsingSample] = useState(false)
  const [enhancementEnabled, setEnhancementEnabled] = useState(true)
  const [isProcessingFiles, setIsProcessingFiles] = useState(false)
  const router = useRouter()

  const fileToStoredFile = async (file: File): Promise<StoredFile> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          base64,
          timestamp: Date.now(),
        })
      }
      reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))
      reader.readAsDataURL(file)
    })
  }

  const storedFileToFile = (storedFile: StoredFile): File => {
    const base64Data = storedFile.base64.split(",")[1]
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: storedFile.type })
    return new File([blob], storedFile.name, { type: storedFile.type })
  }

  useEffect(() => {
    const checkFilesFreshness = () => {
      const now = Date.now()
      const staleFiles = files.filter((file) => now - file.timestamp > 60 * 60 * 1000) // 60 minutes
      if (staleFiles.length > 0 && !isAnalyzing) {
        console.log("[v0] Detected very old files (60+ minutes), suggesting re-upload")
        setError(`Some files were uploaded over an hour ago. For best results, please re-upload your screenshots.`)
      }
    }

    if (files.length > 0) {
      const interval = setInterval(checkFilesFreshness, 5 * 60 * 1000) // Check every 5 minutes
      checkFilesFreshness() // Check immediately on mount
      return () => clearInterval(interval)
    }
  }, [files, isAnalyzing])

  const loadSampleImages = async () => {
    setError(null)
    setIsUsingSample(true)
    setIsProcessingFiles(true)

    try {
      const sampleFiles: File[] = []

      for (let i = 0; i < SAMPLE_IMAGES.length; i++) {
        const response = await fetch(SAMPLE_IMAGES[i])
        const blob = await response.blob()
        const file = new File([blob], `sample-conversation-${i + 1}.png`, { type: "image/png" })
        sampleFiles.push(file)
      }

      const storedFiles = await Promise.all(sampleFiles.map(fileToStoredFile))
      setFiles(storedFiles)
      setSubject1Name("Alex")
      setSubject2Name("Jordan")
    } catch (err) {
      console.error("[v0] Error loading sample images:", err)
      setError("Unable to load sample images. Please try uploading your own screenshots instead.")
      setIsUsingSample(false)
    } finally {
      setIsProcessingFiles(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setError(null)
    setIsUsingSample(false)

    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))

    if (droppedFiles.length === 0) {
      setError("Please upload image files only")
      return
    }

    setIsProcessingFiles(true)
    try {
      const storedFiles = await Promise.all(droppedFiles.map(fileToStoredFile))
      setFiles((prev) => [...prev, ...storedFiles].slice(0, 10))
    } catch (err) {
      console.error("[v0] Error processing dropped files:", err)
      setError("Failed to process some files. Please try again.")
    } finally {
      setIsProcessingFiles(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setIsUsingSample(false)

    const selectedFiles = Array.from(e.target.files || []).filter((file) => file.type.startsWith("image/"))

    if (selectedFiles.length === 0) {
      setError("Please upload image files only")
      return
    }

    setIsProcessingFiles(true)
    try {
      const storedFiles = await Promise.all(selectedFiles.map(fileToStoredFile))
      setFiles((prev) => [...prev, ...storedFiles].slice(0, 10))
    } catch (err) {
      console.error("[v0] Error processing selected files:", err)
      setError("Failed to process some files. Please try again.")
    } finally {
      setIsProcessingFiles(false)
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    if (error?.includes("uploaded over an hour ago")) {
      setError(null)
    }
  }

  const handleFileDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", "")
  }

  const handleFileDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverIndex(index)
  }

  const handleFileDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleFileDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    e.stopPropagation()

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    setFiles((prev) => {
      const newFiles = [...prev]
      const draggedFile = newFiles[draggedIndex]
      newFiles.splice(draggedIndex, 1)
      newFiles.splice(dropIndex, 0, draggedFile)
      return newFiles
    })

    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleFileDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError("Please upload at least one screenshot")
      return
    }

    setIsAnalyzing(true)
    setProgress(0)
    setProgressMessage("Preparing analysis...")
    setError(null)

    try {
      setProgressMessage("Converting files...")
      console.log("[v0] Converting stored files back to File objects...")

      const fileObjects = files.map(storedFileToFile)

      for (const file of fileObjects) {
        if (file.size > 10 * 1024 * 1024) {
          setError(
            `File "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 10MB.`,
          )
          setIsAnalyzing(false)
          return
        }
      }

      console.log("[v0] All files ready for analysis")
      setProgress(10)

      let processedFiles = fileObjects
      if (enhancementEnabled) {
        setProgressMessage("Enhancing image quality...")
        setProgress(15)
        try {
          processedFiles = await enhanceImages(fileObjects)
          console.log("[v0] Images enhanced successfully")
        } catch (enhError) {
          console.warn("[v0] Image enhancement failed, using original files:", enhError)
          processedFiles = fileObjects
        }
        setProgress(20)
      }

      const progressSteps = [
        { progress: 35, message: `Reading ${files.length} screenshot${files.length > 1 ? "s" : ""}...` },
        { progress: 50, message: "Extracting conversation text..." },
        { progress: 65, message: "Detecting communication patterns..." },
        { progress: 80, message: "Analyzing emotional dynamics..." },
        { progress: 90, message: "Evaluating relationship health..." },
        { progress: 95, message: "Generating insights..." },
      ]

      let currentStep = 0
      const progressInterval = setInterval(() => {
        if (currentStep < progressSteps.length) {
          setProgress(progressSteps[currentStep].progress)
          setProgressMessage(progressSteps[currentStep].message)
          currentStep++
        } else {
          clearInterval(progressInterval)
        }
      }, 1500)

      const formData = new FormData()
      processedFiles.forEach((file, index) => {
        formData.append(`file-${index}`, file)
      })
      if (subject1Name) formData.append("subjectAName", subject1Name)
      if (subject2Name) formData.append("subjectBName", subject2Name)

      console.log("[v0] Starting analysis with", files.length, "files")

      const results = await analyzeConversation(formData)

      clearInterval(progressInterval)
      setProgress(100)
      setProgressMessage("Analysis complete!")

      console.log("[v0] Analysis complete, checking results...")

      if (results.error) {
        console.error("[v0] Analysis returned error:", results.error)
        setError(results.error)
        setIsAnalyzing(false)
        return
      }

      if (!results.subjectALabel || !results.subjectBLabel) {
        console.error("[v0] Invalid results structure:", results)
        setError("Analysis completed but results are incomplete. Please try again.")
        setIsAnalyzing(false)
        return
      }

      const resultId = storeResults(results)
      console.log("[v0] Results stored with ID:", resultId)

      setTimeout(() => {
        console.log("[v0] Navigating to results page")
        router.push(`/results?id=${resultId}`)
      }, 500)
    } catch (err: any) {
      console.error("[v0] Error during analysis:", err)

      let errorMessage = "An unexpected error occurred. Please try again."

      if (err?.message) {
        if (err.message.includes("file could not be read") || err.message.includes("permission")) {
          errorMessage = "Unable to process files. Please refresh the page and re-upload your screenshots."
        } else if (err.message.includes("too large")) {
          errorMessage = err.message
        } else if (err.message.includes("network") || err.message.includes("fetch")) {
          errorMessage = "Network error. Please check your internet connection and try again."
        } else if (err.message.includes("timeout")) {
          errorMessage = "Analysis is taking too long. Please try uploading fewer images or try again later."
        } else {
          errorMessage = err.message
        }
      }

      setError(errorMessage)
      setIsAnalyzing(false)
    }
  }

  const handleRetry = () => {
    setError(null)
    handleAnalyze()
  }

  const handleRemoveKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      removeFile(index)
    }
  }

  return (
    <>
      <AnimatePresence>
        {isAnalyzing && <ModernAnalysisLoading progress={progress} message={progressMessage} />}
      </AnimatePresence>

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8" id="upload-section">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">Upload Your Conversation</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Upload screenshots of your text conversations. Our AI analyzes communication patterns, emotional tone, and
              relationship dynamics to provide insights. Results are general guidance, not professional therapy.
            </p>
            <p className="text-sm sm:text-base text-gray-500 mt-2">
              Tip: Upload at least 3-5 screenshots with 10+ messages for more reliable insights.
            </p>
          </div>

          <Card className="border-2 border-gray-200 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 transition-all duration-300 ${
                  isDragging
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-300 hover:border-purple-400 hover:bg-gray-50"
                }`}
                role="region"
                aria-label="File upload area"
              >
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="sr-only"
                  disabled={isAnalyzing || isProcessingFiles}
                  aria-describedby="upload-description"
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      document.getElementById("file-upload")?.click()
                    }
                  }}
                >
                  {isProcessingFiles ? (
                    <>
                      <Loader2 className="w-12 h-12 text-purple-500 mb-4 animate-spin" aria-hidden="true" />
                      <p className="text-base sm:text-lg font-semibold text-gray-700 mb-2">Processing files...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-purple-500 mb-4" aria-hidden="true" />
                      <p className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
                        Drop your screenshots here or click to browse
                      </p>
                    </>
                  )}
                  <p id="upload-description" className="text-xs sm:text-sm text-gray-500 text-center">
                    Upload up to 10 images (PNG, JPG, JPEG) • Max 10MB each
                  </p>
                </label>

                <div className="mt-4 flex justify-center">
                  <Button
                    onClick={loadSampleImages}
                    variant="outline"
                    size="sm"
                    disabled={isAnalyzing || isProcessingFiles}
                    className="text-purple-600 border-purple-300 hover:bg-purple-50 focus-visible:ring-2 focus-visible:ring-purple-500 min-h-[44px] touch-manipulation bg-transparent"
                    aria-label="Load example conversation screenshots"
                  >
                    <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
                    Try with Example
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enhancementEnabled}
                    onChange={(e) => setEnhancementEnabled(e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    disabled={isAnalyzing}
                  />
                  <span className="text-sm text-gray-700">Automatically enhance images for better text extraction</span>
                </label>
              </div>

              {isUsingSample && (
                <Alert className="mt-4 bg-purple-50 border-purple-200">
                  <AlertDescription className="text-sm text-purple-800">
                    You're using sample conversation data. Feel free to upload your own screenshots to replace it.
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-start justify-between gap-2">
                    <span className="flex-1">{error}</span>
                    {error.includes("try again") && (
                      <Button
                        onClick={handleRetry}
                        variant="outline"
                        size="sm"
                        className="shrink-0 min-h-[36px] bg-transparent"
                        aria-label="Retry analysis"
                      >
                        Try Again
                      </Button>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {files.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Uploaded Files ({files.length}/10)</h4>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 bg-purple-50 p-2 rounded-md border border-purple-200">
                    💡 Drag and drop to reorder screenshots chronologically (earliest to latest)
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {files.map((file, index) => (
                      <motion.div
                        key={`${file.name}-${index}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        draggable
                        onDragStart={(e) => handleFileDragStart(e, index)}
                        onDragOver={(e) => handleFileDragOver(e, index)}
                        onDragLeave={handleFileDragLeave}
                        onDrop={(e) => handleFileDrop(e, index)}
                        onDragEnd={handleFileDragEnd}
                        className={`relative group cursor-move ${draggedIndex === index ? "opacity-50" : ""} ${
                          dragOverIndex === index ? "ring-2 ring-purple-500 ring-dashed" : ""
                        }`}
                        role="listitem"
                        aria-label={`Screenshot ${index + 1} of ${files.length}: ${file.name}`}
                      >
                        <div className="aspect-square rounded-lg bg-gray-100 overflow-hidden border-2 border-gray-200">
                          <img
                            src={file.base64 || "/placeholder.svg"}
                            alt={`Screenshot ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute top-1 left-1 bg-purple-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                          {index + 1}
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          onKeyDown={(e) => handleRemoveKeyDown(e, index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-red-500 min-w-[32px] min-h-[32px] touch-manipulation shadow-lg"
                          aria-label={`Remove ${file.name}`}
                          type="button"
                        >
                          <X className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {files.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Customize Names (Optional)</h4>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4">
                    Enter custom names for the conversation participants. Leave blank to use default labels.
                  </p>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject1-name" className="text-sm font-medium text-gray-700">
                        First Person
                      </Label>
                      <Input
                        id="subject1-name"
                        type="text"
                        placeholder="e.g., Alex"
                        value={subject1Name}
                        onChange={(e) => setSubject1Name(e.target.value)}
                        disabled={isAnalyzing}
                        aria-describedby="subject1-description"
                        className="w-full focus-visible:ring-2 focus-visible:ring-purple-500"
                      />
                      <span id="subject1-description" className="sr-only">
                        Enter the name of the first person in the conversation
                      </span>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject2-name" className="text-sm font-medium text-gray-700">
                        Second Person
                      </Label>
                      <Input
                        id="subject2-name"
                        type="text"
                        placeholder="e.g., Jordan"
                        value={subject2Name}
                        onChange={(e) => setSubject2Name(e.target.value)}
                        disabled={isAnalyzing}
                        aria-describedby="subject2-description"
                        className="w-full focus-visible:ring-2 focus-visible:ring-purple-500"
                      />
                      <span id="subject2-description" className="sr-only">
                        Enter the name of the second person in the conversation
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-center">
                <Button
                  id="analyze-button"
                  onClick={handleAnalyze}
                  disabled={files.length === 0 || isAnalyzing || isProcessingFiles}
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 min-h-[56px] touch-manipulation"
                  aria-label={
                    files.length === 0
                      ? "Upload files to start analysis"
                      : isAnalyzing
                        ? `Analyzing ${files.length} screenshot${files.length !== 1 ? "s" : ""}`
                        : `Start analysis of ${files.length} screenshot${files.length !== 1 ? "s" : ""}`
                  }
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
                      {progressMessage}
                    </>
                  ) : (
                    <>Start Analysis</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-500 max-w-2xl mx-auto">
              🔒 Your privacy matters: All analysis happens securely. Images are processed temporarily and automatically
              deleted after analysis. We never store your conversations or personal data.
            </p>
          </div>
        </motion.div>
      </div>
    </>
  )
}
