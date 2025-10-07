"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { analyzeConversation } from "@/app/actions"
import AnalysisResults from "./analysis-results"
import { UploadCloud, File, X, ArrowRight, ImagePlus, User } from "lucide-react"
import { useDropzone } from "react-dropzone"
import ImageEnhancementPreview from "./image-enhancement-preview"
import { enhanceImages } from "@/lib/image-processing"

export default function UploadSection() {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [enhancingFile, setEnhancingFile] = useState<File | null>(null)
  const [enhancementEnabled, setEnhancementEnabled] = useState(true)
  const [subjectAName, setSubjectAName] = useState("")
  const [subjectBName, setSubjectBName] = useState("")

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.filter((file) => file.type.startsWith("image/"))
    setFiles((prev) => [...prev, ...imageFiles])
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

  const analyzeImageQuality = async (
    file: File,
  ): Promise<{
    needsEnhancement: boolean
    issues: string[]
    recommendedActions: string[]
  }> => {
    // This is a simplified version - in a real app, you would use more sophisticated analysis
    const issues: string[] = []
    const recommendedActions: string[] = []

    // Check file size
    if (file.size < 50 * 1024) {
      // Less than 50KB
      issues.push("Very small file size may indicate low quality")
      recommendedActions.push("Enhance resolution")
    }

    if (file.size > 10 * 1024 * 1024) {
      // More than 10MB
      issues.push("Very large file size may slow down processing")
      recommendedActions.push("Optimize file size")
    }

    // Check file type
    if (file.type === "image/gif" || file.type === "image/bmp") {
      issues.push("File format may not be optimal for text extraction")
      recommendedActions.push("Convert to JPEG or PNG")
    }

    // For a real implementation, we would analyze the image content
    // to detect issues like blur, low contrast, etc.

    return {
      needsEnhancement: issues.length > 0,
      issues,
      recommendedActions,
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return 95
        }
        return prev + 5
      })
    }, 200)

    try {
      // Analyze image quality and apply automatic enhancement if needed
      setUploadProgress(5)

      let processedFiles = files
      if (enhancementEnabled) {
        setUploadProgress(10)

        // Check each file for quality issues
        const qualityAnalysis = await Promise.all(
          files.map(async (file) => ({
            file,
            analysis: await analyzeImageQuality(file),
          })),
        )

        // Log quality issues for debugging
        qualityAnalysis.forEach(({ file, analysis }) => {
          if (analysis.issues.length > 0) {
            console.log(`Quality issues detected for ${file.name}:`, analysis.issues)
            console.log(`Recommended actions:`, analysis.recommendedActions)
          }
        })

        // Apply enhancements
        processedFiles = await enhanceImages(files)
        setUploadProgress(40)
      }

      const formData = new FormData()
      processedFiles.forEach((file, index) => {
        formData.append(`file-${index}`, file)

        // Add metadata about the original file
        formData.append(`file-${index}-originalName`, files[index].name)
        formData.append(`file-${index}-originalSize`, files[index].size.toString())
        formData.append(`file-${index}-originalType`, files[index].type)
      })

      // Add subject names to formData
      if (subjectAName.trim()) {
        formData.append("subjectAName", subjectAName.trim())
      }
      if (subjectBName.trim()) {
        formData.append("subjectBName", subjectBName.trim())
      }

      const results = await analyzeConversation(formData)
      setAnalysisResults(results)
      setUploadProgress(100)
    } catch (error) {
      console.error("Error analyzing conversation:", error)
    } finally {
      clearInterval(progressInterval)
      setIsUploading(false)
    }
  }

  const resetForm = () => {
    setFiles([])
    setAnalysisResults(null)
    setUploadProgress(0)
    setEnhancingFile(null)
    setSubjectAName("")
    setSubjectBName("")
  }

  if (analysisResults) {
    return (
      <div>
        <AnalysisResults results={analysisResults} />
        <div className="mt-8 text-center">
          <Button onClick={resetForm} variant="outline" className="mr-4 bg-transparent">
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
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Analyze Your Conversation</h2>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Upload screenshots of your conversations to receive personalized insights. Your messages remain private and
          are never stored.
        </p>
      </div>

      <Card className="overflow-hidden bg-white shadow-xl">
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject Name Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="space-y-2">
                <Label htmlFor="subject-a" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-600" />
                  Subject A Name (Sender / Right side)
                </Label>
                <Input
                  id="subject-a"
                  type="text"
                  placeholder="e.g., Alex, Partner 1, Me"
                  value={subjectAName}
                  onChange={(e) => setSubjectAName(e.target.value)}
                  className="bg-white"
                  maxLength={30}
                />
                <p className="text-xs text-gray-500">Optional: Customize how we refer to the sender</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject-b" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-pink-600" />
                  Subject B Name (Receiver / Left side)
                </Label>
                <Input
                  id="subject-b"
                  type="text"
                  placeholder="e.g., Jordan, Partner 2, Them"
                  value={subjectBName}
                  onChange={(e) => setSubjectBName(e.target.value)}
                  className="bg-white"
                  maxLength={30}
                />
                <p className="text-xs text-gray-500">Optional: Customize how we refer to the receiver</p>
              </div>
            </div>

            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer
                ${isDragActive ? "border-rose-500 bg-rose-50" : "border-gray-300 hover:bg-gray-50"}
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-rose-100 p-3">
                  <UploadCloud className="h-8 w-8 text-rose-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900">Upload conversation screenshots</h3>
                  <p className="text-sm text-gray-500">Drag and drop image files, or click to select files</p>
                </div>
                <p className="text-xs text-gray-500">Supports: JPG, PNG, GIF up to 10MB each</p>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="enhance-images"
                checked={enhancementEnabled}
                onChange={(e) => setEnhancementEnabled(e.target.checked)}
                className="rounded border-gray-300 text-rose-600 focus:ring-rose-500 mr-2"
              />
              <label htmlFor="enhance-images" className="text-sm text-gray-700">
                Automatically enhance images for better text extraction
              </label>
            </div>

            {files.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-3 font-medium text-gray-900">Selected files ({files.length})</h3>
                <ul className="max-h-60 overflow-y-auto space-y-2">
                  {files.map((file, index) => (
                    <li key={index} className="flex items-center justify-between rounded-md bg-white p-3 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <File className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 truncate max-w-xs">{file.name}</span>
                        <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEnhanceFile(file)}
                          className="h-8 w-8 p-0 text-gray-500 hover:text-rose-500"
                          title="Enhance image"
                        >
                          <ImagePlus className="h-4 w-4" />
                          <span className="sr-only">Enhance image</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
                          title="Remove file"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove file</span>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    {uploadProgress < 50 ? "Enhancing images..." : "Analyzing conversation..."}
                  </span>
                  <span className="text-gray-500">{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-rose-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={isUploading || files.length === 0}
                className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-6 text-lg flex items-center space-x-2"
              >
                <span>Analyze Conversation</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
