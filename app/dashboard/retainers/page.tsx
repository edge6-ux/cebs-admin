import Link from 'next/link'
import { ChevronLeft, RefreshCw, Building2 } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase-server'
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

export default async function RetainersPage() {
  const { data } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('on_retainer', true)
    .is('deleted_at', null)
    .order('retainer_amount', { ascending: false })

  const customers = (data ?? []) as Customer[]
  const totalMRR = customers.reduce((sum, c) => sum + (c.retainer_amount || 0), 0)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 font-body mb-6 transition-colors hover:text-[#0D0D0D]"
        style={{ color: '#6B7280', fontSize: '14px' }}
      >
        <ChevronLeft size={16} />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '22px' }}>
            Monthly Recurring Revenue
          </h1>
          <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '14px' }}>
            {customers.length} client{customers.length !== 1 ? 's' : ''} on retainer
          </p>
        </div>
      </div>

      {/* MRR summary card */}
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
      {customers.length === 0 && (
        <div
          className="bg-white rounded-2xl p-12 text-center shadow-sm"
          style={{ border: '1px solid #E5E7EB' }}
        >
          <Building2 size={40} style={{ color: '#D1D5DB', margin: '0 auto' }} />
          <p className="font-body mt-3" style={{ color: '#6B7280', fontSize: '15px' }}>
            No retainer clients yet
          </p>
          <p className="font-body mt-1 mx-auto" style={{ color: '#9CA3AF', fontSize: '13px', maxWidth: '280px' }}>
            Clients on retainer appear here when their customer profile has a retainer enabled.
          </p>
        </div>
      )}

      {/* Client list */}
      {customers.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
          {/* Table header */}
          <div
            className="hidden md:grid px-5 py-3"
            style={{
              gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
              background: '#F9F9F9',
              borderBottom: '1px solid #E5E7EB',
            }}
          >
            {['Business', 'Contact', 'Monthly', 'Status', 'Since'].map((h) => (
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
          {customers.map((c, i) => {
            const badge = statusConfig[c.status] ?? statusConfig.inactive
            return (
              <Link
                key={c.id}
                href={`/dashboard/customers/${c.id}`}
                className="block transition-colors hover:bg-[#FAFAFA]"
                style={{ borderBottom: i < customers.length - 1 ? '1px solid #F5F5F5' : undefined }}
              >
                {/* Desktop row */}
                <div
                  className="hidden md:grid px-5 py-4"
                  style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', alignItems: 'center' }}
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

                  {/* Monthly */}
                  <div className="flex items-center gap-1.5">
                    <RefreshCw size={12} style={{ color: '#8B2FC9', flexShrink: 0 }} />
                    <span className="font-body font-semibold" style={{ color: '#8B2FC9', fontSize: '14px' }}>
                      {formatCurrency(c.retainer_amount)}/mo
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      className="inline-block font-body font-semibold px-2 py-0.5 rounded-full capitalize"
                      style={{ fontSize: '11px', background: badge.bg, color: badge.color }}
                    >
                      {c.status}
                    </span>
                  </div>

                  {/* Since */}
                  <p className="font-body" style={{ color: '#6B7280', fontSize: '13px' }}>
                    {fmtDate(c.created_at)}
                  </p>
                </div>

                {/* Mobile card */}
                <div className="md:hidden px-4 py-4">
                  <div className="flex items-center gap-3 mb-2">
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
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <RefreshCw size={12} style={{ color: '#8B2FC9' }} />
                      <span className="font-body font-bold" style={{ color: '#8B2FC9', fontSize: '14px' }}>
                        {formatCurrency(c.retainer_amount)}/mo
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="inline-block font-body font-semibold px-2 py-0.5 rounded-full capitalize"
                      style={{ fontSize: '11px', background: badge.bg, color: badge.color }}
                    >
                      {c.status}
                    </span>
                    <p className="font-body" style={{ color: '#9CA3AF', fontSize: '12px' }}>
                      Since {fmtDate(c.created_at)}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}

          {/* Footer total */}
          <div
            className="hidden md:flex items-center justify-between px-5 py-3"
            style={{ background: '#F9F9F9', borderTop: '1px solid #E5E7EB' }}
          >
            <p className="font-body font-semibold" style={{ color: '#4A4A4A', fontSize: '13px' }}>
              Total — {customers.length} client{customers.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-1.5" style={{ gridColumn: '3' }}>
              <RefreshCw size={12} style={{ color: '#8B2FC9' }} />
              <span className="font-heading font-bold" style={{ color: '#8B2FC9', fontSize: '15px' }}>
                {formatCurrency(totalMRR)}/mo
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
