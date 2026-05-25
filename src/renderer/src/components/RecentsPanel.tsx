import { basename } from '../supported'

interface Props {
  recentFiles: string[]
  activeFilePath: string | null
  onOpenRecent: (path: string) => void
  onClearRecent: () => void
}

const IconFile = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 1.5h5l4 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1v-12a1 1 0 011-1z"/>
    <path d="M9 1.5v4h4"/>
  </svg>
)

function getFileColor(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || ''
  const colors: Record<string, string> = {
    md: 'var(--accent)', markdown: 'var(--accent)',
    txt: 'var(--text-faint)', csv: '#22c55e',
    pdf: '#ef4444', docx: '#3b82f6', xlsx: '#16a34a',
    pptx: '#f97316', html: '#e879f9', htm: '#e879f9',
    json: '#facc15', xml: '#f97316',
  }
  return colors[ext] || 'var(--text-faint)'
}

export default function RecentsPanel({
  recentFiles, activeFilePath, onOpenRecent, onClearRecent
}: Props) {
  return (
    <aside className="recents-sidebar" role="complementary" aria-label="Archivos recientes">
      <div className="recents-sidebar-header">
        <span className="recents-sidebar-title">Recientes</span>
        {recentFiles.length > 0 && (
          <button className="recents-sidebar-clear" onClick={onClearRecent} title="Borrar historial">
            Borrar
          </button>
        )}
      </div>
      <div className="recents-sidebar-body">
        {recentFiles.length === 0 ? (
          <div className="recents-sidebar-empty">Sin archivos recientes</div>
        ) : (
          <ul className="recents-sidebar-list">
            {recentFiles.map(path => {
              const isActive = path === activeFilePath
              const dir = path.split(/[/\\]/).slice(0, -1).join('/')
              return (
                <li key={path}>
                  <button
                    className={`recents-sidebar-item ${isActive ? 'recents-sidebar-item--active' : ''}`}
                    onClick={() => onOpenRecent(path)}
                    title={path}
                  >
                    <span className="recents-sidebar-icon" style={{ color: getFileColor(path) }}>
                      <IconFile />
                    </span>
                    <div className="recents-sidebar-text">
                      <span className="recents-sidebar-name">{basename(path)}</span>
                      <span className="recents-sidebar-path">{dir}</span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}
