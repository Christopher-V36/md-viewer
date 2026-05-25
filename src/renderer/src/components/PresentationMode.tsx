import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useMarkdown } from '../hooks/useMarkdown'

interface Props {
  content: string
  filePath: string | null
  isDark: boolean
  onExit: () => void
}

function splitSlides(content: string): string[] {
  // Split on --- at the start of a line (horizontal rule), or on ## headings.
  // We try --- first; if it yields only 1 slide, fall back to ## splitting.
  const hrSlides = content.split(/\n---\n/).map(s => s.trim()).filter(Boolean)
  if (hrSlides.length > 1) return hrSlides

  // Split by ## headings — keep the heading as part of each slide.
  const parts: string[] = []
  const lines = content.split('\n')
  let current: string[] = []
  for (const line of lines) {
    if (/^##\s/.test(line) && current.length > 0) {
      parts.push(current.join('\n').trim())
      current = []
    }
    current.push(line)
  }
  if (current.length) parts.push(current.join('\n').trim())
  return parts.filter(Boolean)
}

function SlideRenderer({ markdown, filePath }: { markdown: string; filePath: string | null }) {
  const { html } = useMarkdown(markdown, filePath)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = html
  }, [html])

  return <div ref={ref} className="presentation-slide-content markdown-body" />
}

export default function PresentationMode({ content, filePath, isDark, onExit }: Props) {
  const slides = useMemo(() => splitSlides(content), [content])
  const [current, setCurrent] = useState(0)

  const goNext = useCallback(() => setCurrent(i => Math.min(i + 1, slides.length - 1)), [slides.length])
  const goPrev = useCallback(() => setCurrent(i => Math.max(i - 1, 0)), [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onExit(); return }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); goNext() }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); goPrev() }
      if (e.key === 'Home') { e.preventDefault(); setCurrent(0) }
      if (e.key === 'End') { e.preventDefault(); setCurrent(slides.length - 1) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onExit, goNext, goPrev, slides.length])

  return (
    <div className="presentation-overlay" onClick={goNext}>
      <div className="presentation-slide" onClick={e => e.stopPropagation()}>
        <SlideRenderer
          markdown={slides[current] || ''}
          filePath={filePath}
        />
      </div>
      <div className="presentation-controls" onClick={e => e.stopPropagation()}>
        <button onClick={goPrev} disabled={current === 0} className="presentation-nav">←</button>
        <span className="presentation-counter">{current + 1} / {slides.length}</span>
        <button onClick={goNext} disabled={current === slides.length - 1} className="presentation-nav">→</button>
        <button onClick={onExit} className="presentation-exit" title="Salir (Esc)">✕</button>
      </div>
      <div className="presentation-progress">
        <div
          className="presentation-progress-bar"
          style={{ width: `${((current + 1) / slides.length) * 100}%` }}
        />
      </div>
    </div>
  )
}
