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
const DEPOSIT     = Number(process.env.NEXT_PUBLIC_DEPOSIT_AMOUNT ?? '25')

type Step = 1 | 2 | 3 | 4

const STEPS = ['Service', 'Schedule', 'Details', 'Payment']

function todayDate() {
  return new Date().toISOString().split('T')[0]
}

function timeSlots() {
  const slots: { value: string; label: string }[] = []
  for (let h = 10; h <= 18; h++) {
    for (const m of [0, 30]) {
      if (h === 18 && m === 30) break
      slots.push({
        value: `${h.toString().padStart(2, '0')}:${m === 0 ? '00' : '30'}`,
        label: `${h % 12 || 12}:${m === 0 ? '00' : '30'} ${h < 12 ? 'AM' : 'PM'}`,
      })
    }
  }
  return slots
}

function fmtDate(d: string) {
  const [y, mo, day] = d.split('-').map(Number)
  return new Date(y, mo - 1, day).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
}

function isSunday(d: string) {
  const [y, mo, day] = d.split('-').map(Number)
  return new Date(y, mo - 1, day).getDay() === 0
}

const categoryFrom: Record<string, number> = {
  manicures: 22, pedicures: 25, combinations: 110,
  acrylics: 40, facials: 55, waxing: 10,
}

type AddOnSuggestion = { name: string; orig: number; bundle: number; priceNote?: string; description: string }

const ADD_ON_SUGGESTIONS: Record<string, AddOnSuggestion[]> = {
  manicures: [
    { name: 'Gel Polish Upgrade', orig: 20, bundle: 16, description: 'Long-lasting gel finish' },
    { name: 'Paraffin Wax Dip',   orig: 15, bundle: 12, description: 'Deep moisturizing treatment' },
    { name: 'French Tips',        orig: 10, bundle: 8,  description: 'Classic or ombré French tips' },
    { name: 'Nail Art',           orig: 5,  bundle: 4,  priceNote: '/nail', description: 'Accent art (min. 2 nails)' },
  ],
  pedicures: [
    { name: 'Paraffin Wax Dip',   orig: 15, bundle: 12, description: 'Deep moisturizing for feet' },
    { name: 'Callus Treatment',   orig: 15, bundle: 12, description: 'Intensive callus removal' },
    { name: 'Hot Stone Add-on',   orig: 12, bundle: 10, description: 'Hot stone massage therapy' },
    { name: 'Gel Polish Upgrade', orig: 20, bundle: 16, description: 'Long-lasting gel finish' },
  ],
  combinations: [
    { name: 'Gel Polish Upgrade', orig: 20, bundle: 16, description: 'Upgrade both hands & feet to gel' },
    { name: 'Nail Art',           orig: 5,  bundle: 4,  priceNote: '/nail', description: 'Accent art for hands or feet' },
    { name: 'Hot Stone Add-on',   orig: 12, bundle: 10, description: 'Extended hot stone time' },
  ],
  acrylics: [
    { name: 'Nail Art',           orig: 5,  bundle: 4,  priceNote: '/nail', description: 'Accent nail art (min. 2 nails)' },
    { name: 'French Tips',        orig: 10, bundle: 8,  description: 'Classic or ombré French tips' },
    { name: 'Hot Stone Add-on',   orig: 12, bundle: 10, description: 'Relaxing hand massage add-on' },
  ],
  facials: [
    { name: 'Hot Stone Add-on',   orig: 12, bundle: 10, description: 'Hot stone face & neck massage' },
  ],
  waxing: [],
}

function getCategoryId(serviceName: string) {
  for (const cat of serviceCategories) {
    if (cat.packages.some(p => p.name === serviceName)) return cat.id
  }
  return null
}

// When a mani is selected suggest a pedi bundle and vice versa
const BUMP: Record<string, { label: string; addService: string; addPrice: number; bundlePrice: number }> = {
  manicures: {
    label:      'Add a Pedicure',
    addService: 'Regular Pedicure',
    addPrice:   25,
    bundlePrice: 15,
  },
  pedicures: {
    label:      'Add a Manicure',
    addService: 'Regular Manicure',
    addPrice:   22,
    bundlePrice: 12,
  },
}

export default function BookPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)

  // Step 1 — service
  const [expandedCat, setExpandedCat] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<{ name: string; price: number } | null>(null)

  // Step 2 — schedule
  const [date, setDate] = useState(todayDate())
  const [time, setTime] = useState('')

  // Step 3 — details
  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')

  // Add-ons
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set())
  const [bumpAccepted, setBumpAccepted] = useState(false)

  // Pre-select service from URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const svc = params.get('service')
    if (!svc) return
    const decoded = decodeURIComponent(svc)
    for (const cat of serviceCategories) {
      const pkg = cat.packages.find(p => p.name === decoded)
      if (pkg) {
        setSelectedService({ name: pkg.name, price: pkg.price })
        setStep(2)
        break
      }
    }
  }, [])

  // Step 4 — Square
  const [sqReady, setSqReady] = useState(false)
  const [sqError, setSqError] = useState<string | null>(null)
  const cardRef = useRef<Awaited<ReturnType<Awaited<ReturnType<NonNullable<Window['Square']>['payments']>>['card']>> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Load Square SDK when entering step 4
  useEffect(() => {
    if (step !== 4) return
    if (cardRef.current) return
    const existing = document.getElementById('square-sdk')
    if (existing) { initSquare(); return }
    const script    = document.createElement('script')
    script.id       = 'square-sdk'
    script.src      = SDK_URL
    script.onload   = () => initSquare()
    script.onerror  = () => setSqError('Payment form failed to load — please refresh.')
    document.head.appendChild(script)
  }, [step])

  async function initSquare() {
    try {
      if (!window.Square) { setSqError('Payment system unavailable.'); return }
      const payments = await window.Square.payments(APP_ID, LOCATION_ID)
      const card = await payments.card({
        style: {
          '.input-container':          { borderColor: '#d1c9b8', borderRadius: '4px' },
          '.input-container.is-focus': { borderColor: '#b8972a' },
          'input':                     { color: '#111111', fontFamily: 'sans-serif', fontSize: '15px' },
          '.input-container.is-error': { borderColor: '#dc2626' },
          '.message-text':             { color: '#dc2626' },
        },
      })
      await card.attach('#sq-card')
      cardRef.current = card
      setSqReady(true)
    } catch (e) {
      setSqError('Could not load payment form — please refresh.')
      console.error(e)
    }
  }

  async function handlePay() {
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
          sourceId:      result.token,
          customerName:  name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim(),
          service:       selectedService!.name,
          date,
          time:          time || undefined,
          notes: [
            notes.trim(),
            (() => {
              const catId = getCategoryId(selectedService!.name)
              const bump  = catId ? BUMP[catId] : null
              return bumpAccepted && bump
                ? `Bundle offer: ${bump.addService} added at $${bump.bundlePrice} (save $10)`
                : ''
            })(),
            selectedAddOns.size > 0
              ? `Add-ons: ${Array.from(selectedAddOns).map(n => {
                  const catId = getCategoryId(selectedService!.name)
                  const a = catId ? ADD_ON_SUGGESTIONS[catId]?.find(x => x.name === n) : null
                  return a ? `${n} ($${a.bundle}${a.priceNote ?? ''} bundle)` : n
                }).join(', ')}`
              : '',
          ].filter(Boolean).join(' | ') || undefined,
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

  const slots = timeSlots()
  const inputClass = 'w-full bg-[#111] border border-[#2a2a2a] rounded-sm px-4 py-3 text-offwhite text-sm font-sans placeholder:text-offwhite/25 focus:outline-none focus:border-gold/50 transition-colors duration-200'

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center flex flex-col items-center gap-8"
        >
          <div className="w-20 h-20 rounded-full border border-gold/30 flex items-center justify-center">
            <span className="font-serif text-gold text-3xl">✓</span>
          </div>
          <div>
            <h1 className="font-serif text-3xl text-offwhite mb-3">You&apos;re Booked</h1>
            <p className="text-sm font-sans text-offwhite/50 leading-relaxed">
              Your ${DEPOSIT} deposit has been charged and your appointment is confirmed.
              A confirmation email with your calendar invite is on its way to{' '}
              <span className="text-offwhite/70">{email}</span>.
            </p>
          </div>
          <div className="w-full border border-border rounded-sm divide-y divide-border/40 text-left">
            <div className="px-5 py-3 flex justify-between text-sm font-sans">
              <span className="text-offwhite/40">Service</span>
              <span className="text-offwhite">{selectedService?.name}</span>
            </div>
            <div className="px-5 py-3 flex justify-between text-sm font-sans">
              <span className="text-offwhite/40">Date</span>
              <span className="text-offwhite">{fmtDate(date)}</span>
            </div>
            {time && (
              <div className="px-5 py-3 flex justify-between text-sm font-sans">
                <span className="text-offwhite/40">Time</span>
                <span className="text-offwhite">{slots.find(s => s.value === time)?.label}</span>
              </div>
            )}
            <div className="px-5 py-4 flex justify-between items-center bg-gold/5">
              <span className="text-offwhite/40 text-sm font-sans">Deposit Paid</span>
              <span className="text-gold font-serif text-xl">${DEPOSIT}.00</span>
            </div>
          </div>
          <button onClick={() => router.push('/')}
            className="text-xs tracking-widest uppercase text-offwhite/30 hover:text-offwhite/60 font-sans transition-colors duration-200">
            ← Back to Home
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-charcoal">

      {/* Top bar */}
      <div className="border-b border-border/30 px-6 py-5 flex items-center justify-between">
        <button onClick={() => router.push('/')}
          className="text-xs tracking-widest uppercase text-offwhite/30 hover:text-offwhite/60 font-sans transition-colors duration-200">
          ← Royalty Nails & Spa
        </button>
        <p className="font-serif text-offwhite/60 text-sm hidden sm:block">Book an Appointment</p>
        <div className="w-24" />
      </div>

      {/* Progress */}
      <div className="border-b border-border/20 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-0">
          {STEPS.map((label, i) => {
            const n      = (i + 1) as Step
            const active = step === n
            const done   = step > n
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-sans transition-colors duration-300 ${
                    done ? 'bg-gold text-charcoal' :
                    active ? 'border border-gold text-gold' :
                    'border border-border/40 text-offwhite/20'
                  }`}>
                    {done ? '✓' : n}
                  </div>
                  <span className={`text-[10px] tracking-widest uppercase font-sans transition-colors duration-300 hidden sm:block ${
                    active ? 'text-offwhite/70' : done ? 'text-gold/60' : 'text-offwhite/20'
                  }`}>{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-3 transition-colors duration-300 ${done ? 'bg-gold/40' : 'bg-border/30'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">

          {/* ── STEP 1 — Service ─────────────────────────────────────────────── */}
          {step === 1 && (
            <motion.div key="step1"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col gap-6"
            >
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 font-sans mb-2">Step 1 of 4</p>
                <h2 className="font-serif text-3xl text-offwhite">Choose Your Service</h2>
              </div>

              <div className="flex flex-col gap-3">
                {serviceCategories.map(cat => {
                  const isOpen      = expandedCat === cat.id
                  const hasSelected = selectedService && cat.packages.some(p => p.name === selectedService.name)
                  return (
                    <div key={cat.id} className={`border rounded-sm overflow-hidden transition-colors duration-200 ${
                      hasSelected ? 'border-gold/40' : isOpen ? 'border-border' : 'border-border/50'
                    }`}>
                      <button
                        onClick={() => setExpandedCat(isOpen ? null : cat.id)}
                        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left bg-charcoal hover:bg-[#161616] transition-colors duration-150"
                      >
                        <div>
                          <p className="font-serif text-base text-offwhite">{cat.name}</p>
                          <p className="text-[11px] font-sans text-offwhite/35 mt-0.5">
                            {hasSelected
                              ? <span className="text-gold/70">{selectedService!.name} — ${selectedService!.price}</span>
                              : `From $${categoryFrom[cat.id]}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {hasSelected && <span className="text-[9px] tracking-widest uppercase text-gold font-sans">Selected</span>}
                          <span className={`text-offwhite/30 text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                        </div>
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden border-t border-border/30"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border/20">
                              {cat.packages.map(pkg => {
                                const sel = selectedService?.name === pkg.name
                                return (
                                  <button
                                    key={pkg.name}
                                    onClick={() => { setSelectedService({ name: pkg.name, price: pkg.price }); setExpandedCat(null) }}
                                    className={`text-left px-5 py-4 flex flex-col gap-1.5 transition-colors duration-150 ${
                                      sel ? 'bg-gold/10' : 'bg-charcoal hover:bg-[#161616]'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <p className="font-serif text-sm text-offwhite leading-snug">{pkg.name}</p>
                                      <div className="text-right shrink-0">
                                        <p className="font-serif text-base text-gold">${pkg.price}</p>
                                        {pkg.badge && (
                                          <span className="text-[8px] tracking-widest uppercase text-gold/50 font-sans">{pkg.badge}</span>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-[11px] font-sans text-offwhite/35 leading-relaxed">{pkg.description}</p>
                                    {sel && <p className="text-[10px] tracking-widest uppercase text-gold font-sans mt-1">✓ Selected</p>}
                                  </button>
                                )
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>

              {/* Bundle bump offer */}
              <AnimatePresence>
                {selectedService && (() => {
                  const catId = getCategoryId(selectedService.name)
                  const bump  = catId ? BUMP[catId] : null
                  if (!bump) return null
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.25 }}
                      className={`rounded-sm border p-4 flex flex-col gap-3 ${bumpAccepted ? 'border-gold/40 bg-gold/5' : 'border-gold/20 bg-[#111]'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[9px] tracking-widest uppercase text-gold/60 font-sans mb-1">Bundle & Save $10</p>
                          <p className="font-serif text-base text-offwhite">
                            {bump.label} to this appointment
                          </p>
                          <p className="text-xs font-sans text-offwhite/40 mt-0.5">
                            {bump.addService} — <span className="line-through">${bump.addPrice}</span>{' '}
                            <span className="text-gold">${bump.bundlePrice}</span> when booked together
                          </p>
                        </div>
                        {bumpAccepted
                          ? <span className="text-[9px] tracking-widest uppercase text-gold font-sans shrink-0 mt-1">✓ Added</span>
                          : <button
                              onClick={() => setBumpAccepted(true)}
                              className="shrink-0 px-4 py-2 bg-gold text-charcoal text-[10px] tracking-widest uppercase font-sans rounded-sm hover:bg-gold-light transition-colors duration-150"
                            >
                              Add it
                            </button>
                        }
                      </div>
                      {bumpAccepted && (
                        <p className="text-[10px] font-sans text-offwhite/30">
                          Mention this offer at check-in — technician will honor the ${bump.bundlePrice} price.
                        </p>
                      )}
                    </motion.div>
                  )
                })()}
              </AnimatePresence>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedService}
                  className="px-8 py-3.5 bg-gold text-charcoal text-xs tracking-widest uppercase font-sans hover:bg-gold-light transition-colors duration-200 disabled:opacity-30 rounded-sm"
                >
                  Next — Schedule →
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2 — Schedule ────────────────────────────────────────────── */}
          {step === 2 && (
            <motion.div key="step2"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col gap-6"
            >
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 font-sans mb-2">Step 2 of 4</p>
                <h2 className="font-serif text-3xl text-offwhite">Pick a Date & Time</h2>
                <p className="text-sm font-sans text-offwhite/40 mt-2">{selectedService?.name}</p>
              </div>

              <div className="glass-card border border-border rounded-sm p-6 flex flex-col gap-4">
                <p className="text-[10px] tracking-widest uppercase text-offwhite/30 font-sans">Date</p>
                <input
                  type="date" value={date}
                  onChange={e => setDate(e.target.value)}
                  min={todayDate()}
                  className={inputClass}
                />
                {isSunday(date) && (
                  <p className="text-xs font-sans text-gold/60">
                    Sunday is by appointment — we&apos;ll confirm your time after booking.
                  </p>
                )}
                {date && !isSunday(date) && (
                  <p className="text-xs font-sans text-offwhite/30">{fmtDate(date)}</p>
                )}
              </div>

              <div className="glass-card border border-border rounded-sm p-6 flex flex-col gap-4">
                <p className="text-[10px] tracking-widest uppercase text-offwhite/30 font-sans">Preferred Time</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => setTime('')}
                    className={`py-2.5 text-xs font-sans rounded-sm border transition-colors duration-150 ${
                      time === '' ? 'bg-gold text-charcoal border-gold' : 'border-border/50 text-offwhite/40 hover:border-offwhite/30 hover:text-offwhite/70'
                    }`}
                  >Flexible</button>
                  {slots.map(s => (
                    <button key={s.value} onClick={() => setTime(s.value)}
                      className={`py-2.5 text-xs font-sans rounded-sm border transition-colors duration-150 ${
                        time === s.value ? 'bg-gold text-charcoal border-gold' : 'border-border/50 text-offwhite/40 hover:border-offwhite/30 hover:text-offwhite/70'
                      }`}
                    >{s.label}</button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setStep(1)}
                  className="text-xs tracking-widest uppercase text-offwhite/30 hover:text-offwhite/60 font-sans transition-colors duration-200">
                  ← Back
                </button>
                <button onClick={() => setStep(3)} disabled={!date}
                  className="px-8 py-3.5 bg-gold text-charcoal text-xs tracking-widest uppercase font-sans hover:bg-gold-light transition-colors duration-200 disabled:opacity-30 rounded-sm">
                  Next — Your Details →
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3 — Details ─────────────────────────────────────────────── */}
          {step === 3 && (
            <motion.div key="step3"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col gap-6"
            >
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 font-sans mb-2">Step 3 of 4</p>
                <h2 className="font-serif text-3xl text-offwhite">Your Details</h2>
              </div>

              <div className="glass-card border border-border rounded-sm p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">Full Name <span className="text-gold">*</span></label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="First and last name" required className={inputClass} />
                </div>
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
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">Special Requests</label>
                  <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Gel upgrade, nail art, allergies…" className={inputClass} />
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setStep(2)}
                  className="text-xs tracking-widest uppercase text-offwhite/30 hover:text-offwhite/60 font-sans transition-colors duration-200">
                  ← Back
                </button>
                <button onClick={() => setStep(4)}
                  disabled={!name.trim() || !email.trim() || !phone.trim()}
                  className="px-8 py-3.5 bg-gold text-charcoal text-xs tracking-widest uppercase font-sans hover:bg-gold-light transition-colors duration-200 disabled:opacity-30 rounded-sm">
                  Next — Payment →
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 4 — Payment ─────────────────────────────────────────────── */}
          {step === 4 && (
            <motion.div key="step4"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col gap-8"
            >
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 font-sans mb-2">Step 4 of 4</p>
                <h2 className="font-serif text-3xl text-offwhite">Confirm & Pay</h2>
                <p className="text-sm font-sans text-offwhite/40 mt-2">Review your booking and enter your card to secure it.</p>
              </div>

              {/* Summary */}
              <div className="border border-gold/20 rounded-sm divide-y divide-border/30">
                <div className="px-5 py-3 flex justify-between text-sm font-sans">
                  <span className="text-offwhite/40">Service</span>
                  <span className="text-offwhite font-serif">{selectedService?.name}</span>
                </div>
                <div className="px-5 py-3 flex justify-between text-sm font-sans">
                  <span className="text-offwhite/40">Date</span>
                  <span className="text-offwhite">{fmtDate(date)}</span>
                </div>
                <div className="px-5 py-3 flex justify-between text-sm font-sans">
                  <span className="text-offwhite/40">Time</span>
                  <span className="text-offwhite">{time ? slots.find(s => s.value === time)?.label : 'Flexible'}</span>
                </div>
                <div className="px-5 py-3 flex justify-between text-sm font-sans">
                  <span className="text-offwhite/40">Name</span>
                  <span className="text-offwhite">{name}</span>
                </div>
                <div className="px-5 py-4 flex justify-between items-center bg-gold/5">
                  <div>
                    <p className="text-sm font-sans text-offwhite/60">Deposit Due Today</p>
                    <p className="text-[11px] font-sans text-offwhite/30 mt-0.5">Applied to your service total</p>
                  </div>
                  <p className="font-serif text-2xl text-gold">${DEPOSIT}.00</p>
                </div>
              </div>

              {/* Add-ons upsell */}
              {(() => {
                const catId = getCategoryId(selectedService?.name ?? '')
                const suggestions = catId ? (ADD_ON_SUGGESTIONS[catId] ?? []) : []
                if (!suggestions.length) return null
                return (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] tracking-widest uppercase text-offwhite/40 font-sans">Enhance Your Visit</p>
                      <span className="text-[9px] tracking-widest uppercase text-gold/60 font-sans">Bundle & Save</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {suggestions.map(addon => {
                        const sel = selectedAddOns.has(addon.name)
                        return (
                          <button
                            key={addon.name}
                            onClick={() => {
                              const next = new Set(selectedAddOns)
                              sel ? next.delete(addon.name) : next.add(addon.name)
                              setSelectedAddOns(next)
                            }}
                            className={`text-left p-4 rounded-sm border transition-colors duration-150 flex flex-col gap-1 ${
                              sel ? 'border-gold/50 bg-gold/5' : 'border-border/40 bg-charcoal hover:border-border/70'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-sans text-sm text-offwhite leading-snug">{addon.name}</p>
                              <div className="text-right shrink-0">
                                <p className="text-[10px] font-sans text-offwhite/25 line-through">${addon.orig}{addon.priceNote}</p>
                                <p className="font-serif text-base text-gold">${addon.bundle}{addon.priceNote}</p>
                              </div>
                            </div>
                            <p className="text-[11px] font-sans text-offwhite/35">{addon.description}</p>
                            {sel && <p className="text-[9px] tracking-widest uppercase text-gold font-sans mt-1">✓ Added</p>}
                          </button>
                        )
                      })}
                    </div>
                    <p className="text-[10px] font-sans text-offwhite/25">Add-on prices settled at the salon — deposit covers your appointment only.</p>
                  </div>
                )
              })()}

              {/* Square card form */}
              <div className="flex flex-col gap-3">
                <p className="text-[10px] tracking-widest uppercase text-offwhite/40 font-sans">Card Details</p>
                <div className="bg-white rounded-md p-4 min-h-[120px]">
                  {sqError ? (
                    <p className="text-sm font-sans text-red-600 pt-2">{sqError}</p>
                  ) : (
                    <>
                      <div id="sq-card" className={`transition-opacity duration-300 ${sqReady ? 'opacity-100' : 'opacity-0'}`} />
                      {!sqReady && <div className="h-[80px] bg-gray-100 rounded animate-pulse" />}
                    </>
                  )}
                </div>
                <p className="text-[10px] font-sans text-offwhite/25 text-right">Secured by Square</p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-sm font-sans text-red-400 text-center -mt-4">
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="flex flex-col gap-4 pb-8">
                <button
                  onClick={handlePay}
                  disabled={loading || !sqReady || !!sqError}
                  className="w-full py-4 bg-gold text-charcoal text-sm tracking-widest uppercase font-sans hover:bg-gold-light transition-colors duration-200 disabled:opacity-40 rounded-sm"
                >
                  {loading ? 'Processing…' : `Pay $${DEPOSIT} Deposit & Confirm`}
                </button>
                <button onClick={() => setStep(3)}
                  className="text-xs tracking-widest uppercase text-offwhite/30 hover:text-offwhite/60 font-sans transition-colors duration-200 text-center">
                  ← Back
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
