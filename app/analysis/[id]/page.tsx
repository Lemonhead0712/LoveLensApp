import { notFound } from "next/navigation"
import { AnalysisResult } from "@/components/analysis-result"
import { AnalysisLoading } from "@/components/analysis-loading"

async function getAnalysis(id: string) {
  try {
    // In a real app, this would fetch from your API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/analyze?id=${id}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch analysis")
    }

    return response.json()
  } catch (error) {
    console.error("Error fetching analysis:", error)
    return null
  }
}

export default async function AnalysisPage({ params }: { params: { id: string } }) {
  const analysis = await getAnalysis(params.id)

  if (!analysis) {
    notFound()
  }

  if (analysis.status === "completed") {
    return (
      <div className="container mx-auto px-4 py-12">
        <AnalysisResult analysis={analysis.result} />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <AnalysisLoading status={analysis.status} />
    </div>
  )
}
