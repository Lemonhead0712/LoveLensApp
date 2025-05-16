import { cn } from "@/lib/utils"

interface LogoSVGProps {
  className?: string
  size?: number
  color?: string
}

export function LogoSVG({ className, size = 40, color = "currentColor" }: LogoSVGProps) {
  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <img src="/LoveLensLogo3D.png" alt="LoveLens Logo" className="w-full h-full object-contain" />
    </div>
  )
}
