import { useCallback, useRef } from 'react'
import Editor from './Editor'
import MarkdownView from './MarkdownView'

interface Props {
  draft: string
  onChange: (value: string) => void
  // Rendered HTML of the (debounced) draft.
  html: string
  showPreview: boolean
  zoom: number
  isDark: boolean
}

const noop = () => {}

// Editor on one side, live rendered preview on the other. With the preview
// hidden it is just the editor.
export default function EditView({ draft, onChange, html, showPreview, zoom, isDark }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)

  // Keep the preview roughly aligned with where the editor is scrolled.
  const syncPreviewScroll = useCallback((ratio: number) => {
    const preview = rootRef.current?.querySelector<HTMLElement>('.markdown-scroll')
    if (!preview) return
    preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight)
  }, [])

  return (
    <div ref={rootRef} className="edit-split">
      <Editor value={draft} onChange={onChange} zoom={zoom} onScrollRatio={showPreview ? syncPreviewScroll : undefined} />
      {showPreview && (
        <>
          <div className="edit-split-divider" />
          <MarkdownView
            html={html}
            searchQuery=""
            onActiveHeadingChange={noop}
            zoom={zoom}
            isDark={isDark}
          />
        </>
      )}
    </div>
  )
}
