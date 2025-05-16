import Link from "next/link"
import { Button } from "@/components/ui/button-override"
import { ArrowRight } from "lucide-react"
import { Logo } from "@/components/logo"
import { SparkleEffect } from "@/components/sparkle-effect"
import { GottmanMethodDiagram } from "@/components/gottman-method-diagram"
import { EmotionalIntelligenceDiagram } from "@/components/emotional-intelligence-diagram"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-love-gradient">
      <SparkleEffect count={20} className="absolute inset-0 pointer-events-none" />

      <main className="flex-1 relative z-10">
        <section className="py-10 sm:py-16 bg-gradient-to-b from-pink-50 to-purple-50">
          <div className="container px-4 sm:px-6 max-w-4xl">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-gradient">About LoveLens</h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8">
              LoveLens is built on decades of research in emotional intelligence, relationship dynamics, and
              communication patterns.
            </p>
          </div>
        </section>

        <section className="py-10 sm:py-16">
          <div className="container px-4 sm:px-6 max-w-4xl">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gradient">Our Approach</h2>

            <div className="space-y-10 sm:space-y-12">
              <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
                    The Science of Emotional Intelligence
                  </h3>
                  <p className="text-gray-600 mb-3 sm:mb-4">
                    Emotional intelligence is the ability to understand, use, and manage emotions in positive ways. Our
                    analysis is based on the five components of emotional intelligence identified by psychologist Daniel
                    Goleman:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 sm:space-y-2 text-gray-600">
                    <li>Self-awareness: Recognizing your own emotions</li>
                    <li>Self-regulation: Managing your emotions appropriately</li>
                    <li>Motivation: Using emotions to achieve goals</li>
                    <li>Empathy: Understanding others' emotions</li>
                    <li>Social skills: Managing relationships effectively</li>
                  </ul>
                </div>
                <div className="rounded-lg overflow-hidden shadow-lg bg-love-card p-4">
                  <EmotionalIntelligenceDiagram />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
                <div className="order-2 md:order-1 rounded-lg overflow-hidden shadow-lg bg-love-card p-4">
                  <GottmanMethodDiagram />
                </div>
                <div className="order-1 md:order-2">
                  <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">The Gottman Method</h3>
                  <p className="text-gray-600 mb-3 sm:mb-4">
                    Our compatibility analysis is based on Dr. John Gottman's research, which has studied thousands of
                    couples over decades to identify patterns that predict relationship success or failure.
                  </p>
                  <p className="text-gray-600 mb-3 sm:mb-4">
                    Key concepts from the Gottman Method that we analyze include:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 sm:space-y-2 text-gray-600">
                    <li>The Four Horsemen: Criticism, contempt, defensiveness, and stonewalling</li>
                    <li>Emotional bids and turning toward, away, or against</li>
                    <li>Repair attempts during conflict</li>
                    <li>Creating shared meaning</li>
                  </ul>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Our AI Analysis</h3>
                  <p className="text-gray-600 mb-3 sm:mb-4">
                    LoveLens uses advanced artificial intelligence to analyze text conversations and identify patterns
                    in communication. Our AI has been trained on:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 sm:space-y-2 text-gray-600">
                    <li>Sentiment analysis to detect emotional tone</li>
                    <li>Pattern recognition to identify communication styles</li>
                    <li>Linguistic markers of the Four Horsemen and repair attempts</li>
                    <li>Response timing and engagement patterns</li>
                    <li>Emotional bid recognition and response classification</li>
                  </ul>
                </div>
                <div className="rounded-lg overflow-hidden shadow-lg bg-love-card">
                  <img src="/ai-text-analysis.png" alt="AI text analysis" className="w-full h-auto" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-16 bg-love-gradient-darker">
          <div className="container px-4 sm:px-6 max-w-4xl text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gradient">
              Ready to Analyze Your Communication?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-10">
              Upload your text message screenshots and get insights into your emotional intelligence and communication
              patterns.
            </p>
            <Link href="/upload">
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 border-none h-12 px-6"
              >
                Get Started <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-pink-100 py-8 sm:py-10 bg-white bg-opacity-80 backdrop-blur-sm relative z-10">
        <div className="container px-4 sm:px-6 text-center text-gray-500">
          <div className="flex justify-center mb-4">
            <Logo size="medium" withText={false} asLink={false} />
          </div>
          <p>© {new Date().getFullYear()} LoveLens. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
