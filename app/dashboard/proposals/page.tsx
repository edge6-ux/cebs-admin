'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FileText } from 'lucide-react'
import { fmtDate, formatCurrency } from '@/lib/utils'

type LineItem = {
  id: string
  name: string
  price: number
  is_retainer: boolean
}

type Lead = {
  id: string
  full_name: string
  business_name: string
  email: string
  industry: string
}

type Proposal = {
  id: string
  created_at: string
  lead_id: string
  tier: string
  scope: string
  investment_low: number
  investment_high: number
  monthly_retainer: number
  status: 'draft' | 'sent' | 'accepted' | 'declined'
  sent_at: string | null
  lead: Lead | null
  line_items: LineItem[]
}

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  draft:    { label: 'Draft',    bg: '#F3F4F6', color: '#6B7280' },
  sent:     { label: 'Sent',     bg: '#DBEAFE', color: '#1D4ED8' },
  accepted: { label: 'Accepted', bg: '#D1FAE5', color: '#065F46' },
  declined: { label: 'Declined', bg: '#FCEBEB', color: '#991B1B' },
}

const tierConfig: Record<string, { bg: string; color: string }> = {
  audit:    { bg: '#EDE9FE', color: '#6D28D9' },
  optimize: { bg: '#DBEAFE', color: '#1D4ED8' },
  build:    { bg: 'rgba(139,47,201,0.1)', color: '#8B2FC9' },
}

const statDots: Record<string, string> = {
  draft:    '#9CA3AF',
  sent:     '#1D4ED8',
  accepted: '#16A34A',
  declined: '#E24B4A',
}

export default function ProposalsPage() {
  const router = useRouter()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetch('/api/admin/proposals')
      .then((r) => r.json())
      .then((data) => setProposals(data as Proposal[]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() =>
    proposals.filter((p) => {
      const matchesSearch =
        !search ||
        p.lead?.business_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.lead?.full_name?.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter
      return matchesSearch && matchesStatus
    }),
    [proposals, search, statusFilter]
  )

  const counts = useMemo(() => ({
    draft:    proposals.filter((p) => p.status === 'draft').length,
    sent:     proposals.filter((p) => p.status === 'sent').length,
    accepted: proposals.filter((p) => p.status === 'accepted').length,
    declined: proposals.filter((p) => p.status === 'declined').length,
  }), [proposals])

  function goToLead(leadId: string) {
    router.push(`/dashboard/leads/${leadId}`)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '22px' }}>
            Proposals
          </h1>
          <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '14px' }}>
            {proposals.length} total
          </p>
        </div>
      </div>

      {/* Stats pills */}
      <div className="flex gap-3 flex-wrap mb-6">
        {(['draft', 'sent', 'accepted', 'declined'] as const).map((s) => (
          <div
            key={s}
            className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5"
            style={{ border: '1px solid #E5E7EB' }}
          >
            <div
              className="rounded-full flex-shrink-0"
              style={{ width: '8px', height: '8px', background: statDots[s] }}
            />
            <span className="font-body capitalize" style={{ color: '#6B7280', fontSize: '13px' }}>
              {s}
            </span>
            <span className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '15px' }}>
              {counts[s]}
            </span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap mb-5">
        <div className="relative flex-1" style={{ minWidth: '192px' }}>
          <Search
            size={15}
            className="absolute pointer-events-none"
            style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by business or contact..."
            className="w-full font-body rounded-xl"
            style={{
              border: '1px solid #E5E7EB',
              padding: '10px 16px 10px 38px',
              fontSize: '14px',
              color: '#0D0D0D',
              outline: 'none',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#8B2FC9' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E7EB' }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="font-body rounded-xl"
          style={{
            border: '1px solid #E5E7EB',
            padding: '10px 12px',
            fontSize: '14px',
            color: '#0D0D0D',
            background: 'white',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse px-5 py-4"
              style={{ borderBottom: i < 2 ? '1px solid #F5F5F5' : undefined }}
            >
              <div className="flex gap-4 items-center">
                <div className="rounded" style={{ width: '140px', height: '16px', background: '#F3F4F6' }} />
                <div className="rounded" style={{ width: '60px', height: '20px', background: '#F3F4F6' }} />
                <div className="rounded ml-auto" style={{ width: '80px', height: '20px', background: '#F3F4F6' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div
          className="bg-white rounded-2xl p-12 text-center shadow-sm"
          style={{ border: '1px solid #E5E7EB' }}
        >
          <FileText size={40} style={{ color: '#D1D5DB', margin: '0 auto' }} />
          <p className="font-body mt-3" style={{ color: '#6B7280', fontSize: '15px' }}>
            No proposals yet
          </p>
          <p className="font-body mt-1 mx-auto" style={{ color: '#9CA3AF', fontSize: '13px', maxWidth: '280px' }}>
            Proposals are created from the lead detail page.
          </p>
        </div>
      )}

      {/* Desktop table */}
      {!loading && filtered.length > 0 && (
        <>
          <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
            {/* Table header */}
            <div
              className="grid px-5 py-3"
              style={{
                gridTemplateColumns: '2fr 1fr 2fr 1.5fr 1fr 1fr 80px',
                background: '#F9F9F9',
                borderBottom: '1px solid #E5E7EB',
              }}
            >
              {['Business', 'Tier', 'Services', 'Value', 'Status', 'Date', 'Action'].map((h) => (
                <p
                  key={h}
                  className="font-body font-semibold uppercase"
                  style={{ color: '#6B7280', fontSize: '11px', letterSpacing: '0.05em' }}
                >
                  {h}
                </p>
              ))}
            </div>

            {/* Rows */}
            {filtered.map((p, i) => {
              const pStatus = statusConfig[p.status] ?? statusConfig.draft
              const tier = tierConfig[p.tier] ?? tierConfig.build
              const oneTimeItems = p.line_items?.filter((li) => !li.is_retainer) ?? []
              const visibleItems = oneTimeItems.slice(0, 2)
              const extraCount = oneTimeItems.length - 2

              return (
                <div
                  key={p.id}
                  className="grid px-5 py-4 cursor-pointer transition-colors hover:bg-[#FAFAFA]"
                  style={{
                    gridTemplateColumns: '2fr 1fr 2fr 1.5fr 1fr 1fr 80px',
                    alignItems: 'center',
                    borderBottom: i < filtered.length - 1 ? '1px solid #F5F5F5' : undefined,
                  }}
                  onClick={() => goToLead(p.lead_id)}
                >
                  {/* Business */}
                  <div>
                    <p className="font-body font-semibold" style={{ color: '#0D0D0D', fontSize: '14px' }}>
                      {p.lead?.business_name ?? '—'}
                    </p>
                    <p className="font-body mt-0.5" style={{ color: '#6B7280', fontSize: '12px' }}>
                      {p.lead?.full_name ?? '—'}
                    </p>
                  </div>

                  {/* Tier */}
                  <div>
                    <span
                      className="inline-block font-body font-semibold px-2 py-0.5 rounded-full capitalize"
                      style={{ fontSize: '11px', background: tier.bg, color: tier.color }}
                    >
                      {p.tier}
                    </span>
                  </div>

                  {/* Services */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {p.line_items?.length > 0 ? (
                      <>
                        {visibleItems.map((li) => (
                          <span
                            key={li.id}
                            className="inline-block font-body px-2 py-0.5 rounded-full"
                            style={{ fontSize: '11px', background: '#F3F4F6', color: '#4A4A4A', whiteSpace: 'nowrap' }}
                          >
                            {li.name}
                          </span>
                        ))}
                        {extraCount > 0 && (
                          <span
                            className="inline-block font-body px-2 py-0.5 rounded-full"
                            style={{ fontSize: '11px', background: '#F3F4F6', color: '#6B7280' }}
                          >
                            +{extraCount} more
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="font-body" style={{ color: '#9CA3AF', fontSize: '13px' }}>—</span>
                    )}
                  </div>

                  {/* Value */}
                  <div>
                    {p.investment_low > 0 ? (
                      <>
                        <p className="font-heading font-semibold" style={{ color: '#0D0D0D', fontSize: '14px' }}>
                          {formatCurrency(p.investment_low)}
                          {p.investment_high !== p.investment_low && ` – ${formatCurrency(p.investment_high)}`}
                        </p>
                        {p.monthly_retainer > 0 && (
                          <p className="font-body mt-0.5" style={{ color: '#8B2FC9', fontSize: '12px' }}>
                            +{formatCurrency(p.monthly_retainer)}/mo
                          </p>
                        )}
                      </>
                    ) : (
                      <span className="font-body" style={{ color: '#9CA3AF', fontSize: '13px' }}>—</span>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      className="inline-block font-body font-semibold px-2 py-0.5 rounded-full capitalize"
                      style={{ fontSize: '11px', background: pStatus.bg, color: pStatus.color }}
                    >
                      {pStatus.label}
                    </span>
                  </div>

                  {/* Date */}
                  <p className="font-body" style={{ color: '#6B7280', fontSize: '13px' }}>
                    {fmtDate(p.created_at)}
                  </p>

                  {/* Action */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => goToLead(p.lead_id)}
                      className="font-body rounded-lg px-3 py-1.5 transition-colors hover:bg-gray-50"
                      style={{ border: '1px solid #E5E7EB', fontSize: '12px', color: '#4A4A4A', background: 'white', cursor: 'pointer' }}
                    >
                      View
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((p) => {
              const pStatus = statusConfig[p.status] ?? statusConfig.draft
              const tier = tierConfig[p.tier] ?? tierConfig.build
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer"
                  style={{ border: '1px solid #E5E7EB' }}
                  onClick={() => goToLead(p.lead_id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-body font-bold" style={{ color: '#0D0D0D', fontSize: '15px' }}>
                        {p.lead?.business_name ?? '—'}
                      </p>
                      <p className="font-body mt-0.5" style={{ color: '#6B7280', fontSize: '13px' }}>
                        {p.lead?.full_name ?? '—'}
                      </p>
                    </div>
                    <span
                      className="inline-block font-body font-semibold px-2 py-0.5 rounded-full capitalize flex-shrink-0 ml-3"
                      style={{ fontSize: '11px', background: pStatus.bg, color: pStatus.color }}
                    >
                      {pStatus.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span
                      className="inline-block font-body font-semibold px-2 py-0.5 rounded-full capitalize"
                      style={{ fontSize: '11px', background: tier.bg, color: tier.color }}
                    >
                      {p.tier}
                    </span>
                    {p.investment_low > 0 && (
                      <span className="font-body font-semibold" style={{ color: '#8B2FC9', fontSize: '13px' }}>
                        {formatCurrency(p.investment_low)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #F5F5F5' }}>
                    <p className="font-body" style={{ color: '#9CA3AF', fontSize: '12px' }}>
                      {fmtDate(p.created_at)}
                    </p>
                    <span className="font-body" style={{ color: '#8B2FC9', fontSize: '12px' }}>
                      View →
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
