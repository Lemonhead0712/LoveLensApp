import type React from "react"
import CompactHeader from "./compact-header"
import CompactFooter from "./compact-footer"

interface CompactPageLayoutProps {
  title: string
  description: string
  children: React.ReactNode
}

export default function CompactPageLayout({ title, description, children }: CompactPageLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <CompactHeader />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-3 text-purple-800">{title}</h1>
            <p className="text-gray-600">{description}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-8">{children}</div>
        </div>
      </main>
      <CompactFooter />
    </div>
  )
}
