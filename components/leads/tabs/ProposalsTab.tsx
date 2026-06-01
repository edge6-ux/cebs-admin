'use client'

import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'
import { formatCurrency, fmtDate } from '@/lib/utils'
import ProposalActions from '@/components/proposals/ProposalActions'
import type { Lead, Proposal } from '@/lib/types'

const tierBadge: Record<string, { bg: string; color: string }> = {
  audit:    { bg: '#EDE9FE',                  color: '#6D28D9' },
  optimize: { bg: '#DBEAFE',                  color: '#1D4ED8' },
  build:    { bg: 'rgba(139,47,201,0.1)',     color: '#8B2FC9' },
}

const statusBadge: Record<string, { bg: string; color: string }> = {
  draft:    { bg: '#F3F4F6', color: '#6B7280' },
  sent:     { bg: '#DBEAFE', color: '#1D4ED8' },
  accepted: { bg: '#D1FAE5', color: '#065F46' },
  declined: { bg: '#FCEBEB', color: '#991B1B' },
}

type Props = {
  lead: Lead
  proposals: Proposal[]
}

export default function ProposalsTab({ lead, proposals }: Props) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '17px' }}>
          Proposals
        </h2>
        <Link
          href={`/dashboard/leads/${lead.id}/proposal/new`}
          className="flex items-center gap-1.5 font-body font-medium text-white rounded-xl px-3 py-1.5 transition-opacity hover:opacity-90"
          style={{ background: '#8B2FC9', fontSize: '13px' }}
        >
          <Plus size={13} />
          New Proposal
        </Link>
      </div>

      {proposals.length === 0 ? (
        <div
          className="bg-white rounded-2xl p-12 shadow-sm text-center"
          style={{ border: '1px solid #E5E7EB' }}
        >
          <FileText size={40} className="mx-auto mb-3" style={{ color: '#9CA3AF' }} />
          <p className="font-body mt-3" style={{ color: '#6B7280', fontSize: '15px' }}>
            No proposals yet
          </p>
          <p
            className="font-body mt-1 mx-auto"
            style={{ color: '#9CA3AF', fontSize: '13px', maxWidth: '280px' }}
          >
            Create the first proposal after completing the evaluation.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => {
            const tier = tierBadge[proposal.tier] ?? tierBadge.build
            const status = statusBadge[proposal.status] ?? statusBadge.draft

            return (
              <div
                key={proposal.id}
                className="bg-white rounded-2xl p-5 shadow-sm"
                style={{ border: '1px solid #E5E7EB' }}
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span
                      className="inline-block font-body font-semibold px-2 py-0.5 rounded-full capitalize mb-1"
                      style={{ fontSize: '11px', background: tier.bg, color: tier.color }}
                    >
                      {proposal.tier}
                    </span>
                    <p className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '18px' }}>
                      {formatCurrency(proposal.investment_low)}
                      {proposal.investment_high !== proposal.investment_low && (
                        <> – {formatCurrency(proposal.investment_high)}</>
                      )}
                    </p>
                  </div>
                  <span
                    className="font-body font-semibold px-2.5 py-1 rounded-xl capitalize flex-shrink-0"
                    style={{ fontSize: '12px', background: status.bg, color: status.color }}
                  >
                    {proposal.status}
                  </span>
                </div>

                {/* Includes pills */}
                {proposal.includes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {proposal.includes.map((item, i) => (
                      <span
                        key={i}
                        className="font-body px-2 py-0.5 rounded-full"
                        style={{ fontSize: '11px', background: '#F3F4F6', color: '#4A4A4A' }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}

                {/* Dates */}
                <div className="flex gap-4 flex-wrap mb-4">
                  <span className="font-body" style={{ color: '#6B7280', fontSize: '12px' }}>
                    Created {fmtDate(proposal.created_at)}
                  </span>
                  {proposal.sent_at && (
                    <span className="font-body" style={{ color: '#6B7280', fontSize: '12px' }}>
                      Sent {fmtDate(proposal.sent_at)}
                    </span>
                  )}
                </div>

                <ProposalActions
                  proposalId={proposal.id}
                  status={proposal.status}
                  leadId={lead.id}
                  customerEmail={lead.email}
                  customerName={lead.full_name}
                />

                <Link
                  href={`/dashboard/proposals/${proposal.id}`}
                  className="block font-body font-medium mt-3 transition-opacity hover:opacity-70"
                  style={{ color: '#8B2FC9', fontSize: '13px' }}
                >
                  View Proposal →
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
