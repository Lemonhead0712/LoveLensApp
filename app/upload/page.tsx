"use client"

import { useCallback, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { analyzeScreenshots } from "@/lib/analyze-screenshots"
import { saveAnalysisResults, generateResultId } from "@/lib/storage-utils"
import { isClient } from "@/lib/utils"
import { UploadForm } from "@/components/upload-form"
import { ScreenshotGuidelines } from "@/components/screenshot-guidelines"
import { Steps } from "@/components/steps"

function OCRInfoSection() {
  return (
    <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
      <h3 className="font-medium text-blue-800">Having trouble with text extraction?</h3>
      <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
        <li>Use screenshots with clear, readable text</li>
        <li>Ensure good contrast between text and background</li>
        <li>PNG format works best for text recognition</li>
        <li>Try enabling debug mode to see preprocessing options</li>
        <li>Crop screenshots to focus on just the conversation</li>
      </ul>
    </div>
  )
}

export default function UploadPage() {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [firstPersonName, setFirstPersonName] = useState("You")
  const [secondPersonName, setSecondPersonName] = useState("Partner")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [processingStage, setProcessingStage] = useState<string | null>(null)
  const [showGuidelines, setShowGuidelines] = useState(false)
  const [isClientSide, setIsClientSide] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [debugData, setDebugData] = useState<any>(null)
  const [currentFileIndex, setCurrentFileIndex] = useState(0)

  // Check if we're on the client side
  useEffect(() => {
    setIsClientSide(isClient())
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter out non-image files
    const imageFiles = acceptedFiles.filter((file) => file.type.startsWith("image/"))
    setFiles((prev) => [...prev, ...imageFiles])
    setValidationError(null)
    setError(null) // Clear any previous errors when new files are added

    // Reset debug data when new files are added
    setDebugData(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxSize: 10485760, // 10MB
    onDropRejected: (fileRejections) => {
      if (fileRejections.some((r) => r.errors.some((e) => e.code === "file-too-large"))) {
        setValidationError("File is too large. Maximum size is 10MB.")
      } else if (fileRejections.some((r) => r.errors.some((e) => e.code === "file-invalid-type"))) {
        setValidationError("Invalid file type. Only images are accepted.")
      } else {
        setValidationError("File upload failed. Please try again.")
      }
    },
  })

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))

    // Reset debug data when files are removed
    setDebugData(null)
  }

  // Process a single file for debugging
  const processFileForDebug = async (fileIndex: number) => {
    if (!files[fileIndex]) return

    setIsSubmitting(true)
    setError(null)
    setProcessingStage("Extracting text for debug visualization...")

    try {
      // Create a FileList-like object with just the selected file
      const singleFile = [files[fileIndex]]

      // Process with debug flag enabled
      const results = await analyzeScreenshots(singleFile, firstPersonName, secondPersonName, {
        debug: true,
        collectDebugInfo: true,
      })

      // Get debug data from the results
      if (results && results.debugInfo) {
        setDebugData(results.debugInfo)
      } else {
        throw new Error("No debug information available")
      }
    } catch (error) {
      console.error("Error processing file for debug:", error)
      setError(`Debug processing failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSubmitting(false)
      setProcessingStage(null)
    }
  }

  const handleSubmit = async () => {
    if (files.length === 0) {
      setValidationError("Please upload at least one conversation screenshot.")
      return
    }

    if (!firstPersonName.trim() || !secondPersonName.trim()) {
      setValidationError("Please enter names for both participants.")
      return
    }

    // Check if we're on the client side
    if (!isClientSide) {
      setValidationError("This feature requires client-side processing. Please try again in the browser.")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setValidationError(null)

    try {
      // Set processing stages for better user feedback
      setProcessingStage("Extracting text from screenshots...")
      console.log("Starting analysis...")

      // Process the screenshots through the enhanced pipeline
      const results = await analyzeScreenshots(files, firstPersonName, secondPersonName, {
        debug: debugMode,
      })

      // Check if results are valid
      if (!results) {
        throw new Error("Analysis failed to produce valid results")
      }

      console.log(
        "Analysis completed, extracted text length:",
        results.messages?.length || 0,
        "messages with sentiment data",
      )

      // Generate a unique ID for this analysis
      setProcessingStage("Saving analysis results...")
      const resultId = generateResultId()

      // Add the ID to the results
      results.id = resultId

      // Save results to localStorage with the ID
      const saveSuccess = await saveAnalysisResults(results, resultId)

      if (!saveSuccess) {
        throw new Error("Failed to save analysis results")
      }

      console.log("Results saved successfully with ID:", resultId)

      // Verify the ID exists before redirecting
      if (!resultId) {
        throw new Error("No result ID generated")
      }

      // Navigate to results page with the ID
      console.log("Redirecting to results page with ID:", resultId)
      router.push(`/results?id=${resultId}`)
    } catch (error) {
      console.error("Error analyzing screenshots:", error)

      // Provide more specific error messages based on the error type
      if (error instanceof Error) {
        if (error.message.includes("OCR failed") || error.message.includes("No messages")) {
          setError(
            "We couldn't extract any messages from your screenshots. Please make sure your screenshots clearly show both sides of the conversation and follow our screenshot guidelines.",
          )
        } else if (error.message.includes("message separation failed")) {
          setError(
            "We couldn't identify messages from both participants. Please ensure your screenshots show messages from both people in the conversation.",
          )
        } else {
          setError(`An error occurred: ${error.message}. Please try again with different screenshots.`)
        }
      } else {
        setError("An unexpected error occurred. Please try again with different screenshots.")
      }

      setProcessingStage(null)
      // Show guidelines when OCR fails
      setShowGuidelines(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold text-center mb-8 text-gradient">Upload Your Conversation</h1>

      <div className="mb-8">
        <Steps currentStep={1} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="order-2 md:order-1">
          <UploadForm />
        </div>

        <div className="order-1 md:order-2">
          <ScreenshotGuidelines />
        </div>
      </div>
    </div>
  )
}
