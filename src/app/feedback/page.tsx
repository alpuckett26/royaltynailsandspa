'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { serviceCategories } from '@/lib/content'

type Employee = { id: string; name: string }

export default function FeedbackPage() {
  const [employees, setEmployees] = useState<Employee[]>([])

  // Form fields
  const [fName, setFName]           = useState('')
  const [fEmail, setFEmail]         = useState('')
  const [fPhone, setFPhone]         = useState('')
  const [fDate, setFDate]           = useState('')
  const [fTime, setFTime]           = useState('')
  const [fEmployee, setFEmployee]   = useState('')
  const [fService, setFService]     = useState('')
  const [fComplaint, setFComplaint] = useState('')
  const [fPhoto, setFPhoto]         = useState<File | null>(null)

  const [loading, setLoading]   = useState(false)
  const [ticket, setTicket]     = useState<string | null>(null)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/employee/list')
      .then(r => r.json())
      .then(d => setEmployees(d.employees ?? []))
      .catch(() => { /* silent — free text fallback */ })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fName.trim() || !fComplaint.trim()) return
    setLoading(true); setError(null)
    try {
      let photoUrl: string | undefined
      if (fPhoto) {
        const form = new FormData()
        form.append('file', fPhoto)
        const upRes = await fetch('/api/complaints/upload', { method: 'POST', body: form })
        const upData = await upRes.json()
        if (!upRes.ok) throw new Error(upData.error ?? 'Photo upload failed.')
        photoUrl = upData.url
      }

      const res = await fetch('/api/complaints', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName:    fName.trim(),
          customerEmail:   fEmail.trim() || undefined,
          customerPhone:   fPhone.trim() || undefined,
          appointmentDate: fDate || undefined,
          appointmentTime: fTime || undefined,
          employeeName:    fEmployee || undefined,
          service:         fService || undefined,
          complaint:       fComplaint.trim(),
          photoUrl,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTicket(data.ticket)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally { setLoading(false) }
  }

  const ic = 'w-full bg-white/5 border border-border rounded-sm px-4 py-3 text-offwhite text-sm font-sans placeholder:text-offwhite/20 focus:outline-none focus:border-gold/50 transition-colors duration-200'
  const sc = 'w-full bg-charcoal border border-border rounded-sm px-4 py-3 text-offwhite text-sm font-sans focus:outline-none focus:border-gold/50 transition-colors duration-200 appearance-none'
  const labelClass = 'text-[10px] tracking-widest uppercase text-offwhite/40 font-sans'

  return (
    <div className="min-h-screen bg-charcoal pt-32 pb-24">
      <div className="max-w-2xl mx-auto px-6 lg:px-8">

        <div className="flex justify-end mb-6">
          <a href="/admin"
            className="text-[10px] tracking-widest uppercase text-offwhite/20 hover:text-offwhite/50 font-sans transition-colors duration-200">
            ← Admin Panel
          </a>
        </div>

        <AnimatePresence mode="wait">
          {ticket ? (
            /* ── Success State ── */
            <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center gap-8 py-16">
              <div className="w-16 h-16 rounded-full border border-gold/40 flex items-center justify-center">
                <span className="text-gold text-2xl">✓</span>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 font-sans mb-2">Received</p>
                <h1 className="font-serif text-3xl text-offwhite mb-4">Thank You</h1>
                <p className="text-offwhite/50 font-sans text-sm leading-relaxed max-w-md">
                  Your concern has been received and is important to us. Our team will review it and follow up with you directly.
                </p>
              </div>

              <div className="glass-card border border-gold/30 rounded-sm px-10 py-8 flex flex-col items-center gap-3">
                <p className="text-[10px] tracking-[0.35em] uppercase text-offwhite/30 font-sans">Your Ticket Number</p>
                <p className="font-serif text-4xl text-gold tracking-widest">{ticket}</p>
                <p className="text-[11px] font-sans text-offwhite/30">Keep this for your records</p>
              </div>

              <div className="glass-card border border-border/40 rounded-sm px-6 py-5 text-left w-full">
                <p className="text-[10px] tracking-widest uppercase text-offwhite/30 font-sans mb-3">What Happens Next</p>
                <div className="flex flex-col gap-3">
                  {[
                    { step: '01', text: 'Our team reviews your concern within 1 business day' },
                    { step: '02', text: 'An administrator will reach out via phone or email to follow up' },
                    { step: '03', text: 'Resolution and any applicable remedy will be communicated to you directly' },
                  ].map(s => (
                    <div key={s.step} className="flex items-start gap-4">
                      <span className="font-serif text-gold/40 text-sm shrink-0 pt-0.5">{s.step}</span>
                      <p className="text-xs font-sans text-offwhite/50 leading-relaxed">{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs font-sans text-offwhite/25">
                Questions? Call us at{' '}
                <a href="tel:2145014300" className="text-gold/50 hover:text-gold transition-colors duration-150">(214) 501-4300</a>
              </p>
            </motion.div>
          ) : (
            /* ── Form ── */
            <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-10">
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 font-sans mb-2">We&apos;re Listening</p>
                <h1 className="font-serif text-3xl text-offwhite mb-3">Share Your Concern</h1>
                <p className="text-offwhite/40 font-sans text-sm leading-relaxed">
                  Your experience matters to us. Please describe your concern below — a member of our team
                  will personally follow up with you. All submissions receive a ticket number for tracking.
                </p>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/20 to-transparent mb-10" />

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Contact info */}
                <div className="flex flex-col gap-1">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-gold/40 font-sans mb-4">Your Information</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className={labelClass}>Full Name <span className="text-gold">*</span></label>
                      <input type="text" value={fName} onChange={e => setFName(e.target.value)}
                        placeholder="Your name" required className={ic} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelClass}>Email</label>
                      <input type="email" value={fEmail} onChange={e => setFEmail(e.target.value)}
                        placeholder="For follow-up (recommended)" className={ic} />
                    </div>
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className={labelClass}>Phone</label>
                      <input type="tel" value={fPhone} onChange={e => setFPhone(e.target.value)}
                        placeholder="Optional" className={ic} />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-border/30" />

                {/* Visit details */}
                <div className="flex flex-col gap-1">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-gold/40 font-sans mb-4">Visit Details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className={labelClass}>Date of Appointment</label>
                      <input type="date" value={fDate} onChange={e => setFDate(e.target.value)} className={ic} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelClass}>Appointment Time</label>
                      <input type="time" value={fTime} onChange={e => setFTime(e.target.value)} className={ic} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelClass}>Service Provider / Employee</label>
                      {employees.length > 0 ? (
                        <select value={fEmployee} onChange={e => setFEmployee(e.target.value)} className={sc}>
                          <option value="" className="bg-charcoal text-offwhite">Select or leave blank…</option>
                          {employees.map(emp => (
                            <option key={emp.id} value={emp.name} className="bg-charcoal text-offwhite">{emp.name}</option>
                          ))}
                          <option value="Unknown / Not Sure" className="bg-charcoal text-offwhite">Unknown / Not Sure</option>
                        </select>
                      ) : (
                        <input type="text" value={fEmployee} onChange={e => setFEmployee(e.target.value)}
                          placeholder="Name if known" className={ic} />
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelClass}>Service Received</label>
                      <select value={fService} onChange={e => setFService(e.target.value)} className={sc}>
                        <option value="" className="bg-charcoal text-offwhite">Select a service…</option>
                        {serviceCategories.map(cat => (
                          <optgroup key={cat.id} label={cat.name}>
                            {cat.packages.map(pkg => (
                              <option key={pkg.name} value={pkg.name} className="bg-charcoal text-offwhite">{pkg.name}</option>
                            ))}
                          </optgroup>
                        ))}
                        <option value="Other / Not Listed" className="bg-charcoal text-offwhite">Other / Not Listed</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-border/30" />

                {/* Complaint + photo */}
                <div className="flex flex-col gap-1">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-gold/40 font-sans mb-4">Your Concern</p>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className={labelClass}>Please describe your concern <span className="text-gold">*</span></label>
                      <textarea value={fComplaint} onChange={e => setFComplaint(e.target.value)}
                        placeholder="Please share what happened and how we can make it right…"
                        rows={5} required
                        className={`${ic} resize-none`} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelClass}>Photo <span className="text-offwhite/25 normal-case tracking-normal">— optional, max 5 MB</span></label>
                      {fPhoto ? (
                        <div className="flex items-center gap-3 bg-white/5 border border-border rounded-sm px-4 py-3">
                          <span className="text-xs font-sans text-offwhite/60 flex-1 truncate">{fPhoto.name}</span>
                          <span className="text-[10px] font-sans text-offwhite/30">{(fPhoto.size / 1024 / 1024).toFixed(1)} MB</span>
                          <button type="button" onClick={() => setFPhoto(null)}
                            className="text-offwhite/30 hover:text-red-400 text-sm transition-colors duration-150 leading-none ml-1">✕</button>
                        </div>
                      ) : (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const f = e.target.files?.[0] ?? null
                            if (f && f.size > 5 * 1024 * 1024) {
                              setError('Photo must be under 5 MB.')
                              e.target.value = ''
                              return
                            }
                            setError(null)
                            setFPhoto(f)
                          }}
                          className="text-sm font-sans text-offwhite/50 file:mr-3 file:px-4 file:py-2 file:bg-gold/10 file:border file:border-gold/30 file:text-gold file:text-xs file:tracking-widest file:uppercase file:font-sans file:cursor-pointer hover:file:bg-gold/20 file:transition-colors file:duration-200"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-sm font-sans text-red-400 bg-red-400/5 border border-red-400/20 rounded-sm px-4 py-3">
                    {error}
                  </p>
                )}

                <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
                  <p className="text-[10px] font-sans text-offwhite/20 leading-relaxed">
                    * Required fields. We&apos;ll follow up within 1 business day.
                  </p>
                  <button type="submit" disabled={loading || !fName.trim() || !fComplaint.trim()}
                    className="px-8 py-3 bg-gold text-charcoal text-xs tracking-widest uppercase font-semibold font-sans hover:bg-gold-light transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
                    {loading ? 'Submitting…' : 'Submit Concern'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
