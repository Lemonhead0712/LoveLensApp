import { Suspense } from "react"
import CompactHeader from "@/components/compact-header"
import StreamlinedHero from "@/components/streamlined-hero"
import StreamlinedFeatures from "@/components/streamlined-features"
import StreamlinedHowItWorks from "@/components/streamlined-how-it-works"
import EnhancedCompactUpload from "@/components/enhanced-compact-upload"
import CompactFooter from "@/components/compact-footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <CompactHeader />
      <StreamlinedHero />
      <StreamlinedFeatures />
      <StreamlinedHowItWorks />
      <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
        <EnhancedCompactUpload />
      </Suspense>
      <CompactFooter />
    </main>
  )
}
