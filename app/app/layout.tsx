'use client'

import React from "react"

import { AuthProvider } from '@/lib/auth-context'
import { NotesProvider } from '@/lib/notes-context'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <NotesProvider>
        {children}
      </NotesProvider>
    </AuthProvider>
  )
}
