import { useEffect, useRef } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
  zoom: number
  // How far the editor is scrolled, 0..1 — lets a neighbouring preview follow.
  onScrollRatio?: (ratio: number) => void
}

export default function Editor({ value, onChange, zoom, onScrollRatio }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { ref.current?.focus() }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab indents instead of jumping out of the field (nested lists, code).
    // execCommand keeps the browser's native undo stack intact.
    if (e.key === 'Tab' && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) {
      e.preventDefault()
      document.execCommand('insertText', false, '  ')
    }
  }

  return (
    <div className="editor-pane">
      <textarea
        ref={ref}
        className="editor-textarea"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onScroll={e => {
          const el = e.currentTarget
          const max = el.scrollHeight - el.clientHeight
          onScrollRatio?.(max > 0 ? el.scrollTop / max : 0)
        }}
        spellCheck={false}
        aria-label="Editor de Markdown"
        style={{ fontSize: `${14 * zoom}px` }}
      />
    </div>
  )
}
