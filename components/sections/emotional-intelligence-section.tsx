"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Brain, Heart, Shield, Lightbulb, ArrowRight } from "lucide-react"
import type { AnalysisResults } from "@/types/analysis"

interface EmotionalIntelligenceSectionProps {
  results: AnalysisResults
}

export function EmotionalIntelligenceSection({ results }: EmotionalIntelligenceSectionProps) {
  const subjectALabel = results.subjectALabel || "Person A"
  const subjectBLabel = results.subjectBLabel || "Person B"

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
            <Brain className="h-10 w-10" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Emotional Intelligence
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          How you understand, express, and manage emotions individually and together
        </p>
      </motion.div>

      {/* Attachment Theory Analysis */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Heart className="h-6 w-6 text-purple-600" />
              Attachment Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Person A Attachment */}
            <div className="bg-white p-5 rounded-lg border border-purple-200">
              <h4 className="font-bold text-lg mb-3 text-purple-900">{subjectALabel}</h4>
              <Badge className="mb-3 bg-purple-600">
                {results.professionalInsights.attachmentTheoryAnalysis.subjectA.primaryAttachmentStyle}
              </Badge>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold mb-2">Attachment Behaviors:</p>
                  <ul className="space-y-1">
                    {results.professionalInsights.attachmentTheoryAnalysis.subjectA.attachmentBehaviors.map(
                      (behavior, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-purple-500" />
                          <span>{behavior}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <p className="text-sm">
                    <span className="font-semibold">Triggers & Defenses: </span>
                    {results.professionalInsights.attachmentTheoryAnalysis.subjectA.triggersAndDefenses}
                  </p>
                </div>
              </div>
            </div>

            {/* Person B Attachment */}
            <div className="bg-white p-5 rounded-lg border border-indigo-200">
              <h4 className="font-bold text-lg mb-3 text-indigo-900">{subjectBLabel}</h4>
              <Badge className="mb-3 bg-indigo-600">
                {results.professionalInsights.attachmentTheoryAnalysis.subjectB.primaryAttachmentStyle}
              </Badge>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold mb-2">Attachment Behaviors:</p>
                  <ul className="space-y-1">
                    {results.professionalInsights.attachmentTheoryAnalysis.subjectB.attachmentBehaviors.map(
                      (behavior, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-indigo-500" />
                          <span>{behavior}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
                <div className="bg-indigo-50 p-3 rounded">
                  <p className="text-sm">
                    <span className="font-semibold">Triggers & Defenses: </span>
                    {results.professionalInsights.attachmentTheoryAnalysis.subjectB.triggersAndDefenses}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Your Dynamic Together</h4>
              <p className="text-sm leading-relaxed">{results.professionalInsights.attachmentTheoryAnalysis.dyad}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reflective Frameworks */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Psychological Frameworks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-base leading-relaxed">{results.reflectiveFrameworks.description}</p>

            <Separator />

            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-purple-600" />
                  Attachment Energies
                </h4>
                <p className="text-sm leading-relaxed">{results.reflectiveFrameworks.attachmentEnergies}</p>
              </div>

              <div className="bg-pink-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-600" />
                  Love Language Dynamics
                </h4>
                <p className="text-sm leading-relaxed">{results.reflectiveFrameworks.loveLanguageFriction}</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  Conflict Patterns (Gottman Method)
                </h4>
                <p className="text-sm leading-relaxed">{results.reflectiveFrameworks.gottmanConflictMarkers}</p>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-indigo-600" />
                  Emotional Intelligence Indicators
                </h4>
                <p className="text-sm leading-relaxed">
                  {results.reflectiveFrameworks.emotionalIntelligenceIndicators}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Deeper Insights */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Deeper Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {results.deeperInsights.map((insight, idx) => (
              <div key={idx} className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-bold text-lg">{insight.title}</h4>
                  <Badge variant="outline">{insight.category}</Badge>
                </div>
                <p className="text-base leading-relaxed mb-3">{insight.observation}</p>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm">
                    <span className="font-semibold">Impact: </span>
                    {insight.impact}
                  </p>
                </div>
                {idx < results.deeperInsights.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Trauma-Informed Observations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Safety & Trust Dynamics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div>
              <h4 className="font-semibold mb-2">Identified Patterns</h4>
              <ul className="space-y-2">
                {results.professionalInsights.traumaInformedObservations.identifiedPatterns.map((pattern, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-purple-500" />
                    <span>{pattern}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">Coping Mechanisms</h4>
              <p className="text-sm leading-relaxed">
                {results.professionalInsights.traumaInformedObservations.copingMechanisms}
              </p>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">Safety & Trust</h4>
              <p className="text-sm leading-relaxed">
                {results.professionalInsights.traumaInformedObservations.safetyAndTrust}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
