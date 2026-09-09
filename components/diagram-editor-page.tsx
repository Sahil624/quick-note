'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { DiagramEditor } from '@/components/diagram-editor'
import { useAuth } from '@/lib/auth-context'
import { useNotes } from '@/lib/notes-context'
import { takeDiagramDraft, noteEditorHref, diagramEditorHref } from '@/lib/editor-dialog'
import { Button } from '@/components/ui/button'
import { GitBranch } from 'lucide-react'

type Props = {
  diagramId?: string
}

export function DiagramEditorPageClient({ diagramId }: Props) {
  const router = useRouter()
  const { isAnonymous } = useAuth()
  const {
    diagrams,
    folders,
    loading,
    createDiagram,
    updateDiagram,
    deleteDiagram,
  } = useNotes()

  const [draftReady, setDraftReady] = useState(false)
  const [draft, setDraft] = useState<{
    title: string
    content: string
    tags: string[]
    folderId: string | null
  } | null>(null)
  const [activeId, setActiveId] = useState<string | undefined>(diagramId)

  useEffect(() => {
    setActiveId(diagramId)
  }, [diagramId])

  const existingDiagram = useMemo(
    () => (activeId ? diagrams.find((d) => d.id === activeId) ?? null : null),
    [activeId, diagrams]
  )

  useEffect(() => {
    const stashed = takeDiagramDraft()
    if (stashed) {
      const matches = (!diagramId && !stashed.diagramId) || (diagramId && stashed.diagramId === diagramId)
      if (matches) {
        setDraft({
          title: stashed.title,
          content: stashed.content,
          tags: stashed.tags,
          folderId: stashed.folderId,
        })
      }
    }
    setDraftReady(true)
  }, [diagramId])

  const goBack = useCallback(() => {
    router.push('/app/diagrams')
  }, [router])

  const handleSave = useCallback(async (
    data: {
      title: string
      content: string
      tags: string[]
      folderId: string | null
    },
    options?: { reason?: 'manual' | 'autosave' }
  ) => {
    const autosave = options?.reason === 'autosave'
    try {
      if (activeId) {
        await updateDiagram(activeId, data)
      } else {
        const id = await createDiagram(data.title, data.content, data.folderId, data.tags)
        setActiveId(id)
        if (autosave) return
      }
      if (!autosave) router.push('/app/diagrams')
    } catch (error) {
      console.error('Error saving diagram:', error)
      throw error
    }
  }, [activeId, updateDiagram, createDiagram, router])

  const handleDelete = useCallback(async () => {
    if (!activeId) return
    try {
      await deleteDiagram(activeId)
      router.push('/app/diagrams')
    } catch (error) {
      console.error('Error deleting diagram:', error)
    }
  }, [activeId, deleteDiagram, router])

  if (isAnonymous) {
    return (
      <div className="h-screen flex bg-background">
        <AppSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <GitBranch className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-foreground mb-2">Sign in to edit diagrams</h1>
            <Button asChild>
              <a href="/app/login">Sign In</a>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (!draftReady || (diagramId && loading && !existingDiagram)) {
    return (
      <div className="h-screen flex bg-background">
        <AppSidebar />
        <main className="flex-1" />
      </div>
    )
  }

  if (diagramId && !existingDiagram && !draft) {
    return (
      <div className="h-screen flex bg-background">
        <AppSidebar onNewDiagram={() => router.push(diagramEditorHref())} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Diagram not found.</p>
            <Button onClick={goBack}>Back</Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-background">
      <AppSidebar
        onNewNote={() => router.push(noteEditorHref())}
        onNewDiagram={() => router.push(diagramEditorHref())}
      />
      <main className="flex-1 min-w-0 min-h-0 overflow-hidden">
        <DiagramEditor
          key={`${diagramId ?? 'new'}-${draft ? 'draft' : 'base'}`}
          initialTitle={draft?.title ?? existingDiagram?.title ?? ''}
          initialContent={draft?.content ?? existingDiagram?.content ?? ''}
          initialTags={draft?.tags ?? existingDiagram?.tags ?? []}
          initialFolderId={draft?.folderId ?? existingDiagram?.folderId ?? null}
          folders={folders}
          onSave={handleSave}
          onCancel={goBack}
          onDelete={activeId ? handleDelete : undefined}
        />
      </main>
    </div>
  )
}
