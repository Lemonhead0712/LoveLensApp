// Helper functions to generate communication style data

export interface CommunicationStyle {
  name: string
  score: number
  traits: string[]
  color: string
  description: string
}

export function generateCommunicationStyles(
  emotionalBreakdown: any,
  gottmanScores: any,
  isFirstPerson: boolean,
): CommunicationStyle[] {
  // Calculate scores based on emotional breakdown and gottman scores
  const assertiveScore = calculateAssertiveScore(emotionalBreakdown, gottmanScores, isFirstPerson)
  const analyticalScore = calculateAnalyticalScore(emotionalBreakdown, gottmanScores, isFirstPerson)
  const expressiveScore = calculateExpressiveScore(emotionalBreakdown, gottmanScores, isFirstPerson)
  const supportiveScore = calculateSupportiveScore(emotionalBreakdown, gottmanScores, isFirstPerson)

  return [
    {
      name: "Assertive",
      score: assertiveScore,
      traits: ["Clear boundaries", "Confident expression", "Goal-oriented", "Direct communication"],
      color: "#ef4444", // Red
      description:
        "Communicates needs and opinions directly while respecting others. Values clarity and honesty in interactions.",
    },
    {
      name: "Analytical",
      score: analyticalScore,
      traits: ["Logical approach", "Detail-oriented", "Systematic thinking", "Fact-based reasoning"],
      color: "#3b82f6", // Blue
      description:
        "Focuses on facts and logic rather than emotions. Prefers structured, methodical discussions with clear evidence.",
    },
    {
      name: "Expressive",
      score: expressiveScore,
      traits: ["Emotional openness", "Animated communication", "Storytelling approach", "Relationship-focused"],
      color: "#f59e0b", // Amber
      description:
        "Communicates with enthusiasm and emotional depth. Values connection and often uses stories to convey meaning.",
    },
    {
      name: "Supportive",
      score: supportiveScore,
      traits: ["Empathetic listening", "Validation of feelings", "Collaborative approach", "Harmony-seeking"],
      color: "#10b981", // Green
      description:
        "Prioritizes others' feelings and maintaining harmony. Excels at listening and creating safe spaces for sharing.",
    },
  ]
}

function calculateAssertiveScore(emotionalBreakdown: any, gottmanScores: any, isFirstPerson: boolean): number {
  // Assertive communication correlates with self-awareness, lower stonewalling, and moderate criticism
  const baseScore = emotionalBreakdown.selfAwareness * 0.4 + (100 - gottmanScores.stonewalling) * 0.3

  // Add some variance based on first/second person - more balanced now
  const variance = isFirstPerson ? 15 : 0

  return Math.min(100, Math.max(0, Math.round(baseScore + variance)))
}

function calculateAnalyticalScore(emotionalBreakdown: any, gottmanScores: any, isFirstPerson: boolean): number {
  // Analytical communication correlates with emotional regulation and lower emotional bids
  const baseScore = emotionalBreakdown.emotionalRegulation * 0.5 + (100 - gottmanScores.emotionalBids) * 0.2

  // Add some variance based on first/second person - more balanced now
  const variance = isFirstPerson ? 5 : 15

  return Math.min(100, Math.max(0, Math.round(baseScore + variance)))
}

function calculateExpressiveScore(emotionalBreakdown: any, gottmanScores: any, isFirstPerson: boolean): number {
  // Expressive communication correlates with empathy, social skills, and emotional bids
  const baseScore =
    emotionalBreakdown.empathy * 0.3 + emotionalBreakdown.socialSkills * 0.3 + gottmanScores.emotionalBids * 0.2

  // Add some variance based on first/second person - more balanced now
  const variance = isFirstPerson ? 10 : -5

  return Math.min(100, Math.max(0, Math.round(baseScore + variance)))
}

function calculateSupportiveScore(emotionalBreakdown: any, gottmanScores: any, isFirstPerson: boolean): number {
  // Supportive communication correlates with empathy, turn towards, and repair attempts
  const baseScore =
    emotionalBreakdown.empathy * 0.4 + gottmanScores.turnTowards * 0.3 + gottmanScores.repairAttempts * 0.2

  // Add some variance based on first/second person - more balanced now
  const variance = isFirstPerson ? 8 : 5

  return Math.min(100, Math.max(0, Math.round(baseScore + variance)))
}

export function generateCompatibilityCategories(
  gottmanScores: any,
  emotionalBreakdown1: any,
  emotionalBreakdown2: any,
) {
  return [
    {
      name: "Emotional Connection",
      score: Math.round((gottmanScores.emotionalBids + gottmanScores.turnTowards) / 2),
      description: "How well you connect on an emotional level and respond to each other's needs.",
    },
    {
      name: "Conflict Resolution",
      score: Math.round(
        (gottmanScores.repairAttempts + (100 - gottmanScores.criticism) + (100 - gottmanScores.defensiveness)) / 3,
      ),
      description: "Your ability to navigate disagreements and repair relationship damage.",
    },
    {
      name: "Communication Clarity",
      score: Math.round(
        (emotionalBreakdown1.selfAwareness + emotionalBreakdown2.selfAwareness + gottmanScores.sharedMeaning) / 3,
      ),
      description: "How clearly you express yourselves and understand each other.",
    },
    {
      name: "Mutual Respect",
      score: Math.round(
        (100 - gottmanScores.contempt + (100 - gottmanScores.stonewalling) + gottmanScores.sharedMeaning) / 3,
      ),
      description: "The level of respect and appreciation you demonstrate for each other.",
    },
    {
      name: "Emotional Support",
      score: Math.round((emotionalBreakdown1.empathy + emotionalBreakdown2.empathy + gottmanScores.turnTowards) / 3),
      description: "How well you provide emotional support and understanding to each other.",
    },
  ]
}

// Function to get a descriptive label for communication style combinations
export function getCommunicationStyleLabel(dominantStyle: string, secondaryStyle: string | null): string {
  if (!secondaryStyle) {
    switch (dominantStyle) {
      case "Assertive":
        return "Assertive & Direct"
      case "Analytical":
        return "Analytical & Logical"
      case "Expressive":
        return "Expressive & Emotional"
      case "Supportive":
        return "Supportive & Empathetic"
      default:
        return "Balanced"
    }
  }

  // Style combinations
  if (dominantStyle === "Assertive" && secondaryStyle === "Supportive") {
    return "Assertive & Empathetic"
  } else if (dominantStyle === "Assertive" && secondaryStyle === "Analytical") {
    return "Direct & Strategic"
  } else if (dominantStyle === "Analytical" && secondaryStyle === "Assertive") {
    return "Direct & Analytical"
  } else if (dominantStyle === "Analytical" && secondaryStyle === "Supportive") {
    return "Thoughtful & Methodical"
  } else if (dominantStyle === "Expressive" && secondaryStyle === "Supportive") {
    return "Warm & Engaging"
  } else if (dominantStyle === "Expressive" && secondaryStyle === "Assertive") {
    return "Dynamic & Persuasive"
  } else if (dominantStyle === "Supportive" && secondaryStyle === "Analytical") {
    return "Considerate & Thorough"
  } else if (dominantStyle === "Supportive" && secondaryStyle === "Expressive") {
    return "Nurturing & Responsive"
  }

  // Default combination
  return `${dominantStyle} & ${secondaryStyle}`
}

// Function to get a description of communication style compatibility
export function getStyleCompatibilityDescription(style1: string, style2: string): string {
  // Similar styles
  if (style1 === style2) {
    switch (style1) {
      case "Assertive & Direct":
      case "Direct & Strategic":
        return "You both have direct communication styles, which promotes clarity but may lead to conflicts if not balanced with active listening."
      case "Analytical & Logical":
      case "Direct & Analytical":
      case "Thoughtful & Methodical":
        return "You both approach communication logically and methodically, which works well for problem-solving but may need more emotional expression."
      case "Expressive & Emotional":
      case "Warm & Engaging":
      case "Dynamic & Persuasive":
        return "You both communicate expressively and emotionally, creating strong connections but sometimes needing more structure in discussions."
      case "Supportive & Empathetic":
      case "Nurturing & Responsive":
      case "Considerate & Thorough":
        return "You both prioritize supportive communication, creating a harmonious environment but potentially avoiding necessary conflicts."
      default:
        return "You share similar communication approaches, which creates natural understanding but may reinforce shared blind spots."
    }
  }

  // Complementary styles
  if (
    (style1.includes("Assertive") && style2.includes("Supportive")) ||
    (style1.includes("Supportive") && style2.includes("Assertive"))
  ) {
    return "Your direct and supportive styles complement each other well, balancing clarity with empathy."
  }

  if (
    (style1.includes("Analytical") && style2.includes("Expressive")) ||
    (style1.includes("Expressive") && style2.includes("Analytical"))
  ) {
    return "Your analytical and expressive styles create a balance between logical reasoning and emotional connection."
  }

  if (
    (style1.includes("Assertive") && style2.includes("Analytical")) ||
    (style1.includes("Analytical") && style2.includes("Assertive"))
  ) {
    return "Your combined direct and analytical approach leads to efficient problem-solving and clear communication."
  }

  if (
    (style1.includes("Supportive") && style2.includes("Expressive")) ||
    (style1.includes("Expressive") && style2.includes("Supportive"))
  ) {
    return "Your supportive and expressive styles create a warm, emotionally rich communication environment."
  }

  // Default for other combinations
  return "Your different communication styles can complement each other when you recognize and adapt to each other's preferences."
}
