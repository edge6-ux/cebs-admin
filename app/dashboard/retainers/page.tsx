import Link from 'next/link'
import { RefreshCw, Building2, Plus, ChevronRight } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase-server'
import type { Customer } from '@/lib/types'
import { fmtDate, formatCurrency } from '@/lib/utils'

type RetainerJob = {
  id: string
  title: string
  status: string
  priority: string
  due_date: string | null
  customer_id: string | null
  project_id: string | null
}

type RetainerProject = {
  id: string
  business_name: string
  client_name: string
  monthly_retainer: number
  status: string
}

function getInitials(name: string): string {
  return name.trim().split(' ').filter(Boolean).slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '').join('')
}

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  active:   { bg: '#D1FAE5', color: '#065F46', label: 'Active' },
  inactive: { bg: '#F3F4F6', color: '#6B7280', label: 'Inactive' },
  churned:  { bg: '#FCEBEB', color: '#991B1B', label: 'Churned' },
}

const jobStatusConfig: Record<string, { bg: string; color: string; dot: string; label: string }> = {
  queued:      { bg: '#F3F4F6', color: '#6B7280', dot: '#9CA3AF', label: 'Queued' },
  in_progress: { bg: '#DBEAFE', color: '#1D4ED8', dot: '#1D4ED8', label: 'In Progress' },
  review:      { bg: '#EDE9FE', color: '#6D28D9', dot: '#6D28D9', label: 'In Review' },
  on_hold:     { bg: '#FEF3C7', color: '#C8922A', dot: '#C8922A', label: 'On Hold' },
}

const priorityDot: Record<string, string> = {
  urgent: '#E24B4A',
  high:   '#C8922A',
  medium: '#9CA3AF',
  low:    '#D1D5DB',
}

export default async function RetainersPage() {
  const [customersResult, retainerProjectsResult, jobsResult] = await Promise.all([
    supabaseAdmin
      .from('customers')
      .select('*')
      .eq('on_retainer', true)
      .is('deleted_at', null)
      .order('retainer_amount', { ascending: false }),
    supabaseAdmin
      .from('projects')
      .select('id, business_name, client_name, monthly_retainer, status')
      .is('deleted_at', null)
      .neq('status', 'complete')
      .gt('monthly_retainer', 0)
      .order('monthly_retainer', { ascending: false }),
    supabaseAdmin
      .from('jobs')
      .select('id, title, status, priority, due_date, customer_id, project_id')
      .eq('type', 'retainer')
      .is('deleted_at', null)
      .neq('status', 'delivered')
      .order('created_at', { ascending: false }),
  ])

  const customers = (customersResult.data ?? []) as Customer[]
  const retainerProjects = (retainerProjectsResult.data ?? []) as RetainerProject[]
  const retainerJobs = (jobsResult.data ?? []) as RetainerJob[]

  const jobsByCustomer = retainerJobs.reduce<Record<string, RetainerJob[]>>((acc, job) => {
    if (job.customer_id) {
      acc[job.customer_id] = acc[job.customer_id] ?? []
      acc[job.customer_id].push(job)
    }
    return acc
  }, {})

  const jobsByProject = retainerJobs.reduce<Record<string, RetainerJob[]>>((acc, job) => {
    if (job.project_id) {
      acc[job.project_id] = acc[job.project_id] ?? []
      acc[job.project_id].push(job)
    }
    return acc
  }, {})

  const totalMRR =
    customers.reduce((sum, c) => sum + (c.retainer_amount || 0), 0) +
    retainerProjects.reduce((sum, p) => sum + (p.monthly_retainer || 0), 0)
  const totalActiveTasks = retainerJobs.length
  const totalRetainers = customers.length + retainerProjects.length

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <p className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '22px' }}>
            Retainers
          </p>
          <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '14px' }}>
            {totalRetainers} retainer{totalRetainers !== 1 ? 's' : ''}
            {totalActiveTasks > 0 && ` · ${totalActiveTasks} active task${totalActiveTasks !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* MRR card */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ background: 'linear-gradient(135deg, #8B2FC9 0%, #6D28D9 100%)' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.15)' }}
          >
            <RefreshCw size={18} color="white" />
          </div>
          <p className="font-body font-medium text-white" style={{ fontSize: '14px', opacity: 0.85 }}>
            Total Monthly Recurring
          </p>
        </div>
        <p className="font-heading font-bold text-white" style={{ fontSize: '40px', lineHeight: 1 }}>
          {formatCurrency(totalMRR)}
          <span className="font-body font-normal" style={{ fontSize: '18px', opacity: 0.7 }}>/mo</span>
        </p>
        {totalMRR > 0 && (
          <p className="font-body text-white mt-2" style={{ fontSize: '13px', opacity: 0.7 }}>
            {formatCurrency(totalMRR * 12)}/yr annualized
          </p>
        )}
      </div>

      {/* Empty state */}
      {totalRetainers === 0 && (
        <div
          className="bg-white rounded-2xl p-12 text-center shadow-sm"
          style={{ border: '1px solid #E5E7EB' }}
        >
          <Building2 size={40} style={{ color: '#D1D5DB', margin: '0 auto' }} />
          <p className="font-body mt-3" style={{ color: '#6B7280', fontSize: '15px' }}>
            No retainer clients yet
          </p>
          <p className="font-body mt-1 mx-auto" style={{ color: '#9CA3AF', fontSize: '13px', maxWidth: '280px' }}>
            Clients appear here when their customer profile has a retainer enabled.
          </p>
          <Link
            href="/dashboard/customers"
            className="inline-block mt-4 font-body font-medium transition-opacity hover:opacity-70"
            style={{ color: '#8B2FC9', fontSize: '14px' }}
          >
            Go to Customers →
          </Link>
        </div>
      )}

      {/* All retainer cards */}
      <div className="space-y-4">
        {/* Project-based retainers */}
        {retainerProjects.map((p) => {
          const jobs    = jobsByProject[p.id] ?? []
          const hasJobs = jobs.length > 0

          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
              style={{ border: '1px solid #E5E7EB' }}
            >
              {/* Project header */}
              <div className="flex items-center justify-between flex-wrap gap-3 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-full"
                    style={{ width: '40px', height: '40px', background: '#0D0D0D' }}
                  >
                    <span className="font-heading font-bold text-white" style={{ fontSize: '14px' }}>
                      {getInitials(p.business_name)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '16px' }}>
                        {p.business_name}
                      </p>
                      <span
                        className="inline-block font-body font-semibold px-2 py-0.5 rounded-full"
                        style={{ fontSize: '11px', background: '#DBEAFE', color: '#1D4ED8' }}
                      >
                        Project
                      </span>
                    </div>
                    {p.client_name && p.client_name !== p.business_name && (
                      <p className="font-body mt-0.5" style={{ color: '#6B7280', fontSize: '13px' }}>
                        {p.client_name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <RefreshCw size={13} style={{ color: '#8B2FC9' }} />
                  <span className="font-heading font-bold" style={{ color: '#8B2FC9', fontSize: '18px' }}>
                    {formatCurrency(p.monthly_retainer)}
                    <span className="font-body font-normal" style={{ fontSize: '13px', opacity: 0.7 }}>/mo</span>
                  </span>
                </div>
              </div>

              {/* Tasks section */}
              <div style={{ borderTop: '1px solid #F5F5F5' }}>
                <div
                  className="flex items-center justify-between px-6 py-3"
                  style={{ background: '#FAFAFA' }}
                >
                  <p
                    className="font-body uppercase"
                    style={{ color: '#9CA3AF', fontSize: '11px', letterSpacing: '0.08em' }}
                  >
                    Active Tasks {hasJobs && `(${jobs.length})`}
                  </p>
                  <Link
                    href={`/dashboard/jobs/new?projectId=${p.id}&type=retainer`}
                    className="flex items-center gap-1 font-body font-medium transition-opacity hover:opacity-70"
                    style={{ color: '#8B2FC9', fontSize: '13px' }}
                  >
                    <Plus size={13} />
                    New Task
                  </Link>
                </div>

                {!hasJobs && (
                  <div className="px-6 py-5 text-center">
                    <p className="font-body" style={{ color: '#9CA3AF', fontSize: '13px' }}>
                      No active tasks — all clear.
                    </p>
                  </div>
                )}

                {hasJobs && (
                  <div>
                    {jobs.map((job) => {
                      const jStatus = jobStatusConfig[job.status] ?? jobStatusConfig.queued
                      const dot     = priorityDot[job.priority] ?? '#9CA3AF'
                      const now     = new Date()
                      const due     = job.due_date ? new Date(job.due_date) : null
                      const overdue = due ? due < now : false

                      return (
                        <Link
                          key={job.id}
                          href={`/dashboard/jobs/${job.id}`}
                          className="flex items-center gap-3 px-6 py-3.5 transition-colors hover:bg-[#FAFAFA]"
                          style={{ borderTop: '1px solid #F5F5F5' }}
                        >
                          <div className="flex-shrink-0 rounded-full" style={{ width: '7px', height: '7px', background: dot }} />
                          <p className="font-body flex-1 truncate" style={{ color: '#0D0D0D', fontSize: '14px' }}>{job.title}</p>
                          <span className="flex-shrink-0 font-body font-semibold px-2 py-0.5 rounded-full" style={{ fontSize: '11px', background: jStatus.bg, color: jStatus.color }}>
                            {jStatus.label}
                          </span>
                          {due && (
                            <p className="font-body flex-shrink-0" style={{ fontSize: '12px', color: overdue ? '#E24B4A' : '#9CA3AF', minWidth: '70px', textAlign: 'right' }}>
                              {overdue ? 'Overdue · ' : ''}{fmtDate(job.due_date!)}
                            </p>
                          )}
                          <ChevronRight size={14} style={{ color: '#D1D5DB', flexShrink: 0 }} />
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Card footer */}
              <div
                className="flex items-center justify-end px-6 py-3"
                style={{ borderTop: '1px solid #F5F5F5', background: '#FAFAFA' }}
              >
                <Link
                  href={`/dashboard/projects/${p.id}`}
                  className="font-body font-medium transition-opacity hover:opacity-70"
                  style={{ color: '#6B7280', fontSize: '13px' }}
                >
                  View Project →
                </Link>
              </div>
            </div>
          )
        })}

        {/* Customer-based retainers */}
        {customers.map((c) => {
          const badge   = statusConfig[c.status] ?? statusConfig.inactive
          const jobs    = jobsByCustomer[c.id] ?? []
          const hasJobs = jobs.length > 0

          return (
            <div
              key={c.id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
              style={{ border: '1px solid #E5E7EB' }}
            >
              {/* Client header */}
              <div className="flex items-center justify-between flex-wrap gap-3 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-full"
                    style={{ width: '40px', height: '40px', background: '#0D0D0D' }}
                  >
                    <span className="font-heading font-bold text-white" style={{ fontSize: '14px' }}>
                      {getInitials(c.business_name)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '16px' }}>
                        {c.business_name}
                      </p>
                      <span
                        className="inline-block font-body font-semibold px-2 py-0.5 rounded-full capitalize"
                        style={{ fontSize: '11px', background: badge.bg, color: badge.color }}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <p className="font-body mt-0.5" style={{ color: '#6B7280', fontSize: '13px' }}>
                      {c.contact_name}
                      {c.email && <span style={{ color: '#9CA3AF' }}> · {c.email}</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <RefreshCw size={13} style={{ color: '#8B2FC9' }} />
                  <span className="font-heading font-bold" style={{ color: '#8B2FC9', fontSize: '18px' }}>
                    {formatCurrency(c.retainer_amount)}
                    <span className="font-body font-normal" style={{ fontSize: '13px', opacity: 0.7 }}>/mo</span>
                  </span>
                </div>
              </div>

              {/* Tasks section */}
              <div style={{ borderTop: '1px solid #F5F5F5' }}>
                {/* Tasks header */}
                <div
                  className="flex items-center justify-between px-6 py-3"
                  style={{ background: '#FAFAFA' }}
                >
                  <p
                    className="font-body uppercase"
                    style={{ color: '#9CA3AF', fontSize: '11px', letterSpacing: '0.08em' }}
                  >
                    Active Tasks {hasJobs && `(${jobs.length})`}
                  </p>
                  <Link
                    href={`/dashboard/jobs/new?customerId=${c.id}&type=retainer`}
                    className="flex items-center gap-1 font-body font-medium transition-opacity hover:opacity-70"
                    style={{ color: '#8B2FC9', fontSize: '13px' }}
                  >
                    <Plus size={13} />
                    New Task
                  </Link>
                </div>

                {/* No tasks */}
                {!hasJobs && (
                  <div className="px-6 py-5 text-center">
                    <p className="font-body" style={{ color: '#9CA3AF', fontSize: '13px' }}>
                      No active tasks — all clear.
                    </p>
                  </div>
                )}

                {/* Task rows */}
                {hasJobs && (
                  <div>
                    {jobs.map((job, i) => {
                      const jStatus = jobStatusConfig[job.status] ?? jobStatusConfig.queued
                      const dot     = priorityDot[job.priority] ?? '#9CA3AF'
                      const now     = new Date()
                      const due     = job.due_date ? new Date(job.due_date) : null
                      const overdue = due ? due < now : false

                      return (
                        <Link
                          key={job.id}
                          href={`/dashboard/jobs/${job.id}`}
                          className="flex items-center gap-3 px-6 py-3.5 transition-colors hover:bg-[#FAFAFA]"
                          style={{ borderTop: '1px solid #F5F5F5' }}
                        >
                          {/* Priority dot */}
                          <div
                            className="flex-shrink-0 rounded-full"
                            style={{ width: '7px', height: '7px', background: dot }}
                          />

                          {/* Title */}
                          <p className="font-body flex-1 truncate" style={{ color: '#0D0D0D', fontSize: '14px' }}>
                            {job.title}
                          </p>

                          {/* Status pill */}
                          <span
                            className="flex-shrink-0 font-body font-semibold px-2 py-0.5 rounded-full"
                            style={{ fontSize: '11px', background: jStatus.bg, color: jStatus.color }}
                          >
                            {jStatus.label}
                          </span>

                          {/* Due date */}
                          {due && (
                            <p
                              className="font-body flex-shrink-0"
                              style={{ fontSize: '12px', color: overdue ? '#E24B4A' : '#9CA3AF', minWidth: '70px', textAlign: 'right' }}
                            >
                              {overdue ? 'Overdue · ' : ''}{fmtDate(job.due_date!)}
                            </p>
                          )}

                          <ChevronRight size={14} style={{ color: '#D1D5DB', flexShrink: 0 }} />
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Card footer */}
              <div
                className="flex items-center justify-between px-6 py-3"
                style={{ borderTop: '1px solid #F5F5F5', background: '#FAFAFA' }}
              >
                <p className="font-body" style={{ color: '#9CA3AF', fontSize: '12px' }}>
                  Client since {fmtDate(c.created_at)}
                </p>
                <Link
                  href={`/dashboard/customers/${c.id}`}
                  className="font-body font-medium transition-opacity hover:opacity-70"
                  style={{ color: '#6B7280', fontSize: '13px' }}
                >
                  View Customer →
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
