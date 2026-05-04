import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

async function verifyAdmin(supabase: ReturnType<typeof getSupabaseAdmin>, adminId: string) {
  const { data } = await supabase
    .from('employees').select('id, role, active')
    .eq('id', adminId).eq('active', true).single()
  return data?.role === 'admin'
}

// GET /api/admin/specials?adminId=xxx (optional — if admin, returns all; otherwise active only)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const adminId = searchParams.get('adminId')
  const supabase = getSupabaseAdmin()

  let query = supabase.from('specials').select('*').order('sort_order', { ascending: true })

  if (adminId) {
    const isAdmin = await verifyAdmin(supabase, adminId)
    if (!isAdmin) query = query.eq('active', true)
  } else {
    query = query.eq('active', true)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'Failed to fetch specials' }, { status: 500 })
  return NextResponse.json({ specials: data ?? [] })
}

// POST /api/admin/specials
// Body: { adminId, eyebrow?, title, description, offer, badge?, validThrough? }
export async function POST(req: NextRequest) {
  const body = await req.json() as {
    adminId?: string; eyebrow?: string; title?: string
    description?: string; offer?: string; badge?: string; validThrough?: string
  }
  const { adminId, eyebrow, title, description, offer, badge, validThrough } = body

  if (!adminId || !title?.trim() || !description?.trim() || !offer?.trim()) {
    return NextResponse.json({ error: 'adminId, title, description, and offer are required' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  if (!(await verifyAdmin(supabase, adminId))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: maxRow } = await supabase.from('specials').select('sort_order').order('sort_order', { ascending: false }).limit(1).single()
  const sort_order = (maxRow?.sort_order ?? -1) + 1

  const { data, error } = await supabase.from('specials').insert({
    eyebrow: eyebrow?.trim() || null,
    title: title.trim(),
    description: description.trim(),
    offer: offer.trim(),
    badge: badge?.trim() || null,
    valid_through: validThrough || null,
    sort_order,
  }).select().single()

  if (error) return NextResponse.json({ error: 'Failed to create special' }, { status: 500 })
  return NextResponse.json({ special: data }, { status: 201 })
}

// PATCH /api/admin/specials
// Body: { adminId, id, ...fields }
export async function PATCH(req: NextRequest) {
  const body = await req.json() as Record<string, unknown>
  const { adminId, id, ...fields } = body as {
    adminId?: string; id?: string
    eyebrow?: string; title?: string; description?: string; offer?: string
    badge?: string; validThrough?: string; active?: boolean; sort_order?: number
  }

  if (!adminId || !id) {
    return NextResponse.json({ error: 'adminId and id are required' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  if (!(await verifyAdmin(supabase, adminId))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const update: Record<string, unknown> = {}
  if (fields.eyebrow !== undefined) update.eyebrow = fields.eyebrow?.trim() || null
  if (fields.title !== undefined) update.title = fields.title?.trim()
  if (fields.description !== undefined) update.description = fields.description?.trim()
  if (fields.offer !== undefined) update.offer = fields.offer?.trim()
  if (fields.badge !== undefined) update.badge = fields.badge?.trim() || null
  if (fields.validThrough !== undefined) update.valid_through = fields.validThrough || null
  if (fields.active !== undefined) update.active = fields.active
  if (fields.sort_order !== undefined) update.sort_order = fields.sort_order

  const { data, error } = await supabase.from('specials').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: 'Failed to update special' }, { status: 500 })
  return NextResponse.json({ special: data })
}

// DELETE /api/admin/specials?id=&adminId=
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id'); const adminId = searchParams.get('adminId')

  if (!id || !adminId) {
    return NextResponse.json({ error: 'id and adminId are required' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  if (!(await verifyAdmin(supabase, adminId))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase.from('specials').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Failed to delete special' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
