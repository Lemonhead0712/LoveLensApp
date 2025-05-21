"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Typography, Box, CircularProgress, Alert } from "@mui/material"

interface UploadFormProps {
  onSuccess: (data: any) => void
  onError?: (error: string) => void
}

const UploadForm: React.FC<UploadFormProps> = ({ onSuccess, onError }) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsProcessing(true)
      setError(null)

      const file = acceptedFiles[0]
      const formData = new FormData()
      formData.append("image", file)

      try {
        const response = await fetch("/api/process-image", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to process image")
        }

        const data = await response.json()
        onSuccess(data)
      } catch (error: any) {
        console.error("Error processing image:", error)

        // Add this to the catch block where OCR errors are handled
        if (error.message?.includes("OCR failed: No messages could be extracted and fallback is disabled")) {
          setError(
            "OCR failed to extract any messages from your image. Please try a clearer image or different preprocessing options.",
          )
          setIsProcessing(false)
          return
        }

        setError(error.message || "An unexpected error occurred")
        if (onError) {
          onError(error.message || "An unexpected error occurred")
        }
      } finally {
        setIsProcessing(false)
      }
    },
    [onSuccess, onError],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg"],
    },
  })

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, p: 3 }}>
      <div
        {...getRootProps()}
        style={{ border: "2px dashed #ccc", padding: "20px", textAlign: "center", cursor: "pointer", width: "100%" }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <Typography>Drop the files here ...</Typography>
        ) : (
          <Typography>Drag 'n' drop some files here, or click to select files</Typography>
        )}
      </div>
      {isProcessing && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {/* You can add additional UI elements here, such as a preview of the uploaded image */}
    </Box>
  )
}

export default UploadForm
