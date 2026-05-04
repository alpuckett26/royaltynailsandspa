import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// GET /api/admin/settings — public, returns all settings as flat key-value object
export async function GET() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('business_settings').select('key, value')
  if (error) return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })

  const settings: Record<string, string> = {}
  for (const row of data ?? []) settings[row.key] = row.value
  return NextResponse.json({ settings })
}

// PATCH /api/admin/settings
// Body: { adminId, settings: { [key]: value } }
export async function PATCH(req: NextRequest) {
  const body = await req.json() as { adminId?: string; settings?: Record<string, string> }
  const { adminId, settings } = body

  if (!adminId || !settings || typeof settings !== 'object') {
    return NextResponse.json({ error: 'adminId and settings object are required' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  const { data: admin } = await supabase
    .from('employees').select('id, role, active')
    .eq('id', adminId).eq('active', true).single()

  if (!admin || admin.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = Object.entries(settings).map(([key, value]) => ({
    key, value, updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase
    .from('business_settings')
    .upsert(rows, { onConflict: 'key' })

  if (error) return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
