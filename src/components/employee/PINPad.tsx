'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'

type PINPadProps = {
  onComplete: (pin: string) => void
  loading?: boolean
  error?: string | null
  onCancel?: () => void
  employeeName: string
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']
const PIN_LENGTH = 4

export function PINPad({ onComplete, loading, error, onCancel, employeeName }: PINPadProps) {
  const [pin, setPin] = useState('')

  const handleKey = (key: string) => {
    if (loading) return

    if (key === '⌫') {
      setPin((p) => p.slice(0, -1))
      return
    }
    if (key === '') return

    const next = pin + key
    setPin(next)

    if (next.length === PIN_LENGTH) {
      onComplete(next)
      // Reset after a short delay so the last dot fills visually
      setTimeout(() => setPin(''), 400)
    }
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-xs mx-auto">
      {/* Employee name */}
      <div className="text-center">
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold/60 font-sans mb-2">
          Clocking in as
        </p>
        <h2 className="font-serif text-2xl text-offwhite">{employeeName}</h2>
      </div>

      {/* PIN dots */}
      <div className="flex gap-4 items-center justify-center h-8">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: pin.length === i + 1 ? [1, 1.3, 1] : 1,
              backgroundColor: i < pin.length ? '#C6A15B' : 'transparent',
            }}
            transition={{ duration: 0.2 }}
            className="w-3 h-3 rounded-full border border-gold/40"
          />
        ))}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-red-400 font-sans text-center -mt-4"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Number grid */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {KEYS.map((key, i) => (
          <button
            key={i}
            onClick={() => handleKey(key)}
            disabled={loading || key === ''}
            aria-label={key === '⌫' ? 'Delete' : key === '' ? '' : `Press ${key}`}
            className={clsx(
              'h-16 rounded-sm font-sans text-xl transition-all duration-150 select-none',
              key === ''
                ? 'pointer-events-none'
                : key === '⌫'
                ? 'text-offwhite/40 hover:text-offwhite border border-border hover:border-gold/30 active:scale-95'
                : 'text-offwhite border border-border hover:border-gold/40 hover:bg-gold/5 active:scale-95 active:bg-gold/10',
              loading && 'opacity-40 pointer-events-none'
            )}
          >
            {loading && key !== '⌫' && key !== '' ? (
              <span className="text-xs text-offwhite/30">•</span>
            ) : (
              key
            )}
          </button>
        ))}
      </div>

      {/* Cancel */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="text-xs text-offwhite/30 hover:text-offwhite/60 font-sans tracking-widest uppercase transition-colors duration-200"
        >
          ← Back
        </button>
      )}
    </div>
  )
}
