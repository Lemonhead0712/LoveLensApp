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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white overflow-x-hidden">
      <CompactHeader />
      <main className="flex-grow w-full overflow-x-hidden">
        <div className="container mx-auto px-4 py-6 md:py-10 max-w-full">
          <div className="mb-5 md:mb-6 text-center px-4">
            <h1 className="mb-2 text-2xl md:text-3xl font-bold text-purple-700 text-balance">{title}</h1>
            {description && <p className="mx-auto max-w-2xl text-gray-600 text-sm md:text-base">{description}</p>}
          </div>

          <Card className="mb-6 border-purple-100 p-4 md:p-6 shadow-md bg-white mx-auto max-w-5xl">
            <div className="prose prose-purple prose-sm md:prose-base max-w-none overflow-x-hidden">{children}</div>
          </Card>
        </div>
      </main>
      <CompactFooter />
    </div>
  )
}
