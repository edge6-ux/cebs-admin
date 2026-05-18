import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const { data } = await supabaseAdmin
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email } = body

  const { data: existing } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Duplicate email' }, { status: 409 })
  }

  const { data, error } = await supabaseAdmin
    .from('customers')
    .insert({ ...body, status: body.status ?? 'active' })
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Insert failed' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
