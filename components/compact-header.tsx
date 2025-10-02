"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { scrollToSection } from "@/lib/scroll-utils"
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
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Track scroll position for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleAnalyzeClick = () => {
    setMobileMenuOpen(false)
    if (pathname === "/") {
      // On home page, scroll to section
      scrollToSection("upload-section")
    } else {
      // On other pages, navigate to home with hash
      window.location.href = "/#upload-section"
    }
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b transition-shadow duration-200",
        isScrolled ? "border-gray-200 shadow-md" : "border-gray-200 shadow-sm",
      )}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <div className="relative w-8 h-8">
            <Image
              src="/images/love-lens-logo.png"
              alt="Love Lens Logo"
              width={32}
              height={32}
              className="object-contain"
              priority
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
              className={cn(
                "text-sm font-medium transition-colors hover:text-purple-600",
                pathname === link.href ? "text-purple-600" : "text-gray-600",
              )}
            >
              {link.name}
            </Link>
          ))}
          <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleAnalyzeClick}>
            Analyze Now
          </Button>
        </nav>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile navigation */}
      <div
        className={cn(
          "md:hidden absolute w-full bg-white border-b border-gray-200 shadow-md transition-all duration-300 ease-in-out overflow-hidden",
          mobileMenuOpen ? "max-h-screen py-4" : "max-h-0 py-0",
        )}
      >
        <nav className="container mx-auto px-4 flex flex-col space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "text-gray-600 hover:text-purple-600 transition-colors py-2",
                pathname === link.href && "text-purple-600 font-semibold",
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <Button className="bg-purple-600 hover:bg-purple-700 text-white w-full" onClick={handleAnalyzeClick}>
            Analyze Now
          </Button>
        </nav>
      </div>
    </header>
  )
}
