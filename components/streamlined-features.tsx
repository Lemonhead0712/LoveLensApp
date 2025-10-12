"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, TrendingUp, Sparkles, ChevronLeft, ChevronRight, BarChart3, ShieldCheck, FileDown } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: Heart,
    title: "Communication Analysis",
    description:
      "Identify communication styles, emotional tones, and interaction patterns that shape your relationship",
    color: "from-purple-100 to-purple-50",
    iconColor: "text-purple-600",
  },
  {
    icon: TrendingUp,
    title: "Pattern Recognition",
    description: "Discover recurring dynamics that may be helping or hindering your connection and emotional intimacy",
    color: "from-pink-100 to-pink-50",
    iconColor: "text-pink-600",
  },
  {
    icon: Sparkles,
    title: "Relationship Frameworks",
    description:
      "Gain insights through established models including attachment theory, love languages, and Gottman principles",
    color: "from-blue-100 to-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: BarChart3,
    title: "Visual Insights",
    description: "See your relationship dynamics visualized through intuitive charts and comparative analyses",
    color: "from-cyan-100 to-cyan-50",
    iconColor: "text-cyan-600",
  },
  {
    icon: ShieldCheck,
    title: "Complete Privacy",
    description: "Your conversations remain private—we analyze patterns without storing or displaying your messages",
    color: "from-green-100 to-green-50",
    iconColor: "text-green-600",
  },
  {
    icon: FileDown,
    title: "Exportable Reports",
    description:
      "Download comprehensive reports to review, share with your partner, or discuss with a relationship coach",
    color: "from-indigo-100 to-indigo-50",
    iconColor: "text-indigo-600",
  },
]

export default function StreamlinedFeatures() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % features.length)
  }

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length)
  }

  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      nextCard()
    }
    if (touchStart - touchEnd < -75) {
      prevCard()
    }
  }

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-b from-purple-50/30 to-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-6 sm:mb-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2"
          >
            Why Choose Love Lens?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 text-xs sm:text-sm max-w-xl mx-auto px-4"
          >
            Powerful features designed to help you understand and improve your relationship
          </motion.p>
        </div>

        <div
          className="relative h-[380px] sm:h-[320px] md:h-[280px] flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative w-full max-w-md mx-auto perspective-1000">
            <AnimatePresence mode="wait">
              {features.map((feature, index) => {
                const offset = (index - currentIndex + features.length) % features.length
                const isActive = offset === 0
                const isPrev = offset === features.length - 1
                const isNext = offset === 1

                return (
                  <motion.div
                    key={index}
                    initial={false}
                    animate={{
                      x: isActive ? 0 : isPrev ? -80 : isNext ? 80 : 0,
                      y: isActive ? 0 : 20,
                      scale: isActive ? 1 : 0.85,
                      opacity: isActive ? 1 : isPrev || isNext ? 0.4 : 0,
                      rotateY: isActive ? 0 : isPrev ? 15 : isNext ? -15 : 0,
                      zIndex: isActive ? 10 : isPrev || isNext ? 5 : 0,
                    }}
                    transition={{
                      duration: 0.4,
                      ease: [0.32, 0.72, 0, 1],
                    }}
                    className="absolute inset-0 flex items-center justify-center px-2"
                    style={{
                      transformStyle: "preserve-3d",
                      pointerEvents: isActive ? "auto" : "none",
                    }}
                  >
                    <Card className="w-full max-w-sm bg-white p-6 sm:p-8 shadow-xl border-gray-100 rounded-2xl">
                      <div className="flex flex-col items-center text-center">
                        <div className={`mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-br ${feature.color} rounded-2xl`}>
                          <feature.icon className={`h-8 w-8 sm:h-10 sm:w-10 ${feature.iconColor}`} />
                        </div>
                        <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">{feature.title}</h3>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.description}</p>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={prevCard}
            className="absolute left-0 sm:left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg rounded-full w-10 h-10 sm:w-12 sm:h-12"
            aria-label="Previous card"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextCard}
            className="absolute right-0 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg rounded-full w-10 h-10 sm:w-12 sm:h-12"
            aria-label="Next card"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>

        <div className="flex justify-center gap-2 sm:gap-2.5 mt-4 sm:mt-6">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 touch-manipulation ${
                index === currentIndex ? "w-6 sm:w-8 bg-purple-600" : "w-2 sm:w-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
