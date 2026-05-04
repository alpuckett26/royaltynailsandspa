import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// GET /api/admin/dashboard?adminId=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const adminId = searchParams.get('adminId')
    if (!adminId) return NextResponse.json({ error: 'adminId required' }, { status: 400 })

    const supabase = getSupabaseAdmin()

    // Verify admin
    const { data: admin } = await supabase
      .from('employees').select('id, role, active')
      .eq('id', adminId).eq('active', true).single()
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0]

    // Sun-Sat pay week
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const [apptRes, queueRes, clockedInRes, hoursRes] = await Promise.all([
      supabase.from('appointments')
        .select('id, customer_name, customer_phone, service, appointment_time, notes, checked_in')
        .eq('appointment_date', today)
        .order('appointment_time', { ascending: true }),

      supabase.from('checkin_queue')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'waiting'),

      supabase.from('time_entries')
        .select('id, clock_in, employees(id, name)')
        .is('clock_out', null),

      supabase.from('time_entries')
        .select('clock_in, clock_out')
        .gte('clock_in', weekStart.toISOString())
        .not('clock_out', 'is', null),
    ])

    const appointments  = apptRes.data ?? []
    const queueCount    = queueRes.count ?? 0
    const clockedIn     = clockedInRes.data ?? []
    const weekEntries   = hoursRes.data ?? []

    const weekMinutes = weekEntries.reduce((sum, e) => {
      if (!e.clock_out) return sum
      return sum + Math.round(
        (new Date(e.clock_out).getTime() - new Date(e.clock_in).getTime()) / 60000
      )
    }, 0)

    return NextResponse.json({
      today,
      appointments,
      checkedInCount: appointments.filter(a => a.checked_in).length,
      queueCount,
      clockedIn: clockedIn.map(e => ({
        entryId: e.id,
        clockIn: e.clock_in,
        employee: e.employees,
      })),
      weekMinutes,
    })
  } catch (err) {
    console.error('[admin/dashboard]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
