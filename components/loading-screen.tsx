"use client"

import { useEffect, useState } from "react"
import { Logo } from "./logo"
import { SparkleEffect } from "./sparkle-effect"
import { motion, AnimatePresence } from "framer-motion"

interface LoadingScreenProps {
  message?: string
  showLogo?: boolean
  fullScreen?: boolean
  progressPercent?: number
}

export function LoadingScreen({
  message = "Analyzing emotional intelligence...",
  showLogo = true,
  fullScreen = true,
  progressPercent,
}: LoadingScreenProps) {
  const [dots, setDots] = useState(".")

  // Ensure progressPercent is a valid number
  const safeProgressPercent =
    typeof progressPercent === "number" && !isNaN(progressPercent) ? progressPercent : undefined

  // Animate the dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "."
        return prev + "."
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 ${
          fullScreen ? "fixed inset-0 z-50" : "w-full h-full min-h-[300px]"
        }`}
      >
        <SparkleEffect count={20} />

        {showLogo && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2,
            }}
            className="mb-8"
          >
            <Logo size="large" withText={true} asLink={false} />
          </motion.div>
        )}

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <div className="h-1 w-64 bg-gray-200 rounded-full overflow-hidden">
            {safeProgressPercent !== undefined ? (
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${safeProgressPercent}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"
              />
            ) : (
              <motion.div
                initial={{ width: "0%" }}
                animate={{
                  width: "100%",
                  transition: {
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 1.5,
                    ease: "easeInOut",
                  },
                }}
                className="h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"
              />
            )}
          </div>
        </motion.div>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 text-gray-600 font-medium"
        >
          {message}
          {safeProgressPercent === undefined && dots}
        </motion.p>

        {safeProgressPercent !== undefined && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-sm text-gray-500">
            {safeProgressPercent}% complete
          </motion.p>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
