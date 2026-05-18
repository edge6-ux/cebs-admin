import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('proposals')
    .select(`
      *,
      lead:cebs_leads(id, full_name, business_name, email, industry),
      line_items:proposal_line_items(id, name, price, is_retainer)
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json([], { status: 200 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { data, error } = await supabaseAdmin
      .from('proposals')
      .insert(body)
      .select()
      .single()

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to insert proposal')
    }

    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
