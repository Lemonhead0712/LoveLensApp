"use client"

import { useEffect, useRef } from "react"

interface CircularProgressProps {
  value?: number // Make value optional
  size?: number
  strokeWidth?: number
  className?: string
  showValue?: boolean
  valueClassName?: string
  label?: string
  labelClassName?: string
}

export function CircularProgress({
  value = 0, // Provide a default value of 0
  size = 120,
  strokeWidth = 10,
  className = "",
  showValue = true,
  valueClassName = "text-3xl font-bold",
  label,
  labelClassName = "text-sm text-gray-600 mt-2",
}: CircularProgressProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Ensure value is a valid number
  const safeValue = typeof value === "number" && !isNaN(value) ? value : 0

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions with device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr

    // Scale all drawing operations by dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Calculate dimensions
    const centerX = size / 2
    const centerY = size / 2
    const radius = (size - strokeWidth) / 2

    // Draw background circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.strokeStyle = "#e5e7eb" // Light gray
    ctx.lineWidth = strokeWidth
    ctx.stroke()

    // Draw progress arc
    const normalizedValue = Math.min(100, Math.max(0, safeValue)) / 100
    const startAngle = -Math.PI / 2 // Start from top
    const endAngle = startAngle + Math.PI * 2 * normalizedValue

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size)
    gradient.addColorStop(0, "#ec4899") // Pink
    gradient.addColorStop(1, "#8b5cf6") // Purple

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.strokeStyle = gradient
    ctx.lineWidth = strokeWidth
    ctx.lineCap = "round" // Rounded ends
    ctx.stroke()
  }, [safeValue, size, strokeWidth])

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="w-full h-full"
          style={{ width: size, height: size }}
        />
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={valueClassName}>{safeValue.toFixed(1)}%</span>
          </div>
        )}
      </div>
      {label && <p className={labelClassName}>{label}</p>}
    </div>
  )
}
