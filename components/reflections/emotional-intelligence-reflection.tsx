"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"
import type { AnalysisResults, EmotionalBreakdown } from "@/lib/types"

interface EmotionalIntelligenceReflectionProps {
  analysisResults: AnalysisResults
}

export function EmotionalIntelligenceReflection({ analysisResults }: EmotionalIntelligenceReflectionProps) {
  if (!analysisResults || !analysisResults.emotionalBreakdown) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No emotional intelligence data available.</p>
        </CardContent>
      </Card>
    )
  }

  const participant1 = analysisResults.participants?.[0] || { name: "Person 1" }
  const participant2 = analysisResults.participants?.[1] || { name: "Person 2" }
  const emotionalBreakdown = analysisResults.emotionalBreakdown || {}
  const secondPersonEmotionalBreakdown = analysisResults.secondPersonEmotionalBreakdown || {}
  // Find the lowest EI components for each person
  const getLowestComponents = (breakdown: EmotionalBreakdown, count = 2) => {
    const components = [
      { name: "Empathy", value: breakdown?.empathy ?? 50, key: "empathy" },
      { name: "Self-Awareness", value: breakdown?.selfAwareness ?? 50, key: "selfAwareness" },
      { name: "Social Skills", value: breakdown?.socialSkills ?? 50, key: "socialSkills" },
      { name: "Emotional Regulation", value: breakdown?.emotionalRegulation ?? 50, key: "emotionalRegulation" },
      { name: "Motivation", value: breakdown?.motivation ?? 50, key: "motivation" },
      { name: "Adaptability", value: breakdown?.adaptability ?? 50, key: "adaptability" },
    ]

    return components.sort((a, b) => a.value - b.value).slice(0, count)
  }

  const participant1LowestComponents = getLowestComponents(emotionalBreakdown)
  const participant2LowestComponents = secondPersonEmotionalBreakdown
    ? getLowestComponents(secondPersonEmotionalBreakdown)
    : []

  // Generate improvement exercises based on the lowest components
  const generateExercises = (component: string) => {
    const exercises: Record<string, { title: string; description: string; id: string }[]> = {
      empathy: [
        {
          id: "empathy-1",
          title: "Active Listening Practice",
          description:
            "Practice active listening by fully focusing on your partner, avoiding interruptions, and summarizing what they've said to ensure understanding.",
        },
        {
          id: "empathy-2",
          title: "Perspective-Taking Exercise",
          description:
            "When disagreeing, take a moment to imagine the situation from your partner's perspective before responding.",
        },
        {
          id: "empathy-3",
          title: "Emotion Recognition",
          description:
            "Practice identifying emotions in others by observing facial expressions, tone of voice, and body language.",
        },
      ],
      selfAwareness: [
        {
          id: "self-awareness-1",
          title: "Emotion Journaling",
          description:
            "Keep a daily journal of your emotions, noting triggers and your responses to build awareness of your emotional patterns.",
        },
        {
          id: "self-awareness-2",
          title: "Feedback Reflection",
          description:
            "Ask for specific feedback from your partner about how your communication affects them, and reflect on it without defensiveness.",
        },
        {
          id: "self-awareness-3",
          title: "Mindfulness Practice",
          description:
            "Practice 5 minutes of mindfulness daily, focusing on your present thoughts and feelings without judgment.",
        },
      ],
      socialSkills: [
        {
          id: "social-skills-1",
          title: "Conflict Resolution Practice",
          description:
            "Practice using 'I' statements instead of 'you' statements during disagreements to express feelings without blame.",
        },
        {
          id: "social-skills-2",
          title: "Appreciation Expression",
          description:
            "Share three specific appreciations with your partner daily, focusing on actions rather than general traits.",
        },
        {
          id: "social-skills-3",
          title: "Non-Verbal Communication",
          description: "Practice maintaining appropriate eye contact and open body language during conversations.",
        },
      ],
      emotionalRegulation: [
        {
          id: "emotional-regulation-1",
          title: "Pause Practice",
          description: "When feeling emotionally triggered, practice taking a 10-second pause before responding.",
        },
        {
          id: "emotional-regulation-2",
          title: "Stress Response Techniques",
          description:
            "Learn and practice deep breathing or progressive muscle relaxation to use during stressful conversations.",
        },
        {
          id: "emotional-regulation-3",
          title: "Emotion Naming",
          description:
            "Practice naming your emotions specifically (beyond just 'good' or 'bad') to increase your emotional vocabulary.",
        },
      ],
      motivation: [
        {
          id: "motivation-1",
          title: "Relationship Vision",
          description:
            "Create a shared vision for your relationship, identifying specific goals and the emotions you want to cultivate together.",
        },
        {
          id: "motivation-2",
          title: "Growth Mindset Practice",
          description:
            "When facing relationship challenges, practice reframing them as opportunities for growth rather than failures.",
        },
        {
          id: "motivation-3",
          title: "Celebration Ritual",
          description: "Establish a ritual to celebrate small wins and progress in your relationship.",
        },
      ],
      adaptability: [
        {
          id: "adaptability-1",
          title: "Flexibility Exercise",
          description:
            "Practice accepting changes to plans without frustration, focusing on the opportunity rather than the disruption.",
        },
        {
          id: "adaptability-2",
          title: "Comfort Zone Expansion",
          description:
            "Try one new activity or approach to communication each week that feels slightly outside your comfort zone.",
        },
        {
          id: "adaptability-3",
          title: "Perspective Shifting",
          description: "When stuck in a pattern, brainstorm three alternative approaches to the situation.",
        },
      ],
    }

    return exercises[component] || []
  }

  // Calculate potential improvement
  const calculatePotentialImprovement = () => {
    const currentAverage =
      ((emotionalBreakdown?.empathy ?? 50) +
        (emotionalBreakdown?.selfAwareness ?? 50) +
        (emotionalBreakdown?.socialSkills ?? 50) +
        (emotionalBreakdown?.emotionalRegulation ?? 50) +
        (emotionalBreakdown?.motivation ?? 50) +
        (emotionalBreakdown?.adaptability ?? 50)) /
      6

    // Estimate potential improvement (10-15 points on lowest areas)
    const potentialImprovement = Math.min(
      95, // Cap at 95%
      currentAverage + participant1LowestComponents.reduce((sum, comp) => sum + Math.min(15, 95 - comp.value), 0) / 6,
    )

    return {
      current: Math.round(currentAverage),
      potential: Math.round(potentialImprovement),
    }
  }

  const improvement = calculatePotentialImprovement()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2 pt-6 px-6">
          <CardTitle className="text-xl sm:text-2xl">Emotional Intelligence Reflection</CardTitle>
          <CardDescription className="text-base mt-1">
            Understand your emotional intelligence profile and discover targeted exercises to improve
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-4">
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Your Emotional Intelligence Profile</h3>
            <p className="text-gray-700 mb-6">
              Based on your conversation analysis, we've identified areas where you can focus to improve your emotional
              intelligence.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="font-medium mb-4">{participant1.name}'s EI Improvement Potential</h4>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Current EI Score</span>
                      <span className="font-medium">{improvement.current}%</span>
                    </div>
                    <Progress value={improvement.current} className="h-2.5" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Potential Score with Improvement</span>
                      <span className="font-medium">{improvement.potential}%</span>
                    </div>
                    <Progress
                      value={improvement.potential}
                      className="h-2.5 bg-gray-100"
                      style={{ "--progress-background": "rgb(168, 85, 247)" } as React.CSSProperties}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-4">Focus Areas for Improvement</h4>
                <div className="space-y-3">
                  {participant1LowestComponents.map((component, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg border border-pink-100"
                    >
                      <Badge variant="outline" className="bg-pink-100 text-pink-700 border-pink-200 px-2.5 py-1">
                        {component.name}
                      </Badge>
                      <span className="text-sm text-gray-700">
                        {component.value}% - Potential for significant improvement
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-5">Personalized Improvement Exercises</h3>

            <Accordion type="single" collapsible className="space-y-4">
              {participant1LowestComponents.map((component, index) => (
                <AccordionItem key={index} value={component.key} className="border rounded-lg p-1.5">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{component.name}</span>
                      <Badge variant="outline" className="ml-2 bg-gray-50">
                        Current: {component.value}%
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-5 pt-2">
                    <p className="text-gray-700 mb-5">{getComponentDescription(component.key)}</p>

                    <div className="space-y-4 mt-5">
                      {generateExercises(component.key).map((exercise, i) => (
                        <Card key={i} className="border bg-gray-50">
                          <CardContent className="p-4 sm:p-5">
                            <div>
                              <h4 className="font-medium mb-2">{exercise.title}</h4>
                              <p className="text-gray-700 text-sm">{exercise.description}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-8 p-5 bg-blue-50 rounded-lg border border-blue-100 flex gap-4">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-700 mb-1">Practice Consistently</h4>
                <p className="text-sm text-blue-600">
                  Emotional intelligence improves with consistent practice. Try to incorporate these exercises into your
                  daily routine for at least 3 weeks to see meaningful improvement.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getComponentDescription(component: string): string {
  const descriptions: Record<string, string> = {
    empathy:
      "Empathy is the ability to understand and share the feelings of another person. Improving empathy helps you connect more deeply with your partner and respond appropriately to their emotional needs.",
    selfAwareness:
      "Self-awareness is understanding your own emotions, strengths, weaknesses, and values. Greater self-awareness allows you to communicate your needs more effectively and recognize how your behavior affects others.",
    socialSkills:
      "Social skills encompass effective communication, conflict resolution, and relationship management. Enhancing these skills helps create more positive and productive interactions.",
    emotionalRegulation:
      "Emotional regulation is the ability to manage and respond to emotional experiences in a healthy way. Improving this area helps you stay calm during conflicts and respond rather than react.",
    motivation:
      "Motivation in emotional intelligence refers to your drive to improve yourself and your relationships. Strengthening motivation helps you persist through challenges and maintain a growth mindset.",
    adaptability:
      "Adaptability is the capacity to adjust to new conditions and be flexible in your thinking. Enhancing adaptability helps you navigate relationship changes and find creative solutions to problems.",
  }

  return (
    descriptions[component] ||
    "This component of emotional intelligence affects how you interact with others and manage your own emotions."
  )
}
