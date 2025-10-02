export interface SubjectFeedback {
  strengths: string[]
  gentleGrowthNudges: string[]
  connectionBoosters: string[]
}

export interface SharedFeedback {
  sharedStrengths: string[]
  sharedGrowthNudges: string[]
  sharedConnectionBoosters: string[]
}

export interface ChartDataPoint {
  category: string
  "Subject A": number
  "Subject B": number
}

export interface AnalysisResultsData {
  introductionNote: string
  communicationStylesAndEmotionalTone: {
    description: string
    emotionalVibeTags: string[]
    regulationPatternsObserved: string
    messageRhythmAndPacing: string
  }
  recurringPatternsIdentified: {
    description: string
    loopingMiscommunicationsExamples: string[]
    commonTriggersAndResponsesExamples: string[]
    repairAttemptsOrEmotionalAvoidancesExamples: string[]
  }
  reflectiveFrameworks: {
    description: string
    attachmentEnergies: string
    loveLanguageFriction: string
    gottmanConflictMarkers: string
  }
  whatsGettingInTheWay: {
    description: string
    emotionalMismatches: string
    communicationGaps: string
    subtlePowerStrugglesOrMisfires: string
  }
  constructiveFeedback: {
    subjectA: SubjectFeedback
    subjectB: SubjectFeedback
    forBoth: SharedFeedback
  }
  visualInsightsData: {
    descriptionForChartsIntro: string
    emotionalCommunicationCharacteristics: ChartDataPoint[]
    conflictExpressionStyles: ChartDataPoint[]
    validationAndReassurancePatterns: ChartDataPoint[]
  }
  outlook: string
  optionalAppendix: string
  analyzedConversationText?: string // Optional, but good to have
}
