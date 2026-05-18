import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import type { AIAnalysis } from '@/lib/types'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: lead } = await supabaseAdmin
      .from('cebs_leads')
      .select('*')
      .eq('id', id)
      .single()

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        system: `You are an expert business technology consultant for Competitive Edge Business Solutions. You analyze business intake forms and generate structured assessments to help the sales team prioritize leads and prepare for consultations.

Respond with valid JSON only. No markdown, no preamble, no text outside the JSON object.`,
        messages: [
          {
            role: 'user',
            content: `Analyze this business intake and return a JSON object with this exact structure:
{
  "priority_score": number 0-100,
  "priority_reason": string — 1 sentence explaining the score,
  "tier_recommendation": "audit" | "optimize" | "build",
  "tier_reasoning": string — 1-2 sentences,
  "estimated_monthly_waste": string — e.g. "$500–$1,500/month",
  "identified_tools": string[] — tools mentioned or implied,
  "key_opportunities": string[] — 2-4 items,
  "talking_points": string[] — 3-5 items for the sales call,
  "red_flags": string[] — concerns or blockers if any,
  "draft_audit_summary": string — 2-3 paragraph summary written for the business owner in plain language
}

Priority score rules:
- High spend ($2k+/month): +30 points
- Mentions specific tools (Thryv, Jobber, etc): +20 points
- Clear detailed pain points: +20 points
- Good industry fit (trades, restaurants, home services): +15
- Referral source: +10
- Vague challenge: -10
- Low or no budget signal: -15

Business intake:
Business: ${lead.business_name}
Industry: ${lead.industry || 'N/A'}
Challenge: ${lead.challenge}
Monthly spend: ${lead.monthly_spend || 'Not provided'}
How found us: ${lead.hear_about_us || 'Not provided'}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: `Claude API error: ${err}` }, { status: 500 })
    }

    const data = await response.json()
    const text: string = data.content[0].text
    const parsed: AIAnalysis = JSON.parse(text)

    await supabaseAdmin
      .from('cebs_leads')
      .update({
        ai_analysis: parsed,
        priority_score: parsed.priority_score,
        tier_recommendation: parsed.tier_recommendation,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', id)

    return NextResponse.json({ success: true, analysis: parsed })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
