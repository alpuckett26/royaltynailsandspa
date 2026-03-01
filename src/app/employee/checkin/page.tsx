'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

type SessionEmployee = { id: string; name: string; role: string }

type CheckInEntry = {
  id: string
  customer_name: string
  service: string
  notes: string | null
  status: 'waiting' | 'served'
  created_at: string
  served_at: string | null
  served_by_name: string | null
}

type Tab = 'queue' | 'history'

const REFRESH_INTERVAL = 30_000

function todayDate() {
  return new Date().toISOString().split('T')[0]
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

function fmtDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

function waitTime(created: string, served: string | null): string {
  const end  = served ? new Date(served).getTime() : Date.now()
  const mins = Math.floor((end - new Date(created).getTime()) / 60_000)
  if (mins < 1) return '< 1 min'
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (mins < 1) return 'just now'
  if (mins === 1) return '1 min ago'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  return hrs === 1 ? '1 hr ago' : `${hrs} hrs ago`
}

// ── Queue tab ─────────────────────────────────────────────────────────────────
function QueueTab({ employee }: { employee: SessionEmployee }) {
  const [queue, setQueue]       = useState<CheckInEntry[]>([])
  const [loading, setLoading]   = useState(true)
  const [servingId, setServingId] = useState<string | null>(null)
  const [tick, setTick]         = useState(0)
  const intervalRef             = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchQueue = useCallback(async () => {
    try {
      const res  = await fetch('/api/checkin?status=waiting')
      const data = await res.json()
      setQueue(data.queue ?? [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchQueue()
    intervalRef.current = setInterval(fetchQueue, REFRESH_INTERVAL)
    const ticker = setInterval(() => setTick(n => n + 1), 30_000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      clearInterval(ticker)
    }
  }, [fetchQueue])

  void tick

  async function handleServed(id: string) {
    if (servingId) return
    setServingId(id)
    try {
      await fetch('/api/checkin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, employeeId: employee.id }),
      })
      setQueue(q => q.filter(e => e.id !== id))
    } catch { /* silent */ }
    finally { setServingId(null) }
  }

  if (loading) return (
    <div className="flex flex-col gap-3">
      {[1,2,3].map(i => <div key={i} className="h-20 bg-border/20 rounded-sm animate-pulse" />)}
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className={`inline-flex px-3 py-1 rounded-full border text-xs font-sans tracking-widest uppercase ${
          queue.length > 0 ? 'border-gold/40 text-gold bg-gold/5' : 'border-border text-offwhite/30'
        }`}>
          {queue.length === 0 ? 'No one waiting' : `${queue.length} waiting`}
        </span>
        <span className="text-[10px] text-offwhite/20 font-sans">Auto-refreshes every 30s</span>
        <button onClick={fetchQueue} className="text-[10px] tracking-widest uppercase text-offwhite/25 hover:text-offwhite/50 font-sans transition-colors duration-200 ml-auto">
          Refresh
        </button>
      </div>

      {queue.length === 0 ? (
        <div className="glass-card border border-border rounded-sm p-14 text-center">
          <p className="font-serif text-2xl text-offwhite/20 mb-2">All clear</p>
          <p className="text-offwhite/25 text-sm font-sans">No one waiting right now.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {queue.map((entry, idx) => (
              <motion.div key={entry.id} layout
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                className="glass-card border border-border rounded-sm px-6 py-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="shrink-0 w-8 h-8 rounded-full border border-border/60 flex items-center justify-center">
                    <span className="font-serif text-sm text-offwhite/40">{idx + 1}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-serif text-lg text-offwhite truncate">{entry.customer_name}</p>
                    <p className="text-xs font-sans text-gold/70 truncate">{entry.service}</p>
                    {entry.notes && (
                      <p className="text-[11px] font-sans text-offwhite/30 truncate mt-0.5">{entry.notes}</p>
                    )}
                    <p className="text-[10px] font-sans text-offwhite/25 mt-1 tracking-wide">
                      Checked in {timeAgo(entry.created_at)} · waiting {waitTime(entry.created_at, null)}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleServed(entry.id)} disabled={servingId === entry.id}
                  className="shrink-0 min-h-[44px] px-5 py-2 border border-gold/40 text-gold text-xs tracking-widest uppercase font-sans hover:bg-gold/10 active:scale-95 transition-all duration-150 rounded-sm disabled:opacity-40 disabled:cursor-not-allowed">
                  {servingId === entry.id ? '…' : 'Served ✓'}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

type Appointment = {
  id: string
  customer_name: string
  service: string
  appointment_time: string | null
  notes: string | null
  checked_in: boolean
}

function fmt12h(t: string | null) {
  if (!t) return '—'
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

// ── History tab ───────────────────────────────────────────────────────────────
function HistoryTab() {
  const [date, setDate]         = useState(todayDate())
  const [history, setHistory]   = useState<CheckInEntry[]>([])
  const [appts, setAppts]       = useState<Appointment[]>([])
  const [loading, setLoading]   = useState(true)

  const fetchAll = useCallback(async (d: string) => {
    setLoading(true)
    try {
      const [ciRes, apptRes] = await Promise.all([
        fetch(`/api/checkin?status=served&date=${d}`),
        fetch(`/api/appointments?date=${d}`),
      ])
      const ciData   = await ciRes.json()
      const apptData = await apptRes.json()
      setHistory(ciData.queue ?? [])
      setAppts(apptData.appointments ?? [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll(date) }, [date, fetchAll])

  // Stats
  const totalServed = history.length
  const waitMins = history
    .filter(e => e.served_at)
    .map(e => Math.floor((new Date(e.served_at!).getTime() - new Date(e.created_at).getTime()) / 60_000))
  const avgWait = waitMins.length
    ? Math.round(waitMins.reduce((a, b) => a + b, 0) / waitMins.length)
    : 0

  return (
    <div className="flex flex-col gap-6">

      {/* Date picker */}
      <div className="flex items-center gap-4 flex-wrap">
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="bg-charcoal border border-border rounded-sm px-3 py-2 text-offwhite text-sm font-sans focus:outline-none focus:border-gold/50 transition-colors duration-200"
        />
        {date !== todayDate() && (
          <button onClick={() => setDate(todayDate())}
            className="text-xs tracking-widest uppercase text-gold/50 hover:text-gold font-sans transition-colors duration-200">
            Today
          </button>
        )}
        <span className="text-offwhite/25 text-xs font-sans ml-auto">{fmtDate(date)}</span>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-16 bg-border/20 rounded-sm animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* ── Stats ── */}
          {totalServed > 0 && (
            <div className="grid grid-cols-3 gap-3">
              <div className="glass-card border border-border rounded-sm px-5 py-4">
                <p className="text-[10px] tracking-widest uppercase text-offwhite/30 font-sans mb-1">Served</p>
                <p className="font-serif text-3xl text-gold">{totalServed}</p>
              </div>
              <div className="glass-card border border-border rounded-sm px-5 py-4">
                <p className="text-[10px] tracking-widest uppercase text-offwhite/30 font-sans mb-1">Avg Wait</p>
                <p className="font-serif text-3xl text-gold">{avgWait}<span className="text-base text-gold/60"> min</span></p>
              </div>
              <div className="glass-card border border-border rounded-sm px-5 py-4">
                <p className="text-[10px] tracking-widest uppercase text-offwhite/30 font-sans mb-1">Appts</p>
                <p className="font-serif text-3xl text-gold">
                  {appts.filter(a => a.checked_in).length}
                  <span className="text-base text-gold/40">/{appts.length}</span>
                </p>
              </div>
            </div>
          )}

          {/* ── Walk-in check-ins ── */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] tracking-[0.25em] uppercase text-offwhite/30 font-sans">
              Walk-In Check-Ins — {history.length}
            </p>

            {history.length === 0 ? (
              <div className="glass-card border border-border/40 rounded-sm p-8 text-center">
                <p className="text-offwhite/20 font-sans text-sm">No walk-ins recorded.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-[1fr_1fr_68px_60px_1fr] gap-3 px-5 py-1.5">
                  {['Customer', 'Service', 'Arrived', 'Wait', 'Served By'].map(h => (
                    <p key={h} className="text-[10px] tracking-widest uppercase text-offwhite/20 font-sans">{h}</p>
                  ))}
                </div>
                {history.map((entry, idx) => (
                  <motion.div key={entry.id}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.025 }}
                    className="glass-card border border-border/50 rounded-sm px-5 py-3 grid grid-cols-[1fr_1fr_68px_60px_1fr] gap-3 items-center"
                  >
                    <div className="min-w-0">
                      <p className="font-serif text-sm text-offwhite truncate">{entry.customer_name}</p>
                      {entry.notes && <p className="text-[10px] font-sans text-offwhite/30 truncate">{entry.notes}</p>}
                    </div>
                    <p className="text-xs font-sans text-gold/60 truncate">{entry.service}</p>
                    <p className="text-xs font-sans text-offwhite/40">{fmtTime(entry.created_at)}</p>
                    <p className="text-xs font-sans text-offwhite/50">{waitTime(entry.created_at, entry.served_at)}</p>
                    <p className="text-xs font-sans text-offwhite/50 truncate">
                      {entry.served_by_name ?? <span className="text-offwhite/20 italic">Kiosk</span>}
                    </p>
                  </motion.div>
                ))}
              </>
            )}
          </div>

          {/* ── Appointment records ── */}
          <div className="flex flex-col gap-2 border-t border-border/30 pt-6">
            <div className="flex items-center gap-4">
              <p className="text-[10px] tracking-[0.25em] uppercase text-offwhite/30 font-sans">
                Appointment Records — {appts.length}
              </p>
              {appts.length > 0 && (
                <div className="flex gap-3 ml-auto">
                  <span className="text-[10px] font-sans text-gold/50">
                    ✓ {appts.filter(a => a.checked_in).length} showed
                  </span>
                  {appts.filter(a => !a.checked_in).length > 0 && (
                    <span className="text-[10px] font-sans text-red-400/60">
                      ✕ {appts.filter(a => !a.checked_in).length} no-show
                    </span>
                  )}
                </div>
              )}
            </div>

            {appts.length === 0 ? (
              <div className="glass-card border border-border/40 rounded-sm p-8 text-center">
                <p className="text-offwhite/20 font-sans text-sm">No appointments scheduled for this day.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-[64px_1fr_1fr_80px] gap-4 px-5 py-1.5">
                  {['Time', 'Customer', 'Service', 'Status'].map(h => (
                    <p key={h} className="text-[10px] tracking-widest uppercase text-offwhite/20 font-sans">{h}</p>
                  ))}
                </div>
                {appts.map((appt, idx) => {
                  const isPast    = date < todayDate()
                  const isNoShow  = isPast && !appt.checked_in
                  return (
                    <motion.div key={appt.id}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.025 }}
                      className={`glass-card border rounded-sm px-5 py-3 grid grid-cols-[64px_1fr_1fr_80px] gap-4 items-center ${
                        isNoShow        ? 'border-red-400/20 bg-red-400/5' :
                        appt.checked_in ? 'border-border/30 opacity-50'   :
                                          'border-border/50'
                      }`}
                    >
                      <p className="text-xs font-sans text-gold/50">{fmt12h(appt.appointment_time)}</p>
                      <div className="min-w-0">
                        <p className={`font-serif text-sm truncate ${appt.checked_in ? 'text-offwhite/40 line-through' : 'text-offwhite'}`}>
                          {appt.customer_name}
                        </p>
                        {appt.notes && <p className="text-[10px] font-sans text-offwhite/30 truncate">{appt.notes}</p>}
                      </div>
                      <p className="text-xs font-sans text-offwhite/40 truncate">{appt.service}</p>
                      <p className={`text-[10px] tracking-widest uppercase font-sans font-medium ${
                        isNoShow        ? 'text-red-400/70'  :
                        appt.checked_in ? 'text-gold/60'     :
                                          'text-offwhite/25'
                      }`}>
                        {isNoShow ? '✕ No-Show' : appt.checked_in ? '✓ Showed' : 'Upcoming'}
                      </p>
                    </motion.div>
                  )
                })}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CheckInQueuePage() {
  const router = useRouter()
  const [employee, setEmployee] = useState<SessionEmployee | null>(null)
  const [tab, setTab] = useState<Tab>('queue')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = sessionStorage.getItem('rns_employee')
    if (!stored) { router.replace('/employee'); return }
    setEmployee(JSON.parse(stored))
  }, [router])

  if (!employee) return null

  return (
    <div className="w-full max-w-2xl flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 font-sans mb-1">Staff Portal</p>
          <h1 className="font-serif text-3xl text-offwhite">Check-In</h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button onClick={() => router.push('/employee/appointments')}
            className="text-xs tracking-widest uppercase text-offwhite/30 hover:text-offwhite/60 font-sans transition-colors duration-200">
            Appointments →
          </button>
          <button onClick={() => router.push('/employee/dashboard')}
            className="text-xs tracking-widest uppercase text-offwhite/30 hover:text-offwhite/60 font-sans transition-colors duration-200">
            ← Dashboard
          </button>
          <button onClick={() => { sessionStorage.removeItem('rns_employee'); router.push('/employee') }}
            className="text-xs tracking-widest uppercase text-offwhite/20 hover:text-offwhite/40 font-sans transition-colors duration-200">
            Sign Out
          </button>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-border/40">
        {(['queue', 'history'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-xs tracking-widest uppercase font-sans transition-all duration-200 border-b-2 -mb-px ${
              tab === t
                ? 'border-gold text-gold'
                : 'border-transparent text-offwhite/35 hover:text-offwhite/60'
            }`}>
            {t === 'queue' ? 'Live Queue' : 'History'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'queue'
            ? <QueueTab employee={employee} />
            : <HistoryTab />
          }
        </motion.div>
      </AnimatePresence>

    </div>
  )
}
