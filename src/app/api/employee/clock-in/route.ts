import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// POST /api/employee/clock-in
// Body: { employeeId: string }
export async function POST(req: NextRequest) {
  try {
    const { employeeId } = await req.json() as { employeeId?: string }

    if (!employeeId) {
      return NextResponse.json({ error: 'Missing employeeId' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Check no open entry already exists
    const { data: existing } = await supabase
      .from('time_entries')
      .select('id')
      .eq('employee_id', employeeId)
      .is('clock_out', null)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Already clocked in' }, { status: 409 })
    }

    // Create new entry
    const { data: entry, error } = await supabase
      .from('time_entries')
      .insert({ employee_id: employeeId, clock_in: new Date().toISOString() })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ entry })
  } catch (err) {
    console.error('[employee/clock-in]', err)
    return NextResponse.json({ error: 'Clock-in failed' }, { status: 500 })
  }
}
