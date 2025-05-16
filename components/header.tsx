"use client"

import Link from "next/link"
import { MobileMenu } from "./mobile-menu"
import { Button } from "@/components/ui/button-override"
import { Logo } from "./logo"

export function Header() {
  const navItems = [
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo size="small" />
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium">
            Home
          </Link>
          <Link href="/about" className="text-sm font-medium">
            About
          </Link>
          <Link href="/upload">
            <Button className="bg-pink-500 hover:bg-pink-600 text-white border-none">Get Started</Button>
          </Link>
        </nav>

        {/* Mobile menu */}
        <div className="md:hidden">
          <MobileMenu items={navItems} />
        </div>
      </div>
    </header>
  )
}
