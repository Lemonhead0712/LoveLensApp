"use client"

import { motion } from "framer-motion"
import { Upload, Scan, BarChart3 } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Screenshots",
    description: "Upload screenshots of your text conversations with your partner",
  },
  {
    number: "02",
    icon: Scan,
    title: "AI Analysis",
    description: "Our AI analyzes communication patterns, emotions, and relationship dynamics",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Get Insights",
    description: "Receive detailed insights with visual charts and actionable recommendations",
  },
]

export default function StreamlinedHowItWorks() {
  return (
    <section className="py-10 sm:py-12 md:py-16 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6 sm:mb-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 px-2"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4"
          >
            Get relationship insights in three simple steps
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative"
            >
              <div className="text-center px-4">
                <div className="mb-4 sm:mb-6 flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-xl opacity-30" />
                    <div className="relative bg-white rounded-full p-4 sm:p-5 shadow-lg">
                      <step.icon className="h-7 w-7 sm:h-8 sm:w-8 text-purple-600" />
                    </div>
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-purple-200 mb-2">{step.number}</div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-purple-300 to-pink-300 -translate-x-1/2" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
