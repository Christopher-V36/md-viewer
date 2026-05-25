import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useTheme } from './hooks/useTheme'
import { useMarkdown } from './hooks/useMarkdown'
import Toolbar from './components/Toolbar'
import Sidebar from './components/Sidebar'
import MarkdownView from './components/MarkdownView'
import SearchPanel from './components/SearchPanel'
import SettingsPanel from './components/SettingsPanel'
import WelcomeScreen from './components/WelcomeScreen'
import ConversionOverlay from './components/ConversionOverlay'
import TabBar from './components/TabBar'
import RecentsPanel from './components/RecentsPanel'
import GlobalSearchPanel from './components/GlobalSearchPanel'
import SplitView from './components/SplitView'
import PresentationMode from './components/PresentationMode'
import { DEMO_CONTENT, DEMO_PATH } from './demo'
import { classify, basename } from './supported'
import type { Tab } from './types'

const api = () => window.api
const IS_ELECTRON = typeof window !== 'undefined' && !!window.api

// Plain text gets rendered as a raw <pre> block (markdown-it has html:true,
// so this passes through verbatim). Going through a code fence would force
// monospace-on-dark code styling, hide long lines behind horizontal scroll,
// and inject a "Copiar" button that doesn't belong on prose.
function wrapAsPlainText(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return `<pre class="plain-text">${escaped}</pre>`
}

// Minimal RFC-4180-ish CSV reader: handles quoted fields, escaped quotes
// (""), CRLF, and trailing newlines. Doesn't try to auto-detect separators —
// commas only. Good enough for the spreadsheet-style files this app sees.
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0
  while (i < text.length) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i += 2; continue }
      if (c === '"') { inQuotes = false; i++; continue }
      field += c; i++
    } else {
      if (c === '"') { inQuotes = true; i++; continue }
      if (c === ',') { row.push(field); field = ''; i++; continue }
      if (c === '\r' || c === '\n') {
        row.push(field); rows.push(row); row = []; field = ''
        if (c === '\r' && text[i + 1] === '\n') i += 2; else i++
        continue
      }
      field += c; i++
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row) }
  // Drop a trailing empty row from a final newline.
  if (rows.length && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') rows.pop()
  return rows
}

function escapeCsvCell(s: string): string {
  return s.replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>').trim()
}

function csvToMarkdownTable(text: string): string {
  const rows = parseCsv(text)
  if (!rows.length) return ''
  // Normalize row widths to the max column count seen.
  const cols = rows.reduce((m, r) => Math.max(m, r.length), 0)
  const pad = (r: string[]) => r.concat(Array(cols - r.length).fill(''))
  const headers = pad(rows[0]).map(escapeCsvCell)
  const lines = [
    '| ' + headers.join(' | ') + ' |',
    '|' + headers.map(() => '---').join('|') + '|',
  ]
  for (let r = 1; r < rows.length; r++) {
    lines.push('| ' + pad(rows[r]).map(escapeCsvCell).join(' | ') + ' |')
  }
  return lines.join('\n')
}

function transformForDisplay(text: string, path: string): string {
  const ext = path.slice(path.lastIndexOf('.') + 1).toLowerCase()
  if (ext === 'txt') return wrapAsPlainText(text)
  if (ext === 'csv') return csvToMarkdownTable(text)
  return text
}

function makeTabId(): string {
  // crypto.randomUUID is available in Electron's renderer (modern Chromium).
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export default function App() {
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [recentFiles, setRecentFiles] = useState<string[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(240)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchMatches, setSearchMatches] = useState({ current: 0, total: 0 })
  const [updatedBadge, setUpdatedBadge] = useState(false)
  const [activeHeading, setActiveHeading] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [converting, setConverting] = useState<string | null>(null)
  const convertingRef = useRef(false)
  const [outputDir, setOutputDir] = useState('')
  const [zoom, setZoom] = useState(1)
  const [copiedBadge, setCopiedBadge] = useState(false)
  const [recentsPanelOpen, setRecentsPanelOpen] = useState(false)
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false)
  const [splitViewOpen, setSplitViewOpen] = useState(false)
  const [splitRightTabId, setSplitRightTabId] = useState<string | null>(null)
  const [presentationMode, setPresentationMode] = useState(false)

  // Derived: the active tab and its file/content. Single source of truth so
  // all the file-related effects key off the active tab.
  const activeTab = useMemo(
    () => tabs.find(t => t.id === activeTabId) ?? null,
    [tabs, activeTabId]
  )
  const filePath = activeTab?.filePath ?? null
  const content = activeTab?.content ?? null
  const hasFile = activeTab !== null

  // Refs to avoid stale closures inside global keyboard handlers.
  const activeTabIdRef = useRef<string | null>(null)
  activeTabIdRef.current = activeTabId
  const tabsRef = useRef<Tab[]>([])
  tabsRef.current = tabs

  const { pairId, mode, fontId, setTheme, setMode, setFont, toggleMode, isDark } = useTheme()
  const { html, toc, frontmatter } = useMarkdown(content, filePath)

  // Demo content for non-Electron contexts (storybook / web preview). Opens
  // as a synthetic tab so the rest of the app sees a normal state shape.
  useEffect(() => {
    if (!IS_ELECTRON && tabs.length === 0) {
      const id = makeTabId()
      setTabs([{ id, filePath: DEMO_PATH, content: DEMO_CONTENT }])
      setActiveTabId(id)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Tab operations ────────────────────────────────────────────────────────
  const openOrSwitchTab = useCallback((path: string, transformedContent: string) => {
    setTabs(prev => {
      const existing = prev.find(t => t.filePath === path)
      if (existing) {
        // Already open — switch to it and refresh content in case the file
        // changed on disk between opens.
        setActiveTabId(existing.id)
        return prev.map(t => t.filePath === path ? { ...t, content: transformedContent } : t)
      }
      const newTab: Tab = { id: makeTabId(), filePath: path, content: transformedContent }
      setActiveTabId(newTab.id)
      return [...prev, newTab]
    })
  }, [])

  const switchTab = useCallback((id: string) => {
    setActiveTabId(id)
    // Clear the dirty indicator — the user is now viewing this tab.
    setTabs(prev => prev.map(t => t.id === id ? { ...t, dirty: false } : t))
    // Switching files restarts the search context — too confusing otherwise.
    setSearchOpen(false)
    setSearchQuery('')
    setSearchMatches({ current: 0, total: 0 })
  }, [])

  const closeTab = useCallback((id: string) => {
    setTabs(prev => {
      const idx = prev.findIndex(t => t.id === id)
      if (idx === -1) return prev
      const closing = prev[idx]
      // Stop the OS-level watch for this tab's file, since no other tab is
      // viewing it anymore.
      api()?.unwatchFile(closing.filePath)
      const next = prev.filter(t => t.id !== id)
      setActiveTabId(currentActive => {
        if (id !== currentActive) return currentActive
        return next[idx]?.id ?? next[idx - 1]?.id ?? null
      })
      return next
    })
  }, [])

  const reorderTabs = useCallback((fromIdx: number, toIdx: number) => {
    setTabs(prev => {
      const next = [...prev]
      const [moved] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, moved)
      return next
    })
  }, [])

  // ── File operations ───────────────────────────────────────────────────────
  const loadFile = useCallback(async (path: string) => {
    setIsLoading(true)
    try {
      const text = await api()?.readFile(path)
      if (text !== undefined) {
        openOrSwitchTab(path, transformForDisplay(text, path))
        const recent = await api()?.getRecentFiles()
        setRecentFiles(recent ?? [])
      }
    } finally {
      setIsLoading(false)
    }
  }, [openOrSwitchTab])

  const handleSmartOpen = useCallback(async (path: string) => {
    const kind = classify(path)
    if (kind === 'view') {
      await loadFile(path)
      return
    }
    if (kind === 'convert') {
      // Guard against rapid double-drops while one conversion is in flight.
      if (convertingRef.current) return
      convertingRef.current = true
      setConverting(basename(path))
      try {
        const outputPath = await api()?.convertFile(path)
        if (outputPath) {
          await loadFile(outputPath)
          const recent = await api()?.getRecentFiles()
          setRecentFiles(recent ?? [])
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        // Silently swallow user-initiated cancellations — the overlay
        // closing is the only feedback the user expects.
        if (!/cancelad[ao]/i.test(msg)) alert(`Error de conversión:\n${msg}`)
      } finally {
        convertingRef.current = false
        setConverting(null)
      }
    }
  }, [loadFile])

  const handleOpenDialog = useCallback(async () => {
    const path = await api()?.openFile()
    if (path) await handleSmartOpen(path)
  }, [handleSmartOpen])

  const handleConvertDialog = useCallback(async () => {
    const path = await api()?.openConvertDialog()
    if (path) await handleSmartOpen(path)
  }, [handleSmartOpen])

  // "Go home" deselects the active tab — the welcome screen appears because
  // hasFile becomes false. Tabs stay open; clicking one re-activates it.
  const handleGoHome = useCallback(() => {
    setActiveTabId(null)
    setSearchOpen(false)
    setSearchQuery('')
    setSearchMatches({ current: 0, total: 0 })
  }, [])

  const handleSaveAsPdf = useCallback(async () => {
    await api()?.saveAsPdf(filePath ?? undefined)
  }, [filePath])

  const handleRevealFile = useCallback(async () => {
    if (filePath) await api()?.showItemInFolder(filePath)
  }, [filePath])

  const handleClearRecent = useCallback(async () => {
    await api()?.clearRecentFiles()
    setRecentFiles([])
  }, [])

  const handleBrowseOutputDir = useCallback(async () => {
    const dir = await api()?.browseOutputDir()
    if (dir !== null && dir !== undefined) setOutputDir(dir)
  }, [])

  const handleResetOutputDir = useCallback(async () => {
    await api()?.resetOutputDir()
    setOutputDir('')
  }, [])

  const handleZoomIn = useCallback(() => setZoom(z => Math.min(2, parseFloat((z + 0.1).toFixed(1)))), [])
  const handleZoomOut = useCallback(() => setZoom(z => Math.max(0.5, parseFloat((z - 0.1).toFixed(1)))), [])
  const handleZoomReset = useCallback(() => setZoom(1), [])

  const handleCopyMarkdown = useCallback(() => {
    if (!content) return
    navigator.clipboard.writeText(content).then(() => {
      setCopiedBadge(true)
      setTimeout(() => setCopiedBadge(false), 2000)
    })
  }, [content])

  // Global drag-and-drop: handle drops anywhere in the app
  const handleRootDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleRootDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    const path: string = IS_ELECTRON
      ? (api()?.getFilePath(file) ?? (file as any).path ?? '')
      : ((file as any).path ?? '')
    if (path) handleSmartOpen(path)
  }, [handleSmartOpen])

  // Bootstrap: load settings + IPC listeners
  useEffect(() => {
    api()?.getSettings().then(s => {
      setSidebarOpen(s.sidebarOpen)
      setOutputDir(s.outputDir ?? '')
      if (s.recentsPanelOpen !== undefined) setRecentsPanelOpen(s.recentsPanelOpen)
    })
    api()?.getRecentFiles().then(r => setRecentFiles(r))
    const removeOpenFile = api()?.onOpenFile(handleSmartOpen)
    const removeMenuOpen = api()?.onMenuOpenFile(handleOpenDialog)
    const removeMenuConvert = api()?.onMenuConvertFile(handleConvertDialog)
    const removeSidebar = api()?.onToggleSidebar(() => setSidebarOpen(v => !v))
    return () => {
      removeOpenFile?.(); removeMenuOpen?.(); removeMenuConvert?.(); removeSidebar?.()
    }
  }, [handleSmartOpen, handleOpenDialog, handleConvertDialog])

  // Window title follows the active tab.
  useEffect(() => {
    if (!filePath) {
      api()?.setWindowTitle('MD Viewer')
      return
    }
    const name = filePath.split(/[/\\]/).pop()
    api()?.setWindowTitle(`${name} — MD Viewer`)
  }, [filePath])

  // Register an OS-level file watch for every open tab. The main process
  // dedupes by path, so re-watching is cheap.
  useEffect(() => {
    tabs.forEach(t => { api()?.watchFile(t.filePath) })
  }, [tabs])

  // Auto-reload: when any watched file changes on disk, refresh the matching
  // tab regardless of whether it's the active one — the user sees the update
  // the moment they switch to that tab.
  useEffect(() => {
    const cleanup = api()?.onFileChanged(async (path: string) => {
      if (!path) return
      const text = await api()?.readFile(path)
      if (text === undefined) return
      const transformed = transformForDisplay(text, path)
      const currentActiveId = activeTabIdRef.current
      setTabs(prev => prev.map(t => {
        if (t.filePath !== path) return t
        const isActive = t.id === currentActiveId
        return { ...t, content: transformed, dirty: isActive ? false : true }
      }))
      // Flash the badge only if the change is to the file the user is looking at.
      const activeT = tabsRef.current.find(t => t.id === currentActiveId)
      if (activeT?.filePath === path) {
        setUpdatedBadge(true)
        setTimeout(() => setUpdatedBadge(false), 2500)
      }
    })
    return () => cleanup?.()
  }, [])

  // Persist sidebar + recents panel preferences
  useEffect(() => {
    api()?.saveSettings({ sidebarOpen, recentsPanelOpen })
  }, [sidebarOpen, recentsPanelOpen])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'f' || e.key === 'F')) { e.preventDefault(); setGlobalSearchOpen(v => !v); return }
      if (e.ctrlKey && e.key === 'f') { e.preventDefault(); setSearchOpen(v => !v); return }
      if (e.ctrlKey && e.key === '\\') { e.preventDefault(); setSidebarOpen(v => !v); return }
      if (e.ctrlKey && (e.key === '=' || e.key === '+')) { e.preventDefault(); setZoom(z => Math.min(2, parseFloat((z + 0.1).toFixed(1)))); return }
      if (e.ctrlKey && e.key === '-') { e.preventDefault(); setZoom(z => Math.max(0.5, parseFloat((z - 0.1).toFixed(1)))); return }
      if (e.ctrlKey && e.key === '0') { e.preventDefault(); setZoom(1); return }
      if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); return }

      // ── Tab navigation ──────────────────────────────────────────────────
      if (e.ctrlKey && (e.key === 'w' || e.key === 'W') && !e.altKey) {
        e.preventDefault()
        const id = activeTabIdRef.current
        if (id) closeTab(id)
        return
      }
      if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault()
        const list = tabsRef.current
        if (list.length < 2) return
        const idx = list.findIndex(t => t.id === activeTabIdRef.current)
        if (idx === -1) return
        const nextIdx = e.shiftKey
          ? (idx - 1 + list.length) % list.length
          : (idx + 1) % list.length
        switchTab(list[nextIdx].id)
        return
      }
      if (e.ctrlKey && /^[1-9]$/.test(e.key)) {
        e.preventDefault()
        const idx = parseInt(e.key, 10) - 1
        const t = tabsRef.current[idx]
        if (t) switchTab(t.id)
        return
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeTab, switchTab])

  const filename = filePath ? filePath.split(/[/\\]/).pop() || filePath : null

  return (
    <div
      className="app-root"
      onDragOver={handleRootDragOver}
      onDrop={handleRootDrop}
    >
      <Toolbar
        filename={filename}
        filePath={filePath}
        isDark={isDark}
        onCycleTheme={toggleMode}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(v => !v)}
        onSearch={() => { setSearchOpen(v => !v); setSearchQuery('') }}
        onOpenFile={handleOpenDialog}
        onOpenSettings={() => setSettingsOpen(v => !v)}
        updatedBadge={updatedBadge}
        copiedBadge={copiedBadge}
        searchOpen={searchOpen}
        settingsOpen={settingsOpen}
        recentFiles={recentFiles}
        onOpenRecent={handleSmartOpen}
        onGoHome={hasFile ? handleGoHome : null}
        onSaveAsPdf={hasFile ? handleSaveAsPdf : null}
        onRevealFile={hasFile ? handleRevealFile : null}
        onClearRecent={handleClearRecent}
        onCopyMarkdown={hasFile ? handleCopyMarkdown : null}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        recentsPanelOpen={recentsPanelOpen}
        onToggleRecentsPanel={() => setRecentsPanelOpen(v => !v)}
        onSplitView={hasFile ? () => { setSplitViewOpen(v => !v); setSplitRightTabId(null) } : null}
        onPresentation={hasFile ? () => setPresentationMode(true) : null}
        onGlobalSearch={tabs.length > 0 ? () => setGlobalSearchOpen(v => !v) : null}
      />
      {tabs.length > 0 && (
        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onSwitchTab={switchTab}
          onCloseTab={closeTab}
          onReorderTabs={reorderTabs}
        />
      )}
      <div className="app-body">
        {hasFile ? (
          splitViewOpen ? (
            <SplitView
              tabs={tabs}
              leftTabId={activeTabId!}
              rightTabId={splitRightTabId}
              onSelectRight={setSplitRightTabId}
              onOpenRecent={handleSmartOpen}
              onClose={() => { setSplitViewOpen(false); setSplitRightTabId(null) }}
              zoom={zoom}
              isDark={isDark}
              sidebarOpen={sidebarOpen}
              recentFiles={recentFiles}
            />
          ) : (
            <>
              {sidebarOpen && (
                <Sidebar toc={toc} frontmatter={frontmatter} activeHeading={activeHeading} width={sidebarWidth} onWidthChange={setSidebarWidth} />
              )}
              <MarkdownView
                html={html}
                searchQuery={searchOpen ? searchQuery : ''}
                onActiveHeadingChange={setActiveHeading}
                onSearchMatchesChange={(current, total) => setSearchMatches({ current, total })}
                zoom={zoom}
                isDark={isDark}
              />
            </>
          )
        ) : (
          <WelcomeScreen
            onOpenFile={handleSmartOpen}
            onOpenDialog={handleOpenDialog}
            onConvertDialog={handleConvertDialog}
            onOpenSettings={() => setSettingsOpen(true)}
            isLoading={isLoading}
            outputDir={outputDir}
            onBrowseOutputDir={handleBrowseOutputDir}
            onResetOutputDir={handleResetOutputDir}
          />
        )}
        {recentsPanelOpen && (
          <RecentsPanel
            recentFiles={recentFiles}
            activeFilePath={filePath}
            onOpenRecent={(p) => { handleSmartOpen(p) }}
            onClearRecent={handleClearRecent}
          />
        )}
      </div>
      {searchOpen && hasFile && (
        <SearchPanel
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onClose={() => { setSearchOpen(false); setSearchQuery(''); setSearchMatches({ current: 0, total: 0 }) }}
          currentMatch={searchMatches.current}
          totalMatches={searchMatches.total}
        />
      )}
      {settingsOpen && (
        <SettingsPanel
          pairId={pairId}
          mode={mode}
          fontId={fontId}
          onThemeChange={setTheme}
          onModeChange={setMode}
          onFontChange={setFont}
          onClose={() => setSettingsOpen(false)}
        />
      )}
      {globalSearchOpen && tabs.length > 0 && (
        <GlobalSearchPanel
          tabs={tabs}
          onNavigate={(tabId) => { switchTab(tabId); setGlobalSearchOpen(false) }}
          onClose={() => setGlobalSearchOpen(false)}
        />
      )}
      {presentationMode && content && (
        <PresentationMode
          content={content}
          filePath={filePath}
          isDark={isDark}
          onExit={() => setPresentationMode(false)}
        />
      )}
      {converting && (
        <ConversionOverlay
          name={converting}
          onCancel={() => { api()?.cancelConversion() }}
        />
      )}
    </div>
  )
}
