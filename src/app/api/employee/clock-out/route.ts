import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// POST /api/employee/clock-out
// Body: { employeeId: string }
export async function POST(req: NextRequest) {
  try {
    const { employeeId } = await req.json() as { employeeId?: string }

    if (!employeeId) {
      return NextResponse.json({ error: 'Missing employeeId' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Find the open entry
    const { data: openEntry, error: findError } = await supabase
      .from('time_entries')
      .select('id, clock_in')
      .eq('employee_id', employeeId)
      .is('clock_out', null)
      .maybeSingle()

    if (findError) throw findError

    if (!openEntry) {
      return NextResponse.json({ error: 'Not currently clocked in' }, { status: 409 })
    }

    const clockOut = new Date().toISOString()

    // Update with clock-out time
    const { data: entry, error: updateError } = await supabase
      .from('time_entries')
      .update({ clock_out: clockOut })
      .eq('id', openEntry.id)
      .select()
      .single()

    if (updateError) throw updateError

    // Calculate duration in minutes
    const durationMs = new Date(clockOut).getTime() - new Date(openEntry.clock_in).getTime()
    const durationMinutes = Math.round(durationMs / 60000)

    return NextResponse.json({ entry, durationMinutes })
  } catch (err) {
    console.error('[employee/clock-out]', err)
    return NextResponse.json({ error: 'Clock-out failed' }, { status: 500 })
  }
}
