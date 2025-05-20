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

function Logo({ size = "medium", withText = true, asLink = true, className = "", showText = true }: LogoProps) {
  // Adjust size based on screen size
  const sizeMap = {
    small: { default: 32, sm: 40 },
    medium: { default: 48, sm: 56 },
    large: { default: 56, sm: 72 },
    xlarge: { default: 64, sm: 80 },
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

  const logoContent = (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative" style={{ width: logoSize, height: logoSize }}>
        <Image
          src="/LoveLensLogo.png"
          alt="LoveLens Logo - Purple camera with pink heart lens"
          width={logoSize}
          height={logoSize}
          className="object-contain"
          priority={true}
        />
      </div>
      {showText && (
        <span className="font-bold text-xl md:text-2xl bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          LoveLens
        </span>
      )}
    </div>
  )

  if (asLink) {
    return (
      <Link href="/" className="flex items-center space-x-2">
        {logoContent}
      </Link>
    )
  }

  return logoContent
}

// Export both as named export and default export for backward compatibility
export { Logo }
export default Logo
