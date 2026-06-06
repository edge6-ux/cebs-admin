import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-server'
import ProposalEmailPage from '@/components/proposals/ProposalEmailPage'

export default async function SendProposalEmailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: proposal } = await supabaseAdmin
    .from('proposals')
    .select(`
      id, tier,
      investment_low, investment_high,
      monthly_retainer, timeline_weeks,
      lead:cebs_leads(full_name, email, business_name),
      line_items:proposal_line_items(name, description, price, is_retainer)
    `)
    .eq('id', id)
    .single()

  if (!proposal) redirect('/dashboard/proposals')

  const lead = proposal.lead as unknown as {
    full_name: string
    email: string
    business_name: string
  } | null

  const lineItems = (proposal.line_items ?? []) as {
    name: string
    description: string
    price: number
    is_retainer: boolean
  }[]

  return (
    <ProposalEmailPage
      proposalId={id}
      summary={{
        tier:            proposal.tier,
        lineItems,
        investmentLow:   proposal.investment_low,
        investmentHigh:  proposal.investment_high,
        monthlyRetainer: proposal.monthly_retainer,
        timelineWeeks:   proposal.timeline_weeks,
        businessName:    lead?.business_name ?? '',
        customerName:    lead?.full_name     ?? '',
        customerEmail:   lead?.email         ?? '',
      }}
    />
  )
}
