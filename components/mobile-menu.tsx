"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button-override"
import { X, Menu } from "lucide-react"
import Image from "next/image"

interface NavItem {
  label: string
  href: string
  isButton?: boolean
}

interface MobileMenuProps {
  items?: NavItem[]
}

// Define navigation items to match the screenshot
const defaultNavItems: NavItem[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Get Started",
    href: "/upload",
    isButton: true,
  },
]

function MobileMenu({ items = defaultNavItems }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Prevent body scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="p-2 h-10 w-10 flex items-center justify-center"
        onClick={toggleMenu}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        {!isOpen && <Menu className="h-6 w-6" />}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-white">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 relative">
                <Image src="/LoveLensLogo.png" alt="LoveLens Logo" fill className="object-contain" />
              </div>
              <span className="font-bold text-xl">LoveLens</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-10 w-10 flex items-center justify-center"
              onClick={toggleMenu}
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <nav className="flex justify-end items-center h-16 gap-6 px-4">
            <Link href="/" className="text-base font-medium" onClick={() => setIsOpen(false)}>
              Home
            </Link>
            <Link href="/about" className="text-base font-medium" onClick={() => setIsOpen(false)}>
              About
            </Link>
            <Link href="/upload" onClick={() => setIsOpen(false)}>
              <Button className="bg-pink-500 hover:bg-pink-600 text-white border-none">Get Started</Button>
            </Link>
          </nav>
        </div>
      )}
    </div>
  )
}

export default MobileMenu
