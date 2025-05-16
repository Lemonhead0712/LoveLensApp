"use client"

import { PsychologicalProfileCard } from "@/components/psychological-profile-card"
import { RelationshipDynamicsCard } from "@/components/relationship-dynamics-card"

interface PsychologicalProfilesTabProps {
  firstPersonName: string
  secondPersonName: string
  firstPersonProfile: any
  secondPersonProfile: any
  relationshipDynamics: any
}

export function PsychologicalProfilesTab({
  firstPersonName,
  secondPersonName,
  firstPersonProfile,
  secondPersonProfile,
  relationshipDynamics,
}: PsychologicalProfilesTabProps) {
  // Default relationship dynamics if none provided
  const defaultDynamics = {
    positiveToNegativeRatio: 3.5,
    biddingPatterns: {
      emotionalBids: 65,
      turningToward: 60,
      turningAway: 30,
      turningAgainst: 10,
    },
    conflictStyle: "Validating",
    sharedMeaning: 70,
    attachmentCompatibility: "Moderately Compatible",
    communicationCompatibility: "Complementary",
    keyStrengths: ["Effective repair attempts", "Strong shared meaning"],
    keyGrowthAreas: ["Reducing criticism in communication", "Increasing responses to emotional bids"],
  }

  // Create default profiles if none provided
  const defaultFirstPersonProfile = {
    attachmentStyle: {
      primaryStyle: "Secure",
      secondaryStyle: null,
      confidence: 70,
    },
    transactionalAnalysis: {
      dominantEgoState: "Adult",
      egoStateDistribution: {
        parent: 30,
        adult: 40,
        child: 30,
      },
    },
    linguisticPatterns: {
      cognitiveComplexity: 60,
      emotionalExpressiveness: 55,
      socialEngagement: 65,
      dominantEmotions: ["Joy", "Trust", "Anticipation"],
    },
    cognitivePatterns: {
      topDistortions: [],
      topHealthyPatterns: ["Balanced Perspective", "Evidence-Based Thinking"],
      overallBalance: 65,
    },
    communicationStrengths: ["Clear communication", "Active listening"],
    growthAreas: ["Developing emotional awareness", "Practicing mindful responses"],
  }

  const defaultSecondPersonProfile = {
    attachmentStyle: {
      primaryStyle: "Anxious",
      secondaryStyle: "Secure",
      confidence: 65,
    },
    transactionalAnalysis: {
      dominantEgoState: "Parent",
      egoStateDistribution: {
        parent: 45,
        adult: 35,
        child: 20,
      },
    },
    linguisticPatterns: {
      cognitiveComplexity: 72,
      emotionalExpressiveness: 48,
      socialEngagement: 58,
      dominantEmotions: ["Trust", "Surprise", "Joy"],
    },
    cognitivePatterns: {
      topDistortions: ["Mental Filter", "Should Statements"],
      topHealthyPatterns: ["Acceptance", "Realistic Evaluation"],
      overallBalance: 58,
    },
    communicationStrengths: ["Emotional awareness", "Conflict resolution"],
    growthAreas: ["Reducing defensive reactions", "Improving active listening"],
  }

  // Use provided profiles or defaults
  const firstProfile = firstPersonProfile || defaultFirstPersonProfile
  const secondProfile = secondPersonProfile || defaultSecondPersonProfile

  // Use provided dynamics or default
  const dynamics = relationshipDynamics || defaultDynamics

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <PsychologicalProfileCard profile={firstProfile} participantName={firstPersonName} />
        <PsychologicalProfileCard profile={secondProfile} participantName={secondPersonName} />
      </div>

      <RelationshipDynamicsCard
        dynamics={dynamics}
        participant1Name={firstPersonName}
        participant2Name={secondPersonName}
      />
    </div>
  )
}
