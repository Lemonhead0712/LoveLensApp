import Link from "next/link"
import Image from "next/image"

interface LogoProps {
  size?: "small" | "medium" | "large"
  withText?: boolean
  asLink?: boolean
  showText?: boolean
}

export function Logo({
  size = "medium",
  withText = false,
  asLink = true,
  showText = withText, // For backward compatibility
}: LogoProps) {
  const dimensions = {
    small: { width: 40, height: 40 },
    medium: { width: 60, height: 60 },
    large: { width: 100, height: 100 },
  }

  const { width, height } = dimensions[size]

  const logoContent = (
    <div className="flex items-center gap-3">
      <div className="relative" style={{ width, height }}>
        <Image
          src="/LoveLensLogo3D.png"
          alt="LoveLens Logo"
          width={width}
          height={height}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className="font-bold text-xl md:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
          LoveLens
        </span>
      )}
    </div>
  )

  if (asLink) {
    return (
      <Link href="/" className="inline-flex">
        {logoContent}
      </Link>
    )
  }

  return logoContent
}
