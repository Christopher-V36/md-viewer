import { useState, useCallback } from 'react'
import { classify } from '../supported'

interface Props {
  onOpenFile: (path: string) => void
  onOpenDialog: () => void
  onConvertDialog: () => void
  onOpenSettings: () => void
  isLoading: boolean
  outputDir: string
  onBrowseOutputDir: () => void
  onResetOutputDir: () => void
}

const IconMDT = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle"
      fontSize="12" fontWeight="800" fontFamily="system-ui, sans-serif"
      fill="currentColor" letterSpacing="-0.5">MDT</text>
  </svg>
)

const IconFolder = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 5.5A1.5 1.5 0 013.5 4h2.672a1.5 1.5 0 011.06.44l.768.768a1.5 1.5 0 001.06.44H14.5A1.5 1.5 0 0116 7.15V13a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 012 13V5.5z"/>
  </svg>
)

const IconConvert = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5h12M11.5 6l3.5 3.5-3.5 3.5"/>
  </svg>
)

const IconFile = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 1.5h5l4 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1v-12a1 1 0 011-1z"/>
    <path d="M9 1.5v4h4"/>
  </svg>
)

export default function WelcomeScreen({
  onOpenFile, onOpenDialog, onConvertDialog, onOpenSettings, isLoading,
  outputDir, onBrowseOutputDir, onResetOutputDir
}: Props) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => setIsDragging(false), [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    const kind = classify(file.name)
    if (kind === 'unsupported') return
    const path: string = (window as any).api?.getFilePath?.(file) ?? (file as any).path ?? ''
    if (path) onOpenFile(path)
  }, [onOpenFile])

  return (
    <div
      className={`welcome-screen ${isDragging ? 'welcome-screen--dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="welcome-layout">
        <div className="welcome-hero">
          <div className="welcome-logo-wrap">
            <div className="welcome-logo">
              <IconMDT />
            </div>
          </div>
          <h1 className="welcome-title">MD Viewer</h1>
          <p className="welcome-subtitle">Visualiza y convierte documentos a Markdown</p>

          <div className="welcome-actions">
            <button
              className="welcome-btn-primary"
              onClick={onOpenDialog}
              disabled={isLoading}
            >
              <IconFolder />
              {isLoading ? 'Abriendo…' : 'Abrir archivo'}
              <kbd>Ctrl+O</kbd>
            </button>
            <button
              className="welcome-btn-secondary"
              onClick={onConvertDialog}
              disabled={isLoading}
              title="Convertir PDF, DOCX, XLSX, HTML, imágenes…"
            >
              <IconConvert />
              Convertir a Markdown
            </button>
          </div>

          <div className="welcome-drop-zone">
            {isDragging
              ? 'Suelta el archivo aquí'
              : 'Arrastra archivos aquí — .md, PDF, DOCX, XLSX, PPTX, HTML, imágenes'
            }
          </div>

          {/* Output dir + shortcuts */}
          <div className="welcome-footer-section">
            <div className="welcome-footer-row">
              <span className="welcome-footer-label">Carpeta de conversiones</span>
              <div className="welcome-dir-pill">
                <span className="welcome-dir-text" title={outputDir || undefined}>
                  {outputDir || 'Temporal del sistema'}
                </span>
                <button className="welcome-dir-btn" onClick={onBrowseOutputDir}>Elegir…</button>
                {outputDir && (
                  <button className="welcome-dir-btn welcome-dir-btn--x" onClick={onResetOutputDir} title="Restablecer">✕</button>
                )}
              </div>
            </div>
            <div className="welcome-shortcuts">
              {[
                ['Ctrl+O', 'Abrir'],
                ['Ctrl+F', 'Buscar'],
                ['Ctrl+Shift+F', 'Buscar global'],
                ['Ctrl+\\', 'Panel lateral'],
                ['Ctrl+P', 'Imprimir'],
                ['Ctrl+W', 'Cerrar tab'],
              ].map(([key, label]) => (
                <div key={key} className="welcome-shortcut">
                  <kbd>{key}</kbd>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
