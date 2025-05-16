"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button-override"
import { EmotionalIntelligenceReflection } from "@/components/reflections/emotional-intelligence-reflection"
import { CommunicationStyleReflection } from "@/components/reflections/communication-style-reflection"
import { RelationshipDynamicsReflection } from "@/components/reflections/relationship-dynamics-reflection"
import { PsychologyReflection } from "@/components/reflections/psychology-reflection"
import { CompatibilityReflection } from "@/components/reflections/compatibility-reflection"
import { ImprovementPlan } from "@/components/reflections/improvement-plan"
import { getAnalysisResults } from "@/lib/storage-utils"
import type { AnalysisResults } from "@/lib/types"

export default function ReflectionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("emotional")

  useEffect(() => {
    if (!id) {
      router.push("/")
      return
    }

    const fetchResults = async () => {
      try {
        const results = await getAnalysisResults(id)
        if (results) {
          setAnalysisResults(results)
        } else {
          console.error("No results found for ID:", id)
          router.push("/")
        }
      } catch (error) {
        console.error("Error fetching results:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [id, router])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading your reflections...</h2>
          <p className="text-muted-foreground">This may take a moment as we prepare your personalized insights.</p>
        </div>
      </div>
    )
  }

  if (!analysisResults) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Reflections Not Found</h2>
          <p className="text-muted-foreground mb-6">We couldn't find the reflections you're looking for.</p>
          <Button onClick={() => router.push("/")}>Return Home</Button>
        </div>
      </div>
    )
  }

  const firstPerson = analysisResults.participants.find((p) => p.isFirstPerson)
  const secondPerson = analysisResults.participants.find((p) => !p.isFirstPerson)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Relationship Reflections</h1>
            <p className="text-muted-foreground">
              Deeper insights into your communication with <span className="font-medium">{firstPerson?.name}</span> and{" "}
              <span className="font-medium">{secondPerson?.name}</span>
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    Overall Compatibility: {analysisResults.finalCompatibilityScore || analysisResults.overallScore}%
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on analysis of {analysisResults.messageCount} messages
                  </p>
                </div>
                <Button onClick={() => router.push(`/results?id=${id}`)}>View Analysis</Button>
              </div>
            </div>
          </div>

          <div className="mb-6 overflow-hidden">
            <Tabs defaultValue="emotional" className="space-y-8" onValueChange={handleTabChange}>
              <div className="relative -mx-4 px-4">
                <div className="overflow-x-auto pb-3 -mb-3 px-0.5">
                  <TabsList className="w-max flex space-x-1 min-w-full">
                    <TabsTrigger value="emotional" className="px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap">
                      Emotional Intelligence
                    </TabsTrigger>
                    <TabsTrigger value="communication" className="px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap">
                      Communication
                    </TabsTrigger>
                    <TabsTrigger value="relationship" className="px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap">
                      Relationship
                    </TabsTrigger>
                    <TabsTrigger value="psychology" className="px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap">
                      Psychology
                    </TabsTrigger>
                    <TabsTrigger value="compatibility" className="px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap">
                      Compatibility
                    </TabsTrigger>
                    <TabsTrigger value="improvement" className="px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap">
                      Improvement Plan
                    </TabsTrigger>
                  </TabsList>
                </div>
                <div className="absolute left-0 right-0 bottom-0 h-3 pointer-events-none bg-gradient-to-t from-background to-transparent" />
              </div>

              <TabsContent value="emotional" className="mt-6">
                {activeTab === "emotional" && analysisResults && (
                  <EmotionalIntelligenceReflection analysisResults={analysisResults} />
                )}
              </TabsContent>

              <TabsContent value="communication" className="mt-6">
                {activeTab === "communication" && analysisResults && (
                  <CommunicationStyleReflection analysisResults={analysisResults} />
                )}
              </TabsContent>

              <TabsContent value="relationship" className="mt-6">
                {activeTab === "relationship" && analysisResults && (
                  <RelationshipDynamicsReflection analysisResults={analysisResults} />
                )}
              </TabsContent>

              <TabsContent value="psychology" className="mt-6">
                {activeTab === "psychology" && analysisResults && (
                  <PsychologyReflection analysisResults={analysisResults} />
                )}
              </TabsContent>

              <TabsContent value="compatibility" className="mt-6">
                {activeTab === "compatibility" && analysisResults && (
                  <CompatibilityReflection analysisResults={analysisResults} />
                )}
              </TabsContent>

              <TabsContent value="improvement" className="mt-6">
                {activeTab === "improvement" && analysisResults && (
                  <ImprovementPlan analysisResults={analysisResults} />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
