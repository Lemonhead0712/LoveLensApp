export interface AnalysisResults {
  subjectALabel?: string
  subjectBLabel?: string
  introductionNote: string
  overallScore: number
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
  communicationPatterns: {
    personA: {
      style: string
      strengths: string[]
      areasForGrowth: string[]
      notableQuotes: string[]
      communicationTendencies: string
    }
    personB: {
      style: string
      strengths: string[]
      areasForGrowth: string[]
      notableQuotes: string[]
      communicationTendencies: string
    }
    dynamicBetweenThem: string
  }
  emotionalDynamics: {
    positiveIndicators: string[]
    concerningPatterns: string[]
    emotionalBalance: string
    emotionalHighlights: Array<{
      moment: string
      significance: string
      tone: "positive" | "neutral" | "concerning"
    }>
  }
  recurringPatternsIdentified: {
    description: string
    loopingMiscommunicationsExamples: string[]
    commonTriggersAndResponsesExamples: string[]
    repairAttemptsOrEmotionalAvoidancesExamples: string[]
    positivePatterns: string[]
  }
  deeperInsights: Array<{
    title: string
    observation: string
    category: "communication" | "emotional" | "behavioral" | "relational"
    impact: string
  }>
  reflectiveFrameworks: {
    description: string
    attachmentEnergies: string
    loveLanguageFriction: string
    gottmanConflictMarkers: string
    emotionalIntelligenceIndicators: string
  }
  strengthsToGelebrate: Array<{
    strength: string
    whyItMatters: string
    examples: string[]
  }>
  growthOpportunities: Array<{
    area: string
    currentPattern: string
    whyItMatters: string
    suggestions: string[]
    priority: "high" | "medium" | "low"
  }>
  whatsGettingInTheWay: {
    description: string
    emotionalMismatches: string
    communicationGaps: string
    subtlePowerStrugglesOrMisfires: string
    externalStressors: string
  }
  recommendations: Array<{
    title: string
    description: string
    priority: "high" | "medium" | "low"
    expectedOutcome: string
  }>
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
  conversationMetrics: {
    totalMessages: number
    messageBalance: {
      personA: number
      personB: number
    }
    averageMessageLength: {
      personA: number
      personB: number
    }
    emotionalTone: string
    conversationFlow: string
    engagementLevel: string
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
  summary: string
  openingThoughts: string
  outlook: string
  closingThoughts: string
  optionalAppendix: string
  keyTakeaways: string[]
  analyzedConversationText?: string
  messageCount?: number
  screenshotCount?: number
  extractionConfidence?: number
  confidenceWarning?: string
  processingTimeMs?: number
  error?: string
}
