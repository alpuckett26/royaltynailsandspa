import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

function generateTicket(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const rand = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `RNS-${rand}`
}

async function verifyAdmin(supabase: ReturnType<typeof getSupabaseAdmin>, adminId: string) {
  const { data } = await supabase
    .from('employees').select('id, role, active')
    .eq('id', adminId).eq('active', true).single()
  return data?.role === 'admin'
}

// POST /api/complaints — public, no auth required
// Body: { customerName, customerEmail?, customerPhone?, appointmentDate?, appointmentTime?, employeeName?, service?, complaint }
export async function POST(req: NextRequest) {
  const body = await req.json() as {
    customerName?: string; customerEmail?: string; customerPhone?: string
    appointmentDate?: string; appointmentTime?: string
    employeeName?: string; service?: string; complaint?: string
  }

  const { customerName, customerEmail, customerPhone, appointmentDate, appointmentTime, employeeName, service, complaint } = body

  if (!customerName?.trim() || !complaint?.trim()) {
    return NextResponse.json({ error: 'Name and complaint are required' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  // Generate unique ticket number (retry on collision, though extremely unlikely)
  let ticket = generateTicket()
  let attempts = 0
  while (attempts < 5) {
    const { data: existing } = await supabase.from('complaints').select('id').eq('ticket_number', ticket).single()
    if (!existing) break
    ticket = generateTicket()
    attempts++
  }

  const { data, error } = await supabase.from('complaints').insert({
    ticket_number:    ticket,
    customer_name:    customerName.trim(),
    customer_email:   customerEmail?.trim() || null,
    customer_phone:   customerPhone?.trim() || null,
    appointment_date: appointmentDate || null,
    appointment_time: appointmentTime || null,
    employee_name:    employeeName?.trim() || null,
    service:          service?.trim() || null,
    complaint:        complaint.trim(),
  }).select('id, ticket_number, created_at').single()

  if (error) {
    console.error('[complaints POST]', error)
    return NextResponse.json({ error: 'Failed to submit complaint' }, { status: 500 })
  }

  return NextResponse.json({ ticket: data.ticket_number, id: data.id }, { status: 201 })
}

// GET /api/complaints?adminId=&status= — admin only
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const adminId = searchParams.get('adminId')
  const status  = searchParams.get('status')

  if (!adminId) return NextResponse.json({ error: 'adminId required' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  if (!(await verifyAdmin(supabase, adminId))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let query = supabase.from('complaints').select('*').order('created_at', { ascending: false })
  if (status && status !== 'all') query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 })
  return NextResponse.json({ complaints: data ?? [] })
}

// PATCH /api/complaints — admin only
// Body: { adminId, id, status?, adminNotes?, followUpDue? }
export async function PATCH(req: NextRequest) {
  const body = await req.json() as {
    adminId?: string; id?: string
    status?: 'open' | 'in_progress' | 'resolved'
    adminNotes?: string; followUpDue?: string
  }
  const { adminId, id, status, adminNotes, followUpDue } = body

  if (!adminId || !id) return NextResponse.json({ error: 'adminId and id are required' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  if (!(await verifyAdmin(supabase, adminId))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const update: Record<string, unknown> = {}
  if (status !== undefined) {
    update.status = status
    if (status === 'resolved') update.resolved_at = new Date().toISOString()
    else update.resolved_at = null
  }
  if (adminNotes !== undefined) update.admin_notes = adminNotes.trim() || null
  if (followUpDue !== undefined) update.follow_up_due = followUpDue || null

  const { data, error } = await supabase.from('complaints').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 })
  return NextResponse.json({ complaint: data })
}
