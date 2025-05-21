import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to format the analysis text
export function formatAnalysisText(text: string) {
  return text.split("\n").map((line, index) => (
    <p key={index} className="mb-2">
      {line}
    </p>
  ))
}

// Helper function to simulate text extraction from images
export function simulateTextExtraction(images: File[]) {
  // In a real app, this would use OCR to extract text from images
  // For demo purposes, we'll return a sample conversation
  return `
    [This would be the extracted text from the uploaded images.
    In a real implementation, we would use OCR to extract the text
    from the images and then send it to GPT-4 for analysis.]
  `
}
