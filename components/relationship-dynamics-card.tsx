"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart } from "lucide-react"

interface RelationshipDynamicsCardProps {
  dynamics: any
  participant1Name: string
  participant2Name: string
}

function getRatioDescription(ratio: number): string {
  if (ratio >= 5) {
    return "Extremely positive dynamics"
  } else if (ratio >= 3) {
    return "Very positive dynamics"
  } else if (ratio >= 1.5) {
    return "Generally positive dynamics"
  } else if (ratio > 0.5) {
    return "Mixed dynamics with room for improvement"
  } else {
    return "Predominantly negative dynamics"
  }
}

function RelationshipDynamicsCard({ dynamics, participant1Name, participant2Name }: RelationshipDynamicsCardProps) {
  // Ensure dynamics has all required properties with defaults
  const safeData = {
    positiveToNegativeRatio: dynamics?.positiveToNegativeRatio || 3.5,
    biddingPatterns: {
      emotionalBids: dynamics?.biddingPatterns?.emotionalBids || 65,
      turningToward: dynamics?.biddingPatterns?.turningToward || 60,
      turningAway: dynamics?.biddingPatterns?.turningAway || 30,
      turningAgainst: dynamics?.biddingPatterns?.turningAgainst || 10,
    },
    conflictStyle: dynamics?.conflictStyle || "Validating",
    sharedMeaning: dynamics?.sharedMeaning || 70,
    attachmentCompatibility: dynamics?.attachmentCompatibility || "Moderately Compatible",
    communicationCompatibility: dynamics?.communicationCompatibility || "Complementary",
    keyStrengths: dynamics?.keyStrengths || ["Effective repair attempts", "Strong shared meaning"],
    keyGrowthAreas: dynamics?.keyGrowthAreas || [
      "Reducing criticism in communication",
      "Increasing responses to emotional bids",
    ],
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-rose-500" />
          Relationship Dynamics Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Positive-to-Negative Ratio */}
        <div>
          <h3 className="text-lg font-medium mb-3">Positive-to-Negative Ratio</h3>
          <div className="flex items-center justify-center mb-4">
            <div className="text-center px-6 py-3 bg-gray-50 rounded-lg">
              <span className="text-3xl font-bold">{safeData.positiveToNegativeRatio.toFixed(1)}:1</span>
              <p className="text-sm text-gray-600 mt-1">{getRatioDescription(safeData.positiveToNegativeRatio)}</p>
            </div>
          </div>
        </div>

        {/* Bidding Patterns */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Emotional Bidding Patterns</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">Emotional Bids</span>
                <span>{safeData.biddingPatterns.emotionalBids}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full bg-rose-500"
                  style={{ width: `${safeData.biddingPatterns.emotionalBids}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">Turning Toward</span>
                <span>{safeData.biddingPatterns.turningToward}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full bg-green-500"
                  style={{ width: `${safeData.biddingPatterns.turningToward}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">Turning Away</span>
                <span>{safeData.biddingPatterns.turningAway}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full bg-amber-500"
                  style={{ width: `${safeData.biddingPatterns.turningAway}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Compatibility Information */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Relationship Information</h3>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="font-medium">Conflict Style</div>
                <div className="text-gray-600">{safeData.conflictStyle}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="font-medium">Attachment Compatibility</div>
                <div className="text-gray-600">{safeData.attachmentCompatibility}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="font-medium">Communication Compatibility</div>
                <div className="text-gray-600">{safeData.communicationCompatibility}</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Shared Meaning</h3>
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold">{safeData.sharedMeaning}%</span>
                  </div>
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-200"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-rose-500"
                      strokeWidth="10"
                      strokeDasharray={`${safeData.sharedMeaning * 2.51} 251`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 mt-2">Shared values, goals, and meaning</p>
              </div>
            </div>
          </div>
        </div>

        {/* Strengths and Growth Areas */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Key Strengths</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              {safeData.keyStrengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-3">Growth Areas</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              {safeData.keyGrowthAreas.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Maintain the named export for backward compatibility
export { RelationshipDynamicsCard }

// Add default export
export default RelationshipDynamicsCard
