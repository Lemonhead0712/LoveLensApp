import CompactPageLayout from "@/components/compact-page-layout"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQPage() {
  return (
    <CompactPageLayout
      title="Frequently Asked Questions"
      description="Find answers to common questions about Love Lens"
    >
      <div className="space-y-8">
        <section>
          <p className="text-gray-700 leading-relaxed">
            Find answers to the most common questions about Love Lens below. If you don't see your question answered
            here, please don't hesitate to{" "}
            <a href="/contact" className="text-purple-600 hover:text-purple-700 underline">
              contact us
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 text-purple-700">General Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="what-is-love-lens" className="border-purple-100">
              <AccordionTrigger className="text-purple-700 hover:text-purple-800">What is Love Lens?</AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed">
                Love Lens is an AI-powered relationship insight tool that analyzes conversation screenshots between
                partners to provide objective insights into relationship dynamics. Using advanced AI technology, it
                examines communication patterns, emotional tones, and interaction styles to help couples understand
                their relationship better and identify areas for growth.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="how-does-it-work" className="border-purple-100">
              <AccordionTrigger className="text-purple-700 hover:text-purple-800">
                How does Love Lens work?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed">
                Love Lens uses OpenAI's GPT-4o with vision capabilities to analyze your conversation screenshots. You
                upload images of text conversations from any messaging platform, and the AI extracts and analyzes the
                text to identify communication patterns, emotional dynamics, attachment styles, and relationship health
                indicators. The analysis provides comprehensive insights across multiple dimensions including overall
                relationship health, communication quality, emotional intelligence, conflict resolution, and future
                outlook. Results are temporarily stored in your browser session for viewing and can be exported as a
                Word document.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="is-it-secure" className="border-purple-100">
              <AccordionTrigger className="text-purple-700 hover:text-purple-800">
                Is Love Lens secure and private?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed">
                Yes, privacy is a priority. Your conversation images are processed through secure API calls to OpenAI
                for text extraction and analysis. The extracted text and analysis results are temporarily stored in your
                browser's session storage and are not permanently saved on our servers. Once you close your browser or
                clear your session, all data is removed. However, please note that uploaded images are sent to OpenAI's
                API for processing, so you should review OpenAI's privacy policy as well.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="replace-therapy" className="border-purple-100">
              <AccordionTrigger className="text-purple-700 hover:text-purple-800">
                Can Love Lens replace relationship therapy?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed">
                No, Love Lens is not a substitute for professional relationship counseling or therapy. It's an
                AI-powered tool that provides insights based on conversation analysis, but it cannot replace the
                personalized guidance, emotional support, and professional expertise of a qualified therapist or
                counselor. We recommend using Love Lens as a supplementary tool to gain insights, but always consult
                with a mental health professional for serious relationship concerns.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 text-purple-700">Using Love Lens</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="what-screenshots" className="border-purple-100">
              <AccordionTrigger className="text-purple-700 hover:text-purple-800">
                What kind of screenshots should I upload?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed">
                You can upload screenshots of text conversations between you and your partner from any messaging
                platform (SMS, iMessage, WhatsApp, Facebook Messenger, etc.). The screenshots should show clear, legible
                text messages. For best results, include multiple screenshots that represent different types of
                conversations - daily check-ins, deeper discussions, and how you handle disagreements. Make sure the
                text is readable and that message timestamps are visible if possible to help the AI understand
                conversation flow.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="how-many-screenshots" className="border-purple-100">
              <AccordionTrigger className="text-purple-700 hover:text-purple-800">
                How many screenshots should I upload?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed">
                You can upload multiple screenshots (the system supports batch uploads). For the most comprehensive
                analysis, we recommend uploading 5-10 screenshots that capture diverse conversations over time. More
                data helps the AI identify consistent patterns in your communication. However, even analyzing a few
                meaningful conversations can provide valuable insights. Each image should be under 20MB in size.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="partner-consent" className="border-purple-100">
              <AccordionTrigger className="text-purple-700 hover:text-purple-800">
                Do I need my partner's consent to use Love Lens?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed">
                Yes, we strongly recommend obtaining your partner's consent before uploading your conversations to Love
                Lens. Analyzing conversations without consent can violate trust and may have legal implications
                depending on your jurisdiction's privacy laws. Love Lens works best when both partners are aware of and
                engaged with the process, as the insights are most valuable when discussed together as a couple.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="how-long-analysis" className="border-purple-100">
              <AccordionTrigger className="text-purple-700 hover:text-purple-800">
                How long does the analysis take?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed">
                The analysis typically takes 1-3 minutes depending on the number of screenshots you upload and the
                amount of text in them. You'll see a progress animation with different stages: preparing images,
                extracting text from screenshots, analyzing conversation patterns, and generating insights. Once
                complete, you'll be automatically redirected to view your comprehensive analysis results.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 text-purple-700">Technical Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="supported-formats" className="border-purple-100">
              <AccordionTrigger className="text-purple-700 hover:text-purple-800">
                What image formats are supported?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed">
                Love Lens supports common image formats including PNG, JPG/JPEG, GIF, and WebP. Each file should be
                under 20MB in size. The AI uses optical character recognition (OCR) through GPT-4o's vision capabilities
                to extract text from your screenshots, so ensure the text is clear and readable for the best results.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="export-results" className="border-purple-100">
              <AccordionTrigger className="text-purple-700 hover:text-purple-800">
                Can I export my analysis results?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed">
                Yes! After your analysis is complete, you can export your results as a Word document (.docx) by clicking
                the "Export as Word Doc" button at the top of the results page. The exported document includes all
                sections of your analysis: overall relationship health, communication patterns, emotional intelligence,
                conflict resolution, attachment dynamics, growth opportunities, and future outlook. The document is
                formatted professionally and can be saved for your records or shared with your partner or therapist.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="results-storage" className="border-purple-100">
              <AccordionTrigger className="text-purple-700 hover:text-purple-800">
                How long are my results stored?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed">
                Your analysis results are stored temporarily in your browser's session storage. This means they remain
                available as long as you keep your browser tab open or until you clear your browser's cache. The results
                are not permanently saved on our servers. If you want to keep your analysis for future reference, we
                recommend exporting it as a Word document before closing your browser.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="what-ai-model" className="border-purple-100">
              <AccordionTrigger className="text-purple-700 hover:text-purple-800">
                What AI model does Love Lens use?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed">
                Love Lens uses OpenAI's GPT-4o model (specifically gpt-4o-2024-08-06), which includes advanced vision
                capabilities for extracting text from images and sophisticated natural language processing for analyzing
                relationship dynamics. This model is specifically designed to understand context, emotional nuances, and
                complex human interactions, making it well-suited for relationship analysis.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
    </CompactPageLayout>
  )
}
