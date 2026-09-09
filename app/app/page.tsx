'use client'

import { useState, useCallback } from 'react'
import { Plus, FileText, GitBranch, Clock, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AppSidebar } from '@/components/app-sidebar'
import { NoteEditor } from '@/components/note-editor'
import { DiagramEditor } from '@/components/diagram-editor'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { useAuth } from '@/lib/auth-context'
import { useNotes } from '@/lib/notes-context'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Diagram, LocalNote, Note } from '@/lib/types'
import {
  EDITOR_DIALOG_CONTENT_CLASS,
  stashNoteDraft,
  stashDiagramDraft,
  noteEditorHref,
  diagramEditorHref,
} from '@/lib/editor-dialog'
import { useRouter } from 'next/navigation'

type EditorMode = 'none' | 'note' | 'diagram' | 'local-note'

export default function AppPage() {
  const router = useRouter()
  const { user, isAnonymous } = useAuth()
  const {
    notes,
    diagrams,
    folders,
    localNotes,
    createNote,
    updateNote,
    deleteNote,
    createDiagram,
    updateDiagram,
    deleteDiagram,
    createLocalNote,
    updateLocalNote,
    deleteLocalNote,
    shareLocalNote,
    permissionError,
  } = useNotes()

  const [editorMode, setEditorMode] = useState<EditorMode>('none')
  const [editingLocalNoteId, setEditingLocalNoteId] = useState<string | null>(null)
  const [editingDiagram, setEditingDiagram] = useState<Diagram | null>(null)
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  const handleNewNote = useCallback(() => {
    if (isAnonymous) {
      setEditorMode('local-note')
    } else {
      setEditorMode('note')
    }
  }, [isAnonymous])

  const handleEditNote = useCallback((note: Note | LocalNote) => {
    if (isAnonymous) {
      setEditorMode('local-note')
      setEditingLocalNoteId(note.id)
    } else {
      setEditorMode('note')
      setEditingNote(note as Note)
    }
  }, [isAnonymous])

  const handleEditDiagram = useCallback((diagram: Diagram) => {
    setEditingDiagram(diagram)
    setEditorMode('diagram')
  }, [])

  const handleDeleteNote = useCallback(() => {
    if (isAnonymous) {
      deleteLocalNote(editingLocalNoteId!)
    } else {
      deleteNote(editingNote!.id)
    }
    setEditorMode('none')
  }, [editingNote])

  const handleNewDiagram = useCallback(() => {
    setEditorMode('diagram')
  }, [])

  const handleSaveNote = useCallback(async (
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
      if (editingNote) {
        await updateNote(editingNote.id, data, { createVersion: !autosave })
      } else {
        const id = await createNote(data.title, data.content, data.folderId, data.tags, data.linkedArtifacts)
        if (autosave) {
          setEditingNote({
            id,
            title: data.title,
            content: data.content,
            tags: data.tags,
            folderId: data.folderId,
            linkedArtifacts: data.linkedArtifacts,
          } as Note)
          return
        }
      }
      if (!autosave) {
        setEditorMode('none')
        setEditingNote(null)
      }
    } catch (error) {
      console.error('Error creating note:', error)
      throw error
    }
  }, [createNote, editingNote, updateNote])

  const handleSaveDiagram = useCallback(async (
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
      if (editingDiagram) {
        await updateDiagram(editingDiagram.id, data)
      } else {
        const id = await createDiagram(data.title, data.content, data.folderId, data.tags)
        if (autosave) {
          setEditingDiagram({
            id,
            title: data.title,
            content: data.content,
            tags: data.tags,
            folderId: data.folderId,
            diagramType: 'mermaid',
          } as Diagram)
          return
        }
      }
      if (!autosave) {
        setEditorMode('none')
        setEditingDiagram(null)
      }
    } catch (error) {
      console.error('Error creating diagram:', error)
      throw error
    }
  }, [createDiagram, editingDiagram, updateDiagram])

  const handleDeleteDiagram = useCallback(() => {
    if (!editingDiagram) return
    deleteDiagram(editingDiagram.id)
    setEditorMode('none')
    setEditingDiagram(null)
  }, [deleteDiagram, editingDiagram])

  const handleSaveLocalNote = useCallback((
    data: { title: string; content: string },
    options?: { reason?: 'manual' | 'autosave' }
  ) => {
    const autosave = options?.reason === 'autosave'
    if (editingLocalNoteId) {
      updateLocalNote(editingLocalNoteId, { title: data.title, content: data.content })
    } else {
      const id = createLocalNote(data.title, data.content)
      if (autosave) {
        setEditingLocalNoteId(id)
        return
      }
    }
    if (!autosave) {
      setEditingLocalNoteId(null)
      setEditorMode('none')
    }
  }, [createLocalNote, updateLocalNote, editingLocalNoteId])

  const handleEditLocalNote = useCallback((id: string) => {
    setEditingLocalNoteId(id)
    setEditorMode('local-note')
  }, [])

  const handleShareLocalNote = useCallback(async (id: string) => {
    try {
      const publicId = await shareLocalNote(id)
      const url = `${window.location.origin}/share/${publicId}`
      await navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    } catch (error) {
      console.error('Error sharing note:', error)
    }
  }, [shareLocalNote])

  const editingLocalNote = editingLocalNoteId
    ? localNotes.find(n => n.id === editingLocalNoteId)
    : null

  const recentNotes = isAnonymous
    ? localNotes.slice(0, 5)
    : notes.slice(0, 5)

  const recentDiagrams = diagrams.slice(0, 3)

  return (
    <div className="h-screen flex bg-background">
      <AppSidebar onNewNote={handleNewNote} onNewDiagram={handleNewDiagram} />

      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-5xl mx-auto">
          {permissionError && (
            <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {permissionError}
            </div>
          )}
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              {isAnonymous ? 'Welcome to QuickNote' : `Welcome back${user?.displayName ? `, ${user.displayName}` : ''}`}
            </h1>
            <p className="text-muted-foreground">
              {isAnonymous
                ? 'Your notes are saved locally. Sign in for cloud sync and more features.'
                : 'Your notes are synced across all your devices.'
              }
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={handleNewNote}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">New Note</CardTitle>
                  <CardDescription className="text-sm">Create a new markdown note</CardDescription>
                </div>
              </CardContent>
            </Card>

            {!isAnonymous && (
              <Card
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={handleNewDiagram}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <GitBranch className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">New Diagram</CardTitle>
                    <CardDescription className="text-sm">Create a mermaid diagram</CardDescription>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-muted/30 border-dashed">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base text-muted-foreground">
                    {isAnonymous ? localNotes.length : notes.length + diagrams.length}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {isAnonymous ? 'Local notes' : 'Total items'}
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Notes */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-foreground">Recent Notes</h2>
              {!isAnonymous && notes.length > 5 && (
                <Button variant="link" size="sm" asChild>
                  <a href="/app/notes">View all</a>
                </Button>
              )}
            </div>
            {recentNotes.length === 0 ? (
              <Card className="border-dashed" onClick={handleNewNote}>
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No notes yet. Create your first note!</p>
                  <Button className="mt-4" onClick={handleNewNote}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Note
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {recentNotes.map((note) => (
                  <Card
                    key={note.id}
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => handleEditNote(note)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate">{note.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {note.content.substring(0, 150)}...
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(note.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        {isAnonymous && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleShareLocalNote(note.id)
                            }}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Diagrams (for logged in users) */}
          {!isAnonymous && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-foreground">Recent Diagrams</h2>
                {diagrams.length > 3 && (
                  <Button variant="link" size="sm" asChild>
                    <a href="/app/diagrams">View all</a>
                  </Button>
                )}
              </div>
              {recentDiagrams.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <GitBranch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No diagrams yet. Create your first diagram!</p>
                    <Button className="mt-4" onClick={handleNewDiagram}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Diagram
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  {recentDiagrams.map((diagram) => (
                    <Card key={diagram.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => handleEditDiagram(diagram)}>
                      <CardContent className="p-4">
                        <h3 className="font-medium text-foreground truncate mb-2">{diagram.title}</h3>
                        <div className="h-32 bg-muted/50 rounded-lg overflow-hidden flex items-center justify-center">
                          <MarkdownRenderer content={`\`\`\`mermaid\n${diagram.content}\n\`\`\``} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Editor Dialog */}
      <Dialog open={editorMode !== 'none'} onOpenChange={(open) => !open && setEditorMode('none')}>
        <DialogContent className={EDITOR_DIALOG_CONTENT_CLASS} showCloseButton={false}>
          <DialogTitle className="sr-only">
            {editorMode === 'diagram' ? 'Edit diagram' : 'Edit note'}
          </DialogTitle>
          {editorMode === 'note' && (
            <NoteEditor
              folders={folders}
              diagrams={diagrams}
              onSave={handleSaveNote}
              onDelete={handleDeleteNote}
              onCancel={() => setEditorMode('none')}
              onExpand={(draft) => {
                stashNoteDraft({ ...draft, noteId: editingNote?.id ?? null })
                setEditorMode('none')
                router.push(noteEditorHref({ id: editingNote?.id }))
              }}
              initialTitle={editingNote?.title}
              initialContent={editingNote?.content}
              initialTags={editingNote?.tags}
              initialFolderId={editingNote?.folderId}
            />
          )}
          {editorMode === 'diagram' && (
            <DiagramEditor
              folders={folders}
              onSave={handleSaveDiagram}
              onDelete={handleDeleteDiagram}
              onCancel={() => setEditorMode('none')}
              onExpand={(draft) => {
                stashDiagramDraft({ ...draft, diagramId: editingDiagram?.id ?? null })
                setEditorMode('none')
                router.push(diagramEditorHref({ id: editingDiagram?.id }))
              }}
              initialTitle={editingDiagram?.title}
              initialContent={editingDiagram?.content}
              initialTags={editingDiagram?.tags}
              initialFolderId={editingDiagram?.folderId}
            />
          )}
          {editorMode === 'local-note' && (
            <NoteEditor
              initialTitle={editingLocalNote?.title}
              initialContent={editingLocalNote?.content}
              onSave={(data, options) => handleSaveLocalNote({ title: data.title, content: data.content }, options)}
              onCancel={() => {
                setEditorMode('none')
                setEditingLocalNoteId(null)
              }}
              onExpand={(draft) => {
                stashNoteDraft({ ...draft, noteId: editingLocalNoteId, local: true })
                setEditorMode('none')
                setEditingLocalNoteId(null)
                router.push(
                  editingLocalNoteId
                    ? noteEditorHref({ id: editingLocalNoteId, local: true })
                    : noteEditorHref({ local: true })
                )
              }}
              isAnonymous={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
