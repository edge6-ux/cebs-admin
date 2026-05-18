import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ChevronLeft,
  Mail,
  Phone,
  Building2,
  Globe,
  Plus,
  ExternalLink,
  Briefcase,
  RefreshCw,
} from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase-server'
import { fmtDate, formatCurrency } from '@/lib/utils'
import type { Customer, Job, Proposal, Lead } from '@/lib/types'
import CustomerManagement from '@/components/customers/CustomerManagement'

function getInitials(name: string): string {
  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  active:   { label: 'Active',   bg: '#D1FAE5', color: '#065F46' },
  inactive: { label: 'Inactive', bg: '#F3F4F6', color: '#6B7280' },
  churned:  { label: 'Churned',  bg: '#FCEBEB', color: '#991B1B' },
}

const jobStatusConfig: Record<string, { label: string; bg: string; color: string }> = {
  queued:      { label: 'Queued',      bg: '#F3F4F6', color: '#6B7280' },
  in_progress: { label: 'In Progress', bg: '#DBEAFE', color: '#1D4ED8' },
  review:      { label: 'Review',      bg: '#EDE9FE', color: '#6D28D9' },
  delivered:   { label: 'Delivered',   bg: '#D1FAE5', color: '#065F46' },
  on_hold:     { label: 'On Hold',     bg: '#FEF3C7', color: '#92400E' },
}

const proposalStatusConfig: Record<string, { label: string; bg: string; color: string }> = {
  draft:    { label: 'Draft',    bg: '#F3F4F6', color: '#6B7280' },
  sent:     { label: 'Sent',     bg: '#DBEAFE', color: '#1D4ED8' },
  accepted: { label: 'Accepted', bg: '#D1FAE5', color: '#065F46' },
  declined: { label: 'Declined', bg: '#FEE2E2', color: '#B91C1C' },
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

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: customerData } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (!customerData) redirect('/dashboard/customers')

  const customer = customerData as Customer

  const [
    { data: jobsRaw },
    { data: proposalsRaw },
    { data: leadData },
    { data: projectsRaw },
  ] = await Promise.all([
    supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('customer_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
    customer.lead_id
      ? supabaseAdmin
          .from('proposals')
          .select('*')
          .eq('lead_id', customer.lead_id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    customer.lead_id
      ? supabaseAdmin
          .from('cebs_leads')
          .select('*')
          .eq('id', customer.lead_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    customer.lead_id
      ? supabaseAdmin
          .from('projects')
          .select('contract_value')
          .eq('lead_id', customer.lead_id)
          .is('deleted_at', null)
      : Promise.resolve({ data: [] }),
  ])

  const jobs = (jobsRaw ?? []) as Job[]
  const proposals = (proposalsRaw ?? []) as Proposal[]
  const lead = leadData as Lead | null

  const activeJobs = jobs.filter((j) => j.status !== 'delivered' && j.status !== 'on_hold').length
  const totalValue = (projectsRaw ?? []).reduce(
    (sum, p) => sum + ((p as { contract_value: number }).contract_value || 0),
    0
  )

  const cStatus = statusConfig[customer.status] ?? statusConfig.inactive

  // Timeline events
  const timelineEvents: { label: string; date: string; dot: string }[] = []
  if (lead) {
    timelineEvents.push({ label: 'Consultation submitted', date: lead.created_at, dot: '#3B82F6' })
  }
  proposals
    .filter((p) => p.status === 'accepted')
    .forEach((p) => timelineEvents.push({ label: 'Proposal accepted', date: p.created_at, dot: '#16A34A' }))
  jobs
    .filter((j) => j.status === 'delivered' && j.completed_at)
    .forEach((j) =>
      timelineEvents.push({ label: `Job delivered: ${j.title}`, date: j.completed_at!, dot: '#16A34A' })
    )
  timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  timelineEvents.push({ label: 'Customer since', date: customer.created_at, dot: '#8B2FC9' })

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back */}
      <Link
        href="/dashboard/customers"
        className="inline-flex items-center gap-1 font-body mb-6 transition-colors hover:text-[#0D0D0D]"
        style={{ color: '#6B7280', fontSize: '14px' }}
      >
        <ChevronLeft size={16} />
        Back to Customers
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
        <div className="flex gap-5 items-start flex-wrap">
          {/* Avatar */}
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-full"
            style={{ width: '64px', height: '64px', background: '#0D0D0D' }}
          >
            <span className="font-heading font-bold text-white" style={{ fontSize: '22px' }}>
              {getInitials(customer.business_name)}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '24px' }}>
                  {customer.business_name}
                </h1>
                <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '14px' }}>
                  {customer.contact_name}
                </p>
                <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '13px' }}>
                  Customer since {fmtDate(customer.created_at)}
                </p>
              </div>

              <div className="flex items-start gap-2 flex-wrap">
                <span
                  className="font-body font-bold px-3 py-1.5 rounded-xl capitalize"
                  style={{ fontSize: '13px', background: cStatus.bg, color: cStatus.color }}
                >
                  {customer.status}
                </span>
                {customer.on_retainer && (
                  <span
                    className="inline-flex items-center gap-1.5 font-body font-bold px-3 py-1.5 rounded-xl"
                    style={{ fontSize: '13px', background: 'rgba(139,47,201,0.1)', color: '#8B2FC9' }}
                  >
                    <RefreshCw size={12} />
                    {formatCurrency(customer.retainer_amount)}/mo
                  </span>
                )}
              </div>
            </div>

            {/* Contact row */}
            <div className="flex gap-5 flex-wrap mt-4">
              <a
                href={`mailto:${customer.email}`}
                className="flex items-center gap-2 font-body transition-opacity hover:opacity-70"
                style={{ color: '#8B2FC9', fontSize: '14px' }}
              >
                <Mail size={16} style={{ color: '#6B7280' }} />
                {customer.email}
              </a>
              {customer.phone && (
                <a
                  href={`tel:${customer.phone}`}
                  className="flex items-center gap-2 font-body transition-opacity hover:opacity-70"
                  style={{ color: '#8B2FC9', fontSize: '14px' }}
                >
                  <Phone size={16} style={{ color: '#6B7280' }} />
                  {customer.phone}
                </a>
              )}
              {customer.industry && (
                <div className="flex items-center gap-2">
                  <Building2 size={16} style={{ color: '#6B7280' }} />
                  <span className="font-body" style={{ color: '#4A4A4A', fontSize: '14px' }}>
                    {customer.industry}
                  </span>
                </div>
              )}
              {customer.website && (
                <a
                  href={customer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-body transition-opacity hover:opacity-70"
                  style={{ color: '#8B2FC9', fontSize: '14px' }}
                >
                  <Globe size={16} style={{ color: '#6B7280' }} />
                  {customer.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>

            {/* Stats row */}
            <div
              className="flex gap-6 flex-wrap mt-4 pt-4"
              style={{ borderTop: '1px solid #F5F5F5' }}
            >
              {[
                { value: jobs.length,                 label: 'Total Jobs' },
                { value: activeJobs,                  label: 'Active Jobs' },
                { value: proposals.length,            label: 'Proposals' },
                { value: formatCurrency(totalValue),  label: 'Total Value' },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col">
                  <span className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '22px' }}>
                    {value}
                  </span>
                  <span className="font-body mt-0.5" style={{ color: '#6B7280', fontSize: '12px' }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
        <div className="flex gap-3 flex-wrap">
          <a
            href={`mailto:${customer.email}`}
            className="inline-flex items-center gap-2 font-body rounded-xl px-4 py-2.5 transition-colors hover:bg-gray-50"
            style={{ border: '1px solid #E5E7EB', color: '#4A4A4A', fontSize: '14px' }}
          >
            <Mail size={15} style={{ color: '#6B7280' }} />
            Send Email
          </a>

          {customer.phone ? (
            <a
              href={`tel:${customer.phone}`}
              className="inline-flex items-center gap-2 font-body rounded-xl px-4 py-2.5 transition-colors hover:bg-gray-50"
              style={{ border: '1px solid #E5E7EB', color: '#4A4A4A', fontSize: '14px' }}
            >
              <Phone size={15} style={{ color: '#6B7280' }} />
              Call
            </a>
          ) : (
            <button
              disabled
              className="inline-flex items-center gap-2 font-body rounded-xl px-4 py-2.5 opacity-40 cursor-not-allowed"
              style={{ border: '1px solid #E5E7EB', color: '#4A4A4A', fontSize: '14px' }}
            >
              <Phone size={15} style={{ color: '#6B7280' }} />
              Call
            </button>
          )}

          {customer.lead_id && (
            <Link
              href={`/dashboard/leads/${customer.lead_id}`}
              className="inline-flex items-center gap-2 font-body rounded-xl px-4 py-2.5 transition-colors hover:bg-purple-50"
              style={{ border: '1px solid #8B2FC9', color: '#8B2FC9', fontSize: '14px' }}
            >
              <ExternalLink size={15} />
              View Lead
            </Link>
          )}

          <Link
            href={`/dashboard/jobs/new?customerId=${customer.id}`}
            className="inline-flex items-center gap-2 font-body font-medium text-white rounded-xl px-4 py-2.5 transition-opacity hover:opacity-90 ml-auto"
            style={{ background: '#8B2FC9', fontSize: '14px' }}
          >
            <Plus size={15} />
            New Job
          </Link>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
        {/* Left */}
        <div>
          {/* Jobs */}
          <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '17px' }}>
                Jobs
              </h2>
              <span className="font-body" style={{ color: '#6B7280', fontSize: '13px' }}>
                {jobs.length} total
              </span>
            </div>

            {jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6">
                <Briefcase size={28} style={{ color: '#D1D5DB' }} />
                <p className="font-body mt-2" style={{ color: '#6B7280', fontSize: '14px' }}>
                  No jobs yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => {
                  const jStatus = jobStatusConfig[job.status] ?? jobStatusConfig.queued
                  const isOverdue =
                    job.due_date &&
                    job.status !== 'delivered' &&
                    new Date(job.due_date) < new Date()
                  return (
                    <Link
                      key={job.id}
                      href={`/dashboard/jobs/${job.id}`}
                      className="block rounded-xl p-4 transition-colors hover:bg-[#F3F4F6]"
                      style={{ background: '#F9F9F9' }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-body font-semibold" style={{ color: '#0D0D0D', fontSize: '14px' }}>
                            {job.title}
                          </p>
                          <p className="font-body mt-0.5 capitalize" style={{ color: '#6B7280', fontSize: '12px' }}>
                            {job.type}
                          </p>
                        </div>
                        <div>
                          <span
                            className="inline-block font-body font-semibold px-2 py-0.5 rounded-full"
                            style={{ fontSize: '11px', background: jStatus.bg, color: jStatus.color }}
                          >
                            {jStatus.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        {job.due_date && (
                          <p
                            className="font-body"
                            style={{ fontSize: '12px', color: isOverdue ? '#E24B4A' : '#6B7280' }}
                          >
                            Due {fmtDate(job.due_date)}
                          </p>
                        )}
                        {job.live_url && (
                          <a
                            href={job.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 font-body transition-opacity hover:opacity-70"
                            style={{ color: '#8B2FC9', fontSize: '12px' }}
                          >
                            <ExternalLink size={10} />
                            View live
                          </a>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Proposals */}
          <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
            <h2 className="font-heading font-bold mb-5" style={{ color: '#0D0D0D', fontSize: '17px' }}>
              Proposals
            </h2>

            {proposals.length === 0 ? (
              <p className="font-body text-center py-4" style={{ color: '#6B7280', fontSize: '13px' }}>
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
                        <div>
                          <span
                            className="inline-block font-body font-semibold px-2 py-0.5 rounded-full"
                            style={{ fontSize: '11px', background: pStatus.bg, color: pStatus.color }}
                          >
                            {pStatus.label}
                          </span>
                        </div>
                      </div>
                      <p className="font-body font-semibold mt-1" style={{ color: '#8B2FC9', fontSize: '13px' }}>
                        {formatCurrency(proposal.investment_low)} – {formatCurrency(proposal.investment_high)}
                      </p>
                      <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '12px' }}>
                        {fmtDate(proposal.created_at)}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div>
          <CustomerManagement customer={customer} />

          {/* Timeline */}
          <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
            <SectionLabel>Timeline</SectionLabel>

            <div className="space-y-0">
              {timelineEvents.map((event, i) => (
                <div key={i} className="flex gap-3 items-start pb-4">
                  <div className="flex flex-col items-center flex-shrink-0" style={{ marginTop: '3px' }}>
                    <div
                      className="rounded-full flex-shrink-0"
                      style={{ width: '8px', height: '8px', background: event.dot }}
                    />
                    {i < timelineEvents.length - 1 && (
                      <div style={{ width: '1px', flex: 1, background: '#E5E7EB', minHeight: '20px', marginTop: '4px' }} />
                    )}
                  </div>
                  <div>
                    <p className="font-body font-medium" style={{ color: '#0D0D0D', fontSize: '13px' }}>
                      {event.label}
                    </p>
                    <p className="font-body mt-0.5" style={{ color: '#6B7280', fontSize: '12px' }}>
                      {fmtDate(event.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
