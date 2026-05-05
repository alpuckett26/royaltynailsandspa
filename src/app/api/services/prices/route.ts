import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// GET /api/services/prices — public
// Returns { prices: { [name]: { price: number, priceNote: string | null } } }
export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('service_prices')
      .select('name, price, price_note')
    if (error) throw error
    const prices: Record<string, { price: number; priceNote: string | null }> = {}
    for (const row of data ?? []) {
      prices[row.name] = { price: Number(row.price), priceNote: row.price_note }
    }
    return NextResponse.json({ prices })
  } catch (err) {
    console.error('[services/prices GET]', err)
    return NextResponse.json({ prices: {} })
  }
}

// PATCH /api/services/prices — admin only
// Body: { adminId, name, price, priceNote? }
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json() as {
      adminId?: string; name?: string; price?: number; priceNote?: string | null
    }
    const { adminId, name, price, priceNote } = body
    if (!adminId || !name || price === undefined) {
      return NextResponse.json({ error: 'adminId, name, and price are required' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data: admin } = await supabase
      .from('employees').select('role, active').eq('id', adminId).eq('active', true).single()
    if (admin?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase.from('service_prices').upsert({
      name,
      price: Number(price),
      price_note: priceNote ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'name' })

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[services/prices PATCH]', err)
    return NextResponse.json({ error: 'Failed to update price' }, { status: 500 })
  }
}
