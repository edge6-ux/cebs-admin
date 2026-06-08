import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data: expiredTenants } = await supabaseAdmin
    .from('tenants')
    .select('id, business_name')
    .not('deleted_at', 'is', null)
    .lt('deleted_at', thirtyDaysAgo)

  if (!expiredTenants?.length) {
    return NextResponse.json({ message: 'No tenants to clean up', deleted: 0 })
  }

  const results: { id: string; business_name: string; status: 'deleted' | 'failed'; error?: string }[] = []

  for (const tenant of expiredTenants as { id: string; business_name: string }[]) {
    try {
      await supabaseAdmin.from('field_submissions').delete().eq('tenant_id', tenant.id)
      await supabaseAdmin.from('tenants').delete().eq('id', tenant.id)

      results.push({ id: tenant.id, business_name: tenant.business_name, status: 'deleted' })
    } catch (err) {
      results.push({
        id: tenant.id,
        business_name: tenant.business_name,
        status: 'failed',
        error: String(err),
      })
    }
  }

  return NextResponse.json({
    message: 'Cleanup complete',
    deleted: results.filter(r => r.status === 'deleted').length,
    failed: results.filter(r => r.status === 'failed').length,
    results,
  })
}
