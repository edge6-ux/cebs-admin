import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { render } from '@react-email/components'
import { supabaseAdmin } from '@/lib/supabase-server'
import ProposalEmail from '@/components/emails/ProposalEmail'

interface LineItem {
  name: string
  description: string
  price: number
  is_retainer: boolean
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const {
    subject,
    customerEmail,
    customerName,
    businessName,
    intro,
    nextSteps,
    lineItems,
    investmentLow,
    investmentHigh,
    monthlyRetainer,
    timelineWeeks,
  } = await req.json() as {
    subject: string
    customerEmail: string
    customerName: string
    businessName: string
    intro: string
    nextSteps: string
    lineItems: LineItem[]
    investmentLow: number
    investmentHigh: number
    monthlyRetainer: number
    timelineWeeks: number
  }

  const html = await render(
    ProposalEmail({
      customerName,
      businessName,
      intro,
      nextSteps,
      lineItems,
      investmentLow,
      investmentHigh,
      monthlyRetainer,
      timelineWeeks,
    })
  )

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    await resend.emails.send({
      from: 'Honed Ops <contact@honedops.com>',
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
