'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { PINPad } from '@/components/employee/PINPad'

export default function AdminLoginPage() {
  const router = useRouter()
  const [pinError, setPinError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handlePIN = async (pin: string) => {
    setLoading(true)
    setPinError(null)
    try {
      const res = await fetch('/api/employee/pin-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPinError(data.error ?? 'PIN not recognized')
        return
      }
      if (data.employee.role !== 'admin') {
        setPinError('This PIN does not have admin access.')
        return
      }
      sessionStorage.setItem('rns_employee', JSON.stringify(data.employee))
      router.push('/employee/admin')
    } catch {
      setPinError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-charcoal flex flex-col">
      <header className="border-b border-border/60 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-3">
          <span className="font-serif text-lg text-offwhite/60 group-hover:text-offwhite transition-colors duration-200">
            Royalty Nails & Spa
          </span>
          <span className="text-border">|</span>
          <span className="text-[10px] tracking-[0.25em] uppercase text-gold/50 font-sans">Admin</span>
        </Link>
        <Link href="/" className="text-xs tracking-widest uppercase text-offwhite/25 hover:text-offwhite/50 font-sans transition-colors duration-200">
          ← Public Site
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-xs flex flex-col gap-8"
        >
          <div className="text-center">
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 font-sans mb-3">Owner Access</p>
            <h1 className="font-serif text-3xl text-offwhite">Admin Panel</h1>
            <p className="text-sm text-offwhite/35 font-sans mt-2">Enter your 4-digit PIN to continue.</p>
          </div>

          <div className="w-10 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mx-auto" />

          <PINPad
            label="Admin PIN"
            onComplete={handlePIN}
            loading={loading}
            error={pinError}
          />

          <div className="text-center pt-2">
            <Link href="/employee" className="text-xs tracking-widest uppercase text-offwhite/20 hover:text-offwhite/40 font-sans transition-colors duration-200">
              Staff Login →
            </Link>
          </div>
        </motion.div>
      </main>

      <footer className="border-t border-border/30 px-6 py-4 text-center">
        <p className="text-[10px] text-offwhite/15 font-sans tracking-wide">Authorised personnel only</p>
      </footer>
    </div>
  )
}
