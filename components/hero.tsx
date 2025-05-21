"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function Hero() {
  return (
    <div className="bg-gradient-to-r from-rose-100 to-rose-50 py-16">
      <div className="container mx-auto px-4">
        <Card className="overflow-hidden border-rose-200 bg-white/80 backdrop-blur-sm">
          <div className="p-8 md:p-12 flex flex-col items-center text-center">
            <h1 className="mb-8 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              <span className="text-rose-600">Love Lens:</span> Relationship Insight Engine
            </h1>

            <p className="mb-8 text-lg text-gray-600 max-w-3xl mx-auto">
              Gain profound insights into your relationship dynamics through AI-powered conversation analysis.
              Understand patterns, improve communication, and strengthen your connection—all while maintaining complete
              privacy.
            </p>

            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Button
                className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-5 text-base"
                onClick={() => {
                  const uploadSection = document.getElementById("upload-section")
                  uploadSection?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                Analyze Your Conversation
              </Button>

              <Button
                variant="outline"
                className="border-rose-200 text-rose-600 hover:bg-rose-50 px-6 py-5 text-base"
                onClick={() => {
                  const howItWorks = document.getElementById("how-it-works")
                  howItWorks?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                Learn How It Works
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
