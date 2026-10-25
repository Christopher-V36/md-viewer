import { useEffect, useRef } from 'react'

export type UnsavedChoice = 'save' | 'discard' | 'cancel'

interface Props {
  name: string
  onChoice: (choice: UnsavedChoice) => void
}

// "Do you want to save the changes to X?" — Save / Don't save / Cancel, in the
// same order and with the same meaning as Word.
export default function UnsavedDialog({ name, onChoice }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const saveRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { saveRef.current?.focus() }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onChoice('cancel')
        return
      }
      // Keep Tab inside the dialog while it is open.
      if (e.key === 'Tab') {
        const buttons = Array.from(cardRef.current?.querySelectorAll('button') ?? [])
        if (!buttons.length) return
        const first = buttons[0]
        const last = buttons[buttons.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [onChoice])

  return (
    <div className="dialog-overlay">
      <div
        ref={cardRef}
        className="dialog-card"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="unsaved-title"
        aria-describedby="unsaved-desc"
      >
        <h3 id="unsaved-title">¿Quieres guardar los cambios en «{name}»?</h3>
        <p id="unsaved-desc">Si no los guardas, se perderán los cambios que has hecho.</p>
        <div className="dialog-actions">
          <button ref={saveRef} className="dialog-btn dialog-btn--primary" onClick={() => onChoice('save')}>
            Guardar
          </button>
          <button className="dialog-btn" onClick={() => onChoice('discard')}>
            No guardar
          </button>
          <button className="dialog-btn" onClick={() => onChoice('cancel')}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
