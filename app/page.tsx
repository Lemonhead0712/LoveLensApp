import { CircularProgress } from "@/components/circular-progress"
import { Header } from "@/components/header"
import { Logo } from "@/components/logo"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GradientBackground } from "@/components/gradient-background"
import { SparkleEffect } from "@/components/sparkle-effect"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <GradientBackground>
        <SparkleEffect count={20} />
        <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <Logo size="large" withText={true} asLink={false} />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
              Understand Your Relationship Dynamics
            </h1>

            <p className="text-xl text-gray-700 mb-8">
              Upload your conversation screenshots and get insights into your communication patterns, emotional
              intelligence, and relationship dynamics.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg">
                <Link href="/upload">Analyze Your Conversation</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/learn-more">Learn More</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-2">Communication Patterns</h3>
                  <p className="text-gray-600 mb-4">
                    Identify your communication style and understand how it affects your relationships.
                  </p>
                  <CircularProgress value={75} label="Communication Score" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-2">Emotional Intelligence</h3>
                  <p className="text-gray-600 mb-4">
                    Measure your emotional awareness and ability to express feelings effectively.
                  </p>
                  <CircularProgress value={82} label="EQ Score" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-2">Relationship Dynamics</h3>
                  <p className="text-gray-600 mb-4">
                    Discover patterns in your interactions and how they shape your relationship.
                  </p>
                  <CircularProgress value={68} label="Dynamics Score" />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </GradientBackground>
    </div>
  )
}
