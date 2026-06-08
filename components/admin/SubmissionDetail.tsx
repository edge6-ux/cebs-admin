'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  Phone,
  Mail,
  MapPin,
  Tag,
  Clock,
  Camera,
  Sparkles,
  CheckCircle,
} from 'lucide-react'
import { fmtDate, fmtDateTime } from '@/lib/utils'

interface Tenant {
  id: string
  slug: string
  business_name: string
  primary_color: string
  secondary_color: string | null
  logo_url: string | null
  notification_email: string
  admin_email: string
  auth_user_id: string | null
  active: boolean
  customer_id: string | null
  retainer_amount: number | null
  billing_cycle: string | null
  next_billing_date: string | null
  notes: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
  updated_at: string
}

interface FieldSubmission {
  id: string
  tenant_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  property_address: string
  status: string
  notes: string | null
  contacted_at: string | null
  contact_method: 'phone' | 'email' | null
  created_at: string
  image_urls: string[] | null
  urgency: 'high' | 'medium' | 'low' | null
  hazards: string[] | null
  form_data: {
    service_type?: string | string[]
    tree_count?: string
    tree_height?: string
    urgency?: string
    additional_notes?: string
  } | null
  operator_report: string | null
  customer_report: string | null
}

interface Props {
  tenant: Tenant
  submission: FieldSubmission
}

function formatServiceType(serviceType: string | string[] | undefined): string {
  if (!serviceType) return '—'
  if (Array.isArray(serviceType)) {
    return serviceType.map(s => s.replace(/_/g, ' ')).join(', ')
  }
  return serviceType.replace(/_/g, ' ')
}

function todayISO(): string {
  const now = new Date()
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')
}

const sectionLabel: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  color: '#9CA3AF',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '16px',
}

export default function SubmissionDetail({ tenant, submission }: Props) {
  const [status, setStatus] = useState(submission.status)
  const [notes, setNotes] = useState(submission.notes ?? '')
  const [savingNotes, setSavingNotes] = useState(false)
  const [savedNotes, setSavedNotes] = useState(false)
  const [activeReport, setActiveReport] = useState<'operator' | 'customer'>('operator')
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactDate, setContactDate] = useState(todayISO)
  const [contactMethod, setContactMethod] = useState<'phone' | 'email' | null>(null)
  const [savingContact, setSavingContact] = useState(false)
  const [contactedAt, setContactedAt] = useState<string | null>(submission.contacted_at)
  const [contactMethod_saved, setContactMethod_saved] = useState<'phone' | 'email' | null>(
    submission.contact_method
  )

  const urgency = submission.urgency
  const imageUrls = submission.image_urls ?? []
  const hazards = submission.hazards ?? []

  async function saveNotes() {
    if (notes === submission.notes) return
    setSavingNotes(true)
    await fetch(`/api/submissions/${submission.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    })
    setSavingNotes(false)
    setSavedNotes(true)
    setTimeout(() => setSavedNotes(false), 2000)
  }

  async function saveContact() {
    if (!contactMethod) return
    setSavingContact(true)
    const contacted = new Date(contactDate).toISOString()
    await fetch(`/api/submissions/${submission.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'contacted',
        contacted_at: contacted,
        contact_method: contactMethod,
      }),
    })
    setStatus('contacted')
    setContactedAt(contacted)
    setContactMethod_saved(contactMethod)
    setSavingContact(false)
    setShowContactModal(false)
  }

  const jobRows: { label: string; value: string; noteStyle?: boolean }[] = [
    {
      label: 'Service',
      value: formatServiceType(submission.form_data?.service_type) || '—',
    },
    { label: 'Tree Count', value: submission.form_data?.tree_count || '—' },
    { label: 'Height', value: submission.form_data?.tree_height || '—' },
    {
      label: 'Hazards',
      value: hazards.length > 0 ? hazards.join(', ') : 'None reported',
    },
    {
      label: 'Urgency',
      value:
        urgency === 'high'
          ? 'Emergency 🚨'
          : urgency === 'medium'
          ? 'Within a week'
          : 'Not urgent',
    },
    {
      label: 'Notes',
      value: submission.form_data?.additional_notes || '—',
      noteStyle: true,
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>
      {/* Topbar */}
      <div
        style={{
          background: 'white',
          borderBottom: '1px solid #E5E7EB',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {tenant.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tenant.logo_url}
              alt={tenant.business_name}
              style={{ height: '32px', objectFit: 'contain' }}
            />
          ) : (
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: tenant.primary_color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 700,
                fontSize: '14px',
                flexShrink: 0,
              }}
            >
              {tenant.business_name[0]}
            </div>
          )}
          <span
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              color: '#0D0D0D',
              fontWeight: 700,
              fontSize: '15px',
            }}
          >
            {tenant.business_name}
          </span>
        </div>

        <Link
          href={`/${tenant.slug}/admin`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontFamily: 'Inter, sans-serif',
            color: '#6B7280',
            fontSize: '13px',
            textDecoration: 'none',
          }}
        >
          <ChevronLeft size={16} />
          Back to Leads
        </Link>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '896px', margin: '0 auto', padding: '32px 16px' }}>
        {/* Lead Header Card */}
        <div
          className="rounded-2xl border p-6 mb-6 shadow-sm"
          style={{
            background: 'white',
            borderColor: urgency === 'high' ? '#E24B4A' : '#E5E7EB',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            {/* Left */}
            <div>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  marginBottom: '4px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    color: '#0D0D0D',
                    fontWeight: 700,
                    fontSize: '24px',
                  }}
                >
                  {submission.customer_name}
                </span>
                {urgency === 'high' && (
                  <span
                    style={{
                      background: '#FCEBEB',
                      color: '#991B1B',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '9999px',
                    }}
                  >
                    Emergency
                  </span>
                )}
              </div>

              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#6B7280',
                  fontSize: '15px',
                  marginBottom: '12px',
                }}
              >
                {submission.property_address}
              </p>

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {submission.customer_phone && (
                  <a
                    href={`tel:${submission.customer_phone}`}
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                      textDecoration: 'none',
                    }}
                  >
                    <Phone size={15} color={tenant.primary_color} />
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: '#0D0D0D',
                        fontSize: '14px',
                        fontWeight: 500,
                      }}
                    >
                      {submission.customer_phone}
                    </span>
                  </a>
                )}

                {submission.customer_email && (
                  <a
                    href={`mailto:${submission.customer_email}`}
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                      textDecoration: 'none',
                    }}
                  >
                    <Mail size={15} color={tenant.primary_color} />
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: '#0D0D0D',
                        fontSize: '14px',
                        fontWeight: 500,
                      }}
                    >
                      {submission.customer_email}
                    </span>
                  </a>
                )}

                {submission.property_address && (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(submission.property_address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                      textDecoration: 'none',
                    }}
                  >
                    <MapPin size={15} color={tenant.primary_color} />
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: '#0D0D0D',
                        fontSize: '14px',
                        fontWeight: 500,
                      }}
                    >
                      Get Directions
                    </span>
                  </a>
                )}
              </div>
            </div>

            {/* Right: status block */}
            <div style={{ textAlign: 'right' }}>
              {status === 'new' && (
                <>
                  <span
                    style={{
                      display: 'inline-block',
                      background: '#FCEBEB',
                      color: '#E24B4A',
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontWeight: 700,
                      fontSize: '13px',
                      padding: '6px 12px',
                      borderRadius: '12px',
                      marginBottom: '8px',
                    }}
                  >
                    New Lead
                  </span>
                  <br />
                  <button
                    onClick={() => setShowContactModal(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: tenant.primary_color,
                      color: 'white',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '13px',
                      fontWeight: 500,
                      padding: '8px 16px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <Phone size={14} />
                    Mark as Contacted
                  </button>
                </>
              )}

              {status === 'contacted' && (
                <>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#D1FAE5',
                      color: '#065F46',
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontWeight: 700,
                      fontSize: '13px',
                      padding: '6px 12px',
                      borderRadius: '12px',
                      marginBottom: '4px',
                    }}
                  >
                    <CheckCircle size={14} />
                    {contactMethod_saved === 'phone' ? 'Called' : 'Emailed'}
                  </span>
                  {contactedAt && (
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: '#6B7280',
                        fontSize: '12px',
                        textAlign: 'right',
                      }}
                    >
                      {fmtDate(contactedAt)}
                    </p>
                  )}
                  <button
                    onClick={() => setShowContactModal(true)}
                    style={{
                      display: 'block',
                      fontFamily: 'Inter, sans-serif',
                      color: '#9CA3AF',
                      fontSize: '12px',
                      cursor: 'pointer',
                      marginTop: '4px',
                      textAlign: 'right',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      width: '100%',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#4A4A4A' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF' }}
                  >
                    Update Contact
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Submission meta */}
          <div
            style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid #F5F5F5',
              display: 'flex',
              gap: '24px',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                fontFamily: 'Inter, sans-serif',
                color: '#6B7280',
                fontSize: '13px',
              }}
            >
              <Tag size={14} color="#9CA3AF" />
              <span style={{ textTransform: 'capitalize' }}>
                {formatServiceType(submission.form_data?.service_type)}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                fontFamily: 'Inter, sans-serif',
                color: '#6B7280',
                fontSize: '13px',
              }}
            >
              <Clock size={14} color="#9CA3AF" />
              <span>Submitted {fmtDateTime(submission.created_at)}</span>
            </div>

            {imageUrls.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  fontFamily: 'Inter, sans-serif',
                  color: '#6B7280',
                  fontSize: '13px',
                }}
              >
                <Camera size={14} color="#9CA3AF" />
                <span>
                  {imageUrls.length} photo{imageUrls.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Left column */}
          <div>
            {/* AI Assessment */}
            <div
              className="rounded-2xl border p-6 mb-4 shadow-sm"
              style={{ background: 'white', borderColor: '#E5E7EB' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Sparkles size={16} color="#8B2FC9" />
                  <span
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      color: '#0D0D0D',
                      fontWeight: 700,
                      fontSize: '17px',
                    }}
                  >
                    AI Assessment
                  </span>
                </div>

                {/* Toggle */}
                <div
                  style={{
                    display: 'flex',
                    gap: '4px',
                    background: '#F3F4F6',
                    padding: '4px',
                    borderRadius: '9999px',
                  }}
                >
                  {(['operator', 'customer'] as const).map(r => (
                    <button
                      key={r}
                      onClick={() => setActiveReport(r)}
                      style={{
                        background: activeReport === r ? 'white' : 'transparent',
                        color: activeReport === r ? '#0D0D0D' : '#6B7280',
                        boxShadow: activeReport === r ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px',
                        fontWeight: 500,
                        padding: '6px 12px',
                        borderRadius: '9999px',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {r === 'operator' ? 'Operator' : 'Customer'}
                    </button>
                  ))}
                </div>
              </div>

              <div
                style={{
                  background: '#F9F9F9',
                  borderRadius: '12px',
                  padding: '20px',
                }}
              >
                {activeReport === 'operator' ? (
                  <>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: '#6B7280',
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '12px',
                      }}
                    >
                      Internal — not shared with customer
                    </p>
                    {submission.operator_report ? (
                      <p
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          color: '#4A4A4A',
                          fontSize: '14px',
                          lineHeight: 1.8,
                          whiteSpace: 'pre-wrap',
                          margin: 0,
                        }}
                      >
                        {submission.operator_report}
                      </p>
                    ) : (
                      <p
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          color: '#9CA3AF',
                          fontSize: '14px',
                          margin: 0,
                        }}
                      >
                        Assessment not yet generated.
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: '#6B7280',
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '12px',
                      }}
                    >
                      Sent to customer
                    </p>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: '#4A4A4A',
                        fontSize: '14px',
                        lineHeight: 1.8,
                        whiteSpace: 'pre-wrap',
                        margin: 0,
                      }}
                    >
                      {submission.customer_report ?? ''}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Photos */}
            {imageUrls.length > 0 && (
              <div
                className="rounded-2xl border p-6 mb-4 shadow-sm"
                style={{ background: 'white', borderColor: '#E5E7EB' }}
              >
                <p style={sectionLabel}>Photos ({imageUrls.length})</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {imageUrls.map((url, i) => (
                    <div
                      key={i}
                      className="rounded-xl overflow-hidden"
                      style={{
                        aspectRatio: '1',
                        background: '#F3F4F6',
                        cursor: 'pointer',
                      }}
                      onClick={() => window.open(url)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Photo ${i + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Job Details */}
            <div
              className="rounded-2xl border p-6 mb-4 shadow-sm"
              style={{ background: 'white', borderColor: '#E5E7EB' }}
            >
              <p style={sectionLabel}>Job Details</p>
              <div>
                {jobRows.map((row, i) => (
                  <div
                    key={row.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems:
                        row.noteStyle && row.value !== '—' ? 'flex-start' : 'center',
                      padding: '12px 0',
                      borderBottom:
                        i < jobRows.length - 1 ? '1px solid #F5F5F5' : 'none',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: '#6B7280',
                        fontSize: '13px',
                        fontWeight: 500,
                      }}
                    >
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: row.noteStyle && row.value !== '—' ? '#4A4A4A' : '#0D0D0D',
                        fontSize: '13px',
                        fontWeight: row.noteStyle && row.value !== '—' ? 400 : 600,
                        textAlign: 'right',
                        textTransform: 'capitalize',
                        lineHeight: row.noteStyle && row.value !== '—' ? 1.6 : 'normal',
                        maxWidth: '55%',
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div>
            {/* Notes */}
            <div
              className="rounded-2xl border p-5 mb-4 shadow-sm"
              style={{ background: 'white', borderColor: '#E5E7EB' }}
            >
              <p style={{ ...sectionLabel, marginBottom: '12px' }}>Your Notes</p>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                onFocus={e => {
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${tenant.primary_color}`
                }}
                onBlur={e => {
                  e.currentTarget.style.boxShadow = 'none'
                  saveNotes()
                }}
                rows={6}
                placeholder="Add notes — quotes discussed, follow-up plans, anything relevant..."
                style={{
                  width: '100%',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  resize: 'none',
                  outline: 'none',
                  boxSizing: 'border-box',
                  display: 'block',
                }}
              />
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  marginTop: '4px',
                  textAlign: 'right',
                  color: savingNotes ? '#9CA3AF' : savedNotes ? '#16A34A' : 'transparent',
                  userSelect: 'none',
                }}
              >
                {savingNotes ? 'Saving...' : savedNotes ? 'Saved ✓' : '·'}
              </p>
            </div>

            {/* Lead Info */}
            <div
              className="rounded-2xl border p-5 shadow-sm"
              style={{ background: 'white', borderColor: '#E5E7EB' }}
            >
              <p style={{ ...sectionLabel, marginBottom: '12px' }}>Lead Info</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: '#6B7280',
                      fontSize: '13px',
                    }}
                  >
                    Submitted
                  </span>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: '#0D0D0D',
                      fontSize: '13px',
                      fontWeight: 500,
                      textAlign: 'right',
                      maxWidth: '60%',
                    }}
                  >
                    {fmtDateTime(submission.created_at)}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: '#6B7280',
                      fontSize: '13px',
                    }}
                  >
                    Status
                  </span>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: status === 'new' ? '#E24B4A' : '#16A34A',
                      fontSize: '13px',
                      fontWeight: 500,
                      textAlign: 'right',
                    }}
                  >
                    {status === 'new' ? 'New Lead' : 'Contacted'}
                  </span>
                </div>

                {contactedAt && (
                  <>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          color: '#6B7280',
                          fontSize: '13px',
                        }}
                      >
                        Contacted On
                      </span>
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          color: '#0D0D0D',
                          fontSize: '13px',
                          fontWeight: 500,
                          textAlign: 'right',
                          maxWidth: '60%',
                        }}
                      >
                        {fmtDate(contactedAt)}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          color: '#6B7280',
                          fontSize: '13px',
                        }}
                      >
                        Via
                      </span>
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          color: '#0D0D0D',
                          fontSize: '13px',
                          fontWeight: 500,
                          textAlign: 'right',
                          maxWidth: '60%',
                        }}
                      >
                        {contactMethod_saved === 'phone' ? '📞 Phone call' : '✉️ Email'}
                      </span>
                    </div>
                  </>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: '#6B7280',
                      fontSize: '13px',
                    }}
                  >
                    Photos
                  </span>
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: '#0D0D0D',
                      fontSize: '13px',
                      fontWeight: 500,
                      textAlign: 'right',
                      maxWidth: '60%',
                    }}
                  >
                    {imageUrls.length} submitted
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 16px',
          }}
          onClick={() => setShowContactModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
              padding: '24px',
              maxWidth: '384px',
              width: '100%',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ marginBottom: '20px' }}>
              <p
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  color: '#0D0D0D',
                  fontWeight: 700,
                  fontSize: '18px',
                  marginBottom: '4px',
                }}
              >
                Log Contact
              </p>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#6B7280',
                  fontSize: '14px',
                }}
              >
                How did you reach {submission.customer_name}?
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'Inter, sans-serif',
                  color: '#4A4A4A',
                  fontSize: '13px',
                  fontWeight: 500,
                  marginBottom: '6px',
                }}
              >
                Date contacted
              </label>
              <input
                type="date"
                value={contactDate}
                onChange={e => setContactDate(e.target.value)}
                style={{
                  display: 'block',
                  width: '100%',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  color: '#0D0D0D',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'Inter, sans-serif',
                  color: '#4A4A4A',
                  fontSize: '13px',
                  fontWeight: 500,
                  marginBottom: '8px',
                }}
              >
                Contact method
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {(['phone', 'email'] as const).map(m => {
                  const selected = contactMethod === m
                  return (
                    <button
                      key={m}
                      onClick={() => setContactMethod(m)}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        borderRadius: '12px',
                        border: `1px solid ${selected ? tenant.primary_color : '#E5E7EB'}`,
                        background: selected ? tenant.primary_color : 'white',
                        color: selected ? 'white' : '#4A4A4A',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      {m === 'phone' ? '📞 Phone' : '✉️ Email'}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowContactModal(false)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  background: 'white',
                  color: '#4A4A4A',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveContact}
                disabled={!contactMethod || savingContact}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: !contactMethod || savingContact ? '#E5E7EB' : tenant.primary_color,
                  color: !contactMethod || savingContact ? '#9CA3AF' : 'white',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: !contactMethod || savingContact ? 'not-allowed' : 'pointer',
                }}
              >
                {savingContact ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
