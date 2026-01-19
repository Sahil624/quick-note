'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Plus,
  Search,
  Filter,
  GitBranch,
  MoreVertical,
  Edit,
  Trash2,
  Share2,
  Download,
  Copy,
  Check,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AppSidebar } from '@/components/app-sidebar'
import { DiagramEditor } from '@/components/diagram-editor'
import { useAuth } from '@/lib/auth-context'
import { useNotes } from '@/lib/notes-context'
import { Diagram } from '@/lib/types'
import mermaid from 'mermaid'
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

function Loading() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}


// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  fontFamily: 'inherit',
})

export default function DiagramsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DiagramsContent />
    </Suspense>
  )
}

function DiagramsContent() {
  const { isAnonymous } = useAuth()
  const {
    diagrams,
    folders,
    createDiagram,
    updateDiagram,
    deleteDiagram,
    makePublic
  } = useNotes()

  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTag, setFilterTag] = useState<string>('all')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingDiagram, setEditingDiagram] = useState<Diagram | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Get unique tags
  const allTags = Array.from(new Set(diagrams.flatMap(d => d.tags)))

  // Filter diagrams
  const filteredDiagrams = diagrams.filter(diagram => {
    const matchesSearch = searchQuery === '' ||
      diagram.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      diagram.content.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTag = filterTag === 'all' || diagram.tags.includes(filterTag)

    return matchesSearch && matchesTag
  })

  const handleNewDiagram = useCallback(() => {
    setEditingDiagram(null)
    setEditorOpen(true)
  }, [])

  const handleEditDiagram = useCallback((diagram: Diagram) => {
    setEditingDiagram(diagram)
    setEditorOpen(true)
  }, [])

  const handleSaveDiagram = useCallback(async (data: {
    title: string;
    content: string;
    tags: string[];
    folderId: string | null;
  }) => {
    try {
      if (editingDiagram) {
        await updateDiagram(editingDiagram.id, data)
      } else {
        await createDiagram(data.title, data.content, data.folderId, data.tags)
      }
      setEditorOpen(false)
      setEditingDiagram(null)
    } catch (error) {
      console.error('Error saving diagram:', error)
    }
  }, [editingDiagram, createDiagram, updateDiagram])

  const handleDeleteDiagram = useCallback(async (id: string) => {
    try {
      await deleteDiagram(id)
    } catch (error) {
      console.error('Error deleting diagram:', error)
    }
  }, [deleteDiagram])

  const handleShareDiagram = useCallback(async (diagram: Diagram) => {
    try {
      const publicId = await makePublic(diagram.id, 'diagram')
      const url = `${window.location.origin}/share/${publicId}`
      await navigator.clipboard.writeText(url)
      setCopiedId(diagram.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Error sharing diagram:', error)
    }
  }, [makePublic])

  if (isAnonymous) {
    return (
      <div className="h-screen flex bg-background">
        <AppSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <GitBranch className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-foreground mb-2">Sign in to use Diagrams</h1>
            <p className="text-muted-foreground text-sm">Create and manage reusable mermaid diagrams</p>
            <Button asChild>
              <a href="/app/login">Sign In</a>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-background">
      <AppSidebar onNewDiagram={handleNewDiagram} />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Diagrams</h1>
              <p className="text-muted-foreground text-sm">Create and manage your mermaid diagrams</p>
            </div>
            <Button onClick={handleNewDiagram}>
              <Plus className="w-4 h-4 mr-2" />
              New Diagram
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search diagrams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filterTag} onValueChange={setFilterTag}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tags</SelectItem>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Diagrams Grid */}
          {filteredDiagrams.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <GitBranch className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-lg font-medium text-foreground mb-2">No diagrams found</h2>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || filterTag !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Create your first mermaid diagram'}
                </p>
                {!searchQuery && filterTag === 'all' && (
                  <Button onClick={handleNewDiagram}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Diagram
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDiagrams.map((diagram) => (
                <DiagramCard
                  key={diagram.id}
                  diagram={diagram}
                  onEdit={() => handleEditDiagram(diagram)}
                  onDelete={() => handleDeleteDiagram(diagram.id)}
                  onShare={() => handleShareDiagram(diagram)}
                  isCopied={copiedId === diagram.id}
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
          setEditingDiagram(null)
        }
      }}>
        <DialogContent className="max-w-5xl h-[85vh] p-0 gap-0">
          <DiagramEditor
            initialTitle={editingDiagram?.title}
            initialContent={editingDiagram?.content}
            initialTags={editingDiagram?.tags}
            initialFolderId={editingDiagram?.folderId}
            folders={folders}
            onSave={handleSaveDiagram}
            onCancel={() => {
              setEditorOpen(false)
              setEditingDiagram(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DiagramCard({
  diagram,
  onEdit,
  onDelete,
  onShare,
  isCopied
}: {
  diagram: Diagram
  onEdit: () => void
  onDelete: () => void
  onShare: () => void
  isCopied: boolean
}) {
  const previewRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>('')

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        const id = `diagram-card-${diagram.id}-${Date.now()}`
        const { svg } = await mermaid.render(id, diagram.content)
        setSvg(svg)
      } catch {
        setSvg('')
      }
    }
    renderDiagram()
  }, [diagram.content, diagram.id])

  const handleExportPng = async () => {
    if (!svg) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous'

    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      const scale = 3
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.scale(scale, scale)
      ctx.drawImage(img, 0, 0)

      canvas.toBlob((blob) => {
        if (!blob) return
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `${diagram.title || 'diagram'}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }, 'image/png', 1.0)

      URL.revokeObjectURL(url)
    }

    img.src = url
  }

  return (
    <Card className="group hover:border-primary/50 transition-colors">
      <CardContent className="p-0">
        <div
          ref={previewRef}
          className="h-40 bg-muted/30 rounded-t-lg overflow-hidden flex items-center justify-center cursor-pointer"
          onClick={onEdit}
        >
          {svg ? (
            <div
              className="diagram-preview scale-50 origin-center"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          ) : (
            <GitBranch className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate">{diagram.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(diagram.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onShare}>
                  {isCopied ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
                  {isCopied ? 'Link copied!' : 'Share'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPng}>
                  <Download className="w-4 h-4 mr-2" />
                  Export PNG
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {diagram.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {diagram.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {diagram.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{diagram.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

