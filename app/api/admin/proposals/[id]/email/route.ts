import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

type LineItemRow = {
  name: string
  price: number
  description: string
  service: { name: string; description: string } | null
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
      line_items:proposal_line_items(
        *,
        service:services(*)
      )
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
          .map((item) => `- ${item.name}: $${item.price}${item.description ? ` (${item.description})` : ''}`)
          .join('\n')
      : `- ${proposal.tier} engagement: $${proposal.investment_low}${
          proposal.investment_high !== proposal.investment_low
            ? `–$${proposal.investment_high}`
            : ''
        }`

  const upsellContext =
    proposal.lead?.ai_analysis?.upsell_opportunities
      ?.slice(0, 2)
      .map((u) => `${u.service_name}: ${u.why}`)
      .join('\n') ?? ''

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
        max_tokens: 600,
        system: `You write concise proposal emails for Competitive Edge Business Solutions.

Rules:
- Short and direct
- No corporate openers like "I hope this finds you well"
- Proportional to scope — one service = very short
- Only mention upsell if genuinely relevant
- Confident, not salesy
- Sign off as the CEBS team

Respond with JSON only:
{"subject": string, "body": string}`,
        messages: [
          {
            role: 'user',
            content: `Generate a proposal email.

Business: ${proposal.lead?.business_name ?? 'Client'}
Contact: ${proposal.lead?.full_name ?? 'there'}
Industry: ${proposal.lead?.industry ?? 'Not specified'}

Services proposed:
${itemsText}

Total: ${totalRange}

Timeline: ${proposal.timeline_weeks ?? 'TBD'} weeks${
              upsellContext ? `\n\nUpsell if relevant:\n${upsellContext}` : ''
            }`,
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
    const parsed = JSON.parse(cleaned) as { subject: string; body: string }

    return NextResponse.json({
      subject: parsed.subject,
      body: parsed.body,
      customerEmail: proposal.lead?.email ?? '',
      customerName: proposal.lead?.full_name ?? '',
    })
  } catch (err) {
    console.error('Email generation failed:', err)
    return NextResponse.json({ error: 'Email generation failed' }, { status: 500 })
  }
}
