"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Brain, MessageSquare, TrendingUp, Heart, Lightbulb, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"
import Image from "next/image"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Advanced AI analyzes your conversations for deep insights",
    color: "from-purple-500 to-purple-600",
    bgGradient: "from-purple-50 to-purple-100",
  },
  {
    icon: MessageSquare,
    title: "Communication Patterns",
    description: "Understand how you and your partner communicate",
    color: "from-pink-500 to-pink-600",
    bgGradient: "from-pink-50 to-pink-100",
  },
  {
    icon: TrendingUp,
    title: "Relationship Health",
    description: "Track emotional dynamics and relationship strength",
    color: "from-rose-500 to-rose-600",
    bgGradient: "from-rose-50 to-rose-100",
  },
  {
    icon: Heart,
    title: "Emotional Intelligence",
    description: "Gain insights into emotional expression and empathy",
    color: "from-red-500 to-red-600",
    bgGradient: "from-red-50 to-red-100",
  },
  {
    icon: Lightbulb,
    title: "Actionable Tips",
    description: "Get personalized recommendations to strengthen your connection",
    color: "from-indigo-500 to-indigo-600",
    bgGradient: "from-indigo-50 to-indigo-100",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get comprehensive analysis in seconds",
    color: "from-violet-500 to-violet-600",
    bgGradient: "from-violet-50 to-violet-100",
  },
]

export default function FanDeckFeatures() {
  const prefersReducedMotion = useReducedMotion()

  const animationConfig = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-white via-purple-50/30 to-white overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Logo and Title */}
        <div className="text-center mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.5,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="inline-flex items-center justify-center mb-4 sm:mb-6"
          >
            <Image
              src="/images/love-lens-logo.png"
              alt="Love Lens Logo"
              width={80}
              height={80}
              className="h-16 w-16 sm:h-20 sm:w-20"
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.5,
              delay: 0.1,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4"
          >
            Why Choose{" "}
            <span className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">
              Love Lens
            </span>
            ?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.5,
              delay: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto px-4"
          >
            Powerful features designed to help you understand and improve your relationship
          </motion.p>
        </div>

        {/* Mobile: Grid Layout */}
        <div className="block md:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                <Card className={`h-full bg-gradient-to-br ${feature.bgGradient} border-2 border-white shadow-lg`}>
                  <div className="h-full p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    {/* Decorative background pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-white to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />
                    </div>

                    {/* Icon */}
                    <div className={`mb-4 p-3 bg-gradient-to-br ${feature.color} rounded-2xl shadow-lg relative z-10`}>
                      <feature.icon className="h-8 w-8 text-white" strokeWidth={2} />
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{feature.description}</p>
                    </div>

                    {/* Card number badge */}
                    <div className="absolute top-3 right-3 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md">
                      <span
                        className={`text-xs font-bold text-transparent bg-gradient-to-br ${feature.color} bg-clip-text`}
                      >
                        {index + 1}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Desktop: Fan Deck Layout */}
        <div className="hidden md:block relative h-[500px] lg:h-[600px]">
          <div className="relative w-full max-w-5xl mx-auto h-full flex items-center justify-center">
            {features.map((feature, index) => {
              const totalCards = features.length
              const centerIndex = (totalCards - 1) / 2
              const offset = index - centerIndex
              const rotation = offset * 8
              const translateX = offset * 60
              const translateY = Math.abs(offset) * 20
              const scale = 1 - Math.abs(offset) * 0.05
              const zIndex = totalCards - Math.abs(offset)

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 100, rotate: 0, scale: 0.8 }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                    rotate: rotation,
                    x: translateX,
                    scale: scale,
                  }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{
                    delay: index * 0.08,
                    duration: 0.7,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  whileHover={{
                    scale: 1.1,
                    rotate: 0,
                    y: -30,
                    zIndex: 100,
                    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
                  }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={{
                    zIndex,
                    transformOrigin: "center bottom",
                    willChange: "transform, opacity",
                  }}
                >
                  <Card
                    className={`w-64 lg:w-72 h-80 lg:h-96 bg-gradient-to-br ${feature.bgGradient} border-2 border-white shadow-2xl hover:shadow-3xl transition-shadow duration-300`}
                  >
                    <div className="h-full p-6 lg:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                      {/* Decorative background pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-white to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />
                      </div>

                      {/* Icon */}
                      <div
                        className={`mb-6 p-4 bg-gradient-to-br ${feature.color} rounded-2xl shadow-lg relative z-10`}
                      >
                        <feature.icon className="h-10 w-10 lg:h-12 lg:w-12 text-white" strokeWidth={2} />
                      </div>

                      {/* Content */}
                      <div className="relative z-10">
                        <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                        <p className="text-sm lg:text-base text-gray-700 leading-relaxed">{feature.description}</p>
                      </div>

                      {/* Card number badge */}
                      <div className="absolute top-4 right-4 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md">
                        <span
                          className={`text-sm font-bold text-transparent bg-gradient-to-br ${feature.color} bg-clip-text`}
                        >
                          {index + 1}
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{
            duration: 0.5,
            delay: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="text-center mt-8 sm:mt-12"
        >
          <p className="text-gray-600 text-xs sm:text-sm px-4">
            <span className="hidden md:inline">Hover over each card to explore our features</span>
            <span className="md:hidden">Tap each card to explore our features</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
