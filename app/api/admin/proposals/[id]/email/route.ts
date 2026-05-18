import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

type LineItemRow = {
  name: string
  price: number
  is_retainer: boolean
  description: string
  service: { name: string; description: string; category: string } | null
}

type UpsellOpportunity = {
  service_name: string
  why: string
}

type ProposalWithRelations = {
  id: string
  tier: string
  scope: string
  investment_low: number
  investment_high: number
  monthly_retainer: number
  timeline_weeks: number | null
  lead: {
    full_name: string
    business_name: string
    email: string
    industry: string
    ai_analysis: { upsell_opportunities?: UpsellOpportunity[] } | null
  } | null
  line_items: LineItemRow[]
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: proposalRaw, error } = await supabaseAdmin
    .from('proposals')
    .select(`
      *,
      lead:cebs_leads(*),
      line_items:proposal_line_items(*, service:services(*))
    `)
    .eq('id', id)
    .single()

  if (error || !proposalRaw) {
    return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
  }

  const proposal = proposalRaw as unknown as ProposalWithRelations

  const itemsText =
    proposal.line_items?.length > 0
      ? proposal.line_items
          .map((item) => `- ${item.name}: $${item.price}${item.is_retainer ? '/mo' : ''}${item.description ? ` — ${item.description}` : ''}`)
          .join('\n')
      : `- ${proposal.tier} engagement: $${proposal.investment_low}${
          proposal.investment_high !== proposal.investment_low
            ? `–$${proposal.investment_high}`
            : ''
        }`

  const totalRange =
    proposal.investment_high !== proposal.investment_low
      ? `$${proposal.investment_low}–$${proposal.investment_high}`
      : `$${proposal.investment_low}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        system: `You write proposal email copy for Competitive Edge Business Solutions.

You are given structured proposal data. Your job is to write two short pieces of copy that will be inserted into a branded email template — the template already handles formatting, line items, pricing, and branding.

Rules:
- intro: 2-3 sentences. Reference the specific business and their situation. No generic openers like "I hope this email finds you well." Direct and confident.
- next_steps: 1-2 sentences. Tell them what to do next to move forward.
- subject: clear and specific to their business and engagement.

Respond with JSON only:
{"subject": string, "intro": string, "next_steps": string}`,
        messages: [
          {
            role: 'user',
            content: `Business: ${proposal.lead?.business_name ?? 'Client'}
Contact: ${proposal.lead?.full_name ?? 'there'}
Industry: ${proposal.lead?.industry ?? 'Not specified'}
Tier: ${proposal.tier}

Services:
${itemsText}

Total: ${totalRange}
Timeline: ${proposal.timeline_weeks ?? 'TBD'} weeks`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Claude API error:', err)
      return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
    }

    const aiData = await response.json()
    const raw: string = aiData.content[0].text
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
    const parsed = JSON.parse(cleaned) as { subject: string; intro: string; next_steps: string }

    return NextResponse.json({
      subject: parsed.subject,
      intro: parsed.intro,
      nextSteps: parsed.next_steps,
      customerEmail: proposal.lead?.email ?? '',
      customerName: proposal.lead?.full_name ?? '',
      // Pass proposal data for template rendering
      proposal: {
        tier: proposal.tier,
        lineItems: proposal.line_items.map((li) => ({
          name: li.name,
          price: li.price,
          is_retainer: li.is_retainer,
        })),
        investmentLow: proposal.investment_low,
        investmentHigh: proposal.investment_high,
        monthlyRetainer: proposal.monthly_retainer,
        timelineWeeks: proposal.timeline_weeks,
        businessName: proposal.lead?.business_name ?? '',
      },
    })
  } catch (err) {
    console.error('Email generation failed:', err)
    return NextResponse.json({ error: 'Email generation failed' }, { status: 500 })
  }
}
