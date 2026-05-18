import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: customer, error } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !customer) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const [{ data: jobs }, { data: proposals }] = await Promise.all([
    supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('customer_id', id)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('proposals')
      .select('*')
      .eq('lead_id', customer.lead_id)
      .order('created_at', { ascending: false }),
  ])

  return NextResponse.json({
    customer,
    jobs: jobs ?? [],
    proposals: proposals ?? [],
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const { data, error } = await supabaseAdmin
    .from('customers')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Update failed' }, { status: 500 })
  }

  return NextResponse.json(data)
}
