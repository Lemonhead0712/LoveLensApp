import { Card } from "@/components/ui/card"
import { MessageSquare, BarChart3, Repeat, Brain, ShieldCheck, FileDown } from "lucide-react"

const features = [
  {
    icon: <MessageSquare className="h-6 w-6 text-purple-600" />,
    title: "Communication Analysis",
    description: "Identify communication styles, emotional tones, and interaction patterns.",
  },
  {
    icon: <Repeat className="h-6 w-6 text-purple-600" />,
    title: "Pattern Recognition",
    description: "Discover recurring dynamics that may be helping or hindering your connection.",
  },
  {
    icon: <Brain className="h-6 w-6 text-purple-600" />,
    title: "Relationship Frameworks",
    description: "Gain insights through attachment theory, love languages, and Gottman principles.",
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-purple-600" />,
    title: "Visual Insights",
    description: "See your relationship dynamics visualized through intuitive charts.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-purple-600" />,
    title: "Complete Privacy",
    description: "Your conversations remain private—we analyze patterns without storing messages.",
  },
  {
    icon: <FileDown className="h-6 w-6 text-purple-600" />,
    title: "Exportable Reports",
    description: "Download comprehensive reports to review or share with your partner.",
  },
]

export default function CompactFeatures() {
  return (
    <div className="bg-white py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Understand Your Relationship Like Never Before
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Love Lens uses advanced AI to analyze conversation patterns, providing insights that help you build a
            stronger, more connected relationship.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-purple-200 hover:shadow-md h-full"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
