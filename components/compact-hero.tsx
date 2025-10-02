"use client"

import { Button } from "@/components/ui/button"
import { scrollToSection } from "@/lib/scroll-utils"
import Image from "next/image"

export default function CompactHero() {
  return (
    <div className="bg-gradient-to-r from-purple-100 to-pink-50 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <div className="relative w-20 h-20">
              <Image
                src="/images/love-lens-logo.png"
                alt="Love Lens Logo"
                width={80}
                height={80}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
            <span className="text-purple-700">Love Lens:</span> Relationship Insight Engine
          </h1>
          <p className="text-base md:text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Gain profound insights into your relationship dynamics through AI-powered conversation analysis.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => scrollToSection("upload-section")}
            >
              Analyze Your Conversation
            </Button>
            <Button
              variant="outline"
              className="border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent"
              onClick={() => scrollToSection("how-it-works")}
            >
              How It Works
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
