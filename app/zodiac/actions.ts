"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

interface ZodiacSign {
  sign: string
  element: string
  quality: string
  rulingPlanet: string
  traits: string[]
  strengths: string[]
  weaknesses: string[]
}

const zodiacSigns: Record<string, ZodiacSign> = {
  aries: {
    sign: "Aries",
    element: "Fire",
    quality: "Cardinal",
    rulingPlanet: "Mars",
    traits: ["Bold", "Ambitious", "Confident", "Enthusiastic", "Impulsive"],
    strengths: ["Courageous", "Determined", "Confident", "Enthusiastic", "Optimistic"],
    weaknesses: ["Impatient", "Moody", "Short-tempered", "Impulsive", "Aggressive"],
  },
  taurus: {
    sign: "Taurus",
    element: "Earth",
    quality: "Fixed",
    rulingPlanet: "Venus",
    traits: ["Reliable", "Patient", "Practical", "Devoted", "Stubborn"],
    strengths: ["Reliable", "Patient", "Practical", "Devoted", "Responsible"],
    weaknesses: ["Stubborn", "Possessive", "Uncompromising", "Materialistic"],
  },
  gemini: {
    sign: "Gemini",
    element: "Air",
    quality: "Mutable",
    rulingPlanet: "Mercury",
    traits: ["Adaptable", "Outgoing", "Intelligent", "Curious", "Indecisive"],
    strengths: ["Gentle", "Affectionate", "Curious", "Adaptable", "Quick learner"],
    weaknesses: ["Nervous", "Inconsistent", "Indecisive", "Superficial"],
  },
  cancer: {
    sign: "Cancer",
    element: "Water",
    quality: "Cardinal",
    rulingPlanet: "Moon",
    traits: ["Intuitive", "Emotional", "Protective", "Sympathetic", "Moody"],
    strengths: ["Tenacious", "Loyal", "Emotional", "Sympathetic", "Persuasive"],
    weaknesses: ["Moody", "Pessimistic", "Suspicious", "Manipulative", "Insecure"],
  },
  leo: {
    sign: "Leo",
    element: "Fire",
    quality: "Fixed",
    rulingPlanet: "Sun",
    traits: ["Creative", "Passionate", "Generous", "Warm-hearted", "Arrogant"],
    strengths: ["Creative", "Passionate", "Generous", "Warm-hearted", "Cheerful"],
    weaknesses: ["Arrogant", "Stubborn", "Self-centered", "Inflexible", "Lazy"],
  },
  virgo: {
    sign: "Virgo",
    element: "Earth",
    quality: "Mutable",
    rulingPlanet: "Mercury",
    traits: ["Analytical", "Practical", "Diligent", "Reliable", "Critical"],
    strengths: ["Loyal", "Analytical", "Kind", "Hardworking", "Practical"],
    weaknesses: ["Shyness", "Worry", "Overly critical", "Perfectionist"],
  },
  libra: {
    sign: "Libra",
    element: "Air",
    quality: "Cardinal",
    rulingPlanet: "Venus",
    traits: ["Diplomatic", "Fair-minded", "Social", "Indecisive", "Gracious"],
    strengths: ["Cooperative", "Diplomatic", "Gracious", "Fair-minded", "Social"],
    weaknesses: ["Indecisive", "Avoids confrontations", "Self-pity", "Holds grudges"],
  },
  scorpio: {
    sign: "Scorpio",
    element: "Water",
    quality: "Fixed",
    rulingPlanet: "Pluto",
    traits: ["Passionate", "Resourceful", "Brave", "Jealous", "Secretive"],
    strengths: ["Resourceful", "Brave", "Passionate", "Stubborn", "True friend"],
    weaknesses: ["Distrusting", "Jealous", "Secretive", "Violent", "Manipulative"],
  },
  sagittarius: {
    sign: "Sagittarius",
    element: "Fire",
    quality: "Mutable",
    rulingPlanet: "Jupiter",
    traits: ["Optimistic", "Freedom-loving", "Honest", "Philosophical", "Careless"],
    strengths: ["Generous", "Idealistic", "Great sense of humor", "Optimistic"],
    weaknesses: ["Promises more than can deliver", "Impatient", "Tactless"],
  },
  capricorn: {
    sign: "Capricorn",
    element: "Earth",
    quality: "Cardinal",
    rulingPlanet: "Saturn",
    traits: ["Responsible", "Disciplined", "Self-control", "Ambitious", "Pessimistic"],
    strengths: ["Responsible", "Disciplined", "Self-control", "Good managers"],
    weaknesses: ["Know-it-all", "Unforgiving", "Condescending", "Pessimistic"],
  },
  aquarius: {
    sign: "Aquarius",
    element: "Air",
    quality: "Fixed",
    rulingPlanet: "Uranus",
    traits: ["Progressive", "Original", "Independent", "Humanitarian", "Aloof"],
    strengths: ["Progressive", "Original", "Independent", "Humanitarian"],
    weaknesses: ["Runs from emotional expression", "Temperamental", "Aloof"],
  },
  pisces: {
    sign: "Pisces",
    element: "Water",
    quality: "Mutable",
    rulingPlanet: "Neptune",
    traits: ["Compassionate", "Artistic", "Intuitive", "Gentle", "Overly trusting"],
    strengths: ["Compassionate", "Artistic", "Intuitive", "Gentle", "Wise"],
    weaknesses: ["Fearful", "Overly trusting", "Sad", "Desire to escape reality"],
  },
}

function getZodiacSign(month: number, day: number): string {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "aries"
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "taurus"
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "gemini"
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "cancer"
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "leo"
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "virgo"
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "libra"
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "scorpio"
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "sagittarius"
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "capricorn"
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "aquarius"
  return "pisces"
}

function calculateCompatibility(sign1: string, sign2: string): number {
  const compatibilityMatrix: Record<string, Record<string, number>> = {
    aries: {
      aries: 75,
      taurus: 60,
      gemini: 85,
      cancer: 55,
      leo: 90,
      virgo: 65,
      libra: 80,
      scorpio: 70,
      sagittarius: 95,
      capricorn: 60,
      aquarius: 85,
      pisces: 65,
    },
    taurus: {
      aries: 60,
      taurus: 80,
      gemini: 65,
      cancer: 90,
      leo: 70,
      virgo: 95,
      libra: 75,
      scorpio: 85,
      sagittarius: 60,
      capricorn: 95,
      aquarius: 65,
      pisces: 90,
    },
    gemini: {
      aries: 85,
      taurus: 65,
      gemini: 75,
      cancer: 60,
      leo: 85,
      virgo: 70,
      libra: 95,
      scorpio: 65,
      sagittarius: 85,
      capricorn: 60,
      aquarius: 95,
      pisces: 70,
    },
    cancer: {
      aries: 55,
      taurus: 90,
      gemini: 60,
      cancer: 80,
      leo: 65,
      virgo: 85,
      libra: 70,
      scorpio: 95,
      sagittarius: 55,
      capricorn: 85,
      aquarius: 60,
      pisces: 95,
    },
    leo: {
      aries: 90,
      taurus: 70,
      gemini: 85,
      cancer: 65,
      leo: 80,
      virgo: 70,
      libra: 90,
      scorpio: 75,
      sagittarius: 95,
      capricorn: 65,
      aquarius: 85,
      pisces: 70,
    },
    virgo: {
      aries: 65,
      taurus: 95,
      gemini: 70,
      cancer: 85,
      leo: 70,
      virgo: 80,
      libra: 75,
      scorpio: 85,
      sagittarius: 65,
      capricorn: 95,
      aquarius: 70,
      pisces: 85,
    },
    libra: {
      aries: 80,
      taurus: 75,
      gemini: 95,
      cancer: 70,
      leo: 90,
      virgo: 75,
      libra: 80,
      scorpio: 70,
      sagittarius: 85,
      capricorn: 70,
      aquarius: 95,
      pisces: 75,
    },
    scorpio: {
      aries: 70,
      taurus: 85,
      gemini: 65,
      cancer: 95,
      leo: 75,
      virgo: 85,
      libra: 70,
      scorpio: 80,
      sagittarius: 65,
      capricorn: 90,
      aquarius: 70,
      pisces: 95,
    },
    sagittarius: {
      aries: 95,
      taurus: 60,
      gemini: 85,
      cancer: 55,
      leo: 95,
      virgo: 65,
      libra: 85,
      scorpio: 65,
      sagittarius: 80,
      capricorn: 60,
      aquarius: 90,
      pisces: 70,
    },
    capricorn: {
      aries: 60,
      taurus: 95,
      gemini: 60,
      cancer: 85,
      leo: 65,
      virgo: 95,
      libra: 70,
      scorpio: 90,
      sagittarius: 60,
      capricorn: 80,
      aquarius: 65,
      pisces: 85,
    },
    aquarius: {
      aries: 85,
      taurus: 65,
      gemini: 95,
      cancer: 60,
      leo: 85,
      virgo: 70,
      libra: 95,
      scorpio: 70,
      sagittarius: 90,
      capricorn: 65,
      aquarius: 80,
      pisces: 75,
    },
    pisces: {
      aries: 65,
      taurus: 90,
      gemini: 70,
      cancer: 95,
      leo: 70,
      virgo: 85,
      libra: 75,
      scorpio: 95,
      sagittarius: 70,
      capricorn: 85,
      aquarius: 75,
      pisces: 80,
    },
  }

  return compatibilityMatrix[sign1]?.[sign2] || 70
}

export async function analyzeZodiacCompatibility(formData: FormData) {
  try {
    const yourBirthDate = formData.get("yourBirthDate") as string
    const partnerBirthDate = formData.get("partnerBirthDate") as string
    const yourGender = formData.get("yourGender") as string
    const partnerGender = formData.get("partnerGender") as string

    if (!yourBirthDate || !partnerBirthDate || !yourGender || !partnerGender) {
      return { error: "Please provide all required information" }
    }

    const yourDate = new Date(yourBirthDate)
    const partnerDate = new Date(partnerBirthDate)

    const yourSign = getZodiacSign(yourDate.getMonth() + 1, yourDate.getDate())
    const partnerSign = getZodiacSign(partnerDate.getMonth() + 1, partnerDate.getDate())

    const yourZodiac = zodiacSigns[yourSign]
    const partnerZodiac = zodiacSigns[partnerSign]

    const today = new Date()
    const yourAge = today.getFullYear() - yourDate.getFullYear()
    const partnerAge = today.getFullYear() - partnerDate.getFullYear()
    const ageDiff = Math.abs(yourAge - partnerAge)

    const baseCompatibilityScore = calculateCompatibility(yourSign, partnerSign)

    const detailedAnalysis = await generateDetailedAnalysis(
      yourZodiac,
      partnerZodiac,
      yourAge,
      partnerAge,
      yourGender,
      partnerGender,
      baseCompatibilityScore,
    )

    const similarities: string[] = []
    const differences: string[] = []

    if (yourZodiac.element === partnerZodiac.element) {
      similarities.push(`Both ${yourZodiac.element} signs - natural understanding of each other's energy`)
    } else {
      differences.push(`Different elements: ${yourZodiac.element} vs ${partnerZodiac.element}`)
    }

    if (yourZodiac.quality === partnerZodiac.quality) {
      similarities.push(`Same quality (${yourZodiac.quality}) - similar approach to life`)
    } else {
      differences.push(`Different qualities: ${yourZodiac.quality} vs ${partnerZodiac.quality}`)
    }

    return {
      yourZodiac,
      partnerZodiac,
      compatibilityScore: baseCompatibilityScore,
      yourAge,
      partnerAge,
      ageDiff,
      yourGender,
      partnerGender,
      similarities,
      differences,
      detailedAnalysis,
      yourBirthDate,
      partnerBirthDate,
    }
  } catch (error) {
    console.error("Zodiac analysis error:", error)
    return { error: "Failed to analyze compatibility. Please check your information and try again." }
  }
}

async function generateDetailedAnalysis(
  yourZodiac: ZodiacSign,
  partnerZodiac: ZodiacSign,
  yourAge: number,
  partnerAge: number,
  yourGender: string,
  partnerGender: string,
  baseCompatibilityScore: number, // Corrected: variable name was 'baseScore' in fallback, changed to match here.
) {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      temperature: 0.7,
      maxTokens: 4000,
      messages: [
        {
          role: "system",
          content: `You are an expert astrologer, relationship psychologist, and couples therapist. Generate detailed, nuanced compatibility analysis using psychological frameworks including attachment theory, Gottman Method, emotional intelligence, and trauma-informed approaches. Be insightful, specific, and personalized. Use 2-3 sentences per section.`,
        },
        {
          role: "user",
          content: `Analyze compatibility between:
Person 1: ${yourZodiac.sign} (${yourGender}, age ${yourAge})
Person 2: ${partnerZodiac.sign} (${partnerGender}, age ${partnerAge})

Generate JSON with this structure:
{
  "personalityInsights": {
    "person1": "2-3 sentences about their personality based on zodiac and gender",
    "person2": "2-3 sentences about their personality",
    "compatibility": "2-3 sentences about how their personalities mesh"
  },
  "ageCompatibility": {
    "analysis": "2-3 sentences about age difference impact (${Math.abs(yourAge - partnerAge)} years)",
    "score": number 1-100
  },
  "passions": {
    "person1": ["passion1", "passion2", "passion3"],
    "person2": ["passion1", "passion2", "passion3"],
    "shared": ["shared passion 1", "shared passion 2"]
  },
  "attributes": {
    "person1": {
      "physical": "brief description",
      "emotional": "brief description",
      "mental": "brief description"
    },
    "person2": {
      "physical": "brief description",
      "emotional": "brief description",
      "mental": "brief description"
    }
  },
  "ambitions": {
    "person1": "2-3 sentences about career and life goals",
    "person2": "2-3 sentences about career and life goals",
    "alignment": "2-3 sentences about how their ambitions align"
  },
  "sexualCompatibility": {
    "chemistry": "2-3 sentences about physical chemistry and attraction",
    "intimacyStyle": "2-3 sentences about intimacy preferences",
    "score": number 1-100
  },
  "loveLanguage": {
    "person1": {
      "primary": "Words of Affirmation|Quality Time|Physical Touch|Acts of Service|Receiving Gifts",
      "description": "brief explanation"
    },
    "person2": {
      "primary": "Words of Affirmation|Quality Time|Physical Touch|Acts of Service|Receiving Gifts",
      "description": "brief explanation"
    },
    "compatibility": "2-3 sentences about love language compatibility"
  },
  "relationshipDynamics": {
    "genderDynamics": "2-3 sentences about ${yourGender}-${partnerGender} relationship dynamics",
    "powerBalance": "2-3 sentences about power dynamics",
    "conflictStyle": "2-3 sentences about how they handle conflict"
  },
  "attachmentTheory": {
    "person1": {
      "style": "Secure|Anxious-Preoccupied|Dismissive-Avoidant|Fearful-Avoidant",
      "description": "2-3 sentences about attachment patterns based on zodiac",
      "triggers": ["trigger1", "trigger2", "trigger3"]
    },
    "person2": {
      "style": "Secure|Anxious-Preoccupied|Dismissive-Avoidant|Fearful-Avoidant",
      "description": "2-3 sentences about attachment patterns",
      "triggers": ["trigger1", "trigger2", "trigger3"]
    },
    "dyad": "2-3 sentences about how their attachment styles interact"
  },
  "emotionalIntelligence": {
    "person1": {
      "selfAwareness": number 1-10,
      "selfRegulation": number 1-10,
      "empathy": number 1-10,
      "socialSkills": number 1-10
    },
    "person2": {
      "selfAwareness": number 1-10,
      "selfRegulation": number 1-10,
      "empathy": number 1-10,
      "socialSkills": number 1-10
    },
    "analysis": "2-3 sentences about emotional intelligence compatibility"
  },
  "gottmanPrinciples": {
    "positiveToNegativeRatio": "2-3 sentences about expected interaction patterns",
    "fourHorsemen": ["potential horseman 1", "potential horseman 2"],
    "repairAttempts": "2-3 sentences about how they likely repair conflicts"
  },
  "communicationPatterns": {
    "person1Style": "2-3 sentences about communication approach",
    "person2Style": "2-3 sentences about communication approach",
    "compatibility": "2-3 sentences about communication compatibility"
  },
  "conflictResolution": {
    "person1Approach": "2-3 sentences about conflict handling",
    "person2Approach": "2-3 sentences about conflict handling",
    "recommendations": ["tip1", "tip2", "tip3"]
  },
  "therapeuticRecommendations": {
    "exercises": ["exercise1", "exercise2", "exercise3"],
    "focusAreas": ["area1", "area2", "area3"],
    "suggestedModalities": ["modality1", "modality2"]
  },
  "prognosis": {
    "shortTerm": "2-3 sentences about 1-3 month outlook",
    "longTerm": "2-3 sentences about 12+ month outlook",
    "riskFactors": ["risk1", "risk2"],
    "protectiveFactors": ["factor1", "factor2", "factor3"]
  },
  "advice": {
    "success": ["tip 1", "tip 2", "tip 3", "tip 4"],
    "awareness": ["warning 1", "warning 2", "warning 3"]
  }
}`,
        },
      ],
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No JSON found in response")
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error("AI analysis error:", error)
    return createFallbackDetailedAnalysis(
      yourZodiac,
      partnerZodiac,
      yourAge,
      partnerAge,
      yourGender,
      partnerGender,
      baseCompatibilityScore,
    )
  }
}

function createFallbackDetailedAnalysis(
  yourZodiac: ZodiacSign,
  partnerZodiac: ZodiacSign,
  yourAge: number,
  partnerAge: number,
  yourGender: string,
  partnerGender: string,
  baseCompatibilityScore: number, // Corrected parameter name to match generateDetailedAnalysis
) {
  // Determine attachment styles based on zodiac elements and qualities
  const getAttachmentStyle = (zodiac: ZodiacSign) => {
    if (zodiac.element === "Water") return "Anxious-Preoccupied"
    if (zodiac.element === "Earth") return "Secure"
    if (zodiac.element === "Air") return "Dismissive-Avoidant"
    return "Secure" // Fire signs tend toward secure when healthy
  }

  const yourAttachment = getAttachmentStyle(yourZodiac)
  const partnerAttachment = getAttachmentStyle(partnerZodiac)

  return {
    personalityInsights: {
      person1: `As a ${yourZodiac.sign}, you embody ${yourZodiac.traits.slice(0, 3).join(", ")} qualities. Your ${yourZodiac.element} nature drives you to seek ${yourZodiac.element === "Fire" ? "passion and adventure" : yourZodiac.element === "Earth" ? "stability and security" : yourZodiac.element === "Air" ? "intellectual stimulation" : "emotional depth"}.`,
      person2: `Your partner's ${partnerZodiac.sign} personality is characterized by ${partnerZodiac.traits.slice(0, 3).join(", ")} traits. Their ${partnerZodiac.element} essence creates a ${partnerZodiac.element === "Fire" ? "dynamic and energetic" : partnerZodiac.element === "Earth" ? "grounded and practical" : partnerZodiac.element === "Air" ? "communicative and social" : "intuitive and empathetic"} presence.`,
      compatibility: `Your ${yourZodiac.element}-${partnerZodiac.element} combination creates ${yourZodiac.element === partnerZodiac.element ? "natural harmony and mutual understanding" : "complementary energies that can balance each other beautifully"}. Together, you bring out ${yourZodiac.strengths[0].toLowerCase()} and ${partnerZodiac.strengths[0].toLowerCase()} qualities in each other.`,
    },
    ageCompatibility: {
      analysis: `With a ${Math.abs(yourAge - partnerAge)}-year age difference, you're ${Math.abs(yourAge - partnerAge) <= 5 ? "close in life stage, sharing similar experiences and perspectives" : Math.abs(yourAge - partnerAge) <= 10 ? "at slightly different life stages, which can offer fresh perspectives and growth opportunities" : "at notably different life stages, bringing diverse wisdom and experiences to the relationship"}. This dynamic ${Math.abs(yourAge - partnerAge) <= 5 ? "fosters easy understanding" : "can enrich your connection with varied viewpoints"}.`,
      score: Math.max(60, 100 - Math.abs(yourAge - partnerAge) * 3),
    },
    passions: {
      person1: [
        yourZodiac.element === "Fire"
          ? "Adventure & Travel"
          : yourZodiac.element === "Earth"
            ? "Building & Creating"
            : yourZodiac.element === "Air"
              ? "Learning & Communication"
              : "Art & Emotional Expression",
        yourZodiac.quality === "Cardinal"
          ? "Leadership & Initiative"
          : yourZodiac.quality === "Fixed"
            ? "Dedication & Mastery"
            : "Variety & Exploration",
        yourZodiac.sign,
      ],
      person2: [
        partnerZodiac.element === "Fire"
          ? "Excitement & Competition"
          : partnerZodiac.element === "Earth"
            ? "Nature & Craftsmanship"
            : partnerZodiac.element === "Air"
              ? "Ideas & Social Connection"
              : "Music & Spirituality",
        partnerZodiac.quality === "Cardinal"
          ? "Innovation & Change"
          : partnerZodiac.quality === "Fixed"
            ? "Loyalty & Commitment"
            : "Flexibility & Adaptation",
        partnerZodiac.sign,
      ],
      shared: ["Deep Connection", "Personal Growth", "Shared Experiences"],
    },
    attributes: {
      person1: {
        physical: `${yourZodiac.element === "Fire" ? "Energetic and dynamic presence" : yourZodiac.element === "Earth" ? "Grounded and steady demeanor" : yourZodiac.element === "Air" ? "Light and expressive energy" : "Fluid and intuitive movements"}`,
        emotional: `${yourZodiac.element === "Water" || yourZodiac.sign === "Cancer" || yourZodiac.sign === "Pisces" ? "Deeply empathetic and emotionally attuned" : yourZodiac.element === "Fire" ? "Passionate and expressive with feelings" : yourZodiac.element === "Earth" ? "Stable and reliable emotionally" : "Intellectually processes emotions"}`,
        mental: `${yourZodiac.element === "Air" ? "Quick-thinking and communicative" : yourZodiac.element === "Fire" ? "Intuitive and action-oriented" : yourZodiac.element === "Earth" ? "Practical and methodical" : "Imaginative and perceptive"}`,
      },
      person2: {
        physical: `${partnerZodiac.element === "Fire" ? "Vibrant and magnetic aura" : partnerZodiac.element === "Earth" ? "Solid and comforting presence" : partnerZodiac.element === "Air" ? "Graceful and animated" : "Gentle and flowing energy"}`,
        emotional: `${partnerZodiac.element === "Water" || partnerZodiac.sign === "Cancer" || partnerZodiac.sign === "Pisces" ? "Highly sensitive and nurturing" : partnerZodiac.element === "Fire" ? "Bold and direct with emotions" : partnerZodiac.element === "Earth" ? "Emotionally grounded and secure" : "Rational yet caring"}`,
        mental: `${partnerZodiac.element === "Air" ? "Analytical and socially intelligent" : partnerZodiac.element === "Fire" ? "Visionary and spontaneous" : partnerZodiac.element === "Earth" ? "Logical and detail-oriented" : "Creative and intuitive"}`,
      },
    },
    ambitions: {
      person1: `As a ${yourZodiac.sign}, you're driven toward ${yourZodiac.quality === "Cardinal" ? "leadership roles and pioneering new paths" : yourZodiac.quality === "Fixed" ? "mastery and building lasting legacies" : "diverse experiences and continuous learning"}. Your ${yourZodiac.element} nature pushes you to achieve through ${yourZodiac.element === "Fire" ? "bold action and innovation" : yourZodiac.element === "Earth" ? "steady progress and tangible results" : yourZodiac.element === "Air" ? "networking and intellectual pursuits" : "intuition and creative expression"}.`,
      person2: `Your partner's ${partnerZodiac.sign} ambitions center on ${partnerZodiac.quality === "Cardinal" ? "initiating change and leading others" : partnerZodiac.quality === "Fixed" ? "perfecting their craft and creating stability" : "exploring possibilities and adapting to opportunities"}. Their ${partnerZodiac.element} approach means they pursue goals through ${partnerZodiac.element === "Fire" ? "passion and determination" : partnerZodiac.element === "Earth" ? "practical planning and persistence" : partnerZodiac.element === "Air" ? "collaboration and communication" : "emotional intelligence and creativity"}.`,
      alignment: `Your ambitions ${yourZodiac.quality === partnerZodiac.quality ? "align beautifully, as you both approach goals with similar energy and timing" : "complement each other, with different approaches that can create a balanced partnership"}. Together, you can ${yourZodiac.element === partnerZodiac.element ? "amplify each other's strengths" : "provide what the other lacks"}, creating a powerful team.`,
    },
    sexualCompatibility: {
      chemistry: `The ${yourZodiac.element}-${partnerZodiac.element} combination creates ${yourZodiac.element === "Fire" && partnerZodiac.element === "Fire" ? "explosive passion and intense physical connection" : yourZodiac.element === "Earth" && partnerZodiac.element === "Earth" ? "sensual, grounded intimacy with deep physical pleasure" : yourZodiac.element === "Air" && partnerZodiac.element === "Air" ? "playful, experimental connection with mental stimulation" : yourZodiac.element === "Water" && partnerZodiac.element === "Water" ? "deeply emotional, intuitive intimacy" : "intriguing chemistry that blends different energies"}. Physical attraction is ${yourZodiac.element === partnerZodiac.element ? "naturally strong" : "built through understanding differences"}.`,
      intimacyStyle: `${yourZodiac.sign} approaches intimacy with ${yourZodiac.element === "Fire" ? "passion and spontaneity" : yourZodiac.element === "Earth" ? "sensuality and consistency" : yourZodiac.element === "Air" ? "playfulness and variety" : "emotional depth and intuition"}, while ${partnerZodiac.sign} brings ${partnerZodiac.element === "Fire" ? "intensity and adventure" : partnerZodiac.element === "Earth" ? "patience and physical pleasure" : partnerZodiac.element === "Air" ? "creativity and communication" : "sensitivity and connection"}. This ${yourZodiac.element === partnerZodiac.element ? "creates natural rhythm" : "requires communication but offers exciting variety"}.`,
      score:
        yourZodiac.element === partnerZodiac.element
          ? 90
          : (yourZodiac.element === "Fire" && partnerZodiac.element === "Air") ||
              (yourZodiac.element === "Earth" && partnerZodiac.element === "Water")
            ? 85
            : 75,
    },
    loveLanguage: {
      person1: {
        primary:
          yourZodiac.element === "Fire"
            ? "Physical Touch"
            : yourZodiac.element === "Earth"
              ? "Acts of Service"
              : yourZodiac.element === "Air"
                ? "Words of Affirmation"
                : "Quality Time",
        description: `${yourZodiac.sign} feels most loved through ${yourZodiac.element === "Fire" ? "physical affection and passionate gestures" : yourZodiac.element === "Earth" ? "practical support and tangible demonstrations" : yourZodiac.element === "Air" ? "verbal appreciation and intellectual connection" : "undivided attention and emotional presence"}`,
      },
      person2: {
        primary:
          partnerZodiac.element === "Fire"
            ? "Physical Touch"
            : partnerZodiac.element === "Earth"
              ? "Acts of Service"
              : partnerZodiac.element === "Air"
                ? "Words of Affirmation"
                : "Quality Time",
        description: `${partnerZodiac.sign} receives love best through ${partnerZodiac.element === "Fire" ? "touch and physical closeness" : partnerZodiac.element === "Earth" ? "helpful actions and reliability" : partnerZodiac.element === "Air" ? "communication and compliments" : "meaningful time together and emotional intimacy"}`,
      },
      compatibility: `Your love languages ${yourZodiac.element === partnerZodiac.element ? "align perfectly, making it easy to meet each other's needs naturally" : "differ, which means you'll need to consciously learn each other's preferred ways of giving and receiving love"}. ${yourZodiac.element === partnerZodiac.element ? "This natural understanding creates effortless affection" : "Understanding these differences can actually deepen your connection through intentional effort"}.`,
    },
    relationshipDynamics: {
      genderDynamics: `In a ${yourGender}-${partnerGender} relationship, your ${yourZodiac.sign}-${partnerZodiac.sign} pairing creates ${yourGender === partnerGender ? "balanced energy where both partners understand similar social experiences and can relate deeply" : "complementary masculine-feminine dynamics that can create natural polarity and attraction"}. ${yourGender === partnerGender ? "You'll navigate similar societal expectations together" : "Traditional gender roles may or may not apply - focus on what works for you both"}.`,
      powerBalance: `${yourZodiac.quality === "Cardinal" ? "You naturally take initiative" : yourZodiac.quality === "Fixed" ? "You provide stability and determination" : "You bring flexibility and adaptability"}, while your partner ${partnerZodiac.quality === "Cardinal" ? "also leads" : partnerZodiac.quality === "Fixed" ? "offers steadiness" : "contributes versatility"}. ${yourZodiac.quality === partnerZodiac.quality ? "This similarity means you'll need to negotiate leadership roles" : "Your different approaches create natural balance in decision-making"}.`,
      conflictStyle: `${yourZodiac.element === "Fire" ? "You address conflict directly and passionately" : yourZodiac.element === "Earth" ? "You prefer practical, solution-focused discussions" : yourZodiac.element === "Air" ? "You want to talk things through logically" : "You need emotional processing time"}, while ${partnerZodiac.sign} ${partnerZodiac.element === "Fire" ? "also confronts issues head-on" : partnerZodiac.element === "Earth" ? "seeks concrete resolutions" : partnerZodiac.element === "Air" ? "values rational dialogue" : "requires emotional space"}. ${yourZodiac.element === partnerZodiac.element ? "Your similar styles make conflict resolution smoother" : "Different conflict styles require patience and compromise"}.`,
    },

    attachmentTheory: {
      person1: {
        style: yourAttachment,
        description: `As a ${yourZodiac.sign}, you tend toward ${yourAttachment} attachment patterns. ${yourZodiac.element === "Water" ? "Your emotional depth can create anxiety around connection and fear of abandonment" : yourZodiac.element === "Earth" ? "Your grounded nature typically fosters secure, stable attachment with clear boundaries" : yourZodiac.element === "Air" ? "Your need for independence can manifest as avoidant tendencies, valuing autonomy over intimacy" : "Your passionate nature supports secure attachment when emotional needs are met"}. This influences how you seek closeness and handle separation.`,
        triggers: [
          yourZodiac.element === "Water"
            ? "Perceived distance or withdrawal"
            : yourZodiac.element === "Air"
              ? "Excessive emotional demands"
              : "Inconsistent availability",
          yourZodiac.element === "Fire" ? "Feeling controlled or restricted" : "Lack of reassurance",
          yourZodiac.quality === "Fixed" ? "Unexpected changes in routine" : "Unpredictability",
        ],
      },
      person2: {
        style: partnerAttachment,
        description: `Your partner's ${partnerZodiac.sign} nature inclines toward ${partnerAttachment} attachment. ${partnerZodiac.element === "Water" ? "Their emotional sensitivity creates heightened awareness of relational threats" : partnerZodiac.element === "Earth" ? "Their practical approach to relationships fosters security and consistency" : partnerZodiac.element === "Air" ? "Their intellectual processing can create emotional distance as a defense mechanism" : "Their confident energy typically supports healthy attachment"}. Understanding this helps navigate intimacy needs.`,
        triggers: [
          partnerZodiac.element === "Water"
            ? "Emotional unavailability"
            : partnerZodiac.element === "Air"
              ? "Pressure for constant togetherness"
              : "Broken promises",
          partnerZodiac.element === "Fire" ? "Attempts to limit freedom" : "Criticism or judgment",
          partnerZodiac.quality === "Cardinal" ? "Lack of forward momentum" : "Stagnation",
        ],
      },
      dyad: `The ${yourAttachment}-${partnerAttachment} pairing ${yourAttachment === partnerAttachment ? "creates mutual understanding of attachment needs, though may amplify shared vulnerabilities" : yourAttachment === "Secure" || partnerAttachment === "Secure" ? "benefits from one partner's secure base, offering stability for growth" : "presents classic anxious-avoidant dynamics where pursuit triggers withdrawal and vice versa"}. ${yourAttachment !== partnerAttachment && yourAttachment !== "Secure" && partnerAttachment !== "Secure" ? "This dynamic requires conscious effort to break pursue-withdraw cycles" : "With awareness, this combination can foster mutual healing and earned security"}.`,
    },

    emotionalIntelligence: {
      person1: {
        selfAwareness:
          yourZodiac.element === "Water" ? 9 : yourZodiac.element === "Air" ? 8 : yourZodiac.element === "Fire" ? 7 : 8,
        selfRegulation:
          yourZodiac.element === "Earth"
            ? 9
            : yourZodiac.element === "Air"
              ? 7
              : yourZodiac.element === "Water"
                ? 6
                : 6,
        empathy:
          yourZodiac.element === "Water"
            ? 10
            : yourZodiac.element === "Earth"
              ? 7
              : yourZodiac.element === "Air"
                ? 8
                : 7,
        socialSkills:
          yourZodiac.element === "Air" ? 9 : yourZodiac.element === "Fire" ? 8 : yourZodiac.element === "Earth" ? 7 : 7,
      },
      person2: {
        selfAwareness:
          partnerZodiac.element === "Water"
            ? 9
            : partnerZodiac.element === "Air"
              ? 8
              : partnerZodiac.element === "Fire"
                ? 7
                : 8,
        selfRegulation:
          partnerZodiac.element === "Earth"
            ? 9
            : partnerZodiac.element === "Air"
              ? 7
              : partnerZodiac.element === "Water"
                ? 6
                : 6,
        empathy:
          partnerZodiac.element === "Water"
            ? 10
            : partnerZodiac.element === "Earth"
              ? 7
              : partnerZodiac.element === "Air"
                ? 8
                : 7,
        socialSkills:
          partnerZodiac.element === "Air"
            ? 9
            : partnerZodiac.element === "Fire"
              ? 8
              : partnerZodiac.element === "Earth"
                ? 7
                : 7,
      },
      analysis: `${yourZodiac.sign} excels in ${yourZodiac.element === "Water" ? "empathy and self-awareness" : yourZodiac.element === "Air" ? "social skills and communication" : yourZodiac.element === "Earth" ? "self-regulation and reliability" : "confidence and enthusiasm"}, while ${partnerZodiac.sign} brings strength in ${partnerZodiac.element === "Water" ? "emotional attunement" : partnerZodiac.element === "Air" ? "intellectual processing" : partnerZodiac.element === "Earth" ? "emotional stability" : "passionate expression"}. Together, you ${yourZodiac.element === partnerZodiac.element ? "share similar emotional intelligence profiles" : "complement each other's emotional capabilities"}.`,
    },

    gottmanPrinciples: {
      positiveToNegativeRatio: `Your ${yourZodiac.element}-${partnerZodiac.element} combination suggests a ${yourZodiac.element === partnerZodiac.element ? "naturally balanced" : yourZodiac.element === "Fire" && partnerZodiac.element === "Water" ? "potentially volatile" : "moderately stable"} positive-to-negative interaction ratio. ${yourZodiac.element === partnerZodiac.element ? "Similar emotional processing helps maintain the critical 5:1 ratio during calm periods" : "Different emotional styles require conscious effort to maintain positive interactions"}. During conflicts, ${yourZodiac.element === "Fire" || partnerZodiac.element === "Fire" ? "passion can escalate quickly" : "you tend toward measured responses"}.`,
      fourHorsemen: [
        yourZodiac.element === "Fire" || partnerZodiac.element === "Fire"
          ? "Criticism (when frustrated)"
          : "Stonewalling (when overwhelmed)",
        yourZodiac.quality === "Fixed" || partnerZodiac.quality === "Fixed"
          ? "Defensiveness (protecting position)"
          : "Withdrawal (needing space)",
      ],
      repairAttempts: `${yourZodiac.sign} typically repairs through ${yourZodiac.element === "Fire" ? "passionate apologies and grand gestures" : yourZodiac.element === "Earth" ? "practical actions and consistent follow-through" : yourZodiac.element === "Air" ? "verbal processing and logical discussion" : "emotional vulnerability and reconnection"}. ${partnerZodiac.sign} responds to ${partnerZodiac.element === "Fire" ? "direct acknowledgment and physical affection" : partnerZodiac.element === "Earth" ? "tangible demonstrations of change" : partnerZodiac.element === "Air" ? "thoughtful conversation and understanding" : "emotional presence and reassurance"}. ${yourZodiac.element === partnerZodiac.element ? "Your similar repair styles facilitate quick recovery" : "Learning each other's repair language is essential"}.`,
    },

    communicationPatterns: {
      person1Style: `As a ${yourZodiac.sign}, you communicate with ${yourZodiac.element === "Fire" ? "directness and passion, often speaking before fully processing" : yourZodiac.element === "Earth" ? "practicality and deliberation, preferring concrete discussions" : yourZodiac.element === "Air" ? "intellectual curiosity and verbal fluency, enjoying abstract concepts" : "emotional depth and intuition, reading between the lines"}. Your ${yourZodiac.quality} quality means you ${yourZodiac.quality === "Cardinal" ? "initiate conversations and drive discussions forward" : yourZodiac.quality === "Fixed" ? "maintain positions and value consistency in communication" : "adapt your style to the situation and audience"}.`,
      person2Style: `Your partner's ${partnerZodiac.sign} communication reflects ${partnerZodiac.element === "Fire" ? "enthusiasm and spontaneity, expressing thoughts as they arise" : partnerZodiac.element === "Earth" ? "groundedness and clarity, focusing on practical matters" : partnerZodiac.element === "Air" ? "analytical thinking and articulation, valuing logical discourse" : "sensitivity and nuance, attuned to emotional undertones"}. Their ${partnerZodiac.quality} nature means they ${partnerZodiac.quality === "Cardinal" ? "lead conversations and set communication agendas" : partnerZodiac.quality === "Fixed" ? "hold firm to their perspectives and value deep discussion" : "flow with conversational dynamics and adjust easily"}.`,
      compatibility: `Your communication styles ${yourZodiac.element === partnerZodiac.element ? "naturally align, creating easy understanding and flow" : "differ in meaningful ways that require conscious bridging"}. ${yourZodiac.element === "Fire" && partnerZodiac.element === "Water" ? "Fire's directness can overwhelm Water's sensitivity, while Water's emotional depth can frustrate Fire's need for action" : yourZodiac.element === "Earth" && partnerZodiac.element === "Air" ? "Earth's practicality grounds Air's abstractions, while Air's ideas inspire Earth's implementations" : "Your different approaches can create rich, multidimensional conversations when both feel heard"}.`,
    },

    conflictResolution: {
      person1Approach: `${yourZodiac.sign} handles conflict through ${yourZodiac.element === "Fire" ? "direct confrontation and passionate expression, seeking immediate resolution" : yourZodiac.element === "Earth" ? "practical problem-solving and steady persistence, focusing on concrete solutions" : yourZodiac.element === "Air" ? "intellectual analysis and verbal processing, wanting to understand all perspectives" : "emotional processing and intuitive understanding, needing time to feel through issues"}. You ${yourZodiac.quality === "Cardinal" ? "take initiative to address problems head-on" : yourZodiac.quality === "Fixed" ? "stand firm in your position and resist compromise" : "adapt your approach based on the situation"}.`,
      person2Approach: `${partnerZodiac.sign} approaches conflict with ${partnerZodiac.element === "Fire" ? "intensity and urgency, wanting quick resolution and action" : partnerZodiac.element === "Earth" ? "patience and pragmatism, seeking workable compromises" : partnerZodiac.element === "Air" ? "rationality and detachment, preferring logical discussion over emotional expression" : "sensitivity and depth, requiring emotional safety to engage"}. They ${partnerZodiac.quality === "Cardinal" ? "initiate difficult conversations and push for progress" : partnerZodiac.quality === "Fixed" ? "maintain their stance and value consistency" : "remain flexible and open to various resolutions"}.`,
      recommendations: [
        `Establish a "pause button" protocol when ${yourZodiac.element === "Fire" || partnerZodiac.element === "Fire" ? "emotions run high" : "discussion becomes circular"}`,
        `Honor ${yourZodiac.element === "Water" || partnerZodiac.element === "Water" ? "emotional processing time" : yourZodiac.element === "Air" || partnerZodiac.element === "Air" ? "need for logical discussion" : "different conflict styles"} without judgment`,
        `Practice ${yourZodiac.element === partnerZodiac.element ? "channeling your shared energy constructively" : "translating between your different conflict languages"}`,
        `Create agreements about ${yourZodiac.quality === "Fixed" || partnerZodiac.quality === "Fixed" ? "when to revisit decisions" : "how to reach resolution"} before conflicts arise`,
      ],
    },

    therapeuticRecommendations: {
      exercises: [
        `Daily ${yourZodiac.element === "Water" || partnerZodiac.element === "Water" ? "emotional check-ins" : yourZodiac.element === "Air" || partnerZodiac.element === "Air" ? "communication practice" : "connection rituals"} (10-15 minutes)`,
        `Weekly state-of-union conversations addressing what's working and what needs attention`,
        `${yourZodiac.element === "Fire" || partnerZodiac.element === "Fire" ? "Passion projects" : yourZodiac.element === "Earth" || partnerZodiac.element === "Earth" ? "Shared goals" : "Collaborative activities"} to build teamwork`,
        `Practice ${yourAttachment === "Anxious-Preoccupied" || partnerAttachment === "Anxious-Preoccupied" ? "self-soothing techniques" : yourAttachment === "Dismissive-Avoidant" || partnerAttachment === "Dismissive-Avoidant" ? "vulnerability exercises" : "secure attachment behaviors"}`,
      ],
      focusAreas: [
        `${yourAttachment !== partnerAttachment ? "Attachment pattern awareness and healing" : "Deepening secure attachment"}`,
        `${yourZodiac.element !== partnerZodiac.element ? "Bridging different emotional languages" : "Channeling shared elemental energy"}`,
        `Developing ${yourZodiac.element === "Fire" || partnerZodiac.element === "Fire" ? "emotional regulation" : yourZodiac.element === "Water" || partnerZodiac.element === "Water" ? "boundaries and self-soothing" : yourZodiac.element === "Air" || partnerZodiac.element === "Air" ? "emotional expression" : "spontaneity and flexibility"}`,
      ],
      suggestedModalities: [
        yourAttachment !== partnerAttachment &&
        (yourAttachment === "Anxious-Preoccupied" || partnerAttachment === "Anxious-Preoccupied") &&
        (yourAttachment === "Dismissive-Avoidant" || partnerAttachment === "Dismissive-Avoidant")
          ? "Emotionally Focused Therapy (EFT)"
          : "Gottman Method Couples Therapy",
        `Individual therapy for ${yourAttachment !== "Secure" || partnerAttachment !== "Secure" ? "attachment healing" : "personal growth"}`,
      ],
    },

    prognosis: {
      shortTerm: `Over the next 1-3 months, expect ${yourZodiac.element === partnerZodiac.element ? "natural harmony with occasional intensity from shared traits" : "a learning curve as you navigate different emotional styles"}. ${yourAttachment === partnerAttachment ? "Your similar attachment patterns will create understanding" : yourAttachment === "Secure" || partnerAttachment === "Secure" ? "The secure partner can provide stability during adjustment" : "Attachment differences may create pursue-withdraw dynamics that require conscious interruption"}. Initial patterns will ${yourZodiac.quality === partnerZodiac.quality ? "feel familiar and comfortable" : "require negotiation and compromise"}.`,
      longTerm: `With sustained effort over 12+ months, this pairing has ${yourZodiac.element === partnerZodiac.element ? "strong potential for deep, lasting connection" : "excellent potential for balanced, complementary partnership"}. ${yourAttachment === "Secure" && partnerAttachment === "Secure" ? "Your secure attachment foundation supports long-term stability" : yourAttachment === "Secure" || partnerAttachment === "Secure" ? "The secure partner can help the other develop earned security" : "Both partners can achieve earned secure attachment through dedicated work"}. Your ${yourZodiac.sign}-${partnerZodiac.sign} combination ${baseCompatibilityScore >= 80 ? "is highly compatible with natural chemistry" : baseCompatibilityScore >= 70 ? "offers good compatibility with some areas requiring attention" : "presents growth opportunities that can strengthen the bond"}.`,
      riskFactors: [
        yourAttachment === "Anxious-Preoccupied" && partnerAttachment === "Dismissive-Avoidant"
          ? "Classic anxious-avoidant trap intensifying over time"
          : yourAttachment === partnerAttachment && yourAttachment !== "Secure"
            ? "Amplifying shared insecure attachment patterns"
            : "Unaddressed attachment wounds",
        yourZodiac.element === "Fire" && partnerZodiac.element === "Water"
          ? "Fire-Water volatility escalating without regulation skills"
          : yourZodiac.quality === "Fixed" && partnerZodiac.quality === "Fixed"
            ? "Stubbornness creating gridlock on key issues"
            : "Communication breakdowns during stress",
      ],
      protectiveFactors: [
        `${yourZodiac.element === partnerZodiac.element ? "Shared elemental understanding" : "Complementary elemental balance"}`,
        `${Math.abs(yourAge - partnerAge) <= 5 ? "Similar life stages and shared experiences" : "Diverse perspectives enriching the relationship"}`,
        `${yourZodiac.strengths[0]} and ${partnerZodiac.strengths[0]} creating strong foundation`,
        `Willingness to understand ${yourAttachment !== partnerAttachment ? "different attachment needs" : "shared attachment patterns"}`,
      ],
    },

    advice: {
      success: [
        `Embrace your ${yourZodiac.element === partnerZodiac.element ? "shared" : "complementary"} energies - ${yourZodiac.element === partnerZodiac.element ? "amplify your natural connection" : "let your differences create balance"}`,
        `Honor each other's love languages: ${yourZodiac.element === "Fire" ? "physical touch" : yourZodiac.element === "Earth" ? "acts of service" : yourZodiac.element === "Air" ? "words of affirmation" : "quality time"} and ${partnerZodiac.element === "Fire" ? "physical touch" : partnerZodiac.element === "Earth" ? "acts of service" : partnerZodiac.element === "Air" ? "words of affirmation" : "quality time"}`,
        `Build on your shared ${yourZodiac.quality === partnerZodiac.quality ? yourZodiac.quality.toLowerCase() + " energy" : "complementary approaches"} to create a strong foundation`,
        `Practice ${yourAttachment === "Anxious-Preoccupied" || partnerAttachment === "Anxious-Preoccupied" ? "self-soothing and secure base building" : yourAttachment === "Dismissive-Avoidant" || partnerAttachment === "Dismissive-Avoidant" ? "vulnerability and emotional expression" : "maintaining secure attachment behaviors"}`,
      ],
      awareness: [
        `Watch for ${yourZodiac.weaknesses[0].toLowerCase()} (${yourZodiac.sign}) and ${partnerZodiac.weaknesses[0].toLowerCase()} (${partnerZodiac.sign}) tendencies`,
        `${yourAttachment !== partnerAttachment && yourAttachment !== "Secure" && partnerAttachment !== "Secure" ? "Recognize and interrupt pursue-withdraw cycles before they escalate" : "Stay aware of attachment triggers and communicate needs clearly"}`,
        `${yourZodiac.element !== partnerZodiac.element ? `Navigate ${yourZodiac.element}-${partnerZodiac.element} differences with patience and understanding` : `Avoid amplifying negative ${yourZodiac.element} traits when stressed`}`,
      ],
    },
  }
}
