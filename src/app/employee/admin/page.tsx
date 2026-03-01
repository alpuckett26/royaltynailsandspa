'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { HoursTable } from '@/components/employee/HoursTable'

type SessionEmployee = { id: string; name: string; role: string }
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
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m}m`
}

function getRangeDates(range: Range): { from: string; to: string } {
  const now = new Date()

  if (range === 'week') {
    const day = now.getDay() // 0=Sun, 1=Mon … 6=Sat
    const diffToMon = day === 0 ? -6 : 1 - day
    const from = new Date(now)
    from.setDate(now.getDate() + diffToMon)
    from.setHours(0, 0, 0, 0)
    const to = new Date(from)
    to.setDate(from.getDate() + 6) // Sunday
    to.setHours(23, 59, 59, 999)
    return { from: from.toISOString(), to: to.toISOString() }
  }

  if (range === 'month') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1)
    return { from: from.toISOString(), to: now.toISOString() }
  }

  // all: past 365 days
  const from = new Date(now)
  from.setFullYear(from.getFullYear() - 1)
  return { from: from.toISOString(), to: now.toISOString() }
}

export default function AdminPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<SessionEmployee | null>(null)
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<Range>('week')
  const [expanded, setExpanded] = useState<string | null>(null)

  // New employee form
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPin, setNewPin] = useState('')
  const [newRole, setNewRole] = useState<'staff' | 'admin'>('staff')
  const [formLoading, setFormLoading] = useState(false)
  const [formMsg, setFormMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Auth check
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = sessionStorage.getItem('rns_employee')
    if (!stored) { router.replace('/employee'); return }
    const emp: SessionEmployee = JSON.parse(stored)
    if (emp.role !== 'admin') { router.replace('/employee/dashboard'); return }
    setAdmin(emp)
  }, [router])

  const fetchHours = useCallback(async (r: Range) => {
    setLoading(true)
    try {
      const { from, to } = getRangeDates(r)
      const res = await fetch(`/api/employee/hours?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
      const data = await res.json()
      setSummaries(data.summaries ?? [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (admin) fetchHours(range)
  }, [admin, range, fetchHours])

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!admin || !newName.trim() || !/^\d{4}$/.test(newPin)) {
      setFormMsg({ type: 'err', text: 'Name and a 4-digit PIN are required.' })
      return
    }
    setFormLoading(true)
    setFormMsg(null)
    try {
      const res = await fetch('/api/employee/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: admin.id, name: newName.trim(), pin: newPin, role: newRole }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setFormMsg({ type: 'ok', text: `${data.employee.name} added successfully.` })
      setNewName('')
      setNewPin('')
      setNewRole('staff')
      fetchHours(range)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create employee.'
      setFormMsg({ type: 'err', text: message })
    } finally {
      setFormLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('rns_employee')
    router.push('/employee')
  }

  if (!admin) return null

  const inputClass =
    'w-full bg-charcoal border border-border rounded-sm px-4 py-3 text-offwhite text-sm font-sans placeholder:text-offwhite/25 focus:outline-none focus:border-gold/50 transition-colors duration-200'

  return (
    <div className="w-full max-w-3xl flex flex-col gap-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 font-sans mb-1">
            Admin Portal
          </p>
          <h1 className="font-serif text-3xl text-offwhite">Hours Overview</h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => router.push('/employee/appointments')}
            className="text-xs tracking-widest uppercase text-offwhite/30 hover:text-offwhite/60 font-sans transition-colors duration-200"
          >
            Appointments →
          </button>
          <button
            onClick={() => router.push('/employee/checkin')}
            className="text-xs tracking-widest uppercase text-offwhite/30 hover:text-offwhite/60 font-sans transition-colors duration-200"
          >
            Check-In Queue →
          </button>
          <button
            onClick={() => router.push('/employee/schedule')}
            className="text-xs tracking-widest uppercase text-offwhite/30 hover:text-offwhite/60 font-sans transition-colors duration-200"
          >
            Schedule →
          </button>
          <button
            onClick={() => router.push('/employee/dashboard')}
            className="text-xs tracking-widest uppercase text-offwhite/30 hover:text-offwhite/60 font-sans transition-colors duration-200"
          >
            My Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="text-xs tracking-widest uppercase text-offwhite/20 hover:text-offwhite/40 font-sans transition-colors duration-200"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Range selector */}
      <div className="flex gap-2">
        {(['week', 'month', 'all'] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-4 py-2 text-xs tracking-widest uppercase font-sans border transition-all duration-200 rounded-sm ${
              range === r
                ? 'border-gold/50 text-gold bg-gold/5'
                : 'border-border text-offwhite/40 hover:text-offwhite hover:border-border/80'
            }`}
          >
            {r === 'week' ? 'This Week' : r === 'month' ? 'This Month' : 'Past Year'}
          </button>
        ))}
      </div>

      {/* Summaries */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-border/20 rounded-sm animate-pulse" />
          ))}
        </div>
      ) : summaries.length === 0 ? (
        <div className="glass-card border border-border rounded-sm p-10 text-center">
          <p className="text-offwhite/30 text-sm font-sans">No time entries for this period.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {summaries.map((s) => (
            <motion.div key={s.employeeId} layout className="flex flex-col">
              {/* Summary row */}
              <button
                onClick={() => setExpanded(expanded === s.employeeId ? null : s.employeeId)}
                className="w-full glass-card border border-border hover:border-gold/25 rounded-sm px-6 py-4 flex items-center justify-between group transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full border border-border/60 flex items-center justify-center">
                    <span className="font-serif text-sm text-offwhite/50">
                      {s.name.charAt(0)}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="font-serif text-base text-offwhite group-hover:text-gold transition-colors duration-200">
                      {s.name}
                    </p>
                    <p className="text-[9px] tracking-widest uppercase text-offwhite/30 font-sans">
                      {s.entries.length} entr{s.entries.length === 1 ? 'y' : 'ies'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-serif text-xl text-gold">{formatHours(s.totalMinutes)}</p>
                  </div>
                  <span className="text-offwhite/20 group-hover:text-offwhite/40 transition-colors duration-200 text-xs">
                    {expanded === s.employeeId ? '▲' : '▼'}
                  </span>
                </div>
              </button>

              {/* Expanded entries */}
              {expanded === s.employeeId && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2"
                >
                  <HoursTable
                    entries={s.entries}
                    totalMinutes={s.totalMinutes}
                    title={`${s.name}'s Entries`}
                  />
                </motion.div>
              )}
            </motion.div>
          ))}

          {/* Grand total */}
          <div className="flex justify-between items-center px-6 py-3 border-t border-gold/15 mt-2">
            <span className="text-xs tracking-widest uppercase text-offwhite/30 font-sans">
              Grand Total
            </span>
            <span className="font-serif text-2xl text-gold">
              {formatHours(summaries.reduce((a, s) => a + s.totalMinutes, 0))}
            </span>
          </div>
        </div>
      )}

      {/* Add Employee section */}
      <div className="border-t border-border/40 pt-8">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-3 text-sm font-sans text-offwhite/40 hover:text-offwhite/70 transition-colors duration-200"
        >
          <span className="text-gold/50 text-lg leading-none">{showForm ? '−' : '+'}</span>
          <span className="tracking-widest uppercase text-xs">Add New Employee</span>
        </button>

        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleCreateEmployee}
            className="mt-6 glass-card border border-border rounded-sm p-8 flex flex-col gap-5"
          >
            <h3 className="font-serif text-lg text-offwhite">New Employee</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">
                  Full Name <span className="text-gold">*</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Employee name"
                  required
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">
                  4-Digit PIN <span className="text-gold">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="e.g. 1234"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">
                Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'staff' | 'admin')}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {formMsg && (
              <p className={`text-xs font-sans ${formMsg.type === 'ok' ? 'text-gold' : 'text-red-400'}`}>
                {formMsg.text}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={formLoading}
                className="px-6 py-3 bg-gold text-charcoal text-xs tracking-widest uppercase font-sans hover:bg-gold-light transition-colors duration-200 disabled:opacity-50"
              >
                {formLoading ? 'Creating…' : 'Create Employee'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormMsg(null) }}
                className="px-6 py-3 border border-border text-offwhite/40 text-xs tracking-widest uppercase font-sans hover:text-offwhite transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </div>
    </div>
  )
}
