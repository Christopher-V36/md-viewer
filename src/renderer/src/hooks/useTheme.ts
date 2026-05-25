import { useState, useEffect, useCallback } from 'react'
import { THEME_PAIRS, CONTENT_FONTS, DEFAULT_PAIR_ID, DEFAULT_MODE, type ThemeMode } from '../themes'

function getPair(id: string) {
  return THEME_PAIRS.find(p => p.id === id) || THEME_PAIRS.find(p => p.id === DEFAULT_PAIR_ID)!
}

function resolveIsDark(mode: ThemeMode): boolean {
  if (mode === 'dark') return true
  if (mode === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyVars(pairId: string, mode: ThemeMode, fontId: string) {
  const pair = getPair(pairId)
  const isDark = resolveIsDark(mode)
  const variant = isDark ? pair.dark : pair.light
  const root = document.documentElement
  for (const [k, v] of Object.entries(variant.vars)) {
    root.style.setProperty(k, v)
  }
  const fontEntry = CONTENT_FONTS.find(f => f.id === fontId)
  const font = (fontId !== 'default' && fontEntry) ? fontEntry.value : (pair.contentFont || CONTENT_FONTS[0].value)
  root.style.setProperty('--font-content', font)
  root.classList.toggle('dark', isDark)
  return isDark
}

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem('md-theme') || '{}')
    return {
      pairId: (s.pairId as string) || DEFAULT_PAIR_ID,
      mode: (s.mode as ThemeMode) || DEFAULT_MODE,
      fontId: (s.fontId as string) || 'default',
    }
  } catch {
    return { pairId: DEFAULT_PAIR_ID, mode: DEFAULT_MODE, fontId: 'default' }
  }
}

function persist(pairId: string, mode: ThemeMode, fontId: string) {
  localStorage.setItem('md-theme', JSON.stringify({ pairId, mode, fontId }))
  window.api?.saveSettings({ pairId, mode, fontId })
}

export function useTheme() {
  const initial = loadState()
  const [pairId, setPairId] = useState(initial.pairId)
  const [mode, setModeState] = useState<ThemeMode>(initial.mode)
  const [fontId, setFontId] = useState(initial.fontId)
  const [isDark, setIsDark] = useState(() => resolveIsDark(initial.mode))

  const apply = useCallback((pid: string, m: ThemeMode, fid: string) => {
    const dark = applyVars(pid, m, fid)
    setIsDark(dark)
    persist(pid, m, fid)
  }, [])

  const setTheme = useCallback((pid: string) => {
    setPairId(pid)
    setModeState(prev => { setFontId(f => { apply(pid, prev, f); return f }); return prev })
  }, [apply])

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m)
    setPairId(prev => { setFontId(f => { apply(prev, m, f); return f }); return prev })
  }, [apply])

  const setFont = useCallback((fid: string) => {
    setFontId(fid)
    setPairId(prev => { setModeState(m => { apply(prev, m, fid); return m }); return prev })
  }, [apply])

  const toggleMode = useCallback(() => {
    setModeState(prev => {
      const next: ThemeMode = resolveIsDark(prev) ? 'light' : 'dark'
      setPairId(pid => { setFontId(f => { apply(pid, next, f); return f }); return pid })
      return next
    })
  }, [apply])

  // Load from main process on mount
  useEffect(() => {
    applyVars(initial.pairId, initial.mode, initial.fontId)
    window.api?.getSettings().then(s => {
      const pid = (s as any).pairId || initial.pairId
      const m: ThemeMode = (s as any).mode || initial.mode
      const fid = (s as any).fontId || initial.fontId
      setPairId(pid); setModeState(m); setFontId(fid)
      const dark = applyVars(pid, m, fid)
      setIsDark(dark)
    }).catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync with OS dark/light changes when mode is 'system'
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      setModeState(m => {
        if (m === 'system') {
          setPairId(pid => { setFontId(f => { apply(pid, m, f); return f }); return pid })
        }
        return m
      })
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [apply])

  // Listen for menu toggle (Ctrl+Shift+D)
  useEffect(() => {
    return window.api?.onToggleTheme(toggleMode)
  }, [toggleMode])

  return { pairId, mode, fontId, isDark, setTheme, setMode, setFont, toggleMode }
}
