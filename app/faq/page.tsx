import { Suspense } from "react"
import CompactHeader from "@/components/compact-header"
import CompactFooter from "@/components/compact-footer"
import { Card } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "How does Love Lens analyze my conversations?",
    answer:
      "Love Lens uses advanced AI to analyze conversation patterns, emotional tone, and communication styles. We focus on identifying patterns rather than specific content, ensuring your privacy while providing valuable insights.",
  },
  {
    question: "Is my data secure and private?",
    answer:
      "Absolutely. We analyze screenshots locally on your device and never store the content of your messages. Only anonymized patterns and insights are processed, ensuring complete privacy of your personal conversations.",
  },
  {
    question: "What kind of insights will I receive?",
    answer:
      "You'll receive insights about communication patterns, emotional dynamics, conflict resolution styles, and suggestions for improving your relationship based on established relationship psychology principles.",
  },
  {
    question: "How accurate are the AI insights?",
    answer:
      "Our AI is trained on relationship psychology research and continuously improved. While insights are highly accurate for pattern recognition, they should be used as guidance alongside your own judgment and professional counseling when needed.",
  },
  {
    question: "Can I use this for any type of relationship?",
    answer:
      "Love Lens is designed primarily for romantic relationships but can provide valuable insights for any close personal relationship where communication patterns matter.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "You can try Love Lens without an account, but creating one allows you to save your analyses, track progress over time, and access additional features like relationship check-ins and detailed reports.",
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-rose-50 to-white">
      <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200"></div>}>
        <CompactHeader />
      </Suspense>

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-2xl md:text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
            <p className="mx-auto max-w-2xl text-gray-600 text-sm md:text-base">
              Find answers to common questions about Love Lens and how it works
            </p>
          </div>

          <Card className="mb-8 border-gray-200 p-4 md:p-6 shadow-md max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>
      </main>

      <Suspense fallback={<div className="h-16 bg-gray-100"></div>}>
        <CompactFooter />
      </Suspense>
    </div>
  )
}
