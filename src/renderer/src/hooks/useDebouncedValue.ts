import { useEffect, useState } from 'react'

// Returns `value` once it has stopped changing for `delay` ms. When `resetKey`
// changes (e.g. the user switched tabs) the new value is returned immediately,
// so stale text from the previous key never flashes on screen.
export function useDebouncedValue<T>(value: T, delay: number, resetKey?: unknown): T {
  const [state, setState] = useState({ key: resetKey, value })

  useEffect(() => {
    const t = setTimeout(() => setState({ key: resetKey, value }), delay)
    return () => clearTimeout(t)
  }, [value, resetKey, delay])

  return state.key === resetKey ? state.value : value
}
