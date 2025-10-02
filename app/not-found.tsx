import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Home, Search } from "lucide-react"
import CompactHeader from "@/components/compact-header"
import CompactFooter from "@/components/compact-footer"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <Suspense fallback={<div>Loading...</div>}>
        <CompactHeader />
      </Suspense>
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center border-purple-200">
          <div className="mb-6">
            <Search className="h-16 w-16 text-purple-300 mx-auto" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">The page you're looking for doesn't exist or has been moved.</p>
          <Link href="/">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white w-full">
              <Home className="mr-2 h-5 w-5" />
              Return Home
            </Button>
          </Link>
        </Card>
      </main>
      <Suspense fallback={<div>Loading...</div>}>
        <CompactFooter />
      </Suspense>
    </div>
  )
}
