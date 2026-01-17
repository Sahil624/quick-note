import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getNote, saveNote } from '../services/db'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import mermaid from 'mermaid'
import katex from 'katex'
import 'katex/dist/katex.min.css'

// --- 1. Helper Components (Mermaid, Math, Code) ---

// Initialize Mermaid
mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
        primaryColor: '#F7B05B',
        primaryTextColor: '#1f2937',
        lineColor: '#e5e7eb',
    },
    securityLevel: 'loose',
})

function MermaidDiagram({ chart, id }) {
    const containerRef = useRef(null)
    const [svg, setSvg] = useState('')
    const [error, setError] = useState(null)

    useEffect(() => {
        const renderDiagram = async () => {
            try {
                const uniqueId = `mermaid-${id}-${Date.now()}`
                const { svg } = await mermaid.render(uniqueId, chart)
                setSvg(svg)
                setError(null)
            } catch (err) {
                console.error(err)
                setError("Syntax Error")
            }
        }
        if (chart) renderDiagram()
    }, [chart, id])

    return (
        <div className="flex justify-center my-6 group relative">
            {error ? (
                <div className="p-4 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100 w-full text-center">
                    Diagram Error: Check syntax
                </div>
            ) : (
                <div
                    ref={containerRef}
                    className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm overflow-x-auto"
                    dangerouslySetInnerHTML={{ __html: svg }}
                />
            )}
        </div>
    )
}

function MathBlock({ math, inline = false }) {
    const [html, setHtml] = useState('')
    const [error, setError] = useState(null)

    useEffect(() => {
        try {
            const rendered = katex.renderToString(math, {
                displayMode: !inline,
                throwOnError: false,
                errorColor: '#ef4444',
            })
            setHtml(rendered)
            setError(null)
        } catch (err) {
            setError(err.message)
        }
    }, [math, inline])

    if (error) return <span className="text-red-500 text-xs bg-red-50 px-1 rounded">{error}</span>
    if (inline) return <span dangerouslySetInnerHTML={{ __html: html }} className="mx-1" />

    return (
        <div
            className="my-6 p-4 bg-gray-50 rounded-xl overflow-x-auto flex justify-center border border-gray-100"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    )
}

function CodeBlock({ children, className, node, ...props }) {
    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : ''
    const content = String(children).replace(/\n$/, '')
    const idRef = useRef(Math.random().toString(36).substring(7))

    if (language === 'mermaid') return <MermaidDiagram chart={content} id={idRef.current} />
    if (language === 'latex' || language === 'math') return <MathBlock math={content} />

    return (
        <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 my-4 overflow-x-auto text-sm shadow-lg shadow-gray-200/50">
            <code className={className} {...props}>
                {children}
            </code>
        </pre>
    )
}

function processInlineMath(text) {
    if (typeof text !== 'string') return text
    const parts = []
    const regex = /\$([^$]+)\$/g
    let lastIndex = 0
    let match
    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
        parts.push(<MathBlock key={match.index} math={match[1]} inline />)
        lastIndex = regex.lastIndex
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex))
    return parts.length > 0 ? parts : text
}

// --- 2. Main Editor Component ---

export default function NoteEditor() {
    const { id } = useParams()
    const { user } = useAuth()

    // State
    const [content, setContent] = useState('')
    const [title, setTitle] = useState('Untitled')
    const [tags, setTags] = useState([]) // New State for Tags
    const [tagInput, setTagInput] = useState('') // Temp input for tags
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [mode, setMode] = useState('edit')

    // Refs
    const textareaRef = useRef(null)

    // Load Data
    useEffect(() => {
        async function load() {
            if (!id) return
            setIsLoading(true)
            const note = await getNote(id)
            if (note) {
                setContent(note.content || '')
                setTitle(note.title || 'Untitled')
                setTags(note.tags || []) // Load tags
            }
            setIsLoading(false)
        }
        load()
    }, [id])

    // Auto-Save
    useEffect(() => {
        if (isLoading || !id) return
        setIsSaving(true)
        const timer = setTimeout(() => {
            saveNote({ id, content, title, tags, ownerId: user?.uid }) // Save tags
            setIsSaving(false)
        }, 1000)
        return () => clearTimeout(timer)
    }, [content, title, tags, id, user, isLoading])

    // Auto-Grow Textarea
    const adjustTextareaHeight = useCallback(() => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = 'auto'
            textarea.style.height = `${textarea.scrollHeight}px`
        }
    }, [])

    useEffect(() => {
        if (mode === 'edit') adjustTextareaHeight()
    }, [content, mode, adjustTextareaHeight])

    // Tag Handlers
    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            const newTag = tagInput.trim().replace(/^#/, '') // Remove # if user typed it
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag])
                setTagInput('')
            }
        }
        if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
            setTags(tags.slice(0, -1))
        }
    }

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(t => t !== tagToRemove))
    }

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#FAFAFA]">
                <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        // Container: h-screen + overflow-hidden to fix the window size
        <div className="h-screen w-full bg-[#FAFAFA] flex flex-col font-sans text-gray-800 overflow-hidden markdown-editor">

            {/* Header: Flex-none to stay fixed at top */}
            <div className="flex-none bg-[#FAFAFA]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-gray-100 z-40">
                <div className="flex items-center gap-4">
                    <Link to="/app" className="p-2 -ml-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-full transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </Link>
                    <span className={`text-xs font-medium uppercase tracking-wider transition-opacity duration-500 ${isSaving ? 'text-orange-400 opacity-100' : 'text-gray-300 opacity-0'}`}>
                        Saving...
                    </span>
                </div>

                <div className="flex bg-gray-200/50 p-1 rounded-full relative">
                    <button
                        onClick={() => setMode('edit')}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 z-10 ${mode === 'edit' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Write
                    </button>
                    <button
                        onClick={() => setMode('view')}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 z-10 ${mode === 'view' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Preview
                    </button>
                </div>
            </div>

            {/* Content Area: Flex-1 + Overflow-y-auto to enable internal scrolling */}
            <div className="flex-1 overflow-y-auto">
                <main className="w-full max-w-3xl mx-auto p-8 md:p-12 pb-32">

                    {/* Title */}
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Write down your ideas..."
                        className="w-full text-4xl md:text-5xl font-bold bg-transparent border-none placeholder-gray-300 text-gray-900 focus:ring-0 px-0 mb-4 leading-tight tracking-tight"
                    />

                    {/* Editable Tags Area */}
                    <div className="flex flex-wrap items-center gap-2 mb-10 min-h-[30px]">
                        {tags.map((tag) => (
                            <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-orange-50 text-orange-500 border border-orange-100 group">
                                #{tag}
                                <button
                                    onClick={() => removeTag(tag)}
                                    className="ml-1.5 text-orange-300 hover:text-orange-600 focus:outline-none"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            placeholder={tags.length === 0 ? "Add tags (press Enter)..." : "Add tag..."}
                            className="bg-transparent border-none focus:ring-0 p-0 text-sm text-gray-500 placeholder-gray-300 w-40"
                        />
                    </div>

                    {/* Editor / Preview Content */}
                    <div className="relative min-h-[50vh]">

                        {/* Edit Mode */}
                        <div className={`${mode === 'edit' ? 'block' : 'hidden'} animate-fadeIn`}>
                            <textarea
                                ref={textareaRef}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Start typing your story, notes, or paste markdown..."
                                className="w-full bg-transparent border-none resize-none focus:ring-0 p-0 text-lg leading-relaxed text-gray-700 font-normal placeholder-gray-300 overflow-hidden"
                                style={{ minHeight: '300px' }}
                                spellCheck={false}
                            />
                            <div className="mt-8 pt-8 border-t border-gray-100 text-gray-400 text-sm">
                                <p>Markdown supported: **bold**, # Heading, ```code```, $$math$$, ```mermaid```</p>
                            </div>
                        </div>

                        {/* View Mode */}
                        <div className={`${mode === 'view' ? 'block' : 'hidden'} animate-fadeIn`}>
                            <div
                                className="prose prose-lg prose-gray max-w-none 
                                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900
                                prose-p:text-gray-600 prose-p:leading-loose
                                prose-a:text-orange-500 prose-a:no-underline hover:prose-a:underline
                                prose-blockquote:border-l-4 prose-blockquote:border-orange-200 prose-blockquote:bg-orange-50/30 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                                prose-code:text-orange-600 prose-code:bg-orange-50 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                                prose-img:rounded-2xl prose-img:shadow-lg"
                            >
                                <Markdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        code: CodeBlock,
                                        p: ({ children }) => (
                                            <p className="mb-6">
                                                {Array.isArray(children)
                                                    ? children.map((child, i) => typeof child === 'string' ? processInlineMath(child) : child)
                                                    : processInlineMath(children)
                                                }
                                            </p>
                                        ),
                                    }}
                                >
                                    {content}
                                </Markdown>
                            </div>
                            {!content.trim() && (
                                <div className="text-center py-20 text-gray-300">
                                    <p className="text-lg">This note is empty.</p>
                                    <button onClick={() => setMode('edit')} className="mt-2 text-orange-400 hover:text-orange-500 font-medium">Start writing</button>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}