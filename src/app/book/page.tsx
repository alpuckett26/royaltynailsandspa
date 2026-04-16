'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { serviceCategories } from '@/lib/content'

const DEPOSIT = Number(process.env.NEXT_PUBLIC_DEPOSIT_AMOUNT ?? '25')

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

  // Step 4 — payment
  const [paying, setPaying] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  async function handlePay() {
    setError(null)
    setPaying(true)
    try {
      const res = await fetch('/api/book/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName:  name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim(),
          service:       selectedService!.name,
          date,
          time:          time || undefined,
          notes:         notes.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not create payment link.')
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setPaying(false)
    }
  }

  const slots = timeSlots()
  const inputClass = 'w-full bg-[#111] border border-[#2a2a2a] rounded-sm px-4 py-3 text-offwhite text-sm font-sans placeholder:text-offwhite/25 focus:outline-none focus:border-gold/50 transition-colors duration-200'

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
            const n = (i + 1) as Step
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
                  type="date"
                  value={date}
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
                  >
                    Flexible
                  </button>
                  {slots.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setTime(s.value)}
                      className={`py-2.5 text-xs font-sans rounded-sm border transition-colors duration-150 ${
                        time === s.value ? 'bg-gold text-charcoal border-gold' : 'border-border/50 text-offwhite/40 hover:border-offwhite/30 hover:text-offwhite/70'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setStep(1)}
                  className="text-xs tracking-widest uppercase text-offwhite/30 hover:text-offwhite/60 font-sans transition-colors duration-200">
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!date}
                  className="px-8 py-3.5 bg-gold text-charcoal text-xs tracking-widest uppercase font-sans hover:bg-gold-light transition-colors duration-200 disabled:opacity-30 rounded-sm"
                >
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
                  <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">
                    Full Name <span className="text-gold">*</span>
                  </label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="First and last name" required className={inputClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">
                    Email <span className="text-gold">*</span>
                  </label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@email.com" required className={inputClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">
                    Phone <span className="text-gold">*</span>
                  </label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="(214) 555-0100" required className={inputClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">
                    Special Requests
                  </label>
                  <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Gel upgrade, nail art, allergies…" className={inputClass} />
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setStep(2)}
                  className="text-xs tracking-widest uppercase text-offwhite/30 hover:text-offwhite/60 font-sans transition-colors duration-200">
                  ← Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!name.trim() || !email.trim() || !phone.trim()}
                  className="px-8 py-3.5 bg-gold text-charcoal text-xs tracking-widest uppercase font-sans hover:bg-gold-light transition-colors duration-200 disabled:opacity-30 rounded-sm"
                >
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
                <p className="text-sm font-sans text-offwhite/40 mt-2">Review your booking, then pay securely through Square.</p>
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
                  <span className="text-offwhite">
                    {time ? slots.find(s => s.value === time)?.label : 'Flexible'}
                  </span>
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

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-sm font-sans text-red-400 text-center -mt-4"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="flex flex-col gap-4 pb-8">
                <button
                  onClick={handlePay}
                  disabled={paying}
                  className="w-full py-4 bg-gold text-charcoal text-sm tracking-widest uppercase font-sans hover:bg-gold-light transition-colors duration-200 disabled:opacity-50 rounded-sm"
                >
                  {paying ? 'Redirecting to checkout…' : `Pay $${DEPOSIT} Deposit & Confirm`}
                </button>
                <p className="text-[10px] font-sans text-offwhite/25 text-center">
                  You&apos;ll be taken to Square&apos;s secure checkout — your deposit is applied to your service total
                </p>
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
