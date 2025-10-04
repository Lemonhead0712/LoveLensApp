import CompactHeader from "@/components/compact-header"
import StreamlinedHero from "@/components/streamlined-hero"
import StreamlinedFeatures from "@/components/streamlined-features"
import StreamlinedHowItWorks from "@/components/streamlined-how-it-works"
import EnhancedCompactUpload from "@/components/enhanced-compact-upload"
import CompactFooter from "@/components/compact-footer"
import EnhancedScrollToTop from "@/components/enhanced-scroll-to-top"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <CompactHeader />
      <main className="flex-grow">
        <StreamlinedHero />
        <StreamlinedFeatures />
        <StreamlinedHowItWorks />
        <EnhancedCompactUpload />
      </main>
      <CompactFooter />
      <EnhancedScrollToTop />
    </div>
  )
}
