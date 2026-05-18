import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  const { data } = await supabaseAdmin
    .from('services')
    .select('*')
    .eq('active', true)
    .order('category')
    .order('name')

  return NextResponse.json(data ?? [])
}
