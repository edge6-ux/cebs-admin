import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      lead_id,
      current_tools,
      monthly_spend_confirmed,
      pain_points,
      technical_comfort,
      timeline,
      budget_range,
      decision_maker,
      tier_fit,
      notes,
      completed_at,
    } = body

    if (!lead_id) {
      return NextResponse.json({ error: 'lead_id is required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('evaluations')
      .insert({
        lead_id,
        current_tools: current_tools ?? [],
        monthly_spend_confirmed: monthly_spend_confirmed ?? 0,
        pain_points: pain_points ?? '',
        technical_comfort: technical_comfort ?? '',
        timeline: timeline ?? '',
        budget_range: budget_range ?? '',
        decision_maker: decision_maker ?? '',
        tier_fit: tier_fit ?? '',
        notes: notes ?? '',
        completed_at: completed_at ?? null,
      })
      .select()
      .single()

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to insert evaluation')
    }

    return NextResponse.json({ id: data.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
