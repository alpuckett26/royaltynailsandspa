'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { serviceCategories } from '@/lib/content'

type SessionEmployee = { id: string; name: string; role: string }

type Appointment = {
  id: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  service: string
  appointment_date: string
  appointment_time: string | null
  notes: string | null
  checked_in: boolean
  created_at: string
}

type LastBooked = {
  id: string
  name: string
  email: string
  service: string
  date: string
  time: string
}

function fmt12h(t: string | null | undefined): string {
  if (!t) return '—'
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`
}

function fmtDate(d: string): string {
  const [y, mo, day] = d.split('-').map(Number)
  return new Date(y, mo - 1, day).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })
}

function todayDate() {
  return new Date().toISOString().split('T')[0]
}

function buildGoogleCalUrl(appt: LastBooked): string {
  const title    = encodeURIComponent(`Royalty Nails & Spa — ${appt.service}`)
  const details  = encodeURIComponent(`Appointment for ${appt.name}\nService: ${appt.service}\nPhone: (214) 501-4300`)
  const location = encodeURIComponent('6909 Rowlett Road, Suite 102, Rowlett, TX 75089')
  let dates = ''
  if (appt.date && appt.time) {
    const [y, mo, d] = appt.date.split('-')
    const [h, m]     = appt.time.split(':')
    const pad = (n: string) => n.padStart(2, '0')
    const start = `${y}${pad(mo)}${pad(d)}T${pad(h)}${pad(m)}00`
    const endH  = String(Number(h) + 1).padStart(2, '0')
    const end   = `${y}${pad(mo)}${pad(d)}T${pad(endH)}${pad(m)}00`
    dates = `${start}/${end}`
  } else if (appt.date) {
    const [y, mo, d] = appt.date.split('-')
    dates = `${y}${mo}${d}/${y}${mo}${d}`
  }
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`
}

function buildIcalUrl(appt: LastBooked): string {
  const p = new URLSearchParams({
    name:    appt.name,
    service: appt.service,
    date:    appt.date,
    time:    appt.time,
    id:      appt.id,
  })
  return `/api/appointments/ical?${p.toString()}`
}

export default function AppointmentsPage() {
  const router = useRouter()
  const [employee, setEmployee] = useState<SessionEmployee | null>(null)
  const [date, setDate] = useState(todayDate())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  // Add form
  const [showForm, setShowForm] = useState(false)
  const [fName, setFName] = useState('')
  const [fEmail, setFEmail] = useState('')
  const [fPhone, setFPhone] = useState('')
  const [fService, setFService] = useState('')
  const [fTime, setFTime] = useState('')
  const [fNotes, setFNotes] = useState('')
  const [fDate, setFDate] = useState(todayDate())
  const [formLoading, setFormLoading] = useState(false)
  const [formErr, setFormErr] = useState<string | null>(null)

  // Confirmation panel shown after a successful add
  const [lastBooked, setLastBooked] = useState<LastBooked | null>(null)

  // Auth — any active employee
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = sessionStorage.getItem('rns_employee')
    if (!stored) { router.replace('/employee'); return }
    setEmployee(JSON.parse(stored))
  }, [router])

  const fetchAppointments = useCallback(async (d: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/appointments?date=${d}`)
      const data = await res.json()
      setAppointments(data.appointments ?? [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (employee) fetchAppointments(date)
  }, [employee, date, fetchAppointments])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!employee || !fName.trim() || !fService) return
    setFormLoading(true)
    setFormErr(null)
    setLastBooked(null)
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName:  fName.trim(),
          customerEmail: fEmail.trim() || undefined,
          customerPhone: fPhone.trim() || undefined,
          service:       fService,
          date:          fDate,
          time:          fTime || undefined,
          notes:         fNotes.trim() || undefined,
          adminId:       employee.id,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setLastBooked({ id: data.id, name: fName.trim(), email: fEmail.trim(), service: fService, date: fDate, time: fTime })
      setFName(''); setFEmail(''); setFPhone(''); setFService(''); setFTime(''); setFNotes('')
      setFDate(todayDate())
      fetchAppointments(date)
    } catch (err) {
      setFormErr(err instanceof Error ? err.message : 'Failed.')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!employee) return
    await fetch(`/api/appointments?id=${id}&adminId=${employee.id}`, { method: 'DELETE' })
    setAppointments(a => a.filter(x => x.id !== id))
  }

  if (!employee) return null

  const inputClass = 'w-full bg-charcoal border border-border rounded-sm px-3 py-2 text-offwhite text-sm font-sans placeholder:text-offwhite/25 focus:outline-none focus:border-gold/50 transition-colors duration-200'

  const waiting   = appointments.filter(a => !a.checked_in)
  const checkedIn = appointments.filter(a => a.checked_in)

  return (
    <div className="w-full max-w-3xl flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 font-sans mb-1">Staff Portal</p>
          <h1 className="font-serif text-3xl text-offwhite">Appointments</h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button onClick={() => router.push('/employee/dashboard')}
            className="text-xs tracking-widest uppercase text-offwhite/30 hover:text-offwhite/60 font-sans transition-colors duration-200">
            ← Dashboard
          </button>
          <button onClick={() => router.push('/employee/checkin')}
            className="text-xs tracking-widest uppercase text-offwhite/30 hover:text-offwhite/60 font-sans transition-colors duration-200">
            Check-In Queue →
          </button>
          <button onClick={() => { sessionStorage.removeItem('rns_employee'); router.push('/employee') }}
            className="text-xs tracking-widest uppercase text-offwhite/20 hover:text-offwhite/40 font-sans transition-colors duration-200">
            Sign Out
          </button>
        </div>
      </div>

      {/* Date picker */}
      <div className="flex items-center gap-4">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className={`${inputClass} w-auto`}
        />
        {date !== todayDate() && (
          <button onClick={() => setDate(todayDate())}
            className="text-xs tracking-widest uppercase text-gold/50 hover:text-gold font-sans transition-colors duration-200">
            Today
          </button>
        )}
        <span className="text-offwhite/25 text-xs font-sans">
          {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Appointment list */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-border/20 rounded-sm animate-pulse" />)}
        </div>
      ) : appointments.length === 0 ? (
        <div className="glass-card border border-border rounded-sm p-12 text-center">
          <p className="text-offwhite/25 font-sans text-sm">No appointments for this day.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">

          {/* Waiting */}
          {waiting.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] tracking-[0.25em] uppercase text-offwhite/30 font-sans">
                Upcoming — {waiting.length}
              </p>
              <AnimatePresence>
                {waiting.map((appt, idx) => (
                  <motion.div
                    key={appt.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    className="glass-card border border-border rounded-sm px-5 py-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-gold font-serif text-sm shrink-0 w-16 text-right">
                        {fmt12h(appt.appointment_time)}
                      </span>
                      <div className="min-w-0">
                        <p className="font-serif text-base text-offwhite truncate">{appt.customer_name}</p>
                        <p className="text-xs font-sans text-gold/60 truncate">{appt.service}</p>
                        {(appt.customer_email || appt.customer_phone) && (
                          <p className="text-[11px] font-sans text-offwhite/50 truncate">
                            {[appt.customer_email, appt.customer_phone].filter(Boolean).join(' · ')}
                          </p>
                        )}
                        {appt.notes && (
                          <p className="text-[11px] font-sans text-offwhite/30 truncate">{appt.notes}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(appt.id)}
                      className="shrink-0 text-offwhite/20 hover:text-red-400 text-xs font-sans transition-colors duration-150"
                    >
                      ✕
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Checked in */}
          {checkedIn.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] tracking-[0.25em] uppercase text-offwhite/20 font-sans">
                Checked In — {checkedIn.length}
              </p>
              {checkedIn.map(appt => (
                <div key={appt.id}
                  className="border border-border/30 rounded-sm px-5 py-3 flex items-center justify-between gap-4 opacity-40">
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-offwhite/40 font-serif text-sm shrink-0 w-16 text-right">
                      {fmt12h(appt.appointment_time)}
                    </span>
                    <div className="min-w-0">
                      <p className="font-serif text-sm text-offwhite truncate line-through">{appt.customer_name}</p>
                      <p className="text-xs font-sans text-offwhite/40 truncate">{appt.service}</p>
                    </div>
                  </div>
                  <span className="text-[10px] tracking-widest uppercase text-gold/50 font-sans shrink-0">✓ In</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add appointment form */}
      <div className="border-t border-border/40 pt-6 flex flex-col gap-4">
        <button
          onClick={() => { setShowForm(v => !v); setLastBooked(null) }}
          className="flex items-center gap-3 text-sm font-sans text-offwhite/40 hover:text-offwhite/70 transition-colors duration-200"
        >
          <span className="text-gold/50 text-lg leading-none">{showForm ? '−' : '+'}</span>
          <span className="tracking-widest uppercase text-xs">Add Appointment</span>
        </button>

        <AnimatePresence mode="wait">
          {showForm && !lastBooked && (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onSubmit={handleAdd}
              className="glass-card border border-border rounded-sm p-6 grid grid-cols-2 sm:grid-cols-3 gap-4"
            >
              {/* Customer name */}
              <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">
                  Customer Name <span className="text-gold">*</span>
                </label>
                <input type="text" value={fName} onChange={e => setFName(e.target.value)}
                  placeholder="Full name" required className={inputClass} />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">
                  Email (optional)
                </label>
                <input type="email" value={fEmail} onChange={e => setFEmail(e.target.value)}
                  placeholder="customer@email.com" className={inputClass} />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">
                  Phone (optional)
                </label>
                <input type="tel" value={fPhone} onChange={e => setFPhone(e.target.value)}
                  placeholder="(214) 555-0100" className={inputClass} />
              </div>

              {/* Service */}
              <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">
                  Service <span className="text-gold">*</span>
                </label>
                <select value={fService} onChange={e => setFService(e.target.value)} required
                  className={`${inputClass} appearance-none cursor-pointer`}>
                  <option value="">Select…</option>
                  {serviceCategories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">Date</label>
                <input type="date" value={fDate} onChange={e => setFDate(e.target.value)} className={inputClass} />
              </div>

              {/* Time */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">Time (optional)</label>
                <input type="time" value={fTime} onChange={e => setFTime(e.target.value)} className={inputClass} />
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">Notes (optional)</label>
                <input type="text" value={fNotes} onChange={e => setFNotes(e.target.value)}
                  placeholder="e.g. Gel upgrade" className={inputClass} />
              </div>

              <div className="col-span-2 sm:col-span-3 flex items-center gap-4">
                <button type="submit" disabled={formLoading}
                  className="px-6 py-2.5 bg-gold text-charcoal text-xs tracking-widest uppercase font-sans hover:bg-gold-light transition-colors duration-200 disabled:opacity-50">
                  {formLoading ? 'Adding…' : 'Add Appointment'}
                </button>
                {formErr && (
                  <p className="text-xs font-sans text-red-400">{formErr}</p>
                )}
              </div>
            </motion.form>
          )}

          {/* ── Booking confirmation + Add to Calendar ── */}
          {lastBooked && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass-card border border-gold/25 rounded-sm p-6 flex flex-col gap-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-gold/60 font-sans mb-1">Appointment Booked</p>
                  <p className="font-serif text-xl text-offwhite">{lastBooked.name}</p>
                  <p className="text-sm font-sans text-gold/70 mt-0.5">{lastBooked.service}</p>
                  <p className="text-xs font-sans text-offwhite/40 mt-1">
                    {fmtDate(lastBooked.date)}{lastBooked.time && ` · ${fmt12h(lastBooked.time)}`}
                  </p>
                  {lastBooked.email && (
                    <p className="text-[11px] font-sans text-gold/40 mt-1">
                      Confirmation sent to {lastBooked.email}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setLastBooked(null)}
                  className="text-offwhite/20 hover:text-offwhite/50 text-xs font-sans transition-colors duration-150 shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Calendar buttons */}
              <div>
                <p className="text-[10px] tracking-widest uppercase text-offwhite/30 font-sans mb-3">
                  Add to Customer&apos;s Calendar
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={buildGoogleCalUrl(lastBooked)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-charcoal text-xs tracking-widest uppercase font-sans hover:bg-gold-light transition-colors duration-200 rounded-sm"
                  >
                    Google Calendar
                  </a>
                  <a
                    href={buildIcalUrl(lastBooked)}
                    download="royalty-nails-appointment.ics"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-border text-offwhite/60 text-xs tracking-widest uppercase font-sans hover:text-offwhite hover:border-offwhite/30 transition-colors duration-200 rounded-sm"
                  >
                    Apple / Outlook (.ics)
                  </a>
                </div>
                <p className="text-[10px] font-sans text-offwhite/20 mt-3">
                  Hand the phone to the customer or share the link so they can save the appointment.
                </p>
              </div>

              {/* Add another */}
              <button
                onClick={() => setLastBooked(null)}
                className="self-start text-xs tracking-widest uppercase text-offwhite/30 hover:text-offwhite/60 font-sans transition-colors duration-200"
              >
                + Add another appointment
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
