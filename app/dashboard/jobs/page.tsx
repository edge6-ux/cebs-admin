'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Search, Hammer, Clock, CheckCircle, RefreshCw } from 'lucide-react'
import type { Job } from '@/lib/types'
import { fmtDate } from '@/lib/utils'
import DeleteButton from '@/components/ui/DeleteButton'

const statusDot: Record<string, string> = {
  queued:      '#9CA3AF',
  in_progress: '#1D4ED8',
  review:      '#6D28D9',
  delivered:   '#16A34A',
  on_hold:     '#C8922A',
}

const columns = [
  { status: 'queued',      label: 'Queued',      color: '#6B7280', bg: '#F3F4F6' },
  { status: 'in_progress', label: 'In Progress', color: '#1D4ED8', bg: '#DBEAFE' },
  { status: 'review',      label: 'In Review',   color: '#6D28D9', bg: '#EDE9FE' },
  { status: 'on_hold',     label: 'On Hold',     color: '#C8922A', bg: '#FEF3C7' },
]

const typeBadge: Record<string, { bg: string; color: string; label: string }> = {
  website:       { bg: '#DBEAFE',              color: '#1D4ED8', label: 'Website' },
  optimization:  { bg: '#D1FAE5',              color: '#065F46', label: 'Optimization' },
  custom_build:  { bg: '#EDE9FE',              color: '#6D28D9', label: 'Custom Build' },
  retainer:      { bg: 'rgba(139,47,201,0.1)', color: '#8B2FC9', label: 'Retainer' },
  other:         { bg: '#F3F4F6',              color: '#6B7280', label: 'Other' },
}

const stats = [
  { key: 'queued',      label: 'Queued' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'review',      label: 'In Review' },
  { key: 'delivered',   label: 'Delivered' },
  { key: 'on_hold',     label: 'On Hold' },
]

export default function JobsPage() {
  const router = useRouter()
  const [jobs, setJobs]                 = useState<Job[]>([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter]     = useState('all')

  useEffect(() => {
    fetch('/api/admin/jobs')
      .then((r) => r.json())
      .then((data: Job[]) => setJobs(data))
      .finally(() => setLoading(false))
  }, [])

  // Retainer jobs are managed on the Retainers page, not the pipeline
  const pipelineJobs   = jobs.filter((j) => j.type !== 'retainer')
  const retainerCount  = jobs.filter((j) => j.type === 'retainer' && j.status !== 'delivered').length

  const active = pipelineJobs.filter(
    (j) => j.status !== 'delivered' && j.status !== 'on_hold'
  ).length

  const filtered = pipelineJobs.filter((j) => {
    const q = search.toLowerCase()
    const matchesSearch =
      !search ||
      j.title.toLowerCase().includes(q) ||
      j.customer?.business_name?.toLowerCase().includes(q)
    const matchesStatus = statusFilter === 'all' || j.status === statusFilter
    const matchesType   = typeFilter === 'all'   || j.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const activeJobs    = filtered.filter((j) => j.status !== 'delivered')
  const deliveredJobs = filtered.filter((j) => j.status === 'delivered')

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <p className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '22px' }}>
            Jobs
          </p>
          <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '14px' }}>
            {active} active · {pipelineJobs.length} total
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/jobs/new')}
          className="flex items-center gap-2 font-body font-medium text-white rounded-xl px-4 py-2.5 transition-opacity hover:opacity-90"
          style={{ background: '#8B2FC9', fontSize: '14px' }}
        >
          <Plus size={15} />
          New Job
        </button>
      </div>

      {/* Retainer notice */}
      {retainerCount > 0 && (
        <Link
          href="/dashboard/retainers"
          className="flex items-center justify-between rounded-xl px-4 py-3 mb-4 transition-opacity hover:opacity-80"
          style={{ background: 'rgba(139,47,201,0.06)', border: '1px solid rgba(139,47,201,0.2)' }}
        >
          <div className="flex items-center gap-2">
            <RefreshCw size={14} style={{ color: '#8B2FC9' }} />
            <span className="font-body font-medium" style={{ color: '#8B2FC9', fontSize: '13px' }}>
              {retainerCount} active retainer task{retainerCount !== 1 ? 's' : ''} — managed on the Retainers page
            </span>
          </div>
          <span className="font-body" style={{ color: '#8B2FC9', fontSize: '13px' }}>View →</span>
        </Link>
      )}

      {/* Stats row */}
      <div className="flex gap-3 flex-wrap mb-6">
        {stats.map(({ key, label }) => (
          <div
            key={key}
            className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5"
            style={{ border: '1px solid #E5E7EB' }}
          >
            <div
              className="rounded-full flex-shrink-0"
              style={{ width: '8px', height: '8px', background: statusDot[key] }}
            />
            <span className="font-body" style={{ color: '#6B7280', fontSize: '13px' }}>{label}</span>
            <span className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '15px' }}>
              {pipelineJobs.filter((j) => j.status === key).length}
            </span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap mb-6">
        <div
          className="flex items-center gap-2 flex-1 min-w-48 bg-white rounded-xl px-4 py-2.5"
          style={{ border: '1px solid #E5E7EB' }}
        >
          <Search size={15} style={{ color: '#9CA3AF', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by title or business..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 font-body bg-transparent outline-none"
            style={{ color: '#0D0D0D', fontSize: '14px' }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="font-body bg-white rounded-xl px-3 py-2.5 outline-none cursor-pointer"
          style={{ border: '1px solid #E5E7EB', color: '#0D0D0D', fontSize: '14px' }}
        >
          <option value="all">All Statuses</option>
          <option value="queued">Queued</option>
          <option value="in_progress">In Progress</option>
          <option value="review">In Review</option>
          <option value="delivered">Delivered</option>
          <option value="on_hold">On Hold</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="font-body bg-white rounded-xl px-3 py-2.5 outline-none cursor-pointer"
          style={{ border: '1px solid #E5E7EB', color: '#0D0D0D', fontSize: '14px' }}
        >
          <option value="all">All Types</option>
          <option value="website">Website</option>
          <option value="optimization">Optimization</option>
          <option value="custom_build">Custom Build</option>
          <option value="retainer">Retainer</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Loading skeleton — 4 pipeline columns */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-6 w-24 rounded animate-pulse mb-3" style={{ background: '#F3F4F6' }} />
              <div className="h-32 rounded-2xl animate-pulse mb-3" style={{ background: '#F3F4F6' }} />
              <div className="h-32 rounded-2xl animate-pulse" style={{ background: '#F3F4F6' }} />
            </div>
          ))}
        </div>
      )}

      {/* No jobs at all */}
      {!loading && pipelineJobs.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm mb-6" style={{ border: '1px solid #E5E7EB' }}>
          <Hammer size={40} style={{ color: '#9CA3AF', margin: '0 auto' }} />
          <p className="font-body mt-3" style={{ color: '#6B7280', fontSize: '15px' }}>No active jobs</p>
          <p className="font-body mt-1 mx-auto" style={{ color: '#9CA3AF', fontSize: '13px', maxWidth: '280px' }}>
            Jobs are created automatically when a proposal is accepted.
          </p>
        </div>
      )}

      {/* Filter empty state */}
      {!loading && pipelineJobs.length > 0 && filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
          <p className="font-body" style={{ color: '#6B7280', fontSize: '15px' }}>
            No jobs match your search or filters
          </p>
          <button
            onClick={() => { setSearch(''); setStatusFilter('all'); setTypeFilter('all') }}
            className="font-body mt-3 transition-opacity hover:opacity-70"
            style={{ color: '#8B2FC9', fontSize: '13px' }}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Pipeline */}
      {!loading && filtered.length > 0 && (
        <>
          {activeJobs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm mb-8" style={{ border: '1px solid #E5E7EB' }}>
              <Hammer size={40} style={{ color: '#9CA3AF', margin: '0 auto' }} />
              <p className="font-body mt-3" style={{ color: '#6B7280', fontSize: '15px' }}>No active jobs</p>
              <p className="font-body mt-1 mx-auto" style={{ color: '#9CA3AF', fontSize: '13px', maxWidth: '280px' }}>
                Jobs are created automatically when a proposal is accepted.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {columns.map((col) => {
                const colJobs = activeJobs.filter((j) => j.status === col.status)
                return (
                  <div key={col.status}>
                    {/* Column header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="rounded-full flex-shrink-0"
                          style={{ width: '8px', height: '8px', background: col.color }}
                        />
                        <p
                          className="font-body font-semibold uppercase"
                          style={{ color: '#0D0D0D', fontSize: '12px', letterSpacing: '0.06em' }}
                        >
                          {col.label}
                        </p>
                      </div>
                      <span
                        className="font-body px-2 py-0.5 rounded-full"
                        style={{ fontSize: '12px', color: '#6B7280', background: '#F3F4F6' }}
                      >
                        {colJobs.length}
                      </span>
                    </div>

                    {/* Cards */}
                    <div className="space-y-3">
                      {colJobs.length === 0 ? (
                        <div
                          className="rounded-2xl p-4 text-center"
                          style={{ border: '1.5px dashed #E5E7EB' }}
                        >
                          <p className="font-body" style={{ color: '#D1D5DB', fontSize: '12px' }}>
                            No {col.label.toLowerCase()} jobs
                          </p>
                        </div>
                      ) : (
                        colJobs.map((job) => {
                          const badge = typeBadge[job.type] ?? typeBadge.other
                          const now = new Date()
                          const due = job.due_date ? new Date(job.due_date) : null
                          const isOverdue  = due ? due < now && job.status !== 'delivered' : false
                          const isDueSoon  = due ? !isOverdue && due < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : false
                          const clockColor = isOverdue ? '#E24B4A' : isDueSoon ? '#C8922A' : '#9CA3AF'

                          return (
                            <div
                              key={job.id}
                              onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
                              className="relative bg-white rounded-2xl p-4 shadow-sm cursor-pointer transition-all duration-150 hover:shadow-md"
                              style={{ border: '1px solid #E5E7EB' }}
                              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(139,47,201,0.3)' }}
                              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB' }}
                            >
                              {/* Priority dot */}
                              {job.priority === 'urgent' && (
                                <div
                                  className="absolute rounded-full animate-pulse"
                                  style={{ width: '8px', height: '8px', background: '#E24B4A', top: '12px', right: '12px' }}
                                />
                              )}
                              {job.priority === 'high' && (
                                <div
                                  className="absolute rounded-full"
                                  style={{ width: '8px', height: '8px', background: '#C8922A', top: '12px', right: '12px' }}
                                />
                              )}

                              {/* Title */}
                              <p
                                className="font-body font-semibold mb-1 pr-4 line-clamp-2"
                                style={{ color: '#0D0D0D', fontSize: '14px' }}
                              >
                                {job.title}
                              </p>

                              {/* Business */}
                              <p className="font-body mb-3" style={{ color: '#6B7280', fontSize: '12px' }}>
                                {job.customer?.business_name ?? 'No customer'}
                              </p>

                              {/* Type badge — only show if type is set and not generic */}
                              {job.type && (
                                <div className="mb-3">
                                  <span
                                    className="inline-flex font-body font-semibold px-2 py-0.5 rounded-full"
                                    style={{ fontSize: '11px', background: badge.bg, color: badge.color }}
                                  >
                                    {badge.label}
                                  </span>
                                </div>
                              )}

                              {/* Bottom row */}
                              <div className="flex items-center justify-between">
                                {due ? (
                                  <div className="flex items-center gap-1">
                                    <Clock size={10} style={{ color: clockColor }} />
                                    <span className="font-body" style={{ fontSize: '11px', color: clockColor }}>
                                      {fmtDate(job.due_date!)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="font-body" style={{ fontSize: '11px', color: '#D1D5DB' }}>
                                    No due date
                                  </span>
                                )}

                                <div className="flex items-center gap-1">
                                  <DeleteButton
                                    onConfirm={async () => {
                                      const res = await fetch(`/api/admin/jobs/${job.id}`, { method: 'DELETE' })
                                      if (res.ok) setJobs((prev) => prev.filter((j) => j.id !== job.id))
                                    }}
                                  />
                                  {job.assigned_to && (
                                    <div
                                      className="flex items-center justify-center rounded-full flex-shrink-0"
                                      style={{ width: '20px', height: '20px', background: '#0D0D0D' }}
                                    >
                                      <span style={{ color: 'white', fontSize: '9px', fontWeight: 700 }}>
                                        {job.assigned_to[0]?.toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Delivered section */}
          {deliveredJobs.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} style={{ color: '#16A34A' }} />
                  <p className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '17px' }}>
                    Delivered
                  </p>
                </div>
                <span className="font-body" style={{ color: '#6B7280', fontSize: '13px' }}>
                  {deliveredJobs.length} job{deliveredJobs.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {deliveredJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
                    className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer transition-opacity"
                    style={{ border: '1px solid #E5E7EB', opacity: 0.8 }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.8' }}
                  >
                    <div className="flex gap-3 items-start">
                      <CheckCircle size={18} style={{ color: '#16A34A', flexShrink: 0, marginTop: '2px' }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-body font-semibold truncate" style={{ color: '#0D0D0D', fontSize: '14px' }}>
                            {job.title}
                          </p>
                          {job.live_url && (
                            <a
                              href={job.live_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="font-body font-medium flex-shrink-0 transition-opacity hover:opacity-70"
                              style={{ color: '#8B2FC9', fontSize: '12px' }}
                            >
                              Live →
                            </a>
                          )}
                        </div>
                        <p className="font-body mt-0.5" style={{ color: '#6B7280', fontSize: '12px' }}>
                          {job.customer?.business_name ?? 'No customer'}
                        </p>
                        {job.completed_at && (
                          <p className="font-body mt-1" style={{ color: '#9CA3AF', fontSize: '11px' }}>
                            Delivered {fmtDate(job.completed_at)}
                          </p>
                        )}
                      </div>
                      <DeleteButton
                        onConfirm={async () => {
                          const res = await fetch(`/api/admin/jobs/${job.id}`, { method: 'DELETE' })
                          if (res.ok) setJobs((prev) => prev.filter((j) => j.id !== job.id))
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
