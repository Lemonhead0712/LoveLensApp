"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface SparkleProps {
  color?: string
  size?: number
  style?: React.CSSProperties
}

const generateSparkle = (color: string) => {
  const sparkle = {
    id: String(Math.random()),
    createdAt: Date.now(),
    color,
    size: Math.random() * 10 + 5,
    style: {
      top: Math.random() * 100 + "%",
      left: Math.random() * 100 + "%",
      zIndex: 2,
    },
  }
  return sparkle
}

const Sparkle = ({ color = "#FFC0CB", size = 10, style = {} }: SparkleProps) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      className="absolute pointer-events-none"
      initial={{ scale: 0, rotate: 0, opacity: 0 }}
      animate={{ scale: 1, rotate: 180, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        duration: 0.5,
        ease: "easeInOut",
      }}
    >
      <path
        d="M80 0C80 0 84.2846 41.2925 101.496 58.504C118.707 75.7154 160 80 160 80C160 80 118.707 84.2846 101.496 101.496C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 58.504 101.496C41.2925 84.2846 0 80 0 80C0 80 41.2925 75.7154 58.504 58.504C75.7154 41.2925 80 0 80 0Z"
        fill={color}
      />
    </motion.svg>
  )
}

export function SparkleEffect() {
  const [sparkles, setSparkles] = useState<any[]>([])

  useEffect(() => {
    const generateSparkles = () => {
      const now = Date.now()
      const newSparkle = generateSparkle(
        ["#FFC0CB", "#FFD1DC", "#E6A8D7", "#DDA0DD", "#D8BFD8"][Math.floor(Math.random() * 5)],
      )

      // Remove sparkles older than 1 second and add new one
      setSparkles((currentSparkles) => [
        ...currentSparkles.filter((sparkle) => now - sparkle.createdAt < 1000),
        newSparkle,
      ])
    }

    const interval = setInterval(generateSparkles, 300)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-10">
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <Sparkle key={sparkle.id} color={sparkle.color} size={sparkle.size} style={sparkle.style} />
        ))}
      </AnimatePresence>
    </div>
  )
}
