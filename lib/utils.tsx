import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to format the analysis text without regex
export function formatAnalysisText(text: string) {
  const lines = text.split("\n")
  return lines.map((line, index) => {
    if (!line.trim()) return null
    return (
      <p key={index} className="mb-2">
        {line}
      </p>
    )
  })
}

// Helper function to count substring occurrences without regex
export function countSubstring(str: string, substr: string): number {
  let count = 0
  let pos = 0

  while (true) {
    const index = str.indexOf(substr, pos)
    if (index === -1) break
    count++
    pos = index + 1
  }

  return count
}
