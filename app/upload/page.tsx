"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ShieldAlert, AlertTriangle, Upload, ImageIcon, Loader2, CheckCircle2, Info } from "lucide-react"
import { SparkleEffect } from "@/components/sparkle-effect"
import { analyzeScreenshots } from "@/lib/analyze-screenshots"
import { saveAnalysisResults, generateResultId } from "@/lib/storage-utils"
import { Logo } from "@/components/logo"

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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter out non-image files
    const imageFiles = acceptedFiles.filter((file) => file.type.startsWith("image/"))
    setFiles((prev) => [...prev, ...imageFiles])
    setValidationError(null)
    setError(null) // Clear any previous errors when new files are added
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

    setIsSubmitting(true)
    setError(null)
    setValidationError(null)

    try {
      // Set processing stages for better user feedback
      setProcessingStage("Extracting text from screenshots...")
      console.log("Starting analysis...")

      // Process the screenshots through the enhanced pipeline
      const results = await analyzeScreenshots(files, firstPersonName, secondPersonName)

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
    <div className="flex flex-col min-h-screen bg-love-gradient">
      <SparkleEffect count={20} className="absolute inset-0 pointer-events-none" />

      <main className="flex-1 container px-4 py-12 sm:py-20 relative z-10">
        <div className="text-center mb-8 sm:mb-12">
          <div className="mb-6 inline-block pulse-animation">
            <Logo size="large" withText={true} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-gradient">Upload Conversation Screenshots</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Upload screenshots of your text conversations to analyze emotional intelligence, communication styles, and
            compatibility.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-5">
          <Card className="bg-love-card shadow-lg border-pink-100 md:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle>Upload Your Conversation</CardTitle>
              <CardDescription>
                We accept PNG, JPG, or WEBP screenshots of conversations. Your uploads are private and secure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Screenshot Guidelines Button */}
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-pink-600 flex items-center gap-1"
                  onClick={() => setShowGuidelines(!showGuidelines)}
                >
                  <Info className="h-4 w-4" />
                  {showGuidelines ? "Hide Guidelines" : "Screenshot Tips"}
                </Button>
              </div>

              {/* Screenshot Guidelines */}
              {showGuidelines && (
                <Alert className="bg-pink-50 border-pink-200 mb-4">
                  <div className="space-y-2">
                    <h3 className="font-medium text-pink-800">Screenshot Guidelines for Best Results:</h3>
                    <ul className="list-disc pl-5 text-sm text-pink-700 space-y-1">
                      <li>Use native resolution screenshots (not screenshots-of-screenshots)</li>
                      <li>Ensure both sides of the conversation are clearly visible</li>
                      <li>Include sender names and timestamps when possible</li>
                      <li>Avoid cropping important parts of the conversation</li>
                      <li>Use screenshots from common chat apps (WhatsApp, iMessage, etc.)</li>
                      <li>Make sure text is clear and readable</li>
                    </ul>
                  </div>
                </Alert>
              )}

              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 ${
                  isDragActive ? "border-pink-500 bg-pink-50" : "border-gray-200 hover:border-pink-300"
                } transition-all flex flex-col items-center justify-center cursor-pointer`}
              >
                <input {...getInputProps()} />
                <Upload
                  className={`h-14 w-14 mb-4 ${isDragActive ? "text-pink-500" : "text-gray-400"}`}
                  strokeWidth={1.5}
                />
                {isDragActive ? (
                  <p className="text-center text-pink-500 font-medium">Drop your screenshots here...</p>
                ) : (
                  <div className="text-center text-gray-500">
                    <p className="font-medium mb-1">Drag & drop screenshots here or click to browse</p>
                    <p className="text-sm">We recommend uploading 10-20 screenshots for best results</p>
                  </div>
                )}
              </div>

              {/* Files preview */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">{files.length} File(s) Selected</h3>
                  <div className="max-h-60 overflow-y-auto border rounded-md divide-y">
                    {files.map((file, index) => (
                      <div key={index} className="py-2 px-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-gray-100 rounded-md overflow-hidden relative flex-shrink-0">
                            <ImageIcon className="h-6 w-6 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.split("/")[1].toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile(index)
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Validation error */}
              {validationError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}

              {/* Error message */}
              {error && (
                <Alert variant="destructive">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleSubmit}
                className="w-full py-6 text-base"
                disabled={isSubmitting || files.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {processingStage || "Analyzing..."}
                  </>
                ) : (
                  <>Analyze Conversation</>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-love-card shadow-lg border-pink-100 md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>Conversation Participants</CardTitle>
              <CardDescription>
                Help us identify who's who in the conversation for more personalized analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="first-person">You (First Person)</Label>
                  <Input
                    id="first-person"
                    placeholder="Your name in the conversation"
                    value={firstPersonName}
                    onChange={(e) => setFirstPersonName(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">This is you or the person's perspective you're analyzing from</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="second-person">Other Person</Label>
                  <Input
                    id="second-person"
                    placeholder="The other person's name"
                    value={secondPersonName}
                    onChange={(e) => setSecondPersonName(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">The person you're conversing with</p>
                </div>
              </div>

              <Alert className="bg-pink-50 border-pink-200">
                <CheckCircle2 className="h-4 w-4 text-pink-600" />
                <AlertTitle className="text-pink-800">Private & Confidential</AlertTitle>
                <AlertDescription className="text-pink-700 text-sm">
                  Your conversations are analyzed locally and never stored on our servers. Your privacy is our priority.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="py-6 border-t border-pink-100 bg-white bg-opacity-80 backdrop-blur-sm relative z-10">
        <div className="container text-center">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} LoveLens. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
