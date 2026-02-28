'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'

type ClockPanelProps = {
  isClockedIn: boolean
  clockInTime: string | null   // ISO string
  todayMinutes: number
  onClockIn: () => Promise<void>
  onClockOut: () => Promise<void>
  employeeName: string
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function LiveTimer({ since }: { since: string }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const calc = () =>
      Math.round((Date.now() - new Date(since).getTime()) / 60000)
    setElapsed(calc())
    const id = setInterval(() => setElapsed(calc()), 30000)
    return () => clearInterval(id)
  }, [since])

  return (
    <span className="font-serif text-5xl text-gold tabular-nums">
      {formatDuration(elapsed)}
    </span>
  )
}

export function ClockPanel({
  isClockedIn,
  clockInTime,
  todayMinutes,
  onClockIn,
  onClockOut,
  employeeName,
}: ClockPanelProps) {
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const handle = async (action: () => Promise<void>, msg: string) => {
    setLoading(true)
    setFeedback(null)
    try {
      await action()
      setFeedback(msg)
      setTimeout(() => setFeedback(null), 3000)
    } catch {
      setFeedback('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-sm mx-auto text-center">
      {/* Greeting */}
      <div>
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 font-sans mb-1">
          Welcome back
        </p>
        <h2 className="font-serif text-3xl text-offwhite">{employeeName}</h2>
      </div>

      {/* Status card */}
      <motion.div
        layout
        className={clsx(
          'w-full glass-card rounded-sm p-10 flex flex-col items-center gap-4 border',
          isClockedIn ? 'border-gold/30 shadow-gold' : 'border-border'
        )}
      >
        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <span
            className={clsx(
              'w-2 h-2 rounded-full',
              isClockedIn ? 'bg-gold animate-pulse-slow' : 'bg-offwhite/20'
            )}
          />
          <span
            className={clsx(
              'text-xs tracking-widest uppercase font-sans',
              isClockedIn ? 'text-gold/80' : 'text-offwhite/30'
            )}
          >
            {isClockedIn ? 'Clocked In' : 'Clocked Out'}
          </span>
        </div>

        {/* Timer or idle */}
        <AnimatePresence mode="wait">
          {isClockedIn && clockInTime ? (
            <motion.div
              key="in"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-1"
            >
              <LiveTimer since={clockInTime} />
              <p className="text-xs text-offwhite/35 font-sans">
                since {formatTime(clockInTime)}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="out"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-serif text-4xl text-offwhite/15"
            >
              – – : – –
            </motion.div>
          )}
        </AnimatePresence>

        {/* Today total */}
        {todayMinutes > 0 && (
          <p className="text-xs text-offwhite/40 font-sans">
            Today total:{' '}
            <span className="text-offwhite/70">{formatDuration(todayMinutes)}</span>
          </p>
        )}
      </motion.div>

      {/* Action button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() =>
          isClockedIn
            ? handle(onClockOut, 'Clocked out. See you next time!')
            : handle(onClockIn, 'Clocked in. Have a great shift!')
        }
        disabled={loading}
        className={clsx(
          'w-full py-5 text-sm tracking-widest uppercase font-sans transition-all duration-300',
          isClockedIn
            ? 'bg-transparent border border-gold/40 text-gold hover:bg-gold/5'
            : 'bg-gold text-charcoal hover:bg-gold-light shadow-gold-md',
          loading && 'opacity-50 pointer-events-none'
        )}
      >
        {loading ? '...' : isClockedIn ? 'Clock Out' : 'Clock In'}
      </motion.button>

      {/* Feedback toast */}
      <AnimatePresence>
        {feedback && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-gold/80 font-sans"
          >
            {feedback}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
