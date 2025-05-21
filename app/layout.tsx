import type React from "react"
import "./globals.css"
import "./custom-styles.css"
import "./mobile-styles.css"
import { Inter } from "next/font/google"
import { ApiInitializer } from "@/components/api-initializer"
import { ApiProvider } from "@/lib/api-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "LoveLens - Emotional Intelligence Analysis for Relationships",
  description: "Analyze your text conversations for emotional intelligence and relationship dynamics",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ApiProvider>
          <ApiInitializer>{children}</ApiInitializer>
        </ApiProvider>
      </body>
    </html>
  )
}
