import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// ── POST /api/checkin ─────────────────────────────────────────────────────────
// Body: { customerName: string, service: string, notes?: string }
// Returns: { id: string }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      customerName?: string
      service?: string
      notes?: string
    }

    const { customerName, service, notes } = body

    if (!customerName?.trim() || !service?.trim()) {
      return NextResponse.json(
        { error: 'customerName and service are required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('checkin_queue')
      .insert({
        customer_name: customerName.trim(),
        service: service.trim(),
        notes: notes?.trim() || null,
      })
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({ id: data.id }, { status: 201 })
  } catch (err) {
    console.error('[checkin POST]', err)
    return NextResponse.json({ error: 'Failed to check in' }, { status: 500 })
  }
}

// ── GET /api/checkin ──────────────────────────────────────────────────────────
// Query: ?status=waiting|served  &date=YYYY-MM-DD (optional, filters by created_at date)
// Returns: { queue: CheckInRow[] }
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') ?? 'waiting'
    const date   = searchParams.get('date') // e.g. "2026-02-28"

    const supabase = getSupabaseAdmin()
    let query = supabase
      .from('checkin_queue')
      .select('id, customer_name, service, notes, status, created_at, served_at, served_by_name')
      .eq('status', status)

    if (date) {
      // created_at >= start of day, < start of next day (UTC)
      query = query
        .gte('created_at', `${date}T00:00:00.000Z`)
        .lt('created_at',  `${date}T23:59:59.999Z`)
    }

    query = query.order('created_at', { ascending: status === 'waiting' ? true : false })

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ queue: data })
  } catch (err) {
    console.error('[checkin GET]', err)
    return NextResponse.json({ error: 'Failed to fetch queue' }, { status: 500 })
  }
}

// ── PATCH /api/checkin ────────────────────────────────────────────────────────
// Body: { id: string, employeeId?: string }
// Marks the entry as served.
// employeeId is optional — omit it for kiosk use (trusted physical device).
// If provided, the employee must be active.
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json() as { id?: string; employeeId?: string }
    const { id, employeeId } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    let servedByName: string | null = null

    // If an employeeId was provided, verify they are active and get their name
    if (employeeId) {
      const { data: emp, error: empErr } = await supabase
        .from('employees')
        .select('id, name, active')
        .eq('id', employeeId)
        .single()

      if (empErr || !emp || !emp.active) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }

      servedByName = emp.name
    }

    const { error } = await supabase
      .from('checkin_queue')
      .update({
        status: 'served',
        served_at: new Date().toISOString(),
        served_by_name: servedByName,
      })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[checkin PATCH]', err)
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 })
  }
}
