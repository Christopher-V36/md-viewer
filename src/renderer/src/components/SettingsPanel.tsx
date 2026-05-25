import { useEffect, useRef } from 'react'
import { THEME_PAIRS, CONTENT_FONTS, type ThemeMode } from '../themes'

interface Props {
  pairId: string
  mode: ThemeMode
  fontId: string
  onThemeChange: (id: string) => void
  onModeChange: (mode: ThemeMode) => void
  onFontChange: (id: string) => void
  onClose: () => void
}

const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="3" x2="13" y2="13" /><line x1="13" y1="3" x2="3" y2="13" />
  </svg>
)

export default function SettingsPanel({
  pairId, mode, fontId, onThemeChange, onModeChange, onFontChange, onClose
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose()
    }
    setTimeout(() => document.addEventListener('mousedown', handler), 0)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div className="settings-overlay">
      <div className="settings-panel" ref={panelRef}>
        <div className="settings-header">
          <h2 className="settings-title">Appearance</h2>
          <button className="toolbar-btn" onClick={onClose} title="Close"><IconX /></button>
        </div>

        <div className="settings-body">
          {/* Mode toggle */}
          <section className="settings-section">
            <h3 className="settings-section-title">Mode</h3>
            <div className="mode-toggle">
              {(['light', 'system', 'dark'] as ThemeMode[]).map(m => (
                <button
                  key={m}
                  className={`mode-btn ${mode === m ? 'mode-btn--active' : ''}`}
                  onClick={() => onModeChange(m)}
                >
                  {m === 'light' ? '☀ Light' : m === 'dark' ? '☾ Dark' : '⊙ Auto'}
                </button>
              ))}
            </div>
          </section>

          {/* Theme pairs */}
          <section className="settings-section">
            <h3 className="settings-section-title">Theme</h3>
            <div className="theme-grid">
              {THEME_PAIRS.map(pair => (
                <ThemePairCard
                  key={pair.id}
                  pair={pair}
                  active={pairId === pair.id}
                  onClick={() => onThemeChange(pair.id)}
                />
              ))}
            </div>
          </section>

          {/* Font picker */}
          <section className="settings-section">
            <h3 className="settings-section-title">Content Font</h3>
            <div className="font-grid">
              {CONTENT_FONTS.map(font => (
                <button
                  key={font.id}
                  className={`font-card ${fontId === font.id ? 'font-card--active' : ''}`}
                  onClick={() => onFontChange(font.id)}
                  style={{ fontFamily: font.value }}
                >
                  <span className="font-sample">Aa</span>
                  <span className="font-name">{font.name}</span>
                </button>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}

function ThemePairCard({ pair, active, onClick }: { pair: typeof THEME_PAIRS[0]; active: boolean; onClick: () => void }) {
  const l = pair.light.preview
  const d = pair.dark.preview
  return (
    <button
      className={`theme-card ${active ? 'theme-card--active' : ''}`}
      onClick={onClick}
      title={pair.name}
    >
      <div className="theme-preview-split">
        {/* Light half */}
        <div className="theme-preview-half" style={{ background: l.bg }}>
          <div className="theme-preview-sidebar-half" style={{ background: l.sidebar }} />
          <div className="theme-preview-content-half">
            <div className="theme-preview-line theme-preview-line--h" style={{ background: l.text, opacity: 0.9 }} />
            <div className="theme-preview-line" style={{ background: l.text, opacity: 0.45, width: '80%' }} />
            <div className="theme-preview-accent" style={{ background: l.accent }} />
          </div>
        </div>
        {/* Dark half */}
        <div className="theme-preview-half" style={{ background: d.bg }}>
          <div className="theme-preview-sidebar-half" style={{ background: d.sidebar }} />
          <div className="theme-preview-content-half">
            <div className="theme-preview-line theme-preview-line--h" style={{ background: d.text, opacity: 0.9 }} />
            <div className="theme-preview-line" style={{ background: d.text, opacity: 0.45, width: '80%' }} />
            <div className="theme-preview-accent" style={{ background: d.accent }} />
          </div>
        </div>
      </div>
      <span className="theme-name">{pair.name}</span>
      {active && <span className="theme-check">✓</span>}
    </button>
  )
}
