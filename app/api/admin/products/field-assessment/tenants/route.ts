import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const [{ data: tenantsData, error }, { data: deletedData }] = await Promise.all([
    supabaseAdmin
      .from('tenants')
      .select(`*, submissions:field_submissions(count)`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('tenants')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false }),
  ])

  if (error) return NextResponse.json({ tenants: [], deleted: [] })
  return NextResponse.json({ tenants: tenantsData ?? [], deleted: deletedData ?? [] })
}

export async function POST(req: NextRequest) {
  const {
    slug,
    business_name,
    industry,
    primary_color,
    secondary_color,
    logo_url,
    notification_email,
    admin_email,
    admin_password,
    customer_id,
  } = await req.json()

  const { data: existing } = await supabaseAdmin
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .is('deleted_at', null)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Slug already in use' }, { status: 409 })
  }

  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: admin_email,
    password: admin_password,
    email_confirm: true,
    user_metadata: { role: 'tenant_operator' },
  })

  let authUserId: string

  if (authError) {
    // If the email already exists in Auth, reuse that account across tenants
    const isAlreadyExists =
      authError.message.toLowerCase().includes('already') || authError.status === 422

    if (!isAlreadyExists) {
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    const { data: existing } = await supabaseAdmin
      .from('tenants')
      .select('auth_user_id')
      .eq('admin_email', admin_email)
      .not('auth_user_id', 'is', null)
      .limit(1)
      .maybeSingle()

    if (!existing?.auth_user_id) {
      return NextResponse.json(
        { error: 'That email is registered in Auth but not linked to any tenant. Contact support.' },
        { status: 409 }
      )
    }

    authUserId = existing.auth_user_id
  } else {
    authUserId = authUser.user.id
  }

  const { data: tenant, error: insertError } = await supabaseAdmin
    .from('tenants')
    .insert({
      slug,
      business_name,
      industry: industry || 'tree_services',
      primary_color: primary_color || '#1C3A2B',
      secondary_color: secondary_color || '#C8922A',
      logo_url: logo_url || '',
      notification_email,
      admin_email,
      auth_user_id: authUserId,
      active: true,
      customer_id: customer_id ?? null,
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json(tenant, { status: 201 })
}
