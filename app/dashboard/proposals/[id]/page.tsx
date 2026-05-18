import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  Calendar,
  Send,
  CheckCircle,
  Clock,
  Mail,
  Phone,
} from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase-server'
import { fmtDate, formatCurrency } from '@/lib/utils'
import ProposalDetailActions from '@/components/proposals/ProposalDetailActions'

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  draft:    { label: 'Draft',    bg: '#F3F4F6', color: '#6B7280' },
  sent:     { label: 'Sent',     bg: '#DBEAFE', color: '#1D4ED8' },
  accepted: { label: 'Accepted', bg: '#D1FAE5', color: '#065F46' },
  declined: { label: 'Declined', bg: '#FCEBEB', color: '#991B1B' },
}

const tierConfig: Record<string, { bg: string; color: string }> = {
  audit:    { bg: '#EDE9FE', color: '#6D28D9' },
  optimize: { bg: '#DBEAFE', color: '#1D4ED8' },
  build:    { bg: 'rgba(139,47,201,0.1)', color: '#8B2FC9' },
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p
      className="font-body uppercase pb-3 mb-5"
      style={{ color: '#6B7280', fontSize: '11px', letterSpacing: '0.08em', borderBottom: '1px solid #F5F5F5' }}
    >
      {children}
    </p>
  )
}

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: proposal } = await supabaseAdmin
    .from('proposals')
    .select(`
      *,
      lead:cebs_leads(*),
      evaluation:evaluations(*),
      line_items:proposal_line_items(*, service:services(*))
    `)
    .eq('id', id)
    .single()

  if (!proposal) redirect('/dashboard/proposals')

  const lead = proposal.lead as Record<string, string> | null
  const lineItems = (proposal.line_items ?? []) as Array<{
    id: string
    name: string
    price: number
    is_retainer: boolean
    description: string
    service: { category: string; description: string } | null
  }>

  const pStatus = statusConfig[proposal.status] ?? statusConfig.draft
  const tier = tierConfig[proposal.tier] ?? tierConfig.build

  const lineItemsTotal = lineItems.reduce((sum, li) => sum + (li.price || 0), 0)
  const displayTotal = lineItemsTotal > 0 ? lineItemsTotal : (proposal.investment_high || 0)

  const hasIncludesExcludes =
    (proposal.includes?.length > 0) || (proposal.excludes?.length > 0)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back */}
      <Link
        href="/dashboard/proposals"
        className="inline-flex items-center gap-1 font-body mb-6 transition-colors hover:text-[#0D0D0D]"
        style={{ color: '#6B7280', fontSize: '14px' }}
      >
        <ChevronLeft size={16} />
        Back to Proposals
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <span
              className="inline-block font-body font-semibold px-2.5 py-1 rounded-full capitalize mb-2"
              style={{ fontSize: '12px', background: tier.bg, color: tier.color }}
            >
              {proposal.tier}
            </span>
            <h1 className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '24px', marginBottom: '4px' }}>
              {lead?.business_name ?? 'Unknown Business'}
            </h1>
            <p className="font-body" style={{ color: '#6B7280', fontSize: '14px' }}>
              {lead?.full_name ?? 'No contact'}
            </p>
          </div>

          <span
            className="font-body font-bold px-3 py-1.5 rounded-xl capitalize"
            style={{ fontSize: '13px', background: pStatus.bg, color: pStatus.color }}
          >
            {pStatus.label}
          </span>
        </div>

        {/* Detail row */}
        <div className="flex gap-6 flex-wrap mt-4" style={{ borderTop: '1px solid #F5F5F5', paddingTop: '16px' }}>
          <div className="flex items-center gap-2 font-body" style={{ color: '#4A4A4A', fontSize: '13px' }}>
            <Calendar size={14} style={{ color: '#6B7280' }} />
            Created {fmtDate(proposal.created_at)}
          </div>

          {proposal.sent_at && (
            <div className="flex items-center gap-2 font-body" style={{ color: '#4A4A4A', fontSize: '13px' }}>
              <Send size={14} style={{ color: '#6B7280' }} />
              Sent {fmtDate(proposal.sent_at)}
            </div>
          )}

          {proposal.responded_at && (
            <div className="flex items-center gap-2 font-body" style={{ color: '#4A4A4A', fontSize: '13px' }}>
              <CheckCircle size={14} style={{ color: '#6B7280' }} />
              Responded {fmtDate(proposal.responded_at)}
            </div>
          )}

          {proposal.timeline_weeks > 0 && (
            <div className="flex items-center gap-2 font-body" style={{ color: '#4A4A4A', fontSize: '13px' }}>
              <Clock size={14} style={{ color: '#6B7280' }} />
              {proposal.timeline_weeks} week timeline
            </div>
          )}
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_288px] gap-6">
        {/* Left */}
        <div>
          {/* Scope */}
          <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
            <SectionLabel>Scope of Work</SectionLabel>
            {proposal.scope ? (
              <p
                className="font-body"
                style={{ color: '#4A4A4A', fontSize: '15px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}
              >
                {proposal.scope}
              </p>
            ) : (
              <p className="font-body" style={{ color: '#9CA3AF', fontSize: '14px' }}>
                No scope description.
              </p>
            )}
          </div>

          {/* Line items */}
          <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
            <SectionLabel>Services</SectionLabel>

            {lineItems.length === 0 ? (
              <p className="font-body" style={{ color: '#9CA3AF', fontSize: '14px' }}>
                No line items — custom scope proposal.
              </p>
            ) : (
              <>
                <div>
                  {lineItems.map((item, i) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between py-4"
                      style={{ borderBottom: i < lineItems.length - 1 ? '1px solid #F5F5F5' : undefined }}
                    >
                      <div className="flex-1 pr-4">
                        <p className="font-body font-semibold" style={{ color: '#0D0D0D', fontSize: '14px', marginBottom: '4px' }}>
                          {item.name}
                        </p>
                        {(item.description || item.service?.description) && (
                          <p className="font-body" style={{ color: '#6B7280', fontSize: '13px', lineHeight: '1.5' }}>
                            {item.description || item.service?.description}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '15px' }}>
                          {item.is_retainer
                            ? `${formatCurrency(item.price)}/mo`
                            : item.price === 0
                            ? 'Free'
                            : formatCurrency(item.price)}
                        </p>
                        {item.service?.category && (
                          <span
                            className="inline-block font-body mt-1 px-2 py-0.5 rounded-full"
                            style={{ fontSize: '11px', background: '#F3F4F6', color: '#6B7280' }}
                          >
                            {item.service.category}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="flex items-center justify-between mt-4 pt-4"
                  style={{ borderTop: '1px solid #F5F5F5' }}
                >
                  <span className="font-body font-semibold" style={{ color: '#4A4A4A', fontSize: '14px' }}>
                    Total
                  </span>
                  <span className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '18px' }}>
                    {formatCurrency(displayTotal)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Includes / Excludes */}
          {hasIncludesExcludes && (
            <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
              <SectionLabel>Scope Details</SectionLabel>

              {proposal.includes?.length > 0 && (
                <div className="mb-4">
                  <p className="font-body font-medium mb-3" style={{ color: '#6B7280', fontSize: '12px' }}>
                    Included
                  </p>
                  <div className="space-y-2">
                    {(proposal.includes as string[]).map((item, i) => (
                      <div key={i} className="flex gap-2.5 items-start">
                        <CheckCircle size={14} style={{ color: '#16A34A', flexShrink: 0, marginTop: '2px' }} />
                        <p className="font-body" style={{ color: '#4A4A4A', fontSize: '14px' }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {proposal.excludes?.length > 0 && (
                <div>
                  <p className="font-body font-medium mb-3" style={{ color: '#6B7280', fontSize: '12px' }}>
                    Not Included
                  </p>
                  <div className="space-y-2">
                    {(proposal.excludes as string[]).map((item, i) => (
                      <div key={i} className="flex gap-2.5 items-start">
                        <CheckCircle size={14} style={{ color: '#E24B4A', flexShrink: 0, marginTop: '2px' }} />
                        <p className="font-body" style={{ color: '#4A4A4A', fontSize: '14px' }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right */}
        <div>
          {/* Investment */}
          <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
            <SectionLabel>Investment</SectionLabel>
            <div className="space-y-4">
              {(proposal.investment_low > 0 || proposal.investment_high > 0) && (
                <div className="flex items-center justify-between">
                  <span className="font-body" style={{ color: '#4A4A4A', fontSize: '13px' }}>Project Cost</span>
                  <span className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '16px' }}>
                    {proposal.investment_low === proposal.investment_high
                      ? formatCurrency(proposal.investment_low)
                      : `${formatCurrency(proposal.investment_low)} – ${formatCurrency(proposal.investment_high)}`}
                  </span>
                </div>
              )}

              {proposal.monthly_retainer > 0 && (
                <>
                  <div style={{ borderTop: '1px solid #F5F5F5' }} />
                  <div className="flex items-center justify-between">
                    <span className="font-body" style={{ color: '#4A4A4A', fontSize: '13px' }}>Monthly Retainer</span>
                    <span className="font-heading font-bold" style={{ color: '#8B2FC9', fontSize: '15px' }}>
                      {formatCurrency(proposal.monthly_retainer)}/mo
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Lead context */}
          {lead && (
            <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
              <SectionLabel>Lead</SectionLabel>
              <p className="font-body font-semibold mb-1" style={{ color: '#0D0D0D', fontSize: '14px' }}>
                {lead.business_name}
              </p>
              <p className="font-body mb-3" style={{ color: '#6B7280', fontSize: '13px' }}>
                {lead.full_name}
              </p>
              <a
                href={`mailto:${lead.email}`}
                className="flex items-center gap-2 font-body mb-1 transition-opacity hover:opacity-70"
                style={{ color: '#8B2FC9', fontSize: '13px' }}
              >
                <Mail size={13} style={{ color: '#6B7280' }} />
                {lead.email}
              </a>
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-2 font-body transition-opacity hover:opacity-70"
                  style={{ color: '#8B2FC9', fontSize: '13px' }}
                >
                  <Phone size={13} style={{ color: '#6B7280' }} />
                  {lead.phone}
                </a>
              )}
              <Link
                href={`/dashboard/leads/${proposal.lead_id}`}
                className="block font-body font-medium mt-3 transition-opacity hover:opacity-70"
                style={{ color: '#8B2FC9', fontSize: '13px' }}
              >
                View Lead →
              </Link>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
            <SectionLabel>Actions</SectionLabel>
            <ProposalDetailActions
              proposalId={proposal.id}
              status={proposal.status}
              leadId={proposal.lead_id}
              customerEmail={lead?.email ?? ''}
              customerName={lead?.full_name ?? ''}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
