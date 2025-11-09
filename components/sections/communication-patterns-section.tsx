"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MessageCircle, CheckCircle2, TrendingUp, ArrowRight, Quote } from "lucide-react"
import type { AnalysisResults } from "@/types/analysis"

interface CommunicationPatternsSectionProps {
  results: AnalysisResults
}

export function CommunicationPatternsSection({ results }: CommunicationPatternsSectionProps) {
  const subjectALabel = results.subjectALabel || "Person A"
  const subjectBLabel = results.subjectBLabel || "Person B"

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <MessageCircle className="h-10 w-10" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Communication Patterns
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Understanding how you and your partner express, listen, and connect through words
        </p>
      </motion.div>

      {/* Overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              Communication Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed">{results.communicationStylesAndEmotionalTone.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {results.communicationStylesAndEmotionalTone.emotionalVibeTags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Person A */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {subjectALabel[0]}
              </div>
              {subjectALabel}'s Communication Style
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <p className="text-base leading-relaxed">{results.communicationPatterns.personA.style}</p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  Strengths
                </h4>
                <ul className="space-y-2">
                  {results.communicationPatterns.personA.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-blue-700">
                  <TrendingUp className="h-5 w-5" />
                  Growth Areas
                </h4>
                <ul className="space-y-2">
                  {results.communicationPatterns.personA.areasForGrowth.map((area, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {results.communicationPatterns.personA.notableQuotes.length > 0 && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Quote className="h-4 w-4" />
                  Notable Observations
                </h4>
                <div className="space-y-2">
                  {results.communicationPatterns.personA.notableQuotes.map((quote, idx) => (
                    <p key={idx} className="text-sm italic text-gray-700">
                      &ldquo;{quote}&rdquo;
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-sm mb-2">Communication Tendencies</h4>
              <p className="text-sm leading-relaxed">{results.communicationPatterns.personA.communicationTendencies}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Person B */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                {subjectBLabel[0]}
              </div>
              {subjectBLabel}'s Communication Style
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <p className="text-base leading-relaxed">{results.communicationPatterns.personB.style}</p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  Strengths
                </h4>
                <ul className="space-y-2">
                  {results.communicationPatterns.personB.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-blue-700">
                  <TrendingUp className="h-5 w-5" />
                  Growth Areas
                </h4>
                <ul className="space-y-2">
                  {results.communicationPatterns.personB.areasForGrowth.map((area, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {results.communicationPatterns.personB.notableQuotes.length > 0 && (
              <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Quote className="h-4 w-4" />
                  Notable Observations
                </h4>
                <div className="space-y-2">
                  {results.communicationPatterns.personB.notableQuotes.map((quote, idx) => (
                    <p key={idx} className="text-sm italic text-gray-700">
                      &ldquo;{quote}&rdquo;
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200">
              <h4 className="font-semibold text-sm mb-2">Communication Tendencies</h4>
              <p className="text-sm leading-relaxed">{results.communicationPatterns.personB.communicationTendencies}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dynamic Between Them */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 via-pink-50 to-cyan-50">
            <CardTitle className="text-2xl flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-blue-600" />
              Your Dynamic Together
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-base leading-relaxed whitespace-pre-line">
              {results.communicationPatterns.dynamicBetweenThem}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Message Rhythm */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle>Message Flow & Rhythm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Pacing & Rhythm</h4>
              <p className="text-sm leading-relaxed">
                {results.communicationStylesAndEmotionalTone.messageRhythmAndPacing}
              </p>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold text-sm mb-2">Regulation Patterns</h4>
              <p className="text-sm leading-relaxed">
                {results.communicationStylesAndEmotionalTone.regulationPatternsObserved}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
