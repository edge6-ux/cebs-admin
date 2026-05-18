import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronLeft, Mail, Phone, Building2, DollarSign, ClipboardList, Plus, Info } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase-server'
import { fmtDate, formatCurrency, priorityLabel, priorityColor } from '@/lib/utils'
import type { Lead, Evaluation, Proposal, LeadStatus, AIAnalysis, Customer } from '@/lib/types'
import RunAnalysisButton from '@/components/leads/RunAnalysisButton'
import RerunAnalysisButton from '@/components/leads/RerunAnalysisButton'
import LeadManagement from '@/components/leads/LeadManagement'
import LeadActions from '@/components/leads/LeadActions'
import LeadTimeline from '@/components/leads/LeadTimeline'
import ProposalActions from '@/components/proposals/ProposalActions'
import DeleteButton from '@/components/ui/DeleteButton'

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(' ')
  if (parts.length === 1) return (parts[0][0] ?? '').toUpperCase()
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase()
}

function priorityBg(score: number): string {
  if (score >= 80) return 'rgba(226,75,74,0.1)'
  if (score >= 50) return 'rgba(200,146,42,0.1)'
  return 'rgba(107,114,128,0.1)'
}

const statusConfig: Record<LeadStatus, { label: string; bg: string; color: string }> = {
  new:       { label: 'New',       bg: '#EDE9FE', color: '#6D28D9' },
  reviewed:  { label: 'Reviewed',  bg: '#DBEAFE', color: '#1D4ED8' },
  contacted: { label: 'Contacted', bg: '#FEF3C7', color: '#92400E' },
  converted: { label: 'Converted', bg: '#D1FAE5', color: '#065F46' },
  not_a_fit: { label: 'Not a Fit', bg: '#F3F4F6', color: '#6B7280' },
}

const proposalStatusConfig: Record<string, { label: string; bg: string; color: string }> = {
  draft:    { label: 'Draft',    bg: '#F3F4F6', color: '#6B7280' },
  sent:     { label: 'Sent',     bg: '#DBEAFE', color: '#1D4ED8' },
  accepted: { label: 'Accepted', bg: '#D1FAE5', color: '#065F46' },
  declined: { label: 'Declined', bg: '#FEE2E2', color: '#B91C1C' },
}

const tierConfig: Record<AIAnalysis['tier_recommendation'], { bg: string; border: string; color: string }> = {
  audit:    { bg: 'rgba(139,47,201,0.06)', border: 'rgba(139,47,201,0.2)', color: '#8B2FC9' },
  optimize: { bg: 'rgba(29,78,216,0.06)',  border: 'rgba(29,78,216,0.2)',  color: '#1D4ED8' },
  build:    { bg: 'rgba(139,47,201,0.06)', border: 'rgba(139,47,201,0.2)', color: '#8B2FC9' },
}

function scoreStyle(score: number): { border: string; bg: string; color: string } {
  if (score >= 80) return { border: '#E24B4A', bg: 'rgba(226,75,74,0.08)',  color: '#E24B4A' }
  if (score >= 50) return { border: '#C8922A', bg: 'rgba(200,146,42,0.08)', color: '#C8922A' }
  return               { border: '#6B7280',  bg: '#F5F5F5',                color: '#6B7280' }
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

function ListItems({ items, dotColor, textColor = '#4A4A4A' }: { items: string[]; dotColor: string; textColor?: string }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2.5 items-start">
          <div
            className="rounded-full flex-shrink-0 mt-1.5"
            style={{ width: '6px', height: '6px', background: dotColor }}
          />
          <p className="font-body" style={{ color: textColor, fontSize: '13px', lineHeight: '1.5' }}>
            {item}
          </p>
        </div>
      ))}
    </div>
  )
}

function AIAnalysisCard({ lead }: { lead: Lead }) {
  const ai = lead.ai_analysis

  return (
    <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
      <SectionLabel>AI Analysis</SectionLabel>

      {!ai ? (
        <RunAnalysisButton leadId={lead.id} />
      ) : (
        <div>
          {/* Priority score */}
          <div className="flex gap-4 items-center mb-6">
            {(() => {
              const s = scoreStyle(ai.priority_score)
              return (
                <div
                  className="flex-shrink-0 flex items-center justify-center rounded-full"
                  style={{ width: '56px', height: '56px', border: `2px solid ${s.border}`, background: s.bg }}
                >
                  <span className="font-heading font-bold" style={{ fontSize: '20px', color: s.color }}>
                    {ai.priority_score}
                  </span>
                </div>
              )
            })()}
            <div>
              <p className="font-body font-semibold" style={{ color: '#0D0D0D', fontSize: '14px' }}>
                Priority Score
              </p>
              <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '13px', lineHeight: '1.5', maxWidth: '320px' }}>
                {ai.priority_reason}
              </p>
            </div>
          </div>

          {/* Tier recommendation */}
          <div className="mb-5">
            <p className="font-body font-medium mb-2" style={{ color: '#6B7280', fontSize: '12px' }}>
              Recommended Tier
            </p>
            {(() => {
              const t = tierConfig[ai.tier_recommendation]
              return (
                <div className="rounded-xl p-4" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
                  <p className="font-heading font-bold capitalize" style={{ color: t.color, fontSize: '15px' }}>
                    {ai.tier_recommendation}
                  </p>
                  <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '13px', lineHeight: '1.5' }}>
                    {ai.tier_reasoning}
                  </p>
                </div>
              )
            })()}
          </div>

          {/* Estimated waste */}
          {ai.estimated_monthly_waste && (
            <div className="mb-5">
              <p className="font-body font-medium mb-2" style={{ color: '#6B7280', fontSize: '12px' }}>
                Estimated Monthly Waste
              </p>
              <p className="font-body font-semibold" style={{ color: '#E24B4A', fontSize: '14px' }}>
                {ai.estimated_monthly_waste}
              </p>
            </div>
          )}

          {/* Identified tools */}
          {ai.identified_tools.length > 0 && (
            <div className="mb-5">
              <p className="font-body font-medium mb-2" style={{ color: '#6B7280', fontSize: '12px' }}>
                Tools They Mentioned
              </p>
              <div className="flex flex-wrap gap-2">
                {ai.identified_tools.map((tool) => (
                  <span
                    key={tool}
                    className="font-body px-3 py-1 rounded-full"
                    style={{ fontSize: '12px', background: '#F3F4F6', color: '#4A4A4A' }}
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key opportunities */}
          {ai.key_opportunities.length > 0 && (
            <div className="mb-5">
              <p className="font-body font-medium mb-2" style={{ color: '#6B7280', fontSize: '12px' }}>
                Key Opportunities
              </p>
              <ListItems items={ai.key_opportunities} dotColor="#16A34A" />
            </div>
          )}

          {/* Talking points */}
          {ai.talking_points.length > 0 && (
            <div className="mb-5">
              <p className="font-body font-medium mb-2" style={{ color: '#6B7280', fontSize: '12px' }}>
                Talking Points
              </p>
              <ListItems items={ai.talking_points} dotColor="#8B2FC9" />
            </div>
          )}

          {/* Red flags */}
          {ai.red_flags.length > 0 && (
            <div className="mb-5">
              <p className="font-body font-medium mb-2" style={{ color: '#6B7280', fontSize: '12px' }}>
                Red Flags
              </p>
              <ListItems items={ai.red_flags} dotColor="#E24B4A" textColor="#E24B4A" />
            </div>
          )}

          {/* Recommended services */}
          {ai.recommended_services && ai.recommended_services.length > 0 && (
            <div className="mb-5">
              <p className="font-body font-medium mb-2" style={{ color: '#6B7280', fontSize: '12px' }}>
                Recommended Services
              </p>
              <div className="flex flex-wrap gap-2">
                {ai.recommended_services.map((svc) => (
                  <span
                    key={svc}
                    className="font-body font-semibold px-3 py-1 rounded-full"
                    style={{
                      fontSize: '12px',
                      background: 'rgba(139,47,201,0.08)',
                      color: '#8B2FC9',
                      border: '1px solid rgba(139,47,201,0.2)',
                    }}
                  >
                    {svc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Upsell opportunities */}
          {ai.upsell_opportunities && ai.upsell_opportunities.length > 0 && (
            <div className="mb-5">
              <p className="font-body font-medium mb-3" style={{ color: '#6B7280', fontSize: '12px' }}>
                Upsell Opportunities
              </p>
              <div className="space-y-3">
                {ai.upsell_opportunities.map((opp, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-4"
                    style={{ background: '#F9F9F9', border: '1px solid #F0F0F0' }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-body font-bold" style={{ color: '#0D0D0D', fontSize: '13px' }}>
                        {opp.service_name}
                      </p>
                      <p className="font-body font-semibold flex-shrink-0 ml-3" style={{ color: '#8B2FC9', fontSize: '12px' }}>
                        {opp.estimated_value}
                      </p>
                    </div>
                    <p className="font-body font-medium mb-1" style={{ color: '#1D4ED8', fontSize: '13px' }}>
                      Ask: {opp.question_to_ask}
                    </p>
                    <p className="font-body" style={{ color: '#6B7280', fontSize: '12px', lineHeight: '1.5' }}>
                      {opp.why}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Draft audit summary */}
          <div>
            <p className="font-body font-medium mb-2" style={{ color: '#6B7280', fontSize: '12px' }}>
              Draft Audit Summary
            </p>
            <div className="rounded-xl px-4 py-4 mt-2" style={{ background: '#F9F9F9' }}>
              <p
                className="font-body"
                style={{ color: '#4A4A4A', fontSize: '14px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}
              >
                {ai.draft_audit_summary}
              </p>
            </div>
          </div>

          {/* Re-run */}
          <div className="mt-5 text-right">
            <RerunAnalysisButton leadId={lead.id} />
          </div>
        </div>
      )}
    </div>
  )
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [
    { data: leadData },
    { data: evaluation },
    { data: proposalsRaw },
    { data: customerData },
  ] = await Promise.all([
    supabaseAdmin.from('cebs_leads').select('*').eq('id', id).single(),
    supabaseAdmin.from('evaluations').select('*').eq('lead_id', id).maybeSingle(),
    supabaseAdmin.from('proposals').select('*').eq('lead_id', id).is('deleted_at', null).order('created_at', { ascending: false }),
    supabaseAdmin.from('customers').select('*').eq('lead_id', id).maybeSingle(),
  ])

  if (!leadData) redirect('/dashboard/leads')

  const lead = leadData as Lead
  const eval_ = evaluation as Evaluation | null
  const proposals = (proposalsRaw ?? []) as Proposal[]
  const customer = customerData as Customer | null
  const status = statusConfig[lead.status] ?? statusConfig.new

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back button */}
      <Link
        href="/dashboard/leads"
        className="inline-flex items-center gap-1 font-body mb-6 transition-colors hover:text-[#0D0D0D]"
        style={{ color: '#6B7280', fontSize: '14px' }}
      >
        <ChevronLeft size={16} />
        Back to Leads
      </Link>

      {/* Header card */}
      <div
        className="bg-white rounded-2xl p-6 mb-6 shadow-sm flex gap-5 items-start flex-wrap"
        style={{ border: '1px solid #E5E7EB' }}
      >
        {/* Avatar */}
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-full"
          style={{ width: '64px', height: '64px', background: '#0D0D0D' }}
        >
          <span className="font-heading font-bold text-white" style={{ fontSize: '22px' }}>
            {getInitials(lead.full_name)}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Top row */}
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '24px' }}>
                {lead.business_name}
              </h1>
              <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '14px' }}>
                {lead.full_name}
              </p>
              <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '13px' }}>
                Submitted {fmtDate(lead.created_at)}
              </p>
            </div>

            <div className="flex items-start gap-2 flex-wrap">
              <span
                className="font-body font-bold px-3 py-1.5 rounded-xl"
                style={{ fontSize: '13px', background: status.bg, color: status.color }}
              >
                {status.label}
              </span>
              {lead.priority_score > 0 && (
                <span
                  className="font-body font-bold px-3 py-1.5 rounded-xl"
                  style={{
                    fontSize: '13px',
                    color: priorityColor(lead.priority_score),
                    background: priorityBg(lead.priority_score),
                  }}
                >
                  {priorityLabel(lead.priority_score)} Priority
                </span>
              )}
            </div>
          </div>

          {/* Contact row */}
          <div className="flex gap-5 flex-wrap mt-4">
            <a
              href={`mailto:${lead.email}`}
              className="flex items-center gap-2 font-body transition-opacity hover:opacity-70"
              style={{ color: '#8B2FC9', fontSize: '14px' }}
            >
              <Mail size={16} style={{ color: '#6B7280' }} />
              {lead.email}
            </a>

            {lead.phone && (
              <a
                href={`tel:${lead.phone}`}
                className="flex items-center gap-2 font-body transition-opacity hover:opacity-70"
                style={{ color: '#8B2FC9', fontSize: '14px' }}
              >
                <Phone size={16} style={{ color: '#6B7280' }} />
                {lead.phone}
              </a>
            )}

            {lead.industry && (
              <div className="flex items-center gap-2">
                <Building2 size={16} style={{ color: '#6B7280' }} />
                <span className="font-body" style={{ color: '#4A4A4A', fontSize: '14px' }}>
                  {lead.industry}
                </span>
              </div>
            )}

            {lead.monthly_spend && (
              <div className="flex items-center gap-2">
                <DollarSign size={16} style={{ color: '#6B7280' }} />
                <span className="font-body" style={{ color: '#4A4A4A', fontSize: '14px' }}>
                  {lead.monthly_spend}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
        {/* Left column */}
        <div>
          {/* Intake details */}
          <div
            className="bg-white rounded-2xl p-6 mb-4 shadow-sm"
            style={{ border: '1px solid #E5E7EB' }}
          >
            <p
              className="font-body uppercase pb-3 mb-5"
              style={{
                color: '#6B7280',
                fontSize: '11px',
                letterSpacing: '0.08em',
                borderBottom: '1px solid #F5F5F5',
              }}
            >
              Intake Details
            </p>

            {/* Challenge */}
            <div className="mb-4">
              <p
                className="font-body font-medium mb-2"
                style={{ color: '#6B7280', fontSize: '12px' }}
              >
                Their Challenge
              </p>
              <div className="rounded-xl px-4 py-3" style={{ background: '#F9F9F9' }}>
                <p className="font-body" style={{ color: '#0D0D0D', fontSize: '14px', lineHeight: '1.7' }}>
                  {lead.challenge}
                </p>
              </div>
            </div>

            {/* How they found us */}
            <div className="mb-4">
              <p
                className="font-body font-medium mb-2"
                style={{ color: '#6B7280', fontSize: '12px' }}
              >
                How They Found Us
              </p>
              <p className="font-body" style={{ color: '#4A4A4A', fontSize: '14px' }}>
                {lead.hear_about_us || '—'}
              </p>
            </div>

            {/* Monthly spend */}
            <div className="mb-4">
              <p
                className="font-body font-medium mb-2"
                style={{ color: '#6B7280', fontSize: '12px' }}
              >
                Stated Monthly Spend
              </p>
              <p
                className="font-body font-semibold"
                style={{ color: '#0D0D0D', fontSize: '14px' }}
              >
                {lead.monthly_spend || 'Not provided'}
              </p>
            </div>
          </div>

          {/* AI Analysis */}
          <AIAnalysisCard lead={lead} />

          {/* Evaluation */}
          <div
            className="bg-white rounded-2xl p-6 mb-4 shadow-sm"
            style={{ border: '1px solid #E5E7EB' }}
          >
            <p
              className="font-body uppercase pb-3 mb-5"
              style={{
                color: '#6B7280',
                fontSize: '11px',
                letterSpacing: '0.08em',
                borderBottom: '1px solid #F5F5F5',
              }}
            >
              Evaluation
            </p>

            {!eval_ ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <ClipboardList size={28} style={{ color: '#6B7280' }} />
                <p className="font-body mt-2" style={{ color: '#6B7280', fontSize: '14px' }}>
                  No evaluation yet
                </p>
                <Link
                  href={`/dashboard/leads/${id}/evaluate`}
                  className="inline-block font-body font-medium mt-4 px-4 py-2.5 rounded-xl transition-opacity hover:opacity-80"
                  style={{ border: '1px solid #8B2FC9', color: '#8B2FC9', fontSize: '14px' }}
                >
                  Start Evaluation
                </Link>
              </div>
            ) : (
              <div>
                <p className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '15px' }}>
                  Tier Fit: {eval_.tier_fit || '—'}
                </p>
                <p className="font-body mt-2" style={{ color: '#4A4A4A', fontSize: '14px' }}>
                  Confirmed Spend: {formatCurrency(eval_.monthly_spend_confirmed)}/month
                </p>
                {eval_.completed_at && (
                  <span
                    className="inline-block font-body font-semibold mt-3 px-2 py-1 rounded-full"
                    style={{ fontSize: '12px', background: '#D1FAE5', color: '#065F46' }}
                  >
                    ✓ Evaluation Complete
                  </span>
                )}
                <Link
                  href={`/dashboard/leads/${id}/evaluate`}
                  className="block font-body font-medium mt-3 transition-opacity hover:opacity-70"
                  style={{ color: '#8B2FC9', fontSize: '13px' }}
                >
                  View Evaluation →
                </Link>
              </div>
            )}
          </div>

          {/* Proposals */}
          <div
            className="bg-white rounded-2xl p-6 mb-4 shadow-sm"
            style={{ border: '1px solid #E5E7EB' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '16px' }}>
                Proposals
              </h2>
              <Link
                href={`/dashboard/leads/${id}/proposal/new`}
                className="flex items-center gap-1 font-body font-medium text-white rounded-xl px-3 py-1.5 transition-opacity hover:opacity-90"
                style={{ background: '#8B2FC9', fontSize: '12px' }}
              >
                <Plus size={13} />
                New Proposal
              </Link>
            </div>

            {proposals.length === 0 ? (
              <p
                className="font-body text-center py-4"
                style={{ color: '#6B7280', fontSize: '13px' }}
              >
                No proposals yet
              </p>
            ) : (
              <div className="space-y-3">
                {proposals.map((proposal) => {
                  const pStatus = proposalStatusConfig[proposal.status] ?? proposalStatusConfig.draft
                  return (
                    <div key={proposal.id} className="rounded-xl p-4" style={{ background: '#F9F9F9' }}>
                      <div className="flex items-start justify-between">
                        <p className="font-body font-bold capitalize" style={{ color: '#0D0D0D', fontSize: '14px' }}>
                          {proposal.tier}
                        </p>
                        <span
                          className="font-body font-semibold px-2 py-0.5 rounded-full"
                          style={{ fontSize: '11px', background: pStatus.bg, color: pStatus.color }}
                        >
                          {pStatus.label}
                        </span>
                      </div>
                      <p className="font-body font-semibold mt-1" style={{ color: '#8B2FC9', fontSize: '13px' }}>
                        {formatCurrency(proposal.investment_low)} – {formatCurrency(proposal.investment_high)}
                      </p>
                      {proposal.sent_at && (
                        <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '12px' }}>
                          Sent {fmtDate(proposal.sent_at)}
                        </p>
                      )}
                      <ProposalActions
                        proposalId={proposal.id}
                        status={proposal.status}
                        leadId={id}
                        customerEmail={lead.email}
                        customerName={lead.full_name}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div>
          {/* Customer Account card */}
          <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
            <p
              className="font-body uppercase pb-3 mb-4"
              style={{ color: '#6B7280', fontSize: '11px', letterSpacing: '0.08em', borderBottom: '1px solid #F5F5F5' }}
            >
              Customer Account
            </p>

            {customer ? (
              <>
                <div className="flex gap-3 items-center mb-4">
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-full"
                    style={{ width: '40px', height: '40px', background: '#0D0D0D' }}
                  >
                    <span className="font-heading font-bold text-white" style={{ fontSize: '14px' }}>
                      {getInitials(customer.contact_name || customer.business_name)}
                    </span>
                  </div>
                  <div>
                    <p className="font-body font-semibold" style={{ color: '#0D0D0D', fontSize: '14px' }}>
                      {customer.business_name}
                    </p>
                    <p className="font-body mt-0.5" style={{ color: '#6B7280', fontSize: '12px' }}>
                      {customer.email}
                    </p>
                  </div>
                </div>

                {(() => {
                  const badgeMap: Record<string, { bg: string; color: string }> = {
                    active:   { bg: '#D1FAE5', color: '#065F46' },
                    inactive: { bg: '#F3F4F6', color: '#6B7280' },
                    churned:  { bg: '#FCEBEB', color: '#991B1B' },
                  }
                  const badge = badgeMap[customer.status] ?? badgeMap.inactive
                  return (
                    <span
                      className="inline-block font-body font-semibold px-2 py-0.5 rounded-full mb-4 capitalize"
                      style={{ fontSize: '12px', background: badge.bg, color: badge.color }}
                    >
                      {customer.status}
                    </span>
                  )
                })()}

                <Link
                  href={`/dashboard/customers/${customer.id}`}
                  className="font-body font-medium transition-opacity hover:opacity-70"
                  style={{ color: '#8B2FC9', fontSize: '13px' }}
                >
                  View Customer →
                </Link>
              </>
            ) : (
              <div className="flex gap-2 items-center">
                <Info size={14} style={{ color: '#6B7280', flexShrink: 0 }} />
                <p className="font-body" style={{ color: '#6B7280', fontSize: '13px' }}>
                  No customer account yet. Created automatically on next submission.
                </p>
              </div>
            )}
          </div>

          <LeadManagement lead={lead} />
          <LeadActions lead={lead} />
          <LeadTimeline lead={lead} />

          {/* Delete lead */}
          <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
            <p
              className="font-body uppercase pb-3 mb-4"
              style={{ color: '#6B7280', fontSize: '11px', letterSpacing: '0.08em', borderBottom: '1px solid #F5F5F5' }}
            >
              Danger Zone
            </p>
            <DeleteButton
              onConfirm={async () => {
                const res = await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' })
                if (res.ok) window.location.href = '/dashboard/leads'
              }}
              label="Delete Lead"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
