import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const { tenantId, adminEmail, newPassword } = await req.json()

  if (!tenantId || !adminEmail || !newPassword) {
    return NextResponse.json(
      { error: 'tenantId, adminEmail, and newPassword are required' },
      { status: 400 }
    )
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }

  const { data: tenant, error: tenantError } = await supabaseAdmin
    .from('tenants')
    .select('auth_user_id')
    .eq('id', tenantId)
    .single()

  if (tenantError || !tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
  }

  // If an auth_user_id is set, verify the user is actually missing before re-creating
  if (tenant.auth_user_id) {
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(tenant.auth_user_id)
    if (user) {
      return NextResponse.json(
        { error: 'Auth user still exists. Use the password reset option above.' },
        { status: 409 }
      )
    }
  }

  const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: adminEmail,
    password: newPassword,
    email_confirm: true,
    user_metadata: { role: 'tenant_operator' },
  })

  if (createError || !authUser?.user) {
    return NextResponse.json(
      { error: createError?.message ?? 'Failed to create auth user' },
      { status: 500 }
    )
  }

  const { error: updateError } = await supabaseAdmin
    .from('tenants')
    .update({ auth_user_id: authUser.user.id, updated_at: new Date().toISOString() })
    .eq('id', tenantId)

  if (updateError) {
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
    return NextResponse.json({ error: 'Failed to link new auth user to tenant' }, { status: 500 })
  }

  return NextResponse.json({ success: true, auth_user_id: authUser.user.id })
}
