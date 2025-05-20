import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card-override"
import { Badge } from "@/components/ui/badge"
import { InsightFeedback } from "./insight-feedback"

interface GPTEmotionalInsightsProps {
  insights: any
  name: string
  analysisId: string
}

export function GPTEmotionalInsights({ insights, name, analysisId }: GPTEmotionalInsightsProps) {
  if (!insights) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>AI-Powered Emotional Insights</CardTitle>
          <CardDescription>Advanced analysis not available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">GPT-powered emotional analysis could not be generated for {name}.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          AI-Powered Emotional Insights
          <Badge variant="outline" className="ml-2">
            GPT-4
          </Badge>
        </CardTitle>
        <CardDescription>Advanced psychological analysis for {name}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Psychological Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ProfileItem
              label="Attachment Style"
              value={insights.profile.attachmentStyle}
              id={`${name}-attachment`}
              analysisId={analysisId}
            />
            <ProfileItem
              label="Communication Style"
              value={insights.profile.communicationStyle}
              id={`${name}-communication`}
              analysisId={analysisId}
            />
            <ProfileItem
              label="Empathy Level"
              value={insights.profile.empathyLevel}
              id={`${name}-empathy`}
              analysisId={analysisId}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Emotional Intelligence</h3>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Overall Score</span>
              <span className="text-sm font-bold">{insights.emotionalIntelligence.score}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${insights.emotionalIntelligence.score}%` }}
              ></div>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-sm">{insights.emotionalIntelligence.explanation}</p>
            <InsightFeedback insightId={`${name}-ei-explanation`} analysisId={analysisId} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
            <EIComponent label="Self-Awareness" value={insights.emotionalIntelligence.components.selfAwareness} />
            <EIComponent label="Self-Regulation" value={insights.emotionalIntelligence.components.selfRegulation} />
            <EIComponent label="Motivation" value={insights.emotionalIntelligence.components.motivation} />
            <EIComponent label="Empathy" value={insights.emotionalIntelligence.components.empathy} />
            <EIComponent label="Social Skills" value={insights.emotionalIntelligence.components.socialSkills} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Communication Tips</h3>
          <ul className="list-disc pl-5 space-y-3">
            {insights.communicationTips.map((tip: string, index: number) => (
              <li key={index} className="text-sm">
                <div>
                  {tip}
                  <InsightFeedback insightId={`${name}-tip-${index}`} analysisId={analysisId} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

function ProfileItem({
  label,
  value,
  id,
  analysisId,
}: {
  label: string
  value: string
  id: string
  analysisId: string
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-medium">{value}</p>
      <InsightFeedback insightId={id} analysisId={analysisId} />
    </div>
  )
}

function EIComponent({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="relative inline-flex items-center justify-center w-12 h-12 mb-1">
        <svg className="w-12 h-12" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            className="stroke-gray-200 dark:stroke-gray-700"
            strokeWidth="2"
          ></circle>
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            className="stroke-blue-600"
            strokeWidth="2"
            strokeDasharray={`${value} 100`}
            strokeDashoffset="25"
            transform="rotate(-90 18 18)"
          ></circle>
        </svg>
        <span className="absolute text-xs font-medium">{value}</span>
      </div>
      <p className="text-xs">{label}</p>
    </div>
  )
}
