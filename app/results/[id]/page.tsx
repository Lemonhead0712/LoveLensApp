import { Suspense } from "react"
import CompactHeader from "@/components/compact-header"
import CompactFooter from "@/components/compact-footer"
import { AnalysisResultsLayout } from "@/components/analysis-results-layout"
import { getMockAnalysisResults } from "@/lib/mock-analysis-data"

export default function ResultsPage() {
  const results = getMockAnalysisResults()

  return (
    <main className="min-h-screen bg-white">
      <CompactHeader />
      <Suspense fallback={<div className="py-20 text-center">Loading analysis...</div>}>
        <AnalysisResultsLayout results={results} />
      </Suspense>
      <CompactFooter />
    </main>
  )
}
