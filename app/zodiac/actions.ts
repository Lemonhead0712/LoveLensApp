"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { ZodiacSign } from "./types" // Declare or import ZodiacSign here

async function generateDetailedAnalysis(
  yourZodiac: ZodiacSign,
  partnerZodiac: ZodiacSign,
  yourAge: number,
  partnerAge: number,
  yourGender: string,
  partnerGender: string,
  baseCompatibilityScore: number,
) {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      temperature: 0.8,
      maxTokens: 3500,
      messages: [
        {
          role: "system",
          content: `Expert astrologer & relationship psychologist. Generate comprehensive compatibility analysis using attachment theory, Gottman Method, and emotional intelligence. Output ONLY valid JSON.`,
        },
        {
          role: "user",
          content: `Analyze ${yourZodiac.sign} (${yourGender}, ${yourAge}) + ${partnerZodiac.sign} (${partnerGender}, ${partnerAge}). Generate detailed JSON with 3-4 sentence descriptions per field, specific examples, and actionable insights. Use varied, engaging language.`,
        },
      ],
    })

    let jsonText = text.trim()
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1]
    } else {
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        jsonText = jsonMatch[0]
      }
    }

    jsonText = jsonText.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").replace(/,(\s*[}\]])/g, "$1")

    return JSON.parse(jsonText)
  } catch (error) {
    console.error("[v0] AI analysis error:", error)
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
  baseCompatibilityScore: number,
) {
  const getAttachmentStyle = (zodiac: ZodiacSign) => {
    if (zodiac.element === "Water") return "Anxious-Preoccupied"
    if (zodiac.element === "Earth") return "Secure"
    if (zodiac.element === "Air") return "Dismissive-Avoidant"
    return "Secure"
  }

  const yourAttachment = getAttachmentStyle(yourZodiac)
  const partnerAttachment = getAttachmentStyle(partnerZodiac)

  return {
    personalityInsights: {
      person1: `As a ${yourZodiac.sign}, you embody ${yourZodiac.element} energy through ${yourZodiac.traits.slice(0, 3).join(", ").toLowerCase()} qualities. Your ${yourZodiac.quality.toLowerCase()} nature drives you to ${yourZodiac.quality === "Cardinal" ? "initiate and lead" : yourZodiac.quality === "Fixed" ? "maintain and perfect" : "adapt and flow"}, creating a distinct relational style.`,
      person2: `Your ${partnerZodiac.sign} partner radiates ${partnerZodiac.element} essence through ${partnerZodiac.traits.slice(0, 3).join(", ").toLowerCase()} characteristics. Their ${partnerZodiac.quality.toLowerCase()} approach manifests as ${partnerZodiac.quality === "Cardinal" ? "pioneering leadership" : partnerZodiac.quality === "Fixed" ? "steadfast dedication" : "flexible versatility"}.`,
      compatibility: `The ${yourZodiac.element}-${partnerZodiac.element} combination creates ${yourZodiac.element === partnerZodiac.element ? "natural resonance and mutual understanding" : "complementary dynamics requiring conscious bridging"}. Together, you activate growth in ${yourZodiac.strengths[0].toLowerCase()} and ${partnerZodiac.strengths[0].toLowerCase()} areas.`,
    },
    ageCompatibility: {
      analysis: `Your ${Math.abs(yourAge - partnerAge)}-year age difference ${Math.abs(yourAge - partnerAge) <= 5 ? "creates natural alignment in life stages and shared experiences" : "introduces different perspectives and life wisdom that can enrich the relationship"}. This gap ${Math.abs(yourAge - partnerAge) <= 3 ? "minimizes generational friction" : "requires conscious effort to bridge different life experiences"}.`,
      score: Math.max(60, 100 - Math.abs(yourAge - partnerAge) * 3),
    },
    passions: {
      person1: [
        `${yourZodiac.element} pursuits`,
        `${yourZodiac.quality} activities`,
        `${yourZodiac.sign}-specific interests`,
        "Personal growth",
      ],
      person2: [
        `${partnerZodiac.element} endeavors`,
        `${partnerZodiac.quality} projects`,
        `${partnerZodiac.sign}-specific hobbies`,
        "Relationship building",
      ],
      shared: ["Emotional connection", "Mutual growth", "Shared experiences"],
    },
    attributes: {
      person1: {
        physical: `${yourZodiac.element === "Fire" ? "Dynamic, energetic presence" : yourZodiac.element === "Earth" ? "Grounded, solid presence" : yourZodiac.element === "Air" ? "Light, expressive presence" : "Fluid, intuitive presence"} with natural ${yourZodiac.strengths[0].toLowerCase()}.`,
        emotional: `${yourZodiac.element === "Water" ? "Deeply empathetic and sensitive" : yourZodiac.element === "Fire" ? "Passionate and expressive" : yourZodiac.element === "Earth" ? "Stable and reliable" : "Intellectually processes emotions"}, creating ${yourZodiac.element} emotional landscape.`,
        mental: `${yourZodiac.element === "Air" ? "Quick-thinking and analytical" : yourZodiac.element === "Fire" ? "Intuitive and action-oriented" : yourZodiac.element === "Earth" ? "Practical and methodical" : "Imaginative and perceptive"} approach to challenges.`,
      },
      person2: {
        physical: `${partnerZodiac.element === "Fire" ? "Vibrant, magnetic presence" : partnerZodiac.element === "Earth" ? "Solid, comforting presence" : partnerZodiac.element === "Air" ? "Graceful, animated presence" : "Gentle, flowing presence"} with ${partnerZodiac.strengths[0].toLowerCase()} energy.`,
        emotional: `${partnerZodiac.element === "Water" ? "Highly sensitive and nurturing" : partnerZodiac.element === "Fire" ? "Bold and direct" : partnerZodiac.element === "Earth" ? "Emotionally grounded" : "Rational yet caring"} emotional style.`,
        mental: `${partnerZodiac.element === "Air" ? "Analytical and socially intelligent" : partnerZodiac.element === "Fire" ? "Visionary and spontaneous" : partnerZodiac.element === "Earth" ? "Logical and detail-oriented" : "Creative and intuitive"} thinking patterns.`,
      },
    },
    ambitions: {
      person1: `Your ${yourZodiac.sign} ambitions center on ${yourZodiac.quality === "Cardinal" ? "pioneering new territories" : yourZodiac.quality === "Fixed" ? "building lasting legacies" : "exploring diverse paths"}. Your ${yourZodiac.element} nature drives you through ${yourZodiac.element === "Fire" ? "bold action" : yourZodiac.element === "Earth" ? "practical planning" : yourZodiac.element === "Air" ? "networking" : "intuition"}.`,
      person2: `Your partner's ${partnerZodiac.sign} goals revolve around ${partnerZodiac.quality === "Cardinal" ? "initiating change" : partnerZodiac.quality === "Fixed" ? "achieving excellence" : "maintaining freedom"}. Their ${partnerZodiac.element} approach emphasizes ${partnerZodiac.element === "Fire" ? "dynamic action" : partnerZodiac.element === "Earth" ? "methodical effort" : partnerZodiac.element === "Air" ? "strategic thinking" : "emotional intelligence"}.`,
      alignment: `Your ambitions ${yourZodiac.quality === partnerZodiac.quality ? "share similar timing and energy" : "complement each other through different approaches"}. Together, you can ${yourZodiac.element === partnerZodiac.element ? "amplify shared values" : "create balanced success"}.`,
    },
    sexualCompatibility: {
      chemistry: `The ${yourZodiac.element}-${partnerZodiac.element} dynamic creates ${yourZodiac.element === partnerZodiac.element ? "intense resonance and natural understanding" : "complementary energies requiring communication"}. Physical attraction ${baseCompatibilityScore > 75 ? "flows naturally" : "develops through emotional connection"}.`,
      intimacyStyle: `${yourZodiac.sign} approaches intimacy with ${yourZodiac.element === "Fire" ? "passionate spontaneity" : yourZodiac.element === "Earth" ? "sensual patience" : yourZodiac.element === "Air" ? "playful curiosity" : "emotional depth"}, while ${partnerZodiac.sign} brings ${partnerZodiac.element === "Fire" ? "intensity" : partnerZodiac.element === "Earth" ? "sensuality" : partnerZodiac.element === "Air" ? "creativity" : "tenderness"}.`,
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
        description: `${yourZodiac.sign} feels loved through ${yourZodiac.element === "Fire" ? "physical affection and passionate gestures" : yourZodiac.element === "Earth" ? "practical support and helpful actions" : yourZodiac.element === "Air" ? "verbal appreciation and intellectual connection" : "undivided attention and emotional presence"}.`,
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
        description: `${partnerZodiac.sign} receives love through ${partnerZodiac.element === "Fire" ? "physical closeness and affectionate touch" : partnerZodiac.element === "Earth" ? "helpful actions and reliable follow-through" : partnerZodiac.element === "Air" ? "verbal expression and engaging communication" : "focused attention and meaningful experiences"}.`,
      },
      compatibility: `Your love languages ${yourZodiac.element === partnerZodiac.element ? "align naturally, creating effortless mutual satisfaction" : "differ, requiring conscious learning and practice"}. Success comes through ${yourZodiac.element === partnerZodiac.element ? "maintaining intentionality" : "speaking each other's language"}.`,
    },
    relationshipDynamics: {
      genderDynamics: `In a ${yourGender}-${partnerGender} relationship, your pairing creates ${yourGender === partnerGender ? "shared understanding of gender experiences" : "complementary masculine-feminine polarity"}. This dynamic ${yourGender === partnerGender ? "fosters deep empathy" : "enhances natural attraction"}.`,
      powerBalance: `${yourZodiac.quality === "Cardinal" ? "You naturally lead" : yourZodiac.quality === "Fixed" ? "You provide stability" : "You bring flexibility"}, while your partner ${partnerZodiac.quality === "Cardinal" ? "also initiates" : partnerZodiac.quality === "Fixed" ? "offers steadiness" : "contributes adaptability"}. ${yourZodiac.quality === partnerZodiac.quality ? "Negotiate leadership roles" : "Natural role differentiation emerges"}.`,
      conflictStyle: `${yourZodiac.element === "Fire" ? "You address conflict directly and passionately" : yourZodiac.element === "Earth" ? "You prefer practical, solution-focused discussions" : yourZodiac.element === "Air" ? "You want logical, rational dialogue" : "You need emotional processing time"}, while your partner ${partnerZodiac.element === "Fire" ? "engages intensely" : partnerZodiac.element === "Earth" ? "focuses on solutions" : partnerZodiac.element === "Air" ? "analyzes rationally" : "processes emotionally"}.`,
    },
    attachmentTheory: {
      person1: {
        style: yourAttachment,
        description: `As ${yourZodiac.sign}, you tend toward ${yourAttachment} patterns shaped by ${yourZodiac.element} nature. ${yourAttachment === "Secure" ? "You balance intimacy and autonomy naturally" : yourAttachment === "Anxious-Preoccupied" ? "You may need frequent reassurance" : "You value independence highly"}.`,
        triggers: [
          `${yourAttachment === "Anxious-Preoccupied" ? "Perceived distance" : yourAttachment === "Dismissive-Avoidant" ? "Excessive closeness demands" : "Inconsistent availability"}`,
          `${yourZodiac.quality === "Fixed" ? "Unexpected changes" : yourZodiac.quality === "Cardinal" ? "Feeling stuck" : "Excessive rigidity"}`,
          `${yourAttachment === "Anxious-Preoccupied" ? "Partner needing space" : yourAttachment === "Dismissive-Avoidant" ? "Strong emotional demands" : "Core criticism"}`,
        ],
      },
      person2: {
        style: partnerAttachment,
        description: `Your partner's ${partnerZodiac.sign} nature inclines toward ${partnerAttachment} attachment influenced by ${partnerZodiac.element} essence. ${partnerAttachment === "Secure" ? "They maintain healthy balance" : partnerAttachment === "Anxious-Preoccupied" ? "They may seek frequent connection" : "They prioritize autonomy"}`,
        triggers: [
          `${partnerAttachment === "Anxious-Preoccupied" ? "Your emotional unavailability" : partnerAttachment === "Dismissive-Avoidant" ? "Pressure for constant togetherness" : "Inconsistent presence"}`,
          `${partnerZodiac.quality === "Cardinal" ? "Lack of momentum" : partnerZodiac.quality === "Fixed" ? "Unexpected instability" : "Excessive rigidity"}`,
          `${partnerAttachment === "Anxious-Preoccupied" ? "You needing alone time" : partnerAttachment === "Dismissive-Avoidant" ? "You showing strong emotions" : "Rejection of authentic self"}`,
        ],
      },
      dyad: `The ${yourAttachment}-${partnerAttachment} pairing ${yourAttachment === partnerAttachment ? "creates mutual understanding" : yourAttachment === "Secure" || partnerAttachment === "Secure" ? "benefits from secure base" : "requires conscious work"}. ${yourAttachment !== partnerAttachment && yourAttachment !== "Secure" && partnerAttachment !== "Secure" ? "Individual therapy recommended" : "Build security through consistent responsiveness"}.`,
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
      analysis: `${yourZodiac.sign} excels in ${yourZodiac.element === "Water" ? "empathy and self-awareness" : yourZodiac.element === "Air" ? "social skills and awareness" : yourZodiac.element === "Earth" ? "self-regulation and reliability" : "confidence and enthusiasm"}, while ${partnerZodiac.sign} brings ${partnerZodiac.element === "Water" ? "emotional attunement" : partnerZodiac.element === "Air" ? "intellectual processing" : partnerZodiac.element === "Earth" ? "emotional stability" : "passionate expression"}. Together, you create balanced emotional intelligence.`,
    },
    gottmanPrinciples: {
      positiveToNegativeRatio: `Your ${yourZodiac.element}-${partnerZodiac.element} combination suggests ${yourZodiac.element === partnerZodiac.element ? `${yourZodiac.element === "Fire" ? "passionate but volatile" : yourZodiac.element === "Earth" ? "stable and consistent" : yourZodiac.element === "Air" ? "intellectually engaged" : "deeply emotional"} interaction patterns` : "complementary dynamics"}. Maintain 5:1 positive-to-negative ratio through ${yourZodiac.element === "Fire" || partnerZodiac.element === "Fire" ? "enthusiasm and affection" : "steady appreciation"}.`,
      fourHorsemen: [
        yourZodiac.element === "Fire" || partnerZodiac.element === "Fire"
          ? "Criticism risk during frustration"
          : "Defensiveness when hurt",
        yourZodiac.quality === "Fixed" || partnerZodiac.quality === "Fixed"
          ? "Stubbornness in conflicts"
          : "Withdrawal when overwhelmed",
      ],
      repairAttempts: `${yourZodiac.sign} repairs through ${yourZodiac.element === "Fire" ? "passionate apologies and physical affection" : yourZodiac.element === "Earth" ? "practical actions and follow-through" : yourZodiac.element === "Air" ? "verbal processing and discussion" : "emotional vulnerability and sharing"}. ${partnerZodiac.sign} responds to ${partnerZodiac.element === "Fire" ? "direct acknowledgment and energy" : partnerZodiac.element === "Earth" ? "concrete plans and actions" : partnerZodiac.element === "Air" ? "calm conversation" : "emotional presence"}.`,
    },
    communicationPatterns: {
      person1Style: `As ${yourZodiac.sign}, you communicate with ${yourZodiac.element === "Fire" ? "directness and passion" : yourZodiac.element === "Earth" ? "practicality and deliberation" : yourZodiac.element === "Air" ? "intellectual curiosity" : "emotional depth"}. Your style is ${yourZodiac.element === "Fire" ? "confident and assertive" : yourZodiac.element === "Earth" ? "reliable and straightforward" : yourZodiac.element === "Air" ? "charming and intelligent" : "nurturing and perceptive"}.`,
      person2Style: `Your partner's ${partnerZodiac.sign} communication reflects ${partnerZodiac.element === "Fire" ? "enthusiasm and spontaneity" : partnerZodiac.element === "Earth" ? "groundedness and clarity" : partnerZodiac.element === "Air" ? "analytical thinking" : "sensitivity and nuance"}. Their style is ${partnerZodiac.element === "Fire" ? "confident and direct" : partnerZodiac.element === "Earth" ? "dependable and clear" : partnerZodiac.element === "Air" ? "charming and intelligent" : "caring and perceptive"}.`,
      compatibility: `Your communication styles ${yourZodiac.element === partnerZodiac.element ? "naturally align, creating easy understanding" : "differ, requiring conscious bridging"}. Success comes through ${yourZodiac.element === partnerZodiac.element ? "maintaining active listening" : "translating between your languages"}.`,
    },
    conflictResolution: {
      person1Approach: `${yourZodiac.sign} handles conflict through ${yourZodiac.element === "Fire" ? "direct confrontation and immediate resolution" : yourZodiac.element === "Earth" ? "practical problem-solving" : yourZodiac.element === "Air" ? "intellectual analysis" : "emotional processing"}. You ${yourZodiac.element === "Fire" ? "escalate when unheard" : yourZodiac.element === "Earth" ? "dig in when pushed" : yourZodiac.element === "Air" ? "detach when dismissed" : "withdraw when unsafe"}.`,
      person2Approach: `${partnerZodiac.sign} approaches conflict with ${partnerZodiac.element === "Fire" ? "intensity and urgency" : partnerZodiac.element === "Earth" ? "patience and pragmatism" : partnerZodiac.element === "Air" ? "rationality and detachment" : "sensitivity and depth"}. They ${partnerZodiac.element === "Fire" ? "need quick resolution" : partnerZodiac.element === "Earth" ? "focus on solutions" : partnerZodiac.element === "Air" ? "seek understanding" : "require emotional safety"}.`,
      recommendations: [
        "Establish pause button protocol for emotional regulation",
        "Honor each other's conflict styles and needs",
        "Practice translating between your approaches",
        "Create pre-conflict agreements about process",
        "Use 'I feel' statements instead of accusations",
      ],
    },
    therapeuticRecommendations: {
      exercises: [
        "Daily emotional check-ins (10-15 minutes)",
        "Weekly state-of-union conversations (30-45 minutes)",
        `${yourZodiac.element === "Fire" || partnerZodiac.element === "Fire" ? "Passion projects or adventure dates" : yourZodiac.element === "Earth" || partnerZodiac.element === "Earth" ? "Shared goals or building projects" : yourZodiac.element === "Air" || partnerZodiac.element === "Air" ? "Collaborative learning dates" : "Creative or spiritual practices"}`,
        "Attachment-focused vulnerability exercises",
      ],
      focusAreas: [
        "Attachment pattern awareness and healing",
        "Bridging different emotional languages",
        `Developing ${yourZodiac.element === "Fire" || partnerZodiac.element === "Fire" ? "emotional regulation" : yourZodiac.element === "Water" || partnerZodiac.element === "Water" ? "emotional boundaries" : yourZodiac.element === "Air" || partnerZodiac.element === "Air" ? "emotional expression" : "spontaneity"}`,
        `${Math.abs(yourAge - partnerAge) > 7 ? "Navigating age gap dynamics" : yourGender === partnerGender ? "Same-gender relationship dynamics" : "Different-gender dynamics"}`,
      ],
      suggestedModalities: [
        yourAttachment !== partnerAttachment &&
        (yourAttachment === "Anxious-Preoccupied" || partnerAttachment === "Anxious-Preoccupied") &&
        (yourAttachment === "Dismissive-Avoidant" || partnerAttachment === "Dismissive-Avoidant")
          ? "Emotionally Focused Therapy (EFT)"
          : "Gottman Method Couples Therapy",
        "Individual therapy for personal growth",
        `${yourZodiac.element === "Water" || partnerZodiac.element === "Water" ? "Mindfulness practice" : yourZodiac.element === "Fire" || partnerZodiac.element === "Fire" ? "Physical practices" : yourZodiac.element === "Air" || partnerZodiac.element === "Air" ? "Somatic therapy" : "Relationship education"}`,
      ],
    },
    prognosis: {
      shortTerm: `Over 1-3 months, expect ${yourZodiac.element === partnerZodiac.element ? `natural harmony with occasional intensity from shared ${yourZodiac.element} traits` : "a learning curve navigating different styles"}. ${baseCompatibilityScore > 75 ? "Strong initial connection supports growth" : "Building foundation requires patience"}.`,
      longTerm: `With sustained effort over 12+ months, this pairing has ${baseCompatibilityScore > 75 ? "strong potential for lasting connection" : "moderate potential requiring conscious work"}. ${yourZodiac.element === partnerZodiac.element ? "Shared elemental understanding creates foundation" : "Different elements offer growth opportunities"}. Success depends on ${yourAttachment !== partnerAttachment ? "healing attachment wounds" : "maintaining secure patterns"}.`,
      riskFactors: [
        yourZodiac.element === partnerZodiac.element
          ? `Amplified ${yourZodiac.element} challenges`
          : "Elemental misunderstandings",
        yourAttachment !== partnerAttachment ? "Attachment pattern conflicts" : "Complacency in security",
        `${Math.abs(yourAge - partnerAge) > 10 ? "Significant age gap" : "Life stage differences"}`,
      ],
      protectiveFactors: [
        `${baseCompatibilityScore > 75 ? "Strong natural compatibility" : "Complementary differences"}`,
        yourAttachment === "Secure" || partnerAttachment === "Secure"
          ? "Secure attachment base"
          : "Mutual growth commitment",
        `Shared ${yourZodiac.quality === partnerZodiac.quality ? yourZodiac.quality.toLowerCase() + " energy" : "complementary qualities"}`,
        "Conscious relationship practices",
      ],
    },
    advice: {
      success: [
        `Honor your ${yourZodiac.element}-${partnerZodiac.element} dynamic through ${yourZodiac.element === partnerZodiac.element ? "channeling shared energy constructively" : "bridging different approaches"}`,
        `Practice each other's love languages: ${yourZodiac.element === "Fire" ? "physical touch" : yourZodiac.element === "Earth" ? "acts of service" : yourZodiac.element === "Air" ? "words of affirmation" : "quality time"} and ${partnerZodiac.element === "Fire" ? "physical touch" : partnerZodiac.element === "Earth" ? "acts of service" : partnerZodiac.element === "Air" ? "words of affirmation" : "quality time"}`,
        "Maintain 5:1 positive-to-negative interaction ratio",
        `${yourAttachment !== partnerAttachment ? "Address attachment patterns through therapy" : "Continue building secure attachment"}`,
        "Create regular rituals for connection and check-ins",
      ],
      awareness: [
        `Watch for ${yourZodiac.element === "Fire" || partnerZodiac.element === "Fire" ? "impulsive reactions and escalation" : yourZodiac.element === "Water" || partnerZodiac.element === "Water" ? "emotional overwhelm and enmeshment" : yourZodiac.element === "Air" || partnerZodiac.element === "Air" ? "emotional detachment and intellectualization" : "stubbornness and rigidity"}`,
        `${yourAttachment === "Anxious-Preoccupied" || partnerAttachment === "Anxious-Preoccupied" ? "Anxious partner: avoid excessive reassurance-seeking" : yourAttachment === "Dismissive-Avoidant" || partnerAttachment === "Dismissive-Avoidant" ? "Avoidant partner: practice vulnerability" : "Maintain balance between intimacy and autonomy"}`,
        `${yourZodiac.quality === "Fixed" || partnerZodiac.quality === "Fixed" ? "Fixed signs: practice flexibility during conflicts" : yourZodiac.quality === "Cardinal" || partnerZodiac.quality === "Cardinal" ? "Cardinal signs: negotiate leadership roles" : "Mutable signs: practice decision-making"}`,
        `${Math.abs(yourAge - partnerAge) > 7 ? "Address power imbalances from age difference" : "Navigate life stage transitions together"}`,
      ],
    },
  }
}

export async function analyzeZodiacCompatibility(formData: FormData) {
  try {
    // Extract form data
    const yourBirthDate = formData.get("yourBirthDate") as string
    const partnerBirthDate = formData.get("partnerBirthDate") as string
    const yourGender = formData.get("yourGender") as string
    const partnerGender = formData.get("partnerGender") as string

    if (!yourBirthDate || !partnerBirthDate || !yourGender || !partnerGender) {
      return { error: "Please fill in all fields" }
    }

    // Calculate ages
    const yourAge = new Date().getFullYear() - new Date(yourBirthDate).getFullYear()
    const partnerAge = new Date().getFullYear() - new Date(partnerBirthDate).getFullYear()

    // Get zodiac signs
    const yourZodiac = getZodiacSign(new Date(yourBirthDate))
    const partnerZodiac = getZodiacSign(new Date(partnerBirthDate))

    // Calculate base compatibility
    const baseCompatibilityScore = calculateCompatibility(yourZodiac, partnerZodiac)

    // Generate detailed analysis (using fallback directly for reliability)
    const detailedAnalysis = createFallbackDetailedAnalysis(
      yourZodiac,
      partnerZodiac,
      yourAge,
      partnerAge,
      yourGender,
      partnerGender,
      baseCompatibilityScore,
    )

    return {
      yourZodiac,
      partnerZodiac,
      compatibilityScore: baseCompatibilityScore,
      detailedAnalysis,
    }
  } catch (error) {
    console.error("[v0] Zodiac compatibility error:", error)
    return { error: "Failed to analyze compatibility. Please try again." }
  }
}

function getZodiacSign(date: Date): ZodiacSign {
  const month = date.getMonth() + 1
  const day = date.getDate()

  const zodiacData: Record<string, ZodiacSign> = {
    Aries: {
      sign: "Aries",
      element: "Fire",
      quality: "Cardinal",
      traits: ["Courageous", "Determined", "Confident", "Enthusiastic", "Optimistic"],
      strengths: ["Leadership", "Initiative", "Passion"],
      dateRange: "Mar 21 - Apr 19",
    },
    Taurus: {
      sign: "Taurus",
      element: "Earth",
      quality: "Fixed",
      traits: ["Reliable", "Patient", "Practical", "Devoted", "Responsible"],
      strengths: ["Stability", "Loyalty", "Sensuality"],
      dateRange: "Apr 20 - May 20",
    },
    Gemini: {
      sign: "Gemini",
      element: "Air",
      quality: "Mutable",
      traits: ["Adaptable", "Outgoing", "Intelligent", "Curious", "Witty"],
      strengths: ["Communication", "Versatility", "Social Skills"],
      dateRange: "May 21 - Jun 20",
    },
    Cancer: {
      sign: "Cancer",
      element: "Water",
      quality: "Cardinal",
      traits: ["Intuitive", "Emotional", "Protective", "Sympathetic", "Loyal"],
      strengths: ["Empathy", "Nurturing", "Emotional Intelligence"],
      dateRange: "Jun 21 - Jul 22",
    },
    Leo: {
      sign: "Leo",
      element: "Fire",
      quality: "Fixed",
      traits: ["Creative", "Passionate", "Generous", "Warm-hearted", "Cheerful"],
      strengths: ["Confidence", "Charisma", "Generosity"],
      dateRange: "Jul 23 - Aug 22",
    },
    Virgo: {
      sign: "Virgo",
      element: "Earth",
      quality: "Mutable",
      traits: ["Analytical", "Practical", "Diligent", "Reliable", "Modest"],
      strengths: ["Attention to Detail", "Helpfulness", "Practicality"],
      dateRange: "Aug 23 - Sep 22",
    },
    Libra: {
      sign: "Libra",
      element: "Air",
      quality: "Cardinal",
      traits: ["Diplomatic", "Gracious", "Fair-minded", "Social", "Cooperative"],
      strengths: ["Balance", "Harmony", "Social Grace"],
      dateRange: "Sep 23 - Oct 22",
    },
    Scorpio: {
      sign: "Scorpio",
      element: "Water",
      quality: "Fixed",
      traits: ["Resourceful", "Brave", "Passionate", "Stubborn", "Loyal"],
      strengths: ["Intensity", "Depth", "Transformation"],
      dateRange: "Oct 23 - Nov 21",
    },
    Sagittarius: {
      sign: "Sagittarius",
      element: "Fire",
      quality: "Mutable",
      traits: ["Generous", "Idealistic", "Great sense of humor", "Adventurous"],
      strengths: ["Optimism", "Freedom", "Philosophy"],
      dateRange: "Nov 22 - Dec 21",
    },
    Capricorn: {
      sign: "Capricorn",
      element: "Earth",
      quality: "Cardinal",
      traits: ["Responsible", "Disciplined", "Self-control", "Good managers"],
      strengths: ["Ambition", "Discipline", "Responsibility"],
      dateRange: "Dec 22 - Jan 19",
    },
    Aquarius: {
      sign: "Aquarius",
      element: "Air",
      quality: "Fixed",
      traits: ["Progressive", "Original", "Independent", "Humanitarian"],
      strengths: ["Innovation", "Independence", "Humanitarianism"],
      dateRange: "Jan 20 - Feb 18",
    },
    Pisces: {
      sign: "Pisces",
      element: "Water",
      quality: "Mutable",
      traits: ["Compassionate", "Artistic", "Intuitive", "Gentle", "Wise"],
      strengths: ["Compassion", "Creativity", "Intuition"],
      dateRange: "Feb 19 - Mar 20",
    },
  }

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return zodiacData.Aries
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return zodiacData.Taurus
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return zodiacData.Gemini
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return zodiacData.Cancer
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return zodiacData.Leo
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return zodiacData.Virgo
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return zodiacData.Libra
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return zodiacData.Scorpio
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return zodiacData.Sagittarius
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return zodiacData.Capricorn
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return zodiacData.Aquarius
  return zodiacData.Pisces
}

function calculateCompatibility(sign1: ZodiacSign, sign2: ZodiacSign): number {
  let score = 50 // Base score

  // Same element bonus
  if (sign1.element === sign2.element) {
    score += 25
  }

  // Complementary elements
  if (
    (sign1.element === "Fire" && sign2.element === "Air") ||
    (sign1.element === "Air" && sign2.element === "Fire") ||
    (sign1.element === "Earth" && sign2.element === "Water") ||
    (sign1.element === "Water" && sign2.element === "Earth")
  ) {
    score += 15
  }

  // Same quality consideration
  if (sign1.quality === sign2.quality) {
    score += 10
  }

  // Ensure score is within 0-100 range
  return Math.min(100, Math.max(0, score))
}
