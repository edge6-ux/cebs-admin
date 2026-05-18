import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const { data } = await supabaseAdmin
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}
