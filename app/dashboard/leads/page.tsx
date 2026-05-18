'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, Users } from 'lucide-react'
import type { Lead, LeadStatus } from '@/lib/types'
import { timeAgo, priorityLabel, priorityColor } from '@/lib/utils'

const statusConfig: Record<LeadStatus, { label: string; bg: string; color: string; dot: string }> = {
  new:       { label: 'New',       bg: '#EDE9FE', color: '#6D28D9', dot: '#8B2FC9' },
  reviewed:  { label: 'Reviewed',  bg: '#DBEAFE', color: '#1D4ED8', dot: '#3B82F6' },
  contacted: { label: 'Contacted', bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
  converted: { label: 'Converted', bg: '#D1FAE5', color: '#065F46', dot: '#16A34A' },
  not_a_fit: { label: 'Not a Fit', bg: '#F3F4F6', color: '#6B7280', dot: '#9CA3AF' },
}

const STATUSES: LeadStatus[] = ['new', 'reviewed', 'contacted', 'converted', 'not_a_fit']

const INDUSTRIES = [
  'Trades & Contractors',
  'Restaurants & Hospitality',
  'Home Services',
  'Local Retail',
  'Auto Services',
  'Health & Wellness',
  'Professional Services',
  'Other',
]

function priorityBg(score: number): string {
  if (score >= 80) return 'rgba(226,75,74,0.1)'
  if (score >= 50) return 'rgba(200,146,42,0.1)'
  return 'rgba(107,114,128,0.1)'
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const cfg = statusConfig[status] ?? statusConfig.new
  return (
    <span
      className="font-body font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ fontSize: '11px', background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  )
}

function PriorityBadge({ score }: { score: number }) {
  if (score <= 0) return <span style={{ color: '#9CA3AF', fontSize: '13px' }}>—</span>
  return (
    <span
      className="font-body font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ fontSize: '12px', color: priorityColor(score), background: priorityBg(score) }}
    >
      {priorityLabel(score)}
    </span>
  )
}

function SkeletonRows() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div key={i} className="px-5 py-4 border-b animate-pulse" style={{ borderColor: '#F5F5F5' }}>
          <div className="flex gap-4">
            <div className="h-4 rounded" style={{ width: '160px', background: '#E5E7EB' }} />
            <div className="h-4 rounded" style={{ width: '120px', background: '#E5E7EB' }} />
            <div className="h-4 rounded" style={{ width: '100px', background: '#E5E7EB' }} />
          </div>
        </div>
      ))}
    </>
  )
}

export default function LeadsPage() {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilters, setStatusFilters] = useState<LeadStatus[]>([])
  const [industryFilter, setIndustryFilter] = useState('all')

  useEffect(() => {
    fetch('/api/admin/leads')
      .then((r) => r.json())
      .then((data: Lead[]) => {
        setLeads(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      const q = search.toLowerCase()
      const matchesSearch =
        !search ||
        lead.business_name.toLowerCase().includes(q) ||
        lead.full_name.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q)
      const matchesStatus = statusFilters.length === 0 || statusFilters.includes(lead.status)
      const matchesIndustry = industryFilter === 'all' || lead.industry === industryFilter
      return matchesSearch && matchesStatus && matchesIndustry
    })
  }, [leads, search, statusFilters, industryFilter])

  const hasFilters = search !== '' || statusFilters.length > 0 || industryFilter !== 'all'

  function clearFilters() {
    setSearch('')
    setStatusFilters([])
    setIndustryFilter('all')
  }

  function handlePillClick(s: LeadStatus, ctrlHeld: boolean) {
    if (ctrlHeld) {
      setStatusFilters((prev) =>
        prev.includes(s) ? prev.filter((f) => f !== s) : [...prev, s]
      )
    } else {
      setStatusFilters((prev) =>
        prev.length === 1 && prev[0] === s ? [] : [s]
      )
    }
  }

  const inputStyle: React.CSSProperties = {
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    fontSize: '14px',
    fontFamily: 'var(--font-inter), sans-serif',
    color: '#0D0D0D',
    background: 'white',
    outline: 'none',
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <p className="font-body" style={{ color: '#6B7280', fontSize: '14px' }}>
          {loading ? '—' : `${leads.length} total`}
        </p>
        <button
          onClick={() => router.push('/dashboard/leads/new')}
          className="flex items-center gap-1.5 font-body font-medium text-white rounded-xl px-4 py-2.5 transition-opacity hover:opacity-90"
          style={{ background: '#8B2FC9', fontSize: '14px' }}
        >
          <Plus size={16} />
          New Lead
        </button>
      </div>

      {/* Stats row — click to filter, Ctrl+click to multi-select */}
      <div className="flex items-center gap-3 flex-wrap mb-6">
        {STATUSES.map((s) => {
          const cfg = statusConfig[s]
          const count = leads.filter((l) => l.status === s).length
          const active = statusFilters.includes(s)
          return (
            <button
              key={s}
              type="button"
              onClick={(e) => handlePillClick(s, e.ctrlKey || e.metaKey)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl shadow-sm transition-all"
              style={{
                border: active ? `1.5px solid ${cfg.dot}` : '1px solid #E5E7EB',
                background: active ? cfg.bg : 'white',
                flexShrink: 0,
                cursor: 'pointer',
              }}
            >
              <div className="rounded-full" style={{ width: '8px', height: '8px', background: cfg.dot, flexShrink: 0 }} />
              <span className="font-body" style={{ color: active ? cfg.color : '#6B7280', fontSize: '13px' }}>{cfg.label}</span>
              <span className="font-heading font-bold" style={{ color: active ? cfg.color : '#0D0D0D', fontSize: '15px' }}>{count}</span>
            </button>
          )
        })}

        {statusFilters.length > 1 ? (
          <button
            type="button"
            onClick={() => setStatusFilters([])}
            className="font-body transition-opacity hover:opacity-70"
            style={{ color: '#8B2FC9', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Clear
          </button>
        ) : (
          <span className="font-body" style={{ color: '#C4C4C4', fontSize: '11px' }}>
            Ctrl+click to select multiple
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap mb-5">
        {/* Search */}
        <div className="relative flex-1" style={{ minWidth: '192px' }}>
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: '#9CA3AF' }}
          />
          <input
            type="text"
            placeholder="Search by name, business, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5"
            style={inputStyle}
          />
        </div>

        {/* Industry filter */}
        <select
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value)}
          className="px-3 py-2.5 cursor-pointer"
          style={inputStyle}
        >
          <option value="all">All Industries</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
          <SkeletonRows />
        </div>
      )}

      {/* Empty — no leads at all */}
      {!loading && leads.length === 0 && (
        <div
          className="bg-white rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center text-center"
          style={{ border: '1px solid #E5E7EB' }}
        >
          <Users size={40} style={{ color: '#9CA3AF' }} />
          <p className="font-body mt-3" style={{ color: '#6B7280', fontSize: '15px' }}>
            No leads yet
          </p>
          <p className="font-body mt-1" style={{ color: '#9CA3AF', fontSize: '13px' }}>
            Leads submitted through the website will appear here.
          </p>
        </div>
      )}

      {/* Empty — filters active */}
      {!loading && leads.length > 0 && filtered.length === 0 && (
        <div
          className="bg-white rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center text-center"
          style={{ border: '1px solid #E5E7EB' }}
        >
          <p className="font-body" style={{ color: '#6B7280', fontSize: '15px' }}>
            No leads match your filters
          </p>
          <button
            onClick={clearFilters}
            className="font-body mt-2 transition-opacity hover:opacity-70"
            style={{ color: '#8B2FC9', fontSize: '13px' }}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Desktop table */}
      {!loading && filtered.length > 0 && (
        <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
          {/* Header */}
          <div
            className="grid px-5 py-3"
            style={{
              background: '#F9F9F9',
              borderBottom: '1px solid #E5E7EB',
              gridTemplateColumns: 'minmax(0,1.8fr) minmax(0,1.6fr) minmax(0,1.2fr) minmax(0,1fr) minmax(0,0.8fr) minmax(0,1fr) minmax(0,0.9fr) minmax(0,0.6fr)',
            }}
          >
            {['Business', 'Contact', 'Industry', 'Spend', 'Priority', 'Status', 'Submitted', 'Action'].map((col) => (
              <span
                key={col}
                className="font-body font-semibold uppercase"
                style={{ color: '#6B7280', fontSize: '11px', letterSpacing: '0.05em' }}
              >
                {col}
              </span>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((lead) => (
            <div
              key={lead.id}
              className="grid px-5 py-4 cursor-pointer transition-colors hover:bg-[#FAFAFA]"
              style={{
                borderBottom: '1px solid #F5F5F5',
                gridTemplateColumns: 'minmax(0,1.8fr) minmax(0,1.6fr) minmax(0,1.2fr) minmax(0,1fr) minmax(0,0.8fr) minmax(0,1fr) minmax(0,0.9fr) minmax(0,0.6fr)',
                alignItems: 'center',
              }}
              onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
            >
              {/* Business */}
              <div>
                <p className="font-body font-semibold" style={{ color: '#0D0D0D', fontSize: '14px' }}>
                  {lead.business_name}
                </p>
                {lead.hear_about_us && (
                  <p className="font-body mt-0.5" style={{ color: '#6B7280', fontSize: '12px' }}>
                    via {lead.hear_about_us}
                  </p>
                )}
              </div>

              {/* Contact */}
              <div>
                <p className="font-body" style={{ color: '#4A4A4A', fontSize: '14px' }}>
                  {lead.full_name}
                </p>
                <p
                  className="font-body mt-0.5 truncate"
                  style={{ color: '#6B7280', fontSize: '12px', maxWidth: '160px' }}
                >
                  {lead.email}
                </p>
              </div>

              {/* Industry */}
              <p className="font-body" style={{ color: '#4A4A4A', fontSize: '13px' }}>
                {lead.industry || '—'}
              </p>

              {/* Spend */}
              <p className="font-body" style={{ color: '#4A4A4A', fontSize: '13px' }}>
                {lead.monthly_spend || '—'}
              </p>

              {/* Priority */}
              <div><PriorityBadge score={lead.priority_score} /></div>

              {/* Status */}
              <div><StatusBadge status={lead.status} /></div>

              {/* Submitted */}
              <p className="font-body" style={{ color: '#6B7280', fontSize: '13px' }}>
                {timeAgo(lead.created_at)}
              </p>

              {/* Action */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/dashboard/leads/${lead.id}`)
                }}
                className="font-body rounded-lg px-3 py-1.5 transition-colors hover:bg-gray-50"
                style={{ border: '1px solid #E5E7EB', fontSize: '12px', color: '#4A4A4A' }}
              >
                View
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Mobile cards */}
      {!loading && filtered.length > 0 && (
        <div className="md:hidden space-y-3">
          {filtered.map((lead) => (
            <div
              key={lead.id}
              className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer"
              style={{ border: '1px solid #E5E7EB' }}
              onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
            >
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div className="min-w-0 mr-3">
                  <p className="font-body font-bold" style={{ color: '#0D0D0D', fontSize: '15px' }}>
                    {lead.business_name}
                  </p>
                  <p className="font-body mt-0.5" style={{ color: '#6B7280', fontSize: '13px' }}>
                    {lead.full_name}
                  </p>
                </div>
                <StatusBadge status={lead.status} />
              </div>

              {/* Middle */}
              <div className="flex gap-3 flex-wrap mt-3">
                {lead.industry && (
                  <span className="font-body px-2 py-0.5 rounded-full" style={{ fontSize: '12px', background: '#F3F4F6', color: '#4A4A4A' }}>
                    {lead.industry}
                  </span>
                )}
                {lead.monthly_spend && (
                  <span className="font-body px-2 py-0.5 rounded-full" style={{ fontSize: '12px', background: '#F3F4F6', color: '#4A4A4A' }}>
                    {lead.monthly_spend}
                  </span>
                )}
                {lead.priority_score > 0 && <PriorityBadge score={lead.priority_score} />}
              </div>

              {/* Bottom */}
              <div
                className="flex items-center justify-between mt-3 pt-3"
                style={{ borderTop: '1px solid #F5F5F5' }}
              >
                <span className="font-body" style={{ color: '#6B7280', fontSize: '12px' }}>
                  {timeAgo(lead.created_at)}
                </span>
                <span className="font-body font-medium" style={{ color: '#8B2FC9', fontSize: '12px' }}>
                  View →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
