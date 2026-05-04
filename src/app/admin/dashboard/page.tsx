'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

type SessionEmployee = { id: string; name: string; role: string }
type Appointment = {
  id: string; customer_name: string; customer_phone: string | null
  service: string; appointment_time: string | null; notes: string | null; checked_in: boolean
}
type ClockedIn = { entryId: string; clockIn: string; employee: { id: string; name: string } | null }

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function elapsed(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60); const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function fmtHours(mins: number) {
  const h = Math.floor(mins / 60); const m = mins % 60
  return `${h}h ${m}m`
}

function fmt12(t: string | null) {
  if (!t) return '—'
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

export default function DashboardPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<SessionEmployee | null>(null)
  const [data, setData] = useState<{
    appointments: Appointment[]
    checkedInCount: number
    queueCount: number
    clockedIn: ClockedIn[]
    weekMinutes: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = sessionStorage.getItem('rns_employee')
    if (!stored) { router.replace('/employee'); return }
    setAdmin(JSON.parse(stored))
  }, [router])

  const fetchData = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/dashboard?adminId=${id}`)
      const json = await res.json()
      setData(json)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { if (admin) fetchData(admin.id) }, [admin, fetchData])

  const checkIn = async (apptId: string) => {
    if (!admin || checkingIn) return
    setCheckingIn(apptId)
    try {
      await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: apptId }),
      })
      await fetchData(admin.id)
    } catch { /* silent */ }
    finally { setCheckingIn(null) }
  }

  if (!admin) return null

  const statCard = (label: string, value: string | number, sub?: string, onClick?: () => void) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`glass-card border border-border rounded-sm px-5 py-4 ${onClick ? 'cursor-pointer hover:border-gold/25 transition-colors duration-200' : ''}`}
    >
      <p className="text-[10px] tracking-widest uppercase text-offwhite/30 font-sans mb-1">{label}</p>
      <p className="font-serif text-3xl text-gold leading-none">{value}</p>
      {sub && <p className="text-[11px] font-sans text-offwhite/30 mt-1">{sub}</p>}
    </motion.div>
  )

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 font-sans mb-1">Owner Portal</p>
        <h1 className="font-serif text-3xl text-offwhite">Dashboard</h1>
        <p className="text-offwhite/30 text-sm font-sans mt-1">{today}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-border/20 rounded-sm animate-pulse" />)}
        </div>
      ) : data ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statCard('Appointments Today', data.appointments.length,
              `${data.checkedInCount} checked in`,
              () => router.push('/admin/appointments'))}
            {statCard('Walk-In Queue', data.queueCount,
              data.queueCount === 1 ? '1 waiting' : `${data.queueCount} waiting`,
              () => router.push('/admin/queue'))}
            {statCard('Clocked In', data.clockedIn.length,
              data.clockedIn.length === 0 ? 'No staff on clock' : 'staff on clock',
              () => router.push('/admin/staff'))}
            {statCard('Week Hours', fmtHours(data.weekMinutes), 'Sun–Sat pay week')}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's appointments */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] tracking-[0.25em] uppercase text-gold/50 font-sans">
                  Today&apos;s Appointments
                </p>
                <button onClick={() => router.push('/admin/appointments')}
                  className="text-[10px] tracking-widest uppercase text-offwhite/25 hover:text-gold/60 font-sans transition-colors duration-200">
                  All →
                </button>
              </div>

              {data.appointments.length === 0 ? (
                <div className="glass-card border border-border/40 rounded-sm p-8 text-center">
                  <p className="text-offwhite/20 font-sans text-sm">No appointments today.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {data.appointments.map((a) => (
                    <div key={a.id}
                      className={`glass-card border rounded-sm px-4 py-3 flex items-center gap-3 ${
                        a.checked_in ? 'border-border/30 opacity-50' : 'border-border/60'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-serif text-sm ${a.checked_in ? 'line-through text-offwhite/40' : 'text-offwhite'}`}>
                            {a.customer_name}
                          </p>
                          <span className="text-[10px] font-sans text-gold/50">{fmt12(a.appointment_time)}</span>
                        </div>
                        <p className="text-[11px] font-sans text-offwhite/40 truncate">{a.service}</p>
                      </div>
                      {!a.checked_in && (
                        <button
                          onClick={() => checkIn(a.id)}
                          disabled={checkingIn === a.id}
                          className="shrink-0 px-3 py-1.5 border border-gold/30 text-gold text-[10px] tracking-widest uppercase font-sans hover:bg-gold/10 transition-all duration-150 rounded-sm disabled:opacity-40"
                        >
                          {checkingIn === a.id ? '…' : 'Check In'}
                        </button>
                      )}
                      {a.checked_in && (
                        <span className="text-[10px] tracking-widest uppercase font-sans text-gold/50">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right column: clocked in + queue */}
            <div className="flex flex-col gap-5">
              {/* Clocked-in staff */}
              <div className="flex flex-col gap-3">
                <p className="text-[10px] tracking-[0.25em] uppercase text-gold/50 font-sans">
                  Staff On Clock
                </p>
                {data.clockedIn.length === 0 ? (
                  <div className="glass-card border border-border/40 rounded-sm p-6 text-center">
                    <p className="text-offwhite/20 font-sans text-sm">No one clocked in.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {data.clockedIn.map(c => (
                      <div key={c.entryId} className="glass-card border border-border/50 rounded-sm px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-gold animate-pulse-slow" />
                          <p className="font-serif text-sm text-offwhite">{c.employee?.name ?? 'Unknown'}</p>
                        </div>
                        <p className="text-[11px] font-sans text-offwhite/40">
                          {fmtTime(c.clockIn)} · {elapsed(c.clockIn)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Queue preview */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] tracking-[0.25em] uppercase text-gold/50 font-sans">Walk-In Queue</p>
                  <button onClick={() => router.push('/admin/queue')}
                    className="text-[10px] tracking-widest uppercase text-offwhite/25 hover:text-gold/60 font-sans transition-colors duration-200">
                    Manage →
                  </button>
                </div>
                <div className={`glass-card border rounded-sm px-5 py-4 text-center ${
                  data.queueCount > 0 ? 'border-gold/20' : 'border-border/40'
                }`}>
                  <p className="font-serif text-4xl text-gold">{data.queueCount}</p>
                  <p className="text-[10px] tracking-widest uppercase text-offwhite/30 font-sans mt-1">
                    {data.queueCount === 1 ? 'Customer Waiting' : 'Customers Waiting'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="glass-card border border-border rounded-sm p-10 text-center">
          <p className="text-offwhite/30 font-sans text-sm">Could not load dashboard data.</p>
        </div>
      )}
    </div>
  )
}
