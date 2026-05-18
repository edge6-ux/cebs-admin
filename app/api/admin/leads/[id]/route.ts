import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const updateFields: Record<string, unknown> = { last_activity_at: new Date().toISOString() }

    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined) {
        updateFields[key] = value
      }
    }

    const { data, error } = await supabaseAdmin
      .from('cebs_leads')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
