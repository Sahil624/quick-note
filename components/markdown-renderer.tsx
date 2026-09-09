'use client'

import { useEffect, useRef, useMemo, memo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { renderMermaid } from '@/lib/mermaid'

interface MarkdownRendererProps {
  content: string
  className?: string
}

function parseMarkdown(text: string): string {
  let html = text

  // Handle code blocks with mermaid
  html = html.replace(/```mermaid\n([\s\S]*?)```/g, (_, code) => {
    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`
    return `<div class="mermaid-container" data-mermaid="${encodeURIComponent(code.trim())}" id="${id}"></div>`
  })

  // Handle code blocks with language
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="code-block"><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`
  })

  // Handle inline code
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')

  // Handle math blocks ($$...$$)
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      return `<div class="math-block">${katex.renderToString(math.trim(), { displayMode: true, throwOnError: false })}</div>`
    } catch {
      return `<div class="math-block math-error">${escapeHtml(math)}</div>`
    }
  })

  // Handle inline math ($...$)
  html = html.replace(/\$([^$\n]+)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false })
    } catch {
      return `<span class="math-error">${escapeHtml(math)}</span>`
    }
  })

  // Handle headers
  html = html.replace(/^#### (.+)$/gm, '<h4 class="md-h4">$1</h4>')
  html = html.replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1 class="md-h1">$1</h1>')

  // Handle bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/_(.+?)_/g, '<em>$1</em>')

  // Handle strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>')

  // Handle links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>')

  // Handle images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="md-image" />')

  // Handle blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote class="md-blockquote">$1</blockquote>')

  // Handle unordered lists
  html = html.replace(/^[\-\*] (.+)$/gm, '<li class="md-li">$1</li>')
  html = html.replace(/(<li class="md-li">[\s\S]*?<\/li>)+/g, '<ul class="md-ul">$&</ul>')

  // Handle ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="md-oli">$1</li>')
  html = html.replace(/(<li class="md-oli">[\s\S]*?<\/li>)+/g, '<ol class="md-ol">$&</ol>')

  // Handle horizontal rules
  html = html.replace(/^---$/gm, '<hr class="md-hr" />')

  // Handle paragraphs (only for lines that aren't already wrapped)
  const lines = html.split('\n')
  const processedLines = lines.map((line) => {
    if (
      line.trim() &&
      !line.startsWith('<') &&
      !line.includes('</') &&
      !line.match(/^(#{1,4}|>|\-|\*|\d+\.)/)
    ) {
      return `<p class="md-p">${line}</p>`
    }
    return line
  })
  html = processedLines.join('\n')

  return html
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function MarkdownRendererComponent({ content, className = '' }: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const htmlContent = useMemo(() => parseMarkdown(content), [content])

  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false

    const mermaidContainers = Array.from(
      containerRef.current.querySelectorAll('.mermaid-container')
    ) as HTMLElement[]

    ;(async () => {
      for (const container of mermaidContainers) {
        if (cancelled) return
        const code = decodeURIComponent(container.getAttribute('data-mermaid') || '')
        if (!code) continue
        try {
          const { svg } = await renderMermaid(code, container.id || 'md-mermaid')
          if (!cancelled) container.innerHTML = svg
        } catch (error) {
          if (!cancelled) {
            const message = error instanceof Error ? error.message : String(error)
            container.innerHTML = `<div class="mermaid-error">${escapeHtml(message)}</div>`
          }
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [htmlContent])

  return (
    <div
      ref={containerRef}
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}

export const MarkdownRenderer = memo(MarkdownRendererComponent)
