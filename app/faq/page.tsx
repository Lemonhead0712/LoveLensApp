import PageLayout from "@/components/page-layout"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQPage() {
  return (
    <PageLayout title="Frequently Asked Questions" description="Find answers to common questions about Love Lens">
      <section className="mb-8">
        <p className="mb-4">
          Find answers to the most common questions about Love Lens below. If you don't see your question answered here,
          please don't hesitate to contact us.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">General Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="what-is-love-lens">
            <AccordionTrigger>What is Love Lens?</AccordionTrigger>
            <AccordionContent>
              Love Lens is an AI-powered relationship insight tool that analyzes conversation patterns between partners
              to provide objective insights into relationship dynamics. It helps couples understand their communication
              styles, identify recurring patterns, and discover opportunities for growth and deeper connection.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="how-does-it-work">
            <AccordionTrigger>How does Love Lens work?</AccordionTrigger>
            <AccordionContent>
              Love Lens works by analyzing screenshots of conversations between partners. You upload images of your
              conversations, and our AI analyzes the communication patterns, emotional tones, and relationship dynamics.
              The system then generates insights based on established relationship frameworks like the Gottman Method
              and attachment theory. Importantly, we never store the content of your conversations after analysis.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="is-it-secure">
            <AccordionTrigger>Is Love Lens secure and private?</AccordionTrigger>
            <AccordionContent>
              Yes, privacy and security are our top priorities. Love Lens does not store the content of your
              conversations after analysis is complete. The text is temporarily processed in memory and is automatically
              deleted once your analysis results are generated. All data transmission is encrypted, and we implement
              industry-standard security measures to protect your information.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="replace-therapy">
            <AccordionTrigger>Can Love Lens replace relationship therapy?</AccordionTrigger>
            <AccordionContent>
              No, Love Lens is not a substitute for professional relationship counseling or therapy. It's a tool that
              can provide insights and complement professional help, but it should not replace working with a qualified
              therapist or counselor for serious relationship issues. We recommend using Love Lens as one resource among
              many for relationship growth.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Using Love Lens</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="what-screenshots">
            <AccordionTrigger>What kind of screenshots should I upload?</AccordionTrigger>
            <AccordionContent>
              You should upload screenshots of text conversations between you and your partner. These can be from any
              messaging platform (SMS, WhatsApp, iMessage, etc.). For best results, upload multiple screenshots that
              show a range of interactions, including both everyday conversations and discussions about more significant
              topics. Make sure the text is clearly visible and that it's clear which messages are from which person.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="how-many-screenshots">
            <AccordionTrigger>How many screenshots should I upload?</AccordionTrigger>
            <AccordionContent>
              For the most accurate analysis, we recommend uploading 5-10 screenshots that represent different types of
              conversations over time. This provides enough data for our AI to identify patterns. However, even a single
              meaningful conversation can provide valuable insights.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="partner-consent">
            <AccordionTrigger>Do I need my partner's consent to use Love Lens?</AccordionTrigger>
            <AccordionContent>
              Yes, we strongly recommend obtaining your partner's consent before uploading conversations to Love Lens.
              Analyzing conversations without consent could violate trust and potentially legal privacy rights depending
              on your jurisdiction. The most benefit comes when both partners engage with the insights together.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="how-accurate">
            <AccordionTrigger>How accurate is the analysis?</AccordionTrigger>
            <AccordionContent>
              Love Lens uses advanced AI models trained on relationship communication research, but no AI system is
              perfect. The analysis should be viewed as a starting point for reflection rather than absolute truth. The
              accuracy improves with more conversation data and when the conversations include a range of topics and
              emotional states. We recommend discussing the insights with your partner to determine what resonates with
              your experience.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Technical Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="supported-formats">
            <AccordionTrigger>What image formats are supported?</AccordionTrigger>
            <AccordionContent>
              Love Lens supports common image formats including JPG, PNG, and GIF. Each file should be less than 10MB in
              size. For best results, ensure the text in the screenshots is clear and readable.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="browser-compatibility">
            <AccordionTrigger>Which browsers are supported?</AccordionTrigger>
            <AccordionContent>
              Love Lens works on all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the
              latest version of your preferred browser for the best experience. The application is also mobile-friendly
              and works on both iOS and Android devices.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="export-results">
            <AccordionTrigger>Can I export my analysis results?</AccordionTrigger>
            <AccordionContent>
              Yes, you can export your analysis results as a Word document by clicking the "Export as Word Doc" button
              on the analysis results page. This creates a comprehensive report that includes all sections of the
              analysis and the visual charts. This feature is useful if you want to save your results for future
              reference or share them with a relationship counselor.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="data-storage">
            <AccordionTrigger>How long is my data stored?</AccordionTrigger>
            <AccordionContent>
              The content of your conversations is not stored after analysis is complete (typically less than 5
              minutes). Analysis results are stored for 30 days for non-account users, or until you delete them if you
              have an account. You can request deletion of your data at any time by contacting us.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Billing and Support</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="free-vs-premium">
            <AccordionTrigger>Is Love Lens free to use?</AccordionTrigger>
            <AccordionContent>
              Love Lens offers both free and premium options. The free version allows you to analyze a limited number of
              conversations per month with basic insights. Premium subscriptions provide unlimited analyses, more
              detailed insights, the Gottman Method analysis, and the ability to track relationship progress over time.
              Visit our pricing page for current subscription options.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="cancel-subscription">
            <AccordionTrigger>How do I cancel my subscription?</AccordionTrigger>
            <AccordionContent>
              You can cancel your subscription at any time from your account settings page. After cancellation, you'll
              continue to have access to premium features until the end of your current billing period. We don't offer
              prorated refunds for unused time, but you won't be charged for the next billing cycle.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="technical-support">
            <AccordionTrigger>How do I get technical support?</AccordionTrigger>
            <AccordionContent>
              For technical support, you can contact us through our Contact page or email us directly at
              Tvnewsome@hotmail.com. We aim to respond to all support requests within 24-48 hours during business days.
              For common issues, checking this FAQ page first may provide an immediate solution.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="feedback">
            <AccordionTrigger>How can I provide feedback or suggestions?</AccordionTrigger>
            <AccordionContent>
              We welcome your feedback and suggestions! You can share your thoughts through our Contact page or email us
              directly at Tvnewsome@hotmail.com. Your input helps us improve Love Lens and develop new features that
              better serve our users' needs.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </PageLayout>
  )
}
