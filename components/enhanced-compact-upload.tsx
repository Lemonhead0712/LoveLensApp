"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Upload, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { analyzeConversation } from "@/app/actions"
import { useRouter } from "next/navigation"
import { saveResults } from "@/lib/results-storage"
import ModernAnalysisLoading from "@/components/modern-analysis-loading"
import Image from "next/image"

export default function EnhancedCompactUpload() {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentMessage, setCurrentMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles = Array.from(selectedFiles).filter((file) => {
      const isImage = file.type.startsWith("image/")
      const isUnder10MB = file.size <= 10 * 1024 * 1024
      return isImage && isUnder10MB
    })

    if (newFiles.length === 0) {
      setError("Please select valid image files under 10MB")
      return
    }

    setFiles((prev) => [...prev, ...newFiles])
    setError(null)

    // Generate previews
    newFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError("Please upload at least one screenshot")
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setProgress(0)

    try {
      // Step 1: Preparing
      setCurrentMessage("Preparing your images...")
      setProgress(15)
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Create FormData
      const formData = new FormData()
      files.forEach((file, index) => {
        formData.append(`file-${index}`, file)
      })

      // Step 2: Extracting text
      setCurrentMessage("Extracting text from screenshots...")
      setProgress(35)

      const result = await analyzeConversation(formData)

      // Step 3: Analyzing patterns
      setCurrentMessage("Analyzing conversation patterns...")
      setProgress(65)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (result.error) {
        throw new Error(result.error)
      }

      // Check for valid analysis results
      if (!result || !result.overallRelationshipHealth) {
        throw new Error("Analysis completed but results are invalid. Please try again.")
      }

      // Step 4: Generating insights
      setCurrentMessage("Generating relationship insights...")
      setProgress(85)
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Store results
      const resultId = saveResults(result)

      if (!resultId) {
        throw new Error("Failed to store results")
      }

      setProgress(100)
      setCurrentMessage("Complete!")

      // Navigate to results
      await new Promise((resolve) => setTimeout(resolve, 500))
      router.push(`/results?id=${resultId}`)
    } catch (error: any) {
      console.error("Analysis error:", error)
      setError(error.message || "An unexpected error occurred. Please try again.")
      setIsAnalyzing(false)
      setProgress(0)
      setCurrentMessage("")
    }
  }

  if (isAnalyzing) {
    return <ModernAnalysisLoading progress={progress} message={currentMessage} />
  }

  return (
    <section id="upload-section" className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Upload Your Conversations</h2>
            <p className="text-gray-600">Upload screenshots of your text messages to get started</p>
          </div>

          <Card className="p-5 md:p-6">
            <CardContent className="p-0">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative rounded-xl border-2 border-dashed transition-all ${
                  isDragging
                    ? "border-purple-500 bg-purple-100"
                    : "border-gray-300 bg-gradient-to-br from-purple-50/50 to-pink-50/50 hover:border-purple-400"
                } p-6 text-center cursor-pointer`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />

                <Upload className="h-10 w-10 mx-auto mb-3 text-purple-600" />
                <p className="text-base font-medium text-gray-900 mb-1">
                  {isDragging ? "Drop your images here" : "Click to upload images"}
                </p>
                <p className="text-sm text-gray-500">or drag and drop your screenshots here</p>
              </div>

              {previews.length > 0 && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={preview || "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFile(index)
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <Alert variant="destructive" className="mt-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm whitespace-pre-line">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleSubmit}
                disabled={files.length === 0}
                className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 py-6"
                size="lg"
              >
                <ImageIcon className="mr-2 h-5 w-5" />
                Analyze {files.length > 0 ? `${files.length} Image${files.length > 1 ? "s" : ""}` : "Conversation"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
