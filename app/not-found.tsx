import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Home, Search, HeartHandshake } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      {/* Simple static header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <HeartHandshake className="h-8 w-8 text-purple-600" />
            <span className="font-bold text-xl text-purple-700">Love Lens</span>
          </Link>
          <Link href="/">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">Home</Button>
          </Link>
        </div>
      </header>

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

      {/* Simple static footer */}
      <footer className="bg-purple-900 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex items-center mb-4">
              <HeartHandshake className="h-8 w-8 mr-2 text-purple-300" />
              <h3 className="text-lg font-bold">Love Lens</h3>
            </div>
            <div className="text-purple-300 text-xs">
              <p>© {new Date().getFullYear()} Love Lens. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
