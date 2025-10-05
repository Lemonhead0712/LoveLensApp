import { CompactPageLayout } from "@/components/compact-page-layout"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQPage() {
  return (
    <CompactPageLayout
      title="Frequently Asked Questions"
      description="Find answers to common questions about Love Lens and how it works."
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4 text-purple-700">General Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is Love Lens?</AccordionTrigger>
              <AccordionContent>
                Love Lens is an AI-powered relationship analysis tool that examines your text conversations to provide
                insights into communication patterns, emotional intelligence, and relationship dynamics. It uses
                OpenAI's GPT-4o with vision capabilities to analyze your conversations and offer personalized feedback.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>How does Love Lens work?</AccordionTrigger>
              <AccordionContent>
                You upload screenshots of your text conversations (from iMessage, WhatsApp, SMS, or any messaging app).
                Our AI uses Optical Character Recognition (OCR) to extract the text, then analyzes communication
                patterns, emotional tone, conflict resolution styles, and relationship health. The entire process takes
                1-3 minutes and includes stages for preparing images, extracting text, analyzing patterns, and
                generating insights.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>Is my data private and secure?</AccordionTrigger>
              <AccordionContent>
                Yes. Your conversation screenshots are processed securely through OpenAI's API with industry-standard
                encryption. We do not permanently store your images or conversations on our servers. Analysis results
                are stored in your browser's session storage and are automatically cleared when you close your browser.
                We never share your data with third parties.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>What messaging apps are supported?</AccordionTrigger>
              <AccordionContent>
                Love Lens works with screenshots from any text-based messaging platform, including iMessage, SMS,
                WhatsApp, Facebook Messenger, Telegram, Signal, and more. As long as you can take a clear screenshot
                showing the text conversation, our AI can analyze it.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-purple-700">Technical Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-5">
              <AccordionTrigger>How accurate is the analysis?</AccordionTrigger>
              <AccordionContent>
                Our analysis uses OpenAI's GPT-4o-2024-08-06 model, one of the most advanced AI models available. The
                accuracy depends on the quality and quantity of conversation data provided. For best results, we
                recommend uploading 5-10 screenshots showing a variety of conversation types (casual chat, conflict
                resolution, emotional support, etc.). The AI provides confidence scores based on the amount and clarity
                of text extracted.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>How long does the analysis take?</AccordionTrigger>
              <AccordionContent>
                The complete analysis typically takes 1-3 minutes, depending on the number of screenshots uploaded.
                You'll see a progress indicator showing four stages: preparing images (extracting text from
                screenshots), analyzing patterns (identifying communication styles), generating insights (creating
                personalized feedback), and finalizing report (compiling all results).
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger>Can I export my results?</AccordionTrigger>
              <AccordionContent>
                Yes! You can export your analysis results as a professionally formatted Word document. The export
                includes all sections: relationship health scores, communication patterns, emotional intelligence
                metrics, strengths, areas for growth, and personalized recommendations. Simply click the "Export to
                Word" button on your results page.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger>What if the text extraction doesn't work?</AccordionTrigger>
              <AccordionContent>
                If the AI has trouble reading your screenshots, try these tips: 1) Ensure screenshots are clear and not
                blurry, 2) Make sure text is large enough to read, 3) Avoid heavily compressed or low-resolution images,
                4) Take screenshots in good lighting if they're photos of a screen, 5) Upload fewer screenshots at once
                (5-10 is optimal). The system provides confidence scores and will let you know if text extraction was
                challenging.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9">
              <AccordionTrigger>How long are my results stored?</AccordionTrigger>
              <AccordionContent>
                Your analysis results are stored in your browser's session storage, which means they're available for
                the duration of your browser session. Once you close your browser or clear your browsing data, the
                results are automatically deleted. We recommend exporting your results to Word if you want to keep them
                long-term.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-10">
              <AccordionTrigger>What AI model powers Love Lens?</AccordionTrigger>
              <AccordionContent>
                Love Lens uses OpenAI's GPT-4o-2024-08-06 model with vision capabilities. This advanced AI model can
                process both text and images, allowing it to extract text from your conversation screenshots and perform
                sophisticated natural language analysis to understand communication patterns, emotional tone, and
                relationship dynamics.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-purple-700">Pricing & Support</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-11">
              <AccordionTrigger>How much does Love Lens cost?</AccordionTrigger>
              <AccordionContent>
                Love Lens is currently free to use during our beta period. We're committed to making relationship
                insights accessible to everyone. Future pricing plans will be announced on our website, and early users
                will receive special benefits.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-12">
              <AccordionTrigger>How can I get support?</AccordionTrigger>
              <AccordionContent>
                If you encounter any issues or have questions, you can reach us through our{" "}
                <a href="/contact" className="text-purple-600 hover:text-purple-800 underline">
                  contact page
                </a>
                . We typically respond within 24-48 hours. For technical issues, please include details about your
                browser, device, and the specific error message you received.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
    </CompactPageLayout>
  )
}
