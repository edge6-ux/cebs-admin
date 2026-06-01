import Link from 'next/link'
import { ClipboardList } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Lead, Evaluation } from '@/lib/types'

type Props = {
  lead: Lead
  evaluation: Evaluation | null
}

export default function EvaluationTab({ lead, evaluation }: Props) {
  if (!evaluation) {
    return (
      <div
        className="bg-white rounded-2xl p-12 shadow-sm text-center"
        style={{ border: '1px solid #E5E7EB' }}
      >
        <ClipboardList size={40} className="mx-auto mb-3" style={{ color: '#9CA3AF' }} />
        <p className="font-body mt-3" style={{ color: '#6B7280', fontSize: '15px' }}>
          No evaluation yet
        </p>
        <p
          className="font-body mt-1 mx-auto text-center"
          style={{ color: '#9CA3AF', fontSize: '13px', maxWidth: '280px' }}
        >
          Complete the evaluation worksheet during or after the consultation call.
        </p>
        <Link
          href={`/dashboard/leads/${lead.id}/evaluate`}
          className="inline-block font-body font-medium mt-6 px-5 py-2.5 rounded-xl transition-opacity hover:opacity-80"
          style={{ border: '1px solid #8B2FC9', color: '#8B2FC9', fontSize: '14px' }}
        >
          Start Evaluation
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '17px' }}>
          Evaluation Summary
        </h2>
        {evaluation.completed_at && (
          <span
            className="font-body font-semibold px-2.5 py-1 rounded-xl"
            style={{ fontSize: '12px', background: '#D1FAE5', color: '#065F46' }}
          >
            ✓ Complete
          </span>
        )}
      </div>

      {/* Tier fit */}
      <div className="mb-4">
        <p className="font-body font-medium mb-1" style={{ color: '#6B7280', fontSize: '12px' }}>
          Tier Fit
        </p>
        <p className="font-heading font-bold capitalize" style={{ color: '#0D0D0D', fontSize: '16px' }}>
          {evaluation.tier_fit || '—'}
        </p>
      </div>

      {/* Confirmed spend */}
      <div className="mb-4">
        <p className="font-body font-medium mb-1" style={{ color: '#6B7280', fontSize: '12px' }}>
          Confirmed Monthly Spend
        </p>
        <p className="font-body font-semibold" style={{ color: '#0D0D0D', fontSize: '14px' }}>
          {formatCurrency(evaluation.monthly_spend_confirmed)}/month
        </p>
      </div>

      {/* Budget range */}
      <div className="mb-4">
        <p className="font-body font-medium mb-1" style={{ color: '#6B7280', fontSize: '12px' }}>
          Budget Range
        </p>
        <p className="font-body" style={{ color: '#4A4A4A', fontSize: '14px' }}>
          {evaluation.budget_range || '—'}
        </p>
      </div>

      {/* Timeline */}
      <div className="mb-4">
        <p className="font-body font-medium mb-1" style={{ color: '#6B7280', fontSize: '12px' }}>
          Timeline
        </p>
        <p className="font-body" style={{ color: '#4A4A4A', fontSize: '14px' }}>
          {evaluation.timeline || '—'}
        </p>
      </div>

      {/* Pain points */}
      {evaluation.pain_points && (
        <div className="mb-4">
          <p className="font-body font-medium mb-1" style={{ color: '#6B7280', fontSize: '12px' }}>
            Pain Points
          </p>
          <div className="rounded-xl px-4 py-3" style={{ background: '#F9F9F9' }}>
            <p
              className="font-body"
              style={{ color: '#4A4A4A', fontSize: '14px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}
            >
              {evaluation.pain_points}
            </p>
          </div>
        </div>
      )}

      {/* Tool stack */}
      {evaluation.current_tools && evaluation.current_tools.length > 0 && (
        <div className="mb-4">
          <p className="font-body font-medium mb-2" style={{ color: '#6B7280', fontSize: '12px' }}>
            Tool Stack
          </p>
          <div className="space-y-2">
            {evaluation.current_tools.map((tool, i) => (
              <div key={i} className="flex items-center justify-between">
                <p className="font-body" style={{ color: '#4A4A4A', fontSize: '14px' }}>
                  {tool.name}
                </p>
                <div className="flex gap-2 items-center">
                  <span
                    className="font-body font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      fontSize: '11px',
                      background: tool.keep ? '#D1FAE5' : '#FCEBEB',
                      color: tool.keep ? '#065F46' : '#991B1B',
                    }}
                  >
                    {tool.keep ? 'Keep' : 'Replace'}
                  </span>
                  <span className="font-body" style={{ color: '#6B7280', fontSize: '12px' }}>
                    ${tool.cost}/mo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link
        href={`/dashboard/leads/${lead.id}/evaluate`}
        className="block font-body font-medium mt-4 transition-opacity hover:opacity-70"
        style={{ color: '#8B2FC9', fontSize: '13px' }}
      >
        View Full Evaluation →
      </Link>
    </div>
  )
}
