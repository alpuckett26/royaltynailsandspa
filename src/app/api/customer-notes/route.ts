import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// ── GET /api/customer-notes?email=xxx&adminId=xxx ─────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email   = searchParams.get('email')
  const adminId = searchParams.get('adminId')

  if (!email || !adminId) {
    return NextResponse.json({ error: 'email and adminId are required' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  const { data: emp, error: empErr } = await supabase
    .from('employees').select('id, active').eq('id', adminId).single()
  if (empErr || !emp?.active) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('customer_notes')
    .select('id, note, created_by, created_at')
    .eq('customer_email', email.toLowerCase().trim())
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })

  return NextResponse.json({ notes: data })
}

// ── POST /api/customer-notes ──────────────────────────────────────────────────
// Body: { customerEmail, note, adminId }
export async function POST(req: NextRequest) {
  const body = await req.json() as { customerEmail?: string; note?: string; adminId?: string }
  const { customerEmail, note, adminId } = body

  if (!customerEmail?.trim() || !note?.trim() || !adminId) {
    return NextResponse.json({ error: 'customerEmail, note, and adminId are required' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  const { data: emp, error: empErr } = await supabase
    .from('employees').select('id, name, active').eq('id', adminId).single()
  if (empErr || !emp?.active) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('customer_notes')
    .insert({
      customer_email: customerEmail.toLowerCase().trim(),
      note:           note.trim(),
      created_by:     emp.name,
    })
    .select('id, note, created_by, created_at')
    .single()

  if (error) return NextResponse.json({ error: 'Failed to save note' }, { status: 500 })

  return NextResponse.json({ note: data }, { status: 201 })
}

// ── DELETE /api/customer-notes?id=xxx&adminId=xxx ─────────────────────────────
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id      = searchParams.get('id')
  const adminId = searchParams.get('adminId')

  if (!id || !adminId) {
    return NextResponse.json({ error: 'id and adminId are required' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  const { data: emp, error: empErr } = await supabase
    .from('employees').select('id, active').eq('id', adminId).single()
  if (empErr || !emp?.active) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { error } = await supabase.from('customer_notes').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
