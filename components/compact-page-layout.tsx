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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <CompactHeader />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="mb-6 md:mb-8 text-center">
            <h1 className="mb-3 text-3xl md:text-4xl font-bold text-purple-700">{title}</h1>
            {description && <p className="mx-auto max-w-2xl text-gray-600 text-base md:text-lg">{description}</p>}
          </div>

          <Card className="mb-8 border-purple-100 p-6 md:p-8 shadow-md bg-white">
            <div className="prose prose-purple max-w-none">{children}</div>
          </Card>
        </div>
      </main>
      <CompactFooter />
    </div>
  )
}
