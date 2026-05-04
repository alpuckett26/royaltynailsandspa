'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

type Admin = { id: string; name: string; role: string }

const DEFAULTS: Record<string, string> = {
  phone: '(214) 501-4300',
  email: 'royaltynailsspa37@gmail.com',
  address: '6909 Rowlett Road, Suite 102, Rowlett, Texas 75089',
  hours_mon_sat: 'Monday – Saturday: 10:00 AM – 7:00 PM',
  hours_sun: 'Sunday: By Appointment Only',
  instagram: 'https://www.instagram.com/royalty_nailsspa',
  facebook: '#',
  google: '#',
}

type SectionKey = 'contact' | 'location' | 'hours' | 'social'

const SECTIONS: { id: SectionKey; label: string; fields: { key: string; label: string; type?: string }[] }[] = [
  {
    id: 'contact', label: 'Contact',
    fields: [
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email', type: 'email' },
    ],
  },
  {
    id: 'location', label: 'Location',
    fields: [{ key: 'address', label: 'Address' }],
  },
  {
    id: 'hours', label: 'Hours',
    fields: [
      { key: 'hours_mon_sat', label: 'Mon–Sat Hours' },
      { key: 'hours_sun', label: 'Sunday Hours / Note' },
    ],
  },
  {
    id: 'social', label: 'Social Links',
    fields: [
      { key: 'instagram', label: 'Instagram URL' },
      { key: 'facebook', label: 'Facebook URL' },
      { key: 'google', label: 'Google Business URL' },
    ],
  },
]

export default function AdminSettingsPage() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [values, setValues] = useState<Record<string, string>>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<SectionKey | null>(null)
  const [msgs, setMsgs] = useState<Record<SectionKey, { type: 'ok' | 'err'; text: string } | null>>({
    contact: null, location: null, hours: null, social: null,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = sessionStorage.getItem('rns_employee')
    if (stored) setAdmin(JSON.parse(stored))
  }, [])

  useEffect(() => {
    if (!admin) return
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        if (data.settings) setValues(v => ({ ...v, ...data.settings }))
      })
      .catch(() => { /* keep defaults */ })
      .finally(() => setLoading(false))
  }, [admin])

  const handleSave = async (sectionId: SectionKey, keys: string[]) => {
    if (!admin || saving) return
    setSaving(sectionId)
    setMsgs(m => ({ ...m, [sectionId]: null }))
    try {
      const settings: Record<string, string> = {}
      for (const k of keys) settings[k] = values[k] ?? ''
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: admin.id, settings }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      setMsgs(m => ({ ...m, [sectionId]: { type: 'ok', text: 'Saved.' } }))
    } catch (err) {
      setMsgs(m => ({ ...m, [sectionId]: { type: 'err', text: err instanceof Error ? err.message : 'Failed.' } }))
    } finally { setSaving(null) }
  }

  const ic = 'w-full bg-charcoal border border-border rounded-sm px-3 py-2 text-offwhite text-sm font-sans placeholder:text-offwhite/25 focus:outline-none focus:border-gold/50 transition-colors duration-200'

  if (loading) return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 font-sans mb-1">Admin Panel</p>
        <h1 className="font-serif text-3xl text-offwhite">Settings</h1>
      </div>
      <div className="flex flex-col gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-border/20 rounded-sm animate-pulse" />)}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 font-sans mb-1">Admin Panel</p>
        <h1 className="font-serif text-3xl text-offwhite">Business Settings</h1>
        <p className="text-offwhite/30 text-sm font-sans mt-1">Edit and save each section independently.</p>
      </div>

      <div className="flex flex-col gap-6 max-w-2xl">
        {SECTIONS.map(section => (
          <motion.div key={section.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card border border-border/60 rounded-sm p-6 flex flex-col gap-4">
            <p className="text-[10px] tracking-[0.25em] uppercase text-gold/50 font-sans">{section.label}</p>
            {section.fields.map(field => (
              <div key={field.key} className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">{field.label}</label>
                <input
                  type={field.type ?? 'text'}
                  value={values[field.key] ?? ''}
                  onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                  className={ic}
                />
              </div>
            ))}
            <div className="flex items-center gap-4 pt-1">
              <button
                onClick={() => handleSave(section.id, section.fields.map(f => f.key))}
                disabled={saving === section.id}
                className="px-5 py-2 bg-gold text-charcoal text-xs tracking-widest uppercase font-semibold font-sans hover:bg-gold-light transition-colors duration-200 disabled:opacity-50">
                {saving === section.id ? 'Saving…' : 'Save'}
              </button>
              {msgs[section.id] && (
                <p className={`text-xs font-sans ${msgs[section.id]!.type === 'ok' ? 'text-gold' : 'text-red-400'}`}>
                  {msgs[section.id]!.text}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
