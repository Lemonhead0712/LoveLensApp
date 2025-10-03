import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"
import EnhancedScrollToTop from "@/components/enhanced-scroll-to-top"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Love Lens - Relationship Insight",
  description: "Analyze relationship conversations for emotional patterns and insights",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Suspense fallback={null}>
            <EnhancedScrollToTop />
          </Suspense>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
