import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: tenant, error } = await supabaseAdmin
    .from('tenants')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !tenant) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const [
    { count: totalCount },
    { count: newCount },
    { count: contactedCount },
  ] = await Promise.all([
    supabaseAdmin
      .from('field_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', id),
    supabaseAdmin
      .from('field_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', id)
      .eq('status', 'new'),
    supabaseAdmin
      .from('field_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', id)
      .eq('status', 'contacted'),
  ])

  return NextResponse.json({
    ...tenant,
    pipeline: {
      total: totalCount ?? 0,
      new: newCount ?? 0,
      contacted: contactedCount ?? 0,
    },
  })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const { data: tenant, error } = await supabaseAdmin
      .from('tenants')
      .update({
        deleted_at: new Date().toISOString(),
        active: false,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    if (tenant.auth_user_id) {
      const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(tenant.auth_user_id)
      if (user?.user_metadata?.role === 'tenant_operator') {
        await supabaseAdmin.auth.admin.deleteUser(tenant.auth_user_id)
      }
    }

    return NextResponse.json({ success: true, deleted_at: tenant.deleted_at })
  } catch {
    return NextResponse.json({ error: 'Failed to delete tenant' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const { data, error } = await supabaseAdmin
    .from('tenants')
    .update({
      ...body,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Update failed' }, { status: 500 })
  }

  return NextResponse.json(data)
}
