import { useEffect, useRef, useCallback } from 'react'
import mermaid from 'mermaid'
import '../styles/markdown.css'

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'inherit'
})

let mermaidId = 0

interface Props {
  html: string
  searchQuery: string
  onActiveHeadingChange: (id: string) => void
  onSearchMatchesChange?: (current: number, total: number) => void
  zoom?: number
  isDark?: boolean
}

// ── Search highlight helpers ────────────────────────────────────────────────
function highlightSearchMatches(container: HTMLElement, query: string): HTMLElement[] {
  clearSearchHighlights(container)
  if (!query.trim()) return []

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(escaped, 'gi')
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement
      if (!parent) return NodeFilter.FILTER_REJECT
      if (parent.closest('pre, code, script, style, .mermaid-diagram, .math-block')) return NodeFilter.FILTER_REJECT
      if (parent.classList.contains('search-match')) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    }
  })

  const textNodes: Text[] = []
  let n: Node | null
  while ((n = walker.nextNode())) textNodes.push(n as Text)

  const marks: HTMLElement[] = []
  for (const textNode of textNodes) {
    const text = textNode.textContent || ''
    if (!regex.test(text)) { regex.lastIndex = 0; continue }
    regex.lastIndex = 0

    const frag = document.createDocumentFragment()
    let last = 0
    let m: RegExpExecArray | null
    while ((m = regex.exec(text)) !== null) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)))
      const mark = document.createElement('mark')
      mark.className = 'search-match'
      mark.textContent = m[0]
      frag.appendChild(mark)
      marks.push(mark)
      last = m.index + m[0].length
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)))
    textNode.replaceWith(frag)
  }
  return marks
}

function clearSearchHighlights(container: HTMLElement) {
  container.querySelectorAll('mark.search-match').forEach(mark => {
    const text = document.createTextNode(mark.textContent || '')
    mark.replaceWith(text)
  })
  container.normalize()
}

// ── Wide-table scroll wrapper ────────────────────────────────────────────────
// CSV-derived tables can have many columns. Wrap each <table> in a scrollable
// container so wide tables get horizontal scroll instead of pushing the layout.
function wrapWideTables(container: HTMLElement) {
  container.querySelectorAll<HTMLTableElement>('table').forEach(table => {
    if (table.parentElement?.classList.contains('table-wrap')) return
    const wrap = document.createElement('div')
    wrap.className = 'table-wrap'
    table.parentNode?.insertBefore(wrap, table)
    wrap.appendChild(table)
  })
}

// ── Copy button logic ────────────────────────────────────────────────────────
function attachCopyButtons(container: HTMLElement) {
  container.querySelectorAll<HTMLButtonElement>('.copy-btn').forEach(btn => {
    btn.onclick = () => {
      const code = btn.nextElementSibling?.textContent || ''
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = '¡Copiado!'
        setTimeout(() => { btn.textContent = 'Copiar' }, 2000)
      })
    }
  })
}

// ── Mermaid rendering ────────────────────────────────────────────────────────
async function renderMermaid(container: HTMLElement, isDark: boolean) {
  mermaid.initialize({
    startOnLoad: false,
    theme: isDark ? 'dark' : 'default',
    securityLevel: 'loose',
    fontFamily: 'inherit'
  })
  const diagrams = container.querySelectorAll<HTMLElement>('.mermaid-diagram')
  for (const el of diagrams) {
    const src = decodeURIComponent(el.dataset.src || '')
    if (!src) continue
    try {
      const id = `mermaid-${++mermaidId}`
      const { svg } = await mermaid.render(id, src)
      el.innerHTML = svg
      el.removeAttribute('data-src')
    } catch (err) {
      el.innerHTML = `<pre class="mermaid-error">Mermaid error: ${String(err)}</pre>`
    }
  }
}

export default function MarkdownView({ html, searchQuery, onActiveHeadingChange, onSearchMatchesChange, zoom = 1, isDark = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const searchMarksRef = useRef<HTMLElement[]>([])
  const currentMatchRef = useRef(0)
  const onSearchMatchesChangeRef = useRef(onSearchMatchesChange)
  onSearchMatchesChangeRef.current = onSearchMatchesChange

  const reportMatches = useCallback(() => {
    const total = searchMarksRef.current.length
    const current = total ? currentMatchRef.current + 1 : 0
    onSearchMatchesChangeRef.current?.(current, total)
  }, [])

  // Render HTML + mermaid + copy buttons
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.innerHTML = html
    attachCopyButtons(el)
    wrapWideTables(el)
    renderMermaid(el, isDark)
    // Re-apply search if active
    if (searchQuery) {
      searchMarksRef.current = highlightSearchMatches(el, searchQuery)
      currentMatchRef.current = 0
      searchMarksRef.current[0]?.classList.add('search-match--current')
      searchMarksRef.current[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      reportMatches()
    }
  }, [html]) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-render Mermaid diagrams when theme changes
  useEffect(() => {
    const el = containerRef.current
    if (!el || !html) return
    // Restore original html to get back data-src attributes, then re-render
    el.innerHTML = html
    attachCopyButtons(el)
    wrapWideTables(el)
    renderMermaid(el, isDark)
  }, [isDark]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update search highlights without re-rendering HTML
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    searchMarksRef.current = highlightSearchMatches(el, searchQuery)
    currentMatchRef.current = 0
    if (searchMarksRef.current.length) {
      searchMarksRef.current[0].classList.add('search-match--current')
      searchMarksRef.current[0].scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    reportMatches()
  }, [searchQuery, reportMatches])

  // Keyboard navigation for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const marks = searchMarksRef.current
      if (!marks.length) return
      if (e.key === 'Enter' && searchQuery) {
        e.preventDefault()
        marks[currentMatchRef.current]?.classList.remove('search-match--current')
        currentMatchRef.current = e.shiftKey
          ? (currentMatchRef.current - 1 + marks.length) % marks.length
          : (currentMatchRef.current + 1) % marks.length
        marks[currentMatchRef.current]?.classList.add('search-match--current')
        marks[currentMatchRef.current]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        reportMatches()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [searchQuery, reportMatches])

  // Active heading via IntersectionObserver
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const headings = el.querySelectorAll<HTMLElement>('h1, h2, h3, h4')
    if (!headings.length) return

    const observer = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            onActiveHeadingChange((e.target as HTMLElement).id || '')
            break
          }
        }
      },
      { rootMargin: '-10% 0px -80% 0px', threshold: 0 }
    )
    headings.forEach(h => observer.observe(h))
    return () => observer.disconnect()
  }, [html, onActiveHeadingChange])

  return (
    <main className="markdown-scroll">
      <article
        ref={containerRef}
        className="markdown-body"
        style={{ fontSize: `${zoom}em` }}
      />
    </main>
  )
}
