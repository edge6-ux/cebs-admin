import Link from 'next/link'
import {
  ChevronLeft,
  Calendar,
  User,
  Mail,
  Phone,
  ExternalLink,
  Building2,
} from 'lucide-react'
import type { Job, Customer } from '@/lib/types'
import { fmtDate, formatCurrency } from '@/lib/utils'
import WorkLogSection from './WorkLogSection'
import RetainerManagement from './RetainerManagement'

interface Props {
  job: Job
  customer: Customer | null
}

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  queued:      { bg: '#F3F4F6', color: '#6B7280', label: 'Queued' },
  in_progress: { bg: '#D1FAE5', color: '#065F46', label: 'Active' },
  on_hold:     { bg: '#FEF3C7', color: '#92400E', label: 'Paused' },
}

export default function RetainerJobDetail({ job, customer }: Props) {
  const status = statusConfig[job.status] ?? statusConfig.queued

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back button */}
      <Link
        href="/dashboard/retainers"
        className="inline-flex items-center gap-1.5 font-body mb-6 transition-opacity hover:opacity-70"
        style={{ color: '#6B7280', fontSize: '14px' }}
      >
        <ChevronLeft size={16} />
        Back to Retainers
      </Link>

      {/* Header card */}
      <div
        className="bg-white rounded-2xl shadow-sm p-6 mb-6"
        style={{ border: '1px solid #E5E7EB' }}
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          {/* Left */}
          <div>
            <span
              className="inline-block font-body font-semibold px-2.5 py-1 rounded-full mb-2"
              style={{ fontSize: '12px', background: 'rgba(139,47,201,0.1)', color: '#8B2FC9' }}
            >
              Monthly Retainer
            </span>
            <p className="font-heading font-bold mb-1" style={{ color: '#0D0D0D', fontSize: '24px' }}>
              {job.title}
            </p>
            <p className="font-body" style={{ color: '#6B7280', fontSize: '15px' }}>
              {customer?.business_name ?? 'No customer linked'}
            </p>
          </div>

          {/* Right badges */}
          <div className="flex items-start gap-2 flex-wrap">
            <span
              className="font-body font-bold px-3 py-1.5 rounded-xl"
              style={{ fontSize: '13px', background: status.bg, color: status.color }}
            >
              {status.label}
            </span>
            <span
              className="font-body font-bold px-3 py-1.5 rounded-xl"
              style={{
                fontSize: '13px',
                background: 'rgba(139,47,201,0.08)',
                border: '1px solid rgba(139,47,201,0.2)',
                color: '#8B2FC9',
              }}
            >
              {formatCurrency(customer?.retainer_amount ?? 0)}/mo
            </span>
          </div>
        </div>

        {/* Details row */}
        <div className="flex items-center gap-6 flex-wrap mt-4">
          <span
            className="flex items-center gap-2 font-body"
            style={{ color: '#4A4A4A', fontSize: '13px' }}
          >
            <Calendar size={14} style={{ color: '#6B7280' }} />
            Started {fmtDate(job.created_at)}
          </span>

          {job.assigned_to && (
            <span
              className="flex items-center gap-2 font-body"
              style={{ color: '#4A4A4A', fontSize: '13px' }}
            >
              <User size={14} style={{ color: '#6B7280' }} />
              {job.assigned_to}
            </span>
          )}

          {customer?.email && (
            <a
              href={`mailto:${customer.email}`}
              className="flex items-center gap-2 font-body transition-opacity hover:opacity-70"
              style={{ color: '#8B2FC9', fontSize: '13px' }}
            >
              <Mail size={14} style={{ color: '#6B7280' }} />
              {customer.email}
            </a>
          )}

          {customer?.phone && (
            <a
              href={`tel:${customer.phone}`}
              className="flex items-center gap-2 font-body transition-opacity hover:opacity-70"
              style={{ color: '#8B2FC9', fontSize: '13px' }}
            >
              <Phone size={14} style={{ color: '#6B7280' }} />
              {customer.phone}
            </a>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
        {/* Left column */}
        <div>
          {/* Scope of Work */}
          <div
            className="bg-white rounded-2xl shadow-sm p-6 mb-4"
            style={{ border: '1px solid #E5E7EB' }}
          >
            <p
              className="font-body uppercase pb-3 mb-5"
              style={{
                color: '#6B7280',
                fontSize: '11px',
                letterSpacing: '0.08em',
                borderBottom: '1px solid #F5F5F5',
              }}
            >
              What&apos;s Included
            </p>
            {job.description ? (
              <p
                className="font-body"
                style={{
                  color: '#4A4A4A',
                  fontSize: '15px',
                  lineHeight: '1.8',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {job.description}
              </p>
            ) : (
              <p className="font-body" style={{ color: '#9CA3AF', fontSize: '14px' }}>
                No scope defined yet. Add details in the management panel.
              </p>
            )}
          </div>

          {/* Monthly Work Log */}
          <div
            className="bg-white rounded-2xl shadow-sm p-6 mb-4"
            style={{ border: '1px solid #E5E7EB' }}
          >
            <p className="font-heading font-bold mb-5" style={{ color: '#0D0D0D', fontSize: '17px' }}>
              Monthly Work Log
            </p>
            <WorkLogSection jobId={job.id} initialNotes={job.internal_notes} />
          </div>
        </div>

        {/* Right column */}
        <div className="w-80 flex-shrink-0">
          <RetainerManagement job={job} />

          {/* Customer Info */}
          <div
            className="bg-white rounded-2xl shadow-sm p-5 mb-4"
            style={{ border: '1px solid #E5E7EB' }}
          >
            <p
              className="font-body uppercase pb-3 mb-4"
              style={{
                color: '#9CA3AF',
                fontSize: '11px',
                letterSpacing: '0.08em',
                borderBottom: '1px solid #F5F5F5',
              }}
            >
              Customer
            </p>

            {!customer ? (
              <p className="font-body" style={{ color: '#9CA3AF', fontSize: '13px' }}>
                No customer linked
              </p>
            ) : (
              <>
                <p className="font-body font-semibold mb-1" style={{ color: '#0D0D0D', fontSize: '14px' }}>
                  {customer.business_name}
                </p>
                <p className="font-body mb-3" style={{ color: '#6B7280', fontSize: '13px' }}>
                  {customer.contact_name}
                </p>
                <p className="font-body font-bold mb-3" style={{ color: '#8B2FC9', fontSize: '14px' }}>
                  {formatCurrency(customer.retainer_amount)}/mo
                </p>
                <div className="space-y-2">
                  {customer.email && (
                    <a
                      href={`mailto:${customer.email}`}
                      className="flex items-center gap-2 font-body transition-opacity hover:opacity-70"
                      style={{ color: '#6B7280', fontSize: '13px' }}
                    >
                      <Mail size={13} style={{ color: '#9CA3AF' }} />
                      {customer.email}
                    </a>
                  )}
                  {customer.phone && (
                    <a
                      href={`tel:${customer.phone}`}
                      className="flex items-center gap-2 font-body transition-opacity hover:opacity-70"
                      style={{ color: '#6B7280', fontSize: '13px' }}
                    >
                      <Phone size={13} style={{ color: '#9CA3AF' }} />
                      {customer.phone}
                    </a>
                  )}
                </div>
                <Link
                  href={`/dashboard/customers/${customer.id}`}
                  className="block font-body font-medium mt-3 transition-opacity hover:opacity-70"
                  style={{ color: '#8B2FC9', fontSize: '13px' }}
                >
                  View Customer →
                </Link>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div
            className="bg-white rounded-2xl shadow-sm p-5"
            style={{ border: '1px solid #E5E7EB' }}
          >
            <p
              className="font-body uppercase pb-3 mb-4"
              style={{
                color: '#9CA3AF',
                fontSize: '11px',
                letterSpacing: '0.08em',
                borderBottom: '1px solid #F5F5F5',
              }}
            >
              Actions
            </p>
            <div className="space-y-2">
              {customer?.email && (
                <a
                  href={`mailto:${customer.email}`}
                  className="flex w-full items-center gap-2 font-body rounded-xl px-4 py-2.5 transition-colors hover:bg-gray-50"
                  style={{ border: '1px solid #E5E7EB', color: '#4A4A4A', fontSize: '14px' }}
                >
                  <Mail size={15} style={{ color: '#9CA3AF' }} />
                  Email Client
                </a>
              )}
              {customer?.phone && (
                <a
                  href={`tel:${customer.phone}`}
                  className="flex w-full items-center gap-2 font-body rounded-xl px-4 py-2.5 transition-colors hover:bg-gray-50"
                  style={{ border: '1px solid #E5E7EB', color: '#4A4A4A', fontSize: '14px' }}
                >
                  <Phone size={15} style={{ color: '#9CA3AF' }} />
                  Call Client
                </a>
              )}
              {job.live_url && (
                <a
                  href={job.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-2 font-body rounded-xl px-4 py-2.5 transition-colors hover:bg-gray-50"
                  style={{ border: '1px solid #E5E7EB', color: '#4A4A4A', fontSize: '14px' }}
                >
                  <ExternalLink size={15} style={{ color: '#9CA3AF' }} />
                  View Live Site
                </a>
              )}
              {job.customer_id && (
                <Link
                  href={`/dashboard/customers/${job.customer_id}`}
                  className="flex w-full items-center gap-2 font-body rounded-xl px-4 py-2.5 transition-colors hover:bg-gray-50"
                  style={{ border: '1px solid rgba(139,47,201,0.4)', color: '#8B2FC9', fontSize: '14px' }}
                >
                  <Building2 size={15} style={{ color: '#8B2FC9' }} />
                  View Customer
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
