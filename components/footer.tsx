import { HeartHandshake } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center text-center">
          <HeartHandshake className="h-10 w-10 text-rose-400 mb-4" />
          <h3 className="text-2xl font-bold mb-2">Love Lens</h3>
          <p className="text-gray-400 max-w-md mb-8">
            Helping couples understand their relationship dynamics through AI-powered conversation analysis.
          </p>

          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <Link href="/about" className="text-gray-300 hover:text-rose-400 transition-colors">
              About
            </Link>
            <Link href="/privacy" className="text-gray-300 hover:text-rose-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-300 hover:text-rose-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-rose-400 transition-colors">
              Contact
            </Link>
            <Link href="/faq" className="text-gray-300 hover:text-rose-400 transition-colors">
              FAQ
            </Link>
          </div>

          <div className="text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} Love Lens. All rights reserved.</p>
            <p className="mt-1">Your conversations remain private and are never stored.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
