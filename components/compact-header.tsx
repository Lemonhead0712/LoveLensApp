"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function CompactHeader() {
  const pathname = usePathname()

  return (
    <header className="bg-white border-b border-gray-200 py-3">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold text-rose-600">Love Lens</span>
        </Link>
        <nav className="hidden md:flex space-x-1">
          <NavLink href="/" active={pathname === "/"}>
            Home
          </NavLink>
          <NavLink href="/about" active={pathname === "/about"}>
            About
          </NavLink>
          <NavLink href="/faq" active={pathname === "/faq"}>
            FAQ
          </NavLink>
          <NavLink href="/contact" active={pathname === "/contact"}>
            Contact
          </NavLink>
          <Button asChild size="sm" className="ml-2">
            <Link href="/test">Analyze Now</Link>
          </Button>
        </nav>
        <Button asChild size="sm" className="md:hidden">
          <Link href="/test">Analyze</Link>
        </Button>
      </div>
    </header>
  )
}

interface NavLinkProps {
  href: string
  active: boolean
  children: React.ReactNode
}

function NavLink({ href, active, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
        active ? "bg-rose-50 text-rose-600" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
      )}
    >
      {children}
    </Link>
  )
}
