"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "FAQ", href: "/faq" },
  { name: "Contact", href: "/contact" },
  { name: "Privacy", href: "/privacy" },
  { name: "Terms", href: "/terms" },
]

export default function CompactHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative w-8 h-8">
            <Image
              src="/images/love-lens-logo.png"
              alt="Love Lens Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <span className="font-bold text-xl text-purple-700">Love Lens</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => {
              const uploadSection = document.getElementById("upload-section")
              uploadSection?.scrollIntoView({ behavior: "smooth" })
            }}
          >
            Analyze Now
          </Button>
          <Button variant="outline" size="sm" asChild className="ml-2">
            <Link href="/login">
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Link>
          </Button>
        </nav>

        {/* Mobile menu button */}
        <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile navigation */}
      <div
        className={cn(
          "md:hidden absolute w-full bg-white border-b border-gray-200 shadow-md transition-all duration-300 ease-in-out",
          mobileMenuOpen ? "max-h-screen py-4" : "max-h-0 overflow-hidden py-0",
        )}
      >
        <nav className="container mx-auto px-4 flex flex-col space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-gray-600 hover:text-purple-600 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white w-full"
            onClick={() => {
              const uploadSection = document.getElementById("upload-section")
              uploadSection?.scrollIntoView({ behavior: "smooth" })
              setMobileMenuOpen(false)
            }}
          >
            Analyze Now
          </Button>
          <Button variant="outline" size="sm" asChild className="w-full mt-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
