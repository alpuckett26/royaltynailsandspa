import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// PATCH /api/employee/deactivate
// Body: { adminId, employeeId }
export async function PATCH(req: NextRequest) {
  const body = await req.json() as { adminId?: string; employeeId?: string }
  const { adminId, employeeId } = body

  if (!adminId || !employeeId) {
    return NextResponse.json({ error: 'adminId and employeeId are required' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  const { data: admin } = await supabase
    .from('employees').select('id, role, active')
    .eq('id', adminId).eq('active', true).single()

  if (!admin || admin.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (adminId === employeeId) {
    return NextResponse.json({ error: 'Cannot deactivate your own account' }, { status: 400 })
  }

  const { error } = await supabase
    .from('employees').update({ active: false }).eq('id', employeeId)

  if (error) {
    return NextResponse.json({ error: 'Failed to deactivate employee' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
