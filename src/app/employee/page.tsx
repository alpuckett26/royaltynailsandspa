'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { PINPad } from '@/components/employee/PINPad'

type Employee = { id: string; name: string; role: string }

export default function EmployeeLoginPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selected, setSelected] = useState<Employee | null>(null)
  const [pinError, setPinError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  // Clear any existing session on the login page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('rns_employee')
    }
  }, [])

  useEffect(() => {
    fetch('/api/employee/list')
      .then((r) => r.json())
      .then((d) => setEmployees(d.employees ?? []))
      .catch(() => setEmployees([]))
      .finally(() => setFetching(false))
  }, [])

  const handlePIN = async (pin: string) => {
    if (!selected) return
    setLoading(true)
    setPinError(null)

    try {
      const res = await fetch('/api/employee/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: selected.id, pin }),
      })
      const data = await res.json()

      if (!res.ok) {
        setPinError(data.error ?? 'Incorrect PIN. Please try again.')
        return
      }

      // Store session
      sessionStorage.setItem('rns_employee', JSON.stringify(data.employee))

      // Route based on role
      if (data.employee.role === 'admin') {
        router.push('/employee/admin')
      } else {
        router.push('/employee/dashboard')
      }
    } catch {
      setPinError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div
            key="pin"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
          >
            <PINPad
              employeeName={selected.name}
              onComplete={handlePIN}
              loading={loading}
              error={pinError}
              onCancel={() => { setSelected(null); setPinError(null) }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-8"
          >
            {/* Header */}
            <div className="text-center">
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 font-sans mb-3">
                Staff Portal
              </p>
              <h1 className="font-serif text-3xl text-offwhite">Select Your Name</h1>
              <p className="text-sm text-offwhite/40 font-sans mt-2">
                Then enter your 4-digit PIN to continue.
              </p>
            </div>

            {/* Gold divider */}
            <div className="w-10 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mx-auto" />

            {/* Employee list */}
            {fetching ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-border/30 rounded-sm animate-pulse" />
                ))}
              </div>
            ) : employees.length === 0 ? (
              <div className="glass-card border border-border rounded-sm p-8 text-center">
                <p className="text-offwhite/40 text-sm font-sans mb-4">
                  No employees configured yet.
                </p>
                <p className="text-offwhite/25 text-xs font-sans leading-relaxed">
                  Set up your Supabase database and add employees via the admin portal.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {employees.map((emp, i) => (
                  <motion.button
                    key={emp.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => setSelected(emp)}
                    className="w-full glass-card border border-border hover:border-gold/40 rounded-sm px-6 py-4 flex items-center justify-between group transition-all duration-200 hover:bg-gold/[0.03]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border border-border/60 flex items-center justify-center group-hover:border-gold/30 transition-colors duration-200">
                        <span className="font-serif text-sm text-offwhite/50 group-hover:text-gold/70 transition-colors duration-200">
                          {emp.name.charAt(0)}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="font-serif text-base text-offwhite group-hover:text-gold transition-colors duration-200">
                          {emp.name}
                        </p>
                        {emp.role === 'admin' && (
                          <p className="text-[9px] tracking-widest uppercase text-gold/40 font-sans">
                            Admin
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-offwhite/20 group-hover:text-gold/50 group-hover:translate-x-1 transition-all duration-200">
                      →
                    </span>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
