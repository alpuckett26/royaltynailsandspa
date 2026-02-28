import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// GET /api/employee/shifts?employeeId=xxx&from=date&to=date
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employeeId')
    const from = searchParams.get('from')
    const to   = searchParams.get('to')

    const supabase = getSupabaseAdmin()
    let query = supabase
      .from('shifts')
      .select('id, employee_id, shift_date, start_time, end_time, notes, employees(name)')
      .order('shift_date', { ascending: true })
      .order('start_time', { ascending: true })

    if (employeeId) query = query.eq('employee_id', employeeId)
    if (from)       query = query.gte('shift_date', from)
    if (to)         query = query.lte('shift_date', to)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ shifts: data })
  } catch (err) {
    console.error('[shifts GET]', err)
    return NextResponse.json({ error: 'Failed to load shifts' }, { status: 500 })
  }
}

// POST /api/employee/shifts — create a shift
// Body: { adminId, employeeId, shiftDate, startTime, endTime, notes? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      adminId?: string
      employeeId?: string
      shiftDate?: string
      startTime?: string
      endTime?: string
      notes?: string
    }
    const { adminId, employeeId, shiftDate, startTime, endTime, notes } = body

    if (!adminId || !employeeId || !shiftDate || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Verify admin
    const { data: admin } = await supabase
      .from('employees')
      .select('role, active')
      .eq('id', adminId)
      .single()

    if (!admin || !admin.active || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { data: shift, error } = await supabase
      .from('shifts')
      .insert({ employee_id: employeeId, shift_date: shiftDate, start_time: startTime, end_time: endTime, notes: notes ?? null })
      .select('id, employee_id, shift_date, start_time, end_time, notes')
      .single()

    if (error) throw error

    return NextResponse.json({ shift }, { status: 201 })
  } catch (err) {
    console.error('[shifts POST]', err)
    return NextResponse.json({ error: 'Failed to create shift' }, { status: 500 })
  }
}

// DELETE /api/employee/shifts?shiftId=xxx&adminId=xxx
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const shiftId = searchParams.get('shiftId')
    const adminId = searchParams.get('adminId')

    if (!shiftId || !adminId) {
      return NextResponse.json({ error: 'Missing shiftId or adminId' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { data: admin } = await supabase
      .from('employees')
      .select('role, active')
      .eq('id', adminId)
      .single()

    if (!admin || !admin.active || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { error } = await supabase.from('shifts').delete().eq('id', shiftId)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[shifts DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete shift' }, { status: 500 })
  }
}
