import { app, BrowserWindow, dialog, shell } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'
import { store } from './store'
import {
  registerIpcHandlers, stopWatching, prewarmConverter,
  shouldBlockClose, isCloseApproved, resetCloseGuard
} from './ipc'
import { setMenu, refreshMenu } from './menu'

// Enforce single instance
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) { app.quit() }

const SUPPORTED_ARG_EXTS = /\.(md|markdown|pdf|docx|xlsx|xls|pptx|ppt|html|htm|txt|csv|json|xml|jpg|jpeg|png|gif|bmp|webp|mp3|wav|zip)$/i

function getArgFile(argv: string[]): string | null {
  for (const arg of argv.slice(1)) {
    if (SUPPORTED_ARG_EXTS.test(arg) && existsSync(arg)) return arg
  }
  return null
}

let mainWindow: BrowserWindow | null = null
let pendingFile: string | null = getArgFile(process.argv)

function createWindow() {
  const bounds = store.get('windowBounds')

  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    minWidth: 680,
    minHeight: 500,
    title: 'MD Viewer',
    backgroundColor: '#1e1e2e',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      webSecurity: false // allow file:// images
    },
    show: false,
    titleBarStyle: 'default'
  })

  // Prevent Electron from navigating when a file is dragged onto the window
  mainWindow.webContents.on('will-navigate', (e) => e.preventDefault())

  mainWindow.once('ready-to-show', () => {
    mainWindow!.show()
    if (pendingFile) {
      mainWindow!.webContents.send('open-file-from-os', pendingFile)
      pendingFile = null
    }
  })

  // Unsaved edits: hold the close back and let the renderer run the Word-style
  // "save changes?" prompt. It calls `confirm-close` once every tab is resolved,
  // which re-triggers this event with the guard released.
  mainWindow.on('close', (e) => {
    if (!mainWindow) return
    if (shouldBlockClose()) {
      e.preventDefault()
      mainWindow.webContents.send('confirm-close-requested')
      return
    }
    // Save window size on close
    const [width, height] = mainWindow.getSize()
    const [x, y] = mainWindow.getPosition()
    store.set('windowBounds', { width, height, x, y })
  })

  // A reload (View → Reload / Ctrl+R) would silently throw the drafts away, so
  // the renderer's beforeunload guard blocks it and we ask here instead.
  mainWindow.webContents.on('will-prevent-unload', (event) => {
    if (isCloseApproved()) { event.preventDefault(); return }
    const choice = dialog.showMessageBoxSync(mainWindow!, {
      type: 'warning',
      buttons: ['Cancelar', 'Descartar cambios y recargar'],
      defaultId: 0,
      cancelId: 0,
      title: 'MD Viewer',
      message: 'Hay cambios sin guardar.',
      detail: 'Si recargas ahora, se perderán los cambios que no hayas guardado.'
    })
    if (choice === 1) event.preventDefault()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
    resetCloseGuard()
  })

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  registerIpcHandlers(mainWindow)
  setMenu(mainWindow, (filePath) => {
    mainWindow?.webContents.send('open-file-from-os', filePath)
    refreshMenu(mainWindow!, (p) => mainWindow?.webContents.send('open-file-from-os', p))
  })

  // electron-vite injects ELECTRON_RENDERER_URL automatically in dev
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.on('second-instance', (_event, argv) => {
  const filePath = getArgFile(argv)
  if (filePath && mainWindow) {
    mainWindow.webContents.send('open-file-from-os', filePath)
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})

app.whenReady().then(() => {
  createWindow()
  // Warm the converter in the background after the UI is up — Windows caches
  // the bundle's DLLs so the first real conversion is ~2× faster.
  prewarmConverter()
})

app.on('window-all-closed', () => {
  stopWatching()
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
