export const VIEWER_EXTS = ['.md', '.markdown', '.txt', '.csv'] as const

export const CONVERTER_EXTS = [
  '.pdf', '.docx', '.xlsx', '.xls', '.pptx', '.ppt',
  '.html', '.htm', '.json', '.xml',
  '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp',
  '.mp3', '.wav', '.zip',
] as const

export const ALL_SUPPORTED = [...VIEWER_EXTS, ...CONVERTER_EXTS]

export type FileKind = 'view' | 'convert' | 'unsupported'

export function classify(path: string): FileKind {
  const idx = path.lastIndexOf('.')
  if (idx < 0) return 'unsupported'
  const ext = path.slice(idx).toLowerCase()
  if ((VIEWER_EXTS as readonly string[]).includes(ext)) return 'view'
  if ((CONVERTER_EXTS as readonly string[]).includes(ext)) return 'convert'
  return 'unsupported'
}

export function basename(path: string): string {
  return path.split(/[/\\]/).pop() || path
}
