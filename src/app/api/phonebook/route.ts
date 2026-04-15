import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// ── GET /api/phonebook?adminId=xxx ────────────────────────────────────────────
// Without email: returns deduplicated customer list.
// With email:    returns full appointment history for that customer.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const adminId = searchParams.get('adminId')
  const email   = searchParams.get('email')

  if (!adminId) {
    return NextResponse.json({ error: 'adminId is required' }, { status: 400 })
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

  // ── Single customer history ──────────────────────────────────────────────
  if (email) {
    const { data, error } = await supabase
      .from('appointments')
      .select('id, service, appointment_date, appointment_time, notes, checked_in, created_at')
      .eq('customer_email', email.toLowerCase().trim())
      .order('appointment_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
    return NextResponse.json({ history: data })
  }

  // ── All customers list ───────────────────────────────────────────────────
  const { data, error } = await supabase
    .from('appointments')
    .select('customer_name, customer_email, customer_phone, service, appointment_date, created_at')
    .not('customer_email', 'is', null)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }

  // Deduplicate by email — keep most recent as the canonical record
  const map = new Map<string, {
    name: string
    email: string
    phone: string | null
    lastService: string
    lastVisit: string
    visits: number
  }>()

  for (const row of data ?? []) {
    const key = row.customer_email.toLowerCase().trim()
    if (map.has(key)) {
      map.get(key)!.visits += 1
    } else {
      map.set(key, {
        name:        row.customer_name,
        email:       row.customer_email,
        phone:       row.customer_phone,
        lastService: row.service,
        lastVisit:   row.appointment_date,
        visits:      1,
      })
    }
  }

  const customers = Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  return NextResponse.json({ customers })
}
