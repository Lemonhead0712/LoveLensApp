import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LoveLens - Emotional Intelligence Analysis",
  description: "Analyze your conversations and improve your emotional intelligence",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  generator: "v0.dev",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <div className="min-h-screen flex flex-col">
          <header className="bg-white shadow-sm py-4">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center">
                <a href="/" className="text-xl font-bold text-pink-500">
                  LoveLens
                </a>
                <nav className="hidden md:flex space-x-4">
                  <a href="/upload" className="text-gray-600 hover:text-pink-500">
                    Analyze
                  </a>
                  <a href="/about" className="text-gray-600 hover:text-pink-500">
                    About
                  </a>
                </nav>
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  )
}
