'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

type SessionEmployee = { id: string; name: string; role: string }
type Employee = { id: string; name: string; role: string }
type Shift = {
  id: string
  employee_id: string
  shift_date: string
  start_time: string
  end_time: string
  notes: string | null
  employees: { name: string }
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getWeekDates(offset = 0): Date[] {
  const now = new Date()
  const day = now.getDay()
  const diffToMon = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMon + offset * 7)
  monday.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function fmt(date: Date) {
  return date.toISOString().split('T')[0]
}

function fmtDisplay(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function fmtTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

export default function SchedulePage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<SessionEmployee | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [weekOffset, setWeekOffset] = useState(0)
  const [weekDates, setWeekDates] = useState<Date[]>([])
  const [loading, setLoading] = useState(true)

  // Shift form — per-employee, multi-day
  const [showForm, setShowForm] = useState(false)
  const [formEmp, setFormEmp] = useState('')
  const [formDays, setFormDays] = useState<Record<string, { enabled: boolean; start: string; end: string }>>({})
  const [formLoading, setFormLoading] = useState(false)
  const [formMsg, setFormMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = sessionStorage.getItem('rns_employee')
    if (!stored) { router.replace('/employee'); return }
    const emp: SessionEmployee = JSON.parse(stored)
    if (emp.role !== 'admin') { router.replace('/employee/dashboard'); return }
    setAdmin(emp)
  }, [router])

  useEffect(() => {
    setWeekDates(getWeekDates(weekOffset))
  }, [weekOffset])

  // Reset day selections whenever the form opens or the visible week changes
  useEffect(() => {
    if (!showForm || !weekDates.length) return
    const init: Record<string, { enabled: boolean; start: string; end: string }> = {}
    weekDates.forEach(d => { init[fmt(d)] = { enabled: false, start: '10:00', end: '19:00' } })
    setFormDays(init)
    setFormMsg(null)
  }, [showForm, weekDates])

  useEffect(() => {
    if (!admin) return
    fetch('/api/employee/list')
      .then(r => r.json())
      .then(d => setEmployees(d.employees ?? []))
  }, [admin])

  const fetchShifts = useCallback(async () => {
    if (!weekDates.length) return
    setLoading(true)
    try {
      const from = fmt(weekDates[0])
      const to   = fmt(weekDates[6])
      const res  = await fetch(`/api/employee/shifts?from=${from}&to=${to}`)
      const data = await res.json()
      setShifts(data.shifts ?? [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [weekDates])

  useEffect(() => { fetchShifts() }, [fetchShifts])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!admin || !formEmp) return
    const enabled = Object.entries(formDays).filter(([, v]) => v.enabled)
    if (!enabled.length) {
      setFormMsg({ type: 'err', text: 'Select at least one day.' })
      return
    }
    setFormLoading(true)
    setFormMsg(null)
    try {
      const results = await Promise.all(
        enabled.map(([dateStr, day]) =>
          fetch('/api/employee/shifts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              adminId: admin.id,
              employeeId: formEmp,
              shiftDate: dateStr,
              startTime: day.start,
              endTime: day.end,
              notes: null,
            }),
          })
        )
      )
      const failed = results.filter(r => !r.ok).length
      if (failed) throw new Error(`${failed} shift(s) failed to save.`)
      const count = enabled.length
      setFormMsg({ type: 'ok', text: `${count} shift${count > 1 ? 's' : ''} added.` })
      // Uncheck all days but keep times
      setFormDays(prev => {
        const next = { ...prev }
        Object.keys(next).forEach(k => { next[k] = { ...next[k], enabled: false } })
        return next
      })
      fetchShifts()
    } catch (err: unknown) {
      setFormMsg({ type: 'err', text: err instanceof Error ? err.message : 'Failed to add shifts.' })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (shiftId: string) => {
    if (!admin) return
    await fetch(`/api/employee/shifts?shiftId=${shiftId}&adminId=${admin.id}`, { method: 'DELETE' })
    fetchShifts()
  }

  const inputClass = 'w-full bg-charcoal border border-border rounded-sm px-3 py-2 text-offwhite text-sm font-sans placeholder:text-offwhite/25 focus:outline-none focus:border-gold/50 transition-colors duration-200'

  if (!admin) return null

  return (
    <div className="w-full max-w-5xl flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 font-sans mb-1">Admin Portal</p>
          <h1 className="font-serif text-3xl text-offwhite">Schedule</h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button onClick={() => router.push('/employee/admin')}
            className="text-xs tracking-widest uppercase text-offwhite/30 hover:text-offwhite/60 font-sans transition-colors duration-200">
            ← Hours Overview
          </button>
          <button onClick={() => { sessionStorage.removeItem('rns_employee'); router.push('/employee') }}
            className="text-xs tracking-widest uppercase text-offwhite/20 hover:text-offwhite/40 font-sans transition-colors duration-200">
            Sign Out
          </button>
        </div>
      </div>

      {/* Week nav */}
      <div className="flex items-center gap-4">
        <button onClick={() => setWeekOffset(w => w - 1)}
          className="text-offwhite/40 hover:text-offwhite transition-colors duration-200 text-lg">←</button>
        <span className="text-sm font-sans text-offwhite/60">
          {weekDates.length ? `${fmtDisplay(weekDates[0])} – ${fmtDisplay(weekDates[6])}` : ''}
        </span>
        <button onClick={() => setWeekOffset(w => w + 1)}
          className="text-offwhite/40 hover:text-offwhite transition-colors duration-200 text-lg">→</button>
        {weekOffset !== 0 && (
          <button onClick={() => setWeekOffset(0)}
            className="text-xs tracking-widest uppercase text-gold/50 hover:text-gold font-sans transition-colors duration-200 ml-2">
            This Week
          </button>
        )}
      </div>

      {/* Weekly grid */}
      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((day, i) => {
          const date = weekDates[i]
          const dateStr = date ? fmt(date) : ''
          const dayShifts = shifts.filter(s => s.shift_date === dateStr)
          const isToday = dateStr === fmt(new Date())
          return (
            <div key={day} className={`flex flex-col gap-2 min-h-[120px]`}>
              {/* Day header */}
              <div className={`text-center pb-2 border-b ${isToday ? 'border-gold/40' : 'border-border/40'}`}>
                <p className={`text-[10px] tracking-widest uppercase font-sans ${isToday ? 'text-gold' : 'text-offwhite/30'}`}>{day}</p>
                <p className={`text-sm font-serif ${isToday ? 'text-gold' : 'text-offwhite/50'}`}>
                  {date ? date.getDate() : ''}
                </p>
              </div>
              {/* Shifts */}
              {loading ? (
                <div className="h-10 bg-border/20 rounded-sm animate-pulse" />
              ) : (
                <div className="flex flex-col gap-1">
                  {dayShifts.map(shift => (
                    <motion.div
                      key={shift.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group relative bg-charcoal-100 border border-gold/20 rounded-sm px-2 py-1.5"
                    >
                      <p className="text-[10px] font-sans text-gold/80 leading-tight truncate">{shift.employees?.name}</p>
                      <p className="text-[9px] font-sans text-offwhite/40 leading-tight">
                        {fmtTime(shift.start_time)}–{fmtTime(shift.end_time)}
                      </p>
                      {shift.notes && (
                        <p className="text-[9px] font-sans text-offwhite/25 leading-tight truncate">{shift.notes}</p>
                      )}
                      <button
                        onClick={() => handleDelete(shift.id)}
                        className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 text-offwhite/20 hover:text-red-400 text-[10px] transition-all duration-150 leading-none"
                      >✕</button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Employee share links */}
      {employees.length > 0 && (
        <div className="border-t border-border/40 pt-6">
          <p className="text-[10px] tracking-[0.25em] uppercase text-gold/50 font-sans mb-4">Schedule Links</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {employees.map(emp => {
              const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/schedule/${emp.id}`
              return (
                <div key={emp.id} className="glass-card border border-border rounded-sm px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-serif text-sm text-offwhite">{emp.name}</p>
                    <p className="text-[10px] font-sans text-offwhite/25 truncate max-w-[180px]">/schedule/{emp.id.slice(0, 8)}…</p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(link)}
                    className="text-[10px] tracking-widest uppercase text-gold/50 hover:text-gold font-sans transition-colors duration-200 shrink-0"
                  >
                    Copy
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Add shifts — per employee, multi-day */}
      <div className="border-t border-border/40 pt-6">
        <button
          onClick={() => { setShowForm(v => !v); setFormEmp('') }}
          className="flex items-center gap-3 text-sm font-sans text-offwhite/40 hover:text-offwhite/70 transition-colors duration-200"
        >
          <span className="text-gold/50 text-lg leading-none">{showForm ? '−' : '+'}</span>
          <span className="tracking-widest uppercase text-xs">Schedule Employee</span>
        </button>

        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleCreate}
            className="mt-6 glass-card border border-border rounded-sm p-6 flex flex-col gap-6"
          >
            {/* Step 1: pick employee */}
            <div className="flex flex-col gap-1.5 max-w-xs">
              <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">
                Employee
              </label>
              <select
                value={formEmp}
                onChange={e => { setFormEmp(e.target.value); setFormMsg(null) }}
                required
                className={inputClass}
              >
                <option value="">Select employee…</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>

            {/* Step 2: pick days + times */}
            {formEmp && weekDates.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-[10px] tracking-[0.25em] uppercase text-offwhite/30 font-sans">
                  Select days for {fmtDisplay(weekDates[0])} – {fmtDisplay(weekDates[6])}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {weekDates.map((date, i) => {
                    const dateStr = fmt(date)
                    const day = formDays[dateStr]
                    if (!day) return null
                    const isToday = dateStr === fmt(new Date())
                    return (
                      <div key={dateStr} className={`flex flex-col gap-2 p-3 rounded-sm border transition-colors duration-150 ${
                        day.enabled ? 'border-gold/40 bg-gold/5' : 'border-border/40'
                      }`}>
                        {/* Day toggle */}
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={day.enabled}
                            onChange={e => setFormDays(prev => ({
                              ...prev, [dateStr]: { ...prev[dateStr], enabled: e.target.checked }
                            }))}
                            className="accent-gold"
                          />
                          <span className={`text-xs font-sans ${isToday ? 'text-gold' : 'text-offwhite/60'}`}>
                            {DAYS[i]} {date.getDate()}
                          </span>
                        </label>
                        {/* Times — only when checked */}
                        {day.enabled && (
                          <div className="flex flex-col gap-1.5">
                            <input
                              type="time"
                              value={day.start}
                              onChange={e => setFormDays(prev => ({
                                ...prev, [dateStr]: { ...prev[dateStr], start: e.target.value }
                              }))}
                              className="w-full bg-charcoal border border-border/60 rounded-sm px-2 py-1 text-offwhite text-xs font-sans focus:outline-none focus:border-gold/50"
                            />
                            <input
                              type="time"
                              value={day.end}
                              onChange={e => setFormDays(prev => ({
                                ...prev, [dateStr]: { ...prev[dateStr], end: e.target.value }
                              }))}
                              className="w-full bg-charcoal border border-border/60 rounded-sm px-2 py-1 text-offwhite text-xs font-sans focus:outline-none focus:border-gold/50"
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Submit row */}
            <div className="flex items-center gap-3 flex-wrap">
              {(() => {
                const count = Object.values(formDays).filter(d => d.enabled).length
                return (
                  <button type="submit" disabled={formLoading || !formEmp}
                    className="px-6 py-2.5 bg-gold text-charcoal text-xs tracking-widest uppercase font-semibold font-sans hover:bg-gold-light transition-colors duration-200 disabled:opacity-50">
                    {formLoading ? 'Saving…' : count > 0 ? `Add ${count} Shift${count > 1 ? 's' : ''}` : 'Add Shifts'}
                  </button>
                )
              })()}
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormEmp(''); setFormMsg(null) }}
                className="text-xs tracking-widest uppercase text-offwhite/30 hover:text-offwhite/60 font-sans transition-colors duration-200"
              >
                Cancel
              </button>
              {formMsg && (
                <p className={`text-xs font-sans ${formMsg.type === 'ok' ? 'text-gold' : 'text-red-400'}`}>
                  {formMsg.text}
                </p>
              )}
            </div>
          </motion.form>
        )}
      </div>
    </div>
  )
}
