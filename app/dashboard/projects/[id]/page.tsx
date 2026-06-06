import { redirect } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-server'
import type { Project, Job, Customer, Proposal, LineItem } from '@/lib/types'
import { fmtDate, formatCurrency } from '@/lib/utils'
import {
  ChevronLeft,
  DollarSign,
  RefreshCw,
  Calendar,
  Clock,
  Hammer,
  Plus,
  Mail,
  Phone,
  Globe,
} from 'lucide-react'
import ProjectManagement from '@/components/projects/ProjectManagement'

type ProposalWithLineItems = Proposal & { line_items: LineItem[] }

const tierBadge: Record<string, { bg: string; color: string }> = {
  audit:    { bg: '#EDE9FE',              color: '#6D28D9' },
  optimize: { bg: '#DBEAFE',              color: '#1D4ED8' },
  build:    { bg: 'rgba(139,47,201,0.1)', color: '#8B2FC9' },
}

const statusBadge: Record<string, { bg: string; color: string; label: string }> = {
  kickoff:     { bg: '#FEF3C7', color: '#92400E', label: 'Kickoff' },
  in_progress: { bg: '#DBEAFE', color: '#1D4ED8', label: 'In Progress' },
  review:      { bg: '#EDE9FE', color: '#6D28D9', label: 'Review' },
  complete:    { bg: '#D1FAE5', color: '#065F46', label: 'Complete' },
  on_hold:     { bg: '#F3F4F6', color: '#6B7280', label: 'On Hold' },
}

const jobTypeBadge: Record<string, { bg: string; color: string }> = {
  website:      { bg: '#DBEAFE',              color: '#1D4ED8' },
  optimization: { bg: '#D1FAE5',              color: '#065F46' },
  custom_build: { bg: '#EDE9FE',              color: '#6D28D9' },
  retainer:     { bg: 'rgba(139,47,201,0.1)', color: '#8B2FC9' },
  other:        { bg: '#F3F4F6',              color: '#6B7280' },
}

const jobStatusBadge: Record<string, { bg: string; color: string; label: string }> = {
  queued:      { bg: '#F3F4F6', color: '#6B7280', label: 'Queued' },
  in_progress: { bg: '#DBEAFE', color: '#1D4ED8', label: 'In Progress' },
  review:      { bg: '#EDE9FE', color: '#6D28D9', label: 'Review' },
  delivered:   { bg: '#D1FAE5', color: '#065F46', label: 'Delivered' },
  on_hold:     { bg: '#FEF3C7', color: '#92400E', label: 'On Hold' },
}

const proposalStatusBadge: Record<string, { bg: string; color: string; label: string }> = {
  draft:    { bg: '#F3F4F6', color: '#6B7280', label: 'Draft' },
  sent:     { bg: '#DBEAFE', color: '#1D4ED8', label: 'Sent' },
  accepted: { bg: '#D1FAE5', color: '#065F46', label: 'Accepted' },
  declined: { bg: '#FCEBEB', color: '#991B1B', label: 'Declined' },
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p
      className="font-body uppercase pb-3 mb-4"
      style={{ color: '#6B7280', fontSize: '11px', letterSpacing: '0.08em', borderBottom: '1px solid #F5F5F5' }}
    >
      {children}
    </p>
  )
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [projectResult, jobsResult] = await Promise.all([
    supabaseAdmin.from('projects').select('*').eq('id', id).is('deleted_at', null).single(),
    supabaseAdmin.from('jobs').select('*').eq('project_id', id).is('deleted_at', null).order('created_at', { ascending: true }),
  ])

  if (!projectResult.data) {
    redirect('/dashboard/projects')
  }

  const project = projectResult.data as Project
  const jobs    = (jobsResult.data ?? []) as Job[]

  const [customerResult, proposalResult] = await Promise.all([
    project.lead_id
      ? supabaseAdmin.from('customers').select('*').eq('lead_id', project.lead_id).maybeSingle()
      : Promise.resolve({ data: null }),
    project.proposal_id
      ? supabaseAdmin.from('proposals').select('*, line_items:proposal_line_items(*)').eq('id', project.proposal_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const customer = customerResult.data as Customer | null
  const proposal = proposalResult.data as ProposalWithLineItems | null

  const deliveredCount = jobs.filter((j) => j.status === 'delivered').length
  const progressPct    = jobs.length > 0 ? (deliveredCount / jobs.length) * 100 : 0

  const now        = new Date()
  const targetDate = project.target_date ? new Date(project.target_date) : null
  const isOverdue  = targetDate ? targetDate < now && project.status !== 'complete' : false

  const tier   = tierBadge[project.tier]    ?? tierBadge.build
  const status = statusBadge[project.status] ?? statusBadge.kickoff

  const addJobHref = `/dashboard/jobs/new?projectId=${project.id}${customer ? `&customerId=${customer.id}` : ''}`

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back */}
      <Link
        href="/dashboard/projects"
        className="inline-flex items-center gap-1 font-body mb-6 transition-colors hover:text-[#0D0D0D]"
        style={{ color: '#6B7280', fontSize: '14px' }}
      >
        <ChevronLeft size={16} />
        Back to Projects
      </Link>

      {/* Header card */}
      <div
        className="bg-white rounded-2xl p-6 mb-6 shadow-sm"
        style={{ border: '1px solid #E5E7EB' }}
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          {/* Left */}
          <div>
            <span
              className="inline-block font-body font-semibold px-2.5 py-1 rounded-full capitalize mb-2"
              style={{ fontSize: '12px', background: tier.bg, color: tier.color }}
            >
              {project.tier}
            </span>
            <p className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '24px', marginBottom: '4px' }}>
              {project.business_name}
            </p>
            <p className="font-body" style={{ color: '#6B7280', fontSize: '15px' }}>
              {project.client_name || 'No client linked'}
            </p>
          </div>

          {/* Right */}
          <span
            className="font-body font-bold px-3 py-1.5 rounded-xl"
            style={{ fontSize: '13px', background: status.bg, color: status.color }}
          >
            {status.label}
          </span>
        </div>

        {/* Details row */}
        <div className="flex flex-wrap gap-6 mt-4" style={{ borderTop: '1px solid #F5F5F5', paddingTop: '16px' }}>
          <div className="flex items-center gap-2">
            <DollarSign size={14} style={{ color: '#6B7280' }} />
            <span className="font-body" style={{ color: '#4A4A4A', fontSize: '13px' }}>
              {project.contract_value > 0 ? formatCurrency(project.contract_value) : '—'}
            </span>
          </div>

          {project.monthly_retainer > 0 && (
            <div className="flex items-center gap-2">
              <RefreshCw size={14} style={{ color: '#8B2FC9' }} />
              <span className="font-body font-semibold" style={{ color: '#8B2FC9', fontSize: '13px' }}>
                {formatCurrency(project.monthly_retainer)}<span style={{ fontWeight: 400, color: '#9CA3AF' }}>/mo</span>
              </span>
            </div>
          )}

          {project.start_date && (
            <div className="flex items-center gap-2">
              <Calendar size={14} style={{ color: '#6B7280' }} />
              <span className="font-body" style={{ color: '#4A4A4A', fontSize: '13px' }}>
                Started {fmtDate(project.start_date)}
              </span>
            </div>
          )}

          {project.target_date && (
            <div className="flex items-center gap-2">
              <Clock size={14} style={{ color: isOverdue ? '#E24B4A' : '#6B7280' }} />
              <span className="font-body" style={{ color: isOverdue ? '#E24B4A' : '#4A4A4A', fontSize: '13px' }}>
                Due {fmtDate(project.target_date)}
              </span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {jobs.length > 0 && (
          <div style={{ borderTop: '1px solid #F5F5F5', marginTop: '16px', paddingTop: '16px' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-body" style={{ color: '#6B7280', fontSize: '13px' }}>Progress</span>
              <span className="font-body" style={{ color: '#6B7280', fontSize: '13px' }}>
                {deliveredCount}/{jobs.length} jobs delivered
              </span>
            </div>
            <div className="rounded-full overflow-hidden" style={{ height: '8px', background: '#F3F4F6' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%`, background: '#8B2FC9' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* LEFT */}
        <div>

          {/* Jobs list */}
          <div
            className="bg-white rounded-2xl p-6 mb-4 shadow-sm"
            style={{ border: '1px solid #E5E7EB' }}
          >
            <div className="flex items-center justify-between mb-5">
              <p className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '17px' }}>
                Jobs
              </p>
              <Link
                href={addJobHref}
                className="inline-flex items-center gap-1.5 font-body font-medium text-white rounded-xl transition-colors hover:bg-[#7A28B8]"
                style={{ background: '#8B2FC9', fontSize: '13px', padding: '6px 12px' }}
              >
                <Plus size={13} />
                Add Job
              </Link>
            </div>

            {jobs.length === 0 ? (
              <div className="py-8 text-center">
                <Hammer size={32} style={{ color: '#9CA3AF', margin: '0 auto' }} />
                <p className="font-body mt-2" style={{ color: '#6B7280', fontSize: '14px' }}>No jobs yet</p>
                <p
                  className="font-body mt-1 mx-auto"
                  style={{ color: '#9CA3AF', fontSize: '13px', maxWidth: '280px' }}
                >
                  Jobs are created automatically when a proposal is accepted, or add one manually.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => {
                  const jType   = jobTypeBadge[job.type]    ?? jobTypeBadge.other
                  const jStatus = jobStatusBadge[job.status] ?? jobStatusBadge.queued
                  const due     = job.due_date ? new Date(job.due_date) : null
                  const overdue = due ? due < now && job.status !== 'delivered' : false
                  const dueSoon = due && !overdue
                    ? (due.getTime() - now.getTime()) < 7 * 24 * 60 * 60 * 1000
                    : false
                  const dueDateColor = overdue ? '#E24B4A' : dueSoon ? '#C8922A' : '#9CA3AF'

                  return (
                    <Link
                      key={job.id}
                      href={`/dashboard/jobs/${job.id}`}
                      className="block rounded-xl p-4 transition-all duration-150 hover:shadow-sm"
                      style={{ border: '1px solid #E5E7EB', background: 'white' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#D1D5DB' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB' }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-body font-semibold mb-1" style={{ color: '#0D0D0D', fontSize: '14px' }}>
                            {job.title}
                          </p>
                          <span
                            className="inline-flex font-body font-semibold px-2 py-0.5 rounded-full capitalize"
                            style={{ fontSize: '11px', background: jType.bg, color: jType.color }}
                          >
                            {job.type.replace('_', ' ')}
                          </span>
                        </div>
                        <span
                          className="font-body font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ fontSize: '11px', background: jStatus.bg, color: jStatus.color }}
                        >
                          {jStatus.label}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        {due ? (
                          <div className="flex items-center gap-1.5">
                            <Clock size={11} style={{ color: dueDateColor }} />
                            <span className="font-body" style={{ fontSize: '12px', color: dueDateColor }}>
                              {fmtDate(job.due_date!)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-body" style={{ fontSize: '12px', color: '#D1D5DB' }}>
                            No due date
                          </span>
                        )}

                        {job.assigned_to && (
                          <span className="font-body" style={{ fontSize: '12px', color: '#6B7280' }}>
                            {job.assigned_to}
                          </span>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Proposal summary */}
          {proposal && (
            <div
              className="bg-white rounded-2xl p-6 mb-4 shadow-sm"
              style={{ border: '1px solid #E5E7EB' }}
            >
              <SectionLabel>Proposal</SectionLabel>

              <div className="flex items-center justify-between mb-4">
                <p className="font-heading font-bold capitalize" style={{ color: '#0D0D0D', fontSize: '16px' }}>
                  {proposal.tier}
                </p>
                {(() => {
                  const ps = proposalStatusBadge[proposal.status] ?? proposalStatusBadge.draft
                  return (
                    <span
                      className="font-body font-semibold px-2 py-0.5 rounded-full"
                      style={{ fontSize: '11px', background: ps.bg, color: ps.color }}
                    >
                      {ps.label}
                    </span>
                  )
                })()}
              </div>

              <p className="font-body font-semibold mb-3" style={{ color: '#8B2FC9', fontSize: '16px' }}>
                {formatCurrency(proposal.investment_low)}
                {proposal.investment_high !== proposal.investment_low && (
                  <> – {formatCurrency(proposal.investment_high)}</>
                )}
              </p>

              {proposal.line_items && proposal.line_items.length > 0 && (
                <div className="mb-3">
                  <p className="font-body font-medium mb-2" style={{ color: '#6B7280', fontSize: '12px' }}>
                    Services
                  </p>
                  <div className="space-y-1.5">
                    {proposal.line_items.map((item, i) => (
                      <div key={item.id ?? i} className="flex items-center gap-2">
                        <div
                          className="flex-shrink-0 rounded-full"
                          style={{ width: '4px', height: '4px', background: '#8B2FC9' }}
                        />
                        <span className="font-body" style={{ color: '#4A4A4A', fontSize: '13px' }}>
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Link
                href={`/dashboard/proposals/${proposal.id}`}
                className="block font-body font-medium mt-3 transition-opacity hover:opacity-70"
                style={{ color: '#8B2FC9', fontSize: '13px' }}
              >
                View Full Proposal →
              </Link>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div>

          {/* Project management (client component) */}
          <ProjectManagement project={project} />

          {/* Customer info */}
          <div
            className="bg-white rounded-2xl p-5 mb-4 shadow-sm"
            style={{ border: '1px solid #E5E7EB' }}
          >
            <SectionLabel>Customer</SectionLabel>

            {!customer ? (
              <p className="font-body" style={{ color: '#9CA3AF', fontSize: '13px' }}>
                No customer linked
              </p>
            ) : (
              <>
                <p className="font-body font-semibold mb-1" style={{ color: '#0D0D0D', fontSize: '14px' }}>
                  {customer.business_name}
                </p>
                <p className="font-body mb-3" style={{ color: '#6B7280', fontSize: '13px' }}>
                  {customer.contact_name}
                </p>

                <div className="space-y-2">
                  {customer.email && (
                    <a
                      href={`mailto:${customer.email}`}
                      className="flex items-center gap-2 font-body transition-colors hover:text-[#0D0D0D]"
                      style={{ color: '#4A4A4A', fontSize: '13px' }}
                    >
                      <Mail size={13} style={{ color: '#6B7280', flexShrink: 0 }} />
                      {customer.email}
                    </a>
                  )}
                  {customer.phone && (
                    <a
                      href={`tel:${customer.phone}`}
                      className="flex items-center gap-2 font-body transition-colors hover:text-[#0D0D0D]"
                      style={{ color: '#4A4A4A', fontSize: '13px' }}
                    >
                      <Phone size={13} style={{ color: '#6B7280', flexShrink: 0 }} />
                      {customer.phone}
                    </a>
                  )}
                  {customer.website && (
                    <a
                      href={customer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 font-body transition-colors hover:text-[#0D0D0D]"
                      style={{ color: '#4A4A4A', fontSize: '13px' }}
                    >
                      <Globe size={13} style={{ color: '#6B7280', flexShrink: 0 }} />
                      {customer.website}
                    </a>
                  )}
                </div>

                <Link
                  href={`/dashboard/customers/${customer.id}`}
                  className="block font-body font-medium mt-3 transition-opacity hover:opacity-70"
                  style={{ color: '#8B2FC9', fontSize: '13px' }}
                >
                  View Customer →
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
