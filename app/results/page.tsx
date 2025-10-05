"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CompactPageLayout } from "@/components/compact-page-layout"
import EnhancedAnalysisResults from "@/components/enhanced-analysis-results"
import { getResults } from "@/lib/results-storage"

function ResultsContent() {
  const router = useRouter()
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const results = getResults()
    if (!results) {
      router.push("/")
      return
    }
    setAnalysisData(results)
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    )
  }

  if (!analysisData) {
    return null
  }

  return <EnhancedAnalysisResults analysisData={analysisData} />
}

export default function ResultsPage() {
  return (
    <CompactPageLayout>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading results...</p>
            </div>
          </div>
        }
      >
        <ResultsContent />
      </Suspense>
    </CompactPageLayout>
  )
}
