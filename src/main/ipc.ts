import { ipcMain, dialog, BrowserWindow, app, shell } from 'electron'
import { readFileSync, writeFileSync, watchFile, unwatchFile, existsSync } from 'fs'
import { writeFile } from 'fs/promises'
import { spawn } from 'child_process'
import { tmpdir } from 'os'
import { join, parse } from 'path'
import { store } from './store'

// Tracks which paths we currently have an fs.watchFile listener on. Tabs
// register/unregister independently; we only call fs.watchFile once per path
// regardless of how many tabs ask for it.
const watchedFiles = new Map<string, (curr: import('fs').Stats, prev: import('fs').Stats) => void>()
// Holds a cancel handle for the in-flight conversion (only one at a time —
// renderer also guards via convertingRef). The cancel-conversion IPC calls it.
let activeConversion: { cancel: () => void } | null = null

// Files with unsaved edits, reported by the renderer. While this is non-empty
// the window refuses to close until the renderer has walked the user through
// the "save changes?" prompt and answered via `confirm-close`.
let unsavedFiles: string[] = []
let closeApproved = false

export function shouldBlockClose(): boolean {
  return unsavedFiles.length > 0 && !closeApproved
}

export function resetCloseGuard() {
  unsavedFiles = []
  closeApproved = false
}

export function isCloseApproved(): boolean {
  return closeApproved
}

function startWatching(filePath: string, win: BrowserWindow) {
  if (watchedFiles.has(filePath)) return
  const listener = (curr: import('fs').Stats, prev: import('fs').Stats) => {
    if (curr.mtimeMs !== prev.mtimeMs && !win.isDestroyed()) {
      win.webContents.send('file-changed', filePath)
    }
  }
  watchedFiles.set(filePath, listener)
  watchFile(filePath, { interval: 500 }, listener)
}

function stopWatchingPath(filePath: string) {
  if (!watchedFiles.has(filePath)) return
  unwatchFile(filePath)
  watchedFiles.delete(filePath)
}

function getConverterPath(): string {
  const base = app.isPackaged ? process.resourcesPath : join(__dirname, '../../resources')
  // onedir bundle (fast startup — preferred after rebuild)
  const dirExe = join(base, 'bin', 'markitdown_cli', 'markitdown_cli.exe')
  if (existsSync(dirExe)) return dirExe
  // fallback: legacy onefile exe
  return join(base, 'bin', 'markitdown_cli.exe')
}

// Fire-and-forget warm-up: run the converter once on a trivial file at boot
// so Windows caches the bundle's DLLs in the file system cache. The first
// real conversion then skips ~2 s of disk I/O. Idempotent — safe to call once.
let prewarmed = false
export async function prewarmConverter(): Promise<void> {
  if (prewarmed) return
  prewarmed = true
  const exe = getConverterPath()
  if (!existsSync(exe)) return
  try {
    const dummyIn = join(tmpdir(), '__md_viewer_prewarm.txt')
    const dummyOut = join(tmpdir(), '__md_viewer_prewarm.md')
    await writeFile(dummyIn, '# warm', 'utf-8')
    const proc = spawn(exe, [dummyIn, dummyOut], {
      windowsHide: true,
      detached: false,
      stdio: 'ignore'
    })
    // Don't await — let it run in the background. unref() lets the parent
    // exit cleanly even if the prewarm hasn't finished.
    proc.unref()
    proc.on('error', () => { /* converter missing; ignored */ })
  } catch { /* noop — warm-up is best-effort */ }
}

const CONVERTER_FILTERS = [
  {
    name: 'Convertibles',
    extensions: [
      'pdf', 'docx', 'xlsx', 'xls', 'pptx', 'ppt',
      'html', 'htm', 'json', 'xml',
      'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp',
      'mp3', 'wav', 'zip'
    ]
  },
  { name: 'All Files', extensions: ['*'] }
]

const VIEWER_FILTERS = [
  { name: 'Markdown', extensions: ['md', 'markdown'] },
  { name: 'Plain text', extensions: ['txt', 'csv'] },
  { name: 'All Files', extensions: ['*'] }
]

export function registerIpcHandlers(win: BrowserWindow) {
  ipcMain.handle('open-file', async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters: VIEWER_FILTERS
    })
    if (result.canceled || !result.filePaths[0]) return null
    const filePath = result.filePaths[0]
    store.addRecentFile(filePath)
    return filePath
  })

  ipcMain.handle('open-convert-dialog', async () => {
    const result = await dialog.showOpenDialog(win, {
      title: 'Convertir archivo a Markdown',
      properties: ['openFile'],
      filters: CONVERTER_FILTERS
    })
    if (result.canceled || !result.filePaths[0]) return null
    return result.filePaths[0]
  })

  ipcMain.handle('read-file', (_event, filePath: string) => {
    const content = readFileSync(filePath, 'utf-8')
    store.addRecentFile(filePath)
    return content
  })

  ipcMain.handle('save-file', async (_event, filePath: string, content: string) => {
    // Editing is only offered for Markdown; refuse anything else so a stray
    // call can't overwrite an arbitrary file type.
    if (!/\.(md|markdown)$/i.test(filePath)) {
      throw new Error('Solo se pueden guardar archivos Markdown')
    }
    await writeFile(filePath, content, 'utf-8')
  })

  ipcMain.handle('set-unsaved-files', (_event, files: string[]) => {
    unsavedFiles = Array.isArray(files) ? files : []
  })

  // The renderer has resolved every unsaved tab (saved or discarded) — let the
  // close that was held back go through.
  ipcMain.handle('confirm-close', () => {
    closeApproved = true
    if (!win.isDestroyed()) win.close()
  })

  ipcMain.handle('convert-file', async (_event, inputPath: string): Promise<string> => {
    const exe = getConverterPath()
    const { name } = parse(inputPath)
    const outputDir = store.get('outputDir') || tmpdir()
    const outputPath = join(outputDir, `${name}.md`)

    return new Promise<string>((resolve, reject) => {
      const proc = spawn(exe, [inputPath, outputPath], { windowsHide: true })
      let stdout = ''
      let stderr = ''
      let cancelled = false

      // Track active proc so the cancel-conversion handler can kill it.
      const myCancel = () => {
        cancelled = true
        try {
          if (process.platform === 'win32' && proc.pid !== undefined) {
            // /T tears down child processes too — markitdown can spawn
            // helpers (soffice, ffmpeg) that would otherwise survive.
            spawn('taskkill', ['/PID', String(proc.pid), '/T', '/F'], { windowsHide: true })
          } else {
            proc.kill('SIGKILL')
          }
        } catch { /* noop */ }
      }
      activeConversion = { cancel: myCancel }

      const clearActive = () => {
        if (activeConversion?.cancel === myCancel) activeConversion = null
      }

      proc.stdout.on('data', d => { stdout += d.toString() })
      proc.stderr.on('data', d => { stderr += d.toString() })
      proc.on('error', err => { clearActive(); reject(err) })
      proc.on('close', () => {
        clearActive()
        if (cancelled) {
          const e: Error & { code?: string } = new Error('Conversión cancelada por el usuario')
          e.code = 'CANCELLED'
          reject(e)
          return
        }
        try {
          const lastLine = stdout.trim().split(/\r?\n/).pop() || '{}'
          const result = JSON.parse(lastLine)
          if (result.ok) {
            store.addRecentFile(result.output)
            resolve(result.output)
          } else {
            reject(new Error(result.error || stderr || 'Conversion failed'))
          }
        } catch {
          reject(new Error(stderr || stdout || 'Conversor no disponible'))
        }
      })
    })
  })

  ipcMain.handle('cancel-conversion', () => {
    activeConversion?.cancel()
  })

  ipcMain.handle('save-as-pdf', async (_event, sourcePath?: string) => {
    const defaultName = sourcePath
      ? sourcePath.split(/[/\\]/).pop()!.replace(/\.[^.]+$/, '.pdf')
      : 'document.pdf'
    const { filePath: savePath, canceled } = await dialog.showSaveDialog(win, {
      title: 'Guardar como PDF',
      defaultPath: defaultName,
      filters: [{ name: 'PDF Documents', extensions: ['pdf'] }]
    })
    if (canceled || !savePath) return null
    const data = await win.webContents.printToPDF({ printBackground: true })
    writeFileSync(savePath, data)
    return savePath
  })

  ipcMain.handle('show-item-in-folder', (_event, filePath: string) => {
    shell.showItemInFolder(filePath)
  })

  ipcMain.handle('clear-recent-files', () => {
    store.clearRecentFiles()
  })

  ipcMain.handle('browse-output-dir', async () => {
    const result = await dialog.showOpenDialog(win, {
      title: 'Seleccionar carpeta de salida para conversiones',
      properties: ['openDirectory', 'createDirectory']
    })
    if (result.canceled || !result.filePaths[0]) return null
    store.set('outputDir', result.filePaths[0])
    return result.filePaths[0]
  })

  ipcMain.handle('reset-output-dir', () => {
    store.set('outputDir', '')
  })

  ipcMain.handle('get-recent-files', () => {
    const files = store.get('recentFiles')
    const existing = files.filter(f => existsSync(f))
    if (existing.length !== files.length) store.set('recentFiles', existing)
    return existing
  })

  ipcMain.handle('set-window-title', (_event, title: string) => {
    win.setTitle(title)
  })

  ipcMain.handle('get-settings', () => ({
    theme: store.get('theme'),
    sidebarOpen: store.get('sidebarOpen'),
    recentsPanelOpen: store.get('recentsPanelOpen'),
    outputDir: store.get('outputDir')
  }))

  ipcMain.handle('save-settings', (_event, settings: { theme?: string; sidebarOpen?: boolean; recentsPanelOpen?: boolean }) => {
    if (settings.theme) store.set('theme', settings.theme as 'dark' | 'light' | 'system')
    if (settings.sidebarOpen !== undefined) store.set('sidebarOpen', settings.sidebarOpen)
    if (settings.recentsPanelOpen !== undefined) store.set('recentsPanelOpen', settings.recentsPanelOpen)
  })

  ipcMain.handle('watch-file', (_event, filePath: string) => {
    startWatching(filePath, win)
  })

  ipcMain.handle('unwatch-file', (_event, filePath: string) => {
    stopWatchingPath(filePath)
  })

  ipcMain.handle('quit-app', () => {
    app.quit()
  })
}

export function stopWatching() {
  for (const path of watchedFiles.keys()) unwatchFile(path)
  watchedFiles.clear()
}
