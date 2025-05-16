"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { analyzeScreenshots } from "@/lib/analyze-screenshots"
import { saveAnalysisResults } from "@/lib/storage-utils"
import { LoadingScreen } from "./loading-screen"

interface AnalysisProcessorProps {
  files: File[]
  firstPersonName: string
  secondPersonName: string
  onComplete?: () => void
  onError?: (error: string) => void
}

export function AnalysisProcessor({
  files,
  firstPersonName,
  secondPersonName,
  onComplete,
  onError,
}: AnalysisProcessorProps) {
  const router = useRouter()
  const [currentStage, setCurrentStage] = useState("Preparing screenshots for analysis...")
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const processAnalysis = async () => {
      try {
        // Stage 1: Prepare screenshots
        setCurrentStage("Preparing screenshots for analysis...")
        setProgress(10)
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Stage 2: Extract text using OCR
        setCurrentStage("Extracting text from screenshots...")
        setProgress(25)
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Stage 3: Analyzing sentiment
        setCurrentStage("Analyzing emotional patterns...")
        setProgress(40)
        await new Promise((resolve) => setTimeout(resolve, 1200))

        // Stage 4: Perform the actual analysis
        setCurrentStage("Applying AI analysis to conversation...")
        setProgress(60)
        const results = await analyzeScreenshots(files, firstPersonName, secondPersonName)

        // Stage 5: Generate insights
        setCurrentStage("Generating relationship insights...")
        setProgress(80)
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Stage 6: Save results
        setCurrentStage("Finalizing your results...")
        setProgress(95)
        saveAnalysisResults(results)
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Complete
        setProgress(100)
        setCurrentStage("Analysis complete!")

        // Notify completion
        if (onComplete) {
          onComplete()
        }

        // Navigate to results page
        router.push("/results")
      } catch (error) {
        console.error("Analysis error:", error)
        if (onError) {
          onError(error instanceof Error ? error.message : "An unknown error occurred during analysis")
        }
      }
    }

    processAnalysis()
  }, [files, firstPersonName, secondPersonName, onComplete, onError, router])

  return <LoadingScreen message={currentStage} fullScreen={true} progressPercent={progress} />
}
