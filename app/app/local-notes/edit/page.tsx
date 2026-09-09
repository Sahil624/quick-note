'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { NoteEditorPageClient } from '@/components/note-editor-page'

function EditLocalNoteContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  return <NoteEditorPageClient noteId={id ?? undefined} local />
}

export default function EditLocalNotePage() {
  return (
    <Suspense fallback={null}>
      <EditLocalNoteContent />
    </Suspense>
  )
}
