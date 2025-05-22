import type React from "react"
import { Suspense } from "react"
import CompactHeader from "@/components/compact-header"
import CompactFooter from "@/components/compact-footer"

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200"></div>}>
        <CompactHeader />
      </Suspense>

      {children}

      <Suspense fallback={<div className="h-16 bg-gray-100"></div>}>
        <CompactFooter />
      </Suspense>
    </>
  )
}
