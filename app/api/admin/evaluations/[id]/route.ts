import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const {
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

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (current_tools !== undefined) patch.current_tools = current_tools
    if (monthly_spend_confirmed !== undefined) patch.monthly_spend_confirmed = monthly_spend_confirmed
    if (pain_points !== undefined) patch.pain_points = pain_points
    if (technical_comfort !== undefined) patch.technical_comfort = technical_comfort
    if (timeline !== undefined) patch.timeline = timeline
    if (budget_range !== undefined) patch.budget_range = budget_range
    if (decision_maker !== undefined) patch.decision_maker = decision_maker
    if (tier_fit !== undefined) patch.tier_fit = tier_fit
    if (notes !== undefined) patch.notes = notes
    if (completed_at !== undefined) patch.completed_at = completed_at

    const { error } = await supabaseAdmin
      .from('evaluations')
      .update(patch)
      .eq('id', id)

    if (error) throw new Error(error.message)

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
