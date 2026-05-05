'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'

type Entry = { id: string; clock_in: string; clock_out: string | null }
type EmployeeInfo = { name: string; role: string }

type PayWeek = {
  label: string       // "May 4 – May 10, 2026"
  sunISO: string      // for sort
  totalMinutes: number
  entries: Entry[]
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function fmtClockOut(clockIn: string, clockOut: string): string {
  if (new Date(clockIn).toDateString() !== new Date(clockOut).toDateString()) {
    return `${fmtDate(clockOut)}, ${fmtTime(clockOut)}`
  }
  return fmtTime(clockOut)
}

function fmtDuration(clockIn: string, clockOut: string | null): string {
  if (!clockOut) return '—'
  const ms = new Date(clockOut).getTime() - new Date(clockIn).getTime()
  const mins = Math.round(ms / 60000)
  const h = Math.floor(mins / 60); const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function fmtHours(minutes: number) {
  const h = Math.floor(minutes / 60); const m = minutes % 60
  return `${h}h ${m}m`
}

function groupByPayWeek(entries: Entry[]): PayWeek[] {
  const map = new Map<string, PayWeek>()

  for (const entry of entries) {
    const d = new Date(entry.clock_in)
    const sun = new Date(d); sun.setDate(d.getDate() - d.getDay()); sun.setHours(0, 0, 0, 0)
    const sat = new Date(sun); sat.setDate(sun.getDate() + 6)
    const sunISO = sun.toISOString()
    const fmtShort = (dt: Date) => dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const label = `${fmtShort(sun)} – ${fmtShort(sat)}, ${sat.getFullYear()}`

    if (!map.has(sunISO)) {
      map.set(sunISO, { label, sunISO, totalMinutes: 0, entries: [] })
    }

    const week = map.get(sunISO)!
    week.entries.push(entry)
    if (entry.clock_out) {
      const ms = new Date(entry.clock_out).getTime() - new Date(entry.clock_in).getTime()
      week.totalMinutes += Math.round(ms / 60000)
    }
  }

  return Array.from(map.values()).sort((a, b) => b.sunISO.localeCompare(a.sunISO))
}

export default function EmployeeHistoryPage() {
  const router = useRouter()
  const params = useParams()
  const employeeId = params.id as string

  const [info, setInfo] = useState<EmployeeInfo | null>(null)
  const [payWeeks, setPayWeeks] = useState<PayWeek[]>([])
  const [totalMinutes, setTotalMinutes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch 5 years of history
      const from = new Date(); from.setFullYear(from.getFullYear() - 5)
      const to = new Date()
      const res = await fetch(
        `/api/employee/hours?employeeId=${employeeId}&from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`
      )
      const data = await res.json()
      const summaries = data.summaries ?? []
      if (summaries.length === 0) { setLoading(false); return }

      const emp = summaries[0]
      setInfo({ name: emp.name, role: emp.role })

      const entries: Entry[] = emp.entries
      const weeks = groupByPayWeek(entries)
      setPayWeeks(weeks)
      setTotalMinutes(weeks.reduce((a, w) => a + w.totalMinutes, 0))

      if (weeks.length > 0) setExpanded(weeks[0].sunISO)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [employeeId])

  useEffect(() => { fetchAll() }, [fetchAll])

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/admin/staff')}
          className="text-[10px] tracking-widest uppercase text-offwhite/30 hover:text-offwhite/60 font-sans transition-colors duration-200 mb-4 flex items-center gap-2"
        >
          ← Staff & Hours
        </button>
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 font-sans mb-1">Employee History</p>
        {info ? (
          <div className="flex items-baseline gap-3">
            <h1 className="font-serif text-3xl text-offwhite">{info.name}</h1>
            <span className="text-xs tracking-widest uppercase text-offwhite/30 font-sans">{info.role}</span>
          </div>
        ) : (
          <div className="h-9 w-48 bg-border/20 rounded-sm animate-pulse" />
        )}
      </div>

      {/* Grand total */}
      {!loading && info && (
        <div className="glass-card border border-gold/20 rounded-sm px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[9px] tracking-widest uppercase text-offwhite/30 font-sans">All-Time Total</p>
            <p className="font-serif text-3xl text-gold mt-1">{fmtHours(totalMinutes)}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] tracking-widest uppercase text-offwhite/30 font-sans">Pay Weeks</p>
            <p className="font-serif text-2xl text-offwhite/60 mt-1">{payWeeks.length}</p>
          </div>
        </div>
      )}

      {/* Pay weeks */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-16 bg-border/20 rounded-sm animate-pulse" />)}
        </div>
      ) : payWeeks.length === 0 ? (
        <div className="glass-card border border-border rounded-sm p-10 text-center">
          <p className="text-offwhite/30 text-sm font-sans">No time entries found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {payWeeks.map(week => (
            <motion.div key={week.sunISO} layout className="flex flex-col">
              <button
                onClick={() => setExpanded(expanded === week.sunISO ? null : week.sunISO)}
                className="w-full glass-card border border-border hover:border-gold/25 rounded-sm px-6 py-4 flex items-center justify-between group transition-all duration-200"
              >
                <div className="text-left">
                  <p className="font-serif text-base text-offwhite group-hover:text-gold transition-colors duration-200">
                    {week.label}
                  </p>
                  <p className="text-[9px] tracking-widest uppercase text-offwhite/30 font-sans mt-0.5">
                    {week.entries.length} entr{week.entries.length === 1 ? 'y' : 'ies'}
                    {week.entries.some(e => !e.clock_out) && (
                      <span className="ml-2 text-gold/50">· Active</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-serif text-xl text-gold">{fmtHours(week.totalMinutes)}</p>
                  <span className="text-offwhite/20 group-hover:text-offwhite/40 transition-colors duration-200 text-xs">
                    {expanded === week.sunISO ? '▲' : '▼'}
                  </span>
                </div>
              </button>

              {expanded === week.sunISO && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2"
                >
                  <div className="glass-card border border-border/50 rounded-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[480px]">
                        <thead>
                          <tr className="border-b border-border/40">
                            {['Date', 'Clock In', 'Clock Out', 'Duration'].map(h => (
                              <th key={h} className="px-6 py-3 text-left text-[9px] tracking-[0.22em] uppercase text-offwhite/30 font-sans font-normal">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {week.entries.map((entry, i) => (
                            <tr key={entry.id}
                              className={`border-b border-border/20 last:border-0 hover:bg-offwhite/[0.02] transition-colors duration-150 ${
                                !entry.clock_out ? 'bg-gold/[0.03]' : ''
                              }`}
                            >
                              <td className="px-6 py-3.5 text-sm text-offwhite/60 font-sans">
                                {fmtDate(entry.clock_in)}
                              </td>
                              <td className="px-6 py-3.5 text-sm text-offwhite/70 font-sans tabular-nums">
                                {fmtTime(entry.clock_in)}
                              </td>
                              <td className="px-6 py-3.5 text-sm font-sans tabular-nums">
                                {entry.clock_out ? (
                                  <span className="text-offwhite/70">{fmtClockOut(entry.clock_in, entry.clock_out)}</span>
                                ) : (
                                  <span className="text-gold/60 text-xs tracking-widest uppercase">Active</span>
                                )}
                              </td>
                              <td className="px-6 py-3.5 text-sm text-gold font-sans">
                                {fmtDuration(entry.clock_in, entry.clock_out)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-gold/15">
                            <td colSpan={3} className="px-6 py-3 text-[9px] tracking-widest uppercase text-offwhite/30 font-sans">
                              Week Total
                            </td>
                            <td className="px-6 py-3 font-serif text-base text-gold">
                              {fmtHours(week.totalMinutes)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
