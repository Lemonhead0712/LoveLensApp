"use client"

import { Suspense } from "react"
import CompactPageLayout from "./compact-page-layout"
import type { CompactPageLayoutProps } from "./compact-page-layout"

export default function CompactPageLayoutWrapper(props: CompactPageLayoutProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-center">
            <h1 className="text-2xl font-bold">{props.title}</h1>
            <p className="text-gray-500 mt-2">Loading...</p>
          </div>
        </div>
      }
    >
      <CompactPageLayout {...props} />
    </Suspense>
  )
}
