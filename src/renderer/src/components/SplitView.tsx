import { useMemo } from 'react'
import { useMarkdown } from '../hooks/useMarkdown'
import MarkdownView from './MarkdownView'
import type { Tab } from '../types'
import { basename } from '../supported'

interface Props {
  tabs: Tab[]
  leftTabId: string
  rightTabId: string | null
  onSelectRight: (id: string) => void
  onOpenRecent: (path: string) => void
  onClose: () => void
  zoom: number
  isDark: boolean
  sidebarOpen: boolean
  recentFiles: string[]
}

export default function SplitView({
  tabs, leftTabId, rightTabId, onSelectRight, onOpenRecent, onClose, zoom, isDark, recentFiles
}: Props) {
  const leftTab = useMemo(() => tabs.find(t => t.id === leftTabId) ?? null, [tabs, leftTabId])
  const rightTab = useMemo(() => tabs.find(t => t.id === rightTabId) ?? null, [tabs, rightTabId])

  const leftMd = useMarkdown(leftTab?.content ?? null, leftTab?.filePath ?? null)
  const rightMd = useMarkdown(rightTab?.content ?? null, rightTab?.filePath ?? null)

  const otherTabs = useMemo(() => tabs.filter(t => t.id !== leftTabId), [tabs, leftTabId])
  const openPaths = useMemo(() => new Set(tabs.map(t => t.filePath)), [tabs])
  const recentOnly = useMemo(() => recentFiles.filter(p => !openPaths.has(p)), [recentFiles, openPaths])

  const handleSelect = (value: string) => {
    if (value.startsWith('recent:')) {
      onOpenRecent(value.slice(7))
    } else {
      onSelectRight(value)
    }
  }

  return (
    <div className="split-view">
      <div className="split-pane">
        <div className="split-pane-header">
          <span className="split-pane-title">{leftTab ? basename(leftTab.filePath) : ''}</span>
        </div>
        <div className="split-pane-body">
          <MarkdownView
            html={leftMd.html}
            searchQuery=""
            onActiveHeadingChange={() => {}}
            zoom={zoom}
            isDark={isDark}
          />
        </div>
      </div>
      <div className="split-divider" />
      <div className="split-pane">
        <div className="split-pane-header">
          {rightTab ? (
            <span className="split-pane-title">{basename(rightTab.filePath)}</span>
          ) : (
            <select
              className="split-pane-select"
              value=""
              onChange={e => handleSelect(e.target.value)}
            >
              <option value="" disabled>Elegir documento…</option>
              {otherTabs.length > 0 && (
                <optgroup label="Abiertos">
                  {otherTabs.map(t => (
                    <option key={t.id} value={t.id}>{basename(t.filePath)}</option>
                  ))}
                </optgroup>
              )}
              {recentOnly.length > 0 && (
                <optgroup label="Recientes">
                  {recentOnly.map(p => (
                    <option key={p} value={`recent:${p}`}>{basename(p)}</option>
                  ))}
                </optgroup>
              )}
            </select>
          )}
          <button className="split-close-btn" onClick={onClose} title="Cerrar vista dividida">✕</button>
        </div>
        <div className="split-pane-body">
          {rightTab ? (
            <MarkdownView
              html={rightMd.html}
              searchQuery=""
              onActiveHeadingChange={() => {}}
              zoom={zoom}
              isDark={isDark}
            />
          ) : (
            <div className="split-placeholder">Selecciona un documento para comparar</div>
          )}
        </div>
      </div>
    </div>
  )
}
