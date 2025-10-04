import CompactPageLayout from "@/components/compact-page-layout"

export default function PrivacyPage() {
  return (
    <CompactPageLayout title="Privacy Policy" description="How we handle your data and protect your privacy">
      <section className="mb-6">
        <p className="mb-3">
          <strong className="text-purple-700">Last Updated:</strong> {new Date().toLocaleDateString()}
        </p>
        <p className="mb-3 text-gray-700">
          At Love Lens, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect
          your information when you use our service. By using Love Lens, you agree to the collection and use of
          information in accordance with this policy.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold mb-3 text-purple-700">Information Collection and Use</h2>
        <h3 className="text-lg font-semibold mb-1.5 text-purple-600">Conversation Analysis</h3>
        <p className="mb-3 text-gray-700">
          When you upload screenshots of conversations to Love Lens, our system processes these images to extract text
          and analyze communication patterns. <strong>We do not store the content of your conversations</strong> after
          analysis is complete. The text is temporarily processed in memory and is automatically deleted once your
          analysis results are generated.
        </p>

        <h3 className="text-lg font-semibold mb-1.5 text-purple-600">Account Information</h3>
        <p className="mb-3 text-gray-700">
          Love Lens does not require you to create an account to use our basic services. If you choose to create an
          account for premium features, we collect your email address and a password. We never store passwords in plain
          text; they are securely hashed.
        </p>

        <h3 className="text-lg font-semibold mb-1.5 text-purple-600">Usage Data</h3>
        <p className="mb-3 text-gray-700">
          We collect anonymous usage data such as the number of analyses performed, features used, and general
          application performance. This data helps us improve our service and is not linked to personally identifiable
          information.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold mb-3 text-purple-700">Data Security</h2>
        <p className="mb-3 text-gray-700">
          We implement a variety of security measures to maintain the safety of your personal information:
        </p>
        <ul className="list-disc pl-6 mb-3 text-gray-700 space-y-1.5">
          <li>All data transmission between your device and our servers is encrypted using SSL technology</li>
          <li>Conversation content is processed in memory and not written to persistent storage</li>
          <li>Analysis results are stored without the original conversation content</li>
          <li>Our servers are protected by industry-standard security measures and access controls</li>
        </ul>
        <p className="text-gray-700">
          While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee
          its absolute security. No method of transmission over the Internet or method of electronic storage is 100%
          secure.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold mb-3 text-purple-700">Data Retention</h2>
        <p className="mb-3 text-gray-700">We retain different types of data for different periods:</p>
        <ul className="list-disc pl-6 mb-3 text-gray-700 space-y-1.5">
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

      <section className="mb-6">
        <h2 className="text-xl font-bold mb-3 text-purple-700">Contact Us</h2>
        <p className="text-gray-700">
          If you have any questions about this Privacy Policy, please contact us at{" "}
          <a href="mailto:Tvnewsome@hotmail.com" className="text-purple-600 hover:text-purple-700 underline">
            Tvnewsome@hotmail.com
          </a>
          .
        </p>
      </section>
    </CompactPageLayout>
  )
}
