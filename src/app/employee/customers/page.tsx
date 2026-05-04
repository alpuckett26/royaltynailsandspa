'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import type { CustomerRecord } from '@/app/api/customers/route'

type SessionEmployee = { id: string; name: string; role: string }

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function CustomersPage() {
  const router = useRouter()
  const [employee, setEmployee] = useState<SessionEmployee | null>(null)
  const [customers, setCustomers] = useState<CustomerRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = sessionStorage.getItem('rns_employee')
    if (!stored) { router.replace('/employee'); return }
    setEmployee(JSON.parse(stored))
  }, [router])

  const fetchCustomers = useCallback(async (empId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/customers?employeeId=${empId}`)
      const data = await res.json()
      setCustomers(data.customers ?? [])
    } catch {
      // silent — empty state handles it
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (employee) fetchCustomers(employee.id)
  }, [employee, fetchCustomers])

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone ?? '').includes(q) ||
      (c.email ?? '').toLowerCase().includes(q)
    )
  })

  if (!employee) return null

  return (
    <div className="w-full max-w-2xl flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 font-sans mb-1">
            Employee Portal
          </p>
          <h1 className="font-serif text-3xl text-offwhite">Customers</h1>
          {!loading && (
            <p className="text-offwhite/30 text-xs font-sans mt-1">
              {customers.length} {customers.length === 1 ? 'customer' : 'customers'} on record
            </p>
          )}
        </div>
        <button
          onClick={() => router.back()}
          className="text-xs tracking-widest uppercase text-offwhite/30 hover:text-offwhite/60 font-sans transition-colors duration-200"
        >
          ← Back
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, phone, or email…"
        className="w-full bg-charcoal border border-border rounded-sm px-4 py-3 text-offwhite text-sm font-sans placeholder:text-offwhite/25 focus:outline-none focus:border-gold/50 transition-colors duration-200"
      />

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-border/20 rounded-sm animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card border border-border rounded-sm p-10 text-center">
          <p className="text-offwhite/30 text-sm font-sans">
            {search ? 'No customers match your search.' : 'No customers on record yet.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((c) => (
            <motion.div key={c.name} layout className="flex flex-col">
              {/* Customer row */}
              <button
                onClick={() => setExpanded(expanded === c.name ? null : c.name)}
                className="w-full glass-card border border-border hover:border-gold/25 rounded-sm px-5 py-4 flex items-center justify-between group transition-all duration-200 text-left"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-9 h-9 rounded-full border border-border/60 flex items-center justify-center shrink-0">
                    <span className="font-serif text-sm text-offwhite/50">
                      {c.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-serif text-base text-offwhite group-hover:text-gold transition-colors duration-200 truncate">
                      {c.name}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {c.phone && (
                        <a
                          href={`tel:${c.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] font-sans text-offwhite/40 hover:text-gold transition-colors duration-200"
                        >
                          {c.phone}
                        </a>
                      )}
                      {c.email && (
                        <a
                          href={`mailto:${c.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] font-sans text-offwhite/30 hover:text-gold transition-colors duration-200 truncate max-w-[180px]"
                        >
                          {c.email}
                        </a>
                      )}
                      {!c.phone && !c.email && (
                        <span className="text-[11px] font-sans text-offwhite/20">No contact info</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-5 shrink-0 ml-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-[11px] font-sans text-offwhite/40">{c.lastService}</p>
                    <p className="text-[10px] font-sans text-offwhite/25">{formatDate(c.lastVisit)}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-serif text-lg text-gold leading-none">{c.visitCount}</p>
                    <p className="text-[9px] tracking-widest uppercase text-offwhite/25 font-sans">
                      {c.visitCount === 1 ? 'visit' : 'visits'}
                    </p>
                  </div>
                  <span className="text-offwhite/20 group-hover:text-offwhite/40 text-xs transition-colors duration-200">
                    {expanded === c.name ? '▲' : '▼'}
                  </span>
                </div>
              </button>

              {/* Visit history */}
              <AnimatePresence>
                {expanded === c.name && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-1 glass-card border border-border/50 rounded-sm px-5 py-4 flex flex-col gap-3">
                      <p className="text-[10px] tracking-widest uppercase text-gold/40 font-sans">
                        Visit History
                      </p>
                      <div className="flex flex-col gap-2">
                        {c.visits.map((v) => (
                          <div
                            key={v.id}
                            className="flex items-start justify-between py-2 border-b border-border/30 last:border-0"
                          >
                            <div>
                              <p className="text-sm font-sans text-offwhite/80">{v.service}</p>
                              {v.notes && (
                                <p className="text-[11px] font-sans text-offwhite/30 mt-0.5">{v.notes}</p>
                              )}
                            </div>
                            <div className="text-right shrink-0 ml-4">
                              <p className="text-[11px] font-sans text-offwhite/50">{formatDate(v.date)}</p>
                              {v.time && (
                                <p className="text-[10px] font-sans text-offwhite/30">{v.time}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
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
