import CompactPageLayout from "@/components/compact-page-layout"

export default function AboutPage() {
  return (
    <CompactPageLayout title="About Love Lens" description="Learn about our mission and the team behind Love Lens">
      <section className="mb-6">
        <h2 className="text-xl font-bold mb-3 text-purple-700">Our Mission & Vision</h2>
        <p className="mb-3 text-gray-700">
          At Love Lens, we help couples build stronger relationships through data-driven insights and emotional
          intelligence. We believe understanding communication patterns is the first step toward meaningful growth and
          deeper connection. Our AI analyzes conversation patterns without storing private messages, providing a safe
          way to gain insights into relationship dynamics.
        </p>
        <p className="text-gray-700">
          We envision technology as a bridge to deeper human connection. Love Lens represents our commitment to using AI
          ethically to strengthen bonds between partners, making relationship insights accessible to everyone—whether or
          not they have access to traditional counseling.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold mb-3 text-purple-700">Our Approach</h2>
        <p className="mb-3 text-gray-700">
          Love Lens combines research-backed relationship science (Gottman Method, attachment theory, communication
          studies) with advanced natural language processing to identify patterns that might otherwise go unnoticed.
        </p>
        <p className="text-gray-700">
          What sets us apart: we analyze screenshots locally and never store message content. Your conversations are
          processed in memory and automatically deleted after analysis. We provide insights about patterns, not
          judgments about specific exchanges.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold mb-3 text-purple-700">Our Team</h2>
        <p className="text-gray-700">
          Love Lens was founded by Lamar Newsome, a relationship coach with over 15 years of experience. Our team
          includes relationship therapists, AI researchers, and software engineers who share a passion for using
          technology to foster human connection. We regularly consult with relationship psychology experts to refine our
          analysis and recommendations.
        </p>
      </section>
    </CompactPageLayout>
  )
}
