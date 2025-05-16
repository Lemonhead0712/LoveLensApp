import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Love Lens",
  description: "Privacy Policy for Love Lens - Emotional Intelligence Analysis",
}

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

      <div className="prose prose-lg max-w-none">
        <p className="mb-4">Last Updated: May 13, 2025</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
        <p className="mb-4">
          Welcome to Love Lens. We respect your privacy and are committed to protecting your personal data. This privacy
          policy will inform you about how we look after your personal data when you visit our website and tell you
          about your privacy rights and how the law protects you.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Data We Collect</h2>
        <p className="mb-4">
          We may collect, use, store and transfer different kinds of personal data about you which we have grouped
          together as follows:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Identity Data: includes first name, last name, username or similar identifier</li>
          <li>Contact Data: includes email address</li>
          <li>
            Technical Data: includes internet protocol (IP) address, browser type and version, time zone setting and
            location, browser plug-in types and versions, operating system and platform
          </li>
          <li>Usage Data: includes information about how you use our website and services</li>
          <li>Conversation Data: includes text from conversations you upload for analysis</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Data</h2>
        <p className="mb-4">
          We will only use your personal data when the law allows us to. Most commonly, we will use your personal data
          in the following circumstances:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>To provide our emotional intelligence analysis services</li>
          <li>To improve our website and services</li>
          <li>To respond to your inquiries</li>
          <li>To send you updates about our services (with your consent)</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Security</h2>
        <p className="mb-4">
          We have put in place appropriate security measures to prevent your personal data from being accidentally lost,
          used or accessed in an unauthorized way, altered or disclosed.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this privacy policy or our privacy practices, please contact us at:
          privacy@lovelens.example.com
        </p>
      </div>
    </div>
  )
}
