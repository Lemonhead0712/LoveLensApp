import { Suspense } from "react"
import CompactHeader from "@/components/compact-header"
import CompactFooter from "@/components/compact-footer"
import { Card } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-rose-50 to-white">
      <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200"></div>}>
        <CompactHeader />
      </Suspense>

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-2xl md:text-3xl font-bold text-gray-900">Terms of Service</h1>
            <p className="mx-auto max-w-2xl text-gray-600 text-sm md:text-base">
              Please read these terms carefully before using Love Lens
            </p>
          </div>

          <Card className="mb-8 border-gray-200 p-4 md:p-6 shadow-md">
            <div className="prose prose-sm md:prose-base prose-rose max-w-none">
              <section className="mb-6">
                <h2 className="text-xl font-bold mb-3">Acceptance of Terms</h2>
                <p className="mb-3">
                  By accessing and using Love Lens, you accept and agree to be bound by the terms and provision of this
                  agreement.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-bold mb-3">Use License</h2>
                <p className="mb-3">
                  Permission is granted to temporarily use Love Lens for personal, non-commercial transitory viewing
                  only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc pl-6 mb-3">
                  <li>modify or copy the materials</li>
                  <li>use the materials for any commercial purpose or for any public display</li>
                  <li>attempt to reverse engineer any software contained in Love Lens</li>
                  <li>remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-bold mb-3">Disclaimer</h2>
                <p className="mb-3">
                  Love Lens is provided as an educational and informational tool. The insights and analysis provided
                  should not be considered as professional relationship counseling or therapy. Always consult with
                  qualified professionals for serious relationship issues.
                </p>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-bold mb-3">Limitations</h2>
                <p className="mb-3">
                  In no event shall Love Lens or its suppliers be liable for any damages (including, without limitation,
                  damages for loss of data or profit, or due to business interruption) arising out of the use or
                  inability to use Love Lens, even if Love Lens or a Love Lens authorized representative has been
                  notified orally or in writing of the possibility of such damage.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">Revisions</h2>
                <p>
                  Love Lens may revise these terms of service at any time without notice. By using this application, you
                  are agreeing to be bound by the then current version of these terms of service.
                </p>
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
