"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { analyzeConversation } from "@/app/actions"
import { useRouter } from "next/navigation"
import { saveResults } from "@/lib/results-storage"

export default function EnhancedCompactUpload() {
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
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

    setFiles((prev) => [...prev, ...newFiles])
    setError(null)
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
  }

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError("Please upload at least one screenshot")
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      console.log("Starting analysis with", files.length, "files")

      const formData = new FormData()
      files.forEach((file, index) => {
        formData.append(`file-${index}`, file)
        console.log(`Added file-${index}:`, file.name)
      })

      console.log("Calling analyzeConversation...")
      const result = await analyzeConversation(formData)
      console.log("Analysis result:", result)

      if (result.error) {
        console.error("Analysis error:", result.error)
        setError(result.error)
        setIsAnalyzing(false)
        return
      }

      // Check if we have valid analysis results
      if (result && result.overallRelationshipHealth) {
        console.log("Valid analysis received, storing results...")
        const resultId = saveResults(result)
        console.log("Results stored with ID:", resultId)

        if (resultId) {
          console.log("Navigating to results page...")
          router.push(`/results?id=${resultId}`)
        } else {
          throw new Error("Failed to store results")
        }
      } else {
        console.error("Invalid analysis result structure:", result)
        setError("Analysis completed but results are invalid. Please try again.")
        setIsAnalyzing(false)
      }
    } catch (error: any) {
      console.error("Analysis error:", error)
      setError(error.message || "An unexpected error occurred. Please try again.")
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border-2 border-dashed border-purple-200 bg-white/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative rounded-lg border-2 border-dashed transition-colors ${
              isDragging ? "border-purple-500 bg-purple-50" : "border-gray-300 bg-gray-50"
            } p-8 text-center`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />

            <div className="space-y-3">
              <div className="flex justify-center">
                <Upload className="h-10 w-10 text-purple-500" />
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900">Upload Screenshots</h3>
                <p className="mt-1 text-sm text-gray-600">Drag and drop or click to browse</p>
              </div>

              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                Choose Files
              </Button>

              <p className="text-xs text-gray-500">PNG, JPG up to 10MB each</p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">{files.length} file(s) selected</p>
                <Button
                  onClick={() => setFiles([])}
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-gray-600 hover:text-gray-900"
                >
                  Clear All
                </Button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg bg-gray-50 p-2 text-sm">
                    <span className="truncate flex-1 text-gray-700">{file.name}</span>
                    <Button
                      onClick={() => removeFile(index)}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-500 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm whitespace-pre-line">{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleSubmit}
            disabled={files.length === 0 || isAnalyzing}
            className="mt-4 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Conversation"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
