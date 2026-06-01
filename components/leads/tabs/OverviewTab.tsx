import Link from 'next/link'
import type { Lead, Customer, AIAnalysis } from '@/lib/types'
import RunAnalysisButton from '@/components/leads/RunAnalysisButton'
import RerunAnalysisButton from '@/components/leads/RerunAnalysisButton'

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(' ')
  if (parts.length === 1) return (parts[0][0] ?? '').toUpperCase()
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase()
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

function scoreStyle(score: number): { border: string; bg: string; color: string } {
  if (score >= 80) return { border: '#E24B4A', bg: 'rgba(226,75,74,0.08)',  color: '#E24B4A' }
  if (score >= 50) return { border: '#C8922A', bg: 'rgba(200,146,42,0.08)', color: '#C8922A' }
  return               { border: '#6B7280',  bg: '#F5F5F5',                color: '#6B7280' }
}

const tierConfig: Record<AIAnalysis['tier_recommendation'], { bg: string; border: string; color: string }> = {
  audit:    { bg: 'rgba(139,47,201,0.06)', border: 'rgba(139,47,201,0.2)', color: '#8B2FC9' },
  optimize: { bg: 'rgba(29,78,216,0.06)',  border: 'rgba(29,78,216,0.2)',  color: '#1D4ED8' },
  build:    { bg: 'rgba(139,47,201,0.06)', border: 'rgba(139,47,201,0.2)', color: '#8B2FC9' },
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

type Props = {
  lead: Lead
  customer: Customer | null
}

export default function OverviewTab({ lead, customer }: Props) {
  return (
    <div>
      {/* Intake Details */}
      <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
        <SectionLabel>Intake Details</SectionLabel>

        <div className="mb-4">
          <p className="font-body font-medium mb-2" style={{ color: '#6B7280', fontSize: '12px' }}>
            Their Challenge
          </p>
          <div className="rounded-xl px-4 py-3" style={{ background: '#F9F9F9' }}>
            <p className="font-body" style={{ color: '#0D0D0D', fontSize: '14px', lineHeight: '1.7' }}>
              {lead.challenge}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <p className="font-body font-medium mb-2" style={{ color: '#6B7280', fontSize: '12px' }}>
            How They Found Us
          </p>
          <p className="font-body" style={{ color: '#4A4A4A', fontSize: '14px' }}>
            {lead.hear_about_us || '—'}
          </p>
        </div>

        <div className={lead.interested_in ? 'mb-4' : ''}>
          <p className="font-body font-medium mb-2" style={{ color: '#6B7280', fontSize: '12px' }}>
            Stated Monthly Spend
          </p>
          <p className="font-body font-semibold" style={{ color: '#0D0D0D', fontSize: '14px' }}>
            {lead.monthly_spend || 'Not provided'}
          </p>
        </div>

        {lead.interested_in && (
          <div>
            <p className="font-body font-medium mb-2" style={{ color: '#6B7280', fontSize: '12px' }}>
              Came In Requesting
            </p>
            <div className="flex gap-2 items-center">
              <span className="font-body font-semibold" style={{ color: '#8B2FC9', fontSize: '14px' }}>
                {lead.interested_in}
              </span>
              {lead.interested_category && (
                <span
                  className="font-body px-2 py-0.5 rounded-full"
                  style={{ background: '#F3F4F6', color: '#6B7280', fontSize: '11px' }}
                >
                  {lead.interested_category}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI Analysis */}
      <AIAnalysisCard lead={lead} />

      {/* Customer Account — only shown when a customer record exists */}
      {customer && (
        <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
          <SectionLabel>Customer Account</SectionLabel>

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
        </div>
      )}
    </div>
  )
}
