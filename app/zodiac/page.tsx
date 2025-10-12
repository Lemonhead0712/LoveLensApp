"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Heart,
  Sparkles,
  Calendar,
  AlertCircle,
  Lightbulb,
  Star,
  Moon,
  Sun,
  Flame,
  Users,
  Brain,
  Target,
  Zap,
  MessageCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { analyzeZodiacCompatibility } from "./actions"
import CompactHeader from "@/components/compact-header"
import CompactFooter from "@/components/compact-footer"
import { ResponsiveContainer, RadialBarChart, RadialBar } from "recharts"

const COLORS = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"]

export default function ZodiacCompatibilityPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [yourGender, setYourGender] = useState("")
  const [partnerGender, setPartnerGender] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsAnalyzing(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const response = await analyzeZodiacCompatibility(formData)

      if (response && response.error) {
        setError(response.error)
        setResults(null)
      } else if (response) {
        setResults(response)
        setError(null)
      } else {
        setError("Failed to analyze compatibility. Please try again.")
        setResults(null)
      }
    } catch (err) {
      console.error("[v0] Zodiac analysis error:", err)
      setError("An unexpected error occurred. Please try again.")
      setResults(null)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <CompactHeader />
      <div className="bg-gradient-to-b from-purple-50 via-pink-50 to-purple-50 py-6 sm:py-8 md:py-12 lg:py-16 px-3 sm:px-4">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3 sm:space-y-4 md:space-y-6"
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-purple-600 flex-shrink-0" />
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Zodiac Compatibility
              </h1>
              <Moon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-pink-600 flex-shrink-0" />
            </div>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-2">
              Discover the cosmic connection between you and your partner through the ancient wisdom of astrology
            </p>
          </motion.div>

          {!results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6"
            >
              <Card className="border-purple-200 bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg">Deep Personality Insights</h3>
                  <p className="text-sm text-gray-600">
                    Understand your unique traits, passions, and how you complement each other
                  </p>
                </CardContent>
              </Card>

              <Card className="border-pink-200 bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto bg-pink-100 rounded-full flex items-center justify-center">
                    <Flame className="w-6 h-6 text-pink-600" />
                  </div>
                  <h3 className="font-semibold text-lg">Intimacy & Connection</h3>
                  <p className="text-sm text-gray-600">
                    Explore sexual compatibility, love languages, and emotional dynamics
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg">Personalized Guidance</h3>
                  <p className="text-sm text-gray-600">
                    Receive tailored advice for success and areas to nurture in your relationship
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 border-purple-200 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-600 flex-shrink-0" />
                  Enter Your Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                        <Sun className="w-5 h-5" />
                        Your Information
                      </h3>
                      <div className="space-y-2">
                        <Label htmlFor="yourBirthDate" className="text-sm sm:text-base font-medium">
                          Birth Date
                        </Label>
                        <Input
                          type="date"
                          id="yourBirthDate"
                          name="yourBirthDate"
                          required
                          className="w-full text-sm sm:text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="yourGender" className="text-sm sm:text-base font-medium">
                          Gender
                        </Label>
                        <select
                          id="yourGender"
                          name="yourGender"
                          value={yourGender}
                          onChange={(e) => setYourGender(e.target.value)}
                          required
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4 p-4 bg-pink-50 rounded-lg">
                      <h3 className="font-semibold text-pink-900 flex items-center gap-2">
                        <Moon className="w-5 h-5" />
                        Partner's Information
                      </h3>
                      <div className="space-y-2">
                        <Label htmlFor="partnerBirthDate" className="text-sm sm:text-base font-medium">
                          Birth Date
                        </Label>
                        <Input
                          type="date"
                          id="partnerBirthDate"
                          name="partnerBirthDate"
                          required
                          className="w-full text-sm sm:text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="partnerGender" className="text-sm sm:text-base font-medium">
                          Gender
                        </Label>
                        <select
                          id="partnerGender"
                          name="partnerGender"
                          value={partnerGender}
                          onChange={(e) => setPartnerGender(e.target.value)}
                          required
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                      <AlertDescription className="text-red-800 ml-2 text-sm">{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm sm:text-base md:text-lg py-4 sm:py-5 md:py-6 touch-manipulation"
                  >
                    {isAnalyzing ? (
                      <>
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                        Analyzing Cosmic Connection...
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Reveal Compatibility
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <AnimatePresence>
            {results && results.detailedAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4 sm:space-y-6 md:space-y-8"
              >
                {/* Compatibility Score */}
                <Card className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                      <Heart className="w-6 h-6 text-purple-600" />
                      Overall Compatibility Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                      <div className="text-center">
                        <div className="text-6xl sm:text-7xl font-bold text-purple-600 mb-2">
                          {results.compatibilityScore}%
                        </div>
                        <p className="text-sm sm:text-base text-gray-600">
                          {results.compatibilityScore >= 85
                            ? "Excellent Match"
                            : results.compatibilityScore >= 70
                              ? "Good Compatibility"
                              : "Challenging but Possible"}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {results.yourZodiac.sign} ({results.yourGender}) + {results.partnerZodiac.sign} (
                          {results.partnerGender})
                        </p>
                      </div>
                      <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height={200}>
                          <RadialBarChart
                            cx="50%"
                            cy="50%"
                            innerRadius="60%"
                            outerRadius="90%"
                            barSize={20}
                            data={[{ name: "Compatibility", value: results.compatibilityScore, fill: "#8b5cf6" }]}
                            startAngle={180}
                            endAngle={0}
                          >
                            <RadialBar dataKey="value" cornerRadius={10} />
                          </RadialBarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-purple-200 bg-white shadow-xl">
                  <CardContent className="pt-6">
                    <Tabs defaultValue="personality" className="w-full">
                      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-2">
                        <TabsTrigger value="personality" className="text-xs sm:text-sm">
                          <Brain className="w-4 h-4 mr-1" />
                          Personality
                        </TabsTrigger>
                        <TabsTrigger value="intimacy" className="text-xs sm:text-sm">
                          <Flame className="w-4 h-4 mr-1" />
                          Intimacy
                        </TabsTrigger>
                        <TabsTrigger value="passions" className="text-xs sm:text-sm">
                          <Zap className="w-4 h-4 mr-1" />
                          Passions
                        </TabsTrigger>
                        <TabsTrigger value="ambitions" className="text-xs sm:text-sm">
                          <Target className="w-4 h-4 mr-1" />
                          Ambitions
                        </TabsTrigger>
                        <TabsTrigger value="dynamics" className="text-xs sm:text-sm">
                          <Users className="w-4 h-4 mr-1" />
                          Dynamics
                        </TabsTrigger>
                        <TabsTrigger value="advice" className="text-xs sm:text-sm">
                          <Lightbulb className="w-4 h-4 mr-1" />
                          Advice
                        </TabsTrigger>
                      </TabsList>

                      {/* Personality Tab */}
                      <TabsContent value="personality" className="space-y-6 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card className="border-blue-200 bg-blue-50">
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center gap-2">
                                <Sun className="w-5 h-5 text-blue-600" />
                                {results.yourZodiac.sign} ({results.yourGender}, {results.yourAge})
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <p className="text-sm leading-relaxed">
                                {results.detailedAnalysis.personalityInsights.person1}
                              </p>
                              <div>
                                <h4 className="font-semibold text-sm mb-2">Attributes</h4>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="font-medium">Physical:</span>{" "}
                                    {results.detailedAnalysis.attributes.person1.physical}
                                  </div>
                                  <div>
                                    <span className="font-medium">Emotional:</span>{" "}
                                    {results.detailedAnalysis.attributes.person1.emotional}
                                  </div>
                                  <div>
                                    <span className="font-medium">Mental:</span>{" "}
                                    {results.detailedAnalysis.attributes.person1.mental}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="border-pink-200 bg-pink-50">
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center gap-2">
                                <Moon className="w-5 h-5 text-pink-600" />
                                {results.partnerZodiac.sign} ({results.partnerGender}, {results.partnerAge})
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <p className="text-sm leading-relaxed">
                                {results.detailedAnalysis.personalityInsights.person2}
                              </p>
                              <div>
                                <h4 className="font-semibold text-sm mb-2">Attributes</h4>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="font-medium">Physical:</span>{" "}
                                    {results.detailedAnalysis.attributes.person2.physical}
                                  </div>
                                  <div>
                                    <span className="font-medium">Emotional:</span>{" "}
                                    {results.detailedAnalysis.attributes.person2.emotional}
                                  </div>
                                  <div>
                                    <span className="font-medium">Mental:</span>{" "}
                                    {results.detailedAnalysis.attributes.person2.mental}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <Card className="border-purple-200 bg-purple-50">
                          <CardHeader>
                            <CardTitle className="text-lg">Personality Compatibility</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm leading-relaxed">
                              {results.detailedAnalysis.personalityInsights.compatibility}
                            </p>
                          </CardContent>
                        </Card>

                        {/* Age Compatibility */}
                        <Card className="border-green-200 bg-green-50">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-green-600" />
                              Age Compatibility ({results.ageDiff} year difference)
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-sm leading-relaxed">
                              {results.detailedAnalysis.ageCompatibility.analysis}
                            </p>
                            <div className="flex items-center gap-4">
                              <div className="text-3xl font-bold text-green-600">
                                {results.detailedAnalysis.ageCompatibility.score}%
                              </div>
                              <div className="flex-1">
                                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-green-600 rounded-full"
                                    style={{ width: `${results.detailedAnalysis.ageCompatibility.score}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Intimacy Tab */}
                      <TabsContent value="intimacy" className="space-y-6 mt-6">
                        <Card className="border-red-200 bg-red-50">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Flame className="w-5 h-5 text-red-600" />
                              Sexual Compatibility
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="text-4xl font-bold text-red-600">
                                {results.detailedAnalysis.sexualCompatibility.score}%
                              </div>
                              <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
                                    style={{ width: `${results.detailedAnalysis.sexualCompatibility.score}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-semibold text-sm mb-2">Chemistry</h4>
                                <p className="text-sm leading-relaxed">
                                  {results.detailedAnalysis.sexualCompatibility.chemistry}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm mb-2">Intimacy Style</h4>
                                <p className="text-sm leading-relaxed">
                                  {results.detailedAnalysis.sexualCompatibility.intimacyStyle}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-pink-200 bg-pink-50">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Heart className="w-5 h-5 text-pink-600" />
                              Love Languages
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 bg-white rounded-lg">
                                <h4 className="font-semibold text-sm mb-2">
                                  {results.yourZodiac.sign}'s Love Language
                                </h4>
                                <Badge className="mb-2 bg-blue-600">
                                  {results.detailedAnalysis.loveLanguage.person1.primary}
                                </Badge>
                                <p className="text-xs text-gray-600">
                                  {results.detailedAnalysis.loveLanguage.person1.description}
                                </p>
                              </div>
                              <div className="p-4 bg-white rounded-lg">
                                <h4 className="font-semibold text-sm mb-2">
                                  {results.partnerZodiac.sign}'s Love Language
                                </h4>
                                <Badge className="mb-2 bg-pink-600">
                                  {results.detailedAnalysis.loveLanguage.person2.primary}
                                </Badge>
                                <p className="text-xs text-gray-600">
                                  {results.detailedAnalysis.loveLanguage.person2.description}
                                </p>
                              </div>
                            </div>
                            <div className="p-4 bg-white rounded-lg">
                              <h4 className="font-semibold text-sm mb-2">Compatibility</h4>
                              <p className="text-sm leading-relaxed">
                                {results.detailedAnalysis.loveLanguage.compatibility}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Passions Tab */}
                      <TabsContent value="passions" className="space-y-6 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card className="border-orange-200 bg-orange-50">
                            <CardHeader>
                              <CardTitle className="text-lg">Your Passions</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {results.detailedAnalysis.passions.person1.map((passion: string, i: number) => (
                                  <Badge key={i} className="bg-orange-600">
                                    {passion}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="border-orange-200 bg-orange-50">
                            <CardHeader>
                              <CardTitle className="text-lg">Partner's Passions</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {results.detailedAnalysis.passions.person2.map((passion: string, i: number) => (
                                  <Badge key={i} className="bg-orange-600">
                                    {passion}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <Card className="border-green-200 bg-green-50">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Star className="w-5 h-5 text-green-600" />
                              Shared Passions
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {results.detailedAnalysis.passions.shared.map((passion: string, i: number) => (
                                <Badge key={i} className="bg-green-600 text-base px-4 py-2">
                                  {passion}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Ambitions Tab */}
                      <TabsContent value="ambitions" className="space-y-6 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card className="border-blue-200 bg-blue-50">
                            <CardHeader>
                              <CardTitle className="text-lg">Your Ambitions</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm leading-relaxed">{results.detailedAnalysis.ambitions.person1}</p>
                            </CardContent>
                          </Card>

                          <Card className="border-pink-200 bg-pink-50">
                            <CardHeader>
                              <CardTitle className="text-lg">Partner's Ambitions</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm leading-relaxed">{results.detailedAnalysis.ambitions.person2}</p>
                            </CardContent>
                          </Card>
                        </div>

                        <Card className="border-purple-200 bg-purple-50">
                          <CardHeader>
                            <CardTitle className="text-lg">Ambition Alignment</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm leading-relaxed">{results.detailedAnalysis.ambitions.alignment}</p>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Dynamics Tab */}
                      <TabsContent value="dynamics" className="space-y-6 mt-6">
                        <Card className="border-purple-200 bg-purple-50">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Users className="w-5 h-5 text-purple-600" />
                              Gender Dynamics
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm leading-relaxed">
                              {results.detailedAnalysis.relationshipDynamics.genderDynamics}
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="border-blue-200 bg-blue-50">
                          <CardHeader>
                            <CardTitle className="text-lg">Power Balance</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm leading-relaxed">
                              {results.detailedAnalysis.relationshipDynamics.powerBalance}
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="border-orange-200 bg-orange-50">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <MessageCircle className="w-5 h-5 text-orange-600" />
                              Conflict Style
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm leading-relaxed">
                              {results.detailedAnalysis.relationshipDynamics.conflictStyle}
                            </p>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Advice Tab */}
                      <TabsContent value="advice" className="space-y-6 mt-6">
                        <Card className="border-green-200 bg-green-50">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Heart className="w-5 h-5 text-green-600" />
                              Keys to Success
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-3">
                              {results.detailedAnalysis.advice.success.map((item: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <span className="text-green-600 mt-0.5 text-lg">✓</span>
                                  <span className="leading-relaxed">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        <Card className="border-orange-200 bg-orange-50">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <AlertCircle className="w-5 h-5 text-orange-600" />
                              Areas of Awareness
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-3">
                              {results.detailedAnalysis.advice.awareness.map((item: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <span className="text-orange-600 mt-0.5 text-lg">⚠</span>
                                  <span className="leading-relaxed">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <CompactFooter />
    </main>
  )
}
