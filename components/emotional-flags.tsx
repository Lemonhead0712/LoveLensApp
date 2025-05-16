"use client"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertTriangle } from "lucide-react"
import type { EmotionalBreakdown } from "@/lib/types"

interface EmotionalFlagsProps {
  emotionalBreakdown: EmotionalBreakdown
  threshold?: number
  personName: string
}

export function EmotionalFlags({ emotionalBreakdown, threshold = 40, personName }: EmotionalFlagsProps) {
  if (!emotionalBreakdown) return null

  const flagDescriptions: Record<keyof EmotionalBreakdown, string> = {
    empathy: `${personName} shows difficulty understanding or sharing others' feelings.`,
    selfAwareness: `${personName} may struggle to recognize their own emotions and their impact.`,
    socialSkills: `${personName} shows challenges in managing relationships and communication.`,
    emotionalRegulation: `${personName} has difficulty managing emotional responses appropriately.`,
    motivation: `${personName} may lack drive or persistence toward emotional goals.`,
    adaptability: `${personName} shows resistance to changing emotional approaches when needed.`,
  }

  const flags = Object.entries(emotionalBreakdown)
    .filter(([_, value]) => typeof value === "number" && value < threshold)
    .map(([key]) => key as keyof EmotionalBreakdown)

  if (flags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {flags.map((flag) => (
        <TooltipProvider key={flag}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-xs">
                <AlertTriangle className="h-3 w-3" />
                <span className="capitalize">{flag.replace(/([A-Z])/g, " $1").trim()}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p>{flagDescriptions[flag]}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  )
}
