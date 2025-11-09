"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Heart, Star, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react"
import type { AnalysisResults } from "@/types/analysis"

interface RelationshipHealthSectionProps {
  results: AnalysisResults
}

export function RelationshipHealthSection({ results }: RelationshipHealthSectionProps) {
  const subjectALabel = results.subjectALabel || "Person A"
  const subjectBLabel = results.subjectBLabel || "Person B"

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white">
            <Heart className="h-10 w-10" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
          Relationship Health
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          The overall strength, resilience, and vitality of your partnership
        </p>
      </motion.div>

      {/* Overall Health Score */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Heart className="h-6 w-6 text-pink-600" />
              Overall Relationship Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold">Health Score</span>
              <span className="text-3xl font-bold text-pink-600">{results.overallScore}/100</span>
            </div>
            <Progress value={results.overallScore} className="h-4" />
            <p className="text-base leading-relaxed mt-4">{results.overallRelationshipHealth.description}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Emotional Dynamics */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Emotional Dynamics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  Positive Indicators
                </h4>
                <ul className="space-y-2">
                  {results.emotionalDynamics.positiveIndicators.map((indicator, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Star className="h-4 w-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                      <span className="text-sm">{indicator}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-orange-700">
                  <AlertCircle className="h-5 w-5" />
                  Areas to Watch
                </h4>
                <ul className="space-y-2">
                  {results.emotionalDynamics.concerningPatterns.map((pattern, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 text-orange-500 flex-shrink-0" />
                      <span className="text-sm">{pattern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-lg mb-3">Emotional Balance</h4>
              <p className="text-base leading-relaxed">{results.emotionalDynamics.emotionalBalance}</p>
            </div>

            {results.emotionalDynamics.emotionalHighlights.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">Key Emotional Moments</h4>
                  <div className="space-y-3">
                    {results.emotionalDynamics.emotionalHighlights.map((highlight, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border ${
                          highlight.tone === "positive"
                            ? "bg-green-50 border-green-200"
                            : highlight.tone === "concerning"
                              ? "bg-orange-50 border-orange-200"
                              : "bg-blue-50 border-blue-200"
                        }`}
                      >
                        <p className="text-sm font-medium mb-1">{highlight.moment}</p>
                        <p className="text-sm text-muted-foreground">{highlight.significance}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Strengths to Celebrate */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-2 border-green-200">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-500" />
              Strengths to Celebrate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {results.strengthsToGelebrate.map((item, idx) => (
              <div key={idx} className="bg-green-50 p-5 rounded-lg border border-green-200">
                <h4 className="font-bold text-lg text-green-900 mb-2">{item.strength}</h4>
                <p className="text-base leading-relaxed text-green-800 mb-3">{item.whyItMatters}</p>
                {item.examples.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-green-900">Examples:</p>
                    <ul className="space-y-1">
                      {item.examples.map((example, exIdx) => (
                        <li key={exIdx} className="text-sm text-green-800 flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Conversation Metrics */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle>Conversation Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium mb-1">Total Messages</p>
                <p className="text-3xl font-bold text-pink-600">{results.conversationMetrics.totalMessages}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-3">Message Balance</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{subjectALabel}</span>
                      <span className="font-semibold">{results.conversationMetrics.messageBalance.personA}%</span>
                    </div>
                    <Progress value={results.conversationMetrics.messageBalance.personA} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{subjectBLabel}</span>
                      <span className="font-semibold">{results.conversationMetrics.messageBalance.personB}%</span>
                    </div>
                    <Progress value={results.conversationMetrics.messageBalance.personB} className="h-2" />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-1">Emotional Tone</p>
                <p className="text-sm text-muted-foreground">{results.conversationMetrics.emotionalTone}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Engagement Level</p>
                <p className="text-sm text-muted-foreground">{results.conversationMetrics.engagementLevel}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Conversation Flow</p>
              <p className="text-sm text-muted-foreground">{results.conversationMetrics.conversationFlow}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Outlook */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-pink-600" />
              Relationship Outlook
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed">{results.outlook}</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
