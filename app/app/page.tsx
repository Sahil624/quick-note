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
} from '@/components/ui/dialog'

type EditorMode = 'none' | 'note' | 'diagram' | 'local-note'

export default function AppPage() {
  const { user, isAnonymous } = useAuth()
  const { 
    notes, 
    diagrams, 
    folders, 
    localNotes, 
    createNote, 
    createDiagram,
    createLocalNote,
    updateLocalNote,
    deleteLocalNote,
    shareLocalNote,
  } = useNotes()
  
  const [editorMode, setEditorMode] = useState<EditorMode>('none')
  const [editingLocalNoteId, setEditingLocalNoteId] = useState<string | null>(null)

  const handleNewNote = useCallback(() => {
    if (isAnonymous) {
      setEditorMode('local-note')
    } else {
      setEditorMode('note')
    }
  }, [isAnonymous])

  const handleNewDiagram = useCallback(() => {
    setEditorMode('diagram')
  }, [])

  const handleSaveNote = useCallback(async (data: { 
    title: string; 
    content: string; 
    tags: string[];
    folderId: string | null;
    linkedArtifacts: string[];
  }) => {
    try {
      await createNote(data.title, data.content, data.folderId, data.tags, data.linkedArtifacts)
      setEditorMode('none')
    } catch (error) {
      console.error('Error creating note:', error)
    }
  }, [createNote])

  const handleSaveDiagram = useCallback(async (data: {
    title: string;
    content: string;
    tags: string[];
    folderId: string | null;
  }) => {
    try {
      await createDiagram(data.title, data.content, data.folderId, data.tags)
      setEditorMode('none')
    } catch (error) {
      console.error('Error creating diagram:', error)
    }
  }, [createDiagram])

  const handleSaveLocalNote = useCallback((data: { title: string; content: string }) => {
    if (editingLocalNoteId) {
      updateLocalNote(editingLocalNoteId, { title: data.title, content: data.content })
      setEditingLocalNoteId(null)
    } else {
      createLocalNote(data.title, data.content)
    }
    setEditorMode('none')
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
              <Card className="border-dashed">
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
                    onClick={() => isAnonymous ? handleEditLocalNote(note.id) : null}
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
                    <Card key={diagram.id} className="cursor-pointer hover:border-primary/50 transition-colors">
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
        <DialogContent className="max-w-5xl h-[85vh] p-0 gap-0">
          {editorMode === 'note' && (
            <NoteEditor
              folders={folders}
              diagrams={diagrams}
              onSave={handleSaveNote}
              onCancel={() => setEditorMode('none')}
            />
          )}
          {editorMode === 'diagram' && (
            <DiagramEditor
              folders={folders}
              onSave={handleSaveDiagram}
              onCancel={() => setEditorMode('none')}
            />
          )}
          {editorMode === 'local-note' && (
            <NoteEditor
              initialTitle={editingLocalNote?.title}
              initialContent={editingLocalNote?.content}
              onSave={(data) => handleSaveLocalNote({ title: data.title, content: data.content })}
              onCancel={() => {
                setEditorMode('none')
                setEditingLocalNoteId(null)
              }}
              isAnonymous={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
