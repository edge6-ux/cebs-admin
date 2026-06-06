import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

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

  // Cascade restore: when deleted_at is cleared, bring linked jobs back too
  if ('deleted_at' in body && body.deleted_at === null) {
    await supabaseAdmin
      .from('jobs')
      .update({ deleted_at: null })
      .eq('project_id', id)
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

  const deletedAt = new Date().toISOString()

  const { error } = await supabaseAdmin
    .from('projects')
    .update({ deleted_at: deletedAt })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabaseAdmin
    .from('jobs')
    .update({ deleted_at: deletedAt })
    .eq('project_id', id)
    .is('deleted_at', null)

  if (project.monthly_retainer > 0 && project.lead_id) {
    await supabaseAdmin
      .from('customers')
      .update({ on_retainer: false, retainer_amount: 0 })
      .eq('lead_id', project.lead_id)
  }

  return NextResponse.json({ success: true })
}
