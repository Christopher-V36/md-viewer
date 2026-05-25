import { useRef, useCallback } from 'react'
import type { TOCItem, FrontmatterData } from '../types'

interface Props {
  toc: TOCItem[]
  frontmatter: FrontmatterData
  activeHeading: string
  width: number
  onWidthChange: (w: number) => void
}

function TOCNode({ item, active, depth }: { item: TOCItem; active: string; depth: number }) {
  const isActive = item.id === active

  const handleClick = () => {
    const el = document.getElementById(item.id)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <li>
      <button
        className={`toc-item toc-item--l${item.level} ${isActive ? 'toc-item--active' : ''}`}
        style={{ paddingLeft: `${(depth * 12) + 8}px` }}
        onClick={handleClick}
        title={item.text}
      >
        {item.text}
      </button>
      {item.children.length > 0 && (
        <ul className="toc-list">
          {item.children.map(child => (
            <TOCNode key={child.id} item={child} active={active} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  )
}

function FrontmatterPanel({ data }: { data: FrontmatterData }) {
  const entries = Object.entries(data).filter(([, v]) => v !== undefined && v !== null)
  if (!entries.length) return null

  const formatValue = (v: unknown): string => {
    if (Array.isArray(v)) return v.join(', ')
    if (v instanceof Date) return v.toLocaleDateString()
    return String(v)
  }

  return (
    <div className="frontmatter-panel">
      <div className="sidebar-section-title">Metadata</div>
      <dl className="frontmatter-list">
        {entries.map(([key, val]) => (
          <div key={key} className="frontmatter-row">
            <dt className="frontmatter-key">{key}</dt>
            <dd className="frontmatter-val">{formatValue(val)}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export default function Sidebar({ toc, frontmatter, activeHeading, width, onWidthChange }: Props) {
  const hasFrontmatter = Object.keys(frontmatter).length > 0
  const hasTOC = toc.length > 0
  const dragging = useRef(false)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    dragging.current = true
    const el = e.currentTarget as HTMLElement
    el.setPointerCapture(e.pointerId)

    const onMove = (ev: PointerEvent) => {
      if (!dragging.current) return
      const newW = Math.min(280, Math.max(120, ev.clientX))
      onWidthChange(newW)
    }
    const onUp = () => {
      dragging.current = false
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
    }
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }, [onWidthChange])

  return (
    <aside className="sidebar" style={{ width }}>
      {hasFrontmatter && <FrontmatterPanel data={frontmatter} />}
      {hasTOC && (
        <div className="toc-panel">
          <div className="sidebar-section-title">Contents</div>
          <nav>
            <ul className="toc-list">
              {toc.map(item => (
                <TOCNode key={item.id} item={item} active={activeHeading} depth={0} />
              ))}
            </ul>
          </nav>
        </div>
      )}
      {!hasFrontmatter && !hasTOC && (
        <div className="sidebar-empty">No headings found</div>
      )}
      <div className="sidebar-resize" onPointerDown={onPointerDown} />
    </aside>
  )
}
