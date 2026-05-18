import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import type { JobType } from '@/lib/types'

type ProposalRow = {
  id: string
  lead_id: string | null
  tier: string
  scope: string
  investment_high: number
  monthly_retainer: number
  status: string
}

function deriveJobType(category: string): JobType {
  const c = category.toLowerCase()
  if (c.includes('web'))                                                    return 'website'
  if (c.includes('retainer'))                                               return 'retainer'
  if (c.includes('operations') || c.includes('optimiz'))                   return 'optimization'
  if (c.includes('ai') || c.includes('build') || c.includes('custom'))     return 'custom_build'
  return 'other'
}

async function handleProposalAccepted(proposal: ProposalRow) {
  // Fetch lead separately to avoid foreign key join issues
  const { data: lead } = proposal.lead_id
    ? await supabaseAdmin.from('cebs_leads').select('id, full_name, email, phone, business_name').eq('id', proposal.lead_id).maybeSingle()
    : { data: null }

  // 1. Find customer + update retainer if applicable
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
      lead_id:          lead?.id || null,
      proposal_id:      proposal.id,
      client_name:      lead?.full_name || '',
      client_email:     lead?.email || '',
      client_phone:     lead?.phone || '',
      business_name:    lead?.business_name || '',
      tier:             proposal.tier,
      status:           'kickoff',
      contract_value:   proposal.investment_high || 0,
      monthly_retainer: proposal.monthly_retainer || 0,
      notes:            proposal.scope || '',
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

  // 4. Create jobs from line items, or one job from proposal scope
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

  // 5. Mark lead as converted
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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from('proposals')
    .select(`
      *,
      lead:cebs_leads(*),
      evaluation:evaluations(*),
      line_items:proposal_line_items(*, service:services(*))
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { error } = await supabaseAdmin
    .from('proposals')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
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
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error || !proposal) {
    return NextResponse.json({ error: error?.message ?? 'Update failed' }, { status: 500 })
  }

  if (status === 'accepted') {
    try {
      await handleProposalAccepted(proposal as ProposalRow)
    } catch (err) {
      console.error('Auto-creation failed:', err)
    }
  }

  return NextResponse.json(proposal)
}
