import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { isFounderUser } from '@/lib/founder-tasks'

const EMAIL_TYPES = [
  { id: 'trial-welcome', name: 'Trial Welcome' },
  { id: 'activation-72hr', name: '72-Hour Activation' },
  { id: 'day-10', name: 'Day 10 Follow-up' },
  { id: 'first-ritual', name: 'First Ritual Completed' },
  { id: 'ritual-incomplete', name: 'Ritual Incomplete Reminder' },
  { id: 'renewal', name: 'Subscription Renewal' },
  { id: 'quarterly-tax', name: 'Quarterly Tax Date' },
  { id: 'savings-25', name: 'Savings Goal 25%' },
  { id: 'savings-50', name: 'Savings Goal 50%' },
  { id: 'savings-100', name: 'Savings Goal 100%' },
]

const subjectMap: Record<string, string> = {
  'trial-welcome': 'One thing to do before your week starts.',
  'activation-72hr': 'Your first paycheck assignment takes 4 minutes.',
  'day-10': 'Your budget is still waiting on one thing.',
  'first-ritual': 'You ran your first ritual.',
  'ritual-incomplete': '',
  renewal: 'Your plan renews in one week.',
  'quarterly-tax': 'Your quarterly payment is due in two weeks.',
  'savings-25': 'You are a quarter of the way there.',
  'savings-50': 'Halfway.',
  'savings-100': 'You hit it.',
}

interface ResendEmail {
  id: string
  subject: string
  created_at: string
  last_event: string
}

interface EmailHealth {
  id: string
  name: string
  count: number
  lastSent: string | null
  lastEvent: string | null
}

function pct(a: number, b: number): string {
  if (b === 0) return '-'
  return Math.round((a / b) * 100) + '%'
}

function mrrEstimate(monthly: number, annual: number): string {
  const total = monthly * 7 + annual * 5
  return '$' + total.toLocaleString()
}

async function fetchEmailHealth(): Promise<EmailHealth[]> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return EMAIL_TYPES.map((t) => ({ id: t.id, name: t.name, count: 0, lastSent: null, lastEvent: null }))
  }

  const emails: ResendEmail[] = []
  let cursor: string | null = null

  for (let page = 0; page < 5; page++) {
    const url = new URL('https://api.resend.com/emails')
    url.searchParams.set('limit', '100')
    if (cursor) url.searchParams.set('after', cursor)

    try {
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: 'no-store',
      })
      if (!res.ok) break
      const json = (await res.json()) as { data?: ResendEmail[] }
      const batch = json.data ?? []
      if (batch.length === 0) break
      emails.push(...batch)
      cursor = batch[batch.length - 1]?.id ?? null
      if (batch.length < 100) break
    } catch {
      break
    }
  }

  return EMAIL_TYPES.map((type) => {
    const subject = subjectMap[type.id] ?? ''
    const matches = subject ? emails.filter((e) => e.subject?.toLowerCase().includes(subject.toLowerCase())) : []
    const sorted = [...matches].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return {
      id: type.id,
      name: type.name,
      count: matches.length,
      lastSent: sorted[0]?.created_at ?? null,
      lastEvent: sorted[0]?.last_event ?? null,
    }
  })
}

export async function GET() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isFounderUser(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = getSupabaseAdmin()
  const [{ data: authData }, { data: budgets }, emailHealth] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin
      .from('user_budgets')
      .select('subscription_status, subscription_plan, trial_ends_at, last_login_at, last_ritual_completed'),
    fetchEmailHealth(),
  ])

  const authUsers = authData?.users ?? []
  const allBudgets = budgets ?? []

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000)
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 86400000)

  const totalUsers = authUsers.length
  const newThisWeek = authUsers.filter((u) => new Date(u.created_at) > sevenDaysAgo).length
  const newThisMonth = authUsers.filter((u) => new Date(u.created_at) > thirtyDaysAgo).length

  const trialing = allBudgets.filter((b) => b.subscription_status === 'trialing')
  const paid = allBudgets.filter((b) => b.subscription_status === 'active')
  const canceled = allBudgets.filter((b) => b.subscription_status === 'canceled')

  const expiringThisWeek = trialing.filter((b) => {
    if (!b.trial_ends_at) return false
    const end = new Date(b.trial_ends_at)
    return end > now && end <= sevenDaysFromNow
  })

  const monthlyPaid = paid.filter((b) => b.subscription_plan === 'monthly').length
  const annualPaid = paid.filter((b) => b.subscription_plan === 'annual' || b.subscription_plan === 'yearly').length
  const activeLastWeek = allBudgets.filter((b) => b.last_login_at && new Date(b.last_login_at) > sevenDaysAgo).length
  const ritualsCompleted = allBudgets.filter((b) => b.last_ritual_completed).length

  const conversionRate = pct(paid.length, paid.length + canceled.length)
  const mrr = mrrEstimate(monthlyPaid, annualPaid)

  const recentSignups = [...authUsers]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map((u) => ({ email: u.email ?? '', created_at: u.created_at }))

  return NextResponse.json({
    totalUsers,
    newThisWeek,
    newThisMonth,
    trialing: trialing.length,
    expiringThisWeek: expiringThisWeek.length,
    paid: paid.length,
    monthlyPaid,
    annualPaid,
    canceled: canceled.length,
    activeLastWeek,
    ritualsCompleted,
    conversionRate,
    mrr,
    recentSignups,
    emailHealth,
  })
}
