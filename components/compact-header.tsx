"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function CompactHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/images/love-lens-logo.png"
            alt="Love Lens"
            width={36}
            height={36}
            className="h-9 w-9 rounded-full"
          />
          <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Love Lens
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-5">
          <Link
            href="/#upload-section"
            className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
          >
            Analyze
          </Link>
          <Link href="/zodiac" className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors">
            Zodiac
          </Link>
          <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors">
            About
          </Link>
          <Link href="/faq" className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors">
            FAQ
          </Link>
          <Link href="/contact" className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors">
            Contact
          </Link>
        </div>

        <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-white"
          >
            <div className="container mx-auto px-4 py-3 space-y-3">
              <Link
                href="/#upload-section"
                className="block py-1.5 text-gray-700 hover:text-purple-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Analyze
              </Link>
              <Link
                href="/zodiac"
                className="block py-1.5 text-gray-700 hover:text-purple-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Zodiac
              </Link>
              <Link
                href="/about"
                className="block py-1.5 text-gray-700 hover:text-purple-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/faq"
                className="block py-1.5 text-gray-700 hover:text-purple-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              <Link
                href="/contact"
                className="block py-1.5 text-gray-700 hover:text-purple-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
