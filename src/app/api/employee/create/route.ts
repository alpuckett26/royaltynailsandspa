import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from '@/lib/supabase'

// POST /api/employee/create
// Body: { adminId: string, name: string, pin: string, role?: 'staff' | 'admin' }
// Requires the requestor to be an admin (verified by adminId in DB).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      adminId?: string
      name?: string
      pin?: string
      role?: string
    }

    const { adminId, name, pin, role = 'staff' } = body

    if (!adminId || !name || !pin) {
      return NextResponse.json(
        { error: 'adminId, name, and pin are required' },
        { status: 400 }
      )
    }

    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN must be exactly 4 digits' }, { status: 400 })
    }

    if (!['staff', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'role must be staff or admin' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Verify the requester is an active admin
    const { data: admin, error: adminError } = await supabase
      .from('employees')
      .select('id, role, active')
      .eq('id', adminId)
      .single()

    if (adminError || !admin || !admin.active || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Hash the PIN
    const pin_hash = await bcrypt.hash(pin, 10)

    // Insert new employee
    const { data: employee, error: insertError } = await supabase
      .from('employees')
      .insert({ name: name.trim(), pin_hash, role })
      .select('id, name, role, created_at')
      .single()

    if (insertError) throw insertError

    return NextResponse.json({ employee }, { status: 201 })
  } catch (err) {
    console.error('[employee/create]', err)
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 })
  }
}
