import { ArrowRight, Brain, MessageSquare, BarChart3 } from "lucide-react"
import { DebugInfo } from "@/components/debug-info"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      <main className="flex-1 relative z-10">
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-pink-50 to-purple-50">
          <div className="container px-4 sm:px-6 md:px-8 text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
              Understand Your Communication Dynamics
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto">
              Upload screenshots of your text conversations and get real-time emotional intelligence analysis and
              compatibility scores.
            </p>
            <div className="flex justify-center">
              <a href="/upload" className="inline-block">
                <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 border-none h-12 px-8 rounded-md text-white font-medium w-auto mx-auto">
                  Analyze Your Conversations <ArrowRight className="h-4 w-4" />
                </button>
              </a>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 md:py-20">
          <div className="container px-4 sm:px-6 md:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10 md:mb-16 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
              How It Works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
              <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md">
                <div className="bg-gradient-to-r from-pink-300 to-pink-500 p-4 rounded-full mb-4 sm:mb-6">
                  <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Upload Screenshots</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Upload screenshots of your text conversations. Our system supports individual and group chats.
                </p>
              </div>

              <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md">
                <div className="bg-gradient-to-r from-purple-300 to-purple-500 p-4 rounded-full mb-4 sm:mb-6">
                  <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">AI Analysis</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Our AI analyzes communication patterns, emotional tone, and response dynamics in real-time.
                </p>
              </div>

              <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md sm:col-span-2 md:col-span-1">
                <div className="bg-gradient-to-r from-rose-300 to-rose-500 p-4 rounded-full mb-4 sm:mb-6">
                  <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Get Insights</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Receive detailed emotional intelligence scores and Gottman-based compatibility analysis.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 md:py-20">
          <div className="container px-4 sm:px-6 md:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
              Ready to Understand Your Communication?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto">
              Get started now and discover insights about your emotional intelligence and communication compatibility.
            </p>
            <a href="/upload">
              <button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 border-none h-12 px-6 rounded-md text-white font-medium">
                Start Analyzing
              </button>
            </a>
          </div>
        </section>

        <section className="py-8 container px-4 mx-auto">
          <details className="mb-4">
            <summary className="cursor-pointer text-sm text-gray-500">Debug Information</summary>
            <div className="mt-2">
              <DebugInfo />
            </div>
          </details>
        </section>
      </main>

      <footer className="border-t border-pink-100 py-8 sm:py-10 bg-white bg-opacity-80 backdrop-blur-sm relative z-10">
        <div className="container px-4 sm:px-6 text-center text-gray-500">
          <div className="flex justify-center mb-4">
            <div className="text-xl font-bold text-pink-500">LoveLens</div>
          </div>
          <p>© {new Date().getFullYear()} LoveLens. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
