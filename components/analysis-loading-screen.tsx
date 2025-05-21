"use client"

import Image from "next/image"
import { motion } from "framer-motion"

interface AnalysisLoadingScreenProps {
  progress?: number
  message?: string
}

export default function AnalysisLoadingScreen({
  progress,
  message = "Analyzing your conversation...",
}: AnalysisLoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }} // Faster animation
          className="mb-4"
        >
          <div className="relative w-24 h-24 mx-auto">
            <Image
              src="/images/love-lens-logo.png"
              alt="Love Lens Logo"
              width={96}
              height={96}
              className="object-contain"
              priority // Add priority to load the logo image faster
            />
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 border-r-purple-600"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1.5, // Faster rotation
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
                // Use a more efficient animation approach
                type: "tween",
              }}
            />
          </div>
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-xl font-bold text-purple-700 mb-3"
        >
          {message}
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-gray-600 mb-6"
        >
          Our AI is analyzing communication patterns and relationship dynamics. This may take a moment.
        </motion.p>

        {progress !== undefined && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }} // Faster fade in
            className="w-full bg-gray-200 rounded-full h-2.5 mb-2"
          >
            <div
              className="bg-purple-600 h-2.5 rounded-full transition-all duration-150 ease-out" // Faster transition
              style={{ width: `${progress}%` }}
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }} // Faster fade in
          className="flex justify-center space-x-2"
        >
          {["", "", ""].map((_, index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-purple-600 rounded-full"
              animate={{
                scale: [1, 1.3, 1], // Smaller scale change
                opacity: [0.6, 1, 0.6], // Less opacity change
              }}
              transition={{
                duration: 0.8, // Faster animation
                repeat: Number.POSITIVE_INFINITY,
                delay: index * 0.2, // Less delay
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}
