import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('field_submissions')
    .select(`
      *,
      tenant:tenants(
        id,
        slug,
        business_name,
        primary_color
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json([])
  return NextResponse.json(data ?? [])
}
