import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { subject, body, customerEmail } = await req.json() as {
    subject: string
    body: string
    customerEmail: string
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    await resend.emails.send({
      from: 'Competitive Edge <onboarding@resend.dev>',
      to: customerEmail,
      subject,
      text: body,
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
