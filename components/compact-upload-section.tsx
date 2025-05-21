"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { analyzeConversation } from "@/app/actions"
import AnalysisResults from "./analysis-results"
import { UploadCloud, File, X, ArrowRight, ImagePlus } from "lucide-react"
import { useDropzone } from "react-dropzone"
import ImageEnhancementPreview from "./image-enhancement-preview"
import { enhanceImages } from "@/lib/image-processing"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import AnalysisLoadingScreen from "./analysis-loading-screen"

export default function CompactUploadSection() {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [enhancingFile, setEnhancingFile] = useState<File | null>(null)
  const [enhancementEnabled, setEnhancementEnabled] = useState(true)
  const [filesExpanded, setFilesExpanded] = useState(true)
  const [analysisStage, setAnalysisStage] = useState<string>("")

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.filter((file) => file.type.startsWith("image/"))
    setFiles((prev) => [...prev, ...imageFiles])
    setFilesExpanded(true)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp", ".bmp", ".tiff", ".tif", ".heic", ".heif"],
    },
    maxSize: 20971520, // 20MB max file size
  })

  const removeFile = (index: number) => {
    setFiles((files) => files.filter((_, i) => i !== index))
  }

  const handleEnhanceFile = (file: File) => {
    setEnhancingFile(file)
  }

  const handleEnhancementComplete = (enhancedFile: File) => {
    setFiles((prevFiles) => {
      const index = prevFiles.findIndex((f) => f.name === enhancingFile?.name)
      if (index !== -1) {
        const newFiles = [...prevFiles]
        newFiles[index] = enhancedFile
        return newFiles
      }
      return prevFiles
    })
    setEnhancingFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)
    setAnalysisStage("Preparing images")

    // Start with a quick initial progress to improve perceived performance
    setUploadProgress(10)

    // Use a more sophisticated progress simulation that moves faster at the beginning
    // and slows down toward the end to match typical processing patterns
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        // Move quickly to 60%, then slow down
        if (prev < 60) {
          return prev + Math.random() * 5 + 3 // Faster progress at start
        } else if (prev < 85) {
          return prev + Math.random() * 2 + 1 // Medium progress in middle
        } else if (prev < 95) {
          return prev + 0.5 // Slow down at end
        }
        return 95 // Cap at 95% until complete
      })

      // Update analysis stage based on progress for better feedback
      updateAnalysisStage()
    }, 150) // Faster interval for more fluid updates

    try {
      // Process files in batches for better performance
      const batchSize = 3
      let processedFiles = []

      if (enhancementEnabled) {
        setAnalysisStage("Enhancing images")

        // Process files in batches
        for (let i = 0; i < files.length; i += batchSize) {
          const batch = files.slice(i, i + batchSize)
          const enhancedBatch = await enhanceImages(batch)
          processedFiles.push(...enhancedBatch)

          // Update progress based on how many batches we've processed
          const batchProgress = 20 + ((i + batch.length) / files.length) * 20
          setUploadProgress(Math.min(batchProgress, 40))
        }
      } else {
        processedFiles = files
        setUploadProgress(40)
      }

      setAnalysisStage("Extracting text")
      setUploadProgress(50)

      // Prepare form data more efficiently
      const formData = new FormData()
      processedFiles.forEach((file, index) => {
        formData.append(`file-${index}`, file)
        // Only add essential metadata
        formData.append(`file-${index}-originalName`, files[index].name)
      })

      setAnalysisStage("Analyzing conversation")
      setUploadProgress(70)

      // Start analysis
      const results = await analyzeConversation(formData)

      // Complete the progress animation
      setUploadProgress(100)

      // Short delay before showing results for a smoother transition
      setTimeout(() => {
        setAnalysisResults(results)
        setIsUploading(false)
        setAnalysisStage("")
      }, 500)
    } catch (error) {
      console.error("Error analyzing conversation:", error)
      setIsUploading(false)
      setAnalysisStage("")
    } finally {
      clearInterval(progressInterval)
    }
  }

  // Helper function to update the analysis stage based on progress
  const updateAnalysisStage = () => {
    if (uploadProgress < 20) {
      setAnalysisStage("Preparing images")
    } else if (uploadProgress < 40) {
      setAnalysisStage("Enhancing image quality")
    } else if (uploadProgress < 60) {
      setAnalysisStage("Extracting conversation text")
    } else if (uploadProgress < 75) {
      setAnalysisStage("Identifying communication patterns")
    } else if (uploadProgress < 85) {
      setAnalysisStage("Analyzing emotional dynamics")
    } else if (uploadProgress < 95) {
      setAnalysisStage("Generating relationship insights")
    } else {
      setAnalysisStage("Finalizing results")
    }
  }

  const resetForm = () => {
    setFiles([])
    setAnalysisResults(null)
    setUploadProgress(0)
    setEnhancingFile(null)
  }

  if (analysisResults) {
    return (
      <div>
        <AnalysisResults results={analysisResults} />
        <div className="mt-6 text-center">
          <Button onClick={resetForm} variant="outline" className="border-purple-200 text-purple-600">
            Analyze Another Conversation
          </Button>
        </div>
      </div>
    )
  }

  if (enhancingFile) {
    return (
      <ImageEnhancementPreview
        file={enhancingFile}
        onEnhanced={handleEnhancementComplete}
        onCancel={() => setEnhancingFile(null)}
      />
    )
  }

  return (
    <div id="upload-section" className="scroll-mt-16">
      {isUploading && <AnalysisLoadingScreen progress={uploadProgress} message={analysisStage} />}

      <div className="mb-6 text-center">
        <h2 className="mb-2 text-2xl md:text-3xl font-bold text-gray-900">Analyze Your Conversation</h2>
        <p className="mx-auto max-w-2xl text-gray-600">
          Upload screenshots of your conversations to receive personalized insights.
        </p>
      </div>

      <Card className="overflow-hidden bg-white shadow-md">
        <div className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer
                ${isDragActive ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:bg-gray-50"}
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="rounded-full bg-purple-100 p-2">
                  <UploadCloud className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-900">Upload conversation screenshots</h3>
                  <p className="text-xs text-gray-500">Drag and drop or click to select files</p>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="enhance-images"
                checked={enhancementEnabled}
                onChange={(e) => setEnhancementEnabled(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-2"
              />
              <label htmlFor="enhance-images" className="text-sm text-gray-700">
                Automatically enhance images for better text extraction
              </label>
            </div>

            {files.length > 0 && (
              <Collapsible open={filesExpanded} onOpenChange={setFilesExpanded}>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">Selected files ({files.length})</h3>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">{filesExpanded ? "Close" : "Open"}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`transition-transform ${filesExpanded ? "rotate-180" : ""}`}
                        >
                          <path d="m18 15-6-6-6 6" />
                        </svg>
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <ul className="mt-2 max-h-40 overflow-y-auto space-y-1">
                      {files.map((file, index) => (
                        <li key={index} className="flex items-center justify-between rounded-md bg-white p-2 text-sm">
                          <div className="flex items-center space-x-2 truncate max-w-[calc(100%-80px)]">
                            <File className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="font-medium text-gray-700 truncate">{file.name}</span>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {(file.size / 1024).toFixed(0)} KB
                            </span>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEnhanceFile(file)}
                              className="h-6 w-6 p-0 text-gray-500 hover:text-purple-500"
                              title="Enhance image"
                            >
                              <ImagePlus className="h-3 w-3" />
                              <span className="sr-only">Enhance image</span>
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
                              title="Remove file"
                            >
                              <X className="h-3 w-3" />
                              <span className="sr-only">Remove file</span>
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}

            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={isUploading || files.length === 0}
                className="bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-2"
              >
                <span>Analyze Conversation</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
