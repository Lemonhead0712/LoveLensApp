import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface AnalysisLoadingProps {
  status: string
}

export function AnalysisLoading({ status }: AnalysisLoadingProps) {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="flex flex-col items-center justify-center py-12">
        {status === "failed" ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis Failed</h2>
            <p className="text-gray-600 mb-6">
              We encountered an error while analyzing your conversation. Please try again.
            </p>
          </div>
        ) : (
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-rose-500 animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analyzing Your Conversation</h2>
            <p className="text-gray-600 mb-6">
              Our AI is carefully examining the emotional patterns and relationship dynamics. This may take a few
              minutes.
            </p>
            <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2.5">
              <div className="bg-rose-500 h-2.5 rounded-full w-3/4 animate-pulse"></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
