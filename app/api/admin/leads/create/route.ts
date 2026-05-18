import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const {
      fullName,
      businessName,
      email,
      phone,
      industry,
      monthlySpend,
      challenge,
      hearAboutUs,
      assignedTo,
      notes,
      runAnalysis,
    } = await req.json()

    if (!fullName || !businessName || !email || !challenge) {
      return NextResponse.json(
        { error: 'Full name, business name, email, and challenge are required.' },
        { status: 400 }
      )
    }

    const { data: lead, error } = await supabaseAdmin
      .from('cebs_leads')
      .insert({
        full_name: fullName,
        business_name: businessName,
        email,
        phone: phone || '',
        industry: industry || '',
        monthly_spend: monthlySpend || '',
        challenge,
        hear_about_us: hearAboutUs || '',
        assigned_to: assignedTo || '',
        notes: notes || '',
        status: 'new',
        priority_score: 0,
        last_activity_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error || !lead) {
      throw new Error(error?.message ?? 'Failed to insert lead')
    }

    if (runAnalysis) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
      // Fire and forget — don't await so the redirect happens immediately
      fetch(`${appUrl}/api/admin/leads/${lead.id}/analyze`, { method: 'POST' }).catch(() => {})
    }

    return NextResponse.json({ id: lead.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
