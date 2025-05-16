"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Brain } from "lucide-react"
import type { AnalysisResults } from "@/lib/types"

interface PsychologyReflectionProps {
  analysisResults: AnalysisResults
}

export function PsychologyReflection({ analysisResults }: PsychologyReflectionProps) {
  if (!analysisResults || !analysisResults.participants) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No psychological profile data available.</p>
        </CardContent>
      </Card>
    )
  }

  const participant1 = analysisResults.participants[0] || { name: "Person 1" }
  const participant2 = analysisResults.participants[1] || { name: "Person 2" }
  const firstPersonProfile = analysisResults.firstPersonProfile || {}
  const secondPersonProfile = analysisResults.secondPersonProfile || {}

  // Extract attachment styles with stronger fallback handling
  const getAttachmentStyle = (profile: any) => {
    if (!profile || !profile.attachmentStyle) {
      return { primaryStyle: "Secure", secondaryStyle: null, confidence: 70 }
    }
    return profile.attachmentStyle
  }

  // Extract ego states with stronger fallback handling
  const getEgoStates = (profile: any) => {
    if (!profile || !profile.transactionalAnalysis) {
      return {
        dominantEgoState: "Adult",
        egoStateDistribution: { parent: 30, adult: 40, child: 30 },
      }
    }
    return profile.transactionalAnalysis
  }

  const participant1Attachment = getAttachmentStyle(firstPersonProfile)
  const participant2Attachment = getAttachmentStyle(secondPersonProfile)

  // Extract ego states
  const participant1EgoStates = getEgoStates(firstPersonProfile)
  const participant2EgoStates = getEgoStates(secondPersonProfile)

  // Generate attachment style descriptions
  const getAttachmentDescription = (
    style: string,
  ): {
    description: string
    strengths: string[]
    challenges: string[]
    growthAreas: string[]
  } => {
    const styles: Record<
      string,
      {
        description: string
        strengths: string[]
        challenges: string[]
        growthAreas: string[]
      }
    > = {
      Secure: {
        description:
          "You generally feel comfortable with intimacy and independence in relationships. You can trust others and be trusted, and you don't fear abandonment.",
        strengths: [
          "Building healthy interdependence",
          "Communicating needs directly",
          "Maintaining boundaries",
          "Providing consistent support",
        ],
        challenges: [
          "May struggle to understand partners with insecure attachment",
          "Could sometimes take relationship security for granted",
        ],
        growthAreas: [
          "Developing deeper empathy for different attachment needs",
          "Learning to recognize when others need more reassurance",
          "Expanding emotional vocabulary",
        ],
      },
      Anxious: {
        description:
          "You tend to seek high levels of closeness, approval, and responsiveness from your partner. You may become worried about your partner's availability and responsiveness.",
        strengths: [
          "Deep emotional awareness",
          "Strong desire for connection",
          "Attentiveness to relationship dynamics",
          "Loyalty and commitment",
        ],
        challenges: [
          "May seek excessive reassurance",
          "Could sometimes misinterpret neutral signals as negative",
          "Might struggle with giving space",
        ],
        growthAreas: [
          "Developing self-soothing techniques",
          "Building confidence in relationship security",
          "Practicing mindfulness during anxious moments",
          "Learning to communicate needs without criticism",
        ],
      },
      Avoidant: {
        description:
          "You value independence and self-sufficiency, sometimes at the expense of intimacy. You may find it difficult to fully trust or depend on others.",
        strengths: [
          "Self-reliance and independence",
          "Respecting others' boundaries",
          "Logical approach to problems",
          "Ability to function well under stress",
        ],
        challenges: [
          "May withdraw during emotional situations",
          "Could struggle with emotional vulnerability",
          "Might create distance when feeling overwhelmed",
        ],
        growthAreas: [
          "Practicing staying engaged during discomfort",
          "Developing comfort with emotional expression",
          "Learning to recognize and name emotions",
          "Building trust in incremental steps",
        ],
      },
      "Disorganized/Fearful": {
        description:
          "You may both desire and fear closeness, creating an approach-avoidance pattern in relationships. You might struggle with consistent trust.",
        strengths: [
          "Deep emotional sensitivity",
          "Capacity for profound insights",
          "Awareness of relationship complexities",
          "Resilience through challenges",
        ],
        challenges: [
          "May have unpredictable responses to intimacy",
          "Could struggle with consistent trust",
          "Might experience conflicting desires for closeness and distance",
        ],
        growthAreas: [
          "Developing consistent relationship patterns",
          "Building a secure internal foundation",
          "Learning to recognize triggers and patterns",
          "Practicing emotional regulation techniques",
        ],
      },
    }

    // Default for any style not in our database
    const defaultStyle = {
      description: "Your attachment style influences how you form and maintain close relationships.",
      strengths: ["Building connections", "Managing relationship dynamics"],
      challenges: ["Navigating emotional needs", "Balancing closeness and independence"],
      growthAreas: ["Developing relationship awareness", "Building secure attachment patterns"],
    }

    return styles[style] || defaultStyle
  }

  // Generate ego state descriptions
  const getEgoStateDescription = (
    state: string,
  ): {
    description: string
    positiveManifestations: string[]
    negativeManifestations: string[]
    developmentAreas: string[]
  } => {
    const states: Record<
      string,
      {
        description: string
        positiveManifestations: string[]
        negativeManifestations: string[]
        developmentAreas: string[]
      }
    > = {
      Parent: {
        description:
          "The Parent ego state contains attitudes and behaviors incorporated from external sources, primarily parental figures. It includes both nurturing and critical aspects.",
        positiveManifestations: [
          "Providing guidance and structure",
          "Offering care and protection",
          "Setting healthy boundaries",
          "Sharing wisdom from experience",
        ],
        negativeManifestations: [
          "Being overly critical or judgmental",
          "Imposing rigid rules without explanation",
          "Taking control without consent",
          "Using 'always/never' statements",
        ],
        developmentAreas: [
          "Balancing nurturing with allowing autonomy",
          "Expressing guidance without criticism",
          "Offering support without taking over",
          "Developing flexibility in expectations",
        ],
      },
      Adult: {
        description:
          "The Adult ego state is oriented toward objective reality-testing and rational problem-solving. It processes information, estimates probabilities, and makes rational decisions.",
        positiveManifestations: [
          "Analyzing situations objectively",
          "Making decisions based on facts",
          "Mediating between emotional needs and reality",
          "Communicating clearly and directly",
        ],
        negativeManifestations: [
          "Appearing cold or detached",
          "Overlooking emotional aspects of situations",
          "Overanalyzing without action",
          "Dismissing intuition or feelings",
        ],
        developmentAreas: [
          "Integrating emotional awareness with logic",
          "Developing empathetic reasoning",
          "Balancing analysis with action",
          "Communicating complex ideas accessibly",
        ],
      },
      Child: {
        description:
          "The Child ego state contains all the impulses that come naturally to an infant, including natural curiosity, spontaneity, creativity, and pleasure-seeking as well as tantrums, selfishness, and rebellion.",
        positiveManifestations: [
          "Expressing joy and spontaneity",
          "Being creative and playful",
          "Showing authentic emotions",
          "Bringing energy and enthusiasm",
        ],
        negativeManifestations: [
          "Acting impulsively without consideration",
          "Emotional reactivity when triggered",
          "Avoiding responsibility",
          "Seeking immediate gratification",
        ],
        developmentAreas: [
          "Channeling emotional expression constructively",
          "Maintaining playfulness with responsibility",
          "Developing emotional regulation",
          "Balancing spontaneity with consideration",
        ],
      },
    }

    // Default for any state not in our database
    const defaultState = {
      description: "This ego state represents one of the ways you process information and interact with others.",
      positiveManifestations: ["Engaging with others", "Processing experiences"],
      negativeManifestations: ["Potential communication challenges", "Possible relationship friction points"],
      developmentAreas: ["Developing balanced communication", "Building awareness of interaction patterns"],
    }

    return states[state] || defaultState
  }

  // Generate attachment compatibility insights
  const getAttachmentCompatibility = (
    style1: string,
    style2: string,
  ): {
    compatibility: string
    dynamics: string
    challenges: string[]
    recommendations: string[]
  } => {
    // This is a simplified compatibility matrix
    // In a real application, this would be more nuanced and research-based

    const compatibilityMap: Record<
      string,
      Record<
        string,
        {
          compatibility: string
          dynamics: string
          challenges: string[]
          recommendations: string[]
        }
      >
    > = {
      Secure: {
        Secure: {
          compatibility: "High",
          dynamics:
            "Two secure individuals typically form a stable, trusting relationship with healthy interdependence.",
          challenges: [
            "May take relationship for granted at times",
            "Could miss opportunities for growth through conflict",
            "Might need to consciously maintain passion",
          ],
          recommendations: [
            "Schedule regular check-ins to discuss relationship needs",
            "Create intentional challenges to grow together",
            "Explore new experiences to maintain excitement",
          ],
        },
        Anxious: {
          compatibility: "Moderate to High",
          dynamics: "Secure partner provides stability while respecting anxious partner's need for reassurance.",
          challenges: [
            "Secure partner may not understand anxious partner's need for reassurance",
            "Anxious partner might misinterpret secure partner's independence",
            "Different needs for closeness and space",
          ],
          recommendations: [
            "Secure partner: Provide consistent reassurance without judgment",
            "Anxious partner: Practice self-soothing techniques",
            "Together: Establish clear communication about needs for space and closeness",
          ],
        },
        Avoidant: {
          compatibility: "Moderate",
          dynamics: "Secure partner respects avoidant partner's independence while gently encouraging connection.",
          challenges: [
            "Different needs for intimacy and disclosure",
            "Secure partner may feel rejected by avoidant partner's need for space",
            "Avoidant partner might feel pressured even by reasonable requests for closeness",
          ],
          recommendations: [
            "Secure partner: Respect need for space without taking it personally",
            "Avoidant partner: Practice small steps toward vulnerability",
            "Together: Create a balance of together time and alone time",
          ],
        },
        "Disorganized/Fearful": {
          compatibility: "Moderate",
          dynamics: "Secure partner provides consistent support while disorganized partner works on stability.",
          challenges: [
            "Unpredictable responses may confuse secure partner",
            "Disorganized partner may test relationship security",
            "Establishing consistent patterns can be difficult",
          ],
          recommendations: [
            "Secure partner: Maintain consistency and clear boundaries",
            "Disorganized partner: Work with a therapist on attachment healing",
            "Together: Create safety plans for triggering situations",
          ],
        },
      },
      Anxious: {
        Anxious: {
          compatibility: "Low to Moderate",
          dynamics:
            "Two anxious individuals may intensify each other's insecurities, creating a cycle of reassurance-seeking.",
          challenges: [
            "May trigger each other's attachment anxiety",
            "Could create codependent patterns",
            "Might struggle with establishing healthy boundaries",
          ],
          recommendations: [
            "Both partners: Develop individual self-soothing practices",
            "Practice giving reassurance even when seeking it",
            "Consider therapy to build secure attachment skills",
          ],
        },
        Avoidant: {
          compatibility: "Low",
          dynamics:
            "Classic pursuer-distancer dynamic where anxious partner seeks closeness while avoidant partner withdraws.",
          challenges: [
            "Fundamental mismatch in intimacy needs",
            "Can create reinforcing negative cycles",
            "Both partners' core wounds may be triggered",
          ],
          recommendations: [
            "Anxious partner: Work on independence and self-validation",
            "Avoidant partner: Practice staying engaged during discomfort",
            "Together: Create clear agreements about space and connection",
          ],
        },
        "Disorganized/Fearful": {
          compatibility: "Low",
          dynamics: "Unpredictable patterns with intense emotional experiences and confusion about boundaries.",
          challenges: [
            "Highly volatile emotional dynamics",
            "Difficulty establishing consistent patterns",
            "Both partners may trigger each other's insecurities",
          ],
          recommendations: [
            "Both partners: Consider individual therapy for attachment work",
            "Establish very clear communication protocols",
            "Create written agreements for triggering situations",
          ],
        },
      },
      Avoidant: {
        Avoidant: {
          compatibility: "Low to Moderate",
          dynamics: "Two avoidant individuals may maintain comfortable distance but struggle with genuine intimacy.",
          challenges: [
            "May lack emotional depth in relationship",
            "Could avoid addressing important issues",
            "Might struggle during times requiring emotional support",
          ],
          recommendations: [
            "Schedule regular check-ins to discuss feelings",
            "Practice gradual increases in emotional vulnerability",
            "Create rituals that encourage connection",
          ],
        },
        "Disorganized/Fearful": {
          compatibility: "Low",
          dynamics: "Avoidant partner's withdrawal may trigger abandonment fears in disorganized partner.",
          challenges: [
            "Avoidant withdrawal triggers disorganized partner's fears",
            "Disorganized approach-avoidance confuses avoidant partner",
            "Communication about needs may be especially difficult",
          ],
          recommendations: [
            "Avoidant partner: Provide clear communication about need for space",
            "Disorganized partner: Work on consistent communication of needs",
            "Together: Consider relationship therapy for communication tools",
          ],
        },
      },
      "Disorganized/Fearful": {
        "Disorganized/Fearful": {
          compatibility: "Very Low",
          dynamics: "Two disorganized individuals may create chaotic patterns with intense emotional experiences.",
          challenges: [
            "Highly unpredictable relationship dynamics",
            "Difficulty establishing safety and trust",
            "May trigger each other's trauma responses",
          ],
          recommendations: [
            "Both partners: Commit to individual therapy",
            "Establish very clear boundaries and agreements",
            "Consider relationship therapy focused on attachment",
          ],
        },
      },
    }

    // Handle case where styles aren't in our map
    if (!compatibilityMap[style1] || !compatibilityMap[style1][style2]) {
      // Try the reverse combination
      if (compatibilityMap[style2] && compatibilityMap[style2][style1]) {
        return compatibilityMap[style2][style1]
      }

      // Default response if no match found
      return {
        compatibility: "Varies",
        dynamics:
          "Your attachment styles create a unique relationship dynamic that requires understanding and adaptation from both partners.",
        challenges: [
          "Understanding each other's attachment needs",
          "Developing clear communication about closeness and distance",
          "Creating relationship security that works for both of you",
        ],
        recommendations: [
          "Learn about each other's attachment styles through open discussion",
          "Practice expressing needs clearly without criticism",
          "Consider working with a relationship therapist to develop secure attachment",
        ],
      }
    }

    return compatibilityMap[style1][style2]
  }

  // Generate psychological exercises
  const psychologicalExercises = [
    {
      id: "psych-1",
      title: "Attachment Awareness Journal",
      description:
        "Keep a daily journal noting when your attachment style is activated. Record the situation, your feelings, thoughts, and behaviors.",
      category: "Attachment",
    },
    {
      id: "psych-2",
      title: "Ego State Observation",
      description:
        "For one week, notice which ego state (Parent, Adult, Child) you're operating from in different situations. Note patterns and triggers.",
      category: "Transactional Analysis",
    },
    {
      id: "psych-3",
      title: "Secure Base Visualization",
      description:
        "Practice a daily 5-minute visualization of feeling completely secure and supported in your relationship.",
      category: "Attachment",
    },
    {
      id: "psych-4",
      title: "Adult Ego State Practice",
      description:
        "When in conflict, consciously shift to your Adult ego state by focusing on facts, asking open questions, and considering multiple perspectives.",
      category: "Transactional Analysis",
    },
    {
      id: "psych-5",
      title: "Attachment History Exploration",
      description:
        "Share with your partner how your early relationships shaped your current attachment style. Listen to their story without judgment.",
      category: "Attachment",
    },
    {
      id: "psych-6",
      title: "Complementary Transaction Practice",
      description:
        "Practice identifying and creating complementary transactions where stimulus and response come from corresponding ego states.",
      category: "Transactional Analysis",
    },
  ]

  // Get attachment compatibility information
  const attachmentCompatibility = getAttachmentCompatibility(
    participant1Attachment.primaryStyle,
    participant2Attachment.primaryStyle,
  )

  const participant1AttachmentInfo = getAttachmentDescription(participant1Attachment.primaryStyle)
  const participant2AttachmentInfo = getAttachmentDescription(participant2Attachment.primaryStyle)

  const participant1EgoStateInfo = getEgoStateDescription(participant1EgoStates.dominantEgoState)
  const participant2EgoStateInfo = getEgoStateDescription(participant2EgoStates.dominantEgoState)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2 pt-6 px-6">
          <CardTitle className="text-xl sm:text-2xl">Psychological Profile Reflection</CardTitle>
          <CardDescription className="text-base mt-1">
            Understand your psychological patterns and how they influence your relationship
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-4">
          <div className="mb-10">
            <h3 className="text-lg font-medium mb-5">Attachment Styles</h3>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="border-pink-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-pink-500" />
                    <CardTitle className="text-lg">{participant1.name}'s Attachment</CardTitle>
                  </div>
                  <Badge className="mt-2 bg-pink-100 text-pink-800 hover:bg-pink-200 border-pink-200 px-2.5 py-1">
                    {participant1Attachment.primaryStyle}
                    {participant1Attachment.secondaryStyle && ` / ${participant1Attachment.secondaryStyle}`}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-5">{participant1AttachmentInfo.description}</p>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Strengths</h4>
                      <ul className="space-y-2">
                        {participant1AttachmentInfo.strengths.map((strength, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-pink-500 mt-1">•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Challenges</h4>
                      <ul className="space-y-2">
                        {participant1AttachmentInfo.challenges.map((challenge, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-gray-400 mt-1">•</span>
                            <span>{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg">{participant2.name}'s Attachment</CardTitle>
                  </div>
                  <Badge className="mt-2 bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200 px-2.5 py-1">
                    {participant2Attachment.primaryStyle}
                    {participant2Attachment.secondaryStyle && ` / ${participant2Attachment.secondaryStyle}`}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-5">{participant2AttachmentInfo.description}</p>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Strengths</h4>
                      <ul className="space-y-2">
                        {participant2AttachmentInfo.strengths.map((strength, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Challenges</h4>
                      <ul className="space-y-2">
                        {participant2AttachmentInfo.challenges.map((challenge, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-gray-400 mt-1">•</span>
                            <span>{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Attachment Compatibility</CardTitle>
                <Badge className="mt-2 px-2.5 py-1">{attachmentCompatibility.compatibility} Compatibility</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-5">{attachmentCompatibility.dynamics}</p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Potential Challenges</h4>
                    <ul className="space-y-2">
                      {attachmentCompatibility.challenges.map((challenge, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-amber-500 mt-1">•</span>
                          <span>{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Recommendations</h4>
                    <ul className="space-y-2">
                      {attachmentCompatibility.recommendations.map((recommendation, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <h3 className="text-lg font-medium mb-5">Communication Ego States</h3>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="participant1-ego" className="border rounded-lg shadow-sm">
                  <AccordionTrigger className="px-5 py-4 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{participant1.name}'s Dominant Ego State:</span>
                      <Badge variant="outline" className="ml-2 bg-pink-50 text-pink-800 border-pink-200">
                        {participant1EgoStates.dominantEgoState}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-5">
                    <p className="text-gray-700 mb-5">{participant1EgoStateInfo.description}</p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Positive Manifestations</h4>
                        <ul className="space-y-2">
                          {participant1EgoStateInfo.positiveManifestations.map((item, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Potential Challenges</h4>
                        <ul className="space-y-2">
                          {participant1EgoStateInfo.negativeManifestations.map((item, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-amber-500 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Development Areas</h4>
                        <ul className="space-y-2">
                          {participant1EgoStateInfo.developmentAreas.map((item, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="participant2-ego" className="border rounded-lg shadow-sm">
                  <AccordionTrigger className="px-5 py-4 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{participant2.name}'s Dominant Ego State:</span>
                      <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-800 border-blue-200">
                        {participant2EgoStates.dominantEgoState}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-5">
                    <p className="text-gray-700 mb-5">{participant2EgoStateInfo.description}</p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Positive Manifestations</h4>
                        <ul className="space-y-2">
                          {participant2EgoStateInfo.positiveManifestations.map((item, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Potential Challenges</h4>
                        <ul className="space-y-2">
                          {participant2EgoStateInfo.negativeManifestations.map((item, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-amber-500 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Development Areas</h4>
                        <ul className="space-y-2">
                          {participant2EgoStateInfo.developmentAreas.map((item, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-5">Psychological Growth Exercises</h3>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {psychologicalExercises.map((exercise, index) => (
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

            <div className="p-5 bg-purple-50 rounded-lg border border-purple-100 flex gap-4">
              <Brain className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-purple-800 mb-1">Psychological Growth Mindset</h4>
                <p className="text-sm text-purple-700">
                  Understanding your psychological patterns is the first step toward growth. These patterns were formed
                  through life experiences and can be gradually shifted through consistent awareness and practice. Be
                  patient with yourself and your partner as you work on these areas.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
