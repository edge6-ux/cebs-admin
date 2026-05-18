'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search } from 'lucide-react'
import type { Job } from '@/lib/types'

const statusDot: Record<string, string> = {
  queued:      '#9CA3AF',
  in_progress: '#1D4ED8',
  review:      '#6D28D9',
  delivered:   '#16A34A',
  on_hold:     '#C8922A',
}

const statusLabel: Record<string, string> = {
  queued:      'Queued',
  in_progress: 'In Progress',
  review:      'In Review',
  delivered:   'Delivered',
  on_hold:     'On Hold',
}

export default function JobsPage() {
  const router = useRouter()
  const [jobs, setJobs]               = useState<Job[]>([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter]   = useState('all')

  useEffect(() => {
    fetch('/api/admin/jobs')
      .then((r) => r.json())
      .then((data: Job[]) => setJobs(data))
      .finally(() => setLoading(false))
  }, [])

  const active = jobs.filter(
    (j) => j.status !== 'delivered' && j.status !== 'on_hold'
  ).length

  const filtered = jobs.filter((j) => {
    const q = search.toLowerCase()
    const matchesSearch =
      !search ||
      j.title.toLowerCase().includes(q) ||
      (j.customer?.business_name ?? '').toLowerCase().includes(q)
    const matchesStatus = statusFilter === 'all' || j.status === statusFilter
    const matchesType   = typeFilter === 'all'   || j.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const stats = [
    { key: 'queued',      label: 'Queued' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'review',      label: 'In Review' },
    { key: 'delivered',   label: 'Delivered' },
    { key: 'on_hold',     label: 'On Hold' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <p className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '22px' }}>
            Jobs
          </p>
          <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '14px' }}>
            {active} active · {jobs.length} total
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
              {jobs.filter((j) => j.status === key).length}
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

      {/* PIPELINE + DELIVERED — 15B */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-4 px-5 py-4 animate-pulse" style={{ borderBottom: '1px solid #F5F5F5' }}>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && jobs.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
          <p className="font-body" style={{ color: '#6B7280', fontSize: '15px' }}>No jobs yet</p>
          <p className="font-body mt-1" style={{ color: '#9CA3AF', fontSize: '13px' }}>
            Create your first job to get started.
          </p>
        </div>
      )}

      {!loading && jobs.length > 0 && filtered.length === 0 && (
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

      {!loading && filtered.length > 0 && (
        <div className="font-body text-sm" style={{ color: '#6B7280' }}>
          {/* PIPELINE + DELIVERED — 15B */}
        </div>
      )}
    </div>
  )
}
