import { Suspense } from "react"
import Header from "@/components/header"
import Hero from "@/components/hero"
import Features from "@/components/features"
import HowItWorks from "@/components/how-it-works"
import Testimonials from "@/components/testimonials"
import UploadSection from "@/components/upload-section"
import Footer from "@/components/footer"
import EnhancedScrollToTop from "@/components/enhanced-scroll-to-top"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <Suspense fallback={<div className="h-16 bg-white shadow-sm"></div>}>
        <Header />
      </Suspense>

      <Hero />
      <Features />
      <HowItWorks />

      <div id="upload-section">
        <UploadSection />
      </div>

      <Testimonials />

      <Suspense fallback={<div className="h-16 bg-gray-100"></div>}>
        <Footer />
      </Suspense>

      <Suspense fallback={null}>
        <EnhancedScrollToTop />
      </Suspense>
    </div>
  )
}
