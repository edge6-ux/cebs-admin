import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { render } from '@react-email/components'
import { supabaseAdmin } from '@/lib/supabase-server'
import ProposalEmail from '@/components/emails/ProposalEmail'

interface LineItem {
  name: string
  price: number
  is_retainer: boolean
}

interface ProposalData {
  tier: string
  lineItems: LineItem[]
  investmentLow: number
  investmentHigh: number
  monthlyRetainer: number
  timelineWeeks: number | null
  businessName: string
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const {
    subject,
    intro,
    nextSteps,
    customerEmail,
    customerName,
    proposal,
  } = await req.json() as {
    subject: string
    intro: string
    nextSteps: string
    customerEmail: string
    customerName: string
    proposal: ProposalData
  }

  const html = await render(
    ProposalEmail({
      customerName,
      businessName: proposal.businessName,
      tier: proposal.tier,
      intro,
      nextSteps,
      lineItems: proposal.lineItems,
      investmentLow: proposal.investmentLow,
      investmentHigh: proposal.investmentHigh,
      monthlyRetainer: proposal.monthlyRetainer,
      timelineWeeks: proposal.timelineWeeks,
    })
  )

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    await resend.emails.send({
      from: 'Competitive Edge <onboarding@resend.dev>',
      to: customerEmail,
      subject,
      html,
    })
  } catch (emailErr) {
    console.error('Email send failed:', emailErr)
    return NextResponse.json({ error: 'Email failed' }, { status: 500 })
  }

  await supabaseAdmin
    .from('proposals')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
    })
    .eq('id', id)

  return NextResponse.json({ success: true })
}
