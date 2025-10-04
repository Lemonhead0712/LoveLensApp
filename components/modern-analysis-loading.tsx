"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface ModernAnalysisLoadingProps {
  progress?: number
  message?: string
}

export default function ModernAnalysisLoading({
  progress = 0,
  message = "Analyzing your conversation...",
}: ModernAnalysisLoadingProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gradient-to-br from-purple-50/95 via-white/95 to-pink-50/95 backdrop-blur-md z-50 flex flex-col items-center justify-center"
      >
        <div className="max-w-sm w-full mx-auto p-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-6"
          >
            <div className="relative w-24 h-24 mx-auto">
              <Image
                src="/images/love-lens-logo.png"
                alt="Love Lens Logo"
                width={96}
                height={96}
                className="object-contain"
                priority
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  border: "4px solid transparent",
                  borderTopColor: "#9333ea",
                  borderRightColor: "#ec4899",
                }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {message}
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              Our AI is examining emotional patterns and relationship dynamics.
            </p>
          </motion.div>

          {progress > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-2"
            >
              <div className="flex justify-between text-sm font-medium text-gray-700">
                <span>Processing</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex justify-center space-x-2 mt-6"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600"
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
