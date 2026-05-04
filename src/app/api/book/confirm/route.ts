import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendBookingNotification, sendCustomerConfirmation } from '@/lib/email'

const DEPOSIT_CENTS = Number(process.env.DEPOSIT_AMOUNT_CENTS ?? '2500')

// POST /api/book/confirm
// Called by /book/success after Square redirects back.
// Saves the appointment to Supabase (idempotent on deposit_payment_id)
// and sends confirmation emails.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      customerName?: string
      customerEmail?: string
      customerPhone?: string
      service?: string
      date?: string
      time?: string | null
      notes?: string | null
      depositPaymentId?: string
    }

    const { customerName, customerEmail, customerPhone, service, date, time, notes, depositPaymentId } = body

    if (!customerName || !customerEmail || !service || !depositPaymentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Idempotency — don't double-save if the page is refreshed
    const { data: existing } = await supabase
      .from('appointments')
      .select('id')
      .eq('deposit_payment_id', depositPaymentId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ id: existing.id })
    }

    // Save appointment
    const { data: appt, error: apptErr } = await supabase
      .from('appointments')
      .insert({
        customer_name:      customerName,
        customer_email:     customerEmail,
        customer_phone:     customerPhone ?? null,
        service,
        appointment_date:   date ?? new Date().toISOString().split('T')[0],
        appointment_time:   time ?? null,
        notes:              notes ?? null,
        deposit_amount:     DEPOSIT_CENTS,
        deposit_payment_id: depositPaymentId,
      })
      .select('id')
      .single()

    if (apptErr) {
      console.error('[book/confirm] DB insert failed', apptErr)
      return NextResponse.json(
        { error: 'Appointment could not be saved. Please call us at (214) 501-4300.' },
        { status: 500 },
      )
    }

    // Send emails (non-blocking)
    void sendBookingNotification({ customerName, customerEmail, customerPhone, service, date: date ?? '', time, notes })
    void sendCustomerConfirmation({ customerName, customerEmail, service, date: date ?? '', time, notes, appointmentId: appt.id })

    return NextResponse.json({ id: appt.id })
  } catch (err) {
    console.error('[book/confirm]', err)
    return NextResponse.json({ error: 'Booking confirmation failed.' }, { status: 500 })
  }
}
