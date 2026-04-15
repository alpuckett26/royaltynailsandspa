'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

type SessionEmployee = { id: string; name: string; role: string }

type Customer = {
  name: string
  email: string
  phone: string | null
  lastService: string
  lastVisit: string
  visits: number
}

function fmtDate(d: string): string {
  const [y, mo, day] = d.split('-').map(Number)
  return new Date(y, mo - 1, day).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function PhonebookPage() {
  const router = useRouter()
  const [employee, setEmployee] = useState<SessionEmployee | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

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
              className="glass-card border border-border rounded-sm px-5 py-4 flex items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-serif text-base text-offwhite truncate">{c.name}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                  <a href={`mailto:${c.email}`}
                    className="text-xs font-sans text-gold/60 hover:text-gold transition-colors duration-150 truncate">
                    {c.email}
                  </a>
                  {c.phone && (
                    <a href={`tel:${c.phone}`}
                      className="text-xs font-sans text-offwhite/50 hover:text-offwhite transition-colors duration-150">
                      {c.phone}
                    </a>
                  )}
                </div>
                <p className="text-[11px] font-sans text-offwhite/25 mt-1 truncate">
                  Last: {c.lastService} · {fmtDate(c.lastVisit)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-serif text-xl text-gold/60">{c.visits}</p>
                <p className="text-[9px] tracking-widest uppercase text-offwhite/20 font-sans">
                  {c.visits === 1 ? 'visit' : 'visits'}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
