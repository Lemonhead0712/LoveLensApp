import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X } from "lucide-react"

export function ScreenshotGuidelines() {
  return (
    <Card className="bg-white shadow-md border-pink-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Screenshot Guidelines</CardTitle>
        <CardDescription>Follow these tips for best OCR results</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium text-sm flex items-center gap-1">
            <Check className="h-4 w-4 text-green-500" />
            Do's
          </h3>
          <ul className="text-sm space-y-1 pl-6 list-disc text-gray-700">
            <li>Use native resolution screenshots (not screenshots-of-screenshots)</li>
            <li>Include both sides of the conversation</li>
            <li>Make sure text is clear and readable</li>
            <li>Include sender names when possible</li>
            <li>Use screenshots from common chat apps (WhatsApp, iMessage, etc.)</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-sm flex items-center gap-1">
            <X className="h-4 w-4 text-red-500" />
            Don'ts
          </h3>
          <ul className="text-sm space-y-1 pl-6 list-disc text-gray-700">
            <li>Crop off important parts of the conversation</li>
            <li>Use blurry or low-resolution images</li>
            <li>Submit screenshots with overlapping text</li>
            <li>Use screenshots where messages blend together</li>
            <li>Submit screenshots with heavy filters or effects</li>
          </ul>
        </div>

        <div className="pt-2 text-sm text-gray-600">
          <p>
            Our OCR system works best with clear, high-quality screenshots that show a distinct separation between
            messages from different people.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
