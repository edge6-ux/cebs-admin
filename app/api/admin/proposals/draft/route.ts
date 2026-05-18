import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import type { Lead, Evaluation } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const { leadId, evaluationId, tier } = await req.json()

    if (!leadId || !tier) {
      return NextResponse.json({ error: 'leadId and tier are required' }, { status: 400 })
    }

    const [{ data: leadData }, { data: evaluationData }] = await Promise.all([
      supabaseAdmin.from('cebs_leads').select('*').eq('id', leadId).single(),
      evaluationId
        ? supabaseAdmin.from('evaluations').select('*').eq('id', evaluationId).single()
        : Promise.resolve({ data: null }),
    ])

    if (!leadData) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const lead = leadData as Lead
    const evaluation = evaluationData as Evaluation | null

    const toolsToReplace =
      evaluation?.current_tools
        ?.filter((t) => !t.keep)
        .map((t) => t.name)
        .join(', ') || 'Not specified'

    const evaluationContext = evaluation
      ? `
Confirmed monthly spend: $${evaluation.monthly_spend_confirmed}/month
Pain points: ${evaluation.pain_points}
Tools to replace: ${toolsToReplace}
Budget range: ${evaluation.budget_range}
Timeline: ${evaluation.timeline}`
      : ''

    const prompt = `Draft a proposal for this business.

Business: ${lead.business_name}
Industry: ${lead.industry || 'N/A'}
Challenge: ${lead.challenge}
Tier: ${tier}
Monthly software spend: ${lead.monthly_spend || 'Unknown'}${evaluationContext}

Return JSON only:
{
  "scope": "2-3 paragraph scope of work written for the business owner. Professional but plain language. Specific to their situation.",
  "includes": ["4-8 specific deliverables"],
  "excludes": ["2-4 explicit exclusions that set clear expectations"]
}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system:
          'You are a business technology consultant for Competitive Edge Business Solutions. Write professional, specific, and honest proposal content. Respond with JSON only. No markdown, no preamble.',
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`)
    }

    const aiData = await response.json()
    const text = (aiData.content[0] as { text: string }).text
    const parsed = JSON.parse(text)

    return NextResponse.json(parsed)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
