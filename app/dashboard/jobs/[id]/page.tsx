import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Calendar, Clock, User, Briefcase, Mail, Phone, Globe } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase-server'
import type { Job, Customer, Project } from '@/lib/types'
import { fmtDate, formatCurrency } from '@/lib/utils'
import RetainerJobDetail from '@/components/jobs/RetainerJobDetail'
import DeliveryRecord from '@/components/jobs/DeliveryRecord'
import JobManagement from '@/components/jobs/JobManagement'
import QuickActions from '@/components/jobs/QuickActions'
import LogoImage from '@/components/jobs/LogoImage'

// ─── local types for joined / partial queries ────────────────────────────────

interface ProposalLineItem {
  id?: string
  name: string
  description?: string | null
  service?: { description?: string | null } | null
}

interface ProposalRow {
  id: string
  scope?: string | null
  line_items?: ProposalLineItem[]
}

interface LeadContext {
  interested_in?: string | null
  interested_category?: string | null
  challenge?: string | null
  monthly_spend?: string | null
  website?: string | null
  brand_colors?: string[] | null
  logo_url?: string | null
  services_offered?: string | null
  what_is_working?: string | null
  success_definition?: string | null
  previous_attempts?: string | null
}

// ─── badge configs ────────────────────────────────────────────────────────────

const TYPE_BADGE: Record<string, { bg: string; color: string }> = {
  website:      { bg: '#EEF2FF', color: '#4338CA' },
  optimization: { bg: '#FEF3C7', color: '#92400E' },
  custom_build: { bg: 'rgba(139,47,201,0.1)', color: '#8B2FC9' },
  retainer:     { bg: '#D1FAE5', color: '#065F46' },
  other:        { bg: '#F3F4F6', color: '#6B7280' },
}

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  queued:      { bg: '#F3F4F6', color: '#6B7280', label: 'Queued' },
  in_progress: { bg: '#DBEAFE', color: '#1D4ED8', label: 'In Progress' },
  review:      { bg: '#EDE9FE', color: '#6D28D9', label: 'In Review' },
  delivered:   { bg: '#D1FAE5', color: '#065F46', label: 'Delivered' },
  on_hold:     { bg: '#FEF3C7', color: '#92400E', label: 'On Hold' },
}

const PRIORITY_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  urgent: { bg: '#FCEBEB', color: '#991B1B', label: 'Urgent' },
  high:   { bg: '#FEF3C7', color: '#92400E', label: 'High' },
  medium: { bg: '#F3F4F6', color: '#6B7280', label: 'Medium' },
  low:    { bg: '#F3F4F6', color: '#9CA3AF', label: 'Low' },
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return (
    <p
      className="font-body uppercase pb-3 mb-5"
      style={{ color: '#6B7280', fontSize: '11px', letterSpacing: '0.08em', borderBottom: '1px solid #F5F5F5' }}
    >
      {text}
    </p>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // 1. Job + customer (joined)
  const { data: raw } = await supabaseAdmin
    .from('jobs')
    .select('*, customer:customers(*)')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!raw) redirect('/dashboard/jobs')

  const rawData = raw as Record<string, unknown>
  const customer = (rawData.customer ?? null) as Customer | null
  const { customer: _c, ...jobFields } = rawData
  const job = jobFields as unknown as Job

  // Retainer jobs get their own layout
  if (job.type === 'retainer') {
    return <RetainerJobDetail job={job} customer={customer} />
  }

  // 2. Project + proposal + lead (parallel, all conditional)
  const [projectResult, proposalResult, leadResult] = await Promise.all([
    job.project_id
      ? supabaseAdmin.from('projects').select('*').eq('id', job.project_id).maybeSingle()
      : Promise.resolve({ data: null }),
    job.proposal_id
      ? supabaseAdmin
          .from('proposals')
          .select('*, line_items:proposal_line_items(*, service:services(*))')
          .eq('id', job.proposal_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    customer?.lead_id
      ? supabaseAdmin
          .from('cebs_leads')
          .select(
            'interested_in, interested_category, challenge, monthly_spend, website, brand_colors, logo_url, services_offered, what_is_working, success_definition, previous_attempts'
          )
          .eq('id', customer.lead_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const project = projectResult.data as Project | null
  const proposal = proposalResult.data as ProposalRow | null
  const lead = leadResult.data as LeadContext | null

  // ── derived values ──────────────────────────────────────────────────────────

  const now = new Date()
  const dueDateObj = job.due_date ? new Date(job.due_date) : null
  const isOverdue = dueDateObj && dueDateObj < now && job.status !== 'delivered'
  const isDueSoon =
    dueDateObj &&
    !isOverdue &&
    dueDateObj.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000
  const dueDateColor = isOverdue ? '#E24B4A' : isDueSoon ? '#C8922A' : '#6B7280'

  const typeBadge = TYPE_BADGE[job.type] ?? TYPE_BADGE.other
  const statusBadge = STATUS_BADGE[job.status] ?? STATUS_BADGE.queued
  const priorityBadge = PRIORITY_BADGE[job.priority] ?? PRIORITY_BADGE.medium

  const hasLeadContext =
    lead &&
    (lead.challenge ||
      lead.success_definition ||
      lead.interested_in ||
      lead.what_is_working ||
      lead.previous_attempts)

  const brandColors = (lead?.brand_colors ?? []).filter((c): c is string => !!c?.trim())
  const hasBrandAssets = customer?.logo_url || brandColors.length > 0

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back */}
      <Link
        href={project ? `/dashboard/projects/${job.project_id}` : '/dashboard/jobs'}
        className="inline-flex items-center gap-1.5 font-body mb-6 transition-opacity hover:opacity-70"
        style={{ color: '#6B7280', fontSize: '14px' }}
      >
        <ChevronLeft size={16} />
        {project ? `Back to ${project.business_name}` : 'Back to Jobs'}
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <span
              className="inline-block font-body font-semibold px-2.5 py-1 rounded-full mb-2 capitalize"
              style={{ fontSize: '12px', background: typeBadge.bg, color: typeBadge.color }}
            >
              {job.type.replace(/_/g, ' ')}
            </span>
            <p className="font-heading font-bold mb-1" style={{ color: '#0D0D0D', fontSize: '24px' }}>
              {job.title}
            </p>
            <p className="font-body" style={{ color: '#6B7280', fontSize: '15px' }}>
              {customer?.business_name ?? 'No customer linked'}
            </p>
          </div>

          <div className="flex items-start gap-2 flex-wrap">
            <span
              className="font-body font-bold px-3 py-1.5 rounded-xl"
              style={{ fontSize: '13px', background: statusBadge.bg, color: statusBadge.color }}
            >
              {statusBadge.label}
            </span>
            <span
              className="font-body font-semibold px-2.5 py-1 rounded-full"
              style={{ fontSize: '12px', background: priorityBadge.bg, color: priorityBadge.color }}
            >
              {priorityBadge.label}
            </span>
          </div>
        </div>

        {/* Details row */}
        <div className="flex items-center gap-6 flex-wrap mt-4">
          <span className="flex items-center gap-2 font-body" style={{ color: '#4A4A4A', fontSize: '13px' }}>
            <Calendar size={14} style={{ color: '#6B7280' }} />
            Started {fmtDate(job.created_at)}
          </span>

          {job.due_date && (
            <span className="flex items-center gap-2 font-body" style={{ color: dueDateColor, fontSize: '13px' }}>
              <Clock size={14} style={{ color: dueDateColor }} />
              {fmtDate(job.due_date)}
              {isOverdue && ' · Overdue'}
            </span>
          )}

          {job.assigned_to && (
            <span className="flex items-center gap-2 font-body" style={{ color: '#4A4A4A', fontSize: '13px' }}>
              <User size={14} style={{ color: '#6B7280' }} />
              {job.assigned_to}
            </span>
          )}

          {project && (
            <Link
              href={`/dashboard/projects/${project.id}`}
              className="flex items-center gap-2 font-body transition-opacity hover:opacity-70"
              style={{ color: '#8B2FC9', fontSize: '13px' }}
            >
              <Briefcase size={14} style={{ color: '#8B2FC9' }} />
              {project.business_name}
            </Link>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
        {/* ── Left column ── */}
        <div>
          {/* Job Description */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 mb-4" style={{ borderColor: '#E5E7EB' }}>
            <SectionLabel text="Job Description" />
            {job.description ? (
              <p
                className="font-body"
                style={{ color: '#4A4A4A', fontSize: '15px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}
              >
                {job.description}
              </p>
            ) : (
              <p className="font-body" style={{ color: '#9CA3AF', fontSize: '14px' }}>
                No description provided.
              </p>
            )}
          </div>

          {/* Client Context */}
          {hasLeadContext && (
            <div className="bg-white rounded-2xl border shadow-sm p-6 mb-4" style={{ borderColor: '#E5E7EB' }}>
              <SectionLabel text="Client Context" />
              <p className="font-body mb-5" style={{ color: '#6B7280', fontSize: '13px' }}>
                Pulled from the original consultation — use this to inform the build.
              </p>

              {lead?.challenge && (
                <div className="mb-4">
                  <p className="font-body font-medium mb-1" style={{ color: '#6B7280', fontSize: '12px' }}>
                    Their Challenge
                  </p>
                  <div className="bg-[#F9F9F9] rounded-xl px-4 py-3">
                    <p className="font-body" style={{ color: '#4A4A4A', fontSize: '14px', lineHeight: '1.7' }}>
                      {lead.challenge}
                    </p>
                  </div>
                </div>
              )}

              {lead?.success_definition && (
                <div className="mb-4">
                  <p className="font-body font-medium mb-1" style={{ color: '#6B7280', fontSize: '12px' }}>
                    What Success Looks Like
                  </p>
                  <div className="bg-[#F9F9F9] rounded-xl px-4 py-3">
                    <p className="font-body" style={{ color: '#4A4A4A', fontSize: '14px', lineHeight: '1.7' }}>
                      {lead.success_definition}
                    </p>
                  </div>
                </div>
              )}

              {lead?.interested_in && (
                <div className="mb-4">
                  <p className="font-body font-medium mb-1" style={{ color: '#6B7280', fontSize: '12px' }}>
                    Specifically Requested
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-body font-semibold" style={{ color: '#8B2FC9', fontSize: '14px' }}>
                      {lead.interested_in}
                    </p>
                    {lead.interested_category && (
                      <span
                        className="font-body px-2 py-0.5 rounded-full"
                        style={{ fontSize: '11px', background: '#F3F4F6', color: '#6B7280' }}
                      >
                        {lead.interested_category}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {lead?.what_is_working && (
                <div className="mb-4">
                  <p className="font-body font-medium mb-1" style={{ color: '#6B7280', fontSize: '12px' }}>
                    What&apos;s Working Well
                  </p>
                  <p className="font-body" style={{ color: '#4A4A4A', fontSize: '14px', lineHeight: '1.6' }}>
                    {lead.what_is_working}
                  </p>
                </div>
              )}

              {lead?.previous_attempts && (
                <div>
                  <p className="font-body font-medium mb-1" style={{ color: '#6B7280', fontSize: '12px' }}>
                    Previous Attempts
                  </p>
                  <p className="font-body" style={{ color: '#4A4A4A', fontSize: '14px', lineHeight: '1.6' }}>
                    {lead.previous_attempts}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Proposal Scope */}
          {proposal && (
            <div className="bg-white rounded-2xl border shadow-sm p-6 mb-4" style={{ borderColor: '#E5E7EB' }}>
              <SectionLabel text="Proposal Scope" />

              {proposal.scope && (
                <p
                  className="font-body mb-4"
                  style={{ color: '#4A4A4A', fontSize: '14px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}
                >
                  {proposal.scope}
                </p>
              )}

              {proposal.line_items && proposal.line_items.length > 0 && (
                <div>
                  <p className="font-body font-medium mb-3" style={{ color: '#6B7280', fontSize: '12px' }}>
                    Services in this Proposal
                  </p>
                  <div className="space-y-2">
                    {proposal.line_items.map((item, i) => (
                      <div key={item.id ?? i} className="flex gap-2.5 items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#8B2FC9] mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="font-body font-semibold" style={{ color: '#0D0D0D', fontSize: '13px' }}>
                            {item.name}
                          </p>
                          {(item.description || item.service?.description) && (
                            <p
                              className="font-body mt-0.5"
                              style={{ color: '#6B7280', fontSize: '12px', lineHeight: '1.4' }}
                            >
                              {item.description || item.service?.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Delivery Record */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 mb-4" style={{ borderColor: '#E5E7EB' }}>
            <SectionLabel text="Delivery Record" />
            <DeliveryRecord job={job} />
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="w-80 flex-shrink-0">
          {/* Brand Assets */}
          {hasBrandAssets && (
            <div className="bg-white rounded-2xl border shadow-sm p-5 mb-4" style={{ borderColor: '#E5E7EB' }}>
              <p
                className="font-body uppercase pb-3 mb-4"
                style={{ color: '#6B7280', fontSize: '11px', letterSpacing: '0.08em', borderBottom: '1px solid #F5F5F5' }}
              >
                Brand Assets
              </p>

              {customer?.logo_url && (
                <div className="mb-4">
                  <p className="font-body font-medium mb-2" style={{ color: '#6B7280', fontSize: '12px' }}>Logo</p>
                  <LogoImage src={customer.logo_url} alt={customer.business_name} />
                </div>
              )}

              {brandColors.length > 0 && (
                <div>
                  <p className="font-body font-medium mb-2" style={{ color: '#6B7280', fontSize: '12px' }}>
                    Brand Colors
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    {brandColors.map((color, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5">
                        <div
                          className="w-10 h-10 rounded-xl border border-[#E5E7EB]"
                          style={{ background: color }}
                        />
                        <span className="font-body font-mono" style={{ fontSize: '11px', color: '#6B7280' }}>
                          {color}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Job Management */}
          <JobManagement job={job} />

          {/* Customer Info */}
          <div className="bg-white rounded-2xl border shadow-sm p-5 mb-4" style={{ borderColor: '#E5E7EB' }}>
            <p
              className="font-body uppercase pb-3 mb-4"
              style={{ color: '#6B7280', fontSize: '11px', letterSpacing: '0.08em', borderBottom: '1px solid #F5F5F5' }}
            >
              Customer
            </p>

            {!customer ? (
              <p className="font-body" style={{ color: '#9CA3AF', fontSize: '13px' }}>No customer linked</p>
            ) : (
              <>
                <p className="font-body font-semibold mb-1" style={{ color: '#0D0D0D', fontSize: '14px' }}>
                  {customer.business_name}
                </p>
                <p className="font-body mb-3" style={{ color: '#6B7280', fontSize: '13px' }}>
                  {customer.contact_name}
                </p>

                <div className="space-y-2 mb-3">
                  {customer.email && (
                    <a
                      href={`mailto:${customer.email}`}
                      className="flex items-center gap-2 font-body transition-opacity hover:opacity-70"
                      style={{ color: '#8B2FC9', fontSize: '13px' }}
                    >
                      <Mail size={13} style={{ color: '#6B7280' }} />
                      {customer.email}
                    </a>
                  )}
                  {customer.phone && (
                    <a
                      href={`tel:${customer.phone}`}
                      className="flex items-center gap-2 font-body transition-opacity hover:opacity-70"
                      style={{ color: '#8B2FC9', fontSize: '13px' }}
                    >
                      <Phone size={13} style={{ color: '#6B7280' }} />
                      {customer.phone}
                    </a>
                  )}
                  {customer.website && (
                    <a
                      href={customer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 font-body transition-opacity hover:opacity-70"
                      style={{ color: '#8B2FC9', fontSize: '13px' }}
                    >
                      <Globe size={13} style={{ color: '#6B7280' }} />
                      {customer.website}
                    </a>
                  )}
                </div>

                {customer.on_retainer && (
                  <span
                    className="inline-block font-body font-semibold px-2.5 py-1 rounded-full mt-2"
                    style={{ fontSize: '12px', background: 'rgba(139,47,201,0.1)', color: '#8B2FC9' }}
                  >
                    On Retainer · {formatCurrency(customer.retainer_amount)}/mo
                  </span>
                )}

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

          {/* Quick Actions */}
          <QuickActions job={job} customer={customer} project={project} />
        </div>
      </div>
    </div>
  )
}
