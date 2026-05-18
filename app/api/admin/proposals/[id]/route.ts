import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import type { JobType } from '@/lib/types'

type ProposalWithLead = {
  id: string
  tier: string
  scope: string
  investment_high: number
  monthly_retainer: number
  status: string
  lead: {
    id: string
    full_name: string
    email: string
    phone: string
    business_name: string
  } | null
}

function deriveJobType(category: string): JobType {
  const c = category.toLowerCase()
  if (c.includes('web'))                              return 'website'
  if (c.includes('retainer'))                         return 'retainer'
  if (c.includes('operations') || c.includes('optimiz')) return 'optimization'
  if (c.includes('ai') || c.includes('build') || c.includes('custom')) return 'custom_build'
  return 'other'
}

async function handleProposalAccepted(proposal: ProposalWithLead) {
  const lead = proposal.lead

  // 1. Find or create customer + update retainer
  let customerId: string | null = null

  if (lead?.email) {
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('email', lead.email)
      .maybeSingle()

    if (customer) {
      customerId = customer.id

      if (proposal.monthly_retainer > 0) {
        await supabaseAdmin
          .from('customers')
          .update({
            on_retainer: true,
            retainer_amount: proposal.monthly_retainer,
            updated_at: new Date().toISOString(),
          })
          .eq('id', customerId)
      }
    }
  }

  // 2. Create project
  const { data: project } = await supabaseAdmin
    .from('projects')
    .insert({
      lead_id:         lead?.id || null,
      proposal_id:     proposal.id,
      client_name:     lead?.full_name || '',
      client_email:    lead?.email || '',
      client_phone:    lead?.phone || '',
      business_name:   lead?.business_name || '',
      tier:            proposal.tier,
      status:          'kickoff',
      contract_value:  proposal.investment_high || 0,
      monthly_retainer: proposal.monthly_retainer || 0,
      notes:           proposal.scope || '',
    })
    .select()
    .single()

  if (!project) return

  // 3. Fetch line items
  const { data: lineItems } = await supabaseAdmin
    .from('proposal_line_items')
    .select('*, service:services(*)')
    .eq('proposal_id', proposal.id)
    .order('sort_order')

  // 4. Create jobs
  if (lineItems && lineItems.length > 0) {
    const jobsToCreate = lineItems.map((item) => ({
      customer_id:  customerId,
      project_id:   project.id,
      proposal_id:  proposal.id,
      title:        item.name || item.service?.name || 'Untitled Job',
      description:  item.description || item.service?.description || '',
      type:         deriveJobType(item.service?.category || ''),
      status:       'queued',
      priority:     'medium',
      assigned_to:  '',
    }))

    await supabaseAdmin.from('jobs').insert(jobsToCreate)
  } else {
    const tierLabel = proposal.tier
      ? proposal.tier.charAt(0).toUpperCase() + proposal.tier.slice(1)
      : 'Project'

    await supabaseAdmin.from('jobs').insert({
      customer_id:  customerId,
      project_id:   project.id,
      proposal_id:  proposal.id,
      title:        `${tierLabel} — ${lead?.business_name || 'Client'}`,
      description:  proposal.scope || '',
      type:         deriveJobType(proposal.tier || ''),
      status:       'queued',
      priority:     'medium',
      assigned_to:  '',
    })
  }

  // 5. Update lead status
  if (lead?.id) {
    await supabaseAdmin
      .from('cebs_leads')
      .update({
        status: 'converted',
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', lead.id)
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { status, ...rest } = body

  const { data: proposal, error } = await supabaseAdmin
    .from('proposals')
    .update({
      ...rest,
      status,
      ...(status === 'accepted' && !body.responded_at
        ? { responded_at: new Date().toISOString() }
        : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*, lead:cebs_leads(*)')
    .single()

  if (error || !proposal) {
    return NextResponse.json({ error: error?.message ?? 'Update failed' }, { status: 500 })
  }

  if (status === 'accepted') {
    try {
      await handleProposalAccepted(proposal as ProposalWithLead)
    } catch (err) {
      console.error('Auto-creation failed:', err)
    }
  }

  return NextResponse.json(proposal)
}
