import { Suspense } from "react"
import Link from "next/link"
import { Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import CompactHeader from "@/components/compact-header"
import CompactFooter from "@/components/compact-footer"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-rose-50 to-white">
      <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200"></div>}>
        <CompactHeader />
      </Suspense>

      <main className="flex-grow flex items-center justify-center">
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto p-8 text-center">
            <div className="mb-6">
              <div className="text-6xl font-bold text-purple-600 mb-2">404</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
              <p className="text-gray-600">
                Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
              </p>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Link>
              </Button>

              <Button variant="outline" asChild className="w-full">
                <Link href="/test">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Try Analysis
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </main>

      <Suspense fallback={<div className="h-16 bg-gray-100"></div>}>
        <CompactFooter />
      </Suspense>
    </div>
  )
}
