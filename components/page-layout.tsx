import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import Footer from "@/components/footer"
import { HeartHandshake } from "lucide-react"
import Link from "next/link"

interface PageLayoutProps {
  children: ReactNode
  title: string
  description?: string
}

export default function PageLayout({ children, title, description }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white overflow-x-hidden">
      <div className="container mx-auto px-4 py-12 max-w-full">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
              <HeartHandshake className="h-8 w-8 text-rose-600" />
            </div>
          </Link>
          <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">{title}</h1>
          {description && <p className="mx-auto max-w-2xl text-lg text-gray-600 px-4">{description}</p>}
        </div>

        <Card className="mb-12 border-gray-200 p-8 shadow-md max-w-full">
          <div className="prose prose-rose max-w-none overflow-x-hidden">{children}</div>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
