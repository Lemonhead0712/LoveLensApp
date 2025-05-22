import type React from "react"
import { Suspense } from "react"
import CompactPageLayout from "./compact-page-layout"

interface CompactPageLayoutWrapperProps {
  children: React.ReactNode
  title: string
  description: string
}

export default function CompactPageLayoutWrapper({ children, title, description }: CompactPageLayoutWrapperProps) {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <CompactPageLayout title={title} description={description}>
        {children}
      </CompactPageLayout>
    </Suspense>
  )
}
