"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getAnalysisResults, transformAnalysisResultsToResult } from "@/lib/storage-utils"
import { LoadingScreen } from "@/components/loading-screen"
import { Button } from "@/components/ui/button-override"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import ProfileCard from "@/components/ProfileCard"
import CompatibilityCard from "@/components/CompatibilityCard"
import GottmanBreakdown from "@/components/GottmanBreakdown"
import EmotionalRadarChart from "@/components/emotional-radar-chart"
import CommunicationStylesChart from "@/components/communication-styles-chart"
import PsychologicalProfileCard from "@/components/psychological-profile-card"
import RelationshipDynamicsCard from "@/components/relationship-dynamics-card"
import { GottmanScoreCard } from "@/components/gottman-score-card"
import { EmotionalIntelligenceBreakdown } from "@/components/emotional-intelligence-breakdown"

// Add the DebugDataViewer to the results page
import DebugDataViewer from "@/components/debug-data-viewer"

export default function ResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const resultId = searchParams.get("id")

  const [results, setResults] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!resultId) {
      setError("No analysis ID provided. Please upload conversation screenshots to get started.")
      setLoading(false)
      return
    }

    // Debug: list what's actually in localStorage
    console.log("LocalStorage keys:", Object.keys(localStorage))
    console.log("Looking for result with ID:", resultId)

    // Try to get results
    const stored = getAnalysisResults(resultId)
    if (stored) {
      console.log("Results found immediately:", stored)

      try {
        // Transform the data if needed
        const transformedResults = transformResultsIfNeeded(stored)
        setResults(transformedResults)
        setLoading(false)
      } catch (err) {
        console.error("Error transforming results:", err)
        setError("Error processing analysis results. Please try again.")
        setLoading(false)
      }
    } else {
      // Wait briefly before redirecting in case localStorage isn't ready yet
      setTimeout(() => {
        const retry = getAnalysisResults(resultId)
        if (retry) {
          console.log("Results found after delay:", retry)

          try {
            // Transform the data if needed
            const transformedResults = transformResultsIfNeeded(retry)
            setResults(transformedResults)
            setLoading(false)
          } catch (err) {
            console.error("Error transforming results after retry:", err)
            setError("Error processing analysis results. Please try again.")
            setLoading(false)
          }
        } else {
          console.warn(`No results found for ID ${resultId} after retry.`)
          setError("No analysis results found. Please upload conversation screenshots to get started.")
          setLoading(false)
        }
      }, 1500)
    }
  }, [resultId])

  // Function to transform results if they're in the old format
  function transformResultsIfNeeded(data: any): any {
    console.log("Checking if results need transformation:", data)

    // If it's already in the expected format with conversationData
    if (data.conversationData && data.conversationData.personA && data.conversationData.personB) {
      console.log("Data already in expected format")
      return data
    }

    // If it's in the AnalysisResults format with participants array
    if (data.participants && Array.isArray(data.participants)) {
      console.log("Transforming data from AnalysisResults format")
      return transformAnalysisResultsToResult(data)
    }

    // If we can't determine the format, throw an error
    console.error("Unknown data format:", data)
    throw new Error("Unknown data format")
  }

  if (loading) {
    return <LoadingScreen message="Loading your relationship insights..." />
  }

  if (error || !results) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-love-gradient">
        <div className="text-center max-w-md px-4">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">No Analysis Results Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "We couldn't find any analysis results. Please upload conversation screenshots to get started."}
          </p>
          <Link href="/upload">
            <Button className="h-12">Upload Conversations</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Extract data from results
  const personA = results.conversationData?.personA || {}
  const personB = results.conversationData?.personB || {}

  // Extract Gottman Four Horsemen scores for both participants
  const personAGottmanScores = {
    criticism: results.compatibility?.gottmanScores?.criticism || 30,
    contempt: results.compatibility?.gottmanScores?.contempt || 25,
    defensiveness: results.compatibility?.gottmanScores?.defensiveness || 35,
    stonewalling: results.compatibility?.gottmanScores?.stonewalling || 20,
  }

  const personBGottmanScores = {
    criticism: results.compatibility?.gottmanScores?.partnerCriticism || 35,
    contempt: results.compatibility?.gottmanScores?.partnerContempt || 30,
    defensiveness: results.compatibility?.gottmanScores?.partnerDefensiveness || 40,
    stonewalling: results.compatibility?.gottmanScores?.partnerStonewalling || 25,
  }

  // Get Gottman ratio from compatibility data
  const gottmanRatio = results.compatibility?.gottmanScores?.positiveNegativeRatio || undefined

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Your Relationship Insights</h1>

        {/* Individual Profiles Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">Individual Profiles</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {personA && (
              <ProfileCard
                name={personA.name || "You"}
                communicationStyle={personA.communicationStyle || "Balanced"}
                emotionalIntelligence={
                  typeof personA.emotionalIntelligence === "number" ? personA.emotionalIntelligence : 65
                }
                attachmentStyle={personA.psychologicalProfile?.attachmentStyle?.primaryStyle || "Secure"}
                egoState={personA.psychologicalProfile?.transactionalAnalysis?.dominantEgoState || "Adult"}
                sentiment={personA.sentiment || 70}
                insight={personA.insights?.[0]}
                recommendation={personA.recommendations?.[0]}
              />
            )}

            {personB && (
              <ProfileCard
                name={personB.name || "Partner"}
                communicationStyle={personB.communicationStyle || "Balanced"}
                emotionalIntelligence={
                  typeof personB.emotionalIntelligence === "number" ? personB.emotionalIntelligence : 65
                }
                attachmentStyle={personB.psychologicalProfile?.attachmentStyle?.primaryStyle || "Secure"}
                egoState={personB.psychologicalProfile?.transactionalAnalysis?.dominantEgoState || "Adult"}
                sentiment={personB.sentiment || 70}
                insight={personB.insights?.[0]}
                recommendation={personB.recommendations?.[0]}
              />
            )}
          </div>
        </section>

        {/* Compatibility Card Section */}
        <section className="mb-8">
          <CompatibilityCard
            finalScore={results.compatibility?.finalScore || 65}
            attachment={results.compatibility?.attachment || 60}
            communication={results.compatibility?.communication || 70}
            emotionalSync={results.compatibility?.emotionalSync || 65}
            gottmanSummary={results.compatibility?.gottmanSummary || results.gottmanSummary}
            gottmanRatio={gottmanRatio}
          />
        </section>

        {/* Gottman Breakdown Section */}
        <section className="mb-8">
          <GottmanBreakdown
            personA={{
              name: personA.name || "You",
              scores: personAGottmanScores,
            }}
            personB={{
              name: personB.name || "Partner",
              scores: personBGottmanScores,
            }}
          />
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-center">You</h2>
            {personA.emotionalIntelligence ? (
              <EmotionalRadarChart data={personA.emotionalIntelligence} />
            ) : (
              <div className="text-muted text-sm p-8 text-center bg-gray-50 rounded-lg">
                No emotional intelligence data available.
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4 text-center">Your Partner</h2>
            {personB.emotionalIntelligence ? (
              <EmotionalRadarChart data={personB.emotionalIntelligence} />
            ) : (
              <div className="text-muted text-sm p-8 text-center bg-gray-50 rounded-lg">
                No emotional intelligence data available.
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-center">Your Communication Style</h2>
            {personA.communicationStyle ? (
              <CommunicationStylesChart communicationStyle={personA.communicationStyle} />
            ) : (
              <div className="text-muted text-sm p-8 text-center bg-gray-50 rounded-lg">
                No communication style data available.
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4 text-center">Your Partner's Communication Style</h2>
            {personB.communicationStyle ? (
              <CommunicationStylesChart communicationStyle={personB.communicationStyle} />
            ) : (
              <div className="text-muted text-sm p-8 text-center bg-gray-50 rounded-lg">
                No communication style data available.
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-center">Your Psychological Profile</h2>
            {personA.psychologicalProfile ? (
              <PsychologicalProfileCard
                profile={personA.psychologicalProfile}
                participantName={personA.name || "You"}
              />
            ) : (
              <div className="text-muted text-sm p-8 text-center bg-gray-50 rounded-lg">
                No psychological profile data available.
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4 text-center">Your Partner's Psychological Profile</h2>
            {personB.psychologicalProfile ? (
              <PsychologicalProfileCard
                profile={personB.psychologicalProfile}
                participantName={personB.name || "Partner"}
              />
            ) : (
              <div className="text-muted text-sm p-8 text-center bg-gray-50 rounded-lg">
                No psychological profile data available.
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-center">Your Emotional Intelligence</h2>
            {personA.emotionalIntelligence ? (
              <EmotionalIntelligenceBreakdown emotionalIntelligence={personA.emotionalIntelligence} />
            ) : (
              <div className="text-muted text-sm p-8 text-center bg-gray-50 rounded-lg">
                No emotional intelligence data available.
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4 text-center">Your Partner's Emotional Intelligence</h2>
            {personB.emotionalIntelligence ? (
              <EmotionalIntelligenceBreakdown emotionalIntelligence={personB.emotionalIntelligence} />
            ) : (
              <div className="text-muted text-sm p-8 text-center bg-gray-50 rounded-lg">
                No emotional intelligence data available.
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-center">Relationship Dynamics</h2>
          {personA && personB ? (
            <RelationshipDynamicsCard personA={personA} personB={personB} />
          ) : (
            <div className="text-muted text-sm p-8 text-center bg-gray-50 rounded-lg">
              No relationship dynamics data available.
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-center">Gottman Method Assessment</h2>
          {personA && personB ? (
            <GottmanScoreCard personA={personA} personB={personB} />
          ) : (
            <div className="text-muted text-sm p-8 text-center bg-gray-50 rounded-lg">
              No Gottman assessment data available.
            </div>
          )}
        </div>

        <div className="flex justify-center mt-8">
          <Button onClick={() => router.push("/reflections")}>View Detailed Reflections</Button>
        </div>
      </div>

      {/* Debug Preview: Results Object Mapping */}
      <section className="p-4 mt-8 border border-dashed rounded bg-slate-100 max-w-7xl mx-auto mb-8">
        <h2 className="text-lg font-semibold mb-2 text-purple-700">[Debug Preview] Results Data Mapping</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {personA && personB && (
            <>
              <div className="bg-white p-4 rounded shadow text-sm space-y-1">
                <h3 className="font-bold text-base text-blue-600">{personA.name || "Person A"}</h3>
                <p>
                  <strong>Communication Style:</strong> {personA.communicationStyle}
                </p>
                <p>
                  <strong>Attachment Style:</strong>{" "}
                  {personA.psychologicalProfile?.attachmentStyle?.primaryStyle || "N/A"}
                </p>
                <p>
                  <strong>Ego State:</strong>{" "}
                  {personA.psychologicalProfile?.transactionalAnalysis?.dominantEgoState || "N/A"}
                </p>
                <p>
                  <strong>Sentiment Score:</strong> {personA.sentiment}
                </p>
                <div className="mt-2">
                  <strong>Emotional Intelligence:</strong>
                  <ul className="list-disc pl-5">
                    {Object.entries(personA.emotionalIntelligence || {}).map(([key, value]) => (
                      <li key={key}>
                        {key}: {value}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="mt-1">
                  <strong>Top Insight:</strong> {personA.insights?.[0] || "N/A"}
                </p>
              </div>

              <div className="bg-white p-4 rounded shadow text-sm space-y-1">
                <h3 className="font-bold text-base text-pink-600">{personB.name || "Person B"}</h3>
                <p>
                  <strong>Communication Style:</strong> {personB.communicationStyle}
                </p>
                <p>
                  <strong>Attachment Style:</strong>{" "}
                  {personB.psychologicalProfile?.attachmentStyle?.primaryStyle || "N/A"}
                </p>
                <p>
                  <strong>Ego State:</strong>{" "}
                  {personB.psychologicalProfile?.transactionalAnalysis?.dominantEgoState || "N/A"}
                </p>
                <p>
                  <strong>Sentiment Score:</strong> {personB.sentiment}
                </p>
                <div className="mt-2">
                  <strong>Emotional Intelligence:</strong>
                  <ul className="list-disc pl-5">
                    {Object.entries(personB.emotionalIntelligence || {}).map(([key, value]) => (
                      <li key={key}>
                        {key}: {value}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="mt-1">
                  <strong>Top Insight:</strong> {personB.insights?.[0] || "N/A"}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 text-sm">
          <h4 className="font-semibold mb-2">Compatibility Summary</h4>
          <p>
            <strong>Final Score:</strong> {results.compatibility?.finalScore}
          </p>
          <p>
            <strong>Attachment Match:</strong> {results.compatibility?.attachment}
          </p>
          <p>
            <strong>Communication Sync:</strong> {results.compatibility?.communication}
          </p>
          <p>
            <strong>Emotional Synchrony:</strong> {results.compatibility?.emotionalSync}
          </p>
          <p>
            <strong>Gottman Ratio:</strong> {results.compatibility?.gottmanScores?.positiveNegativeRatio}
          </p>
        </div>

        <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs text-yellow-700">
            This is a development-only preview section to verify data structure. Remove before production.
          </p>
        </div>
      </section>
      {/* Add Debug Data Viewer */}
      <DebugDataViewer data={results} title="Analysis Results Data Structure" initialCollapsed={true} />
    </div>
  )
}
