import { cn } from "@/lib/utils"
import Image from "next/image"

interface LogoSVGProps {
  className?: string
  size?: number
  color?: string
}

function LogoSVG({ className, size = 40 }: LogoSVGProps) {
  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <Image
        src="/LoveLensLogo.png"
        alt="LoveLens Logo - Purple camera with pink heart lens"
        width={size}
        height={size}
        className="object-contain"
        priority={true}
      />
    </div>
  )
}

export default LogoSVG
