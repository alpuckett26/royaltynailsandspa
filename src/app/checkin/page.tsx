'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { serviceCategories } from '@/lib/content'

type Step = 'welcome' | 'name' | 'service' | 'confirm'

type Appointment = {
  id: string
  customer_name: string
  service: string
  appointment_time: string | null
  notes: string | null
  checked_in: boolean
}

type QueueEntry = {
  id: string
  customer_name: string
  service: string
  notes: string | null
  created_at: string
}

const RESET_DELAY    = 8000
const REFRESH_MS     = 30_000

const SERVICE_ICONS: Record<string, string> = {
  manicures: '◇', pedicures: '◇', combinations: '✦',
  acrylics: '◆', facials: '○', waxing: '◈',
}

function fmt12h(t: string | null) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (mins < 1) return 'just now'
  if (mins === 1) return '1 min ago'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  return hrs === 1 ? '1 hr ago' : `${hrs} hrs ago`
}

function todayDate() {
  return new Date().toISOString().split('T')[0]
}

// ── Queue panel ───────────────────────────────────────────────────────────────
function QueuePanel() {
  const [queue, setQueue]       = useState<QueueEntry[]>([])
  const [servingId, setServingId] = useState<string | null>(null)
  const [tick, setTick]         = useState(0)

  const fetchQueue = useCallback(async () => {
    try {
      const res  = await fetch('/api/checkin?status=waiting')
      const data = await res.json()
      setQueue(data.queue ?? [])
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    fetchQueue()
    const r = setInterval(fetchQueue, REFRESH_MS)
    const t = setInterval(() => setTick(n => n + 1), 30_000)
    return () => { clearInterval(r); clearInterval(t) }
  }, [fetchQueue])

  void tick

  async function handleServed(id: string) {
    if (servingId) return
    setServingId(id)
    try {
      await fetch('/api/checkin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setQueue(q => q.filter(e => e.id !== id))
    } catch { /* silent */ }
    finally { setServingId(null) }
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <p className="text-[10px] tracking-[0.3em] uppercase text-[#C6A15B]/40 font-sans">Queue</p>
        {queue.length > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-[#C6A15B]/10 border border-[#C6A15B]/25 text-[#C6A15B] text-xs font-sans">
            {queue.length}
          </span>
        )}
      </div>

      {queue.length === 0 ? (
        <div className="flex-1 flex items-center justify-center border border-white/6 rounded-sm">
          <p className="text-white/15 font-sans text-xs">No one waiting</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 overflow-y-auto flex-1">
          <AnimatePresence>
            {queue.map((entry, idx) => (
              <motion.div key={entry.id} layout
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30, transition: { duration: 0.15 } }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
                className="flex items-center justify-between gap-2 bg-white/4 border border-white/8 rounded-sm px-3 py-2.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-white/25 font-sans">{idx + 1}.</span>
                    <p className="font-serif text-sm text-white truncate">{entry.customer_name}</p>
                  </div>
                  <p className="text-[11px] font-sans text-[#C6A15B]/60 ml-3 truncate">{entry.service}</p>
                  <p className="text-[10px] font-sans text-white/18 ml-3">{timeAgo(entry.created_at)}</p>
                </div>
                <button onClick={() => handleServed(entry.id)} disabled={servingId === entry.id}
                  className="shrink-0 px-3 py-1.5 border border-[#C6A15B]/35 text-[#C6A15B] text-[10px] tracking-widest uppercase font-sans hover:bg-[#C6A15B]/10 active:scale-95 transition-all duration-150 rounded-sm disabled:opacity-40">
                  {servingId === entry.id ? '…' : '✓'}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

// ── Appointment card ──────────────────────────────────────────────────────────
function AppointmentCard({
  appt,
  onTap,
}: {
  appt: Appointment
  onTap: (appt: Appointment) => void
}) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onTap(appt)}
      disabled={appt.checked_in}
      className={`w-full text-left flex items-center gap-4 px-5 py-4 rounded-sm border transition-all duration-150
        ${appt.checked_in
          ? 'border-white/6 bg-white/2 opacity-35 cursor-not-allowed'
          : 'border-white/12 bg-white/5 hover:border-[#C6A15B]/50 hover:bg-[#C6A15B]/6 active:scale-[0.99]'
        }`}
    >
      {/* Time */}
      <span className="shrink-0 w-14 text-right font-sans text-xs text-[#C6A15B]/60">
        {fmt12h(appt.appointment_time)}
      </span>

      {/* Name + service */}
      <div className="min-w-0 flex-1">
        <p className={`font-serif text-lg leading-tight truncate ${appt.checked_in ? 'text-white/40 line-through' : 'text-white'}`}>
          {appt.customer_name}
        </p>
        <p className="text-xs font-sans text-[#C6A15B]/50 truncate">{appt.service}</p>
      </div>

      {/* Status */}
      <span className="shrink-0 text-[10px] tracking-widest uppercase font-sans">
        {appt.checked_in
          ? <span className="text-white/25">✓ Done</span>
          : <span className="text-[#C6A15B]/50">Tap →</span>
        }
      </span>
    </motion.button>
  )
}

// ── Main kiosk page ───────────────────────────────────────────────────────────
export default function CheckInPage() {
  const [step, setStep]           = useState<Step>('welcome')
  const [name, setName]           = useState('')
  const [service, setService]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [apptId, setApptId]       = useState<string | null>(null) // set when checking in via appointment

  // Appointments for today
  const [appointments, setAppointments] = useState<Appointment[]>([])

  const resetTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Fetch today's appointments
  const fetchAppts = useCallback(async () => {
    try {
      const res  = await fetch(`/api/appointments?date=${todayDate()}`)
      const data = await res.json()
      setAppointments(data.appointments ?? [])
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    fetchAppts()
    const r = setInterval(fetchAppts, REFRESH_MS)
    return () => clearInterval(r)
  }, [fetchAppts])

  // Auto-reset after confirm
  useEffect(() => {
    if (step === 'confirm') {
      resetTimer.current = setTimeout(() => resetKiosk(), RESET_DELAY)
    }
    return () => { if (resetTimer.current) clearTimeout(resetTimer.current) }
  }, [step])

  useEffect(() => {
    if (step === 'name') setTimeout(() => nameInputRef.current?.focus(), 300)
  }, [step])

  function resetKiosk() {
    setStep('welcome')
    setName(''); setService(''); setError(null)
    setSubmitting(false); setApptId(null)
  }

  // Tap an appointment card → skip name/service, go straight to confirm
  async function handleAppointmentTap(appt: Appointment) {
    setName(appt.customer_name)
    setService(appt.service)
    setApptId(appt.id)
    setError(null)
    setSubmitting(true)
    try {
      // Check in to queue
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: appt.customer_name, service: appt.service }),
      })
      if (!res.ok) throw new Error('Check-in failed')

      // Mark appointment as checked in
      await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appt.id }),
      })

      // Optimistic update so the card dims immediately
      setAppointments(prev =>
        prev.map(a => a.id === appt.id ? { ...a, checked_in: true } : a)
      )

      setStep('confirm')
    } catch {
      setError('Something went wrong. Please see a staff member.')
      setName(''); setService(''); setApptId(null)
    } finally {
      setSubmitting(false)
    }
  }

  // Walk-in service selection
  async function handleServiceSelect(serviceName: string) {
    setService(serviceName)
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: name, service: serviceName }),
      })
      if (!res.ok) throw new Error('Check-in failed')
      setStep('confirm')
    } catch {
      setError('Something went wrong. Please try again or see a staff member.')
    } finally {
      setSubmitting(false)
    }
  }

  const slideVariants = {
    enter:  { opacity: 0, y: 32 },
    center: { opacity: 1, y: 0 },
    exit:   { opacity: 0, y: -24 },
  }

  const upcomingAppts = appointments.filter(a => !a.checked_in)
  const doneAppts     = appointments.filter(a => a.checked_in)

  return (
    <div className="min-h-screen bg-[#1a0a2e] flex flex-col select-none">
      {/* Top accent */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C6A15B] to-transparent opacity-60 z-10" />

      {/* Wordmark */}
      <div className="fixed top-6 left-0 right-0 flex justify-center pointer-events-none z-10">
        <p className="font-serif text-sm tracking-[0.4em] uppercase text-[#C6A15B]/35">
          Royalty Nails &amp; Spa
        </p>
      </div>

      {/* ── Welcome screen ─────────────────────────────────────────────────── */}
      {step === 'welcome' && (
        <div className="flex-1 flex flex-col lg:flex-row pt-16">

          {/* Left — Appointments */}
          <div className="flex-1 flex flex-col px-8 py-10 border-b border-white/5 lg:border-b-0 lg:border-r overflow-hidden">
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="font-serif text-2xl text-white">Today&apos;s Appointments</h2>
              {upcomingAppts.length > 0 && (
                <p className="text-white/30 font-sans text-sm">Tap your name to check in</p>
              )}
            </div>

            {appointments.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <span className="text-[#C6A15B]/20 text-3xl">◇</span>
                <p className="text-white/20 font-sans text-sm">No appointments scheduled for today</p>
                <button
                  onClick={() => setStep('name')}
                  className="mt-4 px-10 py-4 bg-[#C6A15B] text-[#1a0a2e] font-serif text-xl hover:bg-[#d4af6a] active:scale-95 transition-all duration-150 rounded-sm"
                >
                  Walk-In Check In
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 overflow-y-auto flex-1 pb-4">
                {/* Upcoming */}
                {upcomingAppts.map(appt => (
                  <AppointmentCard key={appt.id} appt={appt} onTap={handleAppointmentTap} />
                ))}

                {/* Divider + done */}
                {doneAppts.length > 0 && (
                  <>
                    <div className="flex items-center gap-3 mt-2 mb-1">
                      <div className="flex-1 h-px bg-white/6" />
                      <span className="text-[10px] tracking-[0.2em] uppercase text-white/20 font-sans">Checked In</span>
                      <div className="flex-1 h-px bg-white/6" />
                    </div>
                    {doneAppts.map(appt => (
                      <AppointmentCard key={appt.id} appt={appt} onTap={() => {}} />
                    ))}
                  </>
                )}

                {/* Walk-in option */}
                <div className="mt-4 pt-4 border-t border-white/6 text-center">
                  <p className="text-white/25 font-sans text-sm mb-3">Not on the list?</p>
                  <button
                    onClick={() => setStep('name')}
                    className="px-8 py-3 border border-white/15 text-white/50 font-serif text-base hover:border-[#C6A15B]/40 hover:text-white/80 active:scale-95 transition-all duration-150 rounded-sm"
                  >
                    Walk-In Check In →
                  </button>
                </div>
              </div>
            )}

            {submitting && (
              <p className="text-center text-white/40 font-sans text-sm animate-pulse mt-4">
                Checking you in…
              </p>
            )}
            {error && (
              <p className="text-center text-red-400 font-sans text-sm mt-4 bg-red-400/10 border border-red-400/20 rounded-sm px-4 py-2">
                {error}
              </p>
            )}
          </div>

          {/* Right — Staff queue */}
          <div className="w-full lg:w-72 xl:w-80 flex flex-col px-5 py-10 min-h-[240px] lg:min-h-0">
            <QueuePanel />
          </div>

        </div>
      )}

      {/* ── Multi-step walk-in flow ─────────────────────────────────────────── */}
      {step !== 'welcome' && (
        <div className="flex-1 flex items-center justify-center px-6 py-24">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">

              {/* Name */}
              {step === 'name' && (
                <motion.div key="name" variants={slideVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="flex flex-col items-center text-center gap-10"
                >
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-[10px] tracking-[0.35em] uppercase text-[#C6A15B]/60 font-sans">Step 1 of 2</p>
                    <h2 className="font-serif text-4xl sm:text-5xl text-white">What&apos;s your name?</h2>
                  </div>
                  <div className="w-full flex flex-col gap-4">
                    <input ref={nameInputRef} type="text" value={name}
                      onChange={e => setName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && name.trim()) setStep('service') }}
                      placeholder="Your name…"
                      className="w-full bg-white/5 border border-white/20 rounded-sm px-6 py-5 text-white text-2xl font-serif text-center placeholder:text-white/20 focus:outline-none focus:border-[#C6A15B]/60 transition-colors duration-200"
                    />
                    <button onClick={() => { if (name.trim()) setStep('service') }} disabled={!name.trim()}
                      className="min-h-[72px] w-full bg-[#C6A15B] text-[#1a0a2e] font-serif text-xl tracking-wide hover:bg-[#d4af6a] active:scale-[0.99] transition-all duration-150 rounded-sm disabled:opacity-30 disabled:cursor-not-allowed">
                      Next →
                    </button>
                  </div>
                  <button onClick={resetKiosk} className="text-white/25 font-sans text-sm hover:text-white/50 transition-colors duration-200">
                    ← Back
                  </button>
                </motion.div>
              )}

              {/* Service */}
              {step === 'service' && (
                <motion.div key="service" variants={slideVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="flex flex-col items-center gap-8"
                >
                  <div className="text-center flex flex-col gap-3">
                    <p className="text-[10px] tracking-[0.35em] uppercase text-[#C6A15B]/60 font-sans">Step 2 of 2</p>
                    <h2 className="font-serif text-4xl sm:text-5xl text-white">
                      What brings you in,{' '}
                      <span className="text-[#C6A15B]">{name}</span>?
                    </h2>
                    <p className="text-white/40 font-sans text-base">Select a service category</p>
                  </div>
                  {error && (
                    <p className="text-red-400 font-sans text-sm text-center bg-red-400/10 border border-red-400/20 rounded-sm px-6 py-3">{error}</p>
                  )}
                  <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {serviceCategories.map(cat => (
                      <button key={cat.id} onClick={() => handleServiceSelect(cat.name)} disabled={submitting}
                        className="min-h-[90px] flex flex-col items-center justify-center gap-2 bg-white/5 border border-white/15 rounded-sm px-4 py-5 hover:border-[#C6A15B]/50 hover:bg-[#C6A15B]/5 active:scale-95 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed group">
                        <span className="text-[#C6A15B]/60 group-hover:text-[#C6A15B] text-xl transition-colors duration-150">
                          {SERVICE_ICONS[cat.id] ?? '◇'}
                        </span>
                        <span className="font-serif text-white text-base leading-tight text-center">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                  {submitting && <p className="text-white/40 font-sans text-sm animate-pulse">Checking you in…</p>}
                  <button onClick={() => setStep('name')} disabled={submitting}
                    className="text-white/25 font-sans text-sm hover:text-white/50 transition-colors duration-200 disabled:pointer-events-none">
                    ← Back
                  </button>
                </motion.div>
              )}

              {/* Confirm */}
              {step === 'confirm' && (
                <motion.div key="confirm" variants={slideVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="flex flex-col items-center text-center gap-10"
                >
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-20 h-20 rounded-full border border-[#C6A15B]/40 flex items-center justify-center">
                      <span className="text-[#C6A15B] text-3xl">✓</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      <h2 className="font-serif text-4xl sm:text-5xl text-white">You&apos;re checked in!</h2>
                      <p className="text-white/50 font-sans text-lg max-w-sm mx-auto leading-relaxed">
                        A staff member will be with you shortly,{' '}
                        <span className="text-[#C6A15B]">{name}</span>. Please have a seat.
                      </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-sm px-8 py-4">
                      <p className="text-[10px] tracking-[0.25em] uppercase text-white/30 font-sans mb-1">Service</p>
                      <p className="font-serif text-xl text-[#C6A15B]">{service}</p>
                    </div>
                  </div>
                  <button onClick={resetKiosk} className="text-white/20 font-sans text-sm hover:text-white/40 transition-colors duration-200">
                    Done — Return to Start
                  </button>
                  <p className="text-white/15 font-sans text-xs">Screen resets automatically in a moment</p>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Bottom accent */}
      <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C6A15B]/30 to-transparent" />
    </div>
  )
}
