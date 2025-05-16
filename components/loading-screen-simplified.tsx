import { CircularProgress } from "./circular-progress"

interface LoadingScreenProps {
  progress?: number // Make progress optional
  message?: string
}

export function LoadingScreen({ progress = 0, message = "Loading..." }: LoadingScreenProps) {
  // Ensure progress is a valid number
  const safeProgress = typeof progress === "number" && !isNaN(progress) ? progress : 0

  // Determine the stage based on progress
  let stage = "Preparing"
  if (safeProgress > 10 && safeProgress <= 70) {
    stage = "Extracting Text"
  } else if (safeProgress > 70 && safeProgress <= 90) {
    stage = "Analyzing"
  } else if (safeProgress > 90) {
    stage = "Finalizing"
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      <CircularProgress value={safeProgress} size={120} strokeWidth={10} />
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">{stage}</h3>
        <p className="text-gray-600">{message}</p>
        <p className="text-sm text-gray-500 mt-2">
          {safeProgress < 100 ? "Please wait while we process your conversation..." : "Complete!"}
        </p>
      </div>
    </div>
  )
}
