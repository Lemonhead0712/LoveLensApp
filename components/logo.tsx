"use client"

import Link from "next/link"
import Image from "next/image"

interface LogoProps {
  size?: "small" | "medium" | "large" | "xlarge" | number
  withText?: boolean
  asLink?: boolean
  className?: string
  showText?: boolean
}

export function Logo({ size = "medium", withText = true, asLink = true, className = "", showText = true }: LogoProps) {
  // Adjust size based on screen size
  const sizeMap = {
    small: { default: 32, sm: 40 },
    medium: { default: 48, sm: 56 },
    large: { default: 56, sm: 72 },
    xlarge: { default: 64, sm: 80 }, // Added xlarge size
  }

  // Default to medium if size is not in sizeMap
  let logoSize = 56 // Default medium size

  // Handle string sizes
  if (typeof size === "string") {
    // Check if the size exists in sizeMap before accessing properties
    if (sizeMap[size as keyof typeof sizeMap]) {
      logoSize = sizeMap[size as keyof typeof sizeMap].sm
    } else {
      // Default to medium if size string is not recognized
      logoSize = sizeMap.medium.sm
    }
  } else if (typeof size === "number") {
    // Handle numeric sizes directly
    logoSize = size
  }

  if (asLink) {
    return (
      <div className={className}>
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/LoveLensLogo.png"
            alt="LoveLens Logo - Purple camera with pink heart lens"
            width={logoSize}
            height={logoSize}
            className="object-contain"
            priority={size === "large" || size === "xlarge"}
          />
          {showText && (
            <span className="font-bold text-xl md:text-2xl bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              LoveLens
            </span>
          )}
        </Link>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center space-x-2">
        <Image
          src="/LoveLensLogo.png"
          alt="LoveLens Logo - Purple camera with pink heart lens"
          width={logoSize}
          height={logoSize}
          className="object-contain"
          priority={size === "large" || size === "xlarge"}
        />
        {showText && (
          <span className="font-bold text-xl md:text-2xl bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            LoveLens
          </span>
        )}
      </div>
    </div>
  )
}
