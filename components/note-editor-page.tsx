'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { NoteEditor } from '@/components/note-editor'
import { useAuth } from '@/lib/auth-context'
import { useNotes } from '@/lib/notes-context'
import { takeNoteDraft, noteEditorHref, diagramEditorHref } from '@/lib/editor-dialog'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import { Note } from '@/lib/types'

type Props = {
  noteId?: string
  local?: boolean
}

export function NoteEditorPageClient({ noteId, local = false }: Props) {
  const router = useRouter()
  const { isAnonymous } = useAuth()
  const {
    notes,
    localNotes,
    folders,
    diagrams,
    loading,
    createNote,
    updateNote,
    deleteNote,
    createLocalNote,
    updateLocalNote,
    deleteLocalNote,
  } = useNotes()

  const [draftReady, setDraftReady] = useState(false)
  const [draft, setDraft] = useState<{
    title: string
    content: string
    tags: string[]
    folderId: string | null
    linkedArtifacts: string[]
  } | null>(null)
  const [activeId, setActiveId] = useState<string | undefined>(noteId)

  useEffect(() => {
    setActiveId(noteId)
  }, [noteId])

  const existingNote = useMemo(() => {
    if (!activeId) return null
    if (local) return localNotes.find((n) => n.id === activeId) ?? null
    return notes.find((n) => n.id === activeId) ?? null
  }, [activeId, local, notes, localNotes])

  useEffect(() => {
    const stashed = takeNoteDraft()
    if (stashed) {
      const matches =
        (!noteId && !stashed.noteId) ||
        (noteId && stashed.noteId === noteId && Boolean(stashed.local) === local)
      if (matches) {
        setDraft({
          title: stashed.title,
          content: stashed.content,
          tags: stashed.tags,
          folderId: stashed.folderId,
          linkedArtifacts: stashed.linkedArtifacts,
        })
      }
    }
    setDraftReady(true)
  }, [noteId, local])

  const goBack = useCallback(() => {
    if (local || isAnonymous) {
      router.push('/app')
      return
    }
    router.push('/app/notes')
  }, [router, local, isAnonymous])

  const handleSave = useCallback(async (
    data: {
      title: string
      content: string
      tags: string[]
      folderId: string | null
      linkedArtifacts: string[]
    },
    options?: { reason?: 'manual' | 'autosave' }
  ) => {
    const autosave = options?.reason === 'autosave'
    try {
      if (local || isAnonymous) {
        if (activeId) {
          updateLocalNote(activeId, { title: data.title, content: data.content })
        } else {
          const id = createLocalNote(data.title, data.content)
          setActiveId(id)
          if (autosave) return
        }
        if (!autosave) router.push('/app')
        return
      }

      if (activeId) {
        await updateNote(activeId, data, { createVersion: !autosave })
      } else {
        const id = await createNote(data.title, data.content, data.folderId, data.tags, data.linkedArtifacts)
        setActiveId(id)
        if (autosave) return
      }
      if (!autosave) router.push('/app/notes')
    } catch (error) {
      console.error('Error saving note:', error)
      throw error
    }
  }, [local, isAnonymous, activeId, updateLocalNote, createLocalNote, updateNote, createNote, router])

  const handleDelete = useCallback(async () => {
    if (!activeId) return
    try {
      if (local || isAnonymous) {
        deleteLocalNote(activeId)
        router.push('/app')
        return
      }
      await deleteNote(activeId)
      router.push('/app/notes')
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }, [activeId, local, isAnonymous, deleteLocalNote, deleteNote, router])

  if (!local && isAnonymous) {
    return (
      <div className="h-screen flex bg-background">
        <AppSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-foreground mb-2">Sign in to edit cloud notes</h1>
            <Button asChild>
              <a href="/app/login">Sign In</a>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (!draftReady || (noteId && loading && !existingNote && !local)) {
    return (
      <div className="h-screen flex bg-background">
        <AppSidebar />
        <main className="flex-1" />
      </div>
    )
  }

  if (noteId && !existingNote && !draft) {
    return (
      <div className="h-screen flex bg-background">
        <AppSidebar onNewNote={() => router.push(noteEditorHref())} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Note not found.</p>
            <Button onClick={goBack}>Back</Button>
          </div>
        </main>
      </div>
    )
  }

  const cloudNote = !local && existingNote ? (existingNote as Note) : null

  return (
    <div className="h-screen flex bg-background">
      <AppSidebar
        onNewNote={() => router.push(noteEditorHref({ local: local || isAnonymous }))}
        onNewDiagram={() => router.push(diagramEditorHref())}
      />
      <main className="flex-1 min-w-0 min-h-0 overflow-hidden">
        <NoteEditor
          key={`${local ? 'local' : 'cloud'}-${noteId ?? 'new'}-${draft ? 'draft' : 'base'}`}
          initialTitle={draft?.title ?? existingNote?.title ?? ''}
          initialContent={draft?.content ?? existingNote?.content ?? ''}
          initialTags={draft?.tags ?? cloudNote?.tags ?? []}
          initialFolderId={draft?.folderId ?? cloudNote?.folderId ?? null}
          initialLinkedArtifacts={draft?.linkedArtifacts ?? cloudNote?.linkedArtifacts ?? []}
          folders={folders}
          diagrams={diagrams}
          onSave={handleSave}
          onCancel={goBack}
          onDelete={activeId ? handleDelete : undefined}
          isAnonymous={local || isAnonymous}
        />
      </main>
    </div>
  )
}
