'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

type SessionEmployee = { id: string; name: string; role: string }

type Customer = {
  name: string
  email: string
  phone: string | null
  lastService: string
  lastVisit: string
  visits: number
}

type HistoryEntry = {
  id: string
  service: string
  appointment_date: string
  appointment_time: string | null
  notes: string | null
  checked_in: boolean
}

type Note = {
  id: string
  note: string
  created_by: string
  created_at: string
}

type CustomerDetail = {
  history: HistoryEntry[]
  notes: Note[]
}

function fmt12h(t: string | null): string {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`
}

function fmtDate(d: string): string {
  const [y, mo, day] = d.split('-').map(Number)
  return new Date(y, mo - 1, day).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

export default function PhonebookPage() {
  const router = useRouter()
  const [employee, setEmployee] = useState<SessionEmployee | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Expanded customer detail
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null)
  const [detail, setDetail] = useState<CustomerDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Note input
  const [noteText, setNoteText] = useState('')
  const [noteLoading, setNoteLoading] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = sessionStorage.getItem('rns_employee')
    if (!stored) { router.replace('/employee'); return }
    setEmployee(JSON.parse(stored))
  }, [router])

  const fetchCustomers = useCallback(async (adminId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/phonebook?adminId=${adminId}`)
      const data = await res.json()
      setCustomers(data.customers ?? [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (employee) fetchCustomers(employee.id)
  }, [employee, fetchCustomers])

  const openCustomer = useCallback(async (email: string) => {
    if (!employee) return
    if (expandedEmail === email) { setExpandedEmail(null); setDetail(null); return }
    setExpandedEmail(email)
    setDetail(null)
    setNoteText('')
    setDetailLoading(true)
    try {
      const [histRes, notesRes] = await Promise.all([
        fetch(`/api/phonebook?adminId=${employee.id}&email=${encodeURIComponent(email)}`),
        fetch(`/api/customer-notes?adminId=${employee.id}&email=${encodeURIComponent(email)}`),
      ])
      const [histData, notesData] = await Promise.all([histRes.json(), notesRes.json()])
      setDetail({ history: histData.history ?? [], notes: notesData.notes ?? [] })
    } catch { /* silent */ }
    finally { setDetailLoading(false) }
  }, [employee, expandedEmail])

  const handleAddNote = async () => {
    if (!employee || !expandedEmail || !noteText.trim()) return
    setNoteLoading(true)
    try {
      const res = await fetch('/api/customer-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerEmail: expandedEmail, note: noteText.trim(), adminId: employee.id }),
      })
      const data = await res.json()
      if (res.ok) {
        setDetail(d => d ? { ...d, notes: [data.note, ...d.notes] } : d)
        setNoteText('')
      }
    } catch { /* silent */ }
    finally { setNoteLoading(false) }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!employee) return
    await fetch(`/api/customer-notes?id=${noteId}&adminId=${employee.id}`, { method: 'DELETE' })
    setDetail(d => d ? { ...d, notes: d.notes.filter(n => n.id !== noteId) } : d)
  }

  if (!employee) return null

  const filtered = customers.filter(c => {
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone ?? '').includes(q)
    )
  })

  const inputClass = 'w-full bg-charcoal border border-border rounded-sm px-3 py-2 text-offwhite text-sm font-sans placeholder:text-offwhite/25 focus:outline-none focus:border-gold/50 transition-colors duration-200'

  return (
    <div className="w-full max-w-3xl flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 font-sans mb-1">Staff Portal</p>
          <h1 className="font-serif text-3xl text-offwhite">Phonebook</h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button onClick={() => router.push('/employee/dashboard')}
            className="text-xs tracking-widest uppercase text-offwhite/30 hover:text-offwhite/60 font-sans transition-colors duration-200">
            ← Dashboard
          </button>
          <button onClick={() => router.push('/employee/appointments')}
            className="text-xs tracking-widest uppercase text-offwhite/30 hover:text-offwhite/60 font-sans transition-colors duration-200">
            Appointments →
          </button>
          <button onClick={() => { sessionStorage.removeItem('rns_employee'); router.push('/employee') }}
            className="text-xs tracking-widest uppercase text-offwhite/20 hover:text-offwhite/40 font-sans transition-colors duration-200">
            Sign Out
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone…"
          className={inputClass}
        />
        <span className="text-offwhite/25 text-xs font-sans shrink-0">
          {filtered.length} customer{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Customer list */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-border/20 rounded-sm animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card border border-border rounded-sm p-12 text-center">
          <p className="text-offwhite/25 font-sans text-sm">
            {search ? 'No customers match your search.' : 'No customers yet — they appear here after their first booking.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((c, idx) => (
            <motion.div
              key={c.email}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: idx * 0.02 }}
              className="flex flex-col"
            >
              {/* Customer row — tap to expand */}
              <button
                onClick={() => openCustomer(c.email)}
                className={`glass-card border rounded-sm px-5 py-4 flex items-center justify-between gap-4 w-full text-left transition-colors duration-200 ${expandedEmail === c.email ? 'border-gold/30' : 'border-border'}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-base text-offwhite truncate">{c.name}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                    <span className="text-xs font-sans text-gold/60 truncate">{c.email}</span>
                    {c.phone && (
                      <span className="text-xs font-sans text-offwhite/50">{c.phone}</span>
                    )}
                  </div>
                  <p className="text-[11px] font-sans text-offwhite/25 mt-1 truncate">
                    Last: {c.lastService} · {fmtDate(c.lastVisit)}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-serif text-xl text-gold/60">{c.visits}</p>
                    <p className="text-[9px] tracking-widest uppercase text-offwhite/20 font-sans">
                      {c.visits === 1 ? 'visit' : 'visits'}
                    </p>
                  </div>
                  <span className={`text-offwhite/30 text-xs transition-transform duration-200 ${expandedEmail === c.email ? 'rotate-180' : ''}`}>▾</span>
                </div>
              </button>

              {/* Expanded detail panel */}
              <AnimatePresence>
                {expandedEmail === c.email && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border border-t-0 border-gold/20 rounded-b-sm bg-charcoal/60 px-5 py-5 flex flex-col gap-6">

                      {/* Contact actions */}
                      <div className="flex flex-wrap gap-3">
                        <a href={`mailto:${c.email}`}
                          className="px-4 py-2 border border-gold/30 text-gold/70 text-xs tracking-widest uppercase font-sans hover:text-gold hover:border-gold transition-colors duration-150 rounded-sm">
                          Email
                        </a>
                        {c.phone && (
                          <a href={`tel:${c.phone}`}
                            className="px-4 py-2 border border-border text-offwhite/50 text-xs tracking-widest uppercase font-sans hover:text-offwhite hover:border-offwhite/30 transition-colors duration-150 rounded-sm">
                            Call {c.phone}
                          </a>
                        )}
                        {c.phone && (
                          <a href={`sms:${c.phone}`}
                            className="px-4 py-2 border border-border text-offwhite/50 text-xs tracking-widest uppercase font-sans hover:text-offwhite hover:border-offwhite/30 transition-colors duration-150 rounded-sm">
                            Text
                          </a>
                        )}
                      </div>

                      {detailLoading ? (
                        <div className="flex flex-col gap-2">
                          {[1, 2].map(i => <div key={i} className="h-10 bg-border/20 rounded-sm animate-pulse" />)}
                        </div>
                      ) : detail && (
                        <>
                          {/* Notes */}
                          <div className="flex flex-col gap-3">
                            <p className="text-[10px] tracking-widest uppercase text-offwhite/30 font-sans">Staff Notes</p>

                            {/* Add note */}
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={noteText}
                                onChange={e => setNoteText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                                placeholder="Add a note…"
                                className={`${inputClass} text-xs py-1.5`}
                              />
                              <button
                                onClick={handleAddNote}
                                disabled={noteLoading || !noteText.trim()}
                                className="px-4 py-1.5 bg-gold text-charcoal text-xs tracking-widest uppercase font-sans hover:bg-gold-light transition-colors duration-200 disabled:opacity-40 rounded-sm shrink-0"
                              >
                                {noteLoading ? '…' : 'Add'}
                              </button>
                            </div>

                            {/* Notes list */}
                            {detail.notes.length === 0 ? (
                              <p className="text-xs font-sans text-offwhite/20">No notes yet.</p>
                            ) : (
                              <div className="flex flex-col gap-2">
                                {detail.notes.map(n => (
                                  <div key={n.id} className="flex items-start justify-between gap-3 border border-border/40 rounded-sm px-3 py-2">
                                    <div className="min-w-0">
                                      <p className="text-sm font-sans text-offwhite/80">{n.note}</p>
                                      <p className="text-[10px] font-sans text-offwhite/25 mt-0.5">
                                        {n.created_by} · {fmtDateTime(n.created_at)}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteNote(n.id)}
                                      className="text-offwhite/20 hover:text-red-400 text-xs font-sans transition-colors duration-150 shrink-0"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Visit history */}
                          <div className="flex flex-col gap-3">
                            <p className="text-[10px] tracking-widest uppercase text-offwhite/30 font-sans">
                              Visit History — {detail.history.length}
                            </p>
                            {detail.history.length === 0 ? (
                              <p className="text-xs font-sans text-offwhite/20">No visits recorded.</p>
                            ) : (
                              <div className="flex flex-col gap-1.5">
                                {detail.history.map(h => (
                                  <div key={h.id} className="flex items-center gap-3 py-2 border-b border-border/20 last:border-0">
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-sans text-offwhite/80">{h.service}</p>
                                      {h.notes && <p className="text-[11px] font-sans text-offwhite/30 truncate">{h.notes}</p>}
                                    </div>
                                    <div className="shrink-0 text-right">
                                      <p className="text-xs font-sans text-offwhite/50">{fmtDate(h.appointment_date)}</p>
                                      {h.appointment_time && (
                                        <p className="text-[10px] font-sans text-gold/40">{fmt12h(h.appointment_time)}</p>
                                      )}
                                    </div>
                                    {h.checked_in && (
                                      <span className="text-[9px] tracking-widest uppercase text-gold/40 font-sans shrink-0">✓</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
