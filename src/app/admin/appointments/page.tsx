'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { serviceCategories } from '@/lib/content'

type Admin = { id: string; name: string; role: string }
type Appointment = {
  id: string; customer_name: string; customer_email: string | null
  customer_phone: string | null; service: string; appointment_date: string
  appointment_time: string | null; notes: string | null; checked_in: boolean
}

function todayDate() { return new Date().toISOString().split('T')[0] }

function fmt12h(t: string | null): string {
  if (!t) return '—'
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

function fmtDate(d: string): string {
  const [y, mo, day] = d.split('-').map(Number)
  return new Date(y, mo - 1, day).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export default function AdminAppointmentsPage() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [date, setDate] = useState(todayDate())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [fName, setFName] = useState(''); const [fEmail, setFEmail] = useState('')
  const [fPhone, setFPhone] = useState(''); const [fService, setFService] = useState('')
  const [fTime, setFTime] = useState(''); const [fNotes, setFNotes] = useState('')
  const [fDate, setFDate] = useState(todayDate())
  const [formLoading, setFormLoading] = useState(false)
  const [formMsg, setFormMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = sessionStorage.getItem('rns_employee')
    if (stored) setAdmin(JSON.parse(stored))
  }, [])

  const fetch_ = useCallback(async (d: string) => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/appointments?date=${d}`)
      const data = await res.json()
      setAppointments(data.appointments ?? [])
    } catch { /* silent */ } finally { setLoading(false) }
  }, [])

  useEffect(() => { if (admin) fetch_(date) }, [admin, date, fetch_])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!admin || !fName.trim() || !fService) return
    setFormLoading(true); setFormMsg(null)
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: fName.trim(), customerEmail: fEmail.trim() || undefined,
          customerPhone: fPhone.trim() || undefined, service: fService,
          date: fDate, time: fTime || undefined, notes: fNotes.trim() || undefined,
          adminId: admin.id,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setFormMsg({ type: 'ok', text: 'Appointment added.' })
      setFName(''); setFEmail(''); setFPhone(''); setFService(''); setFTime(''); setFNotes('')
      fetch_(date)
    } catch (err) {
      setFormMsg({ type: 'err', text: err instanceof Error ? err.message : 'Failed.' })
    } finally { setFormLoading(false) }
  }

  async function handleCheckIn(id: string) {
    await fetch('/api/appointments', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetch_(date)
  }

  async function handleDelete(id: string) {
    if (!admin) return
    await fetch(`/api/appointments?id=${id}&adminId=${admin.id}`, { method: 'DELETE' })
    setAppointments(a => a.filter(x => x.id !== id))
  }

  const ic = 'w-full bg-charcoal border border-border rounded-sm px-3 py-2 text-offwhite text-sm font-sans placeholder:text-offwhite/25 focus:outline-none focus:border-gold/50 transition-colors duration-200'

  const waiting    = appointments.filter(a => !a.checked_in)
  const checkedIn  = appointments.filter(a => a.checked_in)
  const allServices = serviceCategories.flatMap(c => c.packages.map(p => p.name))

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 font-sans mb-1">Admin Panel</p>
          <h1 className="font-serif text-3xl text-offwhite">Appointments</h1>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="px-5 py-2.5 bg-gold text-charcoal text-xs tracking-widest uppercase font-sans font-semibold hover:bg-gold-light transition-colors duration-200">
          {showForm ? 'Cancel' : '+ New Appointment'}
        </button>
      </div>

      {/* Date picker */}
      <div className="flex items-center gap-4 flex-wrap">
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="bg-charcoal border border-border rounded-sm px-3 py-2 text-offwhite text-sm font-sans focus:outline-none focus:border-gold/50 transition-colors duration-200" />
        {date !== todayDate() && (
          <button onClick={() => setDate(todayDate())}
            className="text-xs tracking-widest uppercase text-gold/50 hover:text-gold font-sans transition-colors duration-200">
            Today
          </button>
        )}
        <span className="text-offwhite/30 text-sm font-sans">{fmtDate(date)}</span>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            onSubmit={handleAdd}
            className="glass-card border border-gold/20 rounded-sm p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <h3 className="font-serif text-lg text-offwhite col-span-full">New Appointment</h3>
            {[
              { label: 'Customer Name *', val: fName, set: setFName, type: 'text', placeholder: 'Full name' },
              { label: 'Email', val: fEmail, set: setFEmail, type: 'email', placeholder: 'Optional' },
              { label: 'Phone', val: fPhone, set: setFPhone, type: 'tel', placeholder: 'Optional' },
            ].map(f => (
              <div key={f.label} className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">{f.label}</label>
                <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)}
                  placeholder={f.placeholder} className={ic} />
              </div>
            ))}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">Service *</label>
              <select value={fService} onChange={e => setFService(e.target.value)} required className={`${ic} appearance-none`}>
                <option value="">Select service…</option>
                {serviceCategories.map(cat => (
                  <optgroup key={cat.id} label={cat.name}>
                    {cat.packages.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">Date</label>
              <input type="date" value={fDate} onChange={e => setFDate(e.target.value)} className={ic} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">Time</label>
              <input type="time" value={fTime} onChange={e => setFTime(e.target.value)} className={ic} />
            </div>
            <div className="flex flex-col gap-1.5 col-span-full">
              <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">Notes</label>
              <input type="text" value={fNotes} onChange={e => setFNotes(e.target.value)} placeholder="Optional notes" className={ic} />
            </div>
            <div className="col-span-full flex items-center gap-4">
              <button type="submit" disabled={formLoading}
                className="px-6 py-2.5 bg-gold text-charcoal text-xs tracking-widest uppercase font-semibold font-sans hover:bg-gold-light transition-colors duration-200 disabled:opacity-50">
                {formLoading ? 'Saving…' : 'Add Appointment'}
              </button>
              {formMsg && (
                <p className={`text-xs font-sans ${formMsg.type === 'ok' ? 'text-gold' : 'text-red-400'}`}>{formMsg.text}</p>
              )}
            </div>
            <p className="col-span-full text-[10px] font-sans text-offwhite/20">* required — unused by linter: {allServices.length} services loaded</p>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Appointment list */}
      {loading ? (
        <div className="flex flex-col gap-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-border/20 rounded-sm animate-pulse" />)}</div>
      ) : appointments.length === 0 ? (
        <div className="glass-card border border-border/40 rounded-sm p-10 text-center">
          <p className="text-offwhite/20 font-sans text-sm">No appointments for this date.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {waiting.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] tracking-[0.25em] uppercase text-gold/50 font-sans">Upcoming — {waiting.length}</p>
              {waiting.map(a => (
                <div key={a.id} className="glass-card border border-border/60 rounded-sm px-5 py-4 flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-serif text-base text-offwhite">{a.customer_name}</p>
                      <span className="text-[10px] font-sans text-gold/60">{fmt12h(a.appointment_time)}</span>
                    </div>
                    <p className="text-xs font-sans text-offwhite/50 mt-0.5">{a.service}</p>
                    {a.customer_phone && <p className="text-[11px] font-sans text-offwhite/30">{a.customer_phone}</p>}
                    {a.notes && <p className="text-[11px] font-sans text-offwhite/25 italic mt-0.5">{a.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => handleCheckIn(a.id)}
                      className="px-3 py-1.5 border border-gold/30 text-gold text-[10px] tracking-widest uppercase font-sans hover:bg-gold/10 rounded-sm transition-all duration-150">
                      Check In
                    </button>
                    <button onClick={() => handleDelete(a.id)}
                      className="px-3 py-1.5 border border-red-400/20 text-red-400/50 text-[10px] tracking-widest uppercase font-sans hover:text-red-400 hover:border-red-400/40 rounded-sm transition-all duration-150">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {checkedIn.length > 0 && (
            <div className="flex flex-col gap-2 opacity-50">
              <p className="text-[10px] tracking-[0.25em] uppercase text-offwhite/25 font-sans">Checked In — {checkedIn.length}</p>
              {checkedIn.map(a => (
                <div key={a.id} className="glass-card border border-border/30 rounded-sm px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-serif text-sm text-offwhite/50 line-through">{a.customer_name}</p>
                    <p className="text-xs font-sans text-offwhite/30">{a.service} · {fmt12h(a.appointment_time)}</p>
                  </div>
                  <span className="text-[10px] tracking-widest uppercase font-sans text-gold/50">✓ Done</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
