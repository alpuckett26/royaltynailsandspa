'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { HoursTable } from '@/components/employee/HoursTable'

type Admin = { id: string; name: string; role: string }
type Entry = { id: string; clock_in: string; clock_out: string | null }
type Summary = {
  employeeId: string
  name: string
  role: string
  totalMinutes: number
  entries: Entry[]
}
type Range = 'week' | 'month' | 'all'

function formatHours(minutes: number) {
  const h = Math.floor(minutes / 60); const m = minutes % 60
  return `${h}h ${m}m`
}

function getWeeklyBreakdown(entries: Entry[]): Array<{ label: string; minutes: number }> {
  const weekMap = new Map<string, number>()
  for (const entry of entries) {
    if (!entry.clock_out) continue
    const d = new Date(entry.clock_in)
    const sun = new Date(d); sun.setDate(d.getDate() - d.getDay())
    const sat = new Date(sun); sat.setDate(sun.getDate() + 6)
    const label = `${sun.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${sat.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    const ms = new Date(entry.clock_out).getTime() - new Date(entry.clock_in).getTime()
    weekMap.set(label, (weekMap.get(label) ?? 0) + Math.round(ms / 60000))
  }
  return Array.from(weekMap.entries())
    .map(([label, minutes]) => ({ label, minutes }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

function getRangeDates(range: Range): { from: string; to: string } {
  const now = new Date()
  if (range === 'week') {
    const day = now.getDay()
    const from = new Date(now); from.setDate(now.getDate() - day); from.setHours(0, 0, 0, 0)
    const to = new Date(from); to.setDate(from.getDate() + 6); to.setHours(23, 59, 59, 999)
    return { from: from.toISOString(), to: to.toISOString() }
  }
  if (range === 'month') {
    return { from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(), to: now.toISOString() }
  }
  const from = new Date(now); from.setFullYear(from.getFullYear() - 1)
  return { from: from.toISOString(), to: now.toISOString() }
}

export default function AdminStaffPage() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<Range>('week')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [deactivating, setDeactivating] = useState<string | null>(null)
  const [clockingOut, setClockingOut] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPin, setNewPin] = useState('')
  const [newRole, setNewRole] = useState<'staff' | 'admin'>('staff')
  const [formLoading, setFormLoading] = useState(false)
  const [formMsg, setFormMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = sessionStorage.getItem('rns_employee')
    if (stored) setAdmin(JSON.parse(stored))
  }, [])

  const fetchHours = useCallback(async (r: Range) => {
    setLoading(true)
    try {
      const { from, to } = getRangeDates(r)
      const res = await fetch(`/api/employee/hours?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
      const data = await res.json()
      setSummaries(data.summaries ?? [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { if (admin) fetchHours(range) }, [admin, range, fetchHours])

  const handleDeactivate = async (employeeId: string) => {
    if (!admin || deactivating) return
    setDeactivating(employeeId)
    try {
      const res = await fetch('/api/employee/deactivate', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: admin.id, employeeId }),
      })
      if (res.ok) {
        setSummaries(s => s.filter(x => x.employeeId !== employeeId))
        if (expanded === employeeId) setExpanded(null)
      }
    } catch { /* silent */ }
    finally { setDeactivating(null) }
  }

  const handleClockOut = async (employeeId: string) => {
    if (!admin || clockingOut) return
    setClockingOut(employeeId)
    try {
      await fetch('/api/employee/clock-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId }),
      })
      fetchHours(range)
    } catch { /* silent */ }
    finally { setClockingOut(null) }
  }

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!admin || !newName.trim() || !/^\d{4}$/.test(newPin)) {
      setFormMsg({ type: 'err', text: 'Name and a 4-digit PIN are required.' })
      return
    }
    setFormLoading(true); setFormMsg(null)
    try {
      const res = await fetch('/api/employee/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: admin.id, name: newName.trim(), pin: newPin, role: newRole }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setFormMsg({ type: 'ok', text: `${data.employee.name} added successfully.` })
      setNewName(''); setNewPin(''); setNewRole('staff')
      fetchHours(range)
    } catch (err: unknown) {
      setFormMsg({ type: 'err', text: err instanceof Error ? err.message : 'Failed to create employee.' })
    } finally { setFormLoading(false) }
  }

  const ic = 'w-full bg-charcoal border border-border rounded-sm px-4 py-3 text-offwhite text-sm font-sans placeholder:text-offwhite/25 focus:outline-none focus:border-gold/50 transition-colors duration-200'

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 font-sans mb-1">Admin Panel</p>
        <h1 className="font-serif text-3xl text-offwhite">Staff & Hours</h1>
      </div>

      {/* Range selector */}
      <div className="flex gap-2">
        {(['week', 'month', 'all'] as Range[]).map(r => (
          <button key={r} onClick={() => setRange(r)}
            className={`px-4 py-2 text-xs tracking-widest uppercase font-sans border transition-all duration-200 rounded-sm ${
              range === r ? 'border-gold/50 text-gold bg-gold/5' : 'border-border text-offwhite/40 hover:text-offwhite hover:border-border/80'
            }`}>
            {r === 'week' ? 'This Week' : r === 'month' ? 'This Month' : 'Past Year'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-border/20 rounded-sm animate-pulse" />)}
        </div>
      ) : summaries.length === 0 ? (
        <div className="glass-card border border-border rounded-sm p-10 text-center">
          <p className="text-offwhite/30 text-sm font-sans">No time entries for this period.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {summaries.map(s => (
            <motion.div key={s.employeeId} layout className="flex flex-col">
              <button onClick={() => setExpanded(expanded === s.employeeId ? null : s.employeeId)}
                className="w-full glass-card border border-border hover:border-gold/25 rounded-sm px-6 py-4 flex items-center justify-between group transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full border border-border/60 flex items-center justify-center">
                    <span className="font-serif text-sm text-offwhite/50">{s.name.charAt(0)}</span>
                  </div>
                  <div className="text-left">
                    <p className="font-serif text-base text-offwhite group-hover:text-gold transition-colors duration-200">{s.name}</p>
                    <p className="text-[9px] tracking-widest uppercase text-offwhite/30 font-sans">
                      {s.role} · {s.entries.length} entr{s.entries.length === 1 ? 'y' : 'ies'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-serif text-xl text-gold">{formatHours(s.totalMinutes)}</p>
                  </div>
                  {s.entries.some(e => e.clock_out === null) && (
                    <button
                      onClick={ev => { ev.stopPropagation(); handleClockOut(s.employeeId) }}
                      disabled={clockingOut === s.employeeId}
                      className="px-3 py-1.5 border border-gold/30 text-gold/60 text-[10px] tracking-widest uppercase font-sans hover:text-gold hover:border-gold/60 rounded-sm transition-all duration-150 disabled:opacity-30"
                    >
                      {clockingOut === s.employeeId ? '…' : 'Clock Out'}
                    </button>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); handleDeactivate(s.employeeId) }}
                    disabled={deactivating === s.employeeId}
                    className="px-3 py-1.5 border border-red-400/20 text-red-400/50 text-[10px] tracking-widest uppercase font-sans hover:text-red-400 hover:border-red-400/40 rounded-sm transition-all duration-150 disabled:opacity-30"
                  >
                    {deactivating === s.employeeId ? '…' : 'Deactivate'}
                  </button>
                  <span className="text-offwhite/20 group-hover:text-offwhite/40 transition-colors duration-200 text-xs">
                    {expanded === s.employeeId ? '▲' : '▼'}
                  </span>
                </div>
              </button>

              {expanded === s.employeeId && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} className="mt-2 flex flex-col gap-2">
                  {range !== 'week' && (() => {
                    const weeks = getWeeklyBreakdown(s.entries)
                    if (weeks.length <= 1) return null
                    return (
                      <div className="glass-card border border-border/50 rounded-sm px-5 py-4">
                        <p className="text-[10px] tracking-widest uppercase text-gold/40 font-sans mb-3">Week-by-Week</p>
                        <div className="flex flex-col gap-1.5">
                          {weeks.map(w => (
                            <div key={w.label} className="flex items-center justify-between">
                              <span className="text-xs font-sans text-offwhite/50">{w.label}</span>
                              <span className="font-serif text-sm text-gold">{formatHours(w.minutes)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                  <HoursTable entries={s.entries} totalMinutes={s.totalMinutes} title={`${s.name}'s Entries`} />
                </motion.div>
              )}
            </motion.div>
          ))}

          <div className="flex justify-between items-center px-6 py-3 border-t border-gold/15 mt-2">
            <span className="text-xs tracking-widest uppercase text-offwhite/30 font-sans">Grand Total</span>
            <span className="font-serif text-2xl text-gold">
              {formatHours(summaries.reduce((a, s) => a + s.totalMinutes, 0))}
            </span>
          </div>
        </div>
      )}

      {/* Add Employee */}
      <div className="border-t border-border/40 pt-8">
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-3 text-sm font-sans text-offwhite/40 hover:text-offwhite/70 transition-colors duration-200">
          <span className="text-gold/50 text-lg leading-none">{showForm ? '−' : '+'}</span>
          <span className="tracking-widest uppercase text-xs">Add New Employee</span>
        </button>

        {showForm && (
          <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            onSubmit={handleCreateEmployee}
            className="mt-6 glass-card border border-border rounded-sm p-8 flex flex-col gap-5">
            <h3 className="font-serif text-lg text-offwhite">New Employee</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">Full Name *</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="Employee name" required className={ic} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">4-Digit PIN *</label>
                <input type="text" inputMode="numeric" maxLength={4} value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="e.g. 1234" required className={ic} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">Role</label>
              <select value={newRole} onChange={e => setNewRole(e.target.value as 'staff' | 'admin')}
                className={`${ic} appearance-none cursor-pointer`}>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {formMsg && (
              <p className={`text-xs font-sans ${formMsg.type === 'ok' ? 'text-gold' : 'text-red-400'}`}>{formMsg.text}</p>
            )}
            <div className="flex gap-3">
              <button type="submit" disabled={formLoading}
                className="px-6 py-3 bg-gold text-charcoal text-xs tracking-widest uppercase font-sans hover:bg-gold-light transition-colors duration-200 disabled:opacity-50">
                {formLoading ? 'Creating…' : 'Create Employee'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setFormMsg(null) }}
                className="px-6 py-3 border border-border text-offwhite/40 text-xs tracking-widest uppercase font-sans hover:text-offwhite transition-colors duration-200">
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </div>
    </div>
  )
}
