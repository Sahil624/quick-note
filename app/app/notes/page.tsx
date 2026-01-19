'use client'

import { useState, useCallback } from 'react'
import {
  Plus,
  Search,
  Filter,
  FileText,
  MoreVertical,
  Edit,
  Trash2,
  Share2,
  Check,
  FolderOpen,
  Clock,
  ArrowUpDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AppSidebar } from '@/components/app-sidebar'
import { NoteEditor } from '@/components/note-editor'
import { useAuth } from '@/lib/auth-context'
import { useNotes } from '@/lib/notes-context'
import { Note, SortType } from '@/lib/types'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

export default function NotesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <NotesContent />
    </Suspense>
  )
}

function Loading() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function NotesContent() {
  const { isAnonymous } = useAuth()
  const {
    notes,
    diagrams,
    folders,
    createNote,
    updateNote,
    deleteNote,
    makePublic
  } = useNotes()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterTag, setFilterTag] = useState<string>('all')
  const [filterFolder, setFilterFolder] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortType>('newest')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const searchParams = useSearchParams()

  // Get unique tags
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)))

  // Filter and sort notes
  const filteredNotes = notes
    .filter(note => {
      const matchesSearch = searchQuery === '' ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTag = filterTag === 'all' || note.tags.includes(filterTag)
      const matchesFolder = filterFolder === 'all' ||
        (filterFolder === 'none' ? note.folderId === null : note.folderId === filterFolder)

      return matchesSearch && matchesTag && matchesFolder
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  const handleNewNote = useCallback(() => {
    setEditingNote(null)
    setEditorOpen(true)
  }, [])

  const handleEditNote = useCallback((note: Note) => {
    setEditingNote(note)
    setEditorOpen(true)
  }, [])

  const handleSaveNote = useCallback(async (data: {
    title: string;
    content: string;
    tags: string[];
    folderId: string | null;
    linkedArtifacts: string[];
  }) => {
    try {
      if (editingNote) {
        await updateNote(editingNote.id, data)
      } else {
        await createNote(data.title, data.content, data.folderId, data.tags, data.linkedArtifacts)
      }
      setEditorOpen(false)
      setEditingNote(null)
    } catch (error) {
      console.error('Error saving note:', error)
    }
  }, [editingNote, createNote, updateNote])

  const handleDeleteNote = useCallback(async (id: string) => {
    try {
      await deleteNote(id)
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }, [deleteNote])

  const handleShareNote = useCallback(async (note: Note) => {
    try {
      const publicId = await makePublic(note.id, 'note')
      const url = `${window.location.origin}/share/${publicId}`
      await navigator.clipboard.writeText(url)
      setCopiedId(note.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Error sharing note:', error)
    }
  }, [makePublic])

  if (isAnonymous) {
    return (
      <div className="h-screen flex bg-background">
        <AppSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-foreground mb-2">Sign in to access Notes</h1>
            <p className="text-muted-foreground mb-4">Your notes will be synced across devices</p>
            <Button asChild>
              <a href="/app/login">Sign In</a>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <Suspense fallback={null}>
      <div className="h-screen flex bg-background">
        <AppSidebar onNewNote={handleNewNote} />

        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">All Notes</h1>
                <p className="text-muted-foreground text-sm">{notes.length} notes total</p>
              </div>
              <Button onClick={handleNewNote}>
                <Plus className="w-4 h-4 mr-2" />
                New Note
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={filterTag} onValueChange={setFilterTag}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All tags" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All tags</SelectItem>
                    {allTags.map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-muted-foreground" />
                <Select value={filterFolder} onValueChange={setFilterFolder}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All folders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All folders</SelectItem>
                    <SelectItem value="none">No folder</SelectItem>
                    {folders.map(folder => (
                      <SelectItem key={folder.id} value={folder.id}>{folder.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortType)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="oldest">Oldest first</SelectItem>
                    <SelectItem value="updated">Recently updated</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes List */}
            {filteredNotes.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-lg font-medium text-foreground mb-2">No notes found</h2>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || filterTag !== 'all' || filterFolder !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'Create your first note'}
                  </p>
                  {!searchQuery && filterTag === 'all' && filterFolder === 'all' && (
                    <Button onClick={handleNewNote}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Note
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    folders={folders}
                    onEdit={() => handleEditNote(note)}
                    onDelete={() => handleDeleteNote(note.id)}
                    onShare={() => handleShareNote(note)}
                    isCopied={copiedId === note.id}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Editor Dialog */}
        <Dialog open={editorOpen} onOpenChange={(open) => {
          if (!open) {
            setEditorOpen(false)
            setEditingNote(null)
          }
        }}>
          <DialogContent className="max-w-5xl h-[85vh] p-0 gap-0">
            <NoteEditor
              initialTitle={editingNote?.title}
              initialContent={editingNote?.content}
              initialTags={editingNote?.tags}
              initialFolderId={editingNote?.folderId}
              initialLinkedArtifacts={editingNote?.linkedArtifacts}
              folders={folders}
              diagrams={diagrams}
              onSave={handleSaveNote}
              onCancel={() => {
                setEditorOpen(false)
                setEditingNote(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </Suspense>
  )
}

function NoteCard({
  note,
  folders,
  onEdit,
  onDelete,
  onShare,
  isCopied
}: {
  note: Note
  folders: { id: string; name: string }[]
  onEdit: () => void
  onDelete: () => void
  onShare: () => void
  isCopied: boolean
}) {
  const folder = folders.find(f => f.id === note.folderId)

  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onEdit}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-foreground truncate">{note.title}</h3>
              {folder && (
                <Badge variant="outline" className="text-xs">
                  <FolderOpen className="w-3 h-3 mr-1" />
                  {folder.name}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {note.content.substring(0, 200)}...
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(note.updatedAt).toLocaleDateString()}
              </span>
              {note.versions?.length > 0 && (
                <span>{note.versions.length} version{note.versions.length > 1 ? 's' : ''}</span>
              )}
            </div>
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {note.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShare(); }}>
                {isCopied ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
                {isCopied ? 'Link copied!' : 'Share'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Move to Trash
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
