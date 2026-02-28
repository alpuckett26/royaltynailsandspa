'use client'

import { motion } from 'framer-motion'

type Entry = {
  id: string
  clock_in: string
  clock_out: string | null
}

type HoursTableProps = {
  entries: Entry[]
  totalMinutes: number
  title?: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function calcDuration(clockIn: string, clockOut: string | null): string {
  if (!clockOut) return '—'
  const ms = new Date(clockOut).getTime() - new Date(clockIn).getTime()
  const totalMins = Math.round(ms / 60000)
  const h = Math.floor(totalMins / 60)
  const m = totalMins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function formatTotalHours(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m}m`
}

export function HoursTable({ entries, totalMinutes, title = 'Time Log' }: HoursTableProps) {
  if (entries.length === 0) {
    return (
      <div className="glass-card border border-border rounded-sm p-10 text-center">
        <p className="text-offwhite/30 text-sm font-sans">No entries for this period.</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card border border-border rounded-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
        <h3 className="font-serif text-lg text-offwhite">{title}</h3>
        <div className="text-right">
          <p className="text-[9px] tracking-widest uppercase text-offwhite/30 font-sans">Total</p>
          <p className="font-serif text-xl text-gold">{formatTotalHours(totalMinutes)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr className="border-b border-border/40">
              {['Date', 'In', 'Out', 'Duration'].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-[9px] tracking-[0.22em] uppercase text-offwhite/30 font-sans font-normal"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr
                key={entry.id}
                className="border-b border-border/20 last:border-0 hover:bg-offwhite/[0.02] transition-colors duration-150"
              >
                <td className="px-6 py-3.5 text-sm text-offwhite/60 font-sans">
                  {formatDate(entry.clock_in)}
                </td>
                <td className="px-6 py-3.5 text-sm text-offwhite/70 font-sans tabular-nums">
                  {formatTime(entry.clock_in)}
                </td>
                <td className="px-6 py-3.5 text-sm font-sans tabular-nums">
                  {entry.clock_out ? (
                    <span className="text-offwhite/70">{formatTime(entry.clock_out)}</span>
                  ) : (
                    <span className="text-gold/60 text-xs tracking-widest uppercase">Active</span>
                  )}
                </td>
                <td className="px-6 py-3.5 text-sm text-gold font-sans">
                  {calcDuration(entry.clock_in, entry.clock_out)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
