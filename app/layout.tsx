import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Love Lens - Relationship Analysis",
  description: "Analyze your relationship conversations for deeper insights",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <Script id="monaco-env" strategy="beforeInteractive">
          {`
            self.MonacoEnvironment = {
              getWorkerUrl: function (moduleId, label) {
                if (label === 'json') {
                  return '/monaco-editor/json.worker.js';
                }
                if (label === 'css' || label === 'scss' || label === 'less') {
                  return '/monaco-editor/css.worker.js';
                }
                if (label === 'html' || label === 'handlebars' || label === 'razor') {
                  return '/monaco-editor/html.worker.js';
                }
                if (label === 'typescript' || label === 'javascript') {
                  return '/monaco-editor/ts.worker.js';
                }
                return '/monaco-editor/editor.worker.js';
              }
            };
          `}
        </Script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
