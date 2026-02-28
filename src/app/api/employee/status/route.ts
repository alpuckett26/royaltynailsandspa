import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// GET /api/employee/status?employeeId=xxx
// Returns the employee's current clock-in status and today's entries.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employeeId')

    if (!employeeId) {
      return NextResponse.json({ error: 'Missing employeeId' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Open entry (currently clocked in)
    const { data: openEntry } = await supabase
      .from('time_entries')
      .select('id, clock_in')
      .eq('employee_id', employeeId)
      .is('clock_out', null)
      .maybeSingle()

    // Today's completed entries
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { data: todayEntries } = await supabase
      .from('time_entries')
      .select('id, clock_in, clock_out')
      .eq('employee_id', employeeId)
      .gte('clock_in', todayStart.toISOString())
      .order('clock_in', { ascending: false })

    // Calculate today's total minutes
    const todayMinutes = (todayEntries ?? []).reduce((acc, e) => {
      if (!e.clock_out) return acc
      const ms = new Date(e.clock_out).getTime() - new Date(e.clock_in).getTime()
      return acc + Math.round(ms / 60000)
    }, 0)

    return NextResponse.json({
      isClockedIn: !!openEntry,
      openEntry: openEntry ?? null,
      todayEntries: todayEntries ?? [],
      todayMinutes,
    })
  } catch (err) {
    console.error('[employee/status]', err)
    return NextResponse.json({ error: 'Failed to load status' }, { status: 500 })
  }
}
