'use client'

import mermaid from 'mermaid'

let initialized = false

function ensureMermaidInitialized() {
  if (initialized) return
  mermaid.initialize({
    startOnLoad: false,
    theme: 'neutral',
    securityLevel: 'loose',
    fontFamily: 'inherit',
    // Prevent Mermaid from injecting a giant "Syntax error in text" SVG into the DOM
    suppressErrorRendering: true,
  })
  initialized = true
}

let renderChain: Promise<unknown> = Promise.resolve()

function uniqueRenderId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** Remove leftover Mermaid temp/error nodes that can leak into the page. */
export function cleanupMermaidDom() {
  if (typeof document === 'undefined') return
  document.querySelectorAll('svg[aria-roledescription="error"], svg[id^="d"]').forEach((el) => {
    const text = el.textContent || ''
    if (text.includes('Syntax error in text') || text.includes('mermaid version')) {
      el.remove()
    }
  })
}

/**
 * Serialize mermaid.render calls. Concurrent renders corrupt Mermaid's
 * shared parser state and produce spurious "Syntax error in text" UI.
 */
export function renderMermaid(
  code: string,
  idPrefix = 'mermaid'
): Promise<{ svg: string; id: string }> {
  ensureMermaidInitialized()

  const trimmed = code.trim()
  if (!trimmed) {
    return Promise.reject(new Error('Diagram is empty'))
  }

  const id = uniqueRenderId(idPrefix)

  const job = renderChain.then(async () => {
    try {
      const { svg } = await mermaid.render(id, trimmed)
      return { svg, id }
    } catch (error) {
      cleanupMermaidDom()
      const message =
        error instanceof Error
          ? error.message.replace(/\s*mermaid version [\d.]+\s*/i, '').trim()
          : 'Invalid diagram syntax'
      const preview = trimmed.split('\n').slice(0, 4).join('\n')
      throw new Error(
        message.includes('Syntax error')
          ? `Mermaid could not parse this diagram.\n\n${preview}${trimmed.split('\n').length > 4 ? '\n…' : ''}`
          : message
      )
    } finally {
      // Temp nodes Mermaid attaches under body during render
      document.getElementById(`d${id}`)?.remove()
      document.getElementById(id)?.remove()
    }
  })

  renderChain = job.then(
    () => undefined,
    () => undefined
  )

  return job
}
