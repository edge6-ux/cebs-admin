import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-server'
import { fmtDate, timeAgo, formatCurrency, priorityLabel, priorityColor } from '@/lib/utils'
import type { Lead, Project, LeadStatus } from '@/lib/types'
import { Users, Activity, CheckCircle, TrendingUp, Users as UsersIcon, RefreshCw } from 'lucide-react'
import DynamicGreeting from '@/components/layout/DynamicGreeting'

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(' ')
  if (parts.length === 1) return (parts[0][0] ?? '').toUpperCase()
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase()
}

const statusConfig: Record<LeadStatus, { label: string; bg: string; color: string }> = {
  new:       { label: 'New',       bg: '#EDE9FE', color: '#6D28D9' },
  reviewed:  { label: 'Reviewed',  bg: '#DBEAFE', color: '#1D4ED8' },
  contacted: { label: 'Contacted', bg: '#FEF3C7', color: '#92400E' },
  converted: { label: 'Converted', bg: '#D1FAE5', color: '#065F46' },
  not_a_fit: { label: 'Not a Fit', bg: '#F3F4F6', color: '#6B7280' },
}

const tierConfig: Record<string, { bg: string; color: string }> = {
  audit:    { bg: '#EDE9FE', color: '#6D28D9' },
  optimize: { bg: '#DBEAFE', color: '#1D4ED8' },
  build:    { bg: 'rgba(139,47,201,0.1)', color: '#8B2FC9' },
}

const projectStatusConfig: Record<string, { label: string; bg: string; color: string }> = {
  kickoff:     { label: 'Kickoff',     bg: '#FEF3C7', color: '#92400E' },
  in_progress: { label: 'In Progress', bg: '#DBEAFE', color: '#1D4ED8' },
  review:      { label: 'Review',      bg: '#EDE9FE', color: '#6D28D9' },
  complete:    { label: 'Complete',    bg: '#D1FAE5', color: '#065F46' },
  on_hold:     { label: 'On Hold',     bg: '#F3F4F6', color: '#6B7280' },
}

function priorityBg(score: number): string {
  if (score >= 80) return 'rgba(226,75,74,0.1)'
  if (score >= 50) return 'rgba(200,146,42,0.1)'
  return 'rgba(107,114,128,0.1)'
}

export default async function Dashboard() {
  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()

  const [
    { count: totalLeads },
    { count: newThisMonth },
    { count: activeLeads },
    { count: convertedLeads },
    { data: recentLeadsRaw },
    { data: activeProjectsRaw },
    { data: proposalsRaw },
    { data: projectsRevenueRaw },
    { data: retainerProjectsRaw },
  ] = await Promise.all([
    supabaseAdmin.from('cebs_leads').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabaseAdmin.from('cebs_leads').select('*', { count: 'exact', head: true }).is('deleted_at', null).gte('created_at', firstOfMonth),
    supabaseAdmin.from('cebs_leads').select('*', { count: 'exact', head: true }).is('deleted_at', null).in('status', ['new', 'reviewed', 'contacted']),
    supabaseAdmin.from('cebs_leads').select('*', { count: 'exact', head: true }).is('deleted_at', null).eq('status', 'converted'),
    supabaseAdmin.from('cebs_leads').select('*').is('deleted_at', null).order('created_at', { ascending: false }).limit(5),
    supabaseAdmin.from('projects').select('*').in('status', ['kickoff', 'in_progress', 'review']).is('deleted_at', null).order('created_at', { ascending: false }).limit(5),
    supabaseAdmin.from('proposals').select('investment_high').in('status', ['draft', 'sent']).is('deleted_at', null),
    supabaseAdmin.from('projects').select('contract_value').is('deleted_at', null),
    supabaseAdmin.from('projects').select('monthly_retainer').is('deleted_at', null).neq('status', 'complete').gt('monthly_retainer', 0),
  ])

  const recentLeads = (recentLeadsRaw ?? []) as Lead[]
  const activeProjects = (activeProjectsRaw ?? []) as Project[]

  const pipelineValue = (proposalsRaw ?? []).reduce(
    (sum, p) => sum + ((p as { investment_high: number }).investment_high ?? 0), 0
  )
  const confirmedValue = (projectsRevenueRaw ?? []).reduce(
    (sum, p) => sum + ((p as { contract_value: number }).contract_value ?? 0), 0
  )
  const retainerCount = (retainerProjectsRaw ?? []).length
  const totalMRR = (retainerProjectsRaw ?? []).reduce(
    (sum, p) => sum + ((p as { monthly_retainer: number }).monthly_retainer ?? 0), 0
  )
  const conversionRate =
    totalLeads ? Math.round(((convertedLeads ?? 0) / totalLeads) * 100) : null

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '26px' }}>
          <DynamicGreeting />
        </h1>
        <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '14px' }}>
          Here&apos;s where things stand.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 md:grid-cols-3 gap-4 mb-8">
        {/* New This Month */}
        <div
          className="bg-white rounded-2xl p-5 shadow-sm"
          style={{ border: '1px solid #E5E7EB' }}
        >
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: '40px', height: '40px', background: 'rgba(139,47,201,0.08)' }}
          >
            <Users size={18} style={{ color: '#8B2FC9' }} />
          </div>
          <p className="font-heading font-bold mt-3" style={{ color: '#0D0D0D', fontSize: '32px' }}>
            {newThisMonth ?? 0}
          </p>
          <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '13px' }}>
            New This Month
          </p>
          <p className="font-body mt-2" style={{ color: '#9CA3AF', fontSize: '12px' }}>
            {totalLeads ?? 0} total leads
          </p>
        </div>

        {/* Active Leads */}
        <div
          className="bg-white rounded-2xl p-5 shadow-sm"
          style={{ border: '1px solid #E5E7EB' }}
        >
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: '40px', height: '40px', background: 'rgba(234,163,0,0.08)' }}
          >
            <Activity size={18} style={{ color: '#C8922A' }} />
          </div>
          <p className="font-heading font-bold mt-3" style={{ color: '#0D0D0D', fontSize: '32px' }}>
            {activeLeads ?? 0}
          </p>
          <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '13px' }}>
            Active Leads
          </p>
          <p className="font-body mt-2" style={{ color: '#9CA3AF', fontSize: '12px' }}>
            Needs attention
          </p>
        </div>

        {/* Converted */}
        <div
          className="bg-white rounded-2xl p-5 shadow-sm"
          style={{ border: '1px solid #E5E7EB' }}
        >
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: '40px', height: '40px', background: 'rgba(22,163,74,0.08)' }}
          >
            <CheckCircle size={18} style={{ color: '#16A34A' }} />
          </div>
          <p className="font-heading font-bold mt-3" style={{ color: '#0D0D0D', fontSize: '32px' }}>
            {convertedLeads ?? 0}
          </p>
          <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '13px' }}>
            Converted
          </p>
          <p className="font-body mt-2" style={{ color: '#9CA3AF', fontSize: '12px' }}>
            All time
          </p>
        </div>

        {/* Pipeline Value */}
        <div
          className="bg-white rounded-2xl p-5 shadow-sm"
          style={{ border: '1px solid #E5E7EB' }}
        >
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: '40px', height: '40px', background: 'rgba(139,47,201,0.08)' }}
          >
            <TrendingUp size={18} style={{ color: '#8B2FC9' }} />
          </div>
          <p className="font-heading font-bold mt-3" style={{ color: '#0D0D0D', fontSize: '32px' }}>
            {formatCurrency(pipelineValue)}
          </p>
          <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '13px' }}>
            Pipeline Value
          </p>
          <p className="font-body mt-2" style={{ color: '#9CA3AF', fontSize: '12px' }}>
            Open proposals
          </p>
        </div>

        {/* Monthly Recurring — clickable */}
        <Link
          href="/dashboard/retainers"
          className="bg-white rounded-2xl p-5 shadow-sm block transition-colors"
          style={{ border: '1px solid #E5E7EB' }}
          onMouseEnter={undefined}
        >
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: '40px', height: '40px', background: 'rgba(139,47,201,0.08)' }}
          >
            <RefreshCw size={18} style={{ color: '#8B2FC9' }} />
          </div>
          <p className="font-heading font-bold mt-3" style={{ color: '#0D0D0D', fontSize: '32px' }}>
            {formatCurrency(totalMRR)}
          </p>
          <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '13px' }}>
            Monthly Recurring
          </p>
          <p className="font-body mt-2" style={{ color: '#8B2FC9', fontSize: '12px' }}>
            {retainerCount} client{retainerCount !== 1 ? 's' : ''} →
          </p>
        </Link>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
        {/* Recent Leads */}
        <div
          className="bg-white rounded-2xl p-6 shadow-sm"
          style={{ border: '1px solid #E5E7EB' }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '17px' }}>
              Recent Leads
            </h2>
            <Link
              href="/dashboard/leads"
              className="font-body transition-opacity hover:opacity-70"
              style={{ color: '#8B2FC9', fontSize: '13px' }}
            >
              View all →
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <UsersIcon size={32} style={{ color: '#6B7280' }} />
              <p className="font-body mt-2" style={{ color: '#6B7280', fontSize: '14px' }}>
                No leads yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead, i) => {
                const status = statusConfig[lead.status] ?? statusConfig.new
                return (
                  <div
                    key={lead.id}
                    className="flex gap-4 items-start pb-3"
                    style={{
                      borderBottom: i < recentLeads.length - 1 ? '1px solid #F5F5F5' : undefined,
                    }}
                  >
                    {/* Avatar */}
                    <div
                      className="flex-shrink-0 flex items-center justify-center rounded-full"
                      style={{ width: '36px', height: '36px', background: '#0D0D0D' }}
                    >
                      <span className="font-heading font-bold text-white" style={{ fontSize: '12px' }}>
                        {getInitials(lead.full_name)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 mr-2">
                          <p className="font-body font-semibold truncate" style={{ color: '#0D0D0D', fontSize: '14px' }}>
                            {lead.business_name}
                          </p>
                          <p className="font-body mt-0.5" style={{ color: '#6B7280', fontSize: '12px' }}>
                            {lead.full_name}
                          </p>
                        </div>
                        <span
                          className="font-body font-semibold flex-shrink-0 px-2 py-0.5 rounded-full"
                          style={{ fontSize: '11px', background: status.bg, color: status.color }}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {lead.industry && (
                          <span className="font-body" style={{ color: '#6B7280', fontSize: '12px' }}>
                            {lead.industry}
                          </span>
                        )}
                        {lead.industry && (
                          <span style={{ color: '#6B7280', fontSize: '12px' }}>·</span>
                        )}
                        <span className="font-body" style={{ color: '#6B7280', fontSize: '12px' }}>
                          {timeAgo(lead.created_at)}
                        </span>
                        {lead.priority_score > 0 && (
                          <span
                            className="font-body font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              fontSize: '11px',
                              color: priorityColor(lead.priority_score),
                              background: priorityBg(lead.priority_score),
                            }}
                          >
                            {priorityLabel(lead.priority_score)}
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

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Active Projects */}
          <div
            className="bg-white rounded-2xl p-5 shadow-sm"
            style={{ border: '1px solid #E5E7EB' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '16px' }}>
                Active Projects
              </h2>
              <Link
                href="/dashboard/projects"
                className="font-body transition-opacity hover:opacity-70"
                style={{ color: '#8B2FC9', fontSize: '13px' }}
              >
                View all →
              </Link>
            </div>

            {activeProjects.length === 0 ? (
              <p className="font-body text-center py-6" style={{ color: '#6B7280', fontSize: '13px' }}>
                No active projects
              </p>
            ) : (
              <div className="space-y-3">
                {activeProjects.map((project) => {
                  const tier = tierConfig[project.tier] ?? tierConfig.audit
                  const pStatus = projectStatusConfig[project.status] ?? projectStatusConfig.kickoff
                  return (
                    <div key={project.id} className="rounded-xl p-3" style={{ background: '#F9F9F9' }}>
                      <p className="font-body font-semibold mb-1" style={{ color: '#0D0D0D', fontSize: '13px' }}>
                        {project.business_name}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <span
                          className="font-body font-semibold px-2 py-0.5 rounded-full"
                          style={{ fontSize: '11px', background: tier.bg, color: tier.color }}
                        >
                          {project.tier}
                        </span>
                        <span
                          className="font-body font-semibold px-2 py-0.5 rounded-full"
                          style={{ fontSize: '11px', background: pStatus.bg, color: pStatus.color }}
                        >
                          {pStatus.label}
                        </span>
                      </div>
                      {project.target_date && (
                        <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '11px' }}>
                          Due {fmtDate(project.target_date)}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Revenue Snapshot */}
          <div
            className="bg-white rounded-2xl p-5 shadow-sm"
            style={{ border: '1px solid #E5E7EB' }}
          >
            <h2 className="font-heading font-bold mb-4" style={{ color: '#0D0D0D', fontSize: '16px' }}>
              Revenue Snapshot
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-body" style={{ color: '#6B7280', fontSize: '13px' }}>
                  Pipeline
                </span>
                <span className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '16px' }}>
                  {formatCurrency(pipelineValue)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-body" style={{ color: '#6B7280', fontSize: '13px' }}>
                  Won (contract value)
                </span>
                <span className="font-heading font-bold" style={{ color: '#16A34A', fontSize: '16px' }}>
                  {formatCurrency(confirmedValue)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  href="/dashboard/retainers"
                  className="font-body flex items-center gap-1 transition-opacity hover:opacity-70"
                  style={{ color: '#6B7280', fontSize: '13px' }}
                >
                  <RefreshCw size={12} style={{ color: '#8B2FC9' }} />
                  Monthly Recurring
                </Link>
                <span className="font-heading font-bold" style={{ color: '#8B2FC9', fontSize: '16px' }}>
                  {formatCurrency(totalMRR)}<span className="font-body font-normal" style={{ fontSize: '12px', color: '#9CA3AF' }}>/mo</span>
                </span>
              </div>

              <div style={{ borderTop: '1px solid #E5E7EB' }} />

              <div className="flex items-center justify-between">
                <span className="font-body" style={{ color: '#6B7280', fontSize: '13px' }}>
                  Conversion Rate
                </span>
                <span className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '16px' }}>
                  {conversionRate !== null ? `${conversionRate}%` : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
