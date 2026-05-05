import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const ext  = file.name.split('.').pop() ?? 'jpg'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const bytes = await file.arrayBuffer()

  const supabase = getSupabaseAdmin()
  const { error } = await supabase.storage
    .from('complaint-photos')
    .upload(path, Buffer.from(bytes), { contentType: file.type, upsert: false })

  if (error) {
    console.error('[complaints upload]', error)
    return NextResponse.json({ error: error.message ?? 'Upload failed' }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage.from('complaint-photos').getPublicUrl(path)
  return NextResponse.json({ url: publicUrl })
}
