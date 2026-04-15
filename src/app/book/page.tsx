'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { serviceCategories } from '@/lib/content'

declare global {
  interface Window {
    Square?: {
      payments: (appId: string, locationId: string) => Promise<{
        card: (options?: object) => Promise<{
          attach: (selector: string) => Promise<void>
          tokenize: () => Promise<{ status: string; token?: string; errors?: Array<{ message: string }> }>
          destroy: () => Promise<void>
        }>
      }>
    }
  }
}

const APP_ID      = process.env.NEXT_PUBLIC_SQUARE_APP_ID!
const LOCATION_ID = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!
const SQ_ENV      = process.env.NEXT_PUBLIC_SQUARE_ENV ?? 'sandbox'
const SDK_URL     = SQ_ENV === 'production'
  ? 'https://web.squarecdn.com/v1/square.js'
  : 'https://sandbox.web.squarecdn.com/v1/square.js'

const DEPOSIT = Number(process.env.NEXT_PUBLIC_DEPOSIT_AMOUNT ?? '25')

function todayDate() {
  return new Date().toISOString().split('T')[0]
}

function timeSlots(): string[] {
  const slots: string[] = []
  for (let h = 10; h <= 18; h++) {
    for (const m of [0, 30]) {
      if (h === 18 && m === 30) break
      const label = `${h % 12 || 12}:${m === 0 ? '00' : '30'} ${h < 12 ? 'AM' : 'PM'}`
      const value = `${h.toString().padStart(2, '0')}:${m === 0 ? '00' : '30'}`
      slots.push(`${value}|${label}`)
    }
  }
  return slots
}

function isSunday(dateStr: string) {
  const [y, mo, d] = dateStr.split('-').map(Number)
  return new Date(y, mo - 1, d).getDay() === 0
}

export default function BookPage() {
  const router = useRouter()

  // Form state
  const [service, setService]   = useState('')
  const [date, setDate]         = useState(todayDate())
  const [time, setTime]         = useState('')
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [phone, setPhone]       = useState('')
  const [notes, setNotes]       = useState('')

  // Square state
  const [sqReady, setSqReady]   = useState(false)
  const [sqError, setSqError]   = useState<string | null>(null)
  const cardRef                  = useRef<Awaited<ReturnType<Awaited<ReturnType<NonNullable<Window['Square']>['payments']>>['card']>> | null>(null)

  // Submission state
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState(false)

  // Load Square SDK
  useEffect(() => {
    if (document.getElementById('square-sdk')) return
    const script = document.createElement('script')
    script.id  = 'square-sdk'
    script.src = SDK_URL
    script.onload = () => initSquare()
    script.onerror = () => setSqError('Payment form failed to load. Please refresh.')
    document.head.appendChild(script)
  }, [])

  async function initSquare() {
    try {
      if (!window.Square) { setSqError('Payment system unavailable.'); return }
      const payments = await window.Square.payments(APP_ID, LOCATION_ID)
      const card = await payments.card({
        style: {
          '.input-container':          { borderColor: '#2a2a2a', borderRadius: '2px' },
          '.input-container.is-focus': { borderColor: '#b8972a' },
          'input':                     { color: '#f5f0e8', backgroundColor: '#111' },
          '.input-container.is-error': { borderColor: '#f87171' },
        },
      })
      await card.attach('#square-card-container')
      cardRef.current = card
      setSqReady(true)
    } catch (e) {
      setSqError('Could not load payment form. Please refresh.')
      console.error(e)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!cardRef.current) return
    setError(null)
    setLoading(true)

    try {
      const result = await cardRef.current.tokenize()
      if (result.status !== 'OK' || !result.token) {
        setError(result.errors?.[0]?.message ?? 'Card error — please check your details.')
        setLoading(false)
        return
      }

      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId:    result.token,
          customerName: name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim(),
          service,
          date,
          time:  time || undefined,
          notes: notes.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Booking failed.')
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full bg-[#111] border border-[#2a2a2a] rounded-sm px-4 py-3 text-offwhite text-sm font-sans placeholder:text-offwhite/25 focus:outline-none focus:border-gold/50 transition-colors duration-200'
  const slots = timeSlots()

  if (success) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full glass-card border border-gold/25 rounded-sm p-10 text-center flex flex-col gap-6"
        >
          <span className="text-gold/60 text-4xl font-serif">✓</span>
          <div>
            <h1 className="font-serif text-2xl text-offwhite mb-2">You&apos;re Booked</h1>
            <p className="text-sm font-sans text-offwhite/50">
              Your ${DEPOSIT} deposit has been charged and your appointment is confirmed.
              A confirmation email is on its way to {email}.
            </p>
          </div>
          <div className="border-t border-border/40 pt-4 text-xs font-sans text-offwhite/30 flex flex-col gap-1">
            <p>{name} · {service}</p>
            <p>{date}{time && ` at ${slots.find(s => s.startsWith(time))?.split('|')[1]}`}</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-xs tracking-widest uppercase text-gold/50 hover:text-gold font-sans transition-colors duration-200"
          >
            ← Back to Home
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-charcoal px-6 py-16">
      <div className="max-w-xl mx-auto flex flex-col gap-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => router.push('/')}
            className="text-xs tracking-widest uppercase text-offwhite/30 hover:text-offwhite/60 font-sans transition-colors duration-200 mb-8 block"
          >
            ← Royalty Nails & Spa
          </button>
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 font-sans mb-2">Online Booking</p>
          <h1 className="font-serif text-4xl text-offwhite">Book Your Appointment</h1>
          <p className="text-sm font-sans text-offwhite/40 mt-3">
            Secure your spot with a ${DEPOSIT} deposit — applied to your service total.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="flex flex-col gap-8"
        >

          {/* Service + Date + Time */}
          <div className="glass-card border border-border rounded-sm p-6 flex flex-col gap-4">
            <p className="text-[10px] tracking-widest uppercase text-offwhite/30 font-sans">Appointment</p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">
                Service <span className="text-gold">*</span>
              </label>
              <select value={service} onChange={e => setService(e.target.value)} required
                className={`${inputClass} appearance-none cursor-pointer`}>
                <option value="">Select a service…</option>
                {serviceCategories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">Date <span className="text-gold">*</span></label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  min={todayDate()} required className={inputClass} />
                {isSunday(date) && (
                  <p className="text-[10px] font-sans text-gold/60">Sunday is by appointment — we&apos;ll confirm your time.</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">Time</label>
                <select value={time} onChange={e => setTime(e.target.value)}
                  className={`${inputClass} appearance-none cursor-pointer`}>
                  <option value="">Flexible</option>
                  {slots.map(s => {
                    const [val, label] = s.split('|')
                    return <option key={val} value={val}>{label}</option>
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="glass-card border border-border rounded-sm p-6 flex flex-col gap-4">
            <p className="text-[10px] tracking-widest uppercase text-offwhite/30 font-sans">Your Info</p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">Full Name <span className="text-gold">*</span></label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="First and last name" required className={inputClass} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">Email <span className="text-gold">*</span></label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@email.com" required className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">Phone <span className="text-gold">*</span></label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="(214) 555-0100" required className={inputClass} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">Notes</label>
              <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Gel upgrade, nail art, allergies…" className={inputClass} />
            </div>
          </div>

          {/* Payment */}
          <div className="glass-card border border-border rounded-sm p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] tracking-widest uppercase text-offwhite/30 font-sans">Deposit</p>
              <p className="font-serif text-gold text-lg">${DEPOSIT}.00</p>
            </div>
            <p className="text-xs font-sans text-offwhite/35">
              Your ${DEPOSIT} deposit is applied toward your service total. Fully refundable with 24-hour notice.
            </p>

            {sqError ? (
              <p className="text-sm font-sans text-red-400">{sqError}</p>
            ) : (
              <div className="flex flex-col gap-3">
                <div
                  id="square-card-container"
                  className={`min-h-[90px] transition-opacity duration-300 ${sqReady ? 'opacity-100' : 'opacity-0'}`}
                />
                {!sqReady && (
                  <div className="h-[90px] bg-border/10 rounded-sm animate-pulse" />
                )}
              </div>
            )}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-sm font-sans text-red-400 text-center"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !sqReady || !!sqError}
            className="w-full py-4 bg-gold text-charcoal text-sm tracking-widest uppercase font-sans hover:bg-gold-light transition-colors duration-200 disabled:opacity-40 rounded-sm"
          >
            {loading ? 'Processing…' : `Pay $${DEPOSIT} Deposit & Book`}
          </button>

          <p className="text-[10px] font-sans text-offwhite/20 text-center">
            Secured by Square · Your card info never touches our servers
          </p>
        </motion.form>
      </div>
    </div>
  )
}
