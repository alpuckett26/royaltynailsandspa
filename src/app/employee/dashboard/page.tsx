'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ClockPanel } from '@/components/employee/ClockPanel'
import { HoursTable } from '@/components/employee/HoursTable'

type SessionEmployee = { id: string; name: string; role: string }
type StatusData = {
  isClockedIn: boolean
  openEntry: { id: string; clock_in: string } | null
  todayEntries: Array<{ id: string; clock_in: string; clock_out: string | null }>
  todayMinutes: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [employee, setEmployee] = useState<SessionEmployee | null>(null)
  const [status, setStatus] = useState<StatusData | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(true)

  // Load session
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = sessionStorage.getItem('rns_employee')
    if (!stored) {
      router.replace('/employee')
      return
    }
    const emp: SessionEmployee = JSON.parse(stored)
    setEmployee(emp)
  }, [router])

  const fetchStatus = useCallback(async (empId: string) => {
    setLoadingStatus(true)
    try {
      const res = await fetch(`/api/employee/status?employeeId=${empId}`)
      const data = await res.json()
      setStatus(data)
    } catch {
      // silent
    } finally {
      setLoadingStatus(false)
    }
  }, [])

  useEffect(() => {
    if (employee) fetchStatus(employee.id)
  }, [employee, fetchStatus])

  const handleClockIn = async () => {
    if (!employee) return
    const res = await fetch('/api/employee/clock-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: employee.id }),
    })
    if (!res.ok) throw new Error('Clock-in failed')
    await fetchStatus(employee.id)
  }

  const handleClockOut = async () => {
    if (!employee) return
    const res = await fetch('/api/employee/clock-out', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: employee.id }),
    })
    if (!res.ok) throw new Error('Clock-out failed')
    await fetchStatus(employee.id)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('rns_employee')
    router.push('/employee')
  }

  if (!employee || loadingStatus) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border border-gold/20 flex items-center justify-center">
          <span className="font-serif text-gold/40 text-xl animate-pulse">R</span>
        </div>
        <p className="text-offwhite/30 text-xs font-sans tracking-widest uppercase">Loading…</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg flex flex-col gap-12">
      {/* Clock Panel */}
      {status && (
        <ClockPanel
          employeeName={employee.name}
          isClockedIn={status.isClockedIn}
          clockInTime={status.openEntry?.clock_in ?? null}
          todayMinutes={status.todayMinutes}
          onClockIn={handleClockIn}
          onClockOut={handleClockOut}
        />
      )}

      {/* Today's log */}
      {status && status.todayEntries.length > 0 && (
        <HoursTable
          entries={status.todayEntries}
          totalMinutes={status.todayMinutes}
          title="Today's Log"
        />
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between border-t border-border/40 pt-6">
        <button
          onClick={handleLogout}
          className="text-xs tracking-widest uppercase text-offwhite/25 hover:text-offwhite/50 font-sans transition-colors duration-200"
        >
          Sign Out
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/employee/checkin')}
            className="text-xs tracking-widest uppercase text-offwhite/30 hover:text-offwhite/60 font-sans transition-colors duration-200"
          >
            Check-In Queue →
          </button>
          {employee.role === 'admin' && (
            <button
              onClick={() => router.push('/employee/admin')}
              className="text-xs tracking-widest uppercase text-gold/40 hover:text-gold font-sans transition-colors duration-200"
            >
              Admin View →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
