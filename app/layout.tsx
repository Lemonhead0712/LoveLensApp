import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import EnhancedScrollToTop from "@/components/enhanced-scroll-to-top"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Love Lens - Relationship Insight",
  description: "Analyze relationship conversations for emotional patterns and insights",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script id="monaco-environment" strategy="beforeInteractive">
          {`
            self.MonacoEnvironment = {
              getWorkerUrl: function (moduleId, label) {
                if (label === 'json') {
                  return './json.worker.bundle.js';
                }
                if (label === 'css' || label === 'scss' || label === 'less') {
                  return './css.worker.bundle.js';
                }
                if (label === 'html' || label === 'handlebars' || label === 'razor') {
                  return './html.worker.bundle.js';
                }
                if (label === 'typescript' || label === 'javascript') {
                  return './ts.worker.bundle.js';
                }
                return './editor.worker.bundle.js';
              }
            };
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <EnhancedScrollToTop />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
