import TestAnalysis from "@/components/test-analysis"
import CompactHeader from "@/components/compact-header"
import CompactFooter from "@/components/compact-footer"

export default function TestPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-rose-50 to-white">
      <CompactHeader />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <TestAnalysis />
        </div>
      </main>
      <CompactFooter />
    </div>
  )
}
