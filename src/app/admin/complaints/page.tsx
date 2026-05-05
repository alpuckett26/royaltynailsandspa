'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Admin = { id: string; name: string; role: string }

type Complaint = {
  id: string
  ticket_number: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  appointment_date: string | null
  appointment_time: string | null
  employee_name: string | null
  service: string | null
  complaint: string
  status: 'open' | 'in_progress' | 'resolved'
  admin_notes: string | null
  follow_up_due: string | null
  resolved_at: string | null
  created_at: string
}

type StatusFilter = 'all' | 'open' | 'in_progress' | 'resolved'

function fmtDate(d: string | null): string {
  if (!d) return '—'
  const [y, mo, day] = d.split('-').map(Number)
  return new Date(y, mo - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function fmt12h(t: string | null): string {
  if (!t) return '—'
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

function daysUntil(due: string | null): number | null {
  if (!due) return null
  const [y, mo, d] = due.split('-').map(Number)
  const dueDate = new Date(y, mo - 1, d)
  return Math.ceil((dueDate.getTime() - Date.now()) / 86400000)
}

const STATUS_STYLES = {
  open:        'border-gold/40 text-gold bg-gold/5',
  in_progress: 'border-blue-400/40 text-blue-400 bg-blue-400/5',
  resolved:    'border-offwhite/20 text-offwhite/35 bg-transparent',
}

const STATUS_LABELS = {
  open:        'Open',
  in_progress: 'In Progress',
  resolved:    'Resolved',
}

export default function AdminComplaintsPage() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Per-complaint edit state
  const [editNotes, setEditNotes] = useState<Record<string, string>>({})
  const [editDue, setEditDue] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [saveMsg, setSaveMsg] = useState<Record<string, { type: 'ok' | 'err'; text: string }>>({})

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = sessionStorage.getItem('rns_employee')
    if (stored) setAdmin(JSON.parse(stored))
  }, [])

  const fetchComplaints = useCallback(async (adminId: string, status: StatusFilter) => {
    setLoading(true)
    try {
      const url = `/api/complaints?adminId=${adminId}${status !== 'all' ? `&status=${status}` : ''}`
      const res = await fetch(url)
      const data = await res.json()
      const list: Complaint[] = data.complaints ?? []
      setComplaints(list)
      // Seed edit state with current values
      const notes: Record<string, string> = {}
      const due: Record<string, string> = {}
      for (const c of list) {
        notes[c.id] = c.admin_notes ?? ''
        due[c.id]   = c.follow_up_due ?? ''
      }
      setEditNotes(notes)
      setEditDue(due)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { if (admin) fetchComplaints(admin.id, filter) }, [admin, filter, fetchComplaints])

  const handleSave = async (c: Complaint, newStatus?: Complaint['status']) => {
    if (!admin || saving) return
    setSaving(c.id)
    setSaveMsg(m => { const n = { ...m }; delete n[c.id]; return n })
    try {
      const res = await fetch('/api/complaints', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId:    admin.id,
          id:         c.id,
          status:     newStatus ?? c.status,
          adminNotes: editNotes[c.id] ?? '',
          followUpDue: editDue[c.id] ?? '',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setComplaints(prev => prev.map(x => x.id === c.id ? data.complaint : x))
      setSaveMsg(m => ({ ...m, [c.id]: { type: 'ok', text: 'Saved.' } }))
    } catch (err) {
      setSaveMsg(m => ({ ...m, [c.id]: { type: 'err', text: err instanceof Error ? err.message : 'Failed.' } }))
    } finally { setSaving(null) }
  }

  const counts = {
    all:         complaints.length,
    open:        complaints.filter(c => c.status === 'open').length,
    in_progress: complaints.filter(c => c.status === 'in_progress').length,
    resolved:    complaints.filter(c => c.status === 'resolved').length,
  }

  const visible = filter === 'all' ? complaints : complaints.filter(c => c.status === filter)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 font-sans mb-1">Admin Panel</p>
        <h1 className="font-serif text-3xl text-offwhite">Complaints</h1>
        <p className="text-offwhite/30 text-sm font-sans mt-1">
          Customer concerns submitted via{' '}
          <a href="/feedback" target="_blank" className="text-gold/50 hover:text-gold transition-colors duration-150">/feedback</a>
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-border/40">
        {(['all', 'open', 'in_progress', 'resolved'] as StatusFilter[]).map(s => (
          <button key={s} onClick={() => { setFilter(s); setExpandedId(null) }}
            className={`px-5 py-2.5 text-xs tracking-widest uppercase font-sans transition-all duration-200 border-b-2 -mb-px flex items-center gap-2 ${
              filter === s ? 'border-gold text-gold' : 'border-transparent text-offwhite/35 hover:text-offwhite/60'
            }`}>
            {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
            {counts[s] > 0 && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-sans ${filter === s ? 'bg-gold/20 text-gold' : 'bg-border/40 text-offwhite/30'}`}>
                {counts[s]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-border/20 rounded-sm animate-pulse" />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="glass-card border border-border/40 rounded-sm p-12 text-center">
          <p className="text-offwhite/25 font-sans text-sm">No complaints in this category.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map(c => {
            const days = daysUntil(c.follow_up_due)
            const isOverdue = days !== null && days < 0
            const isDueSoon = days !== null && days >= 0 && days <= 2
            return (
              <div key={c.id} className="flex flex-col">
                {/* Card header */}
                <button onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                  className={`glass-card border rounded-sm px-5 py-4 flex items-start justify-between gap-4 w-full text-left transition-colors duration-200 ${
                    expandedId === c.id ? 'border-gold/30' : 'border-border/60'
                  }`}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <span className="font-sans text-[10px] tracking-widest text-gold/70">{c.ticket_number}</span>
                      <span className={`text-[9px] tracking-widest uppercase font-sans px-2 py-0.5 border rounded-full ${STATUS_STYLES[c.status]}`}>
                        {STATUS_LABELS[c.status]}
                      </span>
                      {isOverdue && (
                        <span className="text-[9px] tracking-widest uppercase font-sans text-red-400 border border-red-400/30 px-2 py-0.5 rounded-full">
                          Overdue
                        </span>
                      )}
                      {isDueSoon && !isOverdue && (
                        <span className="text-[9px] tracking-widest uppercase font-sans text-amber-400/80 border border-amber-400/30 px-2 py-0.5 rounded-full">
                          Due Soon
                        </span>
                      )}
                    </div>
                    <p className="font-serif text-base text-offwhite">{c.customer_name}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                      {c.employee_name && <span className="text-xs font-sans text-gold/50">re: {c.employee_name}</span>}
                      {c.service && <span className="text-xs font-sans text-offwhite/40">{c.service}</span>}
                      {c.appointment_date && (
                        <span className="text-xs font-sans text-offwhite/30">{fmtDate(c.appointment_date)}</span>
                      )}
                    </div>
                    <p className="text-[11px] font-sans text-offwhite/30 mt-1.5 line-clamp-1">{c.complaint}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <p className="text-[10px] font-sans text-offwhite/25">{fmtDateTime(c.created_at)}</p>
                    {c.follow_up_due && (
                      <p className={`text-[10px] font-sans ${isOverdue ? 'text-red-400/70' : 'text-offwhite/30'}`}>
                        Due {fmtDate(c.follow_up_due)}
                      </p>
                    )}
                    <span className={`text-offwhite/25 text-xs transition-transform duration-200 mt-1 ${expandedId === c.id ? 'rotate-180' : ''}`}>▾</span>
                  </div>
                </button>

                {/* Expanded detail */}
                <AnimatePresence>
                  {expandedId === c.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="border border-t-0 border-gold/20 rounded-b-sm bg-charcoal/60 px-5 py-6 flex flex-col gap-6">

                        {/* Customer contact */}
                        <div className="flex flex-col gap-2">
                          <p className="text-[10px] tracking-widest uppercase text-offwhite/30 font-sans">Customer Contact</p>
                          <div className="flex flex-wrap gap-3">
                            {c.customer_email && (
                              <a href={`mailto:${c.customer_email}`}
                                className="px-4 py-2 border border-gold/30 text-gold/70 text-xs tracking-widest uppercase font-sans hover:text-gold hover:border-gold transition-colors duration-150 rounded-sm">
                                Email {c.customer_email}
                              </a>
                            )}
                            {c.customer_phone && (
                              <a href={`tel:${c.customer_phone}`}
                                className="px-4 py-2 border border-border text-offwhite/50 text-xs tracking-widest uppercase font-sans hover:text-offwhite hover:border-offwhite/30 transition-colors duration-150 rounded-sm">
                                Call {c.customer_phone}
                              </a>
                            )}
                            {!c.customer_email && !c.customer_phone && (
                              <p className="text-xs font-sans text-offwhite/25 italic">No contact info provided.</p>
                            )}
                          </div>
                        </div>

                        {/* Full complaint */}
                        <div className="flex flex-col gap-2">
                          <p className="text-[10px] tracking-widest uppercase text-offwhite/30 font-sans">Complaint</p>
                          <div className="glass-card border border-border/40 rounded-sm px-4 py-4">
                            <p className="text-sm font-sans text-offwhite/70 leading-relaxed whitespace-pre-wrap">{c.complaint}</p>
                          </div>
                        </div>

                        {/* Visit details */}
                        {(c.appointment_date || c.appointment_time || c.employee_name || c.service) && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                              { label: 'Date', val: fmtDate(c.appointment_date) },
                              { label: 'Time', val: fmt12h(c.appointment_time) },
                              { label: 'Provider', val: c.employee_name ?? '—' },
                              { label: 'Service', val: c.service ?? '—' },
                            ].map(row => (
                              <div key={row.label}>
                                <p className="text-[9px] tracking-widest uppercase text-offwhite/25 font-sans mb-0.5">{row.label}</p>
                                <p className="text-xs font-sans text-offwhite/60">{row.val}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="h-px bg-border/30" />

                        {/* Admin section */}
                        <div className="flex flex-col gap-4">
                          <p className="text-[10px] tracking-widest uppercase text-offwhite/30 font-sans">Admin Follow-Up</p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Status */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] tracking-widest uppercase text-offwhite/25 font-sans">Status</label>
                              <select
                                value={c.status}
                                onChange={e => handleSave(c, e.target.value as Complaint['status'])}
                                disabled={saving === c.id}
                                className="w-full bg-charcoal border border-border rounded-sm px-3 py-2 text-offwhite text-sm font-sans focus:outline-none focus:border-gold/50 transition-colors duration-200 appearance-none disabled:opacity-50">
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                              </select>
                            </div>

                            {/* Follow-up due date */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] tracking-widest uppercase text-offwhite/25 font-sans">Follow-Up Due Date</label>
                              <input type="date"
                                value={editDue[c.id] ?? ''}
                                onChange={e => setEditDue(d => ({ ...d, [c.id]: e.target.value }))}
                                className="w-full bg-charcoal border border-border rounded-sm px-3 py-2 text-offwhite text-sm font-sans focus:outline-none focus:border-gold/50 transition-colors duration-200" />
                            </div>
                          </div>

                          {/* Admin notes */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] tracking-widest uppercase text-offwhite/25 font-sans">Internal Notes</label>
                            <textarea
                              value={editNotes[c.id] ?? ''}
                              onChange={e => setEditNotes(n => ({ ...n, [c.id]: e.target.value }))}
                              placeholder="Add notes, actions taken, resolution details…"
                              rows={3}
                              className="w-full bg-charcoal border border-border rounded-sm px-3 py-2 text-offwhite text-sm font-sans placeholder:text-offwhite/20 focus:outline-none focus:border-gold/50 transition-colors duration-200 resize-none" />
                          </div>

                          <div className="flex items-center gap-4">
                            <button onClick={() => handleSave(c)} disabled={saving === c.id}
                              className="px-5 py-2 bg-gold text-charcoal text-xs tracking-widest uppercase font-semibold font-sans hover:bg-gold-light transition-colors duration-200 disabled:opacity-50">
                              {saving === c.id ? 'Saving…' : 'Save Changes'}
                            </button>
                            {c.status !== 'resolved' && (
                              <button onClick={() => handleSave(c, 'resolved')} disabled={saving === c.id}
                                className="px-5 py-2 border border-gold/30 text-gold text-xs tracking-widest uppercase font-sans hover:bg-gold/10 transition-colors duration-150 disabled:opacity-50">
                                Mark Resolved ✓
                              </button>
                            )}
                            {saveMsg[c.id] && (
                              <p className={`text-xs font-sans ${saveMsg[c.id].type === 'ok' ? 'text-gold' : 'text-red-400'}`}>
                                {saveMsg[c.id].text}
                              </p>
                            )}
                          </div>

                          {c.resolved_at && (
                            <p className="text-[10px] font-sans text-offwhite/25">Resolved {fmtDateTime(c.resolved_at)}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
