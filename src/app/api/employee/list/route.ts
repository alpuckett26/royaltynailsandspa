import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// GET /api/employee/list
// Returns active employee names + IDs for the login screen.
// PIN hashes are never returned.
export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('employees')
      .select('id, name, role')
      .eq('active', true)
      .order('name')

    if (error) throw error

    return NextResponse.json({ employees: data })
  } catch (err) {
    console.error('[employee/list]', err)
    return NextResponse.json({ error: 'Failed to load employees' }, { status: 500 })
  }
}
