import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'

interface StoreData {
  recentFiles: string[]
  theme: 'dark' | 'light' | 'system'
  sidebarOpen: boolean
  recentsPanelOpen: boolean
  windowBounds: { width: number; height: number; x?: number; y?: number }
  outputDir: string
}

const defaults: StoreData = {
  recentFiles: [],
  theme: 'system',
  sidebarOpen: true,
  recentsPanelOpen: true,
  windowBounds: { width: 1200, height: 820 },
  outputDir: ''
}

class Store {
  private data: StoreData
  private path: string

  constructor() {
    this.path = join(app.getPath('userData'), 'settings.json')
    this.data = this.load()
  }

  private load(): StoreData {
    try {
      if (existsSync(this.path)) {
        return { ...defaults, ...JSON.parse(readFileSync(this.path, 'utf-8')) }
      }
    } catch { /* ignore */ }
    return { ...defaults }
  }

  private save() {
    try { writeFileSync(this.path, JSON.stringify(this.data, null, 2)) } catch { /* ignore */ }
  }

  get<K extends keyof StoreData>(key: K): StoreData[K] { return this.data[key] }

  set<K extends keyof StoreData>(key: K, value: StoreData[K]) {
    this.data[key] = value
    this.save()
  }

  addRecentFile(filePath: string) {
    const list = this.data.recentFiles.filter(f => f !== filePath)
    list.unshift(filePath)
    this.data.recentFiles = list.slice(0, 10)
    this.save()
  }

  clearRecentFiles() {
    this.data.recentFiles = []
    this.save()
  }
}

export const store = new Store()
