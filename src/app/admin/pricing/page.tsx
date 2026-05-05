'use client'

import { useState, useEffect, useCallback } from 'react'
import { serviceCategories } from '@/lib/content'

type Admin = { id: string; name: string; role: string }
type PriceMap = Record<string, { price: number; priceNote: string | null }>
type EditState = { price: string; priceNote: string }
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export default function AdminPricingPage() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [prices, setPrices] = useState<PriceMap>({})
  const [edits, setEdits] = useState<Record<string, EditState>>({})
  const [statuses, setStatuses] = useState<Record<string, SaveStatus>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = sessionStorage.getItem('rns_employee')
    if (stored) setAdmin(JSON.parse(stored))
  }, [])

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch('/api/services/prices')
      const data = await res.json()
      setPrices(data.prices ?? {})
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchPrices() }, [fetchPrices])

  function getDisplayPrice(name: string, fallback: number): string {
    if (prices[name] !== undefined) return String(prices[name].price)
    return String(fallback)
  }

  function getDisplayNote(name: string): string {
    return prices[name]?.priceNote ?? ''
  }

  function startEdit(name: string, fallback: number) {
    if (edits[name]) return
    setEdits(prev => ({
      ...prev,
      [name]: {
        price: getDisplayPrice(name, fallback),
        priceNote: getDisplayNote(name),
      },
    }))
  }

  function updateEdit(name: string, field: 'price' | 'priceNote', value: string) {
    setEdits(prev => ({ ...prev, [name]: { ...prev[name], [field]: value } }))
  }

  async function savePrice(name: string) {
    if (!admin || !edits[name]) return
    const raw = edits[name].price
    const num = parseFloat(raw)
    if (isNaN(num) || num < 0) {
      setStatuses(prev => ({ ...prev, [name]: 'error' }))
      return
    }
    setStatuses(prev => ({ ...prev, [name]: 'saving' }))
    try {
      const res = await fetch('/api/services/prices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: admin.id,
          name,
          price: num,
          priceNote: edits[name].priceNote.trim() || null,
        }),
      })
      if (!res.ok) throw new Error()
      setPrices(prev => ({
        ...prev,
        [name]: { price: num, priceNote: edits[name].priceNote.trim() || null },
      }))
      setEdits(prev => { const n = { ...prev }; delete n[name]; return n })
      setStatuses(prev => ({ ...prev, [name]: 'saved' }))
      setTimeout(() => setStatuses(prev => ({ ...prev, [name]: 'idle' })), 2000)
    } catch {
      setStatuses(prev => ({ ...prev, [name]: 'error' }))
    }
  }

  function cancelEdit(name: string) {
    setEdits(prev => { const n = { ...prev }; delete n[name]; return n })
    setStatuses(prev => ({ ...prev, [name]: 'idle' }))
  }

  const ic = 'bg-charcoal border border-border rounded-sm px-3 py-2 text-offwhite text-sm font-sans focus:outline-none focus:border-gold/50 transition-colors duration-200'

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 font-sans mb-1">Admin Panel</p>
        <h1 className="font-serif text-3xl text-offwhite">Pricing Editor</h1>
        <p className="text-sm text-offwhite/35 font-sans mt-2">
          Changes save immediately and appear live on the public Packages page.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-border/20 rounded-sm animate-pulse" />)}
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {serviceCategories.map(category => (
            <div key={category.id}>
              <div className="flex items-center gap-4 mb-4">
                <p className="text-[10px] tracking-widest uppercase text-gold/50 font-sans">{category.eyebrow}</p>
                <div className="flex-1 h-px bg-border/30" />
              </div>
              <h2 className="font-serif text-xl text-offwhite mb-5">{category.name}</h2>

              <div className="flex flex-col gap-3">
                {category.packages.map(pkg => {
                  const isEditing = !!edits[pkg.name]
                  const status = statuses[pkg.name] ?? 'idle'
                  const displayPrice = getDisplayPrice(pkg.name, pkg.price)
                  const isOverridden = prices[pkg.name] !== undefined

                  return (
                    <div
                      key={pkg.name}
                      className={`glass-card border rounded-sm px-6 py-4 transition-all duration-200 ${
                        isEditing ? 'border-gold/30' : 'border-border hover:border-border/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-serif text-base text-offwhite">{pkg.name}</p>
                            {isOverridden && !isEditing && (
                              <span className="text-[8px] tracking-widest uppercase text-gold/50 border border-gold/20 px-1.5 py-0.5 rounded-sm font-sans">
                                Custom
                              </span>
                            )}
                          </div>
                          {!isEditing && prices[pkg.name]?.priceNote && (
                            <p className="text-xs text-offwhite/30 font-sans mt-0.5">{prices[pkg.name].priceNote}</p>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-offwhite/40 font-sans text-sm">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={edits[pkg.name].price}
                              onChange={e => updateEdit(pkg.name, 'price', e.target.value)}
                              className={`${ic} w-24 text-right`}
                              autoFocus
                              onKeyDown={e => {
                                if (e.key === 'Enter') savePrice(pkg.name)
                                if (e.key === 'Escape') cancelEdit(pkg.name)
                              }}
                            />
                            <button
                              onClick={() => savePrice(pkg.name)}
                              disabled={status === 'saving'}
                              className="px-4 py-2 bg-gold text-charcoal text-xs tracking-widest uppercase font-sans font-semibold hover:bg-gold-light transition-colors duration-200 rounded-sm disabled:opacity-50"
                            >
                              {status === 'saving' ? '…' : 'Save'}
                            </button>
                            <button
                              onClick={() => cancelEdit(pkg.name)}
                              className="px-3 py-2 border border-border text-offwhite/40 text-xs tracking-widest uppercase font-sans hover:text-offwhite transition-colors duration-200 rounded-sm"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4 flex-shrink-0">
                            {status === 'saved' && (
                              <span className="text-[10px] text-gold font-sans tracking-widest uppercase">Saved</span>
                            )}
                            {status === 'error' && (
                              <span className="text-[10px] text-red-400 font-sans tracking-widest uppercase">Error</span>
                            )}
                            <button
                              onClick={() => startEdit(pkg.name, pkg.price)}
                              className="flex items-baseline gap-1 group"
                            >
                              <span className="font-serif text-2xl text-gold group-hover:text-gold-light transition-colors duration-200">
                                ${displayPrice}
                              </span>
                              <span className="text-[10px] text-offwhite/20 group-hover:text-offwhite/50 font-sans transition-colors duration-200 ml-1">
                                Edit
                              </span>
                            </button>
                          </div>
                        )}
                      </div>

                      {isEditing && (
                        <div className="mt-3 pt-3 border-t border-border/30">
                          <label className="text-[10px] tracking-widest uppercase text-offwhite/30 font-sans block mb-1.5">
                            Price Note (optional — e.g. "starting at", "+tax")
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. starting at, per nail, +tax"
                            value={edits[pkg.name].priceNote}
                            onChange={e => updateEdit(pkg.name, 'priceNote', e.target.value)}
                            className={`${ic} w-full max-w-sm`}
                            onKeyDown={e => {
                              if (e.key === 'Enter') savePrice(pkg.name)
                              if (e.key === 'Escape') cancelEdit(pkg.name)
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-border/30 pt-6">
        <p className="text-xs text-offwhite/20 font-sans">
          Default prices are set in <code className="text-gold/40">src/lib/content.ts</code> and serve as fallbacks.
          Overrides saved here take precedence on all public-facing pages.
        </p>
      </div>
    </div>
  )
}
