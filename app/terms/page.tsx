import CompactPageLayout from "@/components/compact-page-layout"

export default function TermsPage() {
  return (
    <CompactPageLayout title="Terms of Service" description="Rules and guidelines for using Love Lens">
      <section className="mb-8">
        <p className="mb-4">
          <strong className="text-purple-700">Last Updated:</strong> {new Date().toLocaleDateString()}
        </p>
        <p className="mb-4 text-gray-700">
          Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Love Lens website
          and application (the "Service") operated by Love Lens ("us", "we", or "our").
        </p>
        <p className="text-gray-700">
          By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the
          terms, then you may not access the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-purple-700">Use of Service</h2>
        <h3 className="text-xl font-semibold mb-2 text-purple-600">Eligibility</h3>
        <p className="mb-4 text-gray-700">
          You must be at least 18 years old to use this Service. By using this Service, you represent and warrant that
          you are at least 18 years of age and have the legal capacity to enter into these Terms.
        </p>

        <h3 className="text-xl font-semibold mb-2 text-purple-600">User Accounts</h3>
        <p className="mb-4 text-gray-700">
          When you create an account with us, you must provide information that is accurate, complete, and current at
          all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of
          your account on our Service.
        </p>
        <p className="mb-4 text-gray-700">
          You are responsible for safeguarding the password that you use to access the Service and for any activities or
          actions under your password. You agree not to disclose your password to any third party. You must notify us
          immediately upon becoming aware of any breach of security or unauthorized use of your account.
        </p>

        <h3 className="text-xl font-semibold mb-2 text-purple-600">Acceptable Use</h3>
        <p className="mb-4 text-gray-700">You agree not to use the Service:</p>
        <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
          <li>In any way that violates any applicable national or international law or regulation</li>
          <li>To upload or analyze conversations without the consent of all parties involved</li>
          <li>To harass, abuse, or harm another person</li>
          <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-purple-700">Content</h2>
        <p className="mb-4 text-gray-700">
          Our Service allows you to upload, analyze, and view the results of conversation analysis. You are responsible
          for ensuring you have the right to upload and analyze any content, including obtaining consent from all
          parties involved in the conversations.
        </p>
        <p className="mb-4 text-gray-700">
          You retain all rights to your content. By uploading content to our Service, you grant us a limited license to
          use, process, and analyze your content solely for the purpose of providing the Service to you.
        </p>
        <p className="text-gray-700">
          We do not claim ownership of your content, and we will not use your content for any purpose other than
          providing and improving the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-purple-700">Intellectual Property</h2>
        <p className="mb-4 text-gray-700">
          The Service and its original content (excluding content provided by users), features, and functionality are
          and will remain the exclusive property of Love Lens and its licensors. The Service is protected by copyright,
          trademark, and other laws of both the United States and foreign countries.
        </p>
        <p className="text-gray-700">
          Our trademarks and trade dress may not be used in connection with any product or service without the prior
          written consent of Love Lens.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-purple-700">Disclaimer</h2>
        <p className="mb-4 text-gray-700">
          Love Lens is not a substitute for professional relationship counseling or therapy. The analysis and insights
          provided by our Service are for informational purposes only and should not be considered professional advice.
        </p>
        <p className="mb-4 text-gray-700">
          Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis.
          The Service is provided without warranties of any kind, whether express or implied, including, but not limited
          to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of
          performance.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-purple-700">Limitation of Liability</h2>
        <p className="mb-4 text-gray-700">
          In no event shall Love Lens, nor its directors, employees, partners, agents, suppliers, or affiliates, be
          liable for any indirect, incidental, special, consequential, or punitive damages, including without
          limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
          <li>Your access to or use of or inability to access or use the Service</li>
          <li>Any conduct or content of any third party on the Service</li>
          <li>Any content obtained from the Service</li>
          <li>Unauthorized access, use, or alteration of your transmissions or content</li>
        </ul>
        <p className="text-gray-700">
          Whether based on warranty, contract, tort (including negligence), or any other legal theory, whether or not we
          have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have
          failed of its essential purpose.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-purple-700">Termination</h2>
        <p className="mb-4 text-gray-700">
          We may terminate or suspend your account immediately, without prior notice or liability, for any reason
          whatsoever, including without limitation if you breach the Terms.
        </p>
        <p className="mb-4 text-gray-700">
          Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account,
          you may simply discontinue using the Service or contact us to request account deletion.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-purple-700">Governing Law</h2>
        <p className="mb-4 text-gray-700">
          These Terms shall be governed and construed in accordance with the laws of the United States, without regard
          to its conflict of law provisions.
        </p>
        <p className="text-gray-700">
          Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
          If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of
          these Terms will remain in effect.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-purple-700">Changes to Terms</h2>
        <p className="mb-4 text-gray-700">
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is
          material, we will try to provide at least 30 days' notice prior to any new terms taking effect.
        </p>
        <p className="text-gray-700">
          By continuing to access or use our Service after those revisions become effective, you agree to be bound by
          the revised terms. If you do not agree to the new terms, please stop using the Service.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 text-purple-700">Contact Us</h2>
        <p className="text-gray-700">
          If you have any questions about these Terms, please contact us at{" "}
          <a href="mailto:Tvnewsome@hotmail.com" className="text-purple-600 hover:text-purple-700 underline">
            Tvnewsome@hotmail.com
          </a>
          .
        </p>
      </section>
    </CompactPageLayout>
  )
}
