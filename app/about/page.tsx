import { CompactPageLayout } from "@/components/compact-page-layout"

export default function AboutPage() {
  return (
    <CompactPageLayout
      title="About Love Lens"
      description="Discover how our AI-powered relationship analysis helps couples strengthen their emotional connection."
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4 text-purple-700">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed">
            Love Lens was created to help couples gain deeper insights into their communication patterns and emotional
            dynamics. We believe that understanding how you connect with your partner is the first step toward building
            a stronger, more fulfilling relationship.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-purple-700">How It Works</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Our advanced AI technology analyzes your text conversations to identify communication patterns, emotional
            intelligence indicators, and relationship dynamics. Using OpenAI's GPT-4o with vision capabilities, we
            extract and analyze text from your conversation screenshots to provide personalized insights.
          </p>
          <p className="text-gray-700 leading-relaxed">
            The analysis takes 1-3 minutes and provides comprehensive feedback on communication styles, conflict
            resolution patterns, emotional connection, and areas for growth.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-purple-700">Privacy & Security</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We take your privacy seriously. Your conversation screenshots are processed securely through OpenAI's API
            and are not permanently stored on our servers. Analysis results are stored in your browser's session storage
            and are automatically cleared when you close your browser.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We never share your data with third parties, and all processing is done in real-time with industry-standard
            encryption.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-purple-700">Our Technology</h2>
          <p className="text-gray-700 leading-relaxed">
            Love Lens is powered by cutting-edge AI technology from OpenAI, specifically the GPT-4o-2024-08-06 model
            with vision capabilities. This allows us to accurately extract text from conversation screenshots and
            provide nuanced, context-aware relationship insights based on established psychological frameworks.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-purple-700">Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">
            Have questions or feedback? We'd love to hear from you. Visit our{" "}
            <a href="/contact" className="text-purple-600 hover:text-purple-800 underline">
              contact page
            </a>{" "}
            to get in touch with our team.
          </p>
        </section>
      </div>
    </CompactPageLayout>
  )
}
