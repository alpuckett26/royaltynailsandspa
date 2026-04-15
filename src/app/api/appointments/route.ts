import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendBookingNotification, sendCustomerConfirmation } from '@/lib/email'

// ── GET /api/appointments?date=YYYY-MM-DD ─────────────────────────────────────
// Returns all appointments for the given date (defaults to today).
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('appointments')
      .select('id, customer_name, customer_email, customer_phone, service, appointment_date, appointment_time, notes, checked_in, created_at')
      .eq('appointment_date', date)
      .order('appointment_time', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ appointments: data })
  } catch (err) {
    console.error('[appointments GET]', err)
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}

// ── POST /api/appointments ────────────────────────────────────────────────────
// Body: { customerName, service, date?, time?, notes?, adminId }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      customerName?: string
      customerEmail?: string
      customerPhone?: string
      service?: string
      date?: string
      time?: string
      notes?: string
      adminId?: string
    }

    const { customerName, customerEmail, customerPhone, service, date, time, notes, adminId } = body

    if (!customerName?.trim() || !service?.trim() || !adminId) {
      return NextResponse.json(
        { error: 'customerName, service, and adminId are required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Verify requester is an active employee
    const { data: emp, error: empErr } = await supabase
      .from('employees')
      .select('id, active')
      .eq('id', adminId)
      .single()

    if (empErr || !emp || !emp.active) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        customer_name: customerName.trim(),
        customer_email: customerEmail?.trim() || null,
        customer_phone: customerPhone?.trim() || null,
        service: service.trim(),
        appointment_date: date ?? new Date().toISOString().split('T')[0],
        appointment_time: time || null,
        notes: notes?.trim() || null,
      })
      .select('id')
      .single()

    if (error) throw error

    // Send notification emails (non-blocking — failures don't affect the response)
    void sendBookingNotification({
      customerName:  customerName.trim(),
      customerEmail: customerEmail?.trim(),
      customerPhone: customerPhone?.trim(),
      service:       service.trim(),
      date:          date ?? new Date().toISOString().split('T')[0],
      time:          time,
      notes:         notes?.trim(),
    })

    if (customerEmail?.trim()) {
      void sendCustomerConfirmation({
        customerName:  customerName.trim(),
        customerEmail: customerEmail.trim(),
        service:       service.trim(),
        date:          date ?? new Date().toISOString().split('T')[0],
        time:          time,
        notes:         notes?.trim(),
        appointmentId: data.id,
      })
    }

    return NextResponse.json({ id: data.id }, { status: 201 })
  } catch (err) {
    console.error('[appointments POST]', err)
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
  }
}

// ── PATCH /api/appointments ───────────────────────────────────────────────────
// Body: { id, checkedIn?: boolean } — marks appointment checked_in (kiosk use, no auth needed)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json() as { id?: string; checkedIn?: boolean }
    const { id, checkedIn = true } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from('appointments')
      .update({ checked_in: checkedIn })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[appointments PATCH]', err)
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 })
  }
}

// ── DELETE /api/appointments?id=xxx&adminId=xxx ───────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id      = searchParams.get('id')
    const adminId = searchParams.get('adminId')

    if (!id || !adminId) {
      return NextResponse.json({ error: 'id and adminId are required' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { data: emp, error: empErr } = await supabase
      .from('employees')
      .select('id, active')
      .eq('id', adminId)
      .single()

    if (empErr || !emp || !emp.active) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[appointments DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 })
  }
}
