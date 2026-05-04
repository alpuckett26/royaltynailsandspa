import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendBookingNotification, sendCustomerConfirmation } from '@/lib/email'

const SQ_BASE = process.env.SQUARE_ENV === 'production'
  ? 'https://connect.squareup.com'
  : 'https://connect.squareupsandbox.com'

const DEPOSIT_CENTS = Number(process.env.DEPOSIT_AMOUNT_CENTS ?? '2500')

// ── POST /api/book ─────────────────────────────────────────────────────────────
// Body: { sourceId, customerName, customerEmail, customerPhone, service, date, time?, notes? }
// 1. Charges Square deposit
// 2. Creates appointment in Supabase
// 3. Sends confirmation emails
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      sourceId?: string
      customerName?: string
      customerEmail?: string
      customerPhone?: string
      service?: string
      date?: string
      time?: string
      notes?: string
    }

    const { sourceId, customerName, customerEmail, customerPhone, service, date, time, notes } = body

    if (!sourceId || !customerName?.trim() || !customerEmail?.trim() || !customerPhone?.trim() || !service?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // ── 1. Charge deposit via Square ────────────────────────────────────────
    const paymentRes = await fetch(`${SQ_BASE}/v2/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Square-Version': '2024-01-18',
      },
      body: JSON.stringify({
        source_id:        sourceId,
        idempotency_key:  crypto.randomUUID(),
        amount_money:     { amount: DEPOSIT_CENTS, currency: 'USD' },
        location_id:      process.env.SQUARE_LOCATION_ID,
        note:             `Deposit — ${service} — ${customerName.trim()}`,
        buyer_email_address: customerEmail.trim(),
      }),
    })

    const paymentData = await paymentRes.json()

    if (!paymentRes.ok || paymentData.payment?.status !== 'COMPLETED') {
      const errMsg = paymentData.errors?.[0]?.detail ?? 'Payment failed. Please check your card details.'
      return NextResponse.json({ error: errMsg }, { status: 402 })
    }

    const paymentId = paymentData.payment.id

    // ── 2. Create appointment in Supabase ───────────────────────────────────
    const supabase = getSupabaseAdmin()
    const apptDate = date ?? new Date().toISOString().split('T')[0]

    const { data: appt, error: apptErr } = await supabase
      .from('appointments')
      .insert({
        customer_name:    customerName.trim(),
        customer_email:   customerEmail.trim(),
        customer_phone:   customerPhone.trim(),
        service:          service.trim(),
        appointment_date: apptDate,
        appointment_time: time || null,
        notes:            notes?.trim() || null,
        deposit_amount:   DEPOSIT_CENTS,
        deposit_payment_id: paymentId,
      })
      .select('id')
      .single()

    if (apptErr) {
      // Payment went through but DB failed — log it, don't charge twice
      console.error('[book] DB insert failed after payment', paymentId, apptErr)
      return NextResponse.json({ error: 'Appointment could not be saved. Please call us at (214) 501-4300.' }, { status: 500 })
    }

    // ── 3. Send emails (non-blocking) ───────────────────────────────────────
    void sendBookingNotification({
      customerName:  customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      service:       service.trim(),
      date:          apptDate,
      time,
      notes:         notes?.trim(),
    })

    void sendCustomerConfirmation({
      customerName:  customerName.trim(),
      customerEmail: customerEmail.trim(),
      service:       service.trim(),
      date:          apptDate,
      time,
      notes:         notes?.trim(),
      appointmentId: appt.id,
    })

    return NextResponse.json({ id: appt.id }, { status: 201 })
  } catch (err) {
    console.error('[book POST]', err)
    return NextResponse.json({ error: 'Booking failed. Please try again.' }, { status: 500 })
  }
}
