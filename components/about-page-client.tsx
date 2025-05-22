"use client"

import type React from "react"

import { Suspense } from "react"
import CompactPageLayout from "./compact-page-layout"

interface AboutPageClientProps {
  children: React.ReactNode
}

export default function AboutPageClient({ children }: AboutPageClientProps) {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <CompactPageLayout
        title="About Love Lens"
        description="Learn about our mission, vision, and the team behind Love Lens"
      >
        {children}
      </CompactPageLayout>
    </Suspense>
  )
}
