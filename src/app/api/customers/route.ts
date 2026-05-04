import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export type CustomerRecord = {
  name: string
  email: string | null
  phone: string | null
  lastService: string
  lastVisit: string
  visitCount: number
  visits: Array<{
    id: string
    service: string
    date: string
    time: string
    notes: string | null
  }>
}

// GET /api/customers
// Returns all unique customers from the appointments table, deduplicated by name.
// Requires a valid employeeId query param.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employeeId')
    if (!employeeId) {
      return NextResponse.json({ error: 'employeeId required' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Verify employee is active
    const { data: emp } = await supabase
      .from('employees')
      .select('id, active')
      .eq('id', employeeId)
      .eq('active', true)
      .single()
    if (!emp) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('id, customer_name, customer_email, customer_phone, service, appointment_date, appointment_time, notes')
      .order('appointment_date', { ascending: false })

    if (error) throw error

    // Deduplicate by customer name (case-insensitive)
    const map = new Map<string, CustomerRecord>()

    for (const appt of appointments ?? []) {
      const key = appt.customer_name.trim().toLowerCase()
      if (!map.has(key)) {
        map.set(key, {
          name: appt.customer_name.trim(),
          email: appt.customer_email || null,
          phone: appt.customer_phone || null,
          lastService: appt.service,
          lastVisit: appt.appointment_date,
          visitCount: 0,
          visits: [],
        })
      }
      const record = map.get(key)!
      // Keep the most complete contact info seen across bookings
      if (!record.email && appt.customer_email) record.email = appt.customer_email
      if (!record.phone && appt.customer_phone) record.phone = appt.customer_phone
      record.visitCount++
      record.visits.push({
        id: appt.id,
        service: appt.service,
        date: appt.appointment_date,
        time: appt.appointment_time,
        notes: appt.notes,
      })
    }

    const customers = Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    )

    return NextResponse.json({ customers })
  } catch (err) {
    console.error('[customers]', err)
    return NextResponse.json({ error: 'Failed to load customers' }, { status: 500 })
  }
}
