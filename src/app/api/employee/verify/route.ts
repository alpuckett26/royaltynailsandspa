import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from '@/lib/supabase'

// POST /api/employee/verify
// Body: { employeeId: string, pin: string }
// Returns employee data on success (never returns pin_hash).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { employeeId, pin } = body as { employeeId?: string; pin?: string }

    if (!employeeId || !pin) {
      return NextResponse.json({ error: 'Missing employeeId or pin' }, { status: 400 })
    }

    // Validate PIN is exactly 4 digits
    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: 'Invalid PIN format' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data: employee, error } = await supabase
      .from('employees')
      .select('id, name, role, pin_hash, active')
      .eq('id', employeeId)
      .single()

    if (error || !employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    if (!employee.active) {
      return NextResponse.json({ error: 'Account inactive' }, { status: 403 })
    }

    const valid = await bcrypt.compare(pin, employee.pin_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 })
    }

    // Return safe employee data (no pin_hash)
    return NextResponse.json({
      employee: {
        id: employee.id,
        name: employee.name,
        role: employee.role,
      },
    })
  } catch (err) {
    console.error('[employee/verify]', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
