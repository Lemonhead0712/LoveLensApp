"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Lightbulb, Target, TrendingUp, ArrowRight, Calendar, CheckCircle2 } from "lucide-react"
import type { AnalysisResults } from "@/types/analysis"

interface ActionableTipsSectionProps {
  results: AnalysisResults
}

export function ActionableTipsSection({ results }: ActionableTipsSectionProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-amber-500"
      case "low":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
            <Lightbulb className="h-10 w-10" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          Actionable Tips
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Practical, evidence-based strategies to strengthen your relationship
        </p>
      </motion.div>

      {/* Recommendations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Target className="h-6 w-6 text-amber-600" />
              Priority Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {results.recommendations.map((rec, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="bg-white p-5 rounded-lg border-2 border-amber-200"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h4 className="font-bold text-lg">{rec.title}</h4>
                  <Badge className={getPriorityColor(rec.priority)}>{rec.priority} priority</Badge>
                </div>
                <p className="text-base leading-relaxed mb-4">{rec.description}</p>
                <div className="bg-amber-50 p-3 rounded-lg">
                  <p className="text-sm">
                    <span className="font-semibold">Expected Outcome: </span>
                    {rec.expectedOutcome}
                  </p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Growth Opportunities */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Growth Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {results.growthOpportunities.map((opportunity, idx) => (
              <div key={idx} className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-bold text-lg">{opportunity.area}</h4>
                  <Badge className={getPriorityColor(opportunity.priority)}>{opportunity.priority} priority</Badge>
                </div>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm">
                      <span className="font-semibold">Current Pattern: </span>
                      {opportunity.currentPattern}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm">
                      <span className="font-semibold">Why It Matters: </span>
                      {opportunity.whyItMatters}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2">Suggestions:</p>
                    <ul className="space-y-2">
                      {opportunity.suggestions.map((suggestion, sugIdx) => (
                        <li key={sugIdx} className="text-sm flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {idx < results.growthOpportunities.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Clinical Exercises */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-2 border-green-200">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="text-2xl flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              Practical Exercises
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Communication Exercises */}
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Communication Exercises
              </h3>
              <div className="space-y-4">
                {results.professionalInsights.clinicalExercises.communicationExercises.map((exercise, idx) => (
                  <div key={idx} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold">{exercise.title}</h4>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {exercise.frequency}
                      </Badge>
                    </div>
                    <p className="text-sm leading-relaxed">{exercise.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Emotional Regulation Practices */}
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Emotional Regulation Practices
              </h3>
              <div className="space-y-4">
                {results.professionalInsights.clinicalExercises.emotionalRegulationPractices.map((practice, idx) => (
                  <div key={idx} className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold">{practice.title}</h4>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {practice.frequency}
                      </Badge>
                    </div>
                    <p className="text-sm leading-relaxed">{practice.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Relationship Rituals */}
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-pink-600" />
                Relationship Rituals
              </h3>
              <div className="space-y-4">
                {results.professionalInsights.clinicalExercises.relationshipRituals.map((ritual, idx) => (
                  <div key={idx} className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold">{ritual.title}</h4>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {ritual.frequency}
                      </Badge>
                    </div>
                    <p className="text-sm leading-relaxed">{ritual.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Therapeutic Recommendations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Professional Support Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Immediate Interventions</h4>
              <ul className="space-y-2">
                {results.professionalInsights.therapeuticRecommendations.immediateInterventions.map((item, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">Long-Term Goals</h4>
              <ul className="space-y-2">
                {results.professionalInsights.therapeuticRecommendations.longTermGoals.map((goal, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">Suggested Therapeutic Approaches</h4>
              <div className="flex flex-wrap gap-2">
                {results.professionalInsights.therapeuticRecommendations.suggestedModalities.map((modality, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-purple-100 text-purple-700">
                    {modality}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">External Resources</h4>
              <ul className="space-y-2">
                {results.professionalInsights.differentialConsiderations.externalResourcesNeeded.map(
                  (resource, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
                      <span>{resource}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Closing Thoughts */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-600" />
              Final Thoughts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed">{results.closingThoughts}</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
