import { useState, useEffect, useRef, useMemo } from 'react'
import type { Tab } from '../types'
import { basename } from '../supported'

interface Match {
  tabId: string
  filePath: string
  lineNum: number
  lineText: string
  matchStart: number
  matchEnd: number
}

interface Props {
  tabs: Tab[]
  onNavigate: (tabId: string) => void
  onClose: () => void
}

function findMatches(tabs: Tab[], query: string): Match[] {
  if (!query.trim()) return []
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(escaped, 'gi')
  const results: Match[] = []
  for (const tab of tabs) {
    const lines = tab.content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      regex.lastIndex = 0
      let m: RegExpExecArray | null
      while ((m = regex.exec(lines[i])) !== null) {
        results.push({
          tabId: tab.id,
          filePath: tab.filePath,
          lineNum: i + 1,
          lineText: lines[i],
          matchStart: m.index,
          matchEnd: m.index + m[0].length,
        })
      }
    }
  }
  return results
}

export default function GlobalSearchPanel({ tabs, onNavigate, onClose }: Props) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const matches = useMemo(() => findMatches(tabs, query), [tabs, query])

  const grouped = useMemo(() => {
    const map = new Map<string, Match[]>()
    for (const m of matches) {
      const list = map.get(m.tabId) || []
      list.push(m)
      map.set(m.tabId, list)
    }
    return map
  }, [matches])

  return (
    <div className="global-search-panel">
      <div className="global-search-header">
        <svg className="search-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="6.5" cy="6.5" r="4.5" />
          <line x1="10" y1="10" x2="14" y2="14" />
        </svg>
        <input
          ref={inputRef}
          className="global-search-input"
          type="text"
          placeholder="Buscar en todos los archivos abiertos…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          spellCheck={false}
        />
        {query && (
          <span className="global-search-count">
            {matches.length} resultado{matches.length !== 1 ? 's' : ''}
          </span>
        )}
        <button className="global-search-close" onClick={onClose} title="Cerrar (Esc)">✕</button>
      </div>
      <div className="global-search-results">
        {query && matches.length === 0 && (
          <div className="global-search-empty">Sin resultados</div>
        )}
        {[...grouped.entries()].map(([tabId, fileMatches]) => (
          <div key={tabId} className="global-search-file">
            <div className="global-search-file-header">
              <span className="global-search-file-name">{basename(fileMatches[0].filePath)}</span>
              <span className="global-search-file-count">{fileMatches.length}</span>
            </div>
            {fileMatches.slice(0, 50).map((m, i) => (
              <button
                key={i}
                className="global-search-match"
                onClick={() => onNavigate(m.tabId)}
                title={`Línea ${m.lineNum}`}
              >
                <span className="global-search-line-num">{m.lineNum}</span>
                <span className="global-search-line-text">
                  {m.lineText.slice(Math.max(0, m.matchStart - 40), m.matchStart)}
                  <mark>{m.lineText.slice(m.matchStart, m.matchEnd)}</mark>
                  {m.lineText.slice(m.matchEnd, m.matchEnd + 80)}
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
