import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { data, error } = await supabaseAdmin
    .from('lead_questionnaires')
    .select('*')
    .eq('lead_id', id)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const { data: existing } = await supabaseAdmin
      .from('lead_questionnaires')
      .select('id')
      .eq('lead_id', id)
      .maybeSingle()

    const { data, error } = existing
      ? await supabaseAdmin
          .from('lead_questionnaires')
          .update({ ...body, updated_at: new Date().toISOString() })
          .eq('lead_id', id)
          .select()
          .single()
      : await supabaseAdmin
          .from('lead_questionnaires')
          .insert({ ...body, lead_id: id })
          .select()
          .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
