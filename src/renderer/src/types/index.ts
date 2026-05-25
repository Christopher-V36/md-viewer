export interface Tab {
  id: string
  filePath: string
  // Already transformed via transformForDisplay (txt → <pre>, csv → table).
  content: string
  // True when the file changed on disk but the user hasn't viewed the tab yet.
  dirty?: boolean
}

export interface TOCItem {
  level: number
  text: string
  id: string
  children: TOCItem[]
}

export interface FrontmatterData {
  title?: string
  date?: string | Date
  tags?: string[]
  author?: string
  description?: string
  [key: string]: unknown
}

export interface MarkdownResult {
  html: string
  toc: TOCItem[]
  frontmatter: FrontmatterData
}

export interface Settings {
  theme: 'dark' | 'light' | 'system'
  sidebarOpen: boolean
  recentsPanelOpen: boolean
  outputDir: string
}

declare global {
  interface Window {
    api: {
      openFile: () => Promise<string | null>
      openConvertDialog: () => Promise<string | null>
      readFile: (filePath: string) => Promise<string>
      convertFile: (inputPath: string) => Promise<string>
      cancelConversion: () => Promise<void>
      getFilePath: (file: File) => string
      saveAsPdf: (sourcePath?: string) => Promise<string | null>
      showItemInFolder: (filePath: string) => Promise<void>
      clearRecentFiles: () => Promise<void>
      browseOutputDir: () => Promise<string | null>
      resetOutputDir: () => Promise<void>
      setWindowTitle: (title: string) => Promise<void>
      getRecentFiles: () => Promise<string[]>
      getSettings: () => Promise<Settings>
      saveSettings: (settings: Partial<Settings>) => Promise<void>
      watchFile: (filePath: string) => Promise<void>
      unwatchFile: (filePath: string) => Promise<void>
      onFileChanged: (callback: (path: string) => void) => () => void
      onOpenFile: (callback: (path: string) => void) => () => void
      onMenuOpenFile: (callback: () => void) => () => void
      onMenuConvertFile: (callback: () => void) => () => void
      onToggleSidebar: (callback: () => void) => () => void
      onToggleTheme: (callback: () => void) => () => void
      quit: () => Promise<void>
    }
  }
}
