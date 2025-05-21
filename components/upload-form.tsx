"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function UploadForm() {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (files.length === 0) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append("screenshots", file)
      })

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const { analysisId } = await response.json()
        router.push(`/analysis/${analysisId}`)
      } else {
        throw new Error("Failed to upload images")
      }
    } catch (error) {
      console.error("Error uploading images:", error)
      alert("Failed to upload images. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
              isDragging ? "border-rose-400 bg-rose-50" : "border-gray-300 hover:border-rose-300",
              "focus-within:border-rose-400",
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <Upload className="h-10 w-10 text-gray-400" />
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Upload conversation screenshots</h3>
                <p className="text-sm text-gray-500">Drag and drop your screenshots here, or click to browse</p>
              </div>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                onChange={handleFileChange}
                multiple
                accept="image/*"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("file-upload")?.click()}
                className="mt-2"
              >
                Select Files
              </Button>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Selected files:</h4>
              <ul className="space-y-1">
                {files.map((file, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <Button
              type="submit"
              disabled={files.length === 0 || isUploading}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Analyze Conversation"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
