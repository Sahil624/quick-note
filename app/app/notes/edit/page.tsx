'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { NoteEditorPageClient } from '@/components/note-editor-page'

function EditNoteContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  return <NoteEditorPageClient noteId={id ?? undefined} />
}

export default function EditNotePage() {
  return (
    <Suspense fallback={null}>
      <EditNoteContent />
    </Suspense>
  )
}
