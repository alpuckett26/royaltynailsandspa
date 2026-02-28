'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

type Status = 'checking' | 'ready' | 'done' | 'error'

export default function SetupPage() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('checking')
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/employee/setup')
      .then(async (r) => {
        const d = await r.json()
        if (!r.ok) { setStatus('error'); return }
        if (d.setupRequired) {
          setStatus('ready')
        } else {
          setStatus('done')
          setTimeout(() => router.replace('/employee'), 2000)
        }
      })
      .catch(() => setStatus('error'))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (pin !== confirmPin) {
      setError('PINs do not match.')
      return
    }
    if (!/^\d{4}$/.test(pin)) {
      setError('PIN must be exactly 4 digits.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/employee/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), pin }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.')
        return
      }

      setStatus('done')
      setTimeout(() => router.replace('/employee'), 2000)
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full bg-charcoal border border-border rounded-sm px-4 py-3 text-offwhite text-sm font-sans placeholder:text-offwhite/25 focus:outline-none focus:border-gold/50 transition-colors duration-200'

  return (
    <div className="min-h-screen bg-charcoal flex flex-col">
      {/* Header */}
      <header className="border-b border-border/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-serif text-lg text-offwhite/60">Royalty Nails & Spa</span>
          <span className="text-border">|</span>
          <span className="text-[10px] tracking-[0.25em] uppercase text-gold/50 font-sans">
            First-Time Setup
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {status === 'checking' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-full border border-gold/20 flex items-center justify-center">
                <span className="font-serif text-gold/40 animate-pulse">R</span>
              </div>
              <p className="text-offwhite/30 text-xs font-sans tracking-widest uppercase">Checking…</p>
            </div>
          )}

          {status === 'done' && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center flex flex-col items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full border border-gold/40 flex items-center justify-center">
                <span className="text-gold text-xl">✓</span>
              </div>
              <p className="font-serif text-2xl text-offwhite">
                {status === 'done' && name ? `Welcome, ${name}` : 'Setup complete'}
              </p>
              <p className="text-offwhite/40 text-sm font-sans">Redirecting to staff portal…</p>
            </motion.div>
          )}

          {status === 'error' && (
            <div className="glass-card border border-border rounded-sm p-8 text-center flex flex-col gap-3">
              <p className="text-red-400 text-sm font-sans font-medium">Could not connect to the database.</p>
              <p className="text-offwhite/40 text-xs font-sans leading-relaxed">
                Make sure these three environment variables are set in your Vercel project settings, then redeploy:
              </p>
              <ul className="text-left text-xs font-sans text-offwhite/30 space-y-1 mt-1">
                <li>• <code className="text-gold/60">NEXT_PUBLIC_SUPABASE_URL</code></li>
                <li>• <code className="text-gold/60">NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
                <li>• <code className="text-gold/60">SUPABASE_SERVICE_ROLE_KEY</code></li>
              </ul>
            </div>
          )}

          {status === 'ready' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-8"
            >
              {/* Header */}
              <div className="text-center flex flex-col items-center gap-4">
                <div className="flex items-center gap-4">
                  <span className="block h-px w-8 bg-gold/30" />
                  <span className="text-[10px] tracking-[0.3em] uppercase text-gold/50 font-sans">
                    Initial Setup
                  </span>
                  <span className="block h-px w-8 bg-gold/30" />
                </div>
                <h1 className="font-serif text-3xl text-offwhite">Create Admin Account</h1>
                <p className="text-sm text-offwhite/40 font-sans leading-relaxed max-w-sm">
                  Set up the first admin account. Once created, you can add the rest of your team from the admin portal.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="glass-card border border-border rounded-sm p-8 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">
                    Your Name <span className="text-gold">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Owner"
                    required
                    autoFocus
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">
                    4-Digit PIN <span className="text-gold">*</span>
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="••••"
                    required
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] tracking-widest uppercase text-offwhite/35 font-sans">
                    Confirm PIN <span className="text-gold">*</span>
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="••••"
                    required
                    className={inputClass}
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-xs font-sans">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !name.trim() || pin.length !== 4 || confirmPin.length !== 4}
                  className="w-full py-3 bg-gold text-charcoal text-xs tracking-widest uppercase font-semibold font-sans hover:bg-gold-light transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating…' : 'Create Admin Account'}
                </button>
              </form>

              <p className="text-center text-[10px] text-offwhite/15 font-sans">
                This page is only accessible when no employees exist.
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
