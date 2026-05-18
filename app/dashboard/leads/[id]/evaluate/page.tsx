import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronLeft, Info } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase-server'
import type { Lead, Evaluation } from '@/lib/types'
import EvaluationForm from '@/components/leads/EvaluationForm'

export default async function EvaluatePage({
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
  const ai = lead.ai_analysis

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
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '22px' }}>
            Evaluation
          </h1>
          <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '14px' }}>
            {lead.business_name} · {lead.full_name}
          </p>
        </div>

        {eval_?.completed_at && (
          <span
            className="font-body font-semibold px-3 py-1.5 rounded-xl"
            style={{ background: '#D1FAE5', color: '#065F46', fontSize: '13px' }}
          >
            ✓ Complete
          </span>
        )}
      </div>

      {/* Context card */}
      <div
        className="bg-white rounded-2xl p-5 mb-6 shadow-sm"
        style={{ border: '1px solid #E5E7EB' }}
      >
        {ai ? (
          <div className="flex gap-8 flex-wrap">
            <div className="flex flex-col">
              <p
                className="font-body uppercase mb-1"
                style={{ color: '#6B7280', fontSize: '11px', letterSpacing: '0.08em' }}
              >
                AI Recommendation
              </p>
              <p className="font-heading font-bold capitalize" style={{ color: '#8B2FC9', fontSize: '15px' }}>
                {ai.tier_recommendation}
              </p>
            </div>

            <div className="flex flex-col">
              <p
                className="font-body uppercase mb-1"
                style={{ color: '#6B7280', fontSize: '11px', letterSpacing: '0.08em' }}
              >
                Priority Score
              </p>
              <p className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '15px' }}>
                {ai.priority_score}/100
              </p>
            </div>

            <div className="flex flex-col">
              <p
                className="font-body uppercase mb-1"
                style={{ color: '#6B7280', fontSize: '11px', letterSpacing: '0.08em' }}
              >
                Est. Monthly Waste
              </p>
              <p className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '15px' }}>
                {ai.estimated_monthly_waste}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Info size={16} style={{ color: '#6B7280', flexShrink: 0 }} />
            <p className="font-body" style={{ color: '#6B7280', fontSize: '14px' }}>
              Run AI analysis on the lead detail page first for better recommendations.
            </p>
          </div>
        )}
      </div>

      <EvaluationForm lead={lead} evaluation={eval_} />
    </div>
  )
}
