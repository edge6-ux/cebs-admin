import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const { data, error } = await supabaseAdmin
    .from('projects')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Update failed' }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: project, error: fetchError } = await supabaseAdmin
    .from('projects')
    .select('lead_id, monthly_retainer')
    .eq('id', id)
    .single()

  if (fetchError || !project) {
    return NextResponse.json({ error: fetchError?.message ?? 'Not found' }, { status: 404 })
  }

  const { error } = await supabaseAdmin
    .from('projects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (project.monthly_retainer > 0 && project.lead_id) {
    await supabaseAdmin
      .from('customers')
      .update({ on_retainer: false, retainer_amount: 0 })
      .eq('lead_id', project.lead_id)
  }

  return NextResponse.json({ success: true })
}
