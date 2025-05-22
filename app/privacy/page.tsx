import { Suspense } from "react"
import CompactHeader from "@/components/compact-header"
import CompactFooter from "@/components/compact-footer"
import { Card } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-rose-50 to-white">
      <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200"></div>}>
        <CompactHeader />
      </Suspense>

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-2xl md:text-3xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="mx-auto max-w-2xl text-gray-600 text-sm md:text-base">
              Your privacy is important to us. Learn how we protect your data.
            </p>
          </div>

          <Card className="mb-8 border-gray-200 p-4 md:p-6 shadow-md">
            <div className="prose prose-sm md:prose-base prose-rose max-w-none">
              <section className="mb-6">
                <h2 className="text-xl font-bold mb-3">Data Collection</h2>
                <p className="mb-3">
                  Love Lens is designed with privacy as a core principle. We analyze conversation screenshots locally on
                  your device and do not store the content of your messages on our servers.
                </p>
                <p>
                  We only collect anonymized patterns and insights that help improve our analysis algorithms, never the
                  actual content of your conversations.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-bold mb-3">How We Use Your Information</h2>
                <p className="mb-3">Any data we collect is used solely to:</p>
                <ul className="list-disc pl-6 mb-3">
                  <li>Provide you with relationship insights and analysis</li>
                  <li>Improve our AI algorithms and analysis accuracy</li>
                  <li>Send you important updates about our service</li>
                  <li>Provide customer support when requested</li>
                </ul>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-bold mb-3">Data Security</h2>
                <p className="mb-3">We implement industry-standard security measures to protect your data:</p>
                <ul className="list-disc pl-6 mb-3">
                  <li>End-to-end encryption for all data transmission</li>
                  <li>Local processing of sensitive content</li>
                  <li>Regular security audits and updates</li>
                  <li>Strict access controls for our team</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">Your Rights</h2>
                <p className="mb-3">You have the right to:</p>
                <ul className="list-disc pl-6">
                  <li>Access any data we have about you</li>
                  <li>Request deletion of your account and data</li>
                  <li>Opt out of data collection at any time</li>
                  <li>Contact us with privacy concerns</li>
                </ul>
              </section>
            </div>
          </Card>
        </div>
      </main>

      <Suspense fallback={<div className="h-16 bg-gray-100"></div>}>
        <CompactFooter />
      </Suspense>
    </div>
  )
}
