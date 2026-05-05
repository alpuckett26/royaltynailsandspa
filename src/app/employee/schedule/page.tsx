'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

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
type ModalRow = { empId: string; start: string; end: string }

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

function fmtFull(date: Date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function fmtTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

const emptyRow = (): ModalRow => ({ empId: '', start: '10:00', end: '19:00' })

export default function SchedulePage() {
  const router = useRouter()
  const [admin, setAdmin]       = useState<SessionEmployee | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [shifts, setShifts]     = useState<Shift[]>([])
  const [weekOffset, setWeekOffset] = useState(0)
  const [weekDates, setWeekDates]   = useState<Date[]>([])
  const [loading, setLoading]       = useState(true)

  // Day modal
  const [modalDate, setModalDate]     = useState<Date | null>(null)
  const [modalRows, setModalRows]     = useState<ModalRow[]>([emptyRow()])
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError]   = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = sessionStorage.getItem('rns_employee')
    if (!stored) { router.replace('/employee'); return }
    const emp: SessionEmployee = JSON.parse(stored)
    if (emp.role !== 'admin') { router.replace('/employee/dashboard'); return }
    setAdmin(emp)
  }, [router])

  useEffect(() => { setWeekDates(getWeekDates(weekOffset)) }, [weekOffset])

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

  function openModal(date: Date) {
    setModalDate(date)
    setModalRows([emptyRow()])
    setModalError(null)
  }

  function closeModal() {
    setModalDate(null)
    setModalRows([emptyRow()])
    setModalError(null)
  }

  async function handleModalSave() {
    if (!admin || !modalDate) return
    const valid = modalRows.filter(r => r.empId)
    if (!valid.length) { setModalError('Select at least one employee.'); return }
    setModalLoading(true)
    setModalError(null)
    try {
      const results = await Promise.all(
        valid.map(row =>
          fetch('/api/employee/shifts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              adminId: admin.id,
              employeeId: row.empId,
              shiftDate: fmt(modalDate),
              startTime: row.start,
              endTime: row.end,
              notes: null,
            }),
          })
        )
      )
      if (results.some(r => !r.ok)) throw new Error('Some shifts failed to save.')
      closeModal()
      fetchShifts()
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Failed to save.')
    } finally {
      setModalLoading(false)
    }
  }

  const handleDelete = async (shiftId: string) => {
    if (!admin) return
    await fetch(`/api/employee/shifts?shiftId=${shiftId}&adminId=${admin.id}`, { method: 'DELETE' })
    fetchShifts()
  }

  const inputClass = 'bg-charcoal border border-border rounded-sm px-3 py-2 text-offwhite text-sm font-sans focus:outline-none focus:border-gold/50 transition-colors duration-200'

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
          <button onClick={() => router.push('/admin')}
            className="text-xs tracking-widest uppercase text-offwhite/30 hover:text-offwhite/60 font-sans transition-colors duration-200">
            ← Admin Panel
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
          const date    = weekDates[i]
          const dateStr = date ? fmt(date) : ''
          const dayShifts = shifts.filter(s => s.shift_date === dateStr)
          const isToday   = dateStr === fmt(new Date())
          return (
            <div key={day} className="flex flex-col gap-2 min-h-[120px]">
              {/* Day header — click to open modal */}
              <button
                onClick={() => date && openModal(date)}
                className={`w-full text-center pb-2 border-b group transition-colors duration-150 ${
                  isToday ? 'border-gold/40' : 'border-border/40 hover:border-gold/25'
                }`}
              >
                <p className={`text-[10px] tracking-widest uppercase font-sans ${isToday ? 'text-gold' : 'text-offwhite/30 group-hover:text-offwhite/60'}`}>
                  {day}
                </p>
                <p className={`text-sm font-serif ${isToday ? 'text-gold' : 'text-offwhite/50 group-hover:text-offwhite/70'}`}>
                  {date ? date.getDate() : ''}
                </p>
                <p className="text-[9px] text-gold/40 group-hover:text-gold/70 transition-colors duration-150 mt-0.5 font-sans">+</p>
              </button>

              {/* Shifts */}
              {loading ? (
                <div className="h-10 bg-border/20 rounded-sm animate-pulse" />
              ) : (
                <div className="flex flex-col gap-1">
                  {dayShifts.map(shift => (
                    <motion.div key={shift.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group relative border border-gold/20 rounded-sm px-2 py-1.5"
                    >
                      <p className="text-[10px] font-sans text-gold/80 leading-tight truncate">{shift.employees?.name}</p>
                      <p className="text-[9px] font-sans text-offwhite/40 leading-tight">
                        {fmtTime(shift.start_time)}–{fmtTime(shift.end_time)}
                      </p>
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

      {/* Schedule links */}
      {employees.length > 0 && (
        <div className="border-t border-border/40 pt-6">
          <div className="flex items-center gap-3 mb-4">
            <p className="text-[10px] tracking-[0.25em] uppercase text-gold/50 font-sans">Schedule Links</p>
            <p className="text-[10px] font-sans text-offwhite/25">— share with each employee so they can view their shifts</p>
          </div>
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

      {/* Day modal */}
      <AnimatePresence>
        {modalDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-charcoal/90 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="glass-card border border-border rounded-sm p-6 w-full max-w-md flex flex-col gap-5"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-gold/50 font-sans mb-0.5">Add Shifts</p>
                <h2 className="font-serif text-xl text-offwhite">{fmtFull(modalDate)}</h2>
              </div>

              {/* Rows */}
              <div className="flex flex-col gap-3">
                {modalRows.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_80px_80px_20px] gap-2 items-center">
                    <select
                      value={row.empId}
                      onChange={e => setModalRows(prev => prev.map((r, i) => i === idx ? { ...r, empId: e.target.value } : r))}
                      className={`${inputClass} w-full`}
                    >
                      <option value="">Employee…</option>
                      {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                    </select>
                    <input type="time" value={row.start}
                      onChange={e => setModalRows(prev => prev.map((r, i) => i === idx ? { ...r, start: e.target.value } : r))}
                      className={`${inputClass} w-full text-xs`}
                    />
                    <input type="time" value={row.end}
                      onChange={e => setModalRows(prev => prev.map((r, i) => i === idx ? { ...r, end: e.target.value } : r))}
                      className={`${inputClass} w-full text-xs`}
                    />
                    {modalRows.length > 1 ? (
                      <button onClick={() => setModalRows(prev => prev.filter((_, i) => i !== idx))}
                        className="text-offwhite/20 hover:text-red-400 text-sm transition-colors duration-150">✕</button>
                    ) : <div />}
                  </div>
                ))}
              </div>

              {/* Add another */}
              <button
                onClick={() => setModalRows(prev => [...prev, emptyRow()])}
                className="text-xs tracking-widest uppercase text-offwhite/30 hover:text-offwhite/60 font-sans transition-colors duration-200 text-left"
              >
                + Add Another Employee
              </button>

              {modalError && (
                <p className="text-xs text-red-400 font-sans">{modalError}</p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2 border-t border-border/30">
                <button
                  onClick={handleModalSave}
                  disabled={modalLoading}
                  className="px-6 py-2.5 bg-gold text-charcoal text-xs tracking-widest uppercase font-semibold font-sans hover:bg-gold-light transition-colors duration-200 disabled:opacity-50"
                >
                  {modalLoading ? 'Saving…' : 'Save Shifts'}
                </button>
                <button onClick={closeModal}
                  className="text-xs tracking-widest uppercase text-offwhite/30 hover:text-offwhite/60 font-sans transition-colors duration-200">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
