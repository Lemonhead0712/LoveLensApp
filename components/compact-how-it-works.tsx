import { Card } from "@/components/ui/card"
import { Upload, Cpu, FileText, BarChart2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const steps = [
  {
    icon: <Upload className="h-6 w-6 text-white" />,
    title: "Upload Screenshots",
    description: "Simply upload screenshots of your text conversations from any messaging platform.",
  },
  {
    icon: <Cpu className="h-6 w-6 text-white" />,
    title: "AI Analysis",
    description: "Our advanced AI analyzes communication patterns, emotional tones, and relationship dynamics.",
  },
  {
    icon: <BarChart2 className="h-6 w-6 text-white" />,
    title: "Visual Insights",
    description: "Review clear visualizations of your relationship dynamics and growth opportunities.",
  },
  {
    icon: <FileText className="h-6 w-6 text-white" />,
    title: "Comprehensive Report",
    description: "Get a detailed report with actionable insights you can download and reference anytime.",
  },
]

export default function CompactHowItWorks() {
  return (
    <div id="how-it-works" className="bg-purple-50 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">How Love Lens Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A simple four-step process that transforms your conversations into meaningful relationship insights.
          </p>
        </div>

        {/* Mobile view: Tabs */}
        <div className="md:hidden">
          <Tabs defaultValue="step1" className="w-full">
            <TabsList className="grid grid-cols-4 h-auto p-1">
              {steps.map((step, index) => (
                <TabsTrigger
                  key={index}
                  value={`step${index + 1}`}
                  className="py-2 px-1 text-xs data-[state=active]:bg-purple-100 whitespace-normal text-center"
                >
                  {step.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {steps.map((step, index) => (
              <TabsContent key={index} value={`step${index + 1}`} className="mt-4">
                <Card className="border-purple-100 bg-white p-5 shadow-sm">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 shadow-lg">
                      {step.icon}
                      <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-purple-600 shadow">
                        {index + 1}
                      </div>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Desktop view: Grid */}
        <div className="hidden md:grid md:grid-cols-4 gap-4">
          {steps.map((step, index) => (
            <Card key={index} className="border-purple-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 shadow-lg">
                  {step.icon}
                  <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-purple-600 shadow">
                    {index + 1}
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
