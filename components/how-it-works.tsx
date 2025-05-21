import { Card } from "@/components/ui/card"
import { Upload, Cpu, FileText, BarChart2 } from "lucide-react"

const steps = [
  {
    icon: <Upload className="h-8 w-8 text-white" />,
    title: "Upload Conversation Screenshots",
    description: "Simply upload screenshots of your text conversations. We support images from any messaging platform.",
  },
  {
    icon: <Cpu className="h-8 w-8 text-white" />,
    title: "AI Analysis",
    description: "Our advanced AI analyzes communication patterns, emotional tones, and relationship dynamics.",
  },
  {
    icon: <BarChart2 className="h-8 w-8 text-white" />,
    title: "Visual Insights",
    description: "Review clear visualizations of your relationship dynamics, strengths, and growth opportunities.",
  },
  {
    icon: <FileText className="h-8 w-8 text-white" />,
    title: "Comprehensive Report",
    description: "Get a detailed report with actionable insights you can download and reference anytime.",
  },
]

export default function HowItWorks() {
  return (
    <div id="how-it-works" className="bg-rose-50 py-16">
      <div className="container mx-auto px-4">
        <Card className="border-rose-200 bg-white p-8 shadow-md">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">How Love Lens Works</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              A simple four-step process that transforms your conversations into meaningful relationship insights.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <Card key={index} className="border-rose-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex flex-col items-center text-center">
                  <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-600 shadow-lg">
                    {step.icon}
                    <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-rose-600 shadow">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
