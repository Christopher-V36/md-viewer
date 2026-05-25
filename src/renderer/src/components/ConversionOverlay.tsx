import { useState, useEffect } from 'react'

const MESSAGES = [
  { at: 0,  text: 'Convirtiendo a Markdown…' },
  { at: 5,  text: 'Procesando el contenido…' },
  { at: 12, text: 'Esto puede tardar un momento…' },
  { at: 25, text: 'Archivos grandes toman más tiempo…' },
  { at: 45, text: 'Trabajando, por favor espera…' },
]

interface Props {
  name: string
  onCancel?: () => void
}

export default function ConversionOverlay({ name, onCancel }: Props) {
  const [elapsed, setElapsed] = useState(0)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const message = [...MESSAGES].reverse().find(m => elapsed >= m.at)!.text

  const handleCancel = () => {
    if (cancelling) return
    setCancelling(true)
    onCancel?.()
  }

  return (
    <div className="conversion-overlay">
      <div className="conversion-card">
        <div className="conversion-spinner" />
        <h3>{message}</h3>
        <p>{name}</p>
        {elapsed >= 3 && (
          <span className="conversion-elapsed">{elapsed}s</span>
        )}
        {onCancel && (
          <button
            className="conversion-cancel"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? 'Cancelando…' : 'Cancelar'}
          </button>
        )}
      </div>
    </div>
  )
}
