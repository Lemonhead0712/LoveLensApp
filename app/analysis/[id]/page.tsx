"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getAnalysisResult } from "@/lib/database"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Trash2 } from "lucide-react"
import AnalysisResults from "@/components/analysis-results"
import { useToast } from "@/components/ui/use-toast"
import type { AnalysisResult } from "@/types/database"

export default function AnalysisPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadAnalysis() {
      if (!id || typeof id !== "string") {
        router.push("/dashboard")
        return
      }

      try {
        const result = await getAnalysisResult(id)
        if (!result) {
          toast({
            title: "Analysis not found",
            description: "The requested analysis could not be found",
            variant: "destructive",
          })
          router.push("/dashboard")
          return
        }

        // Check if the analysis belongs to the current user
        if (user && result.user_id !== user.id) {
          toast({
            title: "Unauthorized",
            description: "You don't have permission to view this analysis",
            variant: "destructive",
          })
          router.push("/dashboard")
          return
        }

        setAnalysis(result)
      } catch (error) {
        console.error("Error loading analysis:", error)
        toast({
          title: "Error",
          description: "Failed to load the analysis. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading && user) {
      loadAnalysis()
    } else if (!authLoading && !user) {
      router.push("/login")
    }
  }, [id, user, authLoading, router, toast])

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    )
  }

  if (!analysis) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" onClick={() => router.push("/dashboard")} className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Analysis
          </Button>
        </div>

        <AnalysisResults analysis={analysis.analysis_data} />
      </div>
    </div>
  )
}
