'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Admin = { id: string; name: string; role: string }

type Special = {
  id: string
  eyebrow: string | null
  title: string
  description: string
  offer: string
  badge: string | null
  valid_through: string | null
  active: boolean
  sort_order: number
}

function fmtDate(d: string | null): string {
  if (!d) return ''
  const [y, mo, day] = d.split('-').map(Number)
  return new Date(y, mo - 1, day).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function AdminSpecialsPage() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [specials, setSpecials] = useState<Special[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  // Form state
  const [fEyebrow, setFEyebrow] = useState('')
  const [fTitle, setFTitle] = useState('')
  const [fDesc, setFDesc] = useState('')
  const [fOffer, setFOffer] = useState('')
  const [fBadge, setFBadge] = useState('')
  const [fThrough, setFThrough] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formMsg, setFormMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = sessionStorage.getItem('rns_employee')
    if (stored) setAdmin(JSON.parse(stored))
  }, [])

  const fetchSpecials = useCallback(async (adminId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/specials?adminId=${adminId}`)
      const data = await res.json()
      setSpecials(data.specials ?? [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { if (admin) fetchSpecials(admin.id) }, [admin, fetchSpecials])

  function startEdit(s: Special) {
    setEditId(s.id)
    setFEyebrow(s.eyebrow ?? ''); setFTitle(s.title); setFDesc(s.description)
    setFOffer(s.offer); setFBadge(s.badge ?? ''); setFThrough(s.valid_through ?? '')
    setShowForm(false); setFormMsg(null)
  }

  function resetForm() {
    setEditId(null); setShowForm(false)
    setFEyebrow(''); setFTitle(''); setFDesc(''); setFOffer(''); setFBadge(''); setFThrough('')
    setFormMsg(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!admin || !fTitle.trim() || !fDesc.trim() || !fOffer.trim()) return
    setFormLoading(true); setFormMsg(null)
    try {
      const payload = {
        adminId: admin.id,
        eyebrow: fEyebrow.trim() || undefined,
        title: fTitle.trim(), description: fDesc.trim(), offer: fOffer.trim(),
        badge: fBadge.trim() || undefined, validThrough: fThrough || undefined,
      }
      const res = editId
        ? await fetch('/api/admin/specials', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, id: editId }) })
        : await fetch('/api/admin/specials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      setFormMsg({ type: 'ok', text: editId ? 'Updated.' : 'Special added.' })
      fetchSpecials(admin.id)
      if (!editId) { setFEyebrow(''); setFTitle(''); setFDesc(''); setFOffer(''); setFBadge(''); setFThrough('') }
    } catch (err) {
      setFormMsg({ type: 'err', text: err instanceof Error ? err.message : 'Failed.' })
    } finally { setFormLoading(false) }
  }

  async function handleToggle(s: Special) {
    if (!admin || toggling) return
    setToggling(s.id)
    try {
      await fetch('/api/admin/specials', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: admin.id, id: s.id, active: !s.active }),
      })
      setSpecials(prev => prev.map(x => x.id === s.id ? { ...x, active: !x.active } : x))
    } catch { /* silent */ }
    finally { setToggling(null) }
  }

  async function handleDelete(id: string) {
    if (!admin || deleting) return
    setDeleting(id)
    try {
      await fetch(`/api/admin/specials?id=${id}&adminId=${admin.id}`, { method: 'DELETE' })
      setSpecials(prev => prev.filter(x => x.id !== id))
      if (editId === id) resetForm()
    } catch { /* silent */ }
    finally { setDeleting(null) }
  }

  const ic = 'w-full bg-charcoal border border-border rounded-sm px-3 py-2 text-offwhite text-sm font-sans placeholder:text-offwhite/25 focus:outline-none focus:border-gold/50 transition-colors duration-200'

  const FormPanel = ({ isEdit }: { isEdit: boolean }) => (
    <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      onSubmit={handleSubmit}
      className="glass-card border border-gold/20 rounded-sm p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <h3 className="font-serif text-lg text-offwhite col-span-full">{isEdit ? 'Edit Special' : 'New Special'}</h3>
      {[
        { label: 'Eyebrow', val: fEyebrow, set: setFEyebrow, placeholder: 'e.g. Limited Time', full: false },
        { label: 'Title *', val: fTitle, set: setFTitle, placeholder: 'e.g. Spring Refresh Package', full: false },
        { label: 'Badge', val: fBadge, set: setFBadge, placeholder: 'e.g. New', full: false },
      ].map(f => (
        <div key={f.label} className={`flex flex-col gap-1.5 ${f.full ? 'col-span-full' : ''}`}>
          <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">{f.label}</label>
          <input type="text" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} className={ic} />
        </div>
      ))}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">Valid Through</label>
        <input type="date" value={fThrough} onChange={e => setFThrough(e.target.value)} className={ic} />
      </div>
      <div className="flex flex-col gap-1.5 col-span-full">
        <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">Description *</label>
        <textarea value={fDesc} onChange={e => setFDesc(e.target.value)} placeholder="Describe the offer…" rows={2}
          className={`${ic} resize-none`} />
      </div>
      <div className="flex flex-col gap-1.5 col-span-full">
        <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">Offer Text *</label>
        <input type="text" value={fOffer} onChange={e => setFOffer(e.target.value)} placeholder="e.g. 20% off any full set" className={ic} />
      </div>
      <div className="col-span-full flex items-center gap-4">
        <button type="submit" disabled={formLoading}
          className="px-6 py-2.5 bg-gold text-charcoal text-xs tracking-widest uppercase font-semibold font-sans hover:bg-gold-light transition-colors duration-200 disabled:opacity-50">
          {formLoading ? 'Saving…' : isEdit ? 'Update Special' : 'Add Special'}
        </button>
        <button type="button" onClick={resetForm}
          className="px-4 py-2.5 border border-border text-offwhite/40 text-xs tracking-widest uppercase font-sans hover:text-offwhite transition-colors duration-200">
          Cancel
        </button>
        {formMsg && <p className={`text-xs font-sans ${formMsg.type === 'ok' ? 'text-gold' : 'text-red-400'}`}>{formMsg.text}</p>}
      </div>
    </motion.form>
  )

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 font-sans mb-1">Admin Panel</p>
          <h1 className="font-serif text-3xl text-offwhite">Specials</h1>
        </div>
        {!showForm && !editId && (
          <button onClick={() => setShowForm(true)}
            className="px-5 py-2.5 bg-gold text-charcoal text-xs tracking-widest uppercase font-sans font-semibold hover:bg-gold-light transition-colors duration-200">
            + Add Special
          </button>
        )}
      </div>

      <AnimatePresence>
        {(showForm && !editId) && <FormPanel isEdit={false} />}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-border/20 rounded-sm animate-pulse" />)}
        </div>
      ) : specials.length === 0 ? (
        <div className="glass-card border border-border/40 rounded-sm p-12 text-center">
          <p className="text-offwhite/25 font-sans text-sm">No specials yet. Add one to display it on the home page.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {specials.map(s => (
              <div key={s.id} className={`flex flex-col glass-card border rounded-sm overflow-hidden transition-opacity duration-200 ${s.active ? 'border-border/60' : 'border-border/30 opacity-50'}`}>
                <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                <div className="flex flex-col gap-3 p-5 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {s.eyebrow && <p className="text-[9px] tracking-[0.28em] uppercase text-gold/50 font-sans">{s.eyebrow}</p>}
                      <h3 className="font-serif text-lg text-offwhite leading-tight mt-0.5">{s.title}</h3>
                    </div>
                    {s.badge && (
                      <span className="bg-gold/10 border border-gold/25 text-gold text-[9px] tracking-[0.18em] uppercase font-sans px-2 py-0.5 shrink-0">
                        {s.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-offwhite/50 font-sans leading-relaxed flex-1">{s.description}</p>
                  <div className="bg-gold/5 border border-gold/15 rounded-sm px-3 py-2">
                    <p className="text-[9px] tracking-widest uppercase text-gold/50 font-sans mb-0.5">The offer</p>
                    <p className="text-xs text-gold font-sans">{s.offer}</p>
                  </div>
                  {s.valid_through && (
                    <p className="text-[10px] font-sans text-offwhite/25">Valid through {fmtDate(s.valid_through)}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 px-5 pb-4 pt-2 border-t border-border/30">
                  <button onClick={() => startEdit(s)}
                    className="text-[10px] tracking-widest uppercase text-offwhite/40 hover:text-gold font-sans transition-colors duration-150">
                    Edit
                  </button>
                  <button onClick={() => handleToggle(s)} disabled={toggling === s.id}
                    className={`text-[10px] tracking-widest uppercase font-sans transition-colors duration-150 ${s.active ? 'text-gold/50 hover:text-offwhite/50' : 'text-offwhite/30 hover:text-gold/50'}`}>
                    {toggling === s.id ? '…' : s.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id}
                    className="text-[10px] tracking-widest uppercase text-red-400/40 hover:text-red-400 font-sans transition-colors duration-150 ml-auto">
                    {deleting === s.id ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <AnimatePresence>
            {editId && <FormPanel isEdit={true} />}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
