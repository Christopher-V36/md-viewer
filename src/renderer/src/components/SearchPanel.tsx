import { useEffect, useRef } from 'react'

interface Props {
  query: string
  onQueryChange: (q: string) => void
  onClose: () => void
  currentMatch: number
  totalMatches: number
}

export default function SearchPanel({ query, onQueryChange, onClose, currentMatch, totalMatches }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const counterLabel = !query.trim()
    ? null
    : totalMatches === 0
      ? 'Sin resultados'
      : `${currentMatch} / ${totalMatches}`

  return (
    <div className="search-panel">
      <div className="search-inner">
        <svg className="search-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="6.5" cy="6.5" r="4.5" />
          <line x1="10" y1="10" x2="14" y2="14" />
        </svg>
        <input
          ref={inputRef}
          className="search-input"
          type="text"
          placeholder="Search in document…"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          spellCheck={false}
        />
        {counterLabel && (
          <span
            className={`search-counter ${totalMatches === 0 ? 'search-counter--empty' : ''}`}
            aria-live="polite"
          >
            {counterLabel}
          </span>
        )}
        {query && (
          <button className="search-clear" onClick={() => onQueryChange('')} title="Clear">
            ✕
          </button>
        )}
        <span className="search-hint">↵ next · ⇧↵ prev · Esc close</span>
        <button className="search-close" onClick={onClose} title="Close search">✕</button>
      </div>
    </div>
  )
}
