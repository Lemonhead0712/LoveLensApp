export interface AnalysisResults {
  introductionNote: string
  overallRelationshipHealth: {
    score: number
    description: string
  }
  communicationStylesAndEmotionalTone: {
    description: string
    emotionalVibeTags: string[]
    regulationPatternsObserved: string
    messageRhythmAndPacing: string
    subjectAStyle: string
    subjectBStyle: string
  }
  recurringPatternsIdentified: {
    description: string
    loopingMiscommunicationsExamples: string[]
    commonTriggersAndResponsesExamples: string[]
    repairAttemptsOrEmotionalAvoidancesExamples: string[]
    positivePatterns: string[]
  }
  reflectiveFrameworks: {
    description: string
    attachmentEnergies: string
    loveLanguageFriction: string
    gottmanConflictMarkers: string
    emotionalIntelligenceIndicators: string
  }
  whatsGettingInTheWay: {
    description: string
    emotionalMismatches: string
    communicationGaps: string
    subtlePowerStrugglesOrMisfires: string
    externalStressors: string
  }
  constructiveFeedback: {
    subjectA: {
      strengths: string[]
      gentleGrowthNudges: string[]
      connectionBoosters: string[]
    }
    subjectB: {
      strengths: string[]
      gentleGrowthNudges: string[]
      connectionBoosters: string[]
    }
    forBoth: {
      sharedStrengths: string[]
      sharedGrowthNudges: string[]
      sharedConnectionBoosters: string[]
    }
  }
  visualInsightsData: {
    descriptionForChartsIntro: string
    emotionalCommunicationCharacteristics: Array<{
      category: string
      "Subject A": number
      "Subject B": number
    }>
    conflictExpressionStyles: Array<{
      category: string
      "Subject A": number
      "Subject B": number
    }>
    validationAndReassurancePatterns: Array<{
      category: string
      "Subject A": number
      "Subject B": number
    }>
    communicationMetrics: {
      responseTimeBalance: number
      messageLengthBalance: number
      emotionalDepth: number
      conflictResolution: number
      affectionLevel: number
    }
  }
  professionalInsights: {
    attachmentTheoryAnalysis: {
      subjectA: {
        primaryAttachmentStyle: string
        attachmentBehaviors: string[]
        triggersAndDefenses: string
      }
      subjectB: {
        primaryAttachmentStyle: string
        attachmentBehaviors: string[]
        triggersAndDefenses: string
      }
      dyad: string
    }
    traumaInformedObservations: {
      identifiedPatterns: string[]
      copingMechanisms: string
      safetyAndTrust: string
    }
    therapeuticRecommendations: {
      immediateInterventions: string[]
      longTermGoals: string[]
      suggestedModalities: string[]
      contraindications: string[]
    }
    clinicalExercises: {
      communicationExercises: Array<{
        title: string
        description: string
        frequency: string
      }>
      emotionalRegulationPractices: Array<{
        title: string
        description: string
        frequency: string
      }>
      relationshipRituals: Array<{
        title: string
        description: string
        frequency: string
      }>
    }
    prognosis: {
      shortTerm: string
      mediumTerm: string
      longTerm: string
      riskFactors: string[]
      protectiveFactors: string[]
    }
    differentialConsiderations: {
      individualTherapyConsiderations: string
      couplesTherapyReadiness: string
      externalResourcesNeeded: string[]
    }
  }
  outlook: string
  optionalAppendix: string
  keyTakeaways: string[]
  analyzedConversationText?: string
  messageCount?: number
  screenshotCount?: number
  extractionConfidence?: number
  confidenceWarning?: string
  error?: string
  subjectAName?: string
  subjectBName?: string
}
