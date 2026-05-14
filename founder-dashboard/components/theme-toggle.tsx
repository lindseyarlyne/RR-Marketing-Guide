'use client'

import { useCallback, useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

export const RR_THEME_CHANGE_EVENT = 'rr-theme-change'

/** Keep `data-theme` (CSS variables) and Tailwind `dark:` (`@custom-variant dark`) in sync. */
function applyRrTheme(theme: 'dark' | 'light') {
  const el = document.documentElement
  el.setAttribute('data-theme', theme)
  el.classList.toggle('dark', theme === 'dark')
}

export function syncDocumentThemeFromPreferences() {
  const stored = localStorage.getItem('rr-theme')
  if (stored === 'dark' || stored === 'light') {
    applyRrTheme(stored)
    return
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  applyRrTheme(prefersDark ? 'dark' : 'light')
}

function readIsDark(): boolean {
  if (typeof document === 'undefined') return false
  return document.documentElement.getAttribute('data-theme') === 'dark'
}

export function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(false)

  const refresh = useCallback(() => {
    syncDocumentThemeFromPreferences()
    setIsDark(readIsDark())
  }, [])

  useEffect(() => {
    refresh()
    window.addEventListener(RR_THEME_CHANGE_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(RR_THEME_CHANGE_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [refresh])

  const toggle = () => {
    const next = !readIsDark()
    const theme = next ? 'dark' : 'light'
    applyRrTheme(theme)
    localStorage.setItem('rr-theme', theme)
    setIsDark(next)
    window.dispatchEvent(new Event(RR_THEME_CHANGE_EVENT))
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'p-1.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        className
      )}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {isDark ? <Sun className="w-4 h-4" aria-hidden /> : <Moon className="w-4 h-4" aria-hidden />}
    </button>
  )
}
