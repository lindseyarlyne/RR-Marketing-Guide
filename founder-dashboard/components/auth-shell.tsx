'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="font-serif text-lg italic text-foreground shrink-0">
            Ritual Runway
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="https://ritualrunway.com"
              className="text-xs uppercase tracking-widest text-primary hover:text-foreground transition-colors whitespace-nowrap"
            >
              App
            </Link>
            <ThemeToggle className="text-primary hover:text-foreground shrink-0" />
          </div>
        </div>
      </nav>
      <div className="flex-1 flex flex-col items-center justify-center p-4">{children}</div>
    </div>
  )
}
