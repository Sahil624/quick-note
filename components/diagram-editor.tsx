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
  Check,
  Maximize2,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useTheme } from 'next-themes'
import { renderMermaid } from '@/lib/mermaid'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Folder } from '@/lib/types'
import {
  SaveOptions,
  autosaveStatusLabel,
  useAutosave,
  useAutosavePreference,
} from '@/hooks/use-autosave'

export type DiagramSavePayload = {
  title: string
  content: string
  tags: string[]
  folderId: string | null
}

interface DiagramEditorProps {
  initialTitle?: string
  initialContent?: string
  initialTags?: string[]
  initialFolderId?: string | null
  folders?: Folder[]
  onSave: (data: DiagramSavePayload, options?: SaveOptions) => void | Promise<void>
  onCancel?: () => void
  onDelete?: () => void
  onExpand?: (draft: DiagramSavePayload) => void
}

type ViewMode = 'edit' | 'preview' | 'split'

function snapshotDiagram(data: DiagramSavePayload) {
  return JSON.stringify({
    title: data.title || 'Untitled Diagram',
    content: data.content,
    tags: data.tags,
    folderId: data.folderId,
  })
}

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
  onDelete,
  onExpand,
}: DiagramEditorProps) {
  const { resolvedTheme } = useTheme()
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent || DIAGRAM_TEMPLATES[0].content)
  const [tags, setTags] = useState<string[]>(initialTags)
  const [tagInput, setTagInput] = useState('')
  const [folderId, setFolderId] = useState<string | null>(initialFolderId)
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [renderedSvg, setRenderedSvg] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [autosaveEnabled, setAutosaveEnabled] = useAutosavePreference()
  const previewRef = useRef<HTMLDivElement>(null)
  const renderIdRef = useRef(0)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const panZoomRef = useRef<any>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorViewRef = useRef<any>(null)
  const exportContainerRef = useRef<HTMLDivElement>(null)

  // Render mermaid diagram
  useEffect(() => {
    const renderDiagram = async () => {
      const currentRenderId = ++renderIdRef.current

      try {
        const { svg } = await renderMermaid(content, 'mermaid-preview')

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

  // Initialize CodeMirror editor
  useEffect(() => {
    if (!editorRef.current) return

    // Destroy existing editor if theme changes
    if (editorViewRef.current) {
      editorViewRef.current.destroy()
      editorViewRef.current = null
    }

    // Clear container to prevent duplicates
    editorRef.current.innerHTML = ''

    let cancelled = false

    const initEditor = async () => {
      const { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } = await import('@codemirror/view')
      const { EditorState } = await import('@codemirror/state')
      const { mermaid: mermaidLang } = await import('codemirror-lang-mermaid')
      const { defaultHighlightStyle, syntaxHighlighting, bracketMatching } = await import('@codemirror/language')
      const { defaultKeymap, history, historyKeymap } = await import('@codemirror/commands')
      const { oneDark } = await import('@codemirror/theme-one-dark')

      // Guard against race conditions
      if (cancelled || !editorRef.current) return

      const isDark = resolvedTheme === 'dark'

      const updateListener = EditorView.updateListener.of((update: { docChanged: boolean; state: { doc: { toString: () => string } } }) => {
        if (update.docChanged) {
          setContent(update.state.doc.toString())
        }
      })

      const lightTheme = EditorView.theme({
        '&': {
          height: '100%',
          fontSize: '14px',
          backgroundColor: 'var(--background)'
        },
        '.cm-scroller': { overflow: 'auto', fontFamily: 'ui-monospace, monospace' },
        '.cm-content': { padding: '16px 0', caretColor: 'var(--foreground)' },
        '.cm-gutters': { backgroundColor: 'var(--muted)', borderRight: '1px solid var(--border)' },
        '.cm-activeLineGutter': { backgroundColor: 'var(--accent)' },
        '.cm-activeLine': { backgroundColor: 'var(--accent)' },
      })

      const darkTheme = EditorView.theme({
        '&': { height: '100%', fontSize: '14px' },
        '.cm-scroller': { overflow: 'auto', fontFamily: 'ui-monospace, monospace' },
        '.cm-content': { padding: '16px 0' },
        '.cm-gutters': { backgroundColor: 'transparent', borderRight: 'none' },
      })

      const view = new EditorView({
        state: EditorState.create({
          doc: content,
          extensions: [
            lineNumbers(),
            highlightActiveLine(),
            highlightActiveLineGutter(),
            bracketMatching(),
            history(),
            mermaidLang(),
            syntaxHighlighting(defaultHighlightStyle),
            isDark ? oneDark : lightTheme,
            isDark ? darkTheme : [],
            keymap.of([...defaultKeymap, ...historyKeymap]),
            updateListener,
          ],
        }),
        parent: editorRef.current!,
      })

      editorViewRef.current = view
    }

    initEditor()

    return () => {
      cancelled = true
      if (editorViewRef.current) {
        editorViewRef.current.destroy()
        editorViewRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme])

  // Initialize svg-pan-zoom after SVG is rendered
  useEffect(() => {
    if (!renderedSvg || !previewRef.current) return

    // Clean up previous instance
    if (panZoomRef.current) {
      panZoomRef.current.destroy()
      panZoomRef.current = null
    }

    // Wait for DOM to update and dynamically import svg-pan-zoom
    const timeoutId = setTimeout(async () => {
      const svgElement = previewRef.current?.querySelector('svg')
      if (svgElement) {
        // Ensure SVG has proper attributes for pan-zoom
        svgElement.setAttribute('width', '100%')
        svgElement.setAttribute('height', '100%')
        svgElement.style.maxWidth = 'none'
        svgElement.style.maxHeight = 'none'

        try {
          // Dynamic import to avoid SSR issues
          const svgPanZoom = (await import('svg-pan-zoom')).default
          panZoomRef.current = svgPanZoom(svgElement, {
            zoomEnabled: true,
            controlIconsEnabled: false,
            fit: true,
            center: true,
            minZoom: 0.1,
            maxZoom: 10,
            zoomScaleSensitivity: 0.3,
            panEnabled: true,
            contain: false,
            refreshRate: 'auto'
          })
        } catch (e) {
          console.error('Failed to initialize svg-pan-zoom:', e)
        }
      }
    }, 50)

    return () => {
      clearTimeout(timeoutId)
      if (panZoomRef.current) {
        panZoomRef.current.destroy()
        panZoomRef.current = null
      }
    }
  }, [renderedSvg])

  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }, [tagInput, tags])

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }, [tags])

  const payload = useMemo<DiagramSavePayload>(
    () => ({ title, content, tags, folderId }),
    [title, content, tags, folderId]
  )

  const lastSavedRef = useRef(
    snapshotDiagram({
      title: initialTitle,
      content: initialContent || DIAGRAM_TEMPLATES[0].content,
      tags: initialTags,
      folderId: initialFolderId,
    })
  )
  const isDirty = snapshotDiagram(payload) !== lastSavedRef.current

  const persist = useCallback(
    async (reason: 'manual' | 'autosave') => {
      const data: DiagramSavePayload = {
        title: title || 'Untitled Diagram',
        content,
        tags,
        folderId,
      }
      await onSave(data, { reason })
      lastSavedRef.current = snapshotDiagram(data)
    },
    [title, content, tags, folderId, onSave]
  )

  const autosaveStatus = useAutosave({
    enabled: autosaveEnabled,
    isDirty,
    save: () => persist('autosave'),
  })

  const handleSave = useCallback(() => {
    void persist('manual')
  }, [persist])

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

  // Shared helper: Renders mermaid to canvas and calls callback with the canvas
  const renderToCanvas = useCallback(async (
    scale: number,
    onSuccess: (canvas: HTMLCanvasElement) => void,
    onError?: (error: unknown) => void
  ) => {
    if (!content) return

    try {
      // INJECT CONFIG: Force 'htmlLabels: false' to prevent <foreignObject> tags
      // This is the CRITICAL fix for the "Tainted Canvas" error
      const safeContent = `%%{init: {'flowchart': {'htmlLabels': false}, 'theme': 'default'}}%%\n${content}`

      // Render
      const { svg } = await renderMermaid(safeContent, 'mermaid-export')

      // Parse & Size
      const parser = new DOMParser()
      const svgDoc = parser.parseFromString(svg, 'image/svg+xml')
      const svgElement = svgDoc.querySelector('svg')
      if (!svgElement) return

      // Get natural dimensions
      let width = parseFloat(svgElement.getAttribute('width') || '800')
      let height = parseFloat(svgElement.getAttribute('height') || '600')

      const viewBox = svgElement.getAttribute('viewBox')
      if (viewBox) {
        const parts = viewBox.split(' ')
        if (parts.length === 4) {
          width = parseFloat(parts[2])
          height = parseFloat(parts[3])
        }
      }

      // Ensure explicit dimensions are set
      svgElement.setAttribute('width', String(width))
      svgElement.setAttribute('height', String(height))

      // Serialize & Encode as Base64
      const cleanSvg = new XMLSerializer().serializeToString(svgElement)
      const svg64 = btoa(unescape(encodeURIComponent(cleanSvg)))
      const image64 = `data:image/svg+xml;base64,${svg64}`

      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = width * scale
        canvas.height = height * scale

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.scale(scale, scale)
        ctx.drawImage(img, 0, 0, width, height)

        onSuccess(canvas)
      }

      img.onerror = (e) => {
        console.error('Failed to load SVG image:', e)
        onError?.(e)
      }

      img.src = image64
    } catch (error) {
      console.error('Failed to render diagram:', error)
      onError?.(error)
    }
  }, [content])

  const handleExportPng = useCallback(async () => {
    await renderToCanvas(3, (canvas) => {
      canvas.toBlob((blob) => {
        if (!blob) return
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `${title || 'diagram'}.png`
        a.click()
      }, 'image/png', 1.0)
    })
  }, [renderToCanvas, title])

  const handleCopyToClipboard = useCallback(async () => {
    await renderToCanvas(2, async (canvas) => {
      try {
        canvas.toBlob(async (blob) => {
          if (!blob) return
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ])
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }, 'image/png', 1.0)
      } catch (e) {
        console.warn('Canvas export failed, falling back to text copy', e)
        await navigator.clipboard.writeText(content || '')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }, async () => {
      // Fallback to copying raw code
      await navigator.clipboard.writeText(content || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [renderToCanvas, content])
  const handleTemplateSelect = useCallback((templateName: string) => {
    const template = DIAGRAM_TEMPLATES.find(t => t.name === templateName)
    if (template) {
      setContent(template.content)
    }
  }, [])


  const resetZoom = () => {
    if (panZoomRef.current) {
      panZoomRef.current.resetZoom()
      panZoomRef.current.resetPan()
      panZoomRef.current.center()
      panZoomRef.current.fit()
    }
  }

  const handleResetView = useCallback(() => {
    resetZoom()
  }, [])

  return (
    <div className="h-full min-h-0 flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-4 py-3 flex items-center justify-between gap-4 shrink-0">
        <Input
          type="text"
          placeholder="Diagram title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-medium border-0 bg-transparent px-0 focus-visible:ring-0 max-w-md"
        />
        <div className="flex items-center gap-2">
          <label className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none mr-1">
            <input
              type="checkbox"
              className="rounded border-border"
              checked={autosaveEnabled}
              onChange={(e) => setAutosaveEnabled(e.target.checked)}
            />
            Autosave
          </label>
          <span className="hidden md:inline text-xs text-muted-foreground min-w-[7rem]">
            {autosaveStatusLabel(autosaveStatus, autosaveEnabled)}
          </span>
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
          {onExpand && (
            <Button
              variant="ghost"
              size="sm"
              title="Open in full page"
              onClick={() => onExpand(payload)}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          )}
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
          <Button size="sm" onClick={handleSave} disabled={!isDirty && autosaveStatus !== 'error'}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-border px-4 py-2 flex items-center gap-4 flex-wrap shrink-0">
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
      <div className="flex-1 flex min-h-0">
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2 border-r border-border' : 'w-full'} flex flex-col min-h-0`}>
            <div
              ref={editorRef}
              className={`flex-1 overflow-auto min-h-0 ${resolvedTheme === 'dark' ? 'bg-[#282c34]' : 'bg-background'}`}
            />
          </div>
        )}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} p-4 flex flex-col min-h-0`}>
            <div
              ref={previewRef}
              className="flex-1 bg-card rounded-lg border border-border overflow-hidden relative cursor-grab"
            >
              {error ? (
                <div className="absolute inset-0 flex items-center justify-center p-4 overflow-auto">
                  <div className="text-destructive text-sm max-w-full">
                    <p className="font-medium mb-2 text-center">Diagram Error</p>
                    <pre className="text-xs bg-destructive/10 p-3 rounded whitespace-pre-wrap break-words text-left">{error}</pre>
                  </div>
                </div>
              ) : renderedSvg ? (
                <>
                  <div
                    className="diagram-preview w-full h-full"
                    dangerouslySetInnerHTML={{ __html: renderedSvg }}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-3 right-3 opacity-70 hover:opacity-100 z-10"
                    onClick={handleResetView}
                  >
                    <Maximize2 className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-muted-foreground">Loading preview...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Hidden container for export */}
      <div ref={exportContainerRef} style={{ position: 'absolute', left: '-9999px', visibility: 'hidden' }} />
    </div>
  )
}
