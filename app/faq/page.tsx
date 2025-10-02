import CompactPageLayout from "@/components/compact-page-layout"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQPage() {
  return (
    <CompactPageLayout
      title="Frequently Asked Questions"
      description="Find answers to common questions about Love Lens"
    >
      <section className="mb-8">
        <p className="mb-6 text-gray-700">
          Find answers to the most common questions about Love Lens below. If you don't see your question answered here,
          please don't hesitate to{" "}
          <a href="/contact" className="text-purple-600 hover:text-purple-700 underline">
            contact us
          </a>
          .
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-purple-700">General Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="what-is-love-lens" className="border-purple-100">
            <AccordionTrigger className="text-purple-700 hover:text-purple-800">What is Love Lens?</AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Love Lens is an AI-powered relationship insight tool that analyzes conversation patterns between partners
              to provide objective insights into relationship dynamics. It helps couples understand their communication
              styles, identify recurring patterns, and discover opportunities for growth and deeper connection.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="how-does-it-work" className="border-purple-100">
            <AccordionTrigger className="text-purple-700 hover:text-purple-800">
              How does Love Lens work?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Love Lens works by analyzing screenshots of conversations between partners. You upload images of your
              conversations, and our AI analyzes the communication patterns, emotional tones, and relationship dynamics.
              The system then generates insights based on established relationship frameworks like the Gottman Method
              and attachment theory. Importantly, we never store the content of your conversations after analysis.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="is-it-secure" className="border-purple-100">
            <AccordionTrigger className="text-purple-700 hover:text-purple-800">
              Is Love Lens secure and private?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Yes, privacy and security are our top priorities. Love Lens does not store the content of your
              conversations after analysis is complete. The text is temporarily processed in memory and is automatically
              deleted once your analysis results are generated. All data transmission is encrypted, and we implement
              industry-standard security measures to protect your information.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="replace-therapy" className="border-purple-100">
            <AccordionTrigger className="text-purple-700 hover:text-purple-800">
              Can Love Lens replace relationship therapy?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              No, Love Lens is not a substitute for professional relationship counseling or therapy. It's a tool that
              can provide insights and complement professional help, but it should not replace working with a qualified
              therapist or counselor for serious relationship issues. We recommend using Love Lens as one resource among
              many for relationship growth.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-purple-700">Using Love Lens</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="what-screenshots" className="border-purple-100">
            <AccordionTrigger className="text-purple-700 hover:text-purple-800">
              What kind of screenshots should I upload?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              You should upload screenshots of text conversations between you and your partner. These can be from any
              messaging platform (SMS, WhatsApp, iMessage, etc.). For best results, upload multiple screenshots that
              show a range of interactions, including both everyday conversations and discussions about more significant
              topics. Make sure the text is clearly visible and that it's clear which messages are from which person.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="how-many-screenshots" className="border-purple-100">
            <AccordionTrigger className="text-purple-700 hover:text-purple-800">
              How many screenshots should I upload?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              For the most accurate analysis, we recommend uploading 5-10 screenshots that represent different types of
              conversations over time. This provides enough data for our AI to identify patterns. However, even a single
              meaningful conversation can provide valuable insights.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="partner-consent" className="border-purple-100">
            <AccordionTrigger className="text-purple-700 hover:text-purple-800">
              Do I need my partner's consent to use Love Lens?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Yes, we strongly recommend obtaining your partner's consent before uploading conversations to Love Lens.
              Analyzing conversations without consent could violate trust and potentially legal privacy rights depending
              on your jurisdiction. The most benefit comes when both partners engage with the insights together.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 text-purple-700">Technical Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="supported-formats" className="border-purple-100">
            <AccordionTrigger className="text-purple-700 hover:text-purple-800">
              What image formats are supported?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Love Lens supports common image formats including JPG, PNG, GIF, and WebP. Each file should be less than
              20MB in size. For best results, ensure the text in the screenshots is clear and readable.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="export-results" className="border-purple-100">
            <AccordionTrigger className="text-purple-700 hover:text-purple-800">
              Can I export my analysis results?
            </AccordionTrigger>
            <AccordionContent className="text-gray-700">
              Yes, you can export your analysis results as a Word document by clicking the "Export as Word Doc" button
              on the analysis results page. This creates a comprehensive report that includes all sections of the
              analysis and the visual charts.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </CompactPageLayout>
  )
}
