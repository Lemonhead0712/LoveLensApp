import { Card } from "@/components/ui/card"
import { QuoteIcon } from "lucide-react"

const testimonials = [
  {
    quote:
      "Love Lens helped us identify communication patterns we never noticed before. It's like having a relationship therapist in your pocket.",
    author: "Sarah & Michael",
    relationship: "Together 3 years",
  },
  {
    quote:
      "The visual insights were eye-opening. We discovered our different love languages and now understand each other so much better.",
    author: "David & Emma",
    relationship: "Married 5 years",
  },
  {
    quote:
      "I was skeptical at first, but the analysis was surprisingly accurate. It helped us have conversations we'd been avoiding for months.",
    author: "James & Olivia",
    relationship: "Dating 1 year",
  },
]

export default function Testimonials() {
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <Card className="border-gray-200 p-8 shadow-md">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">What Couples Are Saying</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Love Lens has helped thousands of couples gain deeper insights into their relationships.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="flex flex-col border-gray-100 p-6 shadow-sm">
                <QuoteIcon className="h-8 w-8 text-rose-200 mb-4" />
                <p className="mb-6 flex-grow text-gray-700 italic">"{testimonial.quote}"</p>
                <div className="border-t border-gray-100 pt-4">
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.relationship}</p>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
