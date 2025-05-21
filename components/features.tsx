import { Card } from "@/components/ui/card"
import { MessageSquare, BarChart3, Repeat, Brain, ShieldCheck, FileDown } from "lucide-react"

const features = [
  {
    icon: <MessageSquare className="h-8 w-8 text-rose-600" />,
    title: "Communication Analysis",
    description:
      "Identify communication styles, emotional tones, and interaction patterns that shape your relationship.",
  },
  {
    icon: <Repeat className="h-8 w-8 text-rose-600" />,
    title: "Pattern Recognition",
    description: "Discover recurring dynamics that may be helping or hindering your connection and emotional intimacy.",
  },
  {
    icon: <Brain className="h-8 w-8 text-rose-600" />,
    title: "Relationship Frameworks",
    description:
      "Gain insights through established models including attachment theory, love languages, and Gottman principles.",
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-rose-600" />,
    title: "Visual Insights",
    description: "See your relationship dynamics visualized through intuitive charts and comparative analyses.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-rose-600" />,
    title: "Complete Privacy",
    description: "Your conversations remain private—we analyze patterns without storing or displaying your messages.",
  },
  {
    icon: <FileDown className="h-8 w-8 text-rose-600" />,
    title: "Exportable Reports",
    description:
      "Download comprehensive reports to review, share with your partner, or discuss with a relationship coach.",
  },
]

export default function Features() {
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <Card className="border-gray-200 p-8 shadow-md">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Understand Your Relationship Like Never Before
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Love Lens uses advanced AI to analyze conversation patterns, providing insights that help you build a
              stronger, more connected relationship.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="flex flex-col border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-rose-200 hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                  {feature.icon}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
