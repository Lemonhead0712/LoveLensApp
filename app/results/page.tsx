"use client"

import { useEffect, useState, Suspense, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { getResults } from "@/lib/results-storage"
import CompactHeader from "@/components/compact-header"
import CompactFooter from "@/components/compact-footer"
import EnhancedAnalysisResults from "@/components/enhanced-analysis-results"
import LoadingAnalysis from "@/components/loading-analysis"
import { AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function ResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Extract the ID once and memoize it to prevent re-renders
  const resultId = useMemo(() => searchParams?.get("id"), [searchParams])

  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Only run once when component mounts or when resultId changes
    if (!resultId) {
      setError(true)
      setLoading(false)
      return
    }

    // Try to get results from storage
    const storedResults = getResults(resultId)

    if (storedResults) {
      setResults(storedResults)
      setError(false)
    } else {
      setError(true)
    }

    setLoading(false)
  }, [resultId]) // Only depend on the memoized resultId

  if (loading) {
    return <LoadingAnalysis />
  }

  if (error || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Results Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find the analysis results you're looking for. They may have expired or the link may be invalid.
          </p>
          <Button onClick={() => router.push("/")} className="bg-purple-600 hover:bg-purple-700 text-white w-full">
            Return to Home
          </Button>
        </Card>
      </div>
    )
  }

  return <EnhancedAnalysisResults results={results} />
}

export default function ResultsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <CompactHeader />
      <main className="flex-grow">
        <Suspense fallback={<LoadingAnalysis />}>
          <ResultsContent />
        </Suspense>
      </main>
      <CompactFooter />
    </div>
  )
}
