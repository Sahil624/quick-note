'use client'

import { useState, useCallback, use } from 'react'
import {
    Plus,
    Search,
    FileText,
    GitBranch,
    MoreVertical,
    Edit,
    Trash2,
    ArrowLeft,
    FolderOpen,
    Pencil
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AppSidebar } from '@/components/app-sidebar'
import { NoteEditor } from '@/components/note-editor'
import { DiagramEditor } from '@/components/diagram-editor'
import { useAuth } from '@/lib/auth-context'
import { useNotes } from '@/lib/notes-context'
import { Note, Diagram } from '@/lib/types'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function Loading() {
    return null
}

export default function FolderClient({ params }: { params: Promise<{ id: string }> }) {
    return (
        <Suspense fallback={<Loading />}>
            <FolderContent params={params} />
        </Suspense>
    )
}

function FolderContent({ params }: { params: Promise<{ id: string }> }) {
    const searchParams = useSearchParams()
    const { id } = use(params)
    const { isAnonymous } = useAuth()
    const {
        notes,
        diagrams,
        folders,
        createNote,
        createDiagram,
        updateNote,
        updateDiagram,
        deleteNote,
        deleteDiagram,
        updateFolder,
        deleteFolder
    } = useNotes()

    const [searchQuery, setSearchQuery] = useState('')
    const [editorOpen, setEditorOpen] = useState(false)
    const [editorType, setEditorType] = useState<'note' | 'diagram'>('note')
    const [editingItem, setEditingItem] = useState<Note | Diagram | null>(null)
    const [renameDialogOpen, setRenameDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [newFolderName, setNewFolderName] = useState('')

    const folder = folders.find(f => f.id === id)

    // Get items in this folder
    const folderNotes = notes.filter(n => n.folderId === id)
    const folderDiagrams = diagrams.filter(d => d.folderId === id)

    // Filter by search
    const filteredNotes = folderNotes.filter(note =>
        searchQuery === '' ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredDiagrams = folderDiagrams.filter(diagram =>
        searchQuery === '' ||
        diagram.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleNewNote = useCallback(() => {
        setEditingItem(null)
        setEditorType('note')
        setEditorOpen(true)
    }, [])

    const handleNewDiagram = useCallback(() => {
        setEditingItem(null)
        setEditorType('diagram')
        setEditorOpen(true)
    }, [])

    const handleEditNote = useCallback((note: Note) => {
        setEditingItem(note)
        setEditorType('note')
        setEditorOpen(true)
    }, [])

    const handleEditDiagram = useCallback((diagram: Diagram) => {
        setEditingItem(diagram)
        setEditorType('diagram')
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
            if (editingItem && 'linkedArtifacts' in editingItem) {
                await updateNote(editingItem.id, data)
            } else {
                await createNote(data.title, data.content, id, data.tags, data.linkedArtifacts)
            }
            setEditorOpen(false)
            setEditingItem(null)
        } catch (error) {
            console.error('Error saving note:', error)
        }
    }, [editingItem, createNote, updateNote, id])

    const handleSaveDiagram = useCallback(async (data: {
        title: string;
        content: string;
        tags: string[];
        folderId: string | null;
    }) => {
        try {
            if (editingItem && 'diagramType' in editingItem) {
                await updateDiagram(editingItem.id, data)
            } else {
                await createDiagram(data.title, data.content, id, data.tags)
            }
            setEditorOpen(false)
            setEditingItem(null)
        } catch (error) {
            console.error('Error saving diagram:', error)
        }
    }, [editingItem, createDiagram, updateDiagram, id])

    const handleRenameFolder = useCallback(async () => {
        if (newFolderName.trim()) {
            try {
                await updateFolder(id, newFolderName.trim())
                setRenameDialogOpen(false)
                setNewFolderName('')
            } catch (error) {
                console.error('Error renaming folder:', error)
            }
        }
    }, [id, newFolderName, updateFolder])

    const handleDeleteFolder = useCallback(async () => {
        try {
            await deleteFolder(id)
            window.location.href = '/app'
        } catch (error) {
            console.error('Error deleting folder:', error)
        }
    }, [id, deleteFolder])

    if (isAnonymous) {
        return (
            <div className="h-screen flex bg-background">
                <AppSidebar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h1 className="text-xl font-semibold text-foreground mb-2">Sign in to use Folders</h1>
                        <p className="text-muted-foreground mb-4">Organize your notes with folders</p>
                        <Button asChild>
                            <a href="/app/login">Sign In</a>
                        </Button>
                    </div>
                </main>
            </div>
        )
    }

    if (!folder) {
        return (
            <div className="h-screen flex bg-background">
                <AppSidebar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h1 className="text-xl font-semibold text-foreground mb-2">Folder not found</h1>
                        <Button asChild>
                            <Link href="/app">Go to Dashboard</Link>
                        </Button>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="h-screen flex bg-background">
            <AppSidebar onNewNote={handleNewNote} onNewDiagram={handleNewDiagram} />

            <main className="flex-1 overflow-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Link href="/app">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>
                            </Link>
                            <div>
                                <div className="flex items-center gap-2">
                                    <FolderOpen className="w-5 h-5 text-primary" />
                                    <h1 className="text-2xl font-semibold text-foreground">{folder.name}</h1>
                                </div>
                                <p className="text-muted-foreground text-sm">
                                    {folderNotes.length + folderDiagrams.length} items
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" onClick={() => setNewFolderName(folder.name)}>
                                        <Pencil className="w-4 h-4 mr-2" />
                                        Rename
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Rename Folder</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 pt-4">
                                        <Input
                                            value={newFolderName}
                                            onChange={(e) => setNewFolderName(e.target.value)}
                                            placeholder="Folder name"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleRenameFolder}>
                                                Rename
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="sm" onClick={() => setDeleteDialogOpen(true)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={handleNewNote}>
                                        <FileText className="w-4 h-4 mr-2" />
                                        New Note
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleNewDiagram}>
                                        <GitBranch className="w-4 h-4 mr-2" />
                                        New Diagram
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative max-w-md mb-6">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search in folder..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Content */}
                    {filteredNotes.length === 0 && filteredDiagrams.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="p-12 text-center">
                                <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <h2 className="text-lg font-medium text-foreground mb-2">
                                    {searchQuery ? 'No items found' : 'Folder is empty'}
                                </h2>
                                <p className="text-muted-foreground mb-4">
                                    {searchQuery ? 'Try a different search' : 'Add notes or diagrams to this folder'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {/* Notes Section */}
                            {filteredNotes.length > 0 && (
                                <div>
                                    <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Notes ({filteredNotes.length})
                                    </h2>
                                    <div className="space-y-3">
                                        {filteredNotes.map((note) => (
                                            <Card
                                                key={note.id}
                                                className="cursor-pointer hover:border-primary/50 transition-colors"
                                                onClick={() => handleEditNote(note)}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-medium text-foreground truncate">{note.title}</h3>
                                                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                                                {note.content.substring(0, 150)}...
                                                            </p>
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
                                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditNote(note); }}>
                                                                    <Edit className="w-4 h-4 mr-2" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
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
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Diagrams Section */}
                            {filteredDiagrams.length > 0 && (
                                <div>
                                    <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                                        <GitBranch className="w-4 h-4" />
                                        Diagrams ({filteredDiagrams.length})
                                    </h2>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredDiagrams.map((diagram) => (
                                            <Card
                                                key={diagram.id}
                                                className="cursor-pointer hover:border-primary/50 transition-colors"
                                                onClick={() => handleEditDiagram(diagram)}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between">
                                                        <h3 className="font-medium text-foreground truncate">{diagram.title}</h3>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditDiagram(diagram); }}>
                                                                    <Edit className="w-4 h-4 mr-2" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={(e) => { e.stopPropagation(); deleteDiagram(diagram.id); }}
                                                                    className="text-destructive"
                                                                >
                                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                                    Move to Trash
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                    {diagram.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {diagram.tags.map(tag => (
                                                                <Badge key={tag} variant="secondary" className="text-xs">
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Editor Dialog */}
            <Dialog open={editorOpen} onOpenChange={(open) => {
                if (!open) {
                    setEditorOpen(false)
                    setEditingItem(null)
                }
            }}>
                <DialogContent className="max-w-5xl h-[85vh] p-0 gap-0">
                    {editorType === 'note' ? (
                        <NoteEditor
                            initialTitle={editingItem && 'linkedArtifacts' in editingItem ? editingItem.title : undefined}
                            initialContent={editingItem && 'linkedArtifacts' in editingItem ? editingItem.content : undefined}
                            initialTags={editingItem && 'linkedArtifacts' in editingItem ? editingItem.tags : undefined}
                            initialFolderId={id}
                            initialLinkedArtifacts={editingItem && 'linkedArtifacts' in editingItem ? editingItem.linkedArtifacts : undefined}
                            folders={folders}
                            diagrams={diagrams}
                            onSave={handleSaveNote}
                            onCancel={() => {
                                setEditorOpen(false)
                                setEditingItem(null)
                            }}
                        />
                    ) : (
                        <DiagramEditor
                            initialTitle={editingItem && 'diagramType' in editingItem ? editingItem.title : undefined}
                            initialContent={editingItem && 'diagramType' in editingItem ? editingItem.content : undefined}
                            initialTags={editingItem && 'diagramType' in editingItem ? editingItem.tags : undefined}
                            initialFolderId={id}
                            folders={folders}
                            onSave={handleSaveDiagram}
                            onCancel={() => {
                                setEditorOpen(false)
                                setEditingItem(null)
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Folder Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Folder</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this folder? Items inside will be moved to the root level, not deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteFolder} className="bg-destructive text-destructive-foreground">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
