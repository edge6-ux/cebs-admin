'use client'

import { useEffect, useState } from 'react'
import { Search, ClipboardList, AlertCircle, Phone, Mail } from 'lucide-react'
import { timeAgo, statusColors, fmtDate } from '@/lib/utils'

interface TenantInfo {
  id: string
  slug: string
  business_name: string
  primary_color: string
}

interface Submission {
  id: string
  tenant_id: string
  customer_name: string
  customer_email: string
  property_address: string
  status: string
  created_at: string
  contacted_at: string | null
  contact_method: 'phone' | 'email' | null
  form_data: { service_type?: string; urgency?: string } | null
  tenant: TenantInfo
}

const STATUS_OPTIONS = [
  { value: 'all',      label: 'All Statuses' },
  { value: 'new',      label: 'New' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'quoted',   label: 'Quoted' },
  { value: 'won',      label: 'Won' },
  { value: 'lost',     label: 'Lost' },
]

const STAT_DOTS: { status: string; dot: string; label: string }[] = [
  { status: 'new',      dot: '#8B2FC9', label: 'New' },
  { status: 'reviewed', dot: '#3B82F6', label: 'Reviewed' },
  { status: 'quoted',   dot: '#F59E0B', label: 'Quoted' },
  { status: 'won',      dot: '#10B981', label: 'Won' },
  { status: 'lost',     dot: '#9CA3AF', label: 'Lost' },
]

function UrgencyBadge({ urgency }: { urgency: string | undefined }) {
  if (urgency === 'high') {
    return (
      <span
        className="px-2 py-0.5 rounded-full"
        style={{
          background: '#FCEBEB',
          color: '#991B1B',
          fontFamily: 'Inter, sans-serif',
          fontSize: '11px',
          fontWeight: 600,
        }}
      >
        Emergency
      </span>
    )
  }
  if (urgency === 'medium') {
    return (
      <span
        className="px-2 py-0.5 rounded-full"
        style={{
          background: '#FEF3C7',
          color: '#92400E',
          fontFamily: 'Inter, sans-serif',
          fontSize: '11px',
          fontWeight: 600,
        }}
      >
        This week
      </span>
    )
  }
  return (
    <span style={{ fontFamily: 'Inter, sans-serif', color: '#9CA3AF', fontSize: '13px' }}>
      Not urgent
    </span>
  )
}

export default function AssessmentsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tenantFilter, setTenantFilter] = useState('all')

  useEffect(() => {
    fetch('/api/admin/products/field-assessment/assessments')
      .then(res => res.json())
      .then(data => {
        setSubmissions(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const uniqueTenants = submissions
    .map(s => s.tenant)
    .filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i)

  const filtered = submissions.filter(s => {
    const q = search.toLowerCase()
    const matchesSearch =
      !search ||
      s.customer_name.toLowerCase().includes(q) ||
      s.customer_email.toLowerCase().includes(q) ||
      s.property_address.toLowerCase().includes(q)
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter
    const matchesTenant = tenantFilter === 'all' || s.tenant_id === tenantFilter
    return matchesSearch && matchesStatus && matchesTenant
  })

  const selectStyle: React.CSSProperties = {
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '10px 16px',
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    color: '#0D0D0D',
    background: 'white',
    outline: 'none',
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            color: '#0D0D0D',
            fontWeight: 700,
            fontSize: '22px',
          }}
        >
          Field Assessments
        </h1>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            color: '#6B7280',
            fontSize: '14px',
            marginTop: '4px',
          }}
        >
          {submissions.length} total
        </p>
      </div>

      {/* New leads alert */}
      {(() => {
        const newLeadsCount = submissions.filter(s => s.status === 'new').length
        if (newLeadsCount === 0) return null
        return (
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3 mb-4"
            style={{ background: '#FCEBEB', border: '1px solid #FECACA' }}
          >
            <AlertCircle size={18} style={{ color: '#E24B4A', flexShrink: 0 }} />
            <span
              style={{ fontFamily: 'Inter, sans-serif', color: '#991B1B', fontSize: '14px', fontWeight: 500 }}
            >
              {newLeadsCount} new lead{newLeadsCount !== 1 ? 's' : ''} across all tenants{' '}
              {newLeadsCount !== 1 ? 'need' : 'needs'} to be contacted
            </span>
          </div>
        )
      })()}

      {/* Stats Row */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {STAT_DOTS.map(({ status, dot, label }) => (
          <div
            key={status}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: 'white', border: '1px solid #E5E7EB' }}
          >
            <div
              className="rounded-full flex-shrink-0"
              style={{ width: '8px', height: '8px', background: dot }}
            />
            <span
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#4A4A4A' }}
            >
              {label}
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                fontWeight: 600,
                color: '#0D0D0D',
              }}
            >
              {submissions.filter(s => s.status === status).length}
            </span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap mb-5">
        <div className="relative flex-1" style={{ minWidth: '192px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9CA3AF',
            }}
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or address..."
            style={{
              ...selectStyle,
              width: '100%',
              paddingLeft: '36px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={selectStyle}
        >
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={tenantFilter}
          onChange={e => setTenantFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="all">All Tenants</option>
          {uniqueTenants.map(t => (
            <option key={t.id} value={t.id}>
              {t.business_name}
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="animate-pulse rounded-2xl h-16"
              style={{ background: '#F3F4F6' }}
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div
          className="rounded-2xl border p-12 text-center"
          style={{ background: 'white', borderColor: '#E5E7EB' }}
        >
          <ClipboardList size={40} style={{ color: '#9CA3AF', margin: '0 auto' }} />
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#9CA3AF',
              fontSize: '15px',
              marginTop: '12px',
            }}
          >
            No assessments yet
          </p>
        </div>
      )}

      {/* Desktop Table */}
      {!loading && filtered.length > 0 && (
        <>
          <div
            className="hidden md:block rounded-2xl overflow-hidden shadow-sm"
            style={{ background: 'white', border: '1px solid #E5E7EB' }}
          >
            {/* Header */}
            <div
              className="grid px-5 py-3"
              style={{
                background: '#F9F9F9',
                borderBottom: '1px solid #E5E7EB',
                gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 1fr',
              }}
            >
              {['Customer', 'Tenant', 'Service', 'Urgency', 'Status', 'Contacted', 'Date'].map(col => (
                <span
                  key={col}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: '#6B7280',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                  }}
                >
                  {col}
                </span>
              ))}
            </div>

            {/* Rows */}
            {filtered.map(s => {
              const sc = statusColors(s.status)
              const serviceLabel = s.form_data?.service_type
                ? s.form_data.service_type.replace(/_/g, ' ')
                : '—'

              return (
                <div
                  key={s.id}
                  className="grid px-5 py-4 hover:bg-[#FAFAFA] transition-colors"
                  style={{
                    borderBottom: '1px solid #F5F5F5',
                    gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 1fr',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: '#0D0D0D',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      {s.customer_name}
                    </p>
                    <p
                      className="truncate"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: '#6B7280',
                        fontSize: '12px',
                        marginTop: '2px',
                        maxWidth: '160px',
                      }}
                    >
                      {s.customer_email}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className="rounded-full flex-shrink-0"
                      style={{
                        width: '8px',
                        height: '8px',
                        background: s.tenant.primary_color,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: '#4A4A4A',
                        fontSize: '13px',
                      }}
                    >
                      {s.tenant.business_name}
                    </span>
                  </div>

                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: '#4A4A4A',
                      fontSize: '13px',
                      textTransform: 'capitalize',
                    }}
                  >
                    {serviceLabel}
                  </span>

                  <UrgencyBadge urgency={s.form_data?.urgency} />

                  <span
                    className="px-2 py-0.5 rounded-full capitalize inline-block"
                    style={{
                      background: sc.bg,
                      color: sc.color,
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    {s.status}
                  </span>

                  {/* Contacted */}
                  {s.status === 'contacted' && s.contacted_at ? (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {s.contact_method === 'phone' ? (
                        <Phone size={12} style={{ color: '#16A34A' }} />
                      ) : (
                        <Mail size={12} style={{ color: '#16A34A' }} />
                      )}
                      <span style={{ fontFamily: 'Inter, sans-serif', color: '#16A34A', fontSize: '12px' }}>
                        {fmtDate(s.contacted_at)}
                      </span>
                    </div>
                  ) : (
                    <span style={{ fontFamily: 'Inter, sans-serif', color: '#E24B4A', fontSize: '12px', fontWeight: 500 }}>
                      Not yet
                    </span>
                  )}

                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: '#6B7280',
                      fontSize: '13px',
                    }}
                  >
                    {timeAgo(s.created_at)}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map(s => {
              const sc = statusColors(s.status)
              return (
                <div
                  key={s.id}
                  className="rounded-2xl p-4 shadow-sm"
                  style={{ background: 'white', border: '1px solid #E5E7EB' }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 700,
                          fontSize: '15px',
                          color: '#0D0D0D',
                        }}
                      >
                        {s.customer_name}
                      </p>
                      <div className="flex items-center gap-2" style={{ marginTop: '2px' }}>
                        <div
                          className="rounded-full"
                          style={{
                            width: '6px',
                            height: '6px',
                            background: s.tenant.primary_color,
                          }}
                        />
                        <span
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            color: '#9CA3AF',
                            fontSize: '12px',
                          }}
                        >
                          {s.tenant.business_name}
                        </span>
                      </div>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full capitalize"
                      style={{
                        background: sc.bg,
                        color: sc.color,
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      {s.status}
                    </span>
                  </div>

                  <div className="flex gap-2 flex-wrap mt-2">
                    {s.form_data?.service_type && (
                      <span
                        className="px-2 py-0.5 rounded-full capitalize"
                        style={{
                          background: '#F3F4F6',
                          color: '#4A4A4A',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '11px',
                          fontWeight: 600,
                        }}
                      >
                        {s.form_data.service_type.replace(/_/g, ' ')}
                      </span>
                    )}
                    {s.form_data?.urgency === 'high' && (
                      <span
                        className="px-2 py-0.5 rounded-full"
                        style={{
                          background: '#FCEBEB',
                          color: '#991B1B',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '11px',
                          fontWeight: 600,
                        }}
                      >
                        Emergency
                      </span>
                    )}
                  </div>

                  <div
                    className="flex items-center justify-between mt-3 pt-3"
                    style={{ borderTop: '1px solid #F5F5F5' }}
                  >
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: '#9CA3AF',
                        fontSize: '12px',
                      }}
                    >
                      {timeAgo(s.created_at)}
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
