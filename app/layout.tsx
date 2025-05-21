import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { GradientBackground } from "@/components/gradient-background"
import { SparkleEffect } from "@/components/sparkle"
import { Header } from "@/components/header"
import { ApiInitializer } from "@/components/api-initializer"
import { Suspense } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { ErrorBoundary } from "@/components/error-boundary"

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
    <html lang="en" className="overflow-x-hidden">
      <head>
        {/* Preload critical assets */}
        <link rel="preload" href="/LoveLensLogo.png" as="image" />
      </head>
      <body className={`${inter.className} overflow-x-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <GradientBackground>
            <SparkleEffect />
            <div className="min-h-screen flex flex-col relative">
              <Header />
              <main className="flex-1 pt-16">
                <ApiInitializer />
                <ErrorBoundary>
                  <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
                </ErrorBoundary>
              </main>
            </div>
          </GradientBackground>
        </ThemeProvider>
      </body>
    </html>
  )
}
