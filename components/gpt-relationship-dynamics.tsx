import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card-override"
import { Badge } from "@/components/ui/badge"
import { InsightFeedback } from "./insight-feedback"

interface GPTRelationshipDynamicsProps {
  dynamics: any
  analysisId: string
}

export function GPTRelationshipDynamics({ dynamics, analysisId }: GPTRelationshipDynamicsProps) {
  if (!dynamics) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Relationship Dynamics</CardTitle>
          <CardDescription>Advanced analysis not available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">GPT-powered relationship dynamics analysis could not be generated.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Relationship Dynamics
          <Badge variant="outline" className="ml-2">
            GPT-4
          </Badge>
        </CardTitle>
        <CardDescription>AI-powered analysis of your relationship patterns</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Overview</h3>
          <p className="text-sm">{dynamics.overview}</p>
          <InsightFeedback insightId="relationship-overview" analysisId={analysisId} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-md font-semibold mb-2">Strengths</h3>
            <ul className="list-disc pl-5 space-y-2">
              {dynamics.strengths.map((strength: string, index: number) => (
                <li key={index} className="text-sm">
                  <div>
                    {strength}
                    <InsightFeedback insightId={`strength-${index}`} analysisId={analysisId} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-md font-semibold mb-2">Challenges</h3>
            <ul className="list-disc pl-5 space-y-2">
              {dynamics.challenges.map((challenge: string, index: number) => (
                <li key={index} className="text-sm">
                  <div>
                    {challenge}
                    <InsightFeedback insightId={`challenge-${index}`} analysisId={analysisId} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Compatibility Score</h3>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Overall Compatibility</span>
              <span className="text-sm font-bold">{dynamics.compatibilityScore}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-green-600 h-2.5 rounded-full"
                style={{ width: `${dynamics.compatibilityScore}%` }}
              ></div>
            </div>
            <InsightFeedback insightId="compatibility-score" analysisId={analysisId} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
