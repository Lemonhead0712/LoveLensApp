"use client"

import { motion } from "framer-motion"
import { Brain, MessageSquare, TrendingUp, Heart, Lightbulb, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Advanced AI analyzes your conversations for deep insights",
  },
  {
    icon: MessageSquare,
    title: "Communication Patterns",
    description: "Understand how you and your partner communicate",
  },
  {
    icon: TrendingUp,
    title: "Relationship Health",
    description: "Track emotional dynamics and relationship strength",
  },
  {
    icon: Heart,
    title: "Emotional Intelligence",
    description: "Gain insights into emotional expression and empathy",
  },
  {
    icon: Lightbulb,
    title: "Actionable Tips",
    description: "Get personalized recommendations to strengthen your connection",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get comprehensive analysis in seconds",
  },
]

export default function StreamlinedFeatures() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
          >
            Why Choose Love Lens?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 text-sm max-w-xl mx-auto"
          >
            Powerful features designed to help you understand and improve your relationship
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 h-full hover:shadow-lg transition-shadow duration-300 border-gray-100">
                <div className="flex flex-col items-start">
                  <div className="mb-2 p-2.5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                    <feature.icon className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-xs text-gray-600">{feature.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
