import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertCircle, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface PsychologyReflectionProps {
  analysisResults: any // Replace 'any' with a more specific type if available
}

const PsychologyReflection: React.FC<PsychologyReflectionProps> = ({ analysisResults }) => {
  // Check if we have meaningful data
  const hasLimitedData =
    !analysisResults?.participants ||
    analysisResults.participants.length === 0 ||
    analysisResults.validationWarnings?.some(
      (warning) => warning.includes("OCR extraction failed") || warning.includes("placeholder messages"),
    )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Psychological Analysis</CardTitle>
        <CardDescription>Insights into the psychological dynamics of the conversation.</CardDescription>
      </CardHeader>
      <CardContent>
        {hasLimitedData && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Limited Analysis</AlertTitle>
            <AlertDescription>
              The psychological analysis is limited due to OCR extraction issues. For more accurate insights, try
              uploading clearer screenshots.
            </AlertDescription>
          </Alert>
        )}
        {analysisResults?.summary ? (
          <p className="text-sm text-gray-500">{analysisResults.summary}</p>
        ) : (
          <p className="text-sm text-gray-500">No psychological analysis available.</p>
        )}
      </CardContent>
    </Card>
  )
}

export default PsychologyReflection
