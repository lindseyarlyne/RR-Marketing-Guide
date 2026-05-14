'use client'

import { useEffect, useState } from 'react'
import FounderPage from '@/components/pages/founder-page'

interface EmailHealth {
  id: string
  name: string
  count: number
  lastSent: string | null
  lastEvent: string | null
}

interface FounderMetrics {
  totalUsers: number
  newThisWeek: number
  newThisMonth: number
  trialing: number
  expiringThisWeek: number
  paid: number
  monthlyPaid: number
  annualPaid: number
  canceled: number
  activeLastWeek: number
  ritualsCompleted: number
  conversionRate: string
  mrr: string
  recentSignups: { email: string; created_at: string }[]
  emailHealth: EmailHealth[]
}

export function FounderModule() {
  const [data, setData] = useState<FounderMetrics | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetch('/api/founder/metrics')
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string }
          throw new Error(body.error || 'Unable to load founder metrics.')
        }
        return (await res.json()) as FounderMetrics
      })
      .then((metrics) => {
        if (active) setData(metrics)
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : 'Unable to load founder metrics.')
      })
    return () => {
      active = false
    }
  }, [])

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-card rounded-xl border border-border p-5 text-sm text-muted-foreground">
          {error}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="bg-card rounded-xl border border-border p-5 text-sm text-muted-foreground">
          Loading founder module...
        </div>
      </div>
    )
  }

  return <FounderPage {...data} />
}
