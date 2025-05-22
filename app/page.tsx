import { Suspense } from "react"
import CompactHeader from "@/components/compact-header"
import CompactHero from "@/components/compact-hero"
import CompactFeatures from "@/components/compact-features"
import CompactHowItWorks from "@/components/compact-how-it-works"
import CompactUploadSection from "@/components/compact-upload-section"
import LoadingAnalysis from "@/components/loading-analysis"
import CompactFooter from "@/components/compact-footer"
import AccountBenefits from "@/components/account-benefits"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <CompactHeader />
      <CompactHero />
      <CompactFeatures />
      <CompactHowItWorks />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Suspense fallback={<LoadingAnalysis />}>
          <CompactUploadSection />
        </Suspense>
      </div>
      <AccountBenefits />
      <CompactFooter />
    </main>
  )
}
