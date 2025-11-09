"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Brain, Lightbulb, ArrowLeft, Download, ChevronRight, Menu, X } from "lucide-react"
import type { AnalysisResults } from "@/types/analysis"
import { CommunicationPatternsSection } from "@/components/sections/communication-patterns-section"
import { RelationshipHealthSection } from "@/components/sections/relationship-health-section"
import { EmotionalIntelligenceSection } from "@/components/sections/emotional-intelligence-section"
import { ActionableTipsSection } from "@/components/sections/actionable-tips-section"
import { exportToWord } from "@/app/actions"

interface AnalysisResultsLayoutProps {
  results: AnalysisResults
}

type Section = "overview" | "communication" | "health" | "emotional" | "tips"

export function AnalysisResultsLayout({ results }: AnalysisResultsLayoutProps) {
  const [currentSection, setCurrentSection] = useState<Section>("overview")
  const [isExporting, setIsExporting] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportToWord(results)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const sections = [
    {
      id: "communication" as Section,
      title: "Communication Patterns",
      icon: MessageCircle,
      description: "How you talk, listen, and connect",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "health" as Section,
      title: "Relationship Health",
      icon: Heart,
      description: "The strength of your bond",
      color: "from-pink-500 to-rose-500",
    },
    {
      id: "emotional" as Section,
      title: "Emotional Intelligence",
      icon: Brain,
      description: "Understanding and managing emotions",
      color: "from-purple-500 to-indigo-500",
    },
    {
      id: "tips" as Section,
      title: "Actionable Tips",
      icon: Lightbulb,
      description: "Practical steps to grow together",
      color: "from-amber-500 to-orange-500",
    },
  ]

  const renderSection = () => {
    switch (currentSection) {
      case "communication":
        return <CommunicationPatternsSection results={results} />
      case "health":
        return <RelationshipHealthSection results={results} />
      case "emotional":
        return <EmotionalIntelligenceSection results={results} />
      case "tips":
        return <ActionableTipsSection results={results} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/30 to-white">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <nav className="container mx-auto px-4">
          {/* Top row: Logo, Names, and Actions */}
          <div className="flex h-16 sm:h-14 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Image
                src="/images/love-lens-logo.png"
                alt="Love Lens"
                width={36}
                height={36}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full flex-shrink-0"
              />
              <div className="min-w-0">
                <span className="text-sm sm:text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent block truncate">
                  {results.subjectALabel} & {results.subjectBLabel}
                </span>
                <span className="text-xs text-muted-foreground hidden sm:block">Relationship Analysis</span>
              </div>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Health Score - Hidden on mobile when not on overview */}
              {currentSection === "overview" && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200">
                  <span className="text-xs font-medium text-gray-600">Score:</span>
                  <span className="text-sm font-bold text-purple-600">{results.overallScore}/100</span>
                </div>
              )}

              {/* Export Button */}
              <Button
                onClick={handleExport}
                disabled={isExporting}
                size="sm"
                className="gap-2 hidden sm:flex bg-transparent"
                variant="outline"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>

              {/* Mobile Menu Toggle */}
              <button
                className="sm:hidden p-2 -mr-2 touch-manipulation"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Health Score Bar - Only on overview, below main header */}
          {currentSection === "overview" && (
            <div className="pb-3 pt-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-gray-600">Overall Health Score</span>
                <span className="text-sm font-bold text-purple-600 sm:hidden">{results.overallScore}/100</span>
              </div>
              <Progress value={results.overallScore} className="h-1.5 sm:h-2" />
            </div>
          )}
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="sm:hidden border-t bg-white"
            >
              <div className="container mx-auto px-4 py-3 space-y-2">
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  size="sm"
                  className="w-full gap-2 bg-transparent"
                  variant="outline"
                >
                  <Download className="h-4 w-4" />
                  Export Analysis
                </Button>
                {currentSection !== "overview" && (
                  <Button
                    onClick={() => {
                      setCurrentSection("overview")
                      setMobileMenuOpen(false)
                    }}
                    size="sm"
                    className="w-full gap-2"
                    variant="ghost"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Overview
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          {currentSection === "overview" ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 sm:space-y-8"
            >
              {/* Opening Thoughts */}
              <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-pink-500" />
                  Welcome to Your Analysis
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-gray-700">{results.openingThoughts}</p>
              </Card>

              {/* Section Cards */}
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                {sections.map((section, index) => {
                  const Icon = section.icon
                  return (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card
                        className="p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-all duration-300 group border-2 hover:border-purple-300 touch-manipulation"
                        onClick={() => setCurrentSection(section.id)}
                      >
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                          <div
                            className={`p-2.5 sm:p-3 rounded-xl bg-gradient-to-br ${section.color} text-white group-hover:scale-110 transition-transform duration-300`}
                          >
                            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors">
                          {section.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">{section.description}</p>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>

              {/* Key Takeaways */}
              <Card className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
                  Key Takeaways
                </h2>
                <div className="space-y-2 sm:space-y-3">
                  {results.keyTakeaways.map((takeaway, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-amber-50 border border-amber-200"
                    >
                      <Badge className="mt-0.5 bg-amber-500 text-xs">{index + 1}</Badge>
                      <p className="text-xs sm:text-sm leading-relaxed">{takeaway}</p>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                variant="ghost"
                onClick={() => setCurrentSection("overview")}
                className="mb-4 sm:mb-6 gap-2 hover:bg-purple-50 touch-manipulation"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Overview
              </Button>
              {renderSection()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
