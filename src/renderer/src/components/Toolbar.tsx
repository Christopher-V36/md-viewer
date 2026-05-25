import { useState, useEffect, useRef } from 'react'

interface Props {
  filename: string | null
  filePath: string | null
  isDark: boolean
  onCycleTheme: () => void
  sidebarOpen: boolean
  onToggleSidebar: () => void
  onSearch: () => void
  onOpenFile: () => void
  onOpenSettings: () => void
  updatedBadge: boolean
  copiedBadge: boolean
  searchOpen: boolean
  settingsOpen: boolean
  recentFiles: string[]
  onOpenRecent: (path: string) => void
  onGoHome: (() => void) | null
  onSaveAsPdf: (() => void) | null
  onRevealFile: (() => void) | null
  onClearRecent: () => void
  onCopyMarkdown: (() => void) | null
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  recentsPanelOpen: boolean
  onToggleRecentsPanel: () => void
  onSplitView: (() => void) | null
  onPresentation: (() => void) | null
  onGlobalSearch: (() => void) | null
}

const IconMenu = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="1" y="3" width="14" height="1.5" rx="0.75" />
    <rect x="1" y="7.25" width="14" height="1.5" rx="0.75" />
    <rect x="1" y="11.5" width="14" height="1.5" rx="0.75" />
  </svg>
)
const IconHome = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 1L1 7.5h1.5V14h4v-3.5h3V14h4V7.5H15L8 1zm0 1.9l4.5 4V13h-2.5v-3.5H6V13H3.5V6.9L8 2.9z"/>
  </svg>
)
const IconSidebar = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="1" y="2" width="5" height="12" rx="1" opacity="0.5" />
    <rect x="7" y="2" width="8" height="12" rx="1" />
  </svg>
)
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="6.5" cy="6.5" r="4.5" />
    <line x1="10" y1="10" x2="14" y2="14" />
  </svg>
)
const IconFolder = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M1 3.5A1.5 1.5 0 012.5 2h3.172a1.5 1.5 0 011.06.44l.828.828A1.5 1.5 0 008.62 3.75H13.5A1.5 1.5 0 0115 5.25v7.25A1.5 1.5 0 0113.5 14h-11A1.5 1.5 0 011 12.5v-9z" />
  </svg>
)
const IconMoon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M6 .278a.768.768 0 01.08.858 7.208 7.208 0 00-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 01.81.316.733.733 0 01-.031.893A8.349 8.349 0 018.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 016 .278z"/>
  </svg>
)
const IconReveal = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M1 3.5A1.5 1.5 0 012.5 2h3.172a1.5 1.5 0 011.06.44l.829.828A1.5 1.5 0 008.62 3.75H13.5A1.5 1.5 0 0115 5.25v7.25A1.5 1.5 0 0113.5 14h-11A1.5 1.5 0 011 12.5v-9z" opacity="0.55"/>
    <path d="M8 7v4M8 7l-1.5 1.5M8 7l1.5 1.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconCopy = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="5" width="8" height="9" rx="1.5" />
    <path d="M3 11V3a1 1 0 011-1h7" />
  </svg>
)
const IconZoomIn = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="6.5" cy="6.5" r="4.5" />
    <line x1="10" y1="10" x2="14" y2="14" />
    <line x1="6.5" y1="4.5" x2="6.5" y2="8.5" />
    <line x1="4.5" y1="6.5" x2="8.5" y2="6.5" />
  </svg>
)
const IconZoomOut = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="6.5" cy="6.5" r="4.5" />
    <line x1="10" y1="10" x2="14" y2="14" />
    <line x1="4.5" y1="6.5" x2="8.5" y2="6.5" />
  </svg>
)
const IconSplit = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
    <line x1="8" y1="2.5" x2="8" y2="13.5" />
  </svg>
)
const IconPresentation = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M2 2.5A1 1 0 013 1.5h10a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1v-8z" opacity="0.6"/>
    <path d="M5 13.5l3-2 3 2" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconGlobalSearch = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="6.5" cy="6.5" r="4.5" />
    <line x1="10" y1="10" x2="14" y2="14" />
    <line x1="4.5" y1="5" x2="8.5" y2="5" />
    <line x1="4.5" y1="7" x2="7.5" y2="7" />
  </svg>
)
const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="6.25" />
    <path d="M8 4.5V8l2.25 1.5" />
  </svg>
)
const IconSliders = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="2" y1="4" x2="14" y2="4"/>
    <line x1="2" y1="8" x2="14" y2="8"/>
    <line x1="2" y1="12" x2="14" y2="12"/>
    <circle cx="5" cy="4" r="1.5" fill="var(--bg-toolbar)"/>
    <circle cx="10" cy="8" r="1.5" fill="var(--bg-toolbar)"/>
    <circle cx="6" cy="12" r="1.5" fill="var(--bg-toolbar)"/>
  </svg>
)

export default function Toolbar({
  filename, filePath, isDark, onCycleTheme, sidebarOpen,
  onToggleSidebar, onSearch, onOpenFile, onOpenSettings, updatedBadge, copiedBadge,
  searchOpen, settingsOpen, recentFiles, onOpenRecent,
  onGoHome, onSaveAsPdf, onRevealFile, onClearRecent,
  onCopyMarkdown, zoom, onZoomIn, onZoomOut, onZoomReset,
  recentsPanelOpen, onToggleRecentsPanel,
  onSplitView, onPresentation, onGlobalSearch
}: Props) {
  const dir = filePath ? (filePath.split(/[/\\]/).slice(0, -1).join('/') || filePath) : null
  const [menuOpen, setMenuOpen] = useState(false)
  const [recentOpen, setRecentOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
        setRecentOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  return (
    <header className="toolbar">
      <div className="toolbar-left">
        {/* Hamburger file menu */}
        <div className="toolbar-menu-wrap" ref={menuRef}>
          <button
            className={`toolbar-btn ${menuOpen ? 'toolbar-btn--active' : ''}`}
            onClick={() => { setMenuOpen(v => !v); setRecentOpen(false) }}
            title="Menú de archivo"
          >
            <IconMenu />
          </button>
          {menuOpen && (
            <div className="toolbar-dropdown">
              <button className="dropdown-item" onClick={() => { onOpenFile(); setMenuOpen(false) }}>
                Abrir…
                <span className="dropdown-kbd">Ctrl+O</span>
              </button>
              <div
                className="dropdown-item dropdown-item--submenu"
                onMouseEnter={() => setRecentOpen(true)}
                onMouseLeave={() => setRecentOpen(false)}
              >
                Recientes
                <span className="dropdown-arrow">›</span>
                {recentOpen && (
                  <div className="dropdown-submenu">
                    {recentFiles.length === 0
                      ? <span className="dropdown-empty">Sin archivos recientes</span>
                      : recentFiles.map(path => (
                        <button
                          key={path}
                          className="dropdown-item"
                          onClick={() => { onOpenRecent(path); setMenuOpen(false); setRecentOpen(false) }}
                          title={path}
                        >
                          {path.split(/[/\\]/).pop()}
                        </button>
                      ))
                    }
                  </div>
                )}
              </div>
              {recentFiles.length > 0 && (
                <>
                  <div className="dropdown-separator" />
                  <button
                    className="dropdown-item dropdown-item--muted"
                    onClick={() => { onClearRecent(); setMenuOpen(false) }}
                  >
                    Borrar recientes
                  </button>
                </>
              )}
              <div className="dropdown-separator" />
              <button className="dropdown-item" onClick={() => { window.print(); setMenuOpen(false) }}>
                Imprimir…
                <span className="dropdown-kbd">Ctrl+P</span>
              </button>
              {onSaveAsPdf && (
                <button className="dropdown-item" onClick={() => { onSaveAsPdf(); setMenuOpen(false) }}>
                  Descargar PDF…
                </button>
              )}
              <div className="dropdown-separator" />
              <button className="dropdown-item dropdown-item--danger" onClick={() => window.api?.quit()}>
                Salir
              </button>
            </div>
          )}
        </div>

        {/* Home button — only when a file is open */}
        {onGoHome && (
          <button
            className="toolbar-btn"
            onClick={onGoHome}
            title="Volver al inicio"
          >
            <IconHome />
          </button>
        )}

        {/* Reveal in Explorer — only when a file is open */}
        {onRevealFile && (
          <button className="toolbar-btn" onClick={onRevealFile} title="Mostrar en el explorador">
            <IconReveal />
          </button>
        )}

        {/* Sidebar toggle — only when a file is open */}
        {filePath && (
          <button
            className={`toolbar-btn ${sidebarOpen ? 'toolbar-btn--active' : ''}`}
            onClick={onToggleSidebar}
            title="Panel lateral (Ctrl+\)"
          >
            <IconSidebar />
          </button>
        )}

        {/* File info — only when a file is open */}
        {filename && dir !== null && (
          <div className="toolbar-file">
            <span className="toolbar-filename">{filename}</span>
            <span className="toolbar-path">{dir}</span>
          </div>
        )}
        {updatedBadge && <span className="updated-badge">Actualizado</span>}
        {copiedBadge && <span className="copied-badge">¡Copiado!</span>}
      </div>

      <div className="toolbar-right">
        {/* Zoom controls — only when a file is open */}
        {filePath && (
          <div className="zoom-controls">
            <button className="toolbar-btn" onClick={onZoomOut} title="Reducir (Ctrl+-)">
              <IconZoomOut />
            </button>
            <span className="zoom-label" onClick={onZoomReset} title="Restablecer zoom (Ctrl+0)" style={{ cursor: 'pointer' }}>
              {Math.round(zoom * 100)}%
            </span>
            <button className="toolbar-btn" onClick={onZoomIn} title="Ampliar (Ctrl+=)">
              <IconZoomIn />
            </button>
          </div>
        )}

        {/* Copy markdown — only when a file is open */}
        {onCopyMarkdown && (
          <button className="toolbar-btn" onClick={onCopyMarkdown} title="Copiar fuente Markdown">
            <IconCopy />
          </button>
        )}

        {/* Presentation mode */}
        {onPresentation && (
          <button className="toolbar-btn" onClick={onPresentation} title="Modo presentación">
            <IconPresentation />
          </button>
        )}

        {/* Split view */}
        {onSplitView && (
          <button className="toolbar-btn" onClick={onSplitView} title="Vista dividida">
            <IconSplit />
          </button>
        )}

        {/* Search — only when a file is open */}
        {filePath && (
          <button
            className={`toolbar-btn ${searchOpen ? 'toolbar-btn--active' : ''}`}
            onClick={onSearch}
            title="Buscar (Ctrl+F)"
          >
            <IconSearch />
          </button>
        )}

        {/* Global search across all tabs */}
        {onGlobalSearch && (
          <button className="toolbar-btn" onClick={onGlobalSearch} title="Buscar en todos (Ctrl+Shift+F)">
            <IconGlobalSearch />
          </button>
        )}

        <button
          className={`toolbar-btn toolbar-btn--recents ${recentsPanelOpen ? 'toolbar-btn--active' : ''}`}
          onClick={onToggleRecentsPanel}
          title="Archivos recientes"
        >
          <IconClock />
        </button>

        <button
          className="toolbar-btn"
          onClick={onCycleTheme}
          title={`Modo ${isDark ? 'oscuro' : 'claro'} — clic para cambiar`}
        >
          <IconMoon />
        </button>

        <button
          className={`toolbar-btn ${settingsOpen ? 'toolbar-btn--active' : ''}`}
          onClick={onOpenSettings}
          title="Apariencia"
        >
          <IconSliders />
        </button>
      </div>
    </header>
  )
}
