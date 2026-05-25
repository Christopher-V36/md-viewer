export type ThemeMode = 'dark' | 'light' | 'system'

export interface ThemeVars {
  '--bg': string
  '--bg-sidebar': string
  '--bg-toolbar': string
  '--bg-code': string
  '--bg-hover': string
  '--bg-active': string
  '--border': string
  '--border-subtle': string
  '--text': string
  '--text-muted': string
  '--text-faint': string
  '--accent': string
  '--accent-hover': string
  '--highlight-bg': string
  '--highlight-current': string
}

export interface ThemeVariant {
  vars: ThemeVars
  preview: { bg: string; sidebar: string; accent: string; text: string }
}

export interface ThemePair {
  id: string
  name: string
  contentFont?: string
  light: ThemeVariant
  dark: ThemeVariant
}

export const THEME_PAIRS: ThemePair[] = [
  // ── Catppuccin ─────────────────────────────────────────────────────────────
  {
    id: 'catppuccin',
    name: 'Catppuccin',
    light: {
      preview: { bg: '#eff1f5', sidebar: '#e6e9ef', accent: '#1e66f5', text: '#4c4f69' },
      vars: {
        '--bg': '#eff1f5', '--bg-sidebar': '#e6e9ef', '--bg-toolbar': '#eff1f5',
        '--bg-code': '#dce0e8', '--bg-hover': '#ccd0da', '--bg-active': '#bec8f5',
        '--border': '#ccd0da', '--border-subtle': '#dce0e8',
        '--text': '#4c4f69', '--text-muted': '#5c5f77', '--text-faint': '#8c8fa1',
        '--accent': '#1e66f5', '--accent-hover': '#1858d8',
        '--highlight-bg': '#fdf0a8', '--highlight-current': '#fe640b',
      },
    },
    dark: {
      preview: { bg: '#1e1e2e', sidebar: '#181825', accent: '#89b4fa', text: '#cdd6f4' },
      vars: {
        '--bg': '#1e1e2e', '--bg-sidebar': '#181825', '--bg-toolbar': '#1e1e2e',
        '--bg-code': '#313244', '--bg-hover': '#313244', '--bg-active': '#1e3a5f',
        '--border': '#313244', '--border-subtle': '#2a2a3e',
        '--text': '#cdd6f4', '--text-muted': '#a6adc8', '--text-faint': '#6c7086',
        '--accent': '#89b4fa', '--accent-hover': '#b4d0ff',
        '--highlight-bg': '#7c6f21', '--highlight-current': '#e07c3a',
      },
    },
  },

  // ── GitHub ─────────────────────────────────────────────────────────────────
  {
    id: 'github',
    name: 'GitHub',
    light: {
      preview: { bg: '#ffffff', sidebar: '#f6f8fa', accent: '#0969da', text: '#24292f' },
      vars: {
        '--bg': '#ffffff', '--bg-sidebar': '#f6f8fa', '--bg-toolbar': '#ffffff',
        '--bg-code': '#f6f8fa', '--bg-hover': '#eaeef2', '--bg-active': '#dbeafe',
        '--border': '#d0d7de', '--border-subtle': '#eaeef2',
        '--text': '#24292f', '--text-muted': '#57606a', '--text-faint': '#8c959f',
        '--accent': '#0969da', '--accent-hover': '#0550ae',
        '--highlight-bg': '#fef08a', '--highlight-current': '#fb923c',
      },
    },
    dark: {
      preview: { bg: '#0d1117', sidebar: '#161b22', accent: '#58a6ff', text: '#e6edf3' },
      vars: {
        '--bg': '#0d1117', '--bg-sidebar': '#161b22', '--bg-toolbar': '#161b22',
        '--bg-code': '#161b22', '--bg-hover': '#21262d', '--bg-active': '#1f3a5c',
        '--border': '#30363d', '--border-subtle': '#21262d',
        '--text': '#e6edf3', '--text-muted': '#8b949e', '--text-faint': '#484f58',
        '--accent': '#58a6ff', '--accent-hover': '#79c0ff',
        '--highlight-bg': '#5c4b00', '--highlight-current': '#d29922',
      },
    },
  },

  // ── Claude ─────────────────────────────────────────────────────────────────
  {
    id: 'claude',
    name: 'Claude',
    contentFont: "'Lora', 'Georgia', serif",
    light: {
      preview: { bg: '#f4f3ee', sidebar: '#ede8e0', accent: '#C15F3C', text: '#1a1a1a' },
      vars: {
        '--bg': '#f4f3ee', '--bg-sidebar': '#ede8e0', '--bg-toolbar': '#f4f3ee',
        '--bg-code': '#e8e3d8', '--bg-hover': '#ddd8cc', '--bg-active': '#f0ddd4',
        '--border': '#d8d0c4', '--border-subtle': '#e4ddd4',
        '--text': '#1a1a1a', '--text-muted': '#6b6b6b', '--text-faint': '#9b9b9b',
        '--accent': '#C15F3C', '--accent-hover': '#a04e30',
        '--highlight-bg': '#fde68a', '--highlight-current': '#C15F3C',
      },
    },
    dark: {
      preview: { bg: '#1c1c1e', sidebar: '#161618', accent: '#E8754C', text: '#f5f5f7' },
      vars: {
        '--bg': '#1c1c1e', '--bg-sidebar': '#161618', '--bg-toolbar': '#1c1c1e',
        '--bg-code': '#2c2c2e', '--bg-hover': '#2c2c2e', '--bg-active': '#3a2015',
        '--border': '#2c2c2e', '--border-subtle': '#242424',
        '--text': '#f5f5f7', '--text-muted': '#aeaeb2', '--text-faint': '#636366',
        '--accent': '#E8754C', '--accent-hover': '#f08060',
        '--highlight-bg': '#5a3520', '--highlight-current': '#b84a2e',
      },
    },
  },

  // ── Nord ───────────────────────────────────────────────────────────────────
  {
    id: 'nord',
    name: 'Nord',
    light: {
      preview: { bg: '#eceff4', sidebar: '#e5e9f0', accent: '#5e81ac', text: '#2e3440' },
      vars: {
        '--bg': '#eceff4', '--bg-sidebar': '#e5e9f0', '--bg-toolbar': '#eceff4',
        '--bg-code': '#dce2ec', '--bg-hover': '#d0d8e6', '--bg-active': '#c5d1e8',
        '--border': '#d8dee9', '--border-subtle': '#e5e9f0',
        '--text': '#2e3440', '--text-muted': '#4c566a', '--text-faint': '#7b88a1',
        '--accent': '#5e81ac', '--accent-hover': '#4c6f96',
        '--highlight-bg': '#ebcb8b55', '--highlight-current': '#d08770',
      },
    },
    dark: {
      preview: { bg: '#2e3440', sidebar: '#272c36', accent: '#88c0d0', text: '#eceff4' },
      vars: {
        '--bg': '#2e3440', '--bg-sidebar': '#272c36', '--bg-toolbar': '#3b4252',
        '--bg-code': '#3b4252', '--bg-hover': '#434c5e', '--bg-active': '#1e3a4a',
        '--border': '#434c5e', '--border-subtle': '#3b4252',
        '--text': '#eceff4', '--text-muted': '#d8dee9', '--text-faint': '#4c566a',
        '--accent': '#88c0d0', '--accent-hover': '#a3d5e0',
        '--highlight-bg': '#4a5c2a', '--highlight-current': '#ebcb8b',
      },
    },
  },

  // ── Dracula ────────────────────────────────────────────────────────────────
  {
    id: 'dracula',
    name: 'Dracula',
    light: {
      preview: { bg: '#f8f8f2', sidebar: '#f0f0f5', accent: '#7c5cbf', text: '#383a59' },
      vars: {
        '--bg': '#f8f8f2', '--bg-sidebar': '#f0f0f5', '--bg-toolbar': '#f8f8f2',
        '--bg-code': '#e8e8f0', '--bg-hover': '#e0e0ec', '--bg-active': '#d8d0f0',
        '--border': '#d8d8e8', '--border-subtle': '#ebebf5',
        '--text': '#383a59', '--text-muted': '#6272a4', '--text-faint': '#9090b0',
        '--accent': '#7c5cbf', '--accent-hover': '#6a4aad',
        '--highlight-bg': '#fffa8580', '--highlight-current': '#ff79c680',
      },
    },
    dark: {
      preview: { bg: '#282a36', sidebar: '#21222c', accent: '#bd93f9', text: '#f8f8f2' },
      vars: {
        '--bg': '#282a36', '--bg-sidebar': '#21222c', '--bg-toolbar': '#21222c',
        '--bg-code': '#21222c', '--bg-hover': '#3a3c4e', '--bg-active': '#3d2d5c',
        '--border': '#44475a', '--border-subtle': '#383a4c',
        '--text': '#f8f8f2', '--text-muted': '#6272a4', '--text-faint': '#44475a',
        '--accent': '#bd93f9', '--accent-hover': '#d6acff',
        '--highlight-bg': '#5c4a00', '--highlight-current': '#ff79c6',
      },
    },
  },

  // ── Tokyo Night ────────────────────────────────────────────────────────────
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    light: {
      preview: { bg: '#e1e2e7', sidebar: '#d5d6db', accent: '#2e7de9', text: '#3760bf' },
      vars: {
        '--bg': '#e1e2e7', '--bg-sidebar': '#d5d6db', '--bg-toolbar': '#e1e2e7',
        '--bg-code': '#c8cad6', '--bg-hover': '#bfc1cc', '--bg-active': '#b0c4f0',
        '--border': '#c4c6d0', '--border-subtle': '#d5d6db',
        '--text': '#3760bf', '--text-muted': '#6172b0', '--text-faint': '#848cb5',
        '--accent': '#2e7de9', '--accent-hover': '#2368d4',
        '--highlight-bg': '#f5dd9080', '--highlight-current': '#e0a870',
      },
    },
    dark: {
      preview: { bg: '#1a1b26', sidebar: '#16161e', accent: '#7aa2f7', text: '#c0caf5' },
      vars: {
        '--bg': '#1a1b26', '--bg-sidebar': '#16161e', '--bg-toolbar': '#1a1b26',
        '--bg-code': '#1f2335', '--bg-hover': '#292e42', '--bg-active': '#1e2f5a',
        '--border': '#292e42', '--border-subtle': '#1f2335',
        '--text': '#c0caf5', '--text-muted': '#9aa5ce', '--text-faint': '#565f89',
        '--accent': '#7aa2f7', '--accent-hover': '#9bb5ff',
        '--highlight-bg': '#4a4200', '--highlight-current': '#e0af68',
      },
    },
  },

  // ── Gruvbox ────────────────────────────────────────────────────────────────
  {
    id: 'gruvbox',
    name: 'Gruvbox',
    contentFont: "'Georgia', 'Times New Roman', serif",
    light: {
      preview: { bg: '#fbf1c7', sidebar: '#f2e5bc', accent: '#458588', text: '#3c3836' },
      vars: {
        '--bg': '#fbf1c7', '--bg-sidebar': '#f2e5bc', '--bg-toolbar': '#fbf1c7',
        '--bg-code': '#f2e5bc', '--bg-hover': '#e8d8a8', '--bg-active': '#c8ddc0',
        '--border': '#d5c4a1', '--border-subtle': '#ebdbb2',
        '--text': '#3c3836', '--text-muted': '#665c54', '--text-faint': '#928374',
        '--accent': '#458588', '--accent-hover': '#357070',
        '--highlight-bg': '#fabd2f60', '--highlight-current': '#d65d0e',
      },
    },
    dark: {
      preview: { bg: '#282828', sidebar: '#1d2021', accent: '#83a598', text: '#ebdbb2' },
      vars: {
        '--bg': '#282828', '--bg-sidebar': '#1d2021', '--bg-toolbar': '#282828',
        '--bg-code': '#3c3836', '--bg-hover': '#3c3836', '--bg-active': '#2a3a2a',
        '--border': '#3c3836', '--border-subtle': '#32302f',
        '--text': '#ebdbb2', '--text-muted': '#a89984', '--text-faint': '#665c54',
        '--accent': '#83a598', '--accent-hover': '#a0c5ba',
        '--highlight-bg': '#504945', '--highlight-current': '#d79921',
      },
    },
  },

  // ── Obsidian ───────────────────────────────────────────────────────────────
  {
    id: 'obsidian',
    name: 'Obsidian',
    light: {
      preview: { bg: '#f8f8f8', sidebar: '#f0f0f0', accent: '#7c3aed', text: '#1a1a1a' },
      vars: {
        '--bg': '#f8f8f8', '--bg-sidebar': '#f0f0f0', '--bg-toolbar': '#f8f8f8',
        '--bg-code': '#e8e8e8', '--bg-hover': '#e0e0e0', '--bg-active': '#ddd0f8',
        '--border': '#dcdcdc', '--border-subtle': '#eeeeee',
        '--text': '#1a1a1a', '--text-muted': '#555555', '--text-faint': '#999999',
        '--accent': '#7c3aed', '--accent-hover': '#6a28db',
        '--highlight-bg': '#fef08a', '--highlight-current': '#8b5cf6',
      },
    },
    dark: {
      preview: { bg: '#1a1a1a', sidebar: '#161616', accent: '#8b5cf6', text: '#e0e0e0' },
      vars: {
        '--bg': '#1a1a1a', '--bg-sidebar': '#161616', '--bg-toolbar': '#1e1e1e',
        '--bg-code': '#2a2a2a', '--bg-hover': '#2a2a2a', '--bg-active': '#2d2040',
        '--border': '#2a2a2a', '--border-subtle': '#222222',
        '--text': '#e0e0e0', '--text-muted': '#a0a0a0', '--text-faint': '#6b6b6b',
        '--accent': '#8b5cf6', '--accent-hover': '#a78bfa',
        '--highlight-bg': '#5c4a00', '--highlight-current': '#7c3aed',
      },
    },
  },
]

export const DEFAULT_PAIR_ID = 'catppuccin'
export const DEFAULT_MODE: ThemeMode = 'system'

export const CONTENT_FONTS = [
  { id: 'default', name: 'System Default', value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  { id: 'inter', name: 'Inter', value: "'Inter', sans-serif" },
  { id: 'lora', name: 'Lora', value: "'Lora', 'Georgia', serif" },
  { id: 'merriweather', name: 'Merriweather', value: "'Merriweather', 'Georgia', serif" },
  { id: 'ibm-plex', name: 'IBM Plex Sans', value: "'IBM Plex Sans', sans-serif" },
  { id: 'source-serif', name: 'Source Serif 4', value: "'Source Serif 4', 'Georgia', serif" },
]
