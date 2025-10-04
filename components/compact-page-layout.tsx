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
        <div className="container mx-auto px-4 py-6 md:py-10">
          <div className="mb-5 md:mb-6 text-center">
            <h1 className="mb-2 text-2xl md:text-3xl font-bold text-purple-700">{title}</h1>
            {description && <p className="mx-auto max-w-2xl text-gray-600 text-base">{description}</p>}
          </div>

          <Card className="mb-6 border-purple-100 p-5 md:p-6 shadow-md bg-white">
            <div className="prose prose-purple max-w-none">{children}</div>
          </Card>
        </div>
      </main>
      <CompactFooter />
    </div>
  )
}
