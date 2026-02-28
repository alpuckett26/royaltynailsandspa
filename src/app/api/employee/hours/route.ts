import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// GET /api/employee/hours
// Query params:
//   employeeId=xxx   (optional — omit to get ALL employees, admin only)
//   from=ISO-date    (default: start of current week)
//   to=ISO-date      (default: now)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employeeId')

    // Default range: current week (Mon–Sun)
    const now = new Date()
    const defaultFrom = new Date(now)
    const day = now.getDay() // 0=Sun
    const diffToMon = day === 0 ? -6 : 1 - day
    defaultFrom.setDate(now.getDate() + diffToMon)
    defaultFrom.setHours(0, 0, 0, 0)

    const from = searchParams.get('from') ?? defaultFrom.toISOString()
    const to   = searchParams.get('to')   ?? now.toISOString()

    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('time_entries')
      .select('*, employees(id, name, role)')
      .gte('clock_in', from)
      .lte('clock_in', to)
      .order('clock_in', { ascending: false })

    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }

    const { data: entries, error } = await query
    if (error) throw error

    // Group by employee and calculate totals
    type Summary = {
      employeeId: string
      name: string
      role: string
      totalMinutes: number
      entries: typeof entries
    }

    const summaryMap = new Map<string, Summary>()

    for (const entry of entries ?? []) {
      const emp = entry.employees as { id: string; name: string; role: string } | null
      if (!emp) continue

      if (!summaryMap.has(emp.id)) {
        summaryMap.set(emp.id, {
          employeeId: emp.id,
          name: emp.name,
          role: emp.role,
          totalMinutes: 0,
          entries: [],
        })
      }

      const summary = summaryMap.get(emp.id)!
      summary.entries.push(entry)

      if (entry.clock_out) {
        const ms = new Date(entry.clock_out).getTime() - new Date(entry.clock_in).getTime()
        summary.totalMinutes += Math.round(ms / 60000)
      }
    }

    return NextResponse.json({
      summaries: Array.from(summaryMap.values()),
      from,
      to,
    })
  } catch (err) {
    console.error('[employee/hours]', err)
    return NextResponse.json({ error: 'Failed to load hours' }, { status: 500 })
  }
}
