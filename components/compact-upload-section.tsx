"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { analyzeConversation } from "@/app/actions"
import { UploadCloud, File, X, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import AnalysisLoadingScreen from "./analysis-loading-screen"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { storeResults } from "@/lib/results-storage"
import { useRouter } from "next/navigation"

export default function CompactUploadSection() {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [filesExpanded, setFilesExpanded] = useState(true)
  const [analysisStage, setAnalysisStage] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const reasons = rejectedFiles.map((file) => {
        if (file.errors[0]?.code === "file-too-large") {
          return `${file.file.name}: File too large (max 20MB)`
        }
        if (file.errors[0]?.code === "file-invalid-type") {
          return `${file.file.name}: Invalid file type (images only)`
        }
        return `${file.file.name}: Upload error`
      })
      setError(`Upload issues:\n${reasons.join("\n")}`)
      return
    }

    const imageFiles = acceptedFiles.filter((file) => {
      return file.type.includes("image")
    })

    if (imageFiles.length === 0) {
      setError("Please upload image files only (JPG, PNG, GIF, WebP)")
      return
    }

    setFiles((prev) => [...prev, ...imageFiles])
    setFilesExpanded(true)
    setError(null)
    setUploadSuccess(true)

    // Clear success message after 3 seconds
    setTimeout(() => setUploadSuccess(false), 3000)
  }, [])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
      "image/webp": [".webp"],
    },
    maxSize: 20971520, // 20MB
    multiple: true,
  })

  const removeFile = (index: number) => {
    setFiles((files) => files.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (files.length === 0) {
      setError("Please upload at least one screenshot")
      return
    }

    setError(null)
    setIsUploading(true)
    setUploadProgress(0)
    setAnalysisStage("Preparing images for analysis")

    try {
      const formData = new FormData()
      files.forEach((file, index) => {
        formData.append(`file-${index}`, file)
      })

      setUploadProgress(10)
      const fileText = files.length === 1 ? "screenshot" : "screenshots"
      setAnalysisStage(`Extracting text from ${files.length} ${fileText}`)

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev < 30) return prev + 2
          if (prev < 60) return prev + 1
          if (prev < 90) return prev + 0.5
          return prev
        })
      }, 500)

      const results = await analyzeConversation(formData)

      clearInterval(progressInterval)

      if (results.error) {
        setError(results.error)
        setIsUploading(false)
        setUploadProgress(0)
        return
      }

      setUploadProgress(100)
      setAnalysisStage("Analysis complete!")

      // Store results and navigate to results page
      setTimeout(() => {
        const resultId = storeResults(results)
        router.push(`/results?id=${resultId}`)
      }, 500)
    } catch (error) {
      console.error("Error analyzing conversation:", error)
      setError("An unexpected error occurred. Please try again.")
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div id="upload-section" className="scroll-mt-16">
      {isUploading && <AnalysisLoadingScreen progress={uploadProgress} message={analysisStage} />}

      <div className="mb-6 text-center">
        <h2 className="mb-2 text-2xl md:text-3xl font-bold text-gray-900">Analyze Your Conversation</h2>
        <p className="mx-auto max-w-2xl text-gray-600">
          Upload clear screenshots of your text conversations. The clearer the images, the more accurate the analysis.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
        </Alert>
      )}

      {uploadSuccess && (
        <Alert className="mb-4 border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {files.length === 1
              ? "Screenshot uploaded successfully!"
              : `${files.length} screenshots uploaded successfully!`}
          </AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden bg-white shadow-md">
        <div className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer",
                isDragActive && !isDragReject && "border-purple-500 bg-purple-50",
                isDragReject && "border-red-500 bg-red-50",
                !isDragActive && "border-gray-300 hover:bg-gray-50",
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className={cn("rounded-full p-2", isDragReject ? "bg-red-100" : "bg-purple-100")}>
                  <UploadCloud className={cn("h-6 w-6", isDragReject ? "text-red-600" : "text-purple-600")} />
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-900">
                    {isDragActive
                      ? isDragReject
                        ? "Invalid file type"
                        : "Drop files here"
                      : "Upload conversation screenshots"}
                  </h3>
                  <p className="text-xs text-gray-500">Drag and drop or click to select files</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WebP up to 20MB each</p>
                </div>
              </div>
            </div>

            {files.length > 0 && (
              <Collapsible open={filesExpanded} onOpenChange={setFilesExpanded}>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">
                      Selected files ({files.length})
                      <span className="ml-2 text-sm text-gray-500">
                        {(files.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(1)}MB total
                      </span>
                    </h3>
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
                className="bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isUploading ? "Analyzing..." : "Analyze Conversation"}</span>
                {!isUploading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ")
}
