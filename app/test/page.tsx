import { Suspense } from "react"
import CompactHeader from "@/components/compact-header"
import CompactHero from "@/components/compact-hero"
import CompactHowItWorks from "@/components/compact-how-it-works"
import CompactFeatures from "@/components/compact-features"
import CompactUploadSection from "@/components/compact-upload-section"
import CompactFooter from "@/components/compact-footer"
import EnhancedScrollToTop from "@/components/enhanced-scroll-to-top"

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200"></div>}>
        <CompactHeader />
      </Suspense>

      <CompactHero />
      <CompactHowItWorks />
      <CompactFeatures />

      <div id="upload-section">
        <CompactUploadSection />
      </div>

      <Suspense fallback={<div className="h-16 bg-gray-100"></div>}>
        <CompactFooter />
      </Suspense>

      <Suspense fallback={null}>
        <EnhancedScrollToTop />
      </Suspense>
    </div>
  )
}
