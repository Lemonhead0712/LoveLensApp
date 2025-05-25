import PageLayout from "@/components/page-layout"

export default function PrivacyPage() {
  return (
    <PageLayout title="Privacy Policy" description="How we handle your data and protect your privacy">
      <section className="mb-8">
        <p className="mb-4">
          <strong>Last Updated:</strong> May 21, 2025
        </p>
        <p className="mb-4">
          At Love Lens, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect
          your information when you use our service. By using Love Lens, you agree to the collection and use of
          information in accordance with this policy.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Information Collection and Use</h2>
        <h3 className="text-xl font-semibold mb-2">Conversation Analysis</h3>
        <p className="mb-4">
          When you upload screenshots of conversations to Love Lens, our system processes these images to extract text
          and analyze communication patterns. <strong>We do not store the content of your conversations</strong> after
          analysis is complete. The text is temporarily processed in memory and is automatically deleted once your
          analysis results are generated.
        </p>

        <h3 className="text-xl font-semibold mb-2">Account Information</h3>
        <p className="mb-4">
          Love Lens does not require you to create an account to use our basic services. If you choose to create an
          account for premium features, we collect your email address and a password. We never store passwords in plain
          text; they are securely hashed.
        </p>

        <h3 className="text-xl font-semibold mb-2">Usage Data</h3>
        <p className="mb-4">
          We collect anonymous usage data such as the number of analyses performed, features used, and general
          application performance. This data helps us improve our service and is not linked to personally identifiable
          information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Data Security</h2>
        <p className="mb-4">
          We implement a variety of security measures to maintain the safety of your personal information:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>All data transmission between your device and our servers is encrypted using SSL technology</li>
          <li>Conversation content is processed in memory and not written to persistent storage</li>
          <li>Analysis results are stored without the original conversation content</li>
          <li>Our servers are protected by industry-standard security measures and access controls</li>
        </ul>
        <p>
          While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee
          its absolute security. No method of transmission over the Internet or method of electronic storage is 100%
          secure.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Data Retention</h2>
        <p className="mb-4">We retain different types of data for different periods:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>
            <strong>Conversation Content:</strong> Not stored after analysis is complete (typically less than 5 minutes)
          </li>
          <li>
            <strong>Analysis Results:</strong> Stored for as long as you maintain an account, or for 30 days for
            non-account users
          </li>
          <li>
            <strong>Account Information:</strong> Retained until you delete your account
          </li>
          <li>
            <strong>Anonymous Usage Data:</strong> Retained indefinitely in aggregate form
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Third-Party Services</h2>
        <p className="mb-4">Love Lens uses the following third-party services:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>
            <strong>OpenAI:</strong> For natural language processing and analysis. We transmit anonymized text data to
            OpenAI's API. OpenAI does not store this data beyond the processing required to generate a response.
          </li>
          <li>
            <strong>Vercel:</strong> For hosting our application. Vercel may collect standard server logs including IP
            addresses and request information.
          </li>
          <li>
            <strong>Supabase:</strong> For database services. All data stored in our database is encrypted.
          </li>
        </ul>
        <p>
          Each of these services has their own privacy policies, and we encourage you to review them for more
          information about how they handle data.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
        <p className="mb-4">
          Depending on your location, you may have certain rights regarding your personal information:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>The right to access information we have about you</li>
          <li>The right to request correction of any inaccurate information</li>
          <li>The right to request deletion of your information</li>
          <li>The right to object to or restrict processing of your information</li>
          <li>The right to data portability</li>
        </ul>
        <p className="mb-4">
          To exercise any of these rights, please contact us using the information provided in the Contact section.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Changes to This Privacy Policy</h2>
        <p className="mb-4">
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
          Privacy Policy on this page and updating the "Last Updated" date.
        </p>
        <p>
          You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are
          effective when they are posted on this page.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at{" "}
          <a href="mailto:Tvnewsome@hotmail.com" className="text-rose-600 hover:underline">
            Tvnewsome@hotmail.com
          </a>
          .
        </p>
      </section>
    </PageLayout>
  )
}
