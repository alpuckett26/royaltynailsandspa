'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const DEPOSIT = Number(process.env.NEXT_PUBLIC_DEPOSIT_AMOUNT ?? '25')

function fmtDate(d: string) {
  const [y, mo, day] = d.split('-').map(Number)
  return new Date(y, mo - 1, day).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
}

function fmt12h(t: string | null | undefined) {
  if (!t) return null
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

type Booking = {
  customerName: string
  customerEmail: string
  customerPhone: string
  service: string
  date: string
  time: string | null
  notes: string | null
}

function SuccessInner() {
  const params   = useSearchParams()
  const router   = useRouter()
  const [status, setStatus]   = useState<'loading' | 'success' | 'error'>('loading')
  const [booking, setBooking] = useState<Booking | null>(null)
  const [errMsg, setErrMsg]   = useState<string | null>(null)

  useEffect(() => {
    const data       = params.get('data')
    const checkoutId = params.get('checkoutId')

    if (!data || !checkoutId) {
      setStatus('error')
      setErrMsg('Something went wrong with your booking redirect. Please call us at (214) 501-4300.')
      return
    }

    let decoded: Booking
    try {
      decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'))
      setBooking(decoded)
    } catch {
      setStatus('error')
      setErrMsg('Invalid booking data. Please call us at (214) 501-4300.')
      return
    }

    fetch('/api/book/confirm', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...decoded, depositPaymentId: checkoutId }),
    })
      .then(r => r.json())
      .then(result => {
        if (result.error) {
          setStatus('error')
          setErrMsg(result.error)
        } else {
          setStatus('success')
        }
      })
      .catch(() => {
        setStatus('error')
        setErrMsg('Your payment went through but we could not save the appointment. Please call us at (214) 501-4300.')
      })
  }, [params])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border border-gold/40 border-t-gold rounded-full animate-spin" />
          <p className="text-sm font-sans text-offwhite/40">Confirming your booking…</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full border border-red-400/30 flex items-center justify-center">
            <span className="text-red-400 text-2xl">!</span>
          </div>
          <div>
            <h1 className="font-serif text-2xl text-offwhite mb-3">Something went wrong</h1>
            <p className="text-sm font-sans text-offwhite/50 leading-relaxed">{errMsg}</p>
          </div>
          <button onClick={() => router.push('/')}
            className="text-xs tracking-widest uppercase text-offwhite/30 hover:text-offwhite/60 font-sans transition-colors duration-200">
            ← Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center flex flex-col items-center gap-8"
      >
        <div className="w-20 h-20 rounded-full border border-gold/30 flex items-center justify-center">
          <span className="font-serif text-gold text-3xl">✓</span>
        </div>
        <div>
          <h1 className="font-serif text-3xl text-offwhite mb-3">You&apos;re Booked</h1>
          <p className="text-sm font-sans text-offwhite/50 leading-relaxed">
            Your ${DEPOSIT} deposit has been charged and your appointment is confirmed.
            A confirmation email with your calendar invite is on its way to{' '}
            <span className="text-offwhite/70">{booking?.customerEmail}</span>.
          </p>
        </div>
        {booking && (
          <div className="w-full border border-border rounded-sm divide-y divide-border/40 text-left">
            <div className="px-5 py-3 flex justify-between text-sm font-sans">
              <span className="text-offwhite/40">Service</span>
              <span className="text-offwhite">{booking.service}</span>
            </div>
            <div className="px-5 py-3 flex justify-between text-sm font-sans">
              <span className="text-offwhite/40">Date</span>
              <span className="text-offwhite">{fmtDate(booking.date)}</span>
            </div>
            {booking.time && (
              <div className="px-5 py-3 flex justify-between text-sm font-sans">
                <span className="text-offwhite/40">Time</span>
                <span className="text-offwhite">{fmt12h(booking.time)}</span>
              </div>
            )}
            <div className="px-5 py-3 flex justify-between text-sm font-sans bg-gold/5">
              <span className="text-offwhite/40">Deposit Paid</span>
              <span className="text-gold font-serif">${DEPOSIT}.00</span>
            </div>
          </div>
        )}
        <button onClick={() => router.push('/')}
          className="text-xs tracking-widest uppercase text-offwhite/30 hover:text-offwhite/60 font-sans transition-colors duration-200">
          ← Back to Home
        </button>
      </motion.div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="w-8 h-8 border border-gold/40 border-t-gold rounded-full animate-spin" />
      </div>
    }>
      <SuccessInner />
    </Suspense>
  )
}
