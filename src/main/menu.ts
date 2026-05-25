import { Menu, BrowserWindow, shell } from 'electron'
import { store } from './store'

function buildMenu(win: BrowserWindow, onOpen: (path: string) => void) {
  const recentItems = store.get('recentFiles').map(filePath => ({
    label: filePath.split(/[/\\]/).pop() as string,
    sublabel: filePath,
    click: () => onOpen(filePath)
  }))

  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open…',
          accelerator: 'CmdOrCtrl+O',
          click: () => win.webContents.send('menu-open-file')
        },
        {
          label: 'Convertir archivo…',
          click: () => win.webContents.send('menu-convert-file')
        },
        {
          label: 'Open Recent',
          submenu: recentItems.length
            ? recentItems
            : [{ label: 'No recent files', enabled: false }]
        },
        { type: 'separator' },
        {
          label: 'Print…',
          accelerator: 'CmdOrCtrl+P',
          click: () => win.webContents.print({ silent: false })
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Sidebar',
          accelerator: 'CmdOrCtrl+\\',
          click: () => win.webContents.send('toggle-sidebar')
        },
        {
          label: 'Toggle Dark Mode',
          accelerator: 'CmdOrCtrl+Shift+D',
          click: () => win.webContents.send('toggle-theme')
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About MD Viewer',
          click: () =>
            shell.openExternal('https://github.com')
        }
      ]
    }
  ]

  return Menu.buildFromTemplate(template)
}

export function setMenu(win: BrowserWindow, onOpen: (path: string) => void) {
  const menu = buildMenu(win, onOpen)
  Menu.setApplicationMenu(menu)
}

export function refreshMenu(win: BrowserWindow, onOpen: (path: string) => void) {
  setMenu(win, onOpen)
}
