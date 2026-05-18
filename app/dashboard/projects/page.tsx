'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Briefcase, Hammer, Activity, CheckCircle,
  TrendingUp, DollarSign, Calendar, Clock, RefreshCw,
} from 'lucide-react'
import type { Project } from '@/lib/types'
import { fmtDate, timeAgo, formatCurrency } from '@/lib/utils'
import DeleteButton from '@/components/ui/DeleteButton'

type ProjectStatus = Project['status']

const STATUS_CONFIG: Record<ProjectStatus, { label: string; bg: string; color: string; accent: string }> = {
  kickoff:     { label: 'Kickoff',     bg: '#FEF3C7', color: '#92400E', accent: '#C8922A' },
  in_progress: { label: 'In Progress', bg: '#DBEAFE', color: '#1D4ED8', accent: '#1D4ED8' },
  review:      { label: 'Review',      bg: '#EDE9FE', color: '#6D28D9', accent: '#8B2FC9' },
  complete:    { label: 'Complete',    bg: '#D1FAE5', color: '#065F46', accent: '#16A34A' },
  on_hold:     { label: 'On Hold',     bg: '#F3F4F6', color: '#6B7280', accent: '#6B7280' },
}

const TIER_CONFIG: Record<string, { bg: string; color: string }> = {
  audit:    { bg: '#EDE9FE', color: '#6D28D9' },
  optimize: { bg: '#DBEAFE', color: '#1D4ED8' },
  build:    { bg: 'rgba(139,47,201,0.1)', color: '#8B2FC9' },
}

const FILTER_OPTIONS = [
  { value: 'all',         label: 'All' },
  { value: 'kickoff',     label: 'Kickoff' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review',      label: 'Review' },
  { value: 'complete',    label: 'Complete' },
  { value: 'on_hold',     label: 'On Hold' },
]

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm animate-pulse overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
      <div className="flex">
        <div style={{ width: '4px', background: '#E5E7EB', flexShrink: 0 }} />
        <div className="flex-1 px-6 py-5 space-y-3">
          <div className="h-5 rounded" style={{ width: '200px', background: '#E5E7EB' }} />
          <div className="h-3 rounded" style={{ width: '140px', background: '#E5E7EB' }} />
          <div className="h-3 rounded" style={{ width: '100%', background: '#E5E7EB' }} />
        </div>
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetch('/api/admin/projects')
      .then((r) => r.json())
      .then((data: Project[]) => {
        setProjects(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return projects
    return projects.filter((p) => p.status === statusFilter)
  }, [projects, statusFilter])

  const activeCount = projects.filter((p) => p.status !== 'complete' && p.status !== 'on_hold').length
  const inProgressCount = projects.filter((p) => p.status === 'in_progress').length
  const completeCount = projects.filter((p) => p.status === 'complete').length
  const totalRevenue = projects.reduce((sum, p) => sum + (p.contract_value || 0), 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  function isOverdue(project: Project) {
    if (!project.target_date || project.status === 'complete') return false
    return new Date(project.target_date) < today
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <p className="font-body" style={{ color: '#6B7280', fontSize: '14px' }}>
          {loading ? '—' : `${activeCount} active · ${projects.length} total`}
        </p>
        <button
          onClick={() => router.push('/dashboard/projects/new')}
          className="flex items-center gap-1.5 font-body font-medium text-white rounded-xl px-4 py-2.5 transition-opacity hover:opacity-90"
          style={{ background: '#8B2FC9', fontSize: '14px' }}
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
          <div className="flex items-center justify-center rounded-xl" style={{ width: '40px', height: '40px', background: 'rgba(139,47,201,0.08)' }}>
            <Hammer size={18} style={{ color: '#8B2FC9' }} />
          </div>
          <p className="font-heading font-bold mt-3" style={{ color: '#0D0D0D', fontSize: '28px' }}>{loading ? '—' : activeCount}</p>
          <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '13px' }}>Active</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
          <div className="flex items-center justify-center rounded-xl" style={{ width: '40px', height: '40px', background: 'rgba(29,78,216,0.08)' }}>
            <Activity size={18} style={{ color: '#1D4ED8' }} />
          </div>
          <p className="font-heading font-bold mt-3" style={{ color: '#0D0D0D', fontSize: '28px' }}>{loading ? '—' : inProgressCount}</p>
          <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '13px' }}>In Progress</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
          <div className="flex items-center justify-center rounded-xl" style={{ width: '40px', height: '40px', background: 'rgba(22,163,74,0.08)' }}>
            <CheckCircle size={18} style={{ color: '#16A34A' }} />
          </div>
          <p className="font-heading font-bold mt-3" style={{ color: '#0D0D0D', fontSize: '28px' }}>{loading ? '—' : completeCount}</p>
          <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '13px' }}>Complete</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
          <div className="flex items-center justify-center rounded-xl" style={{ width: '40px', height: '40px', background: 'rgba(139,47,201,0.08)' }}>
            <TrendingUp size={18} style={{ color: '#8B2FC9' }} />
          </div>
          <p className="font-heading font-bold mt-3" style={{ color: '#0D0D0D', fontSize: '28px' }}>{loading ? '—' : formatCurrency(totalRevenue)}</p>
          <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '13px' }}>Total Revenue</p>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap mb-5">
        {FILTER_OPTIONS.map((opt) => {
          const active = statusFilter === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatusFilter(opt.value)}
              className="font-body font-medium px-4 py-2 rounded-full transition-colors"
              style={{
                fontSize: '13px',
                cursor: 'pointer',
                background: active ? '#0D0D0D' : 'white',
                color: active ? 'white' : '#6B7280',
                border: active ? '1px solid #0D0D0D' : '1px solid #E5E7EB',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Empty — no projects */}
      {!loading && projects.length === 0 && (
        <div
          className="bg-white rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center text-center"
          style={{ border: '1px solid #E5E7EB' }}
        >
          <Briefcase size={40} style={{ color: '#9CA3AF' }} />
          <p className="font-body mt-3" style={{ color: '#6B7280', fontSize: '15px' }}>No projects yet</p>
          <p className="font-body mt-1" style={{ color: '#9CA3AF', fontSize: '13px' }}>Won deals will appear here.</p>
        </div>
      )}

      {/* Empty — filter active */}
      {!loading && projects.length > 0 && filtered.length === 0 && (
        <div
          className="bg-white rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center text-center"
          style={{ border: '1px solid #E5E7EB' }}
        >
          <p className="font-body" style={{ color: '#6B7280', fontSize: '15px' }}>No projects match this filter</p>
          <button
            onClick={() => setStatusFilter('all')}
            className="font-body mt-2 transition-opacity hover:opacity-70"
            style={{ color: '#8B2FC9', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Project cards */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((project) => {
            const statusCfg = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.kickoff
            const tierCfg = TIER_CONFIG[project.tier] ?? TIER_CONFIG.audit
            const overdue = isOverdue(project)
            const checklist = project.checklist ?? []
            const doneCount = checklist.filter((c) => c.completed).length
            const totalCount = checklist.length
            const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

            return (
              <div
                key={project.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden relative"
                style={{ border: '1px solid #E5E7EB' }}
              >
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0"
                  style={{ width: '4px', background: statusCfg.accent }}
                />

                <div className="pl-6 pr-5 py-5">
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-3 gap-4">
                    <div className="min-w-0">
                      <p className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '18px' }}>
                        {project.business_name}
                      </p>
                      <p className="font-body mt-0.5" style={{ color: '#6B7280', fontSize: '13px' }}>
                        {project.client_name}
                      </p>
                    </div>

                    <div className="flex gap-2 items-start flex-wrap flex-shrink-0">
                      {project.tier && (
                        <span
                          className="font-body font-semibold px-2 py-0.5 rounded-full capitalize"
                          style={{ fontSize: '11px', background: tierCfg.bg, color: tierCfg.color }}
                        >
                          {project.tier}
                        </span>
                      )}
                      <span
                        className="font-body font-semibold px-2 py-0.5 rounded-full"
                        style={{ fontSize: '11px', background: statusCfg.bg, color: statusCfg.color }}
                      >
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Details row */}
                  <div className="flex gap-6 flex-wrap mb-3">
                    <div className="flex items-center gap-1.5">
                      <DollarSign size={14} style={{ color: '#6B7280', flexShrink: 0 }} />
                      <span className="font-body" style={{ color: '#4A4A4A', fontSize: '13px' }}>
                        {project.contract_value > 0 ? formatCurrency(project.contract_value) : '—'}
                      </span>
                    </div>

                    {project.start_date && (
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} style={{ color: '#6B7280', flexShrink: 0 }} />
                        <span className="font-body" style={{ color: '#4A4A4A', fontSize: '13px' }}>
                          Started {fmtDate(project.start_date)}
                        </span>
                      </div>
                    )}

                    {project.target_date && (
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} style={{ color: overdue ? '#E24B4A' : '#6B7280', flexShrink: 0 }} />
                        <span className="font-body" style={{ color: overdue ? '#E24B4A' : '#4A4A4A', fontSize: '13px' }}>
                          Due {fmtDate(project.target_date)}
                        </span>
                      </div>
                    )}

                    {project.monthly_retainer > 0 && (
                      <div className="flex items-center gap-1.5">
                        <RefreshCw size={14} style={{ color: '#6B7280', flexShrink: 0 }} />
                        <span className="font-body" style={{ color: '#4A4A4A', fontSize: '13px' }}>
                          {formatCurrency(project.monthly_retainer)}/mo
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  {totalCount > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-body" style={{ color: '#6B7280', fontSize: '12px' }}>Progress</span>
                        <span className="font-body" style={{ color: '#6B7280', fontSize: '12px' }}>{doneCount}/{totalCount} tasks</span>
                      </div>
                      <div className="w-full rounded-full" style={{ background: '#F3F4F6', height: '6px' }}>
                        <div
                          className="rounded-full h-full"
                          style={{ background: '#8B2FC9', width: `${progress}%`, transition: 'width 300ms' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Bottom row */}
                  <div className="flex items-center justify-between">
                    <span className="font-body" style={{ color: '#6B7280', fontSize: '12px' }}>
                      Created {timeAgo(project.created_at)}
                    </span>
                    <div className="flex items-center gap-1">
                      <DeleteButton
                        onConfirm={async () => {
                          const res = await fetch(`/api/admin/projects/${project.id}`, { method: 'DELETE' })
                          if (res.ok) setProjects((prev) => prev.filter((p) => p.id !== project.id))
                        }}
                      />
                      <button
                        onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                        className="font-body rounded-lg px-3 py-1.5 transition-colors"
                        style={{ border: '1px solid #E5E7EB', fontSize: '12px', color: '#4A4A4A', background: 'white', cursor: 'pointer' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#8B2FC9'
                          e.currentTarget.style.color = '#8B2FC9'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#E5E7EB'
                          e.currentTarget.style.color = '#4A4A4A'
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
