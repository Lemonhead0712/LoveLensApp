import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import CompactFooter from "@/components/compact-footer"
import CompactHeader from "@/components/compact-header"

interface CompactPageLayoutProps {
  children: ReactNode
  title: string
  description?: string
}

export default function CompactPageLayout({ children, title, description }: CompactPageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-rose-50 to-white">
      <CompactHeader />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
            {description && <p className="mx-auto max-w-2xl text-gray-600 text-sm md:text-base">{description}</p>}
          </div>

          <Card className="mb-8 border-gray-200 p-4 md:p-6 shadow-md">
            <div className="prose prose-sm md:prose-base prose-rose max-w-none">{children}</div>
          </Card>
        </div>
      </main>
      <CompactFooter />
    </div>
  )
}
