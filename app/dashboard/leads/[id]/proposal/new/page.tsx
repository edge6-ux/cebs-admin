import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronLeft, Info } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase-server'
import type { Lead, Evaluation } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import ProposalForm from '@/components/leads/ProposalForm'

export default async function NewProposalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [{ data: leadData }, { data: evaluation }] = await Promise.all([
    supabaseAdmin.from('cebs_leads').select('*').eq('id', id).single(),
    supabaseAdmin.from('evaluations').select('*').eq('lead_id', id).maybeSingle(),
  ])

  if (!leadData) redirect('/dashboard/leads')

  const lead = leadData as Lead
  const eval_ = evaluation as Evaluation | null

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <Link
        href={`/dashboard/leads/${id}`}
        className="inline-flex items-center gap-1 font-body mb-6 transition-colors hover:text-[#0D0D0D]"
        style={{ color: '#6B7280', fontSize: '14px' }}
      >
        <ChevronLeft size={16} />
        Back to {lead.business_name}
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '22px' }}>
          New Proposal
        </h1>
        <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '14px' }}>
          {lead.business_name} · {lead.full_name}
        </p>
      </div>

      {/* Context card */}
      <div
        className="bg-white rounded-2xl p-5 mb-6 shadow-sm"
        style={{ border: '1px solid #E5E7EB' }}
      >
        {eval_ ? (
          <div className="flex gap-8 flex-wrap">
            <div className="flex flex-col">
              <p
                className="font-body uppercase mb-1"
                style={{ color: '#6B7280', fontSize: '11px', letterSpacing: '0.08em' }}
              >
                Evaluated Tier
              </p>
              <p className="font-heading font-bold capitalize" style={{ color: '#8B2FC9', fontSize: '15px' }}>
                {eval_.tier_fit || '—'}
              </p>
            </div>

            <div className="flex flex-col">
              <p
                className="font-body uppercase mb-1"
                style={{ color: '#6B7280', fontSize: '11px', letterSpacing: '0.08em' }}
              >
                Confirmed Spend
              </p>
              <p className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '15px' }}>
                {formatCurrency(eval_.monthly_spend_confirmed)}/mo
              </p>
            </div>

            <div className="flex flex-col">
              <p
                className="font-body uppercase mb-1"
                style={{ color: '#6B7280', fontSize: '11px', letterSpacing: '0.08em' }}
              >
                Budget Range
              </p>
              <p className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '15px' }}>
                {eval_.budget_range || '—'}
              </p>
            </div>

            <div className="flex flex-col">
              <p
                className="font-body uppercase mb-1"
                style={{ color: '#6B7280', fontSize: '11px', letterSpacing: '0.08em' }}
              >
                Timeline
              </p>
              <p className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '15px' }}>
                {eval_.timeline || '—'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Info size={16} style={{ color: '#6B7280', flexShrink: 0 }} />
            <p className="font-body" style={{ color: '#6B7280', fontSize: '14px' }}>
              Complete an evaluation first for better proposal defaults.
            </p>
          </div>
        )}
      </div>

      <ProposalForm lead={lead} evaluation={eval_} />
    </div>
  )
}
