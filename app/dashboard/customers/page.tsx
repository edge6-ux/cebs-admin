'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Building2, RefreshCw } from 'lucide-react'
import type { Customer } from '@/lib/types'
import { fmtDate, formatCurrency } from '@/lib/utils'

function getInitials(name: string): string {
  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

const statusConfig: Record<string, { bg: string; color: string }> = {
  active:   { bg: '#D1FAE5', color: '#065F46' },
  inactive: { bg: '#F3F4F6', color: '#6B7280' },
  churned:  { bg: '#FCEBEB', color: '#991B1B' },
}

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetch('/api/admin/customers')
      .then((r) => r.json())
      .then((data: Customer[]) => setCustomers(data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase()
    const matchesSearch =
      !search ||
      c.business_name.toLowerCase().includes(q) ||
      c.contact_name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const activeCount   = customers.filter((c) => c.status === 'active').length
  const inactiveCount = customers.filter((c) => c.status === 'inactive').length
  const retainerCount = customers.filter((c) => c.on_retainer).length

  const isFiltered = search !== '' || statusFilter !== 'all'

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <p className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '22px' }}>
            Customers
          </p>
          <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '14px' }}>
            {customers.length} total
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/customers/new')}
          className="flex items-center gap-2 font-body font-medium text-white rounded-xl px-4 py-2.5 transition-opacity hover:opacity-90"
          style={{ background: '#8B2FC9', fontSize: '14px' }}
        >
          <Plus size={15} />
          Add Customer
        </button>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 flex-wrap mb-6">
        {[
          { dot: '#16A34A', label: 'Active',      count: activeCount },
          { dot: '#9CA3AF', label: 'Inactive',    count: inactiveCount },
          { dot: '#8B2FC9', label: 'On Retainer', count: retainerCount },
        ].map(({ dot, label, count }) => (
          <div
            key={label}
            className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5"
            style={{ border: '1px solid #E5E7EB' }}
          >
            <div className="rounded-full flex-shrink-0" style={{ width: '8px', height: '8px', background: dot }} />
            <span className="font-body" style={{ color: '#6B7280', fontSize: '13px' }}>{label}</span>
            <span className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '15px' }}>{count}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap mb-5">
        <div className="flex items-center gap-2 flex-1 min-w-48 bg-white rounded-xl px-4 py-2.5" style={{ border: '1px solid #E5E7EB' }}>
          <Search size={15} style={{ color: '#9CA3AF', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by business, name, or email..."
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
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="churned">Churned</option>
        </select>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-4 px-5 py-4 animate-pulse" style={{ borderBottom: '1px solid #F5F5F5' }}>
              <div className="rounded-full bg-gray-200 flex-shrink-0" style={{ width: '36px', height: '36px' }} />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty — no customers at all */}
      {!loading && customers.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
          <Building2 size={40} style={{ color: '#D1D5DB', margin: '0 auto' }} />
          <p className="font-body mt-3" style={{ color: '#6B7280', fontSize: '15px' }}>No customers yet</p>
          <p className="font-body mt-1 mx-auto" style={{ color: '#9CA3AF', fontSize: '13px', maxWidth: '280px' }}>
            Customer accounts are created automatically when a consultation is submitted.
          </p>
        </div>
      )}

      {/* Empty — filter active but no results */}
      {!loading && customers.length > 0 && filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
          <p className="font-body" style={{ color: '#6B7280', fontSize: '15px' }}>
            No customers match your search or filter
          </p>
          <button
            onClick={() => { setSearch(''); setStatusFilter('all') }}
            className="font-body mt-3 transition-opacity hover:opacity-70"
            style={{ color: '#8B2FC9', fontSize: '13px' }}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Desktop table */}
      {!loading && filtered.length > 0 && (
        <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
          {/* Table header */}
          <div
            className="grid px-5 py-3"
            style={{
              gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr auto',
              background: '#F9F9F9',
              borderBottom: '1px solid #E5E7EB',
            }}
          >
            {['Business', 'Contact', 'Industry', 'Retainer', 'Status', 'Since', 'Action'].map((h) => (
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
          {filtered.map((c) => {
            const badge = statusConfig[c.status] ?? statusConfig.inactive
            return (
              <div
                key={c.id}
                className="grid px-5 py-4 cursor-pointer transition-colors hover:bg-[#FAFAFA]"
                style={{
                  gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr auto',
                  borderBottom: '1px solid #F5F5F5',
                  alignItems: 'center',
                }}
                onClick={() => router.push(`/dashboard/customers/${c.id}`)}
              >
                {/* Business */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-full"
                    style={{ width: '36px', height: '36px', background: '#0D0D0D' }}
                  >
                    <span className="font-heading font-bold text-white" style={{ fontSize: '13px' }}>
                      {getInitials(c.business_name)}
                    </span>
                  </div>
                  <div>
                    <p className="font-body font-semibold" style={{ color: '#0D0D0D', fontSize: '14px' }}>
                      {c.business_name}
                    </p>
                    {c.industry && (
                      <p className="font-body mt-0.5" style={{ color: '#6B7280', fontSize: '12px' }}>
                        {c.industry}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <p className="font-body" style={{ color: '#4A4A4A', fontSize: '14px' }}>
                    {c.contact_name}
                  </p>
                  <p className="font-body mt-0.5 truncate" style={{ color: '#6B7280', fontSize: '12px', maxWidth: '160px' }}>
                    {c.email}
                  </p>
                </div>

                {/* Industry */}
                <p className="font-body" style={{ color: '#4A4A4A', fontSize: '13px' }}>
                  {c.industry || '—'}
                </p>

                {/* Retainer */}
                {c.on_retainer ? (
                  <div className="flex items-center gap-1.5">
                    <RefreshCw size={12} style={{ color: '#8B2FC9' }} />
                    <span className="font-body font-semibold" style={{ color: '#8B2FC9', fontSize: '13px' }}>
                      {formatCurrency(c.retainer_amount)}/mo
                    </span>
                  </div>
                ) : (
                  <p className="font-body" style={{ color: '#9CA3AF', fontSize: '13px' }}>—</p>
                )}

                {/* Status */}
                <span
                  className="inline-block font-body font-semibold px-2 py-0.5 rounded-full capitalize"
                  style={{ fontSize: '11px', background: badge.bg, color: badge.color }}
                >
                  {c.status}
                </span>

                {/* Since */}
                <p className="font-body" style={{ color: '#6B7280', fontSize: '13px' }}>
                  {fmtDate(c.created_at)}
                </p>

                {/* Action */}
                <button
                  onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/customers/${c.id}`) }}
                  className="font-body rounded-lg px-3 py-1.5 transition-colors hover:bg-gray-50"
                  style={{ border: '1px solid #E5E7EB', fontSize: '12px', color: '#4A4A4A' }}
                >
                  View
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Mobile cards */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-3 md:hidden">
          {filtered.map((c) => {
            const badge = statusConfig[c.status] ?? statusConfig.inactive
            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer"
                style={{ border: '1px solid #E5E7EB' }}
                onClick={() => router.push(`/dashboard/customers/${c.id}`)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-full"
                    style={{ width: '40px', height: '40px', background: '#0D0D0D' }}
                  >
                    <span className="font-heading font-bold text-white" style={{ fontSize: '14px' }}>
                      {getInitials(c.business_name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-bold" style={{ color: '#0D0D0D', fontSize: '15px' }}>
                      {c.business_name}
                    </p>
                    <p className="font-body mt-0.5" style={{ color: '#6B7280', fontSize: '13px' }}>
                      {c.contact_name}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <span
                    className="inline-block font-body font-semibold px-2 py-0.5 rounded-full capitalize"
                    style={{ fontSize: '11px', background: badge.bg, color: badge.color }}
                  >
                    {c.status}
                  </span>
                  {c.on_retainer && (
                    <span
                      className="inline-flex items-center gap-1 font-body font-semibold px-2 py-0.5 rounded-full"
                      style={{ fontSize: '11px', background: 'rgba(139,47,201,0.1)', color: '#8B2FC9' }}
                    >
                      <RefreshCw size={10} />
                      {formatCurrency(c.retainer_amount)}/mo
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #F5F5F5' }}>
                  <p className="font-body" style={{ color: '#6B7280', fontSize: '12px' }}>
                    {fmtDate(c.created_at)}
                  </p>
                  <p className="font-body font-medium" style={{ color: '#8B2FC9', fontSize: '12px' }}>
                    View →
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
