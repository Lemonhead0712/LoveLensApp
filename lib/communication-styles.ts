// Helper functions to generate communication style data

export interface CommunicationStyle {
  name: string
  score: number
  traits: string[]
  color: string
  description: string
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

// Generate communication styles
export function generateCommunicationStyles(
  emotionalBreakdown: any,
  gottmanScores: any,
  isFirstPerson: boolean,
): CommunicationStyle[] {
  return [
    {
      name: "Assertive",
      score: 75,
      traits: ["Clear boundaries", "Confident expression", "Goal-oriented", "Direct communication"],
      color: "#ef4444", // Red
      description:
        "Communicates needs and opinions directly while respecting others. Values clarity and honesty in interactions.",
    },
    {
      name: "Analytical",
      score: 65,
      traits: ["Logical approach", "Detail-oriented", "Systematic thinking", "Fact-based reasoning"],
      color: "#3b82f6", // Blue
      description:
        "Focuses on facts and logic rather than emotions. Prefers structured, methodical discussions with clear evidence.",
    },
    {
      name: "Expressive",
      score: 70,
      traits: ["Emotional openness", "Animated communication", "Storytelling approach", "Relationship-focused"],
      color: "#f59e0b", // Amber
      description:
        "Communicates with enthusiasm and emotional depth. Values connection and often uses stories to convey meaning.",
    },
    {
      name: "Supportive",
      score: 80,
      traits: ["Empathetic listening", "Validation of feelings", "Collaborative approach", "Harmony-seeking"],
      color: "#10b981", // Green
      description:
        "Prioritizes others' feelings and maintaining harmony. Excels at listening and creating safe spaces for sharing.",
    },
  ]
}

// Generate compatibility categories
export function generateCompatibilityCategories(
  gottmanScores: any,
  emotionalBreakdown1: any,
  emotionalBreakdown2: any,
) {
  return [
    {
      name: "Emotional Connection",
      score: 75,
      description: "How well you connect on an emotional level and respond to each other's needs.",
    },
    {
      name: "Conflict Resolution",
      score: 70,
      description: "Your ability to navigate disagreements and repair relationship damage.",
    },
    {
      name: "Communication Clarity",
      score: 80,
      description: "How clearly you express yourselves and understand each other.",
    },
    {
      name: "Mutual Respect",
      score: 85,
      description: "The level of respect and appreciation you demonstrate for each other.",
    },
    {
      name: "Emotional Support",
      score: 78,
      description: "How well you provide emotional support and understanding to each other.",
    },
  ]
}

// Function to get a description of the compatibility between two communication styles
export function getStyleCompatibilityDescription(style1: string, style2: string): string {
  // Style compatibility descriptions
  const compatibilityMap: Record<string, Record<string, string>> = {
    Assertive: {
      Assertive:
        "Two assertive communicators can lead to productive discussions but may also create power struggles. Focus on taking turns and active listening.",
      Analytical:
        "This pairing combines action with analysis. The assertive partner may need to slow down, while the analytical partner should express needs directly.",
      Expressive:
        "This dynamic pairing balances action with emotion. The assertive partner should acknowledge feelings, while the expressive partner can focus on clarity.",
      Supportive:
        "This complementary pairing works well when the assertive partner respects boundaries and the supportive partner expresses needs directly.",
    },
    Analytical: {
      Assertive:
        "This pairing combines analysis with action. The analytical partner may need to be more direct, while the assertive partner should allow time for processing.",
      Analytical:
        "Two analytical communicators excel at problem-solving but may overthink emotional matters. Remember to acknowledge feelings alongside facts.",
      Expressive:
        "This pairing balances logic with emotion. The analytical partner should validate feelings, while the expressive partner can provide clear reasoning.",
      Supportive:
        "This thoughtful pairing works well when the analytical partner expresses appreciation, while the supportive partner shares logical concerns.",
    },
    Expressive: {
      Assertive:
        "This dynamic pairing balances emotion with action. The expressive partner should focus on clarity, while the assertive partner acknowledges feelings.",
      Analytical:
        "This pairing balances emotion with logic. The expressive partner can provide clear reasoning, while the analytical partner validates feelings.",
      Expressive:
        "Two expressive communicators create emotional depth but may overlook practical details. Focus on balancing feelings with actionable solutions.",
      Supportive:
        "This emotionally intelligent pairing thrives on mutual validation. Be mindful of addressing practical concerns alongside emotional support.",
    },
    Supportive: {
      Assertive:
        "This complementary pairing works well when the supportive partner expresses needs directly and the assertive partner respects boundaries.",
      Analytical:
        "This thoughtful pairing works well when the supportive partner shares logical concerns, while the analytical partner expresses appreciation.",
      Expressive:
        "This emotionally intelligent pairing thrives on mutual validation. Be mindful of addressing practical concerns alongside emotional support.",
      Supportive:
        "Two supportive communicators create a nurturing environment but may avoid necessary conflict. Practice addressing issues directly with compassion.",
    },
  }

  // Default description if styles aren't in the map
  const defaultDescription =
    "Your communication styles have unique strengths and challenges. Focus on understanding each other's approaches and adapting when needed."

  // Return the specific description if available, otherwise return the default
  return compatibilityMap[style1]?.[style2] || defaultDescription
}
