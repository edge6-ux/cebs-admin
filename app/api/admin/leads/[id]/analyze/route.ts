import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import type { AIAnalysis } from '@/lib/types'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const [{ data: lead }, { data: services, error: servicesError }] = await Promise.all([
      supabaseAdmin.from('cebs_leads').select('*').eq('id', id).single(),
      supabaseAdmin
        .from('services')
        .select('name, description, category, price_low, price_high, is_retainer, retainer_price_low, retainer_price_high')
        .eq('active', true)
        .order('category'),
    ])

    if (servicesError) {
      console.warn('Services table query failed (continuing without catalog):', servicesError.message)
    }

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const catalogText =
      services
        ?.map((s) => {
          const price = s.is_retainer
            ? `$${s.retainer_price_low}–$${s.retainer_price_high}/mo`
            : s.price_low === 0
            ? 'Free'
            : `$${s.price_low}–$${s.price_high}`
          return `- ${s.name} (${s.category}): ${s.description} Price: ${price}`
        })
        .join('\n') || 'No services available'

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2500,
        system: `You are an expert business technology consultant for Competitive Edge Business Solutions. You analyze business intake forms and generate structured assessments to help the sales team prioritize leads and prepare for consultations.

You have deep knowledge of our service catalog and always recommend specific services by name. You identify upsell opportunities based on the business type and what they have asked for.

Respond with valid JSON only. No markdown, no preamble, no text outside the JSON.`,
        messages: [
          {
            role: 'user',
            content: `Analyze this business intake and return a JSON object with this exact structure:
{
  "priority_score": number 0-100,
  "priority_reason": string — 1 sentence,
  "tier_recommendation": "audit"|"optimize"|"build",
  "tier_reasoning": string — 1-2 sentences,
  "estimated_monthly_waste": string — e.g. "$500–$1,500/month",
  "identified_tools": string[],
  "key_opportunities": string[] — 2-4 items,
  "talking_points": string[] — 3-5 items referencing specific services by name and price from our catalog,
  "red_flags": string[],
  "recommended_services": string[] — specific service names from our catalog that fit this business,
  "upsell_opportunities": [
    {
      "service_name": string — must match a service name in our catalog,
      "trigger": string — what in their intake prompted this,
      "question_to_ask": string — the exact question the sales person should ask to surface this need,
      "why": string — 1-2 sentences on why this service fits this specific business,
      "estimated_value": string — price range from our catalog
    }
  ],
  "draft_audit_summary": string — 2-3 paragraphs written for the business owner in plain language. Reference specific services and prices where relevant.
}

Priority score rules:
High spend ($2k+/month): +30
Mentions specific tools (Thryv, Jobber, etc): +20
Clear detailed pain points: +20
Good industry fit (trades, restaurants, home services, auto): +15
Referral source: +10
Vague challenge: -10
Low or no budget signal: -15

Upsell logic by industry:
Barbershop/Salon: if they want a website always suggest Booking System and Review Request Automation
Restaurant: suggest Booking System or contact form for reservations
Contractor/Trades: suggest AI Assessment Tool or custom quote request form
Auto Services: suggest Booking System and Automated Follow-up Sequence
Health/Wellness: suggest Booking System
Retail: suggest customer portal or online catalog
Any business with manual processes: suggest Tool Consolidation and Automated Follow-up Sequence
Any business mentioning reviews: suggest Review Request Automation

Our service catalog:
${catalogText}

Only recommend services that exist in the catalog above. Reference exact service names and price ranges in your output.

Business intake:
Business: ${lead.business_name}
Industry: ${lead.industry || 'Not specified'}
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
    const raw: string = data.content[0].text
    // Strip markdown code fences if Claude wrapped the JSON
    const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
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
    console.error('AI analysis failed:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
