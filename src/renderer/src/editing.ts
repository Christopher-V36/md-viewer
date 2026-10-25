import type { Tab } from './types'

// Only real Markdown files can be edited — .txt and .csv are rewritten for
// display (<pre> / table), so their tab content isn't the file's source text.
export function isEditable(path: string): boolean {
  return /\.(md|markdown)$/i.test(path)
}

// Line endings are normalised to LF inside the editor (that's what a textarea
// hands back) and restored to the file's original style on save, so editing a
// CRLF file on Windows doesn't rewrite every line.
export const toLf = (s: string): string => s.replace(/\r\n/g, '\n')

export function withOriginalEol(draft: string, original: string): string {
  return original.includes('\r\n') ? draft.replace(/\n/g, '\r\n') : draft
}

export const hasUnsavedChanges = (tab: Tab): boolean =>
  !!tab.editing && tab.draft !== undefined && tab.draft !== toLf(tab.content)

// Apply text freshly read from disk to a tab. A tab with unsaved edits is left
// alone (the user's work wins); an editor with no edits follows the file.
export function withDiskContent(tab: Tab, content: string): Tab {
  if (hasUnsavedChanges(tab)) return tab
  return { ...tab, content, draft: tab.editing ? toLf(content) : tab.draft }
}
