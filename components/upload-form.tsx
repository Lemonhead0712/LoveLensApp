"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { analyzeConversation } from "@/app/actions"
import AnalysisResults from "./analysis-results"
import { UploadCloud } from "lucide-react"

export default function UploadForm() {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter((file) => file.type.includes("image"))
      setFiles((prevFiles) => [...prevFiles, ...newFiles])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setFiles((prevFiles) => [...prevFiles, ...newFiles])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (files.length === 0) return

    setIsUploading(true)
    try {
      // In a real app, we would upload the files to the server
      // For this demo, we'll simulate the analysis with a delay
      const formData = new FormData()
      files.forEach((file, index) => {
        formData.append(`file-${index}`, file)
      })

      const results = await analyzeConversation(formData)
      setAnalysisResults(results)
    } catch (error) {
      console.error("Error analyzing conversation:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  }

  const resetForm = () => {
    setFiles([])
    setAnalysisResults(null)
  }

  if (analysisResults) {
    return (
      <div>
        <AnalysisResults results={analysisResults} />
        <div className="mt-8 text-center">
          <Button onClick={resetForm} variant="outline" className="mr-4">
            Analyze Another Conversation
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="p-6 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className={`border-2 border-dashed rounded-lg p-10 text-center ${
            dragActive ? "border-rose-500 bg-rose-50" : "border-gray-300"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4 flex text-sm leading-6 text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer rounded-md font-semibold text-rose-600 hover:text-rose-500"
            >
              <span>Upload conversation screenshots</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                multiple
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs leading-5 text-gray-600 mt-2">PNG, JPG, GIF up to 10MB each</p>
        </div>

        {files.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium text-gray-900 mb-2">Selected files:</h3>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="truncate max-w-xs">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={isUploading || files.length === 0}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            {isUploading ? "Analyzing..." : "Analyze Conversation"}
          </Button>
        </div>
      </form>
    </Card>
  )
}
