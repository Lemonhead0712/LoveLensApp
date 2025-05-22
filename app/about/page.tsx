import AboutPageClient from "@/components/about-page-client"

export default function AboutPage() {
  return (
    <AboutPageClient>
      <section className="mb-6">
        <h2 className="text-xl font-bold mb-3">Our Mission</h2>
        <p className="mb-3">
          At Love Lens, our mission is to help couples build stronger, more fulfilling relationships through data-driven
          insights and emotional intelligence. We believe that understanding the patterns in how we communicate is the
          first step toward meaningful growth and deeper connection.
        </p>
        <p>
          We've created a tool that uses advanced AI to analyze conversation patterns without storing or exposing
          private messages, providing couples with a safe way to gain insights into their relationship dynamics.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold mb-3">Our Vision</h2>
        <p className="mb-3">
          We envision a world where technology serves as a bridge to deeper human connection rather than a barrier. Love
          Lens represents our commitment to using AI ethically and responsibly to strengthen the bonds between partners.
        </p>
        <p>
          Our goal is to make relationship insights accessible to everyone, regardless of whether they have access to
          traditional relationship counseling. We believe that with the right tools, every couple can develop greater
          understanding, empathy, and communication skills.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold mb-3">Our Approach</h2>
        <p className="mb-3">
          Love Lens is built on a foundation of research-backed relationship science, including the Gottman Method,
          attachment theory, and modern communication studies. We combine this knowledge with advanced natural language
          processing to identify patterns that might otherwise go unnoticed.
        </p>
        <p>
          What sets us apart is our commitment to privacy. Unlike other tools that might store your conversations or
          require you to share intimate details, Love Lens analyzes screenshots locally and never stores the content of
          your messages. We only provide insights about patterns, not judgments about specific exchanges.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Our Team</h2>
        <p className="mb-3">
          Love Lens was founded by Lamar Newsome, a relationship coach with over 15 years of experience helping couples
          navigate communication challenges. After witnessing the same patterns emerge across hundreds of relationships,
          Lamar envisioned a tool that could help couples identify these patterns earlier and more objectively.
        </p>
        <p>
          Our team includes relationship therapists, AI researchers, and software engineers who share a passion for
          using technology to foster human connection. We're committed to continuous improvement, regularly consulting
          with experts in relationship psychology to refine our analysis and recommendations.
        </p>
      </section>
    </AboutPageClient>
  )
}
