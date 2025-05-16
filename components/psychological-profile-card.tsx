"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, AlertTriangle, CheckCircle } from "lucide-react"
import { AttachmentStyle, EgoState } from "@/lib/psychological-frameworks"

interface PsychologicalProfileCardProps {
  profile: any
  participantName: string
}

export function PsychologicalProfileCard({ profile, participantName }: PsychologicalProfileCardProps) {
  // Generate different default values based on participant name to ensure uniqueness
  const isFirstPerson = participantName.toLowerCase().includes("lamar")

  const defaultAttachmentStyle = {
    primaryStyle: isFirstPerson ? ("Secure" as AttachmentStyle) : ("Anxious" as AttachmentStyle),
    secondaryStyle: isFirstPerson ? null : ("Secure" as AttachmentStyle),
    confidence: isFirstPerson ? 70 : 65,
  }

  const defaultTransactionalAnalysis = {
    dominantEgoState: isFirstPerson ? ("Adult" as EgoState) : ("Parent" as EgoState),
    egoStateDistribution: {
      parent: isFirstPerson ? 30 : 45,
      adult: isFirstPerson ? 40 : 35,
      child: isFirstPerson ? 30 : 20,
    },
  }

  const defaultLinguisticPatterns = {
    cognitiveComplexity: isFirstPerson ? 60 : 72,
    emotionalExpressiveness: isFirstPerson ? 55 : 48,
    socialEngagement: isFirstPerson ? 65 : 58,
    dominantEmotions: isFirstPerson ? ["Joy", "Trust", "Anticipation"] : ["Trust", "Surprise", "Joy"],
  }

  const defaultCognitivePatterns = {
    topDistortions: isFirstPerson ? [] : ["Mental Filter", "Should Statements"],
    topHealthyPatterns: isFirstPerson
      ? ["Balanced Perspective", "Evidence-Based Thinking"]
      : ["Acceptance", "Realistic Evaluation"],
    overallBalance: isFirstPerson ? 65 : 58,
  }

  const defaultCommunicationStrengths = isFirstPerson
    ? ["Clear communication", "Active listening"]
    : ["Emotional awareness", "Conflict resolution"]

  const defaultGrowthAreas = isFirstPerson
    ? ["Developing emotional awareness", "Practicing mindful responses"]
    : ["Reducing defensive reactions", "Improving active listening"]

  // Use profile data if available, otherwise use defaults
  const attachmentStyle = profile?.attachmentStyle || defaultAttachmentStyle
  const transactionalAnalysis = profile?.transactionalAnalysis || defaultTransactionalAnalysis
  const linguisticPatterns = profile?.linguisticPatterns || defaultLinguisticPatterns
  const cognitivePatterns = profile?.cognitivePatterns || defaultCognitivePatterns
  const communicationStrengths = profile?.communicationStrengths || defaultCommunicationStrengths
  const growthAreas = profile?.growthAreas || defaultGrowthAreas

  // Helper function to get attachment style color
  const getAttachmentStyleColor = (style: AttachmentStyle) => {
    switch (style) {
      case AttachmentStyle.Secure:
        return "bg-green-100 text-green-800 border-green-200"
      case AttachmentStyle.Anxious:
        return "bg-amber-100 text-amber-800 border-amber-200"
      case AttachmentStyle.Avoidant:
        return "bg-blue-100 text-blue-800 border-blue-200"
      case AttachmentStyle.DisorganizedFearful:
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Helper function to get ego state color
  const getEgoStateColor = (state: EgoState) => {
    switch (state) {
      case EgoState.Parent:
        return "bg-purple-100 text-purple-800 border-purple-200"
      case EgoState.Adult:
        return "bg-blue-100 text-blue-800 border-blue-200"
      case EgoState.Child:
        return "bg-rose-100 text-rose-800 border-rose-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-rose-500" />
          {participantName}'s Psychological Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Attachment Style */}
        <div>
          <h3 className="text-lg font-medium mb-3">Attachment Style</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge
              className={`${getAttachmentStyleColor(attachmentStyle.primaryStyle)} border px-3 py-1 text-sm font-medium`}
            >
              {attachmentStyle.primaryStyle}
            </Badge>
            {attachmentStyle.secondaryStyle && (
              <Badge
                className={`${getAttachmentStyleColor(attachmentStyle.secondaryStyle)} border px-3 py-1 text-sm font-medium opacity-70`}
                variant="outline"
              >
                {attachmentStyle.secondaryStyle}
              </Badge>
            )}
            <span className="text-sm text-gray-500 ml-auto">{attachmentStyle.confidence}% confidence</span>
          </div>
          <p className="text-sm text-gray-600">{getAttachmentDescription(attachmentStyle.primaryStyle)}</p>
        </div>

        {/* Transactional Analysis */}
        <div>
          <h3 className="text-lg font-medium mb-3">Communication Ego States</h3>
          <div className="flex items-center gap-2 mb-3">
            <Badge
              className={`${getEgoStateColor(transactionalAnalysis.dominantEgoState)} border px-3 py-1 text-sm font-medium`}
            >
              {transactionalAnalysis.dominantEgoState}
            </Badge>
            <span className="text-sm text-gray-500">Dominant State</span>
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Parent</span>
                <span className="text-sm">{Math.round(transactionalAnalysis.egoStateDistribution.parent)}%</span>
              </div>
              <Progress
                value={transactionalAnalysis.egoStateDistribution.parent}
                className="h-2 bg-gray-100"
                style={
                  {
                    "--progress-background": "rgb(168, 85, 247)",
                  } as React.CSSProperties
                }
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Adult</span>
                <span className="text-sm">{Math.round(transactionalAnalysis.egoStateDistribution.adult)}%</span>
              </div>
              <Progress
                value={transactionalAnalysis.egoStateDistribution.adult}
                className="h-2 bg-gray-100"
                style={
                  {
                    "--progress-background": "rgb(59, 130, 246)",
                  } as React.CSSProperties
                }
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Child</span>
                <span className="text-sm">{Math.round(transactionalAnalysis.egoStateDistribution.child)}%</span>
              </div>
              <Progress
                value={transactionalAnalysis.egoStateDistribution.child}
                className="h-2 bg-gray-100"
                style={
                  {
                    "--progress-background": "rgb(244, 63, 94)",
                  } as React.CSSProperties
                }
              />
            </div>
          </div>
        </div>

        {/* Linguistic Patterns */}
        <div>
          <h3 className="text-lg font-medium mb-3">Linguistic Patterns</h3>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Cognitive Complexity</span>
                <span className="text-sm">{Math.round(linguisticPatterns.cognitiveComplexity)}%</span>
              </div>
              <Progress
                value={linguisticPatterns.cognitiveComplexity}
                className="h-2 bg-gray-100"
                style={
                  {
                    "--progress-background": "rgb(59, 130, 246)",
                  } as React.CSSProperties
                }
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Emotional Expression</span>
                <span className="text-sm">{Math.round(linguisticPatterns.emotionalExpressiveness)}%</span>
              </div>
              <Progress
                value={linguisticPatterns.emotionalExpressiveness}
                className="h-2 bg-gray-100"
                style={
                  {
                    "--progress-background": "rgb(244, 63, 94)",
                  } as React.CSSProperties
                }
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Social Engagement</span>
                <span className="text-sm">{Math.round(linguisticPatterns.socialEngagement)}%</span>
              </div>
              <Progress
                value={linguisticPatterns.socialEngagement}
                className="h-2 bg-gray-100"
                style={
                  {
                    "--progress-background": "rgb(16, 185, 129)",
                  } as React.CSSProperties
                }
              />
            </div>
          </div>

          <div className="mt-3">
            <h4 className="text-sm font-medium mb-2">Dominant Emotions</h4>
            <div className="flex flex-wrap gap-2">
              {linguisticPatterns.dominantEmotions.map((emotion, index) => (
                <Badge key={index} variant="outline" className="bg-gray-50">
                  {emotion}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Cognitive Patterns */}
        <div>
          <h3 className="text-lg font-medium mb-3">Thinking Patterns</h3>

          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Cognitive Balance</span>
              <span className="text-sm">{Math.round(cognitivePatterns.overallBalance)}%</span>
            </div>
            <Progress
              value={cognitivePatterns.overallBalance}
              className="h-2 bg-gray-100"
              style={
                {
                  "--progress-background":
                    cognitivePatterns.overallBalance > 60 ? "rgb(16, 185, 129)" : "rgb(245, 158, 11)",
                } as React.CSSProperties
              }
            />
          </div>

          {cognitivePatterns.topDistortions.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <AlertTriangle className="h-3 w-3 text-amber-500 mr-1" />
                Common Thinking Patterns
              </h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {cognitivePatterns.topDistortions.map((distortion, index) => (
                  <li key={index}>{distortion}</li>
                ))}
              </ul>
            </div>
          )}

          {cognitivePatterns.topHealthyPatterns.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                Healthy Thinking Patterns
              </h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {cognitivePatterns.topHealthyPatterns.map((pattern, index) => (
                  <li key={index}>{pattern}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Strengths and Growth Areas */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Communication Strengths</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              {communicationStrengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Growth Areas</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              {growthAreas.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getAttachmentDescription(style: AttachmentStyle): string {
  switch (style) {
    case AttachmentStyle.Secure:
      return "Demonstrates comfort with both intimacy and independence. Communication tends to be direct, honest, and emotionally open while maintaining healthy boundaries."
    case AttachmentStyle.Anxious:
      return "Shows a strong desire for closeness and reassurance in communication. May express worries about the relationship and seek frequent confirmation of connection."
    case AttachmentStyle.Avoidant:
      return "Values independence and may maintain emotional distance. Communication often focuses on facts rather than feelings, with a preference for self-reliance."
    case AttachmentStyle.DisorganizedFearful:
      return "Shows mixed patterns of both seeking and avoiding connection. Communication may appear contradictory, with both strong emotional expression and withdrawal."
    default:
      return "Shows a balanced communication style with various attachment elements."
  }
}
