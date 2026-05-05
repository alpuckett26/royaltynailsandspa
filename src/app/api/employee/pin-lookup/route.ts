import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from '@/lib/supabase'

// POST /api/employee/pin-lookup
// Body: { pin: string }
// Finds the active employee whose PIN matches. Used by the check-in queue so
// any technician can claim a walk-in customer without needing to be pre-selected.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { pin } = body as { pin?: string }

    if (!pin || !/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data: employees, error } = await supabase
      .from('employees')
      .select('id, name, role, pin_hash')
      .eq('active', true)

    if (error) throw error

    for (const emp of employees ?? []) {
      const match = await bcrypt.compare(pin, emp.pin_hash)
      if (match) {
        return NextResponse.json({
          employee: { id: emp.id, name: emp.name, role: emp.role },
        })
      }
    }

    return NextResponse.json({ error: 'PIN not recognized' }, { status: 401 })
  } catch (err) {
    console.error('[pin-lookup]', err)
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 })
  }
}
