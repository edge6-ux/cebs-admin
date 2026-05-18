import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const { data } = await supabaseAdmin
    .from('jobs')
    .select(`
      *,
      customer:customers(
        id,
        business_name,
        contact_name,
        email
      )
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const { data, error } = await supabaseAdmin
    .from('jobs')
    .insert(body)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Insert failed' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
