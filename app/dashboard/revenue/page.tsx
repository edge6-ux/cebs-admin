import { FileText } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase-server'
import type { Project, Proposal } from '@/lib/types'
import { formatCurrency, fmtDate } from '@/lib/utils'

type LeadSlim = {
  id: string
  status: string
  created_at: string
  industry: string
}

function plural(n: number, word: string) {
  return `${n} ${word}${n !== 1 ? 's' : ''}`
}

const CARD_STYLES = {
  base: 'bg-white rounded-2xl p-6 shadow-sm relative overflow-hidden',
  border: '1px solid #E5E7EB',
}

export default async function RevenuePage() {
  const [
    { data: projectsRaw },
    { data: proposalsRaw },
    { data: leadsRaw },
  ] = await Promise.all([
    supabaseAdmin.from('projects').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('proposals').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('cebs_leads').select('id, status, created_at, industry').order('created_at', { ascending: false }),
  ])

  const projects = (projectsRaw ?? []) as Project[]
  const proposals = (proposalsRaw ?? []) as Proposal[]
  const leads = (leadsRaw ?? []) as LeadSlim[]

  const confirmedRevenue = projects.reduce((sum, p) => sum + (p.contract_value || 0), 0)

  const monthlyRecurring = projects
    .filter((p) => p.status !== 'complete')
    .reduce((sum, p) => sum + (p.monthly_retainer || 0), 0)

  const sentProposals = proposals.filter((p) => p.status === 'sent')
  const pipelineValue = sentProposals.reduce((sum, p) => sum + (p.investment_high || 0), 0)
  const openProposalCount = sentProposals.length

  const convertedCount = leads.filter((l) => l.status === 'converted').length

  const conversionRate = leads.length > 0
    ? Math.round((convertedCount / leads.length) * 100)
    : 0

  const avgDealSize = projects.length > 0
    ? Math.round(confirmedRevenue / projects.length)
    : 0

  const cards = [
    {
      label: 'Confirmed Revenue',
      value: formatCurrency(confirmedRevenue),
      sub: plural(projects.length, 'project'),
      accent: '#16A34A',
    },
    {
      label: 'Monthly Recurring',
      value: formatCurrency(monthlyRecurring),
      sub: 'Active retainers',
      accent: '#8B2FC9',
    },
    {
      label: 'Pipeline Value',
      value: formatCurrency(pipelineValue),
      sub: plural(openProposalCount, 'open proposal'),
      accent: '#C8922A',
    },
    {
      label: 'Avg Deal Size',
      value: projects.length > 0 ? formatCurrency(avgDealSize) : '—',
      sub: 'Per project',
      accent: '#1D4ED8',
    },
    {
      label: 'Conversion Rate',
      value: leads.length > 0 ? `${conversionRate}%` : '—',
      sub: 'Leads to clients',
      accent: '#16A34A',
    },
    {
      label: 'Total Leads',
      value: String(leads.length),
      sub: plural(convertedCount, 'converted'),
      accent: '#6B7280',
    },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '22px' }}>
          Revenue
        </h1>
        <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '14px' }}>
          Financial overview and pipeline health.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className={CARD_STYLES.base}
            style={{ border: CARD_STYLES.border, borderTop: `3px solid ${card.accent}` }}
          >
            <p
              className="font-body font-semibold uppercase mb-2"
              style={{ color: '#6B7280', fontSize: '12px', letterSpacing: '0.06em' }}
            >
              {card.label}
            </p>
            <p className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '36px', lineHeight: 1 }}>
              {card.value}
            </p>
            <p className="font-body mt-2" style={{ color: '#6B7280', fontSize: '13px' }}>
              {card.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">

        {/* LEFT COLUMN */}
        <div>
          {/* Projects breakdown */}
          <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '17px' }}>Projects</h2>
              <span className="font-body" style={{ color: '#6B7280', fontSize: '13px' }}>{projects.length} total</span>
            </div>

            {projects.length === 0 ? (
              <p className="font-body text-center py-6" style={{ color: '#6B7280', fontSize: '14px' }}>No projects yet</p>
            ) : (
              <div className="space-y-3">
                {projects.map((project, i) => {
                  const initials = project.business_name
                    .split(' ')
                    .map((w) => w[0] ?? '')
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)

                  const tierCfg: Record<string, { bg: string; color: string }> = {
                    audit:    { bg: '#EDE9FE', color: '#6D28D9' },
                    optimize: { bg: '#DBEAFE', color: '#1D4ED8' },
                    build:    { bg: 'rgba(139,47,201,0.1)', color: '#8B2FC9' },
                  }
                  const statusCfg: Record<string, { bg: string; color: string; label: string }> = {
                    kickoff:     { bg: '#FEF3C7', color: '#92400E', label: 'Kickoff' },
                    in_progress: { bg: '#DBEAFE', color: '#1D4ED8', label: 'In Progress' },
                    review:      { bg: '#EDE9FE', color: '#6D28D9', label: 'Review' },
                    complete:    { bg: '#D1FAE5', color: '#065F46', label: 'Complete' },
                    on_hold:     { bg: '#F3F4F6', color: '#6B7280', label: 'On Hold' },
                  }
                  const tier = tierCfg[project.tier] ?? tierCfg.audit
                  const status = statusCfg[project.status] ?? statusCfg.kickoff

                  return (
                    <div
                      key={project.id}
                      className="flex gap-4 items-start pb-4"
                      style={{ borderBottom: i < projects.length - 1 ? '1px solid #F5F5F5' : undefined }}
                    >
                      <div
                        className="flex items-center justify-center rounded-xl flex-shrink-0"
                        style={{ width: '40px', height: '40px', background: '#0D0D0D' }}
                      >
                        <span className="font-heading font-bold text-white" style={{ fontSize: '14px' }}>{initials}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <p className="font-body font-semibold truncate mr-2" style={{ color: '#0D0D0D', fontSize: '14px' }}>
                            {project.business_name}
                          </p>
                          <span className="font-heading font-bold flex-shrink-0" style={{ color: '#0D0D0D', fontSize: '15px' }}>
                            {project.contract_value > 0 ? formatCurrency(project.contract_value) : '—'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap mt-1.5">
                          {project.tier && (
                            <span
                              className="font-body font-semibold px-2 py-0.5 rounded-full capitalize"
                              style={{ fontSize: '11px', background: tier.bg, color: tier.color }}
                            >
                              {project.tier}
                            </span>
                          )}
                          <span
                            className="font-body font-semibold px-2 py-0.5 rounded-full"
                            style={{ fontSize: '11px', background: status.bg, color: status.color }}
                          >
                            {status.label}
                          </span>
                          {project.monthly_retainer > 0 && (
                            <span className="font-body font-semibold" style={{ fontSize: '11px', color: '#8B2FC9' }}>
                              +{formatCurrency(project.monthly_retainer)}/mo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Open proposals */}
          <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
            <h2 className="font-heading font-bold mb-5" style={{ color: '#0D0D0D', fontSize: '17px' }}>Open Proposals</h2>

            {sentProposals.length === 0 ? (
              <p className="font-body text-center py-4" style={{ color: '#6B7280', fontSize: '13px' }}>No open proposals</p>
            ) : (
              <div className="space-y-3">
                {sentProposals.map((proposal, i) => (
                  <div
                    key={proposal.id}
                    className="flex gap-4 items-start pb-4"
                    style={{ borderBottom: i < sentProposals.length - 1 ? '1px solid #F5F5F5' : undefined }}
                  >
                    <div
                      className="flex items-center justify-center rounded-xl flex-shrink-0"
                      style={{ width: '40px', height: '40px', background: 'rgba(139,47,201,0.08)' }}
                    >
                      <FileText size={18} style={{ color: '#8B2FC9' }} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <span className="font-body font-semibold capitalize" style={{ color: '#0D0D0D', fontSize: '14px' }}>
                          {proposal.tier}
                        </span>
                        <span className="font-heading font-bold flex-shrink-0" style={{ color: '#8B2FC9', fontSize: '14px' }}>
                          {formatCurrency(proposal.investment_low)} – {formatCurrency(proposal.investment_high)}
                        </span>
                      </div>
                      {proposal.sent_at && (
                        <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '12px' }}>
                          Sent {fmtDate(proposal.sent_at)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* Pipeline summary */}
          <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
            <h2 className="font-heading font-bold mb-5" style={{ color: '#0D0D0D', fontSize: '16px' }}>Pipeline Summary</h2>

            {(() => {
              const stages = [
                { label: 'New Leads', status: 'new',        color: '#8B2FC9' },
                { label: 'Reviewed',  status: 'reviewed',   color: '#1D4ED8' },
                { label: 'Contacted', status: 'contacted',  color: '#C8922A' },
                { label: 'Converted', status: 'converted',  color: '#16A34A' },
                { label: 'Not a Fit', status: 'not_a_fit',  color: '#6B7280' },
              ]
              const counts = stages.map((s) => leads.filter((l) => l.status === s.status).length)
              const maxCount = Math.max(...counts, 1)

              return (
                <div className="space-y-3">
                  {stages.map((stage, i) => (
                    <div key={stage.status} className="flex items-center gap-3">
                      <span className="font-body flex-shrink-0" style={{ color: '#4A4A4A', fontSize: '13px', width: '80px' }}>
                        {stage.label}
                      </span>
                      <div className="flex-1 rounded-full overflow-hidden" style={{ background: '#F3F4F6', height: '8px' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            background: stage.color,
                            width: `${(counts[i] / maxCount) * 100}%`,
                            transition: 'width 300ms',
                          }}
                        />
                      </div>
                      <span className="font-heading font-bold flex-shrink-0 text-right" style={{ color: '#0D0D0D', fontSize: '14px', width: '24px' }}>
                        {counts[i]}
                      </span>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>

          {/* Industry breakdown */}
          <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
            <h2 className="font-heading font-bold mb-5" style={{ color: '#0D0D0D', fontSize: '16px' }}>Leads by Industry</h2>

            {(() => {
              const byIndustry = leads
                .filter((l) => l.industry)
                .reduce((acc, l) => {
                  acc[l.industry] = (acc[l.industry] || 0) + 1
                  return acc
                }, {} as Record<string, number>)

              const sorted = Object.entries(byIndustry)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)

              if (sorted.length === 0) {
                return (
                  <p className="font-body text-center py-4" style={{ color: '#6B7280', fontSize: '13px' }}>
                    No industry data yet
                  </p>
                )
              }

              return (
                <div className="space-y-3">
                  {sorted.map(([industry, count]) => (
                    <div key={industry} className="flex items-center justify-between">
                      <span className="font-body truncate mr-2" style={{ color: '#4A4A4A', fontSize: '13px' }}>
                        {industry}
                      </span>
                      <span
                        className="font-body font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ fontSize: '12px', color: '#8B2FC9', background: 'rgba(139,47,201,0.08)' }}
                      >
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>

          {/* Retainer summary */}
          <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
            <h2 className="font-heading font-bold mb-4" style={{ color: '#0D0D0D', fontSize: '16px' }}>Monthly Retainers</h2>

            {(() => {
              const retainerProjects = projects.filter(
                (p) => p.monthly_retainer > 0 && p.status !== 'complete'
              )
              const statusCfg: Record<string, { bg: string; color: string; label: string }> = {
                kickoff:     { bg: '#FEF3C7', color: '#92400E', label: 'Kickoff' },
                in_progress: { bg: '#DBEAFE', color: '#1D4ED8', label: 'In Progress' },
                review:      { bg: '#EDE9FE', color: '#6D28D9', label: 'Review' },
                complete:    { bg: '#D1FAE5', color: '#065F46', label: 'Complete' },
                on_hold:     { bg: '#F3F4F6', color: '#6B7280', label: 'On Hold' },
              }

              return (
                <>
                  {retainerProjects.length === 0 ? (
                    <p className="font-body text-center py-4" style={{ color: '#6B7280', fontSize: '13px' }}>
                      No active retainers
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {retainerProjects.map((project) => {
                        const s = statusCfg[project.status] ?? statusCfg.kickoff
                        return (
                          <div key={project.id} className="flex items-center justify-between">
                            <div className="min-w-0 mr-2">
                              <p className="font-body font-semibold truncate" style={{ color: '#0D0D0D', fontSize: '13px' }}>
                                {project.business_name}
                              </p>
                              <span
                                className="font-body font-semibold px-2 py-0.5 rounded-full inline-flex mt-0.5"
                                style={{ fontSize: '10px', background: s.bg, color: s.color }}
                              >
                                {s.label}
                              </span>
                            </div>
                            <span className="font-heading font-bold flex-shrink-0" style={{ color: '#8B2FC9', fontSize: '14px' }}>
                              {formatCurrency(project.monthly_retainer)}/mo
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid #F5F5F5' }}>
                    <span className="font-body font-semibold" style={{ color: '#4A4A4A', fontSize: '13px' }}>Total MRR</span>
                    <span className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '16px' }}>
                      {formatCurrency(monthlyRecurring)}/mo
                    </span>
                  </div>
                </>
              )
            })()}
          </div>
        </div>

      </div>
    </div>
  )
}
