'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trash2, RotateCcw, RefreshCw } from 'lucide-react'

interface DeletedLead {
  id: string
  full_name: string
  business_name: string
  email: string
  status: string
  deleted_at: string
}

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  new:       { label: 'New',       bg: '#EDE9FE', color: '#6D28D9' },
  reviewed:  { label: 'Reviewed',  bg: '#DBEAFE', color: '#1D4ED8' },
  contacted: { label: 'Contacted', bg: '#FEF3C7', color: '#92400E' },
  converted: { label: 'Converted', bg: '#D1FAE5', color: '#065F46' },
  not_a_fit: { label: 'Not a Fit', bg: '#F3F4F6', color: '#6B7280' },
}

function daysRemaining(deletedAt: string): number {
  const deleted = new Date(deletedAt).getTime()
  const expiry = deleted + 14 * 24 * 60 * 60 * 1000
  return Math.max(0, Math.ceil((expiry - Date.now()) / (24 * 60 * 60 * 1000)))
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function TrashPage() {
  const [leads, setLeads] = useState<DeletedLead[]>([])
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/trash')
    const data = await res.json()
    setLeads(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function restore(id: string) {
    setRestoring(id)
    await fetch(`/api/admin/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deleted_at: null }),
    })
    setLeads((prev) => prev.filter((l) => l.id !== id))
    setRestoring(null)
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '24px' }}>
            Trash
          </h1>
          <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '14px' }}>
            Deleted items are kept for 14 days before being permanently removed.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '6px' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#4A4A4A' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF' }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Leads section */}
      <div className="bg-white rounded-2xl shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
        <div
          className="flex items-center gap-2 px-5 py-4"
          style={{ borderBottom: '1px solid #F5F5F5' }}
        >
          <Trash2 size={15} style={{ color: '#6B7280' }} />
          <p className="font-body font-semibold" style={{ color: '#4A4A4A', fontSize: '14px' }}>
            Leads
          </p>
          {!loading && (
            <span
              className="font-body px-2 py-0.5 rounded-full"
              style={{ fontSize: '12px', background: '#F3F4F6', color: '#6B7280' }}
            >
              {leads.length}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div
              className="rounded-full animate-spin"
              style={{ width: '24px', height: '24px', border: '3px solid #F3F4F6', borderTopColor: '#8B2FC9' }}
            />
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Trash2 size={32} style={{ color: '#E5E7EB' }} />
            <p className="font-body" style={{ color: '#9CA3AF', fontSize: '14px' }}>
              No deleted leads
            </p>
          </div>
        ) : (
          <ul>
            {leads.map((lead, i) => {
              const days = daysRemaining(lead.deleted_at)
              const s = statusConfig[lead.status] ?? statusConfig.new
              const isLast = i === leads.length - 1
              return (
                <li
                  key={lead.id}
                  className="flex items-center gap-4 px-5 py-4"
                  style={{ borderBottom: isLast ? 'none' : '1px solid #F5F5F5' }}
                >
                  {/* Avatar */}
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-full"
                    style={{ width: '40px', height: '40px', background: '#F3F4F6' }}
                  >
                    <span className="font-heading font-bold" style={{ color: '#9CA3AF', fontSize: '14px' }}>
                      {lead.full_name.trim().split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-body font-semibold" style={{ color: '#0D0D0D', fontSize: '14px' }}>
                        {lead.business_name}
                      </p>
                      <span
                        className="font-body px-2 py-0.5 rounded-full"
                        style={{ fontSize: '11px', background: s.bg, color: s.color }}
                      >
                        {s.label}
                      </span>
                    </div>
                    <p className="font-body mt-0.5" style={{ color: '#6B7280', fontSize: '13px' }}>
                      {lead.full_name} · {lead.email}
                    </p>
                    <p className="font-body mt-0.5" style={{ color: days <= 2 ? '#E24B4A' : '#9CA3AF', fontSize: '12px' }}>
                      Deleted {fmtDate(lead.deleted_at)} · {days} day{days !== 1 ? 's' : ''} remaining
                    </p>
                  </div>

                  {/* Restore */}
                  <button
                    onClick={() => restore(lead.id)}
                    disabled={restoring === lead.id}
                    className="flex items-center gap-1.5 font-body flex-shrink-0"
                    style={{
                      fontSize: '13px',
                      color: '#8B2FC9',
                      background: 'rgba(139,47,201,0.06)',
                      border: '1px solid rgba(139,47,201,0.2)',
                      borderRadius: '10px',
                      padding: '6px 12px',
                      cursor: restoring === lead.id ? 'not-allowed' : 'pointer',
                      opacity: restoring === lead.id ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => { if (restoring !== lead.id) e.currentTarget.style.background = 'rgba(139,47,201,0.12)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(139,47,201,0.06)' }}
                  >
                    <RotateCcw size={13} />
                    {restoring === lead.id ? 'Restoring…' : 'Restore'}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
