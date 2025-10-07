"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, ImageIcon, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { analyzeConversation } from "@/app/actions"
import { storeResults } from "@/lib/results-storage"
import ModernAnalysisLoading from "@/components/modern-analysis-loading"

export default function EnhancedCompactUpload() {
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [subject1Name, setSubject1Name] = useState("")
  const [subject2Name, setSubject2Name] = useState("")
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

      const formData = new FormData()
      files.forEach((file, index) => {
        formData.append(`file-${index}`, file)
      })
      if (subject1Name) formData.append("subjectAName", subject1Name)
      if (subject2Name) formData.append("subjectBName", subject2Name)

      console.log("Starting analysis with", files.length, "files")
      const results = await analyzeConversation(formData)

      clearInterval(progressInterval)
      setProgress(100)

      console.log("Analysis complete, results:", results)

      if (results.error) {
        console.error("Analysis error:", results.error)
        setError(results.error)
        setIsAnalyzing(false)
        return
      }

      const resultId = storeResults(results)
      console.log("Results stored with ID:", resultId)

      setTimeout(() => {
        console.log("Navigating to results page")
        router.push(`/results?id=${resultId}`)
      }, 500)
    } catch (err: any) {
      console.error("Error during analysis:", err)
      setError(err.message || "An unexpected error occurred. Please try again.")
      setIsAnalyzing(false)
    }
  }

  return (
    <>
      <AnimatePresence>
        {isAnalyzing && <ModernAnalysisLoading progress={progress} message="Analyzing your conversation..." />}
      </AnimatePresence>

      <div className="w-full max-w-4xl mx-auto px-4 py-8" id="upload-section">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Upload Your Conversation</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Upload screenshots of your text conversations. We support iPhone, Android, WhatsApp, and other messaging
              apps.
            </p>
          </div>

          <Card className="border-2 border-gray-200 shadow-lg">
            <CardContent className="p-6">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
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
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {isDragging ? "Drop your screenshots here" : "Drag & drop or click to upload"}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Support for PNG, JPG, JPEG • Up to 10 images • Max 10MB each
                  </p>
                  <Button
                    variant="outline"
                    className="bg-white hover:bg-purple-50 border-purple-300 text-purple-700"
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
                  <AlertDescription className="text-red-800 ml-2">{error}</AlertDescription>
                </Alert>
              )}

              {files.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Uploaded Files ({files.length}/10)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
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
                  <p className="text-xs text-gray-600 mb-4">
                    Enter custom names for the conversation participants. Leave blank to use default labels.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        className="w-full"
                      />
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
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-center">
                <Button
                  onClick={handleAnalyze}
                  disabled={files.length === 0 || isAnalyzing}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
