import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from '@/lib/supabase'

// POST /api/employee/setup
// Creates the first admin employee — only works when the employees table is empty.
// Once any employee exists, this endpoint returns 403.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { name?: string; pin?: string }
    const { name, pin } = body

    if (!name || !pin) {
      return NextResponse.json({ error: 'Name and PIN are required' }, { status: 400 })
    }

    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN must be exactly 4 digits' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Only allowed when no employees exist
    const { count } = await supabase
      .from('employees')
      .select('id', { count: 'exact', head: true })

    if (count !== 0) {
      return NextResponse.json(
        { error: 'Setup already complete. Use the admin portal to add employees.' },
        { status: 403 }
      )
    }

    const pin_hash = await bcrypt.hash(pin, 10)

    const { data: employee, error } = await supabase
      .from('employees')
      .insert({ name: name.trim(), pin_hash, role: 'admin' })
      .select('id, name, role')
      .single()

    if (error) throw error

    return NextResponse.json({ employee }, { status: 201 })
  } catch (err) {
    console.error('[employee/setup]', err)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}

// GET — lets the page check if setup is still needed
export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { count, error } = await supabase
      .from('employees')
      .select('id', { count: 'exact', head: true })

    if (error) throw error

    return NextResponse.json({ setupRequired: count === 0 })
  } catch (err) {
    console.error('[employee/setup GET]', err)
    return NextResponse.json({ error: 'Failed to check setup status' }, { status: 500 })
  }
}
