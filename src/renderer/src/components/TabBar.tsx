import { useEffect, useRef, useState, useCallback } from 'react'
import type { Tab } from '../types'
import { basename } from '../supported'
import { hasUnsavedChanges } from '../editing'

interface Props {
  tabs: Tab[]
  activeTabId: string | null
  onSwitchTab: (id: string) => void
  onCloseTab: (id: string) => void
  onReorderTabs: (fromIndex: number, toIndex: number) => void
}

export default function TabBar({ tabs, activeTabId, onSwitchTab, onCloseTab, onReorderTabs }: Props) {
  const activeRef = useRef<HTMLButtonElement>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<number | null>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' })
  }, [activeTabId])

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDragId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropTarget(idx)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, toIdx: number) => {
    e.preventDefault()
    if (!dragId) return
    const fromIdx = tabs.findIndex(t => t.id === dragId)
    if (fromIdx !== -1 && fromIdx !== toIdx) onReorderTabs(fromIdx, toIdx)
    setDragId(null)
    setDropTarget(null)
  }, [dragId, tabs, onReorderTabs])

  const handleDragEnd = useCallback(() => {
    setDragId(null)
    setDropTarget(null)
  }, [])

  return (
    <div className="tab-bar" role="tablist">
      {tabs.map((tab, idx) => {
        const isActive = tab.id === activeTabId
        const isDragging = tab.id === dragId
        const isDropTarget = idx === dropTarget && dragId !== null && tab.id !== dragId
        return (
          <div
            key={tab.id}
            className={`tab ${isActive ? 'tab--active' : ''} ${isDragging ? 'tab--dragging' : ''} ${isDropTarget ? 'tab--drop-target' : ''}`}
            draggable
            onDragStart={e => handleDragStart(e, tab.id)}
            onDragOver={e => handleDragOver(e, idx)}
            onDrop={e => handleDrop(e, idx)}
            onDragEnd={handleDragEnd}
          >
            <button
              ref={isActive ? activeRef : undefined}
              className="tab-label"
              onClick={() => onSwitchTab(tab.id)}
              onAuxClick={e => { if (e.button === 1) onCloseTab(tab.id) }}
              title={tab.filePath}
              role="tab"
              aria-selected={isActive}
            >
              {hasUnsavedChanges(tab)
                ? <span className="tab-unsaved" role="img" aria-label="Cambios sin guardar" />
                : tab.dirty && <span className="tab-dirty" aria-label="Modificado" />}
              {basename(tab.filePath)}
            </button>
            <button
              className="tab-close"
              onClick={e => { e.stopPropagation(); onCloseTab(tab.id) }}
              title="Cerrar pestaña (Ctrl+W)"
              aria-label="Cerrar pestaña"
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}
