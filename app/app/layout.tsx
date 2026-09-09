'use client'

import React from "react"

import { NotesProvider } from '@/lib/notes-context'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NotesProvider>
      {children}
    </NotesProvider>
  )
}
