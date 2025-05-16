"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare } from "lucide-react"
import type { AnalysisResults } from "@/lib/types"

interface CommunicationStyleReflectionProps {
  analysisResults: AnalysisResults
}

export function CommunicationStyleReflection({ analysisResults }: CommunicationStyleReflectionProps) {
  if (!analysisResults || !analysisResults.participants) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No communication style data available.</p>
        </CardContent>
      </Card>
    )
  }

  const participant1 = analysisResults.participants[0] || { name: "Person 1", communicationStyle: "Unknown" }
  const participant2 = analysisResults.participants[1] || { name: "Person 2", communicationStyle: "Unknown" }

  // Extract communication styles from participants with fallbacks
  const participant1Style = participant1.communicationStyle || "Warm & Engaging"
  const participant2Style = participant2.communicationStyle || "Supportive & Empathetic"

  // Generate communication style descriptions
  const getStyleDescription = (style: string): { description: string; strengths: string[]; challenges: string[] } => {
    const styles: Record<string, { description: string; strengths: string[]; challenges: string[] }> = {
      "Warm & Engaging": {
        description:
          "You communicate with enthusiasm and warmth, easily connecting with others and creating an inviting atmosphere.",
        strengths: [
          "Building rapport quickly",
          "Creating a positive atmosphere",
          "Expressing emotions openly",
          "Engaging others in conversation",
        ],
        challenges: [
          "May sometimes dominate conversations",
          "Could occasionally overwhelm quieter communicators",
          "Might need to practice more listening",
        ],
      },
      "Supportive & Empathetic": {
        description:
          "You communicate with sensitivity to others' feelings, offering validation and emotional support in your interactions.",
        strengths: [
          "Making others feel understood",
          "Creating emotional safety",
          "Resolving conflicts gently",
          "Building deep connections",
        ],
        challenges: [
          "May avoid necessary confrontation",
          "Could sometimes prioritize harmony over honesty",
          "Might need to express own needs more directly",
        ],
      },
      "Direct & Concise": {
        description: "You communicate clearly and efficiently, getting to the point without unnecessary elaboration.",
        strengths: [
          "Clarity in expression",
          "Efficiency in communication",
          "Straightforward problem-solving",
          "Avoiding miscommunication",
        ],
        challenges: [
          "May sometimes come across as blunt",
          "Could occasionally miss emotional nuances",
          "Might need to add more warmth to communication",
        ],
      },
      "Analytical & Thoughtful": {
        description: "You communicate with careful consideration, analyzing situations thoroughly before responding.",
        strengths: [
          "Providing well-reasoned perspectives",
          "Thinking before speaking",
          "Offering depth in conversation",
          "Solving complex problems",
        ],
        challenges: [
          "May sometimes overthink responses",
          "Could occasionally seem detached",
          "Might need to express emotions more readily",
        ],
      },
      "Diplomatic & Harmonious": {
        description:
          "You communicate with tact and consideration, striving to maintain harmony and positive relationships.",
        strengths: [
          "Mediating conflicts effectively",
          "Creating win-win solutions",
          "Maintaining positive relationships",
          "Considering multiple perspectives",
        ],
        challenges: [
          "May sometimes avoid difficult truths",
          "Could occasionally be indirect",
          "Might need to be more assertive at times",
        ],
      },
    }

    // Default for any style not in our database
    const defaultStyle = {
      description: "Your communication style shapes how you express yourself and connect with others.",
      strengths: ["Building connections", "Expressing ideas", "Engaging in conversation"],
      challenges: ["Adapting to different communication needs", "Balancing speaking and listening"],
    }

    return styles[style] || defaultStyle
  }

  // Get compatibility insights
  const getCompatibilityInsights = (
    style1: string,
    style2: string,
  ): {
    compatibility: string
    strengths: string[]
    challenges: string[]
    tips: string[]
  } => {
    // This would ideally be a more sophisticated matching system
    // For now, we'll use a simplified approach

    const isComplementary =
      (style1.includes("Warm") && style2.includes("Supportive")) ||
      (style1.includes("Direct") && style2.includes("Analytical")) ||
      (style1.includes("Diplomatic") && style2.includes("Empathetic"))

    const isChallenging =
      (style1.includes("Direct") && style2.includes("Diplomatic")) ||
      (style1.includes("Analytical") && style2.includes("Warm"))

    if (isComplementary) {
      return {
        compatibility: "Complementary",
        strengths: [
          "Your styles naturally balance each other",
          "You can compensate for each other's blind spots",
          "You bring different strengths to conversations",
        ],
        challenges: [
          "You may occasionally misinterpret each other's intentions",
          "Different pacing in communication might cause friction",
        ],
        tips: [
          "Appreciate the different perspective your partner brings",
          "Explicitly acknowledge when you value their communication approach",
          "Ask clarifying questions when you're unsure about their meaning",
        ],
      }
    } else if (isChallenging) {
      return {
        compatibility: "Requires Adaptation",
        strengths: [
          "You can learn valuable skills from each other",
          "Your differences can lead to more comprehensive solutions",
          "You expand each other's communication repertoire",
        ],
        challenges: [
          "You may frequently misunderstand each other's intentions",
          "Different communication values might create tension",
          "You might find the other's style frustrating at times",
        ],
        tips: [
          "Practice mirroring each other's communication style occasionally",
          "Establish communication ground rules that honor both styles",
          "Take turns leading conversations in different contexts",
          "Explicitly state your intentions when communicating",
        ],
      }
    } else {
      return {
        compatibility: "Generally Compatible",
        strengths: [
          "You understand each other's communication approach",
          "You share similar values in how you communicate",
          "Your conversations likely flow naturally",
        ],
        challenges: [
          "You might share the same blind spots",
          "You could benefit from more diversity in communication styles",
          "You may reinforce each other's communication habits",
        ],
        tips: [
          "Consciously practice communication skills outside your comfort zone",
          "Invite feedback from others with different styles",
          "Challenge each other to grow in new communication dimensions",
        ],
      }
    }
  }

  const style1Info = getStyleDescription(participant1Style)
  const style2Info = getStyleDescription(participant2Style)
  const compatibilityInfo = getCompatibilityInsights(participant1Style, participant2Style)

  // Generate improvement exercises
  const communicationExercises = [
    {
      id: "comm-1",
      title: "Style Switching Practice",
      description: `Try communicating in your partner's style (${participant2Style}) for one conversation. Notice how it feels and what you learn.`,
      category: "adaptation",
    },
    {
      id: "comm-2",
      title: "Active Listening Challenge",
      description:
        "Have a 15-minute conversation where you can only ask questions and paraphrase what your partner has said, without adding your own thoughts.",
      category: "listening",
    },
    {
      id: "comm-3",
      title: "Communication Preferences Discussion",
      description:
        "Share with your partner how you prefer to receive feedback, express affection, and resolve conflicts. Listen to their preferences without judgment.",
      category: "understanding",
    },
    {
      id: "comm-4",
      title: "Nonverbal Communication Awareness",
      description:
        "For one day, pay special attention to your nonverbal cues (facial expressions, tone, posture) and how they might affect your message.",
      category: "awareness",
    },
    {
      id: "comm-5",
      title: "Difficult Conversation Framework",
      description:
        "Practice using the XYZ format: 'When you do X in situation Y, I feel Z.' Use this in your next challenging conversation.",
      category: "skills",
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2 pt-6 px-6">
          <CardTitle className="text-xl sm:text-2xl">Communication Style Reflection</CardTitle>
          <CardDescription className="text-base mt-1">
            Understand your communication patterns and learn how to adapt for better connection
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-4">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* First Person Card - Completely personalized */}
            <Card className="border-pink-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-pink-500" />
                  <CardTitle className="text-lg">{participant1.name}'s Communication Profile</CardTitle>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-200 border-pink-200 px-2.5 py-1">
                    {participant1Style}
                  </Badge>
                  {analysisResults.firstPersonProfile?.communicationStyle?.uniqueTraits?.slice(0, 2).map((trait, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                {/* Personalized description based on profile data */}
                <p className="text-gray-700 mb-5">
                  {analysisResults.firstPersonProfile?.personalizedInsights?.communicationSummary ||
                    `${participant1.name} communicates with a ${participant1Style.toLowerCase()} approach, focusing on 
            ${
              participant1Style.includes("Warm")
                ? "connection and emotional expression"
                : participant1Style.includes("Supportive")
                  ? "understanding and validation"
                  : participant1Style.includes("Direct")
                    ? "clarity and efficiency"
                    : participant1Style.includes("Analytical")
                      ? "thoughtfulness and precision"
                      : "balance and harmony"
            }.`}
                </p>

                <div className="space-y-5">
                  {/* Unique linguistic patterns */}
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Linguistic Patterns</h4>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-xs text-gray-500 mb-1">Expressiveness</div>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-pink-500 h-2 rounded-full"
                              style={{
                                width: `${analysisResults.firstPersonProfile?.linguisticPatterns?.emotionalExpressiveness || 65}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">
                            {analysisResults.firstPersonProfile?.linguisticPatterns?.emotionalExpressiveness || 65}%
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-xs text-gray-500 mb-1">Complexity</div>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-pink-500 h-2 rounded-full"
                              style={{
                                width: `${analysisResults.firstPersonProfile?.linguisticPatterns?.cognitiveComplexity || 70}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">
                            {analysisResults.firstPersonProfile?.linguisticPatterns?.cognitiveComplexity || 70}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 italic">
                      {analysisResults.firstPersonProfile?.linguisticPatterns?.sentenceStructure ||
                        `${participant1.name} tends to use ${
                          analysisResults.firstPersonProfile?.linguisticPatterns?.emotionalExpressiveness > 60
                            ? "emotionally rich language with varied expression"
                            : "straightforward language with moderate emotional cues"
                        }.`}
                    </p>
                  </div>

                  {/* Unique communication strengths */}
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Unique Strengths</h4>
                    <ul className="space-y-2">
                      {(
                        analysisResults.firstPersonProfile?.personalizedInsights?.communicationStrengths ||
                        analysisResults.firstPersonProfile?.communicationStrengths || [
                          `Effectively communicates through ${participant1Style.toLowerCase()} approaches`,
                          `Creates ${
                            participant1Style.includes("Warm")
                              ? "engaging"
                              : participant1Style.includes("Supportive")
                                ? "supportive"
                                : participant1Style.includes("Direct")
                                  ? "clear"
                                  : participant1Style.includes("Analytical")
                                    ? "thoughtful"
                                    : "balanced"
                          } conversational dynamics`,
                          `Demonstrates strong ${
                            analysisResults.emotionalBreakdown?.empathy > 70
                              ? "empathy"
                              : analysisResults.emotionalBreakdown?.selfAwareness > 70
                                ? "self-awareness"
                                : analysisResults.emotionalBreakdown?.socialSkills > 70
                                  ? "social skills"
                                  : "communication adaptability"
                          } in interactions`,
                        ]
                      )
                        .slice(0, 4)
                        .map((strength, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-pink-500 mt-1">•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                    </ul>
                  </div>

                  {/* Unique growth areas */}
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Growth Opportunities</h4>
                    <ul className="space-y-2">
                      {(
                        analysisResults.firstPersonProfile?.personalizedInsights?.growthAreas ||
                        analysisResults.firstPersonProfile?.growthAreas || [
                          `Could benefit from more ${
                            participant1Style.includes("Warm")
                              ? "structured listening"
                              : participant1Style.includes("Supportive")
                                ? "direct expression of needs"
                                : participant1Style.includes("Direct")
                                  ? "emotional attunement"
                                  : participant1Style.includes("Analytical")
                                    ? "spontaneous expression"
                                    : "assertive communication"
                          }`,
                          `May need to develop greater awareness of ${
                            analysisResults.gottmanScores?.criticism > 50
                              ? "how criticism affects others"
                              : analysisResults.gottmanScores?.defensiveness > 50
                                ? "defensive reactions"
                                : analysisResults.gottmanScores?.stonewalling > 50
                                  ? "stonewalling behaviors"
                                  : "communication impact"
                          }`,
                          `Could strengthen ${
                            analysisResults.emotionalBreakdown?.empathy < 60
                              ? "empathetic listening"
                              : analysisResults.emotionalBreakdown?.emotionalRegulation < 60
                                ? "emotional regulation"
                                : "adaptive communication strategies"
                          } in challenging situations`,
                        ]
                      )
                        .slice(0, 3)
                        .map((area, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-gray-400 mt-1">•</span>
                            <span>{area}</span>
                          </li>
                        ))}
                    </ul>
                  </div>

                  {/* Personalized recommendations */}
                  <div className="bg-pink-50 p-4 rounded-lg border border-pink-100">
                    <h4 className="font-medium text-sm text-pink-800 mb-2">Personalized Recommendations</h4>
                    <ul className="space-y-2">
                      {[
                        `Practice ${
                          participant1Style.includes("Warm")
                            ? "active listening without interrupting"
                            : participant1Style.includes("Supportive")
                              ? "expressing your needs directly"
                              : participant1Style.includes("Direct")
                                ? "adding emotional context to your messages"
                                : participant1Style.includes("Analytical")
                                  ? "responding more spontaneously"
                                  : "being more assertive"
                        } in your next few conversations.`,
                        `Notice when you feel ${
                          analysisResults.firstPersonProfile?.linguisticPatterns?.dominantEmotions?.[0]?.toLowerCase() ||
                          "reactive"
                        } and take a moment before responding.`,
                        `Experiment with ${
                          participant1Style === participant2Style
                            ? "a different communication approach than your usual style"
                            : `adopting elements of ${participant2.name}'s ${participant2Style.toLowerCase()} style`
                        } when appropriate.`,
                      ].map((rec, i) => (
                        <li key={i} className="text-sm text-pink-700 flex items-start gap-2">
                          <span className="text-pink-500 mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Second Person Card - Completely different structure and insights */}
            <Card className="border-blue-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">{participant2.name}'s Communication Approach</CardTitle>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200 px-2.5 py-1">
                    {participant2Style}
                  </Badge>
                  {analysisResults.secondPersonProfile?.attachmentStyle?.indicators?.slice(0, 1).map((indicator, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {indicator}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                {/* Different structure for second person */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <h4 className="font-medium text-sm">Communication Tendencies</h4>
                  </div>
                  <p className="text-gray-700 text-sm">
                    {analysisResults.secondPersonProfile?.personalizedInsights?.communicationSummary ||
                      `${participant2.name} demonstrates a ${participant2Style.toLowerCase()} communication style characterized by 
              ${
                participant2Style.includes("Warm")
                  ? "enthusiasm and expressiveness"
                  : participant2Style.includes("Supportive")
                    ? "empathy and validation"
                    : participant2Style.includes("Direct")
                      ? "clarity and efficiency"
                      : participant2Style.includes("Analytical")
                        ? "thoughtfulness and precision"
                        : "diplomacy and consideration"
              } in conversations.`}
                  </p>
                </div>

                {/* Transactional Analysis - unique to second person */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <h4 className="font-medium text-sm">Ego State Distribution</h4>
                  </div>

                  <div className="flex items-center gap-1 mb-3">
                    {["Parent", "Adult", "Child"].map((state) => {
                      const percentage =
                        analysisResults.secondPersonProfile?.transactionalAnalysis?.egoStateDistribution?.[
                          state.toLowerCase()
                        ] || 33
                      const isHighest =
                        Math.max(
                          analysisResults.secondPersonProfile?.transactionalAnalysis?.egoStateDistribution?.parent ||
                            33,
                          analysisResults.secondPersonProfile?.transactionalAnalysis?.egoStateDistribution?.adult || 33,
                          analysisResults.secondPersonProfile?.transactionalAnalysis?.egoStateDistribution?.child || 33,
                        ) === percentage

                      return (
                        <div key={state} className="flex-1">
                          <div className="text-xs text-center mb-1">{state}</div>
                          <div className="h-4 bg-blue-100 relative">
                            <div
                              className={`absolute bottom-0 left-0 right-0 ${isHighest ? "bg-blue-500" : "bg-blue-300"}`}
                              style={{ height: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-center mt-1">{percentage}%</div>
                        </div>
                      )
                    })}
                  </div>

                  <p className="text-xs text-gray-600 italic">
                    {`Primarily communicates from a ${analysisResults.secondPersonProfile?.transactionalAnalysis?.dominantEgoState || "Adult"} ego state.`}
                  </p>
                </div>

                {/* Unique communication patterns */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <h4 className="font-medium text-sm">Communication Patterns</h4>
                  </div>

                  <div className="space-y-2">
                    {(
                      analysisResults.secondPersonProfile?.communicationStyle?.preferredApproaches || [
                        `Tends to ${
                          participant2Style.includes("Warm")
                            ? "express emotions openly"
                            : participant2Style.includes("Supportive")
                              ? "validate others' feelings"
                              : participant2Style.includes("Direct")
                                ? "get straight to the point"
                                : participant2Style.includes("Analytical")
                                  ? "analyze before responding"
                                  : "maintain harmony in conversations"
                        }`,
                        `Often ${
                          analysisResults.secondPersonProfile?.linguisticPatterns?.socialEngagement > 70
                            ? "engages actively"
                            : analysisResults.secondPersonProfile?.linguisticPatterns?.psychologicalDistancing > 70
                              ? "maintains emotional distance"
                              : "balances engagement with reflection"
                        } during interactions`,
                        `${
                          analysisResults.secondPersonProfile?.linguisticPatterns?.certaintyLevel > 70
                            ? "Expresses views with confidence"
                            : analysisResults.secondPersonProfile?.linguisticPatterns?.certaintyLevel < 40
                              ? "Shows flexibility in viewpoints"
                              : "Balances certainty with openness to other perspectives"
                        }`,
                      ]
                    )
                      .slice(0, 3)
                      .map((pattern, i) => (
                        <div key={i} className="bg-blue-50 p-3 rounded-md text-sm text-gray-700">
                          {pattern}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Unique strengths - different format from first person */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <h4 className="font-medium text-sm">Key Strengths</h4>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(
                      analysisResults.secondPersonProfile?.personalizedInsights?.communicationStrengths ||
                      analysisResults.secondPersonProfile?.communicationStrengths || [
                        `${
                          participant2Style.includes("Warm")
                            ? "Energetic expression"
                            : participant2Style.includes("Supportive")
                              ? "Emotional attunement"
                              : participant2Style.includes("Direct")
                                ? "Clear messaging"
                                : participant2Style.includes("Analytical")
                                  ? "Thoughtful responses"
                                  : "Diplomatic approach"
                        }`,
                        `${
                          analysisResults.secondPersonEmotionalBreakdown?.empathy > 70
                            ? "Strong empathy"
                            : analysisResults.secondPersonEmotionalBreakdown?.selfAwareness > 70
                              ? "Self-awareness"
                              : analysisResults.secondPersonEmotionalBreakdown?.socialSkills > 70
                                ? "Social intelligence"
                                : "Adaptive communication"
                        }`,
                        `${
                          analysisResults.gottmanScores?.turnTowards > 70
                            ? "Responsive listening"
                            : analysisResults.gottmanScores?.repairAttempts > 70
                              ? "Conflict resolution"
                              : "Effective engagement"
                        }`,
                        "Authentic expression",
                      ]
                    )
                      .slice(0, 4)
                      .map((strength, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {strength}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Unique development areas - different format from first person */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <h4 className="font-medium text-sm">Development Focus</h4>
                  </div>

                  <div className="space-y-2">
                    {(
                      analysisResults.secondPersonProfile?.personalizedInsights?.growthAreas ||
                      analysisResults.secondPersonProfile?.growthAreas || [
                        `Consider ${
                          participant2Style.includes("Warm")
                            ? "creating more space for others"
                            : participant2Style.includes("Supportive")
                              ? "expressing needs more directly"
                              : participant2Style.includes("Direct")
                                ? "adding emotional warmth"
                                : participant2Style.includes("Analytical")
                                  ? "responding more spontaneously"
                                  : "addressing conflicts more directly"
                        }`,
                        `Work on ${
                          analysisResults.gottmanScores?.criticism > 50
                            ? "reducing critical language"
                            : analysisResults.gottmanScores?.defensiveness > 50
                              ? "managing defensive responses"
                              : analysisResults.gottmanScores?.stonewalling > 50
                                ? "staying engaged during difficulty"
                                : "balancing speaking and listening"
                        }`,
                        `Develop greater ${
                          analysisResults.secondPersonEmotionalBreakdown?.emotionalRegulation < 60
                            ? "emotional regulation"
                            : analysisResults.secondPersonEmotionalBreakdown?.empathy < 60
                              ? "empathetic response"
                              : "communication flexibility"
                        }`,
                      ]
                    )
                      .slice(0, 3)
                      .map((area, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <p className="text-sm text-gray-700">{area}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compatibility section - now with unique insights */}
          <Card className="mb-8 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Communication Dynamics</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge
                  className={`px-2.5 py-1 ${
                    compatibilityInfo.compatibility === "Complementary"
                      ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
                      : compatibilityInfo.compatibility === "Requires Adaptation"
                        ? "bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200"
                        : "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200"
                  }`}
                >
                  {compatibilityInfo.compatibility}
                </Badge>

                {analysisResults.relationshipDynamics?.attachmentCompatibility && (
                  <Badge variant="outline">{analysisResults.relationshipDynamics.attachmentCompatibility}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Interaction pattern visualization - unique to this section */}
              <div className="mb-6">
                <h4 className="font-medium text-sm text-gray-700 mb-3">Communication Flow</h4>
                <div className="relative h-20 bg-gray-50 rounded-lg p-3">
                  <div className="absolute left-0 top-0 bottom-0 w-1/2 border-r border-dashed border-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-sm font-medium">{participant1.name}</div>
                      <div className="text-xs text-gray-500">{participant1Style}</div>
                    </div>
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-sm font-medium">{participant2.name}</div>
                      <div className="text-xs text-gray-500">{participant2Style}</div>
                    </div>
                  </div>

                  {/* Dynamic arrows based on communication styles */}
                  <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 400 80"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Different arrow patterns based on styles */}
                    {participant1Style.includes("Direct") && (
                      <path d="M100 40 L300 40" stroke="#6366f1" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    )}
                    {participant1Style.includes("Warm") && (
                      <path
                        d="M100 30 C150 10, 250 10, 300 30"
                        stroke="#ec4899"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                      />
                    )}
                    {participant2Style.includes("Direct") && (
                      <path d="M300 50 L100 50" stroke="#6366f1" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    )}
                    {participant2Style.includes("Supportive") && (
                      <path
                        d="M300 60 C250 80, 150 80, 100 60"
                        stroke="#8b5cf6"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                      />
                    )}
                    {/* Default arrows if no specific style */}
                    {!participant1Style.includes("Direct") && !participant1Style.includes("Warm") && (
                      <path
                        d="M100 35 C150 25, 250 25, 300 35"
                        stroke="#6b7280"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                      />
                    )}
                    {!participant2Style.includes("Direct") && !participant2Style.includes("Supportive") && (
                      <path
                        d="M300 55 C250 65, 150 65, 100 55"
                        stroke="#6b7280"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                      />
                    )}
                    <defs>
                      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                      </marker>
                    </defs>
                  </svg>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Interaction Strengths</h4>
                  <ul className="space-y-2">
                    {/* Unique compatibility strengths based on specific styles */}
                    {(
                      analysisResults.relationshipDynamics?.keyStrengths || [
                        `${
                          participant1Style.includes("Warm") && participant2Style.includes("Supportive")
                            ? "Emotional expressiveness balanced with validation"
                            : participant1Style.includes("Direct") && participant2Style.includes("Analytical")
                              ? "Clear communication paired with thoughtful responses"
                              : "Complementary communication approaches"
                        }`,
                        `${
                          analysisResults.gottmanScores?.turnTowards > 60
                            ? "Strong emotional responsiveness to each other's needs"
                            : analysisResults.gottmanScores?.repairAttempts > 60
                              ? "Effective conflict recovery patterns"
                              : "Balanced give-and-take in conversations"
                        }`,
                        `${
                          analysisResults.gottmanScores?.sharedMeaning > 60
                            ? "Shared understanding of important concepts"
                            : "Potential for growth through different perspectives"
                        }`,
                      ]
                    ).map((strength, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Growth Opportunities</h4>
                  <ul className="space-y-2">
                    {/* Unique compatibility challenges based on specific styles */}
                    {(
                      analysisResults.relationshipDynamics?.keyGrowthAreas || [
                        `${
                          participant1Style === participant2Style
                            ? "Diversify communication approaches to avoid blind spots"
                            : participant1Style.includes("Direct") && participant2Style.includes("Supportive")
                              ? "Balance directness with emotional sensitivity"
                              : participant1Style.includes("Analytical") && participant2Style.includes("Warm")
                                ? "Bridge analytical and emotional communication styles"
                                : "Develop greater understanding of each other's communication needs"
                        }`,
                        `${
                          analysisResults.gottmanScores?.criticism > 50 ||
                          analysisResults.gottmanScores?.defensiveness > 50
                            ? "Work on reducing criticism-defensiveness cycles"
                            : analysisResults.gottmanScores?.stonewalling > 50
                              ? "Maintain engagement during difficult conversations"
                              : "Enhance mutual understanding during disagreements"
                        }`,
                        `${
                          analysisResults.gottmanScores?.emotionalBids < 50 ||
                          analysisResults.gottmanScores?.turnTowards < 50
                            ? "Increase recognition and response to emotional bids"
                            : "Develop more varied ways of connecting"
                        }`,
                      ]
                    ).map((challenge, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-amber-500 mt-1">•</span>
                        <span>{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personalized exercises section */}
          <div>
            <h3 className="text-lg font-medium mb-5">Personalized Communication Exercises</h3>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {/* Generate completely unique exercises for each pair */}
              {[
                {
                  id: "ex-1",
                  title: `${
                    participant1Style.includes("Direct") || participant2Style.includes("Direct")
                      ? "Softening Startups Practice"
                      : participant1Style.includes("Supportive") || participant2Style.includes("Supportive")
                        ? "Assertiveness Training"
                        : "Communication Style Switching"
                  }`,
                  description: `${
                    participant1Style.includes("Direct") || participant2Style.includes("Direct")
                      ? `Practice starting difficult conversations with "I" statements and expressing needs without criticism.`
                      : participant1Style.includes("Supportive") || participant2Style.includes("Supportive")
                        ? `Practice expressing needs directly while maintaining connection. Focus on being clear about your wants.`
                        : `Take turns adopting each other's communication style for a full conversation. Reflect on what you learn.`
                  }`,
                  category: "practice",
                },
                {
                  id: "ex-2",
                  title: `${
                    analysisResults.gottmanScores?.emotionalBids < 60 || analysisResults.gottmanScores?.turnTowards < 60
                      ? "Emotional Bid Recognition"
                      : "Active Listening Challenge"
                  }`,
                  description: `${
                    analysisResults.gottmanScores?.emotionalBids < 60 || analysisResults.gottmanScores?.turnTowards < 60
                      ? `For one day, explicitly notice and respond to each other's bids for connection, whether big or small.`
                      : `Have a conversation where the listener can only ask questions and paraphrase what they've heard.`
                  }`,
                  category: "awareness",
                },
                {
                  id: "ex-3",
                  title: `${
                    analysisResults.gottmanScores?.criticism > 50 || analysisResults.gottmanScores?.defensiveness > 50
                      ? "Criticism-Free Week"
                      : "Communication Preferences Discussion"
                  }`,
                  description: `${
                    analysisResults.gottmanScores?.criticism > 50 || analysisResults.gottmanScores?.defensiveness > 50
                      ? `Challenge yourselves to go one week without criticism. Replace critical statements with specific requests.`
                      : `Discuss how each of you prefers to receive feedback, express affection, and resolve conflicts.`
                  }`,
                  category: participant1Style === participant2Style ? "growth" : "understanding",
                },
                {
                  id: "ex-4",
                  title: `${
                    participant1Style.includes("Analytical") || participant2Style.includes("Analytical")
                      ? "Emotion-Focused Exchange"
                      : participant1Style.includes("Warm") || participant2Style.includes("Warm")
                        ? "Structured Discussion Format"
                        : "Nonverbal Communication Awareness"
                  }`,
                  description: `${
                    participant1Style.includes("Analytical") || participant2Style.includes("Analytical")
                      ? `Practice conversations focused on feelings rather than facts. Use "I feel..." statements frequently.`
                      : participant1Style.includes("Warm") || participant2Style.includes("Warm")
                        ? `Try a structured discussion where each person gets equal time to speak without interruption.`
                        : `Pay attention to your nonverbal cues (facial expressions, tone, posture) and discuss their impact.`
                  }`,
                  category: "skills",
                },
              ].map((exercise, index) => (
                <Card key={index} className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-5">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{exercise.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {exercise.category}
                        </Badge>
                      </div>
                      <p className="text-gray-700 text-sm">{exercise.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Personalized communication tips based on specific styles */}
            <div className="p-5 bg-purple-50 rounded-lg border border-purple-100">
              <h4 className="font-medium text-purple-800 mb-2">Tailored Communication Tips</h4>
              <ul className="space-y-2">
                {[
                  `For ${participant1.name}: ${
                    participant1Style.includes("Warm")
                      ? "Create space for quieter voices by pausing after asking questions"
                      : participant1Style.includes("Supportive")
                        ? "Practice stating your needs directly, even when it feels uncomfortable"
                        : participant1Style.includes("Direct")
                          ? "Add a brief emotional check-in before addressing practical matters"
                          : participant1Style.includes("Analytical")
                            ? "Share your initial thoughts before they're fully processed sometimes"
                            : "Balance harmony-seeking with authentic expression of differences"
                  }`,
                  `For ${participant2.name}: ${
                    participant2Style.includes("Warm")
                      ? "Notice when others might need processing time before responding"
                      : participant2Style.includes("Supportive")
                        ? "Set boundaries around when you can provide emotional support"
                        : participant2Style.includes("Direct")
                          ? "Add context and check for understanding when being direct"
                          : participant2Style.includes("Analytical")
                            ? "Signal when you need processing time in conversations"
                            : "Address conflicts directly when they arise rather than smoothing them over"
                  }`,
                  `Together: ${
                    participant1Style === participant2Style
                      ? "Consciously seek outside perspectives to avoid shared blind spots"
                      : participant1Style.includes("Direct") && participant2Style.includes("Supportive")
                        ? "Establish code words to signal when directness feels too harsh or when issues need direct addressing"
                        : participant1Style.includes("Analytical") && participant2Style.includes("Warm")
                          ? "Create space for both emotional expression and analytical discussion"
                          : "Appreciate how your different styles can complement each other when understood"
                  }`,
                ].map((tip, i) => (
                  <li key={i} className="text-sm text-purple-700 flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
