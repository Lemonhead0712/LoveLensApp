import { Suspense } from "react"
import AboutContent from "./about-content"

export default function AboutPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading about page...</div>}>
      <AboutContent />
    </Suspense>
  )
}
