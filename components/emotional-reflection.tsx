"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-override"
import { BookOpen } from "lucide-react"
import type { EmotionalBreakdown } from "@/lib/types"

interface EmotionalReflectionProps {
  firstPersonName: string
  secondPersonName: string
  firstPersonBreakdown: EmotionalBreakdown
  secondPersonBreakdown: EmotionalBreakdown
}

function EmotionalReflection({
  firstPersonName,
  secondPersonName,
  firstPersonBreakdown,
  secondPersonBreakdown,
}: EmotionalReflectionProps) {
  if (!firstPersonBreakdown || !secondPersonBreakdown) return null

  // Find the biggest difference in emotional traits
  const differences: { trait: keyof EmotionalBreakdown; difference: number; higher: string }[] = []

  Object.keys(firstPersonBreakdown).forEach((key) => {
    const typedKey = key as keyof EmotionalBreakdown
    const firstValue = firstPersonBreakdown[typedKey]
    const secondValue = secondPersonBreakdown[typedKey]

    if (typeof firstValue === "number" && typeof secondValue === "number") {
      const difference = Math.abs(firstValue - secondValue)
      const higher = firstValue > secondValue ? firstPersonName : secondPersonName

      differences.push({
        trait: typedKey,
        difference,
        higher,
      })
    }
  })

  // Sort by biggest difference
  differences.sort((a, b) => b.difference - a.difference)

  // Generate reflection prompts based on the biggest differences
  const reflectionPrompts: string[] = []

  if (differences.length > 0) {
    const biggestDifference = differences[0]
    const traitName = biggestDifference.trait.replace(/([A-Z])/g, " $1").toLowerCase()

    reflectionPrompts.push(
      `${biggestDifference.higher} shows ${biggestDifference.difference}% more ${traitName} in your conversations. How does this dynamic affect your communication?`,
    )

    if (differences.length > 1) {
      const secondDifference = differences[1]
      const secondTraitName = secondDifference.trait.replace(/([A-Z])/g, " $1").toLowerCase()

      reflectionPrompts.push(
        `Consider how ${secondDifference.higher}'s stronger ${secondTraitName} influences your relationship. What patterns do you notice?`,
      )
    }
  }

  // Add a general reflection prompt
  reflectionPrompts.push(
    `What emotional patterns do you notice in your conversations, and how might you both grow from this awareness?`,
  )

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg md:text-xl flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-500" />
          Reflection Prompts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reflectionPrompts.map((prompt, index) => (
            <div key={index} className="p-3 bg-white bg-opacity-60 rounded-md border border-blue-100">
              <p className="text-gray-700">{prompt}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default EmotionalReflection
