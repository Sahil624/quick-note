'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { 
  Save,
  X,
  Tag,
  FolderOpen,
  Eye,
  Edit3,
  Columns,
  Download,
  Copy,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import mermaid from 'mermaid'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Folder } from '@/lib/types'

interface DiagramEditorProps {
  initialTitle?: string
  initialContent?: string
  initialTags?: string[]
  initialFolderId?: string | null
  folders?: Folder[]
  onSave: (data: { 
    title: string; 
    content: string; 
    tags: string[];
    folderId: string | null;
  }) => void
  onCancel?: () => void
}

type ViewMode = 'edit' | 'preview' | 'split'

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  fontFamily: 'inherit',
})

const DIAGRAM_TEMPLATES = [
  {
    name: 'Flowchart',
    content: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process A]
    B -->|No| D[Process B]
    C --> E[End]
    D --> E`
  },
  {
    name: 'Sequence',
    content: `sequenceDiagram
    participant A as User
    participant B as System
    A->>B: Request
    B-->>A: Response`
  },
  {
    name: 'Class Diagram',
    content: `classDiagram
    class Animal {
        +String name
        +makeSound()
    }
    class Dog {
        +bark()
    }
    Animal <|-- Dog`
  },
  {
    name: 'State Diagram',
    content: `stateDiagram-v2
    [*] --> Idle
    Idle --> Processing : Start
    Processing --> Done : Complete
    Done --> [*]`
  },
  {
    name: 'ER Diagram',
    content: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER {
        string name
        string email
    }`
  },
  {
    name: 'Gantt Chart',
    content: `gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1
    Task A :a1, 2024-01-01, 30d
    Task B :after a1, 20d`
  },
  {
    name: 'Pie Chart',
    content: `pie title Distribution
    "Category A" : 45
    "Category B" : 30
    "Category C" : 25`
  },
  {
    name: 'Mind Map',
    content: `mindmap
  root((Main Topic))
    Topic A
      Subtopic A1
      Subtopic A2
    Topic B
      Subtopic B1`
  }
]

export function DiagramEditor({
  initialTitle = '',
  initialContent = '',
  initialTags = [],
  initialFolderId = null,
  folders = [],
  onSave,
  onCancel,
}: DiagramEditorProps) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent || DIAGRAM_TEMPLATES[0].content)
  const [tags, setTags] = useState<string[]>(initialTags)
  const [tagInput, setTagInput] = useState('')
  const [folderId, setFolderId] = useState<string | null>(initialFolderId)
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [renderedSvg, setRenderedSvg] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const renderIdRef = useRef(0)

  // Render mermaid diagram
  useEffect(() => {
    const renderDiagram = async () => {
      const currentRenderId = ++renderIdRef.current
      
      try {
        // Create a unique id for this render
        const id = `mermaid-preview-${Date.now()}`
        const { svg } = await mermaid.render(id, content)
        
        // Only update if this is still the latest render request
        if (currentRenderId === renderIdRef.current) {
          setRenderedSvg(svg)
          setError(null)
        }
      } catch (err) {
        if (currentRenderId === renderIdRef.current) {
          setError(err instanceof Error ? err.message : 'Invalid diagram syntax')
          setRenderedSvg('')
        }
      }
    }

    const timeoutId = setTimeout(renderDiagram, 300)
    return () => clearTimeout(timeoutId)
  }, [content])

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
      title: title || 'Untitled Diagram', 
      content, 
      tags, 
      folderId
    })
  }, [title, content, tags, folderId, onSave])

  const handleExportSvg = useCallback(() => {
    if (!renderedSvg) return
    
    const blob = new Blob([renderedSvg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title || 'diagram'}.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [renderedSvg, title])

  const handleExportPng = useCallback(async () => {
    if (!renderedSvg) return
    
    // Create a canvas with high resolution
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Create an image from SVG
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    const svgBlob = new Blob([renderedSvg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    
    img.onload = () => {
      // Use 3x scale for high resolution
      const scale = 3
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      
      // Fill white background
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Draw image
      ctx.scale(scale, scale)
      ctx.drawImage(img, 0, 0)
      
      // Export
      canvas.toBlob((blob) => {
        if (!blob) return
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `${title || 'diagram'}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }, 'image/png', 1.0)
      
      URL.revokeObjectURL(url)
    }
    
    img.src = url
  }, [renderedSvg, title])

  const handleCopyToClipboard = useCallback(async () => {
    if (!renderedSvg || !previewRef.current) return
    
    try {
      // Try to copy as image
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      const svgBlob = new Blob([renderedSvg], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)
      
      img.onload = async () => {
        canvas.width = img.width * 2
        canvas.height = img.height * 2
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.scale(2, 2)
        ctx.drawImage(img, 0, 0)
        
        canvas.toBlob(async (blob) => {
          if (!blob) return
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ])
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          } catch {
            // Fallback to copying SVG as text
            await navigator.clipboard.writeText(renderedSvg)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }
        }, 'image/png')
        
        URL.revokeObjectURL(url)
      }
      
      img.src = url
    } catch {
      // Fallback to copying SVG as text
      await navigator.clipboard.writeText(renderedSvg)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [renderedSvg])

  const handleTemplateSelect = useCallback((templateName: string) => {
    const template = DIAGRAM_TEMPLATES.find(t => t.name === templateName)
    if (template) {
      setContent(template.content)
    }
  }, [])

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-4 py-3 flex items-center justify-between gap-4">
        <Input
          type="text"
          placeholder="Diagram title..."
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
          <Button size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-border px-4 py-2 flex items-center gap-4 flex-wrap">
        <Select onValueChange={handleTemplateSelect}>
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue placeholder="Insert template..." />
          </SelectTrigger>
          <SelectContent>
            {DIAGRAM_TEMPLATES.map(template => (
              <SelectItem key={template.name} value={template.name}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex-1" />
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCopyToClipboard}
          disabled={!renderedSvg}
        >
          {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExportSvg}
          disabled={!renderedSvg}
        >
          <Download className="w-4 h-4 mr-1" />
          SVG
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExportPng}
          disabled={!renderedSvg}
        >
          <Download className="w-4 h-4 mr-1" />
          PNG
        </Button>
      </div>

      {/* Tags and Folder */}
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

      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden">
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2 border-r border-border' : 'w-full'} flex flex-col`}>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter mermaid diagram code..."
              className="flex-1 resize-none border-0 rounded-none focus-visible:ring-0 font-mono text-sm p-4"
            />
          </div>
        )}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} overflow-auto p-4`}>
            <div 
              ref={previewRef}
              className="flex items-center justify-center min-h-full bg-card rounded-lg border border-border p-4"
            >
              {error ? (
                <div className="text-destructive text-sm text-center">
                  <p className="font-medium mb-2">Diagram Error</p>
                  <pre className="text-xs bg-destructive/10 p-2 rounded">{error}</pre>
                </div>
              ) : renderedSvg ? (
                <div 
                  className="diagram-preview" 
                  dangerouslySetInnerHTML={{ __html: renderedSvg }} 
                />
              ) : (
                <p className="text-muted-foreground">Loading preview...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
