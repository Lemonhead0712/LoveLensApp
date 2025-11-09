"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, ImageIcon, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getMockAnalysisResults } from "@/lib/mock-analysis-data"
import ModernAnalysisLoading from "@/components/modern-analysis-loading"

export default function EnhancedCompactUpload() {
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setError(null)

    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))

    if (droppedFiles.length === 0) {
      setError("Please upload image files only")
      return
    }

    setFiles((prev) => [...prev, ...droppedFiles].slice(0, 10))
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const selectedFiles = Array.from(e.target.files || []).filter((file) => file.type.startsWith("image/"))

    if (selectedFiles.length === 0) {
      setError("Please upload image files only")
      return
    }

    setFiles((prev) => [...prev, ...selectedFiles].slice(0, 10))
  }, [])

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setError(null)
  }, [])

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError("Please upload at least one screenshot")
      return
    }

    setIsAnalyzing(true)
    setProgress(0)
    setError(null)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      console.log("[v0] Using mock data for analysis with", files.length, "files")

      await new Promise((resolve) => setTimeout(resolve, 2000))

      const results = getMockAnalysisResults()

      clearInterval(progressInterval)
      setProgress(100)

      console.log("[v0] Mock analysis complete, results:", results)

      setTimeout(() => {
        console.log("[v0] Navigating to results page")
        router.push("/results/mock-analysis")
      }, 500)
    } catch (err: any) {
      console.error("[v0] Error during analysis:", err)
      setError(err.message || "An unexpected error occurred. Please try again.")
      setIsAnalyzing(false)
    }
  }

  return (
    <>
      <AnimatePresence>
        {isAnalyzing && <ModernAnalysisLoading progress={progress} message="Analyzing your conversation..." />}
      </AnimatePresence>

      <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8" id="upload-section">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 px-2">Upload Your Conversation</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
              Upload screenshots of your text conversations. We support iPhone, Android, WhatsApp, and other messaging
              apps.
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
                    : "border-gray-300 hover:border-purple-400 hover:bg-purple-50/50"
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isAnalyzing}
                />

                <div className="text-center">
                  <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                    <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    {isDragging ? "Drop your screenshots here" : "Drag & drop or click to upload"}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 px-2">
                    Support for PNG, JPG, JPEG • Up to 10 images • Max 10MB each
                  </p>
                  <Button
                    variant="outline"
                    className="bg-white hover:bg-purple-50 border-purple-300 text-purple-700 text-sm sm:text-base"
                    disabled={isAnalyzing}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              </div>

              {error && (
                <Alert className="mt-4 border-red-200 bg-red-50">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <AlertDescription className="text-red-800 ml-2 text-sm">{error}</AlertDescription>
                </Alert>
              )}

              {files.length > 0 && (
                <div className="mt-4 sm:mt-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Uploaded Files ({files.length}/10)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                    {files.map((file, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative group"
                      >
                        <div className="aspect-square rounded-lg bg-gray-100 overflow-hidden border-2 border-gray-200">
                          <img
                            src={URL.createObjectURL(file) || "/placeholder.svg"}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          disabled={isAnalyzing}
                          className="absolute -top-2 -right-2 w-7 h-7 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50 shadow-md"
                          aria-label="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 sm:mt-6 flex justify-center">
                <Button
                  onClick={handleAnalyze}
                  disabled={files.length === 0 || isAnalyzing}
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>Start Analysis</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  )
}
