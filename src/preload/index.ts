import { contextBridge, ipcRenderer, webUtils } from 'electron'

contextBridge.exposeInMainWorld('api', {
  openFile: (): Promise<string | null> =>
    ipcRenderer.invoke('open-file'),

  openConvertDialog: (): Promise<string | null> =>
    ipcRenderer.invoke('open-convert-dialog'),

  readFile: (filePath: string): Promise<string> =>
    ipcRenderer.invoke('read-file', filePath),

  convertFile: (inputPath: string): Promise<string> =>
    ipcRenderer.invoke('convert-file', inputPath),

  cancelConversion: (): Promise<void> =>
    ipcRenderer.invoke('cancel-conversion'),

  getFilePath: (file: File): string =>
    webUtils.getPathForFile(file),

  saveAsPdf: (sourcePath?: string): Promise<string | null> =>
    ipcRenderer.invoke('save-as-pdf', sourcePath),

  showItemInFolder: (filePath: string): Promise<void> =>
    ipcRenderer.invoke('show-item-in-folder', filePath),

  clearRecentFiles: (): Promise<void> =>
    ipcRenderer.invoke('clear-recent-files'),

  browseOutputDir: (): Promise<string | null> =>
    ipcRenderer.invoke('browse-output-dir'),

  resetOutputDir: (): Promise<void> =>
    ipcRenderer.invoke('reset-output-dir'),

  setWindowTitle: (title: string): Promise<void> =>
    ipcRenderer.invoke('set-window-title', title),

  getRecentFiles: (): Promise<string[]> =>
    ipcRenderer.invoke('get-recent-files'),

  getSettings: (): Promise<{ theme: string; sidebarOpen: boolean }> =>
    ipcRenderer.invoke('get-settings'),

  saveSettings: (settings: { theme?: string; sidebarOpen?: boolean }): Promise<void> =>
    ipcRenderer.invoke('save-settings', settings),

  watchFile: (filePath: string): Promise<void> =>
    ipcRenderer.invoke('watch-file', filePath),

  unwatchFile: (filePath: string): Promise<void> =>
    ipcRenderer.invoke('unwatch-file', filePath),

  onFileChanged: (callback: (path: string) => void): (() => void) => {
    const handler = (_: unknown, path: string) => callback(path)
    ipcRenderer.on('file-changed', handler)
    return () => ipcRenderer.removeListener('file-changed', handler)
  },

  onOpenFile: (callback: (path: string) => void): (() => void) => {
    const handler = (_: unknown, path: string) => callback(path)
    ipcRenderer.on('open-file-from-os', handler)
    return () => ipcRenderer.removeListener('open-file-from-os', handler)
  },

  onMenuOpenFile: (callback: () => void): (() => void) => {
    const handler = () => callback()
    ipcRenderer.on('menu-open-file', handler)
    return () => ipcRenderer.removeListener('menu-open-file', handler)
  },

  onMenuConvertFile: (callback: () => void): (() => void) => {
    const handler = () => callback()
    ipcRenderer.on('menu-convert-file', handler)
    return () => ipcRenderer.removeListener('menu-convert-file', handler)
  },

  onToggleSidebar: (callback: () => void): (() => void) => {
    const handler = () => callback()
    ipcRenderer.on('toggle-sidebar', handler)
    return () => ipcRenderer.removeListener('toggle-sidebar', handler)
  },

  onToggleTheme: (callback: () => void): (() => void) => {
    const handler = () => callback()
    ipcRenderer.on('toggle-theme', handler)
    return () => ipcRenderer.removeListener('toggle-theme', handler)
  },

  quit: (): Promise<void> =>
    ipcRenderer.invoke('quit-app'),
})
