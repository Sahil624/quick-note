'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Code,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  ImageIcon,
  GitBranch,
  Calculator,
  Eye,
  Edit3,
  Columns,
  Save,
  X,
  Tag,
  FolderOpen,
  Plus,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { MarkdownRenderer } from './markdown-renderer'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Folder, Diagram } from '@/lib/types'

interface NoteEditorProps {
  initialTitle?: string
  initialContent?: string
  initialTags?: string[]
  initialFolderId?: string | null
  initialLinkedArtifacts?: string[]
  folders?: Folder[]
  diagrams?: Diagram[]
  onSave: (data: {
    title: string;
    content: string;
    tags: string[];
    folderId: string | null;
    linkedArtifacts: string[];
  }) => void
  onCancel?: () => void
  onDelete?: () => void
  isAnonymous?: boolean
}

type ViewMode = 'edit' | 'preview' | 'split'

export function NoteEditor({
  initialTitle = '',
  initialContent = '',
  initialTags = [],
  initialFolderId = null,
  initialLinkedArtifacts = [],
  folders = [],
  diagrams = [],
  onSave,
  onCancel,
  onDelete,
  isAnonymous = false,
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [tags, setTags] = useState<string[]>(initialTags)
  const [tagInput, setTagInput] = useState('')
  const [folderId, setFolderId] = useState<string | null>(initialFolderId)
  const [linkedArtifacts, setLinkedArtifacts] = useState<string[]>(initialLinkedArtifacts)
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [artifactDialogOpen, setArtifactDialogOpen] = useState(false)

  const insertText = useCallback((before: string, after: string = '', placeholder: string = '') => {
    const textarea = document.querySelector('textarea[data-editor="true"]') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end) || placeholder
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end)

    setContent(newText)

    // Set cursor position after the operation
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [content])

  const toolbarActions = useMemo(() => [
    { icon: Bold, action: () => insertText('**', '**', 'bold'), title: 'Bold' },
    { icon: Italic, action: () => insertText('*', '*', 'italic'), title: 'Italic' },
    { icon: Heading1, action: () => insertText('# ', '', 'Heading 1'), title: 'Heading 1' },
    { icon: Heading2, action: () => insertText('## ', '', 'Heading 2'), title: 'Heading 2' },
    { icon: Heading3, action: () => insertText('### ', '', 'Heading 3'), title: 'Heading 3' },
    { icon: Code, action: () => insertText('`', '`', 'code'), title: 'Inline Code' },
    { icon: List, action: () => insertText('- ', '', 'list item'), title: 'Bullet List' },
    { icon: ListOrdered, action: () => insertText('1. ', '', 'list item'), title: 'Numbered List' },
    { icon: Quote, action: () => insertText('> ', '', 'quote'), title: 'Quote' },
    { icon: LinkIcon, action: () => insertText('[', '](url)', 'link text'), title: 'Link' },
    { icon: ImageIcon, action: () => insertText('![', '](url)', 'alt text'), title: 'Image' },
    { icon: GitBranch, action: () => insertText('```mermaid\ngraph TD\n    A[Start] --> B[End]\n```\n', ''), title: 'Mermaid Diagram' },
    { icon: Calculator, action: () => insertText('$$', '$$', 'E = mc^2'), title: 'Math Equation' },
  ], [insertText])

  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }, [tagInput, tags])

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }, [tags])

  const handleSave = useCallback(() => {
    onSave({
      title: title || 'Untitled Note',
      content,
      tags,
      folderId,
      linkedArtifacts
    })
  }, [title, content, tags, folderId, linkedArtifacts, onSave])

  const handleLinkArtifact = useCallback((artifactId: string) => {
    if (!linkedArtifacts.includes(artifactId)) {
      const diagram = diagrams.find(d => d.id === artifactId)
      if (diagram) {
        // Insert the mermaid code into the note
        insertText(`\n\n<!-- Linked Diagram: ${diagram.title} -->\n\`\`\`mermaid\n${diagram.content}\n\`\`\`\n`, '')
        setLinkedArtifacts([...linkedArtifacts, artifactId])
      }
    }
    setArtifactDialogOpen(false)
  }, [linkedArtifacts, diagrams, insertText])

  const processedContent = useMemo(() => {
    return content
  }, [content])

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-4 py-3 flex items-center justify-between gap-4">
        <Input
          type="text"
          placeholder="Note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-medium border-0 bg-transparent px-0 focus-visible:ring-0 max-w-md"
        />
        <div className="flex items-center gap-2">
          <div className="flex border border-border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'edit' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('edit')}
              className="rounded-none"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'split' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('split')}
              className="rounded-none border-x border-border"
            >
              <Columns className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('preview')}
              className="rounded-none"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      {viewMode !== 'preview' && (
        <div className="border-b border-border px-4 py-2 flex items-center gap-1 flex-wrap">
          {toolbarActions.map(({ icon: Icon, action, title }) => (
            <Button
              key={title}
              variant="ghost"
              size="sm"
              onClick={action}
              title={title}
              className="h-8 w-8 p-0"
            >
              <Icon className="w-4 h-4" />
            </Button>
          ))}

          {!isAnonymous && (
            <>
              <div className="w-px h-6 bg-border mx-2" />
              <Dialog open={artifactDialogOpen} onOpenChange={setArtifactDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" title="Link Artifact" className="h-8 px-2">
                    <Plus className="w-4 h-4 mr-1" />
                    Link Artifact
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Link an Artifact</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    {diagrams.length === 0 ? (
                      <p className="text-muted-foreground text-sm text-center py-4">
                        No diagrams available. Create a diagram first.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {diagrams.map(diagram => (
                          <button
                            key={diagram.id}
                            onClick={() => handleLinkArtifact(diagram.id)}
                            className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <GitBranch className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{diagram.title}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {diagram.content.substring(0, 50)}...
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      )}

      {/* Tags and Folder (for logged in users) */}
      {!isAnonymous && (
        <div className="border-b border-border px-4 py-2 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-muted-foreground" />
            <Select value={folderId || 'none'} onValueChange={(val) => setFolderId(val === 'none' ? null : val)}>
              <SelectTrigger className="w-[180px] h-8">
                <SelectValue placeholder="No folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No folder</SelectItem>
                {folders.map(folder => (
                  <SelectItem key={folder.id} value={folder.id}>{folder.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center gap-2 flex-wrap flex-1">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                  {tag} <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
              <Input
                type="text"
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                className="w-24 h-7 text-xs border-0 bg-transparent px-1 focus-visible:ring-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden">
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2 border-r border-border' : 'w-full'} flex flex-col`}>
            <Textarea
              data-editor="true"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing in Markdown...

# Heading 1
## Heading 2

**Bold** and *italic* text

- List item
- Another item

> Blockquote

\`inline code\`

```mermaid
graph TD
    A[Start] --> B[End]
```

$$E = mc^2$$"
              className="flex-1 resize-none border-0 rounded-none focus-visible:ring-0 font-mono text-sm p-4"
            />
          </div>
        )}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} overflow-auto p-4`}>
            <MarkdownRenderer content={processedContent} className="prose-sm" />
          </div>
        )}
      </div>
    </div>
  )
}
