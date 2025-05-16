import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle } from "lucide-react"

interface GottmanScoreCardProps {
  title: string
  score: number
  description: string
  positive?: boolean
}

export function GottmanScoreCard({ title, score, description, positive = false }: GottmanScoreCardProps) {
  const getScoreColor = () => {
    if (positive) {
      // For positive indicators, higher is better
      if (score >= 70) return "bg-green-500"
      if (score >= 40) return "bg-amber-500"
      return "bg-red-500"
    } else {
      // For negative indicators, lower is better
      if (score <= 30) return "bg-green-500"
      if (score <= 60) return "bg-amber-500"
      return "bg-red-500"
    }
  }

  const getScoreIcon = () => {
    if (positive) {
      return score >= 70 ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ) : (
        <AlertTriangle className="h-5 w-5 text-amber-500" />
      )
    } else {
      return score <= 30 ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ) : (
        <AlertTriangle className="h-5 w-5 text-amber-500" />
      )
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {getScoreIcon()}
            <h4 className="font-medium ml-2">{title}</h4>
          </div>
          <span className="font-medium">{score}%</span>
        </div>
        <Progress value={score} className={`h-2 ${getScoreColor()}`} />
        <p className="text-sm text-gray-600 mt-2">{description}</p>
      </CardContent>
    </Card>
  )
}
