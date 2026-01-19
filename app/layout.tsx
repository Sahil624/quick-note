import React from "react"
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'QuickNote - Fast, Minimal Note Taking',
  description: 'A minimal, flat-themed note-taking app with Markdown, Mermaid diagrams, and Math support. Create, organize, and share your notes effortlessly.',
  keywords: ['notes', 'markdown', 'mermaid', 'diagrams', 'math', 'note-taking', 'productivity'],
  authors: [{ name: 'QuickNote' }],
  openGraph: {
    title: 'QuickNote - Fast, Minimal Note Taking',
    description: 'A minimal, flat-themed note-taking app with Markdown, Mermaid diagrams, and Math support.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuickNote - Fast, Minimal Note Taking',
    description: 'A minimal, flat-themed note-taking app with Markdown, Mermaid diagrams, and Math support.',
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
