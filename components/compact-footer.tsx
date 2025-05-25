import Link from "next/link"
import Image from "next/image"

export default function CompactFooter() {
  return (
    <footer className="bg-purple-900 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center mb-4">
            <div className="relative w-8 h-8 mr-2">
              <Image
                src="/images/love-lens-logo.png"
                alt="Love Lens Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <h3 className="text-lg font-bold">Love Lens</h3>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4">
            <Link href="/about" className="text-sm text-purple-200 hover:text-pink-300 transition-colors">
              About
            </Link>
            <Link href="/privacy" className="text-sm text-purple-200 hover:text-pink-300 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-purple-200 hover:text-pink-300 transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="text-sm text-purple-200 hover:text-pink-300 transition-colors">
              Contact
            </Link>
            <Link href="/faq" className="text-sm text-purple-200 hover:text-pink-300 transition-colors">
              FAQ
            </Link>
          </div>

          <div className="text-purple-300 text-xs">
            <p>© {new Date().getFullYear()} Love Lens. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
