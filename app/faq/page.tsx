import CompactPageLayout from "@/components/compact-page-layout"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQPage() {
  return (
    <CompactPageLayout
      title="Frequently Asked Questions"
      description="Find answers to common questions about Love Lens"
    >
      <section className="mb-6">
        <p className="mb-5 text-gray-700">
          Find answers to the most common questions below. If you don't see your question,{" "}
          <a href="/contact" className="text-purple-600 hover:text-purple-700 underline">
            contact us
          </a>
          .
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold mb-3 text-purple-700">General Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="what-is-love-lens" className="border-purple-100">
            <AccordionTrigger className="text-purple-700 hover:text-purple-800">What is Love Lens?</AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Love Lens is an AI-powered tool that analyzes conversation patterns to provide objective insights into
              relationship dynamics. It helps couples understand communication styles, identify patterns, and discover
              growth opportunities.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="how-does-it-work" className="border-purple-100">
            <AccordionTrigger className="text-purple-700 hover:text-purple-800">
              How does Love Lens work?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Upload screenshots of your conversations, and our AI analyzes communication patterns, emotional tones, and
              relationship dynamics using frameworks like the Gottman Method and attachment theory. Screenshots are
              processed locally and deleted after analysis—we never store your conversation content.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="is-it-secure" className="border-purple-100">
            <AccordionTrigger className="text-purple-700 hover:text-purple-800">
              Is Love Lens secure and private?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Yes. Love Lens processes screenshots in memory and automatically deletes them after generating your
              analysis. We never store conversation content. All data transmission is encrypted with industry-standard
              security measures.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="replace-therapy" className="border-purple-100">
            <AccordionTrigger className="text-purple-700 hover:text-purple-800">
              Can Love Lens replace relationship therapy?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              No. Love Lens is informational and not a substitute for professional counseling or therapy. Use it as one
              resource among many for relationship growth. For serious relationship issues, we recommend working with a
              qualified therapist.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold mb-3 text-purple-700">Using Love Lens</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="what-screenshots" className="border-purple-100">
            <AccordionTrigger className="text-purple-700 hover:text-purple-800">
              What kind of screenshots should I upload?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Upload text conversation screenshots from any messaging platform (SMS, WhatsApp, iMessage, etc.). For best
              results, upload multiple screenshots showing a range of interactions. Ensure text is clearly visible and
              it's clear who sent each message.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="how-many-screenshots" className="border-purple-100">
            <AccordionTrigger className="text-purple-700 hover:text-purple-800">
              How many screenshots should I upload?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              We recommend 5-10 screenshots representing different conversations over time for the most accurate
              analysis. Even a single conversation can provide insights, though results may be less reliable with very
              few messages.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="partner-consent" className="border-purple-100">
            <AccordionTrigger className="text-purple-700 hover:text-purple-800">
              Do I need my partner's consent to use Love Lens?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Yes, we strongly recommend obtaining your partner's consent. Analyzing conversations without consent could
              violate trust and potentially legal privacy rights. The most benefit comes when both partners engage with
              the insights together.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold mb-3 text-purple-700">Technical Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="supported-formats" className="border-purple-100">
            <AccordionTrigger className="text-purple-700 hover:text-purple-800">
              What image formats are supported?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Love Lens supports JPG, PNG, GIF, and WebP formats. Each file should be less than 10MB with clear,
              readable text.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="export-results" className="border-purple-100">
            <AccordionTrigger className="text-purple-700 hover:text-purple-800">
              Can I export my analysis results?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Yes, click the "Export to Word" button on the results page to download a comprehensive report with all
              analysis sections and visual charts.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </CompactPageLayout>
  )
}
