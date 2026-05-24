import { useEffect, useState, useCallback } from 'react'

const KEY = 'ludami:theme'
type Mode = 'light' | 'dark'

function readInitial(): Mode {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(KEY) as Mode | null
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function apply(mode: Mode) {
  const root = document.documentElement
  root.classList.toggle('dark', mode === 'dark')
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])')
  if (meta) meta.content = mode === 'dark' ? '#1A1612' : '#F3EAD8'
}

export function useTheme() {
  const [mode, setMode] = useState<Mode>(readInitial)

  useEffect(() => { apply(mode); localStorage.setItem(KEY, mode) }, [mode])

  useEffect(() => {
    if (localStorage.getItem(KEY)) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => setMode(e.matches ? 'dark' : 'light')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const toggle = useCallback(() => setMode(m => m === 'dark' ? 'light' : 'dark'), [])
  return { mode, setMode, toggle }
}
