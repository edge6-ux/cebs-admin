import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabaseAdmin
    .from('cebs_leads')
    .select('id, full_name, business_name, email, status, deleted_at')
    .not('deleted_at', 'is', null)
    .gte('deleted_at', cutoff)
    .order('deleted_at', { ascending: false })

  if (error) return NextResponse.json([])
  return NextResponse.json(data ?? [])
}
