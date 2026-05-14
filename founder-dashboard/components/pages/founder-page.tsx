'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FOUNDER_TASKS_EMAIL } from '@/lib/founder-tasks'
import { Loader2Icon } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

// ─── Types ────────────────────────────────────────────────────────────────────

type ItemType = 'task' | 'feedback' | 'content' | 'outreach' | 'config'
type TabKey = 'tasks' | 'metrics' | 'emails' | 'feedback' | 'content' | 'outreach' | 'changelog'
type TaskList = 'today' | 'week' | 'someday'

interface FounderItem {
  id: string
  type: ItemType
  data: unknown
  created_at: string
  updated_at: string
  user_id: string
}

interface TaskData {
  text: string
  list: TaskList
  category?: 'personal' | 'ritual'
  dueDate?: string
  focused?: boolean
  done?: boolean
  notes?: string
}

interface FeedbackData {
  text: string
  tag: 'bug' | 'confusion' | 'feature' | 'positive' | 'other'
  source: 'email' | 'social' | 'direct' | 'support' | 'other'
  status: 'new' | 'reviewed' | 'actioned'
  notes?: string
}

interface ContentData {
  hook: string
  format: 'talking-head' | 'text-overlay' | 'voiceover' | 'carousel'
  status: 'draft' | 'ready' | 'posted'
  platform: 'tiktok' | 'instagram'
  week?: string
  notes?: string
}

interface OutreachData {
  handle: string
  platform: 'email' | 'instagram' | 'tiktok' | 'twitter'
  status: 'not-yet' | 'asked' | 'responded' | 'received'
  dateAsked?: string
  response?: string
  notes?: string
}

interface ConfigData {
  lastDate?: string
}

interface EmailHealthItem {
  id: string
  name: string
  count: number
  lastSent: string | null
  lastEvent: string | null
}

interface MetricsProps {
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
  emailHealth: EmailHealthItem[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function formatDue(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((date.getTime() - today.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff < 0) return `${Math.abs(diff)}d overdue`
  if (diff <= 7) return `in ${diff}d`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isOverdue(dateStr: string): boolean {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

function taskCalendarUrl(text: string, dueDate: string): string {
  const d = dueDate.replace(/-/g, '')
  const next = new Date(dueDate + 'T00:00:00')
  next.setDate(next.getDate() + 1)
  const end = (next.toISOString().split('T')[0] ?? '').replace(/-/g, '')
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}&dates=${d}/${end}&add=${encodeURIComponent(FOUNDER_TASKS_EMAIL)}`
}

function buildIcs(id: string, text: string, dueDate: string): string {
  const dt = dueDate.replace(/-/g, '')
  const next = new Date(dueDate + 'T00:00:00')
  next.setDate(next.getDate() + 1)
  const dtEnd = (next.toISOString().split('T')[0] ?? '').replace(/-/g, '')
  const uid = `${id}-rr-founder@ritualrunway.com`
  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
  const summary = esc(text)
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Ritual Runway//Founder OS//EN', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT', `UID:${uid}`, `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${dt}`, `DTEND;VALUE=DATE:${dtEnd}`, `SUMMARY:${summary}`,
    'BEGIN:VALARM', 'TRIGGER:PT0S', 'ACTION:DISPLAY', `DESCRIPTION:${summary}`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
}

function downloadIcs(id: string, text: string, dueDate: string) {
  const ics = buildIcs(id, text, dueDate)
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `rr-task-${dueDate}-${id.slice(0, 8)}.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function StatCard({ label, value, accent, warn, small }: { label: string; value: string | number; accent?: boolean; warn?: boolean; small?: boolean }) {
  return (
    <div className="bg-card rounded-xl border border-border px-3 py-3">
      <p className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground mb-1.5">{label}</p>
      <p className={`font-light leading-none ${small ? 'text-xl' : 'text-2xl'}`} style={{ color: accent ? 'var(--primary)' : warn ? 'var(--warning-strong)' : 'var(--foreground)' }}>
        {value}
      </p>
    </div>
  )
}

const EVENT_COLORS: Record<string, string> = {
  delivered: 'var(--primary)', opened: 'var(--primary)', clicked: 'var(--primary)',
  bounced: 'var(--warning-strong)', complained: 'var(--warning-strong)',
}
const EVENT_LABELS: Record<string, string> = {
  delivered: 'Delivered', sent: 'Sent', opened: 'Opened',
  clicked: 'Clicked', bounced: 'Bounced', complained: 'Complained', delivery_delayed: 'Delayed',
}

// ─── Tasks Module ─────────────────────────────────────────────────────────────

const LIST_LABELS: Record<TaskList, string> = { today: 'Today', week: 'This Week', someday: 'Someday' }
const TASK_LISTS: TaskList[] = ['today', 'week', 'someday']
const TODAY_CAP = 5

function TasksModule({
  items,
  loading,
  addItem,
  updateItem,
  deleteItem,
  config,
  updateConfig,
}: {
  items: FounderItem[]
  loading: boolean
  addItem: (type: ItemType, data: unknown) => Promise<void>
  updateItem: (id: string, data: unknown) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  config: ConfigData
  updateConfig: (d: ConfigData) => Promise<void>
}) {
  const [taskCategory, setTaskCategory] = useState<'personal' | 'ritual'>('personal')
  const [taskSubTab, setTaskSubTab] = useState<TaskList>('today')
  const [showForm, setShowForm] = useState(false)
  const [newText, setNewText] = useState('')
  const [newDue, setNewDue] = useState('')
  const [showDueInput, setShowDueInput] = useState(false)
  const [openMove, setOpenMove] = useState<string | null>(null)
  const [editingDue, setEditingDue] = useState<string | null>(null)
  const [showRollover, setShowRollover] = useState(false)
  const [rolloverCount, setRolloverCount] = useState(0)
  const hasCheckedRollover = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // All task items filtered by current category (no category = personal)
  const taskItems = items.filter(i => {
    if (i.type !== 'task') return false
    const d = i.data as TaskData
    const cat = d.category ?? 'personal'
    return cat === taskCategory
  })

  useEffect(() => {
    if (loading || hasCheckedRollover.current) return
    hasCheckedRollover.current = true
    const today = todayStr()
    if (config.lastDate && config.lastDate !== today) {
      const uncompletedToday = taskItems.filter(i => {
        const d = i.data as TaskData
        return d.list === 'today' && !d.done
      })
      if (uncompletedToday.length > 0) {
        setShowRollover(true)
        setRolloverCount(uncompletedToday.length)
      }
    }
    updateConfig({ lastDate: today })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (openMove && !(e.target as HTMLElement).closest('[data-move-area]')) setOpenMove(null)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [openMove])

  const activeTasks = taskItems.filter(i => {
    const d = i.data as TaskData
    return d.list === taskSubTab && !d.done
  })
  const doneTasks = taskItems.filter(i => {
    const d = i.data as TaskData
    return d.list === taskSubTab && !!d.done
  })
  const sortedActive = [...activeTasks].sort((a, b) => {
    const da = a.data as TaskData, db = b.data as TaskData
    return (db.focused ? 1 : 0) - (da.focused ? 1 : 0)
  })
  const otherLists = TASK_LISTS.filter(l => l !== taskSubTab)
  const todayOverCap = taskSubTab === 'today' && activeTasks.length > TODAY_CAP

  async function addTask() {
    if (!newText.trim()) return
    await addItem('task', { text: newText.trim(), list: taskSubTab, category: taskCategory, dueDate: newDue || undefined, done: false, focused: false })
    setNewText('')
    setNewDue('')
    setShowDueInput(false)
    setShowForm(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  async function toggleDone(item: FounderItem) {
    const d = item.data as TaskData
    await updateItem(item.id, { ...d, done: !d.done })
  }

  async function setFocus(id: string) {
    const relevant = taskItems.filter(i => (i.data as TaskData).list === taskSubTab)
    await Promise.all(relevant.map(i => {
      const d = i.data as TaskData
      const focused = i.id === id ? !(d.focused) : false
      return updateItem(i.id, { ...d, focused })
    }))
  }

  async function moveTask(item: FounderItem, toList: TaskList) {
    const d = item.data as TaskData
    await updateItem(item.id, { ...d, list: toList, focused: false })
    setOpenMove(null)
  }

  async function updateDue(item: FounderItem, date: string) {
    const d = item.data as TaskData
    await updateItem(item.id, { ...d, dueDate: date || undefined })
    setEditingDue(null)
  }

  async function clearDone() {
    const done = taskItems.filter(i => {
      const d = i.data as TaskData
      return d.list === taskSubTab && !!d.done
    })
    await Promise.all(done.map(i => deleteItem(i.id)))
  }

  async function handleRolloverMove() {
    const uncompletedToday = taskItems.filter(i => {
      const d = i.data as TaskData
      return d.list === 'today' && !d.done
    })
    await Promise.all(uncompletedToday.map(i => {
      const d = i.data as TaskData
      return updateItem(i.id, { ...d, list: 'week', focused: false })
    }))
    setShowRollover(false)
  }

  const EMPTY_STATES: Record<TaskList, { title: string; sub: string }> = {
    today: { title: 'Clear for now', sub: 'Nothing on your list today.' },
    week: { title: 'Week is open', sub: 'Nothing planned yet this week.' },
    someday: { title: 'The horizon is clear', sub: 'Ideas and future tasks live here.' },
  }
  const empty = activeTasks.length === 0 && doneTasks.length === 0

  return (
    <div className="px-4 pt-4 pb-32">
      {/* Category toggle */}
      <div className="flex gap-2 mb-5">
        {(['personal', 'ritual'] as const).map(cat => {
          const active = taskCategory === cat
          return (
            <button
              key={cat}
              onClick={() => { setTaskCategory(cat); setOpenMove(null) }}
              className="font-mono text-[9px] tracking-widest uppercase px-3 py-1.5 rounded-full cursor-pointer border transition-colors"
              style={{
                background: active ? (cat === 'personal' ? 'var(--primary)' : 'var(--border)') : 'transparent',
                color: active ? 'var(--header-foreground)' : 'var(--muted-foreground)',
                borderColor: active ? (cat === 'personal' ? 'var(--primary)' : 'var(--primary)') : 'var(--border)',
              }}
            >
              {cat === 'personal' ? 'Personal' : 'Ritual'}
            </button>
          )
        })}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-5 mb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        {TASK_LISTS.map(list => {
          const count = taskItems.filter(i => { const d = i.data as TaskData; return d.list === list && !d.done }).length
          const active = taskSubTab === list
          return (
            <button key={list} onClick={() => { setTaskSubTab(list); setOpenMove(null) }}
              className="pb-2.5 font-mono text-[10px] tracking-widest uppercase transition-colors bg-transparent border-0 cursor-pointer"
              style={{ color: active ? 'var(--foreground)' : 'var(--muted-foreground)', borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -1 }}>
              {LIST_LABELS[list]}
              {count > 0 && (
                <span className="ml-1.5 font-mono text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'color-mix(in srgb, var(--primary) 20%, transparent)', color: 'var(--primary)' }}>{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Rollover banner */}
      {showRollover && taskSubTab === 'today' && (
        <div className="bg-card rounded-xl border border-border p-3 mb-4 flex items-start gap-3" style={{ borderLeftWidth: 2, borderLeftColor: 'var(--primary)' }}>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-1">Yesterday</p>
            <p className="text-[14px] font-light text-foreground">
              {rolloverCount} task{rolloverCount !== 1 ? 's' : ''} from yesterday. Move to This Week or keep in Today.
            </p>
          </div>
          <div className="flex gap-1.5 flex-shrink-0 mt-0.5">
            <button onClick={handleRolloverMove} className="font-mono text-[9px] tracking-widest uppercase px-2.5 py-1.5 rounded border border-border text-muted-foreground bg-background cursor-pointer">Move</button>
            <button onClick={() => setShowRollover(false)} className="font-mono text-[9px] tracking-widest uppercase px-2.5 py-1.5 rounded border-0 cursor-pointer" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>Keep</button>
          </div>
        </div>
      )}

      {/* Add form */}
      <div className="bg-card rounded-xl border border-border p-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border border-border flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addTask() }}
            placeholder="Add a task..."
            className="flex-1 bg-transparent text-[15px] font-light text-foreground placeholder:text-muted-foreground/40 outline-none border-0"
          />
          <button onClick={() => setShowDueInput(v => !v)}
            className="font-mono text-[9px] tracking-wider uppercase px-2 py-1 rounded border transition-colors bg-transparent cursor-pointer"
            style={{ color: showDueInput || newDue ? 'var(--primary)' : 'var(--muted-foreground)', borderColor: showDueInput || newDue ? 'var(--primary)' : 'var(--border)' }}>
            {newDue ? formatDue(newDue) : 'Due'}
          </button>
          <button onClick={addTask} disabled={!newText.trim()}
            className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center transition-opacity disabled:opacity-30 border-0 cursor-pointer"
            style={{ background: 'var(--primary)' }} aria-label="Add task">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><line x1="6" y1="1" x2="6" y2="11" /><line x1="1" y1="6" x2="11" y2="6" /></svg>
          </button>
        </div>
        {showDueInput && (
          <div className="mt-2 pt-2 border-t border-border">
            <input type="date" value={newDue} onChange={e => setNewDue(e.target.value)} className="font-mono text-[11px] bg-transparent text-muted-foreground outline-none border-0" />
          </div>
        )}
      </div>

      {/* Today cap nudge */}
      {todayOverCap && (
        <div className="flex items-center gap-2 px-1 mb-3">
          <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--warning-strong)' }} />
          <p className="font-mono text-[10px] tracking-wide text-muted-foreground">{activeTasks.length} active tasks. 3 to 5 is the sweet spot. Move some to This Week.</p>
        </div>
      )}

      {/* Empty state */}
      {empty && (
        <div className="text-center py-16">
          <p className="font-serif italic text-2xl text-foreground mb-1">{EMPTY_STATES[taskSubTab].title}</p>
          <p className="text-sm text-muted-foreground font-light">{EMPTY_STATES[taskSubTab].sub}</p>
        </div>
      )}

      {/* Active tasks */}
      <div className="space-y-2" data-move-area>
        {sortedActive.map(item => {
          const d = item.data as TaskData
          const over = d.dueDate ? isOverdue(d.dueDate) : false
          return (
            <div key={item.id}
              className={`relative bg-card rounded-xl border px-3 py-3 transition-opacity ${d.done ? 'opacity-40' : ''}`}
              style={{ borderColor: d.focused && !d.done ? 'var(--primary)' : 'var(--border)' }}>
              <div className="flex items-start gap-3">
                <button onClick={() => toggleDone(item)}
                  className="mt-0.5 w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center"
                  style={{ background: d.done ? 'var(--primary)' : 'transparent', borderColor: d.done ? 'var(--primary)' : 'var(--border)' }}>
                  {d.done && <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1,4.5 3.5,7 8,1.5" /></svg>}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-[15px] font-light leading-snug ${d.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{d.text}</p>
                  {d.dueDate && !d.done && (
                    <div className="flex items-center gap-2 mt-1">
                      <button onClick={() => setEditingDue(editingDue === item.id ? null : item.id)}
                        className="font-mono text-[10px] tracking-wide bg-transparent border-0 p-0 cursor-pointer"
                        style={{ color: over ? 'var(--warning-strong)' : 'var(--primary)' }}>
                        {formatDue(d.dueDate)}
                      </button>
                      <a href={taskCalendarUrl(d.text, d.dueDate)} target="_blank" rel="noopener noreferrer"
                        className="font-mono text-[9px] tracking-widest uppercase" style={{ color: 'var(--muted-foreground)', textDecoration: 'none' }}>
                        + cal
                      </a>
                      <button onClick={() => d.dueDate && downloadIcs(item.id, d.text, d.dueDate)}
                        className="font-mono text-[9px] tracking-widest uppercase bg-transparent border-0 p-0 cursor-pointer"
                        style={{ color: 'var(--muted-foreground)' }} title="Download .ics for iPhone Calendar">
                        iPhone
                      </button>
                    </div>
                  )}
                  {editingDue === item.id && (
                    <input type="date" defaultValue={d.dueDate ?? ''}
                      onChange={e => updateDue(item, e.target.value)}
                      className="mt-1.5 block font-mono text-[11px] bg-transparent text-muted-foreground outline-none border-0" autoFocus />
                  )}
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => setFocus(item.id)} className="w-6 h-6 rounded border border-border flex items-center justify-center bg-background cursor-pointer" aria-label="Focus">
                    <svg width="11" height="11" viewBox="0 0 12 12" fill={d.focused && !d.done ? 'var(--primary)' : 'none'} stroke={d.focused && !d.done ? 'var(--primary)' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" style={{ color: 'var(--muted-foreground)' }}>
                      <circle cx="6" cy="6" r="4" /><circle cx="6" cy="6" r="1.5" />
                    </svg>
                  </button>
                  <button onClick={() => setEditingDue(editingDue === item.id ? null : item.id)} className="w-6 h-6 rounded border border-border flex items-center justify-center text-muted-foreground bg-background cursor-pointer" aria-label="Due date">
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="2" width="10" height="9" rx="1.5" /><line x1="4" y1="1" x2="4" y2="3" /><line x1="8" y1="1" x2="8" y2="3" /><line x1="1" y1="5" x2="11" y2="5" /></svg>
                  </button>
                  <button onClick={() => setOpenMove(openMove === item.id ? null : item.id)} className="w-6 h-6 rounded border border-border flex items-center justify-center font-mono text-[11px] text-muted-foreground bg-background cursor-pointer" aria-label="Move">→</button>
                  <button onClick={() => deleteItem(item.id)} className="w-6 h-6 rounded border border-border flex items-center justify-center font-mono text-[11px] text-muted-foreground bg-background cursor-pointer" aria-label="Delete">✕</button>
                </div>
              </div>
              {openMove === item.id && (
                <div className="absolute right-3 top-11 bg-card border border-border rounded-lg overflow-hidden z-20" style={{ minWidth: 130, boxShadow: '0 4px 16px rgba(42,42,46,0.08)' }}>
                  {otherLists.map(list => (
                    <button key={list} onClick={() => moveTask(item, list)}
                      className="w-full text-left font-mono text-[10px] tracking-widest uppercase px-3.5 py-2.5 border-b border-border last:border-b-0 hover:bg-background transition-colors text-foreground bg-transparent cursor-pointer">
                      {LIST_LABELS[list]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Done tasks */}
      {doneTasks.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">Completed</span>
            <button onClick={clearDone} className="font-mono text-[10px] tracking-wider uppercase bg-transparent border-0 cursor-pointer" style={{ color: 'var(--primary)' }}>Clear all</button>
          </div>
          <div className="space-y-2">
            {doneTasks.map(item => {
              const d = item.data as TaskData
              return (
                <div key={item.id} className="relative bg-card rounded-xl border border-border px-3 py-3 opacity-40">
                  <div className="flex items-start gap-3">
                    <button onClick={() => toggleDone(item)} className="mt-0.5 w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center" style={{ background: 'var(--primary)', borderColor: 'var(--primary)' }}>
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1,4.5 3.5,7 8,1.5" /></svg>
                    </button>
                    <p className="flex-1 text-[15px] font-light leading-snug line-through text-muted-foreground">{d.text}</p>
                    <button onClick={() => deleteItem(item.id)} className="w-6 h-6 rounded border border-border flex items-center justify-center font-mono text-[11px] text-muted-foreground bg-background cursor-pointer">✕</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Metrics Module ───────────────────────────────────────────────────────────

function MetricsModule(props: MetricsProps) {
  const {
    totalUsers,
    newThisWeek,
    newThisMonth,
    trialing,
    expiringThisWeek,
    paid,
    monthlyPaid,
    annualPaid,
    canceled,
    activeLastWeek,
    ritualsCompleted,
    conversionRate,
    mrr,
    recentSignups,
  } = props
  return (
    <div className="px-4 pt-5 pb-20 space-y-6">
      <div>
        <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-3 px-1">Signups</p>
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Total" value={totalUsers} />
          <StatCard label="This month" value={newThisMonth} />
          <StatCard label="This week" value={newThisWeek} accent={newThisWeek > 0} />
        </div>
      </div>
      <div>
        <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-3 px-1">Trials</p>
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="Active trials" value={trialing} />
          <StatCard label="Expiring this week" value={expiringThisWeek} warn={expiringThisWeek > 0} />
        </div>
      </div>
      <div>
        <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-3 px-1">Revenue</p>
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="Paid subscribers" value={paid} accent={paid > 0} />
          <StatCard label="Est. MRR" value={mrr} accent={paid > 0} />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <StatCard label="Monthly plan" value={monthlyPaid} small />
          <StatCard label="Annual plan" value={annualPaid} small />
          <StatCard label="Canceled" value={canceled} small />
        </div>
      </div>
      <div>
        <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-3 px-1">Engagement</p>
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Active last 7d" value={activeLastWeek} />
          <StatCard label="Ritual completers" value={ritualsCompleted} />
          <StatCard label="Conversion rate" value={conversionRate} />
        </div>
      </div>
      {recentSignups.length > 0 && (
        <div>
          <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-3 px-1">Recent signups</p>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {recentSignups.map((u, i) => (
              <div key={u.email + u.created_at} className={`flex items-center justify-between px-4 py-3 ${i < recentSignups.length - 1 ? 'border-b border-border' : ''}`}>
                <p className="text-[13px] font-light text-foreground truncate flex-1 mr-4">{u.email}</p>
                <p className="font-mono text-[10px] text-muted-foreground flex-shrink-0">
                  {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Email Health shared list ─────────────────────────────────────────────────

function EmailHealthList({ emailHealth }: { emailHealth: EmailHealthItem[] }) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-3 px-1">Email health</p>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {emailHealth.map((email, i) => {
          const fired = email.count > 0
          return (
            <div key={email.id} className={`flex items-center justify-between px-4 py-3 ${i < emailHealth.length - 1 ? 'border-b border-border' : ''}`}>
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: fired ? 'var(--primary)' : 'var(--border)' }} />
                <p className="text-[13px] font-light text-foreground truncate">{email.name}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                {fired ? (
                  <>
                    <p className="font-mono text-[11px] text-muted-foreground">{email.count}x</p>
                    {email.lastEvent && (
                      <p className="font-mono text-[9px] tracking-widest uppercase" style={{ color: EVENT_COLORS[email.lastEvent] ?? 'var(--muted-foreground)' }}>
                        {EVENT_LABELS[email.lastEvent] ?? email.lastEvent}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground">Not fired</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Emails Module ────────────────────────────────────────────────────────────

function EmailsModule({ emailHealth }: { emailHealth: EmailHealthItem[] }) {
  return (
    <div className="px-4 pt-5 pb-20">
      <EmailHealthList emailHealth={emailHealth} />
    </div>
  )
}

// ─── Feedback Module ──────────────────────────────────────────────────────────

const FEEDBACK_TAG_COLORS: Record<string, string> = {
  bug: 'var(--warning-strong)', confusion: 'var(--status-amber)', feature: 'var(--status-info)', positive: 'var(--primary)', other: 'var(--muted-foreground)',
}
const FEEDBACK_TAG_LABELS: Record<string, string> = {
  bug: 'Bug', confusion: 'Confusion', feature: 'Feature', positive: 'Positive', other: 'Other',
}

function FeedbackModule({ items, addItem, updateItem, deleteItem }: {
  items: FounderItem[]
  addItem: (type: ItemType, data: unknown) => Promise<void>
  updateItem: (id: string, data: unknown) => Promise<void>
  deleteItem: (id: string) => Promise<void>
}) {
  const [filterTag, setFilterTag] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [newText, setNewText] = useState('')
  const [newTag, setNewTag] = useState<FeedbackData['tag']>('other')
  const [newSource, setNewSource] = useState<FeedbackData['source']>('direct')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const feedback = items.filter(i => i.type === 'feedback')
  const tags = Array.from(new Set(feedback.map(i => (i.data as FeedbackData).tag)))
  const filtered = filterTag === 'all' ? feedback : feedback.filter(i => (i.data as FeedbackData).tag === filterTag)
  const newCount = feedback.filter(i => (i.data as FeedbackData).status === 'new').length
  const progress = Math.min(feedback.length / 10, 1)

  async function addFeedback() {
    if (!newText.trim()) return
    await addItem('feedback', { text: newText.trim(), tag: newTag, source: newSource, status: 'new' })
    setNewText('')
    setShowForm(false)
  }

  async function updateStatus(item: FounderItem, status: FeedbackData['status']) {
    const d = item.data as FeedbackData
    await updateItem(item.id, { ...d, status })
  }

  async function updateNotes(item: FounderItem, notes: string) {
    const d = item.data as FeedbackData
    await updateItem(item.id, { ...d, notes })
  }

  return (
    <div className="px-4 pt-4 pb-32">
      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">{feedback.length} / 10 to unlock User Researcher role.</p>
          <p className="font-mono text-[10px] text-muted-foreground">{Math.round(progress * 100)}%</p>
        </div>
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${progress * 100}%`, background: 'var(--primary)' }} />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-4 mb-4 overflow-x-auto" style={{ borderBottom: '1px solid var(--border)' }}>
        {['all', ...tags].map(tag => (
          <button key={tag} onClick={() => setFilterTag(tag)}
            className="pb-2.5 flex-shrink-0 font-mono text-[10px] tracking-widest uppercase transition-colors bg-transparent border-0 cursor-pointer"
            style={{ color: filterTag === tag ? 'var(--foreground)' : 'var(--muted-foreground)', borderBottom: filterTag === tag ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -1 }}>
            {tag === 'all' ? 'All' : FEEDBACK_TAG_LABELS[tag] ?? tag}
          </button>
        ))}
      </div>

      {/* Add button / form */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)}
          className="w-full bg-card border border-border rounded-xl px-4 py-3 text-left font-light text-[14px] text-muted-foreground/60 mb-4 cursor-pointer">
          Log feedback...
        </button>
      ) : (
        <div className="bg-card border border-border rounded-xl p-4 mb-4 space-y-3">
          <textarea value={newText} onChange={e => setNewText(e.target.value)} placeholder="What did they say?"
            className="w-full bg-transparent text-[14px] font-light text-foreground placeholder:text-muted-foreground/40 outline-none border-0 resize-none" rows={3} autoFocus />
          <div className="flex gap-2 flex-wrap">
            {(['bug', 'confusion', 'feature', 'positive', 'other'] as FeedbackData['tag'][]).map(t => (
              <button key={t} onClick={() => setNewTag(t)}
                className="font-mono text-[9px] tracking-widest uppercase px-2.5 py-1.5 rounded border cursor-pointer transition-colors"
                style={{ background: newTag === t ? FEEDBACK_TAG_COLORS[t] : 'transparent', color: newTag === t ? 'var(--primary-foreground)' : FEEDBACK_TAG_COLORS[t], borderColor: FEEDBACK_TAG_COLORS[t] }}>
                {FEEDBACK_TAG_LABELS[t]}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['email', 'social', 'direct', 'support', 'other'] as FeedbackData['source'][]).map(s => (
              <button key={s} onClick={() => setNewSource(s)}
                className="font-mono text-[9px] tracking-widest uppercase px-2.5 py-1.5 rounded border cursor-pointer transition-colors"
                style={{ background: newSource === s ? 'var(--primary)' : 'transparent', color: newSource === s ? 'var(--primary-foreground)' : 'var(--muted-foreground)', borderColor: newSource === s ? 'var(--primary)' : 'var(--border)' }}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="font-mono text-[9px] tracking-widest uppercase px-3 py-2 rounded border border-border text-muted-foreground bg-transparent cursor-pointer">Cancel</button>
            <button onClick={addFeedback} disabled={!newText.trim()} className="font-mono text-[9px] tracking-widest uppercase px-3 py-2 rounded cursor-pointer disabled:opacity-40" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>Save</button>
          </div>
        </div>
      )}

      {feedback.length === 0 && (
        <div className="text-center py-16">
          <p className="font-serif italic text-2xl text-foreground mb-1">Nothing logged yet</p>
          <p className="text-sm text-muted-foreground font-light">Log 10 entries to unlock the User Researcher role.</p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(item => {
          const d = item.data as FeedbackData
          const expanded = expandedId === item.id
          return (
            <div key={item.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <button onClick={() => setExpandedId(expanded ? null : item.id)} className="w-full text-left px-4 py-3 cursor-pointer bg-transparent border-0">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-light text-foreground line-clamp-2">{d.text}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded" style={{ background: `${FEEDBACK_TAG_COLORS[d.tag]}20`, color: FEEDBACK_TAG_COLORS[d.tag] }}>{FEEDBACK_TAG_LABELS[d.tag]}</span>
                      {d.status !== 'new' && <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground">{d.status}</span>}
                      <span className="font-mono text-[9px] text-muted-foreground ml-auto">{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </button>
              {expanded && (
                <div className="px-4 pb-4 pt-1 border-t border-border space-y-3">
                  <p className="text-[14px] font-light text-foreground">{d.text}</p>
                  <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">Source: {d.source}</p>
                  <div>
                    <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-2">Status</p>
                    <div className="flex gap-2">
                      {(['new', 'reviewed', 'actioned'] as FeedbackData['status'][]).map(s => (
                        <button key={s} onClick={() => updateStatus(item, s)}
                          className="font-mono text-[9px] tracking-widest uppercase px-2.5 py-1.5 rounded border cursor-pointer"
                          style={{ background: d.status === s ? 'var(--primary)' : 'transparent', color: d.status === s ? 'var(--primary-foreground)' : 'var(--muted-foreground)', borderColor: d.status === s ? 'var(--primary)' : 'var(--border)' }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea defaultValue={d.notes ?? ''} placeholder="Notes..." onBlur={e => updateNotes(item, e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-[13px] font-light text-foreground placeholder:text-muted-foreground/40 outline-none resize-none" rows={2} />
                  <button onClick={() => deleteItem(item.id)} className="font-mono text-[9px] tracking-widest uppercase px-3 py-2 rounded cursor-pointer border-0" style={{ background: 'color-mix(in srgb, var(--warning-strong) 12%, transparent)', color: 'var(--warning-strong)' }}>Delete</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Content Module ───────────────────────────────────────────────────────────

const FORMAT_LABELS: Record<ContentData['format'], string> = {
  'talking-head': 'Talking Head', 'text-overlay': 'Text Overlay', voiceover: 'Voiceover', carousel: 'Carousel',
}
const STATUS_NEXT: Record<ContentData['status'], ContentData['status']> = {
  draft: 'ready', ready: 'posted', posted: 'draft',
}
const STATUS_COLORS: Record<ContentData['status'], string> = {
  draft: 'var(--muted-foreground)', ready: 'var(--status-amber)', posted: 'var(--positive)',
}

function ContentModule({ items, addItem, updateItem, deleteItem }: {
  items: FounderItem[]
  addItem: (type: ItemType, data: unknown) => Promise<void>
  updateItem: (id: string, data: unknown) => Promise<void>
  deleteItem: (id: string) => Promise<void>
}) {
  const [filterStatus, setFilterStatus] = useState<'all' | ContentData['status']>('all')
  const [showForm, setShowForm] = useState(false)
  const [hook, setHook] = useState('')
  const [format, setFormat] = useState<ContentData['format']>('talking-head')
  const [platform, setPlatform] = useState<ContentData['platform']>('tiktok')
  const [week, setWeek] = useState('')
  const [notes, setNotes] = useState('')

  const content = items.filter(i => i.type === 'content')
  const filtered = filterStatus === 'all' ? content : content.filter(i => (i.data as ContentData).status === filterStatus)

  async function addContent() {
    if (!hook.trim()) return
    await addItem('content', { hook: hook.trim(), format, status: 'draft', platform, week: week || undefined, notes: notes || undefined })
    setHook(''); setNotes(''); setWeek(''); setShowForm(false)
  }

  async function cycleStatus(item: FounderItem) {
    const d = item.data as ContentData
    await updateItem(item.id, { ...d, status: STATUS_NEXT[d.status] })
  }

  return (
    <div className="px-4 pt-4 pb-32">
      <div className="flex gap-4 mb-4 overflow-x-auto" style={{ borderBottom: '1px solid var(--border)' }}>
        {(['all', 'draft', 'ready', 'posted'] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className="pb-2.5 flex-shrink-0 font-mono text-[10px] tracking-widest uppercase transition-colors bg-transparent border-0 cursor-pointer"
            style={{ color: filterStatus === s ? 'var(--foreground)' : 'var(--muted-foreground)', borderBottom: filterStatus === s ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -1 }}>
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-left font-light text-[14px] text-muted-foreground/60 mb-4 cursor-pointer">Add a hook...</button>
      ) : (
        <div className="bg-card border border-border rounded-xl p-4 mb-4 space-y-3">
          <input value={hook} onChange={e => setHook(e.target.value)} placeholder="Opening line / hook" autoFocus
            className="w-full bg-transparent text-[14px] font-light text-foreground placeholder:text-muted-foreground/40 outline-none border-0" />
          <div className="flex gap-2 flex-wrap">
            {(['talking-head', 'text-overlay', 'voiceover', 'carousel'] as ContentData['format'][]).map(f => (
              <button key={f} onClick={() => setFormat(f)}
                className="font-mono text-[9px] tracking-widest uppercase px-2.5 py-1.5 rounded border cursor-pointer"
                style={{ background: format === f ? 'var(--primary)' : 'transparent', color: format === f ? 'var(--primary-foreground)' : 'var(--muted-foreground)', borderColor: format === f ? 'var(--primary)' : 'var(--border)' }}>
                {FORMAT_LABELS[f]}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(['tiktok', 'instagram'] as ContentData['platform'][]).map(p => (
              <button key={p} onClick={() => setPlatform(p)}
                className="font-mono text-[9px] tracking-widest uppercase px-2.5 py-1.5 rounded border cursor-pointer"
                style={{ background: platform === p ? 'var(--primary)' : 'transparent', color: platform === p ? 'var(--primary-foreground)' : 'var(--muted-foreground)', borderColor: platform === p ? 'var(--primary)' : 'var(--border)' }}>
                {p}
              </button>
            ))}
          </div>
          <input type="date" value={week} onChange={e => setWeek(e.target.value)} placeholder="Week"
            className="font-mono text-[11px] bg-transparent text-muted-foreground outline-none border-0" />
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)"
            className="w-full bg-transparent text-[13px] font-light text-foreground placeholder:text-muted-foreground/40 outline-none border-0 resize-none" rows={2} />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="font-mono text-[9px] tracking-widest uppercase px-3 py-2 rounded border border-border text-muted-foreground bg-transparent cursor-pointer">Cancel</button>
            <button onClick={addContent} disabled={!hook.trim()} className="font-mono text-[9px] tracking-widest uppercase px-3 py-2 rounded cursor-pointer disabled:opacity-40" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>Save</button>
          </div>
        </div>
      )}

      {content.length === 0 && (
        <div className="text-center py-16">
          <p className="font-serif italic text-2xl text-foreground mb-1">Queue is empty</p>
          <p className="text-sm text-muted-foreground font-light">Add your first hook.</p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(item => {
          const d = item.data as ContentData
          return (
            <div key={item.id} className="bg-card border border-border rounded-xl px-4 py-3">
              <p className="text-[14px] font-light text-foreground line-clamp-2 mb-2">{d.hook}</p>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className="font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded" style={{ background: `${STATUS_COLORS[d.status]}20`, color: STATUS_COLORS[d.status] }}>{d.status}</span>
                <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground">{FORMAT_LABELS[d.format]}</span>
                <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground">{d.platform}</span>
                {d.week && <span className="font-mono text-[9px] text-muted-foreground">{d.week}</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => cycleStatus(item)} className="font-mono text-[9px] tracking-widest uppercase px-2.5 py-1.5 rounded border border-border text-muted-foreground bg-transparent cursor-pointer">
                  → {STATUS_NEXT[d.status]}
                </button>
                <button onClick={() => deleteItem(item.id)} className="font-mono text-[9px] tracking-widest uppercase px-2.5 py-1.5 rounded cursor-pointer border-0 ml-auto" style={{ background: 'color-mix(in srgb, var(--warning-strong) 12%, transparent)', color: 'var(--warning-strong)' }}>Delete</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Outreach Module ──────────────────────────────────────────────────────────

const OUTREACH_STATUS_COLORS: Record<OutreachData['status'], string> = {
  'not-yet': 'var(--muted-foreground)', asked: 'var(--status-amber)', responded: 'var(--status-info)', received: 'var(--positive)',
}
const OUTREACH_STATUS_LABELS: Record<OutreachData['status'], string> = {
  'not-yet': 'Not Yet', asked: 'Asked', responded: 'Responded', received: 'Received',
}

const TEMPLATES = [
  {
    label: 'EMAIL: Existing User',
    subject: 'Quick question about Ritual Runway',
    body: `Hi [first name],

I noticed you have been using Ritual Runway for a few weeks and I wanted to reach out personally.

I am the founder and I am still in the early stages of building this. If the app has been useful for you, I would love to hear how. Even one sentence about what changed for you would mean a lot right now.

No pressure at all. Just genuinely curious what is working.

Lindsey
Ritual Runway`,
  },
  {
    label: 'EMAIL: Follow-up',
    subject: 'Re: Quick question about Ritual Runway',
    body: `Hi [first name],

Just circling back in case my last email got buried. If you have a minute to share how Ritual Runway has been working for you, I would really appreciate it.

Either way, I hope it has been useful.

Lindsey`,
  },
  {
    label: 'INSTAGRAM / TIKTOK DM: Engaged Follower',
    body: `Hey [handle], thank you for the [comment/save/share]. I am the founder of Ritual Runway and I build it alone, so that kind of response genuinely means something.

If you have tried the app and it has helped, would you be open to sharing a sentence or two about your experience? I am collecting early feedback and it would really help.

No worries if not. Either way, appreciate you.`,
  },
  {
    label: 'INSTAGRAM / TIKTOK DM: Cold Outreach',
    body: `Hey [handle], I saw your post about [specific thing]. I built an app called Ritual Runway specifically for that problem. It assigns every bill to the paycheck that covers it so you always know your runway.

There is a 45-day free trial, no credit card needed. If you try it and it helps, I would love to hear about it. If it does not, I would genuinely want to know why.

ritualrunway.com`,
  },
]

function OutreachModule({ items, addItem, updateItem, deleteItem }: {
  items: FounderItem[]
  addItem: (type: ItemType, data: unknown) => Promise<void>
  updateItem: (id: string, data: unknown) => Promise<void>
  deleteItem: (id: string) => Promise<void>
}) {
  const [innerTab, setInnerTab] = useState<'tracker' | 'templates'>('tracker')
  const [showForm, setShowForm] = useState(false)
  const [handle, setHandle] = useState('')
  const [platform, setPlatform] = useState<OutreachData['platform']>('instagram')
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const outreach = items.filter(i => i.type === 'outreach')

  async function addOutreach() {
    if (!handle.trim()) return
    await addItem('outreach', { handle: handle.trim(), platform, status: 'not-yet' })
    setHandle(''); setShowForm(false)
  }

  async function updateStatus(item: FounderItem, status: OutreachData['status']) {
    const d = item.data as OutreachData
    const update: Partial<OutreachData> = { ...d, status }
    if (status === 'asked' && !d.dateAsked) update.dateAsked = todayStr()
    await updateItem(item.id, update as Record<string, unknown>)
  }

  async function updateResponse(item: FounderItem, response: string) {
    const d = item.data as OutreachData
    await updateItem(item.id, { ...d, response })
  }

  async function updateNotes(item: FounderItem, notes: string) {
    const d = item.data as OutreachData
    await updateItem(item.id, { ...d, notes })
  }

  function copyTemplate(idx: number, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 2000)
    })
  }

  return (
    <div className="px-4 pt-4 pb-32">
      {/* Inner tab pills */}
      <div className="flex gap-2 mb-5">
        {(['tracker', 'templates'] as const).map(t => (
          <button key={t} onClick={() => setInnerTab(t)}
            className="font-mono text-[9px] tracking-widest uppercase px-3 py-2 rounded border cursor-pointer transition-colors"
            style={{ background: innerTab === t ? 'var(--primary)' : 'transparent', color: innerTab === t ? 'var(--primary-foreground)' : 'var(--muted-foreground)', borderColor: innerTab === t ? 'var(--primary)' : 'var(--border)' }}>
            {t}
          </button>
        ))}
      </div>

      {innerTab === 'tracker' && (
        <>
          {!showForm ? (
            <button onClick={() => setShowForm(true)} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-left font-light text-[14px] text-muted-foreground/60 mb-4 cursor-pointer">Add someone to reach out to...</button>
          ) : (
            <div className="bg-card border border-border rounded-xl p-4 mb-4 space-y-3">
              <input value={handle} onChange={e => setHandle(e.target.value)} placeholder="Handle or name" autoFocus
                className="w-full bg-transparent text-[14px] font-light text-foreground placeholder:text-muted-foreground/40 outline-none border-0" />
              <div className="flex gap-2 flex-wrap">
                {(['email', 'instagram', 'tiktok', 'twitter'] as OutreachData['platform'][]).map(p => (
                  <button key={p} onClick={() => setPlatform(p)}
                    className="font-mono text-[9px] tracking-widest uppercase px-2.5 py-1.5 rounded border cursor-pointer"
                    style={{ background: platform === p ? 'var(--primary)' : 'transparent', color: platform === p ? 'var(--primary-foreground)' : 'var(--muted-foreground)', borderColor: platform === p ? 'var(--primary)' : 'var(--border)' }}>
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowForm(false)} className="font-mono text-[9px] tracking-widest uppercase px-3 py-2 rounded border border-border text-muted-foreground bg-transparent cursor-pointer">Cancel</button>
                <button onClick={addOutreach} disabled={!handle.trim()} className="font-mono text-[9px] tracking-widest uppercase px-3 py-2 rounded cursor-pointer disabled:opacity-40" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>Save</button>
              </div>
            </div>
          )}

          {outreach.length === 0 && (
            <div className="text-center py-16">
              <p className="font-serif italic text-2xl text-foreground mb-1">No contacts yet</p>
              <p className="text-sm text-muted-foreground font-light">Add someone to reach out to.</p>
            </div>
          )}

          <div className="space-y-3">
            {outreach.map(item => {
              const d = item.data as OutreachData
              return (
                <div key={item.id} className="bg-card border border-border rounded-xl px-4 py-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-light text-foreground flex-1">{d.handle}</p>
                    <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground">{d.platform}</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {(['not-yet', 'asked', 'responded', 'received'] as OutreachData['status'][]).map(s => (
                      <button key={s} onClick={() => updateStatus(item, s)}
                        className="font-mono text-[9px] tracking-widest uppercase px-2.5 py-1.5 rounded border cursor-pointer transition-colors"
                        style={{ background: d.status === s ? OUTREACH_STATUS_COLORS[s] : 'transparent', color: d.status === s ? 'var(--primary-foreground)' : OUTREACH_STATUS_COLORS[s], borderColor: OUTREACH_STATUS_COLORS[s] }}>
                        {OUTREACH_STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                  {d.dateAsked && <p className="font-mono text-[10px] text-muted-foreground">Asked {d.dateAsked}</p>}
                  {(d.status === 'responded' || d.status === 'received') && (
                    <textarea defaultValue={d.response ?? ''} placeholder="Their response..." onBlur={e => updateResponse(item, e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-[13px] font-light text-foreground placeholder:text-muted-foreground/40 outline-none resize-none" rows={2} />
                  )}
                  <textarea defaultValue={d.notes ?? ''} placeholder="Notes..." onBlur={e => updateNotes(item, e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-[13px] font-light text-foreground placeholder:text-muted-foreground/40 outline-none resize-none" rows={1} />
                  <button onClick={() => deleteItem(item.id)} className="font-mono text-[9px] tracking-widest uppercase px-3 py-1.5 rounded cursor-pointer border-0" style={{ background: 'color-mix(in srgb, var(--warning-strong) 12%, transparent)', color: 'var(--warning-strong)' }}>Delete</button>
                </div>
              )
            })}
          </div>
        </>
      )}

      {innerTab === 'templates' && (
        <div className="space-y-4">
          {TEMPLATES.map((t, i) => {
            const text = t.subject ? `Subject: ${t.subject}\n\n${t.body}` : t.body
            return (
              <div key={i} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">{t.label}</p>
                  <button onClick={() => copyTemplate(i, text)}
                    className="font-mono text-[9px] tracking-widest uppercase px-2.5 py-1.5 rounded border cursor-pointer transition-colors"
                    style={{ background: copiedIdx === i ? 'var(--primary)' : 'transparent', color: copiedIdx === i ? 'var(--primary-foreground)' : 'var(--muted-foreground)', borderColor: copiedIdx === i ? 'var(--primary)' : 'var(--border)' }}>
                    {copiedIdx === i ? 'Copied' : 'Copy'}
                  </button>
                </div>
                {t.subject && <p className="font-mono text-[10px] text-muted-foreground mb-2">Subject: {t.subject}</p>}
                <p className="text-[13px] font-light text-foreground whitespace-pre-line leading-relaxed">{t.body}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Changelog Module ─────────────────────────────────────────────────────────

const RELEASED_VERSIONS: { version: string; date: string; changes: string[] }[] = [
  {
    version: 'v1.4.0',
    date: 'May 2025',
    changes: [
      'Fixed Tailwind v4 dark mode CSS variable divergence across three selector blocks',
      'Widened @custom-variant dark selector to cover html element and all descendants',
      'Completed data-theme="dark" and data-theme="light" variable blocks to prevent stale value inheritance',
      'Resolved text-card visibility bug on bg-header surfaces in dark mode',
    ],
  },
  {
    version: 'v1.3.0',
    date: 'May 2025',
    changes: [
      'Added /demo route with isolated DemoShell, sticky non-dismissible banner, and pre-populated sample data',
      'Added onboarding tour with three-step highlight sequence and all dismiss paths writing completion flag',
      'Added "See it live. No sign-up." pill linking to /demo on landing page',
      'Added homescreen installation instruction to trust signal cluster',
      'Fixed authenticated shell bleeding through landing page hero section',
      'Resolved word cycling animations in hero and Phases sections using custom hook',
    ],
  },
  {
    version: 'v1.2.0',
    date: 'May 2025',
    changes: [
      'Comprehensive typography audit: IBM Plex Mono applied to all data row values, Cormorant Garamond italic preserved on summary card totals',
      'Global edit affordance system: underline-only on fill, primary mauve on hover and focus, Tab, Enter, and Escape keyboard support',
      'Active nav item color updated to primary mauve across all seven tabs',
      'Right Now / Next Chapter toggle fixed to plain non-editable button',
      'Tools secondary nav ungated: all four tabs visible regardless of module state',
      'Phases page pencil icon inline edit added',
      'Step 6 renamed to "Mark this period complete"',
      'Learn page Investing accordion populated with four complete explanations',
      'Founder page email metrics double render fixed, Personal/Ritual task toggle pills added',
    ],
  },
  {
    version: 'v1.1.0',
    date: 'April 2025',
    changes: [
      'Dark mode color system overhaul: cool near-black backgrounds, sage runway accent',
      'Landing page: LOG IN outlined pill, mobile-responsive nav, THE SYSTEM/THE FIT/Phases section card borders',
      'App mockup carousel converted to dark mode with correct surface hierarchy',
      'Dashboard helper texts added to ACCOUNTS and UPCOMING BILLS cards',
      'Bills page: full-width stacked PAYCHECK cards, ordinal suffix fix, date labels use primary',
      'Income page: Per Paycheck toggle with monthly equivalent display',
      'Accounts page: Savings Goals section with target icon header',
      'Authentication dark mode: elevated input surfaces and muted placeholder text',
      'Settings: INTERNAL section gated to owner email, Choose a Plan button, date format localized',
    ],
  },
  {
    version: 'v1.0.0',
    date: 'Initial Release',
    changes: [
      'Paycheck-based budgeting with PAYCHECK 1 / PAYCHECK 2 bill assignment',
      'Variable income support with Low / Average / High scenario planning',
      'Ritual system with six-step pay period workflow',
      'Accounts page with manual balance entry and net worth tracking',
      'Learn module with financial education content',
      'Phases module with Right Now and Next Chapter planning',
      'Stripe subscription integration with 45-day free trial',
      'Supabase auth and data persistence',
    ],
  },
]

const COMING_SOON_ITEMS: { title: string; desc: string }[] = [
  { title: 'Bi-monthly bill frequency', desc: 'Support for bills that recur every two months' },
  { title: 'Weekly bill breakdown', desc: 'Auto-generate paycheck-assignable instances for weekly recurring bills' },
  { title: 'Calendar view', desc: 'Visual monthly calendar showing bills and income by date' },
  { title: 'Accounts discoverability', desc: 'Improved empty state with visible add prompts on first visit' },
  { title: 'Savings Goals live toggle', desc: 'Module enables and scrolls into view without requiring page reload' },
]

function ChangelogModule() {
  return (
    <div className="px-4 pt-5 pb-20 space-y-8">
      <div>
        <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-4 px-1">Released</p>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {RELEASED_VERSIONS.map((v, i) => (
            <div key={v.version} className={i < RELEASED_VERSIONS.length - 1 ? 'border-b border-border' : ''}>
              <div className="px-4 pt-4 pb-3">
                <div className="flex items-baseline gap-3 mb-2.5">
                  <span className="font-mono text-[13px]" style={{ color: 'var(--foreground)' }}>{v.version}</span>
                  <span style={{ fontFamily: 'var(--font-jost, Jost, sans-serif)', fontWeight: 300, fontSize: 11, color: 'var(--muted-foreground)' }}>{v.date}</span>
                </div>
                <ul className="space-y-1.5">
                  {v.changes.map((c, ci) => (
                    <li key={ci} className="flex items-start gap-2.5">
                      <span className="mt-[7px] w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--border)' }} />
                      <span style={{ fontFamily: 'var(--font-jost, Jost, sans-serif)', fontWeight: 300, fontSize: 12, color: 'var(--header-foreground)', lineHeight: 1.55 }}>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-4 px-1">Coming Soon</p>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {COMING_SOON_ITEMS.map((item, i) => (
            <div key={item.title} className={`px-4 py-3 ${i < COMING_SOON_ITEMS.length - 1 ? 'border-b border-border' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="mt-[7px] w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--primary)' }} />
                <div>
                  <p style={{ fontFamily: 'var(--font-jost, Jost, sans-serif)', fontWeight: 300, fontSize: 13, color: 'var(--header-foreground)', lineHeight: 1.4 }}>{item.title}</p>
                  <p style={{ fontFamily: 'var(--font-jost, Jost, sans-serif)', fontWeight: 300, fontSize: 11, color: 'var(--muted-foreground)', marginTop: 2 }}>{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main FounderPage ─────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string }[] = [
  { key: 'tasks', label: 'Tasks' },
  { key: 'metrics', label: 'Metrics' },
  { key: 'emails', label: 'Emails' },
  { key: 'feedback', label: 'Feedback' },
  { key: 'content', label: 'Content' },
  { key: 'outreach', label: 'Outreach' },
  { key: 'changelog', label: 'Changelog' },
]

export default function FounderPage(props: MetricsProps) {
  const [supabase] = useState(() => createClient())
  const [tab, setTab] = useState<TabKey>('tasks')
  const [items, setItems] = useState<FounderItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('founder_data').select('*')
      .order('created_at', { ascending: false })
      .then(({ data }: { data: FounderItem[] | null }) => {
        setItems(data ?? [])
        setLoading(false)
      })
  }, [supabase])

  const addItem = useCallback(async (type: ItemType, data: unknown): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const now = new Date().toISOString()
    const { data: inserted, error } = await supabase
      .from('founder_data')
      .insert({ type, data, user_id: user.id, created_at: now, updated_at: now })
      .select()
      .single()
    if (!error && inserted) setItems(prev => [inserted as FounderItem, ...prev])
  }, [supabase])

  const updateItem = useCallback(async (id: string, data: unknown): Promise<void> => {
    const now = new Date().toISOString()
    const { error } = await supabase.from('founder_data').update({ data, updated_at: now }).eq('id', id)
    if (!error) setItems(prev => prev.map(i => i.id === id ? { ...i, data, updated_at: now } : i))
  }, [supabase])

  const deleteItem = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase.from('founder_data').delete().eq('id', id)
    if (!error) setItems(prev => prev.filter(i => i.id !== id))
  }, [supabase])

  const configItem = items.find(i => i.type === 'config')
  const config = (configItem?.data ?? {}) as ConfigData

  const updateConfig = useCallback(async (data: ConfigData): Promise<void> => {
    if (configItem) {
      await updateItem(configItem.id, data)
    } else {
      await addItem('config', data)
    }
  }, [configItem, updateItem, addItem])

  const newFeedbackCount = items.filter(i => i.type === 'feedback' && (i.data as FeedbackData).status === 'new').length

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        @keyframes checkPop { 0%{transform:scale(1)} 40%{transform:scale(1.3)} 100%{transform:scale(1)} }
        .task-check-btn:active { animation: checkPop 0.18s ease-out; }
      `}</style>

      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-header">
        <div className="px-5 pt-10 pb-3 flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] tracking-widest uppercase mb-1 text-primary">Founder</p>
            <h1 className="font-serif italic text-3xl font-normal leading-none text-header-foreground">OS</h1>
          </div>
          <ThemeToggle className="shrink-0 mt-1 text-header-foreground/70 hover:text-header-foreground" />
        </div>
        {/* Tab bar */}
        <div className="flex px-5 gap-5 overflow-x-auto" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {TABS.map(({ key, label }) => {
            const active = tab === key
            const badge = key === 'feedback' && newFeedbackCount > 0
            return (
              <button key={key} onClick={() => setTab(key)}
                className="relative pb-3 flex-shrink-0 font-mono text-[10px] tracking-widest uppercase transition-colors bg-transparent border-0 cursor-pointer"
                style={{ color: active ? 'var(--header-foreground)' : 'color-mix(in srgb, var(--header-foreground) 35%, transparent)', borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -1 }}>
                {label}
                {badge && (
                  <span className="ml-1.5 font-mono text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'color-mix(in srgb, var(--primary) 20%, transparent)', color: 'var(--primary)' }}>{newFeedbackCount}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2Icon className="w-8 h-8 mx-auto mb-4 text-primary animate-spin" />
            <p className="text-muted-foreground font-light">Loading...</p>
          </div>
        </div>
      )}

      {/* Modules */}
      {!loading && tab === 'tasks' && (
        <TasksModule items={items} loading={loading} addItem={addItem} updateItem={updateItem} deleteItem={deleteItem} config={config} updateConfig={updateConfig} />
      )}
      {!loading && tab === 'metrics' && <MetricsModule {...props} />}
      {!loading && tab === 'emails' && <EmailsModule emailHealth={props.emailHealth} />}
      {!loading && tab === 'feedback' && (
        <FeedbackModule items={items} addItem={addItem} updateItem={updateItem} deleteItem={deleteItem} />
      )}
      {!loading && tab === 'content' && (
        <ContentModule items={items} addItem={addItem} updateItem={updateItem} deleteItem={deleteItem} />
      )}
      {!loading && tab === 'outreach' && (
        <OutreachModule items={items} addItem={addItem} updateItem={updateItem} deleteItem={deleteItem} />
      )}
      {!loading && tab === 'changelog' && <ChangelogModule />}
    </div>
  )
}
