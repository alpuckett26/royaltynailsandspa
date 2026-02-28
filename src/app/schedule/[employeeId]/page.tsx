'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'

type Shift = {
  id: string
  shift_date: string
  start_time: string
  end_time: string
  notes: string | null
}

type EmployeeInfo = {
  id: string
  name: string
  role: string
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

function fmtFull(date: Date) {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function fmtTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

function calcHours(start: string, end: string): string {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const totalMin = (eh * 60 + em) - (sh * 60 + sm)
  if (totalMin <= 0) return ''
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export default function EmployeeSchedulePage() {
  const params = useParams()
  const employeeId = params.employeeId as string

  const [employee, setEmployee] = useState<EmployeeInfo | null>(null)
  const [shifts, setShifts] = useState<Shift[]>([])
  const [weekOffset, setWeekOffset] = useState(0)
  const [weekDates, setWeekDates] = useState<Date[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setWeekDates(getWeekDates(weekOffset))
  }, [weekOffset])

  // Load employee info
  useEffect(() => {
    if (!employeeId) return
    fetch('/api/employee/list')
      .then(r => r.json())
      .then(d => {
        const emp = (d.employees ?? []).find((e: EmployeeInfo) => e.id === employeeId)
        if (emp) setEmployee(emp)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
  }, [employeeId])

  const fetchShifts = useCallback(async () => {
    if (!weekDates.length || !employeeId) return
    setLoading(true)
    try {
      const from = fmt(weekDates[0])
      const to   = fmt(weekDates[6])
      const res  = await fetch(`/api/employee/shifts?employeeId=${employeeId}&from=${from}&to=${to}`)
      const data = await res.json()
      setShifts(data.shifts ?? [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [weekDates, employeeId])

  useEffect(() => { fetchShifts() }, [fetchShifts])

  if (notFound) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-serif text-2xl text-offwhite/40 mb-2">Schedule not found</p>
          <p className="text-sm text-offwhite/25 font-sans">This link may be invalid or expired.</p>
        </div>
      </div>
    )
  }

  // Upcoming shifts (from today forward) for list view
  const todayStr = fmt(new Date())
  const upcomingShifts = shifts.filter(s => s.shift_date >= todayStr)

  return (
    <div className="min-h-screen bg-charcoal">
      {/* Header */}
      <div className="border-b border-border/40 px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-[9px] tracking-[0.3em] uppercase text-gold/40 font-sans mb-0.5">
              Royalty Nails &amp; Spa
            </p>
            <h1 className="font-serif text-xl text-offwhite">
              {employee ? `${employee.name}'s Schedule` : 'Schedule'}
            </h1>
          </div>
          <div className="w-8 h-8 rounded-full border border-gold/20 flex items-center justify-center">
            <span className="font-serif text-sm text-gold/50">
              {employee ? employee.name.charAt(0) : '?'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-8">

        {/* Week navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setWeekOffset(w => w - 1)}
            className="text-offwhite/40 hover:text-offwhite transition-colors duration-200 text-lg w-8 h-8 flex items-center justify-center"
          >←</button>
          <span className="flex-1 text-center text-sm font-sans text-offwhite/60">
            {weekDates.length ? `${fmtDisplay(weekDates[0])} – ${fmtDisplay(weekDates[6])}` : ''}
          </span>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            className="text-offwhite/40 hover:text-offwhite transition-colors duration-200 text-lg w-8 h-8 flex items-center justify-center"
          >→</button>
        </div>
        {weekOffset !== 0 && (
          <div className="flex justify-center -mt-6">
            <button
              onClick={() => setWeekOffset(0)}
              className="text-[10px] tracking-widest uppercase text-gold/50 hover:text-gold font-sans transition-colors duration-200"
            >
              This Week
            </button>
          </div>
        )}

        {/* Shift list */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-border/20 rounded-sm animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {DAYS.map((day, i) => {
              const date = weekDates[i]
              if (!date) return null
              const dateStr = fmt(date)
              const dayShifts = shifts.filter(s => s.shift_date === dateStr)
              const isToday = dateStr === todayStr
              const isPast = dateStr < todayStr

              return (
                <div key={day}>
                  {/* Day label */}
                  <div className={`flex items-center gap-3 mb-2 ${isPast ? 'opacity-40' : ''}`}>
                    <div className={`w-px h-4 ${isToday ? 'bg-gold' : 'bg-border/40'}`} />
                    <p className={`text-[10px] tracking-[0.25em] uppercase font-sans ${isToday ? 'text-gold' : 'text-offwhite/30'}`}>
                      {fmtFull(date)}
                    </p>
                    {isToday && (
                      <span className="text-[8px] tracking-widest uppercase text-gold/60 font-sans border border-gold/20 px-1.5 py-0.5 rounded-full">
                        Today
                      </span>
                    )}
                  </div>

                  {dayShifts.length === 0 ? (
                    <div className={`ml-4 mb-4 ${isPast ? 'opacity-30' : 'opacity-50'}`}>
                      <p className="text-xs text-offwhite/25 font-sans italic">Off</p>
                    </div>
                  ) : (
                    <div className="ml-4 mb-4 flex flex-col gap-2">
                      {dayShifts.map(shift => (
                        <motion.div
                          key={shift.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`glass-card border rounded-sm px-4 py-3 ${
                            isToday
                              ? 'border-gold/30 shadow-gold'
                              : isPast
                              ? 'border-border/30 opacity-50'
                              : 'border-border/60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-serif text-base text-offwhite">
                                {fmtTime(shift.start_time)} – {fmtTime(shift.end_time)}
                              </p>
                              {shift.notes && (
                                <p className="text-xs text-offwhite/40 font-sans mt-0.5">{shift.notes}</p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs text-gold/60 font-sans">
                                {calcHours(shift.start_time, shift.end_time)}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Weekly summary */}
            {shifts.length > 0 && (() => {
              const totalMin = shifts.reduce((acc, s) => {
                const [sh, sm] = s.start_time.split(':').map(Number)
                const [eh, em] = s.end_time.split(':').map(Number)
                return acc + Math.max(0, (eh * 60 + em) - (sh * 60 + sm))
              }, 0)
              const h = Math.floor(totalMin / 60)
              const m = totalMin % 60
              return (
                <div className="flex justify-between items-center px-4 py-3 border-t border-gold/15 mt-2">
                  <span className="text-[10px] tracking-widest uppercase text-offwhite/30 font-sans">
                    Week Total
                  </span>
                  <span className="font-serif text-xl text-gold">
                    {m === 0 ? `${h}h` : `${h}h ${m}m`}
                  </span>
                </div>
              )
            })()}

            {shifts.length === 0 && (
              <div className="glass-card border border-border/30 rounded-sm p-10 text-center">
                <p className="text-offwhite/30 text-sm font-sans">No shifts scheduled this week.</p>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="border-t border-border/20 pt-6 text-center">
          <p className="text-[9px] tracking-[0.2em] uppercase text-offwhite/15 font-sans">
            Royalty Nails &amp; Spa · (214) 501-4300
          </p>
        </div>
      </div>
    </div>
  )
}
