"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, AlertTriangle, CheckCircle2 } from "lucide-react"
import type { AnalysisResults } from "@/lib/types"

interface RelationshipDynamicsReflectionProps {
  analysisResults: AnalysisResults
}

export function RelationshipDynamicsReflection({ analysisResults }: RelationshipDynamicsReflectionProps) {
  if (!analysisResults || !analysisResults.gottmanScores) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No relationship dynamics data available.</p>
        </CardContent>
      </Card>
    )
  }

  const participant1 = analysisResults.participants?.[0] || { name: "Person 1" }
  const participant2 = analysisResults.participants?.[1] || { name: "Person 2" }
  const gottmanScores = analysisResults.gottmanScores || {}
  const relationshipDynamics = analysisResults.relationshipDynamics || {}

  // Extract Gottman scores
  const fourHorsemen = [
    {
      name: "Criticism",
      score: gottmanScores.criticism,
      ideal: "< 20%",
      description: "Attacking your partner's character rather than their behavior",
    },
    {
      name: "Contempt",
      score: gottmanScores.contempt,
      ideal: "< 10%",
      description: "Expressing superiority or disrespect toward your partner",
    },
    {
      name: "Defensiveness",
      score: gottmanScores.defensiveness,
      ideal: "< 30%",
      description: "Defending yourself rather than hearing your partner's perspective",
    },
    {
      name: "Stonewalling",
      score: gottmanScores.stonewalling,
      ideal: "< 20%",
      description: "Withdrawing from interaction as a way to avoid conflict",
    },
  ]

  const positiveInteractions = [
    {
      name: "Emotional Bids",
      score: gottmanScores.emotionalBids,
      ideal: "> 70%",
      description: "Attempts to connect with your partner emotionally",
    },
    {
      name: "Turn Towards",
      score: gottmanScores.turnTowards,
      ideal: "> 80%",
      description: "Responding positively to your partner's emotional bids",
    },
    {
      name: "Repair Attempts",
      score: gottmanScores.repairAttempts,
      ideal: "> 80%",
      description: "Efforts to de-escalate tension during conflict",
    },
    {
      name: "Shared Meaning",
      score: gottmanScores.sharedMeaning,
      ideal: "> 70%",
      description: "Creating a meaningful life together with shared values and goals",
    },
  ]

  // Calculate positive-to-negative ratio with safe defaults
  const positiveToNegativeRatio =
    relationshipDynamics.positiveToNegativeRatio ||
    ((gottmanScores.turnTowards || 50) + (gottmanScores.repairAttempts || 50)) /
      ((gottmanScores.criticism || 20) +
        (gottmanScores.contempt || 20) +
        (gottmanScores.defensiveness || 20) +
        (gottmanScores.stonewalling || 20) +
        0.1)

  // Generate relationship exercises
  const relationshipExercises = [
    {
      id: "rel-1",
      title: "Daily Appreciation Practice",
      description: "Share three specific things you appreciate about your partner each day for one week.",
      category: "Building Positivity",
    },
    {
      id: "rel-2",
      title: "Emotional Bid Awareness",
      description:
        "For three days, notice when your partner makes emotional bids for connection and consciously turn towards them.",
      category: "Connection",
    },
    {
      id: "rel-3",
      title: "Criticism to Complaint Reframing",
      description:
        "Practice reframing criticisms as specific complaints using the format: 'I feel [emotion] when [specific behavior] because [impact]. I need [request].'",
      category: "Communication",
    },
    {
      id: "rel-4",
      title: "Repair Phrase Development",
      description:
        "Together, create 3-5 phrases you can both use to repair conversations when they start to go off track.",
      category: "Conflict Resolution",
    },
    {
      id: "rel-5",
      title: "Shared Dreams Exploration",
      description:
        "Spend 30 minutes discussing your individual and shared dreams for the future. Listen supportively without problem-solving.",
      category: "Shared Meaning",
    },
    {
      id: "rel-6",
      title: "Stress-Reducing Conversation",
      description:
        "Have a 20-minute conversation about external stressors (not relationship issues), with each person taking 10 minutes while the other listens supportively.",
      category: "Support",
    },
  ]

  // Get relationship health description
  const getRelationshipHealthDescription = (ratio: number): string => {
    if (ratio >= 5)
      return "Your relationship shows very healthy dynamics with significantly more positive than negative interactions."
    if (ratio >= 3)
      return "Your relationship shows healthy dynamics with a good balance of positive to negative interactions."
    if (ratio >= 1)
      return "Your relationship shows some positive dynamics but could benefit from reducing negative interactions."
    return "Your relationship currently shows more negative than positive interactions, which is an area for focused improvement."
  }

  const calculatePotentialImprovement = () => {
    // Identify the two worst "four horsemen" scores to improve
    const sortedHorsemen = [...fourHorsemen].sort((a, b) => b.score - a.score)
    const topTwoHorsemen = sortedHorsemen.slice(0, 2)

    // Calculate potential improvement by reducing these scores
    const potentialHorsemenReduction = topTwoHorsemen.reduce((sum, item) => sum + Math.min(30, item.score) / 2, 0)

    // Identify the two worst positive interaction scores to improve
    const sortedPositives = [...positiveInteractions].sort((a, b) => a.score - b.score)
    const bottomTwoPositives = sortedPositives.slice(0, 2)

    // Calculate potential improvement by increasing these scores
    const potentialPositiveIncrease = bottomTwoPositives.reduce(
      (sum, item) => sum + Math.min(30, 100 - item.score) / 2,
      0,
    )

    // Calculate potential new ratio with safe defaults
    const currentNegative =
      ((gottmanScores.criticism || 20) +
        (gottmanScores.contempt || 20) +
        (gottmanScores.defensiveness || 20) +
        (gottmanScores.stonewalling || 20)) /
      4
    const currentPositive =
      ((gottmanScores.turnTowards || 50) +
        (gottmanScores.repairAttempts || 50) +
        (gottmanScores.emotionalBids || 50) +
        (gottmanScores.sharedMeaning || 50)) /
      4

    const potentialNegative = Math.max(5, currentNegative - potentialHorsemenReduction)
    const potentialPositive = Math.min(95, currentPositive + potentialPositiveIncrease)

    const potentialRatio = potentialPositive / potentialNegative

    return {
      current: positiveToNegativeRatio.toFixed(1),
      potential: potentialRatio.toFixed(1),
    }
  }

  const improvement = calculatePotentialImprovement()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2 pt-6 px-6">
          <CardTitle className="text-xl sm:text-2xl">Relationship Dynamics Reflection</CardTitle>
          <CardDescription className="text-base mt-1">
            Understand your relationship patterns and learn how to strengthen your connection
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-4">
          <div className="mb-10">
            <div className="flex flex-col items-center mb-8">
              <h3 className="text-lg font-medium mb-5">Positive-to-Negative Ratio</h3>
              <div className="text-center px-8 py-4 bg-gray-50 rounded-lg mb-3 shadow-sm">
                <span className="text-4xl font-bold">{positiveToNegativeRatio.toFixed(1)}:1</span>
              </div>
              <Badge className="mb-3 px-3 py-1">{getRatioLevel(positiveToNegativeRatio)}</Badge>
              <p className="text-center text-gray-700 max-w-md">
                {getRelationshipHealthDescription(positiveToNegativeRatio)}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-medium mb-4">The Four Horsemen</h3>
                <p className="text-gray-700 mb-5">
                  These negative communication patterns can predict relationship distress. Lower scores are better.
                </p>
                <div className="space-y-5">
                  {fourHorsemen.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <span className="font-medium">{item.name}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            Ideal: {item.ideal}
                          </Badge>
                        </div>
                        <span>{item.score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div
                          className="h-2.5 rounded-full"
                          style={{
                            width: `${item.score}%`,
                            backgroundColor: getInverseScoreColor(item.score),
                          }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Positive Interactions</h3>
                <p className="text-gray-700 mb-5">
                  These positive communication patterns strengthen relationships. Higher scores are better.
                </p>
                <div className="space-y-5">
                  {positiveInteractions.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <span className="font-medium">{item.name}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            Ideal: {item.ideal}
                          </Badge>
                        </div>
                        <span>{item.score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div
                          className="h-2.5 rounded-full"
                          style={{
                            width: `${item.score}%`,
                            backgroundColor: getScoreColor(item.score),
                          }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Card className="mb-8 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Improvement Potential</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Current vs. Potential Ratio</h4>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        <span>Current Ratio</span>
                        <span className="font-medium">{improvement.current}:1</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Potential Ratio</span>
                        <span className="font-medium text-green-600">{improvement.potential}:1</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Focus Areas for Improvement</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-700">
                            Reduce {fourHorsemen.sort((a, b) => b.score - a.score)[0].name}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Currently at {fourHorsemen.sort((a, b) => b.score - a.score)[0].score}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-700">
                            Increase {positiveInteractions.sort((a, b) => a.score - b.score)[0].name}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Currently at {positiveInteractions.sort((a, b) => a.score - b.score)[0].score}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-5">Relationship Improvement Exercises</h3>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {relationshipExercises.map((exercise, index) => (
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

            <div className="p-5 bg-rose-50 rounded-lg border border-rose-100 flex gap-4">
              <Heart className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-rose-800 mb-1">The Magic Ratio</h4>
                <p className="text-sm text-rose-700">
                  Research by Dr. John Gottman shows that stable relationships have at least 5 positive interactions for
                  every negative one. By reducing criticism, contempt, defensiveness, and stonewalling while increasing
                  positive interactions, you can significantly improve your relationship health.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getRatioLevel(ratio: number): string {
  if (ratio >= 5) return "Excellent"
  if (ratio >= 3) return "Good"
  if (ratio >= 1) return "Fair"
  return "Needs Improvement"
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#10b981" // Green
  if (score >= 60) return "#6366f1" // Indigo
  if (score >= 40) return "#f59e0b" // Amber
  return "#ef4444" // Red
}

function getInverseScoreColor(score: number): string {
  if (score <= 20) return "#10b981" // Green
  if (score <= 40) return "#6366f1" // Indigo
  if (score <= 60) return "#f59e0b" // Amber
  return "#ef4444" // Red
}
