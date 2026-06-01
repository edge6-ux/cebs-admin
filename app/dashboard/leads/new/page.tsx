'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Sparkles } from 'lucide-react'

const fieldStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #E5E7EB',
  borderRadius: '12px',
  padding: '12px 16px',
  fontFamily: 'var(--font-inter), sans-serif',
  fontSize: '14px',
  outline: 'none',
  transition: 'all 150ms',
}

const fieldClass = 'bg-white text-[#0D0D0D]'

function Label({ children, required }: { children: string; required?: boolean }) {
  return (
    <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '13px' }}>
      {children}
      {required && <span style={{ color: '#E24B4A' }}> *</span>}
    </label>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p
      className="font-body uppercase pb-3 mb-5"
      style={{ color: '#6B7280', fontSize: '11px', letterSpacing: '0.08em', borderBottom: '1px solid #F5F5F5' }}
    >
      {children}
    </p>
  )
}

function Field({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

const focusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.outline = 'none'
    e.currentTarget.style.boxShadow = '0 0 0 2px #8B2FC9'
    e.currentTarget.style.borderColor = '#8B2FC9'
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.boxShadow = 'none'
    e.currentTarget.style.borderColor = '#E5E7EB'
  },
}

export default function NewLeadPage() {
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [industry, setIndustry] = useState('')
  const [monthlySpend, setMonthlySpend] = useState('')
  const [challenge, setChallenge] = useState('')
  const [source, setSource] = useState('')
  const [referredBy, setReferredBy] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [notes, setNotes] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(runAnalysis: boolean) {
    setError(null)
    setSaving(true)

    const hearAboutUs = source === 'Referral' && referredBy
      ? `Referral from ${referredBy}`
      : source

    try {
      const res = await fetch('/api/admin/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          businessName,
          email,
          phone,
          industry,
          monthlySpend,
          challenge,
          hearAboutUs,
          assignedTo,
          notes,
          runAnalysis,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to create lead')
      }

      const { id } = await res.json()
      router.push(`/dashboard/leads/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <Link
        href="/dashboard/leads"
        className="inline-flex items-center gap-1 font-body mb-6 transition-colors hover:text-[#0D0D0D]"
        style={{ color: '#6B7280', fontSize: '14px' }}
      >
        <ChevronLeft size={16} />
        Back to Leads
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '22px' }}>
          Add Lead
        </h1>
        <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '14px' }}>
          Manually create a lead from a phone call, referral, or direct outreach.
        </p>
      </div>

      {/* Form card */}
      <div
        className="bg-white rounded-2xl p-8 shadow-sm space-y-6"
        style={{ border: '1px solid #E5E7EB' }}
      >
        {/* Section 1 — Contact Info */}
        <div>
          <SectionLabel>Contact Information</SectionLabel>
          <div className="space-y-4">
            <Field>
              <Label required>Full Name</Label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Smith"
                required
                className={fieldClass}
                style={fieldStyle}
                {...focusHandlers}
              />
            </Field>

            <Field>
              <Label required>Business Name</Label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Smith's Auto Repair"
                required
                className={fieldClass}
                style={fieldStyle}
                {...focusHandlers}
              />
            </Field>

            <Field>
              <Label required>Email Address</Label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@smithsauto.com"
                required
                className={fieldClass}
                style={fieldStyle}
                {...focusHandlers}
              />
            </Field>

            <Field>
              <Label>Phone Number</Label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 000-0000"
                className={fieldClass}
                style={fieldStyle}
                {...focusHandlers}
              />
              <p className="font-body mt-1" style={{ color: '#9CA3AF', fontSize: '12px' }}>
                Optional
              </p>
            </Field>
          </div>
        </div>

        {/* Section 2 — Business Details */}
        <div>
          <SectionLabel>Business Details</SectionLabel>
          <div className="space-y-4">
            <Field>
              <Label>Industry</Label>
              <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={fieldClass} style={fieldStyle} {...focusHandlers}>
                <option value="">Select industry</option>
                <option>Trades &amp; Contractors</option>
                <option>Restaurants &amp; Hospitality</option>
                <option>Home Services</option>
                <option>Local Retail</option>
                <option>Auto Services</option>
                <option>Health &amp; Wellness</option>
                <option>Professional Services</option>
                <option>Other</option>
              </select>
            </Field>

            <Field>
              <Label>Monthly Software Spend</Label>
              <select value={monthlySpend} onChange={(e) => setMonthlySpend(e.target.value)} className={fieldClass} style={fieldStyle} {...focusHandlers}>
                <option value="">Select range</option>
                <option>Under $500/month</option>
                <option>$500–$1,000/month</option>
                <option>$1,000–$2,000/month</option>
                <option>$2,000–$5,000/month</option>
                <option>$5,000+/month</option>
                <option>Unknown</option>
              </select>
            </Field>

            <Field>
              <Label required>Their Challenge</Label>
              <textarea
                rows={4}
                value={challenge}
                onChange={(e) => setChallenge(e.target.value)}
                placeholder="What pain points did they describe? What are they struggling with right now?"
                required
                className={`${fieldClass} resize-none`}
                style={fieldStyle}
                {...focusHandlers}
              />
            </Field>
          </div>
        </div>

        {/* Section 3 — Lead Source */}
        <div>
          <SectionLabel>Lead Source</SectionLabel>
          <div className="space-y-4">
            <Field>
              <Label>Source</Label>
              <select value={source} onChange={(e) => setSource(e.target.value)} className={fieldClass} style={fieldStyle} {...focusHandlers}>
                <option value="">Select source</option>
                <option>Referral</option>
                <option>Cold Outreach</option>
                <option>Google Search</option>
                <option>Social Media</option>
                <option>Networking Event</option>
                <option>Existing Client</option>
                <option>Other</option>
              </select>

              {source === 'Referral' && (
                <div className="mt-3">
                  <Label>Referred by</Label>
                  <input
                    type="text"
                    value={referredBy}
                    onChange={(e) => setReferredBy(e.target.value)}
                    placeholder="Who referred them?"
                    className={fieldClass}
                    style={fieldStyle}
                    {...focusHandlers}
                  />
                </div>
              )}
            </Field>

            <Field>
              <Label>Assign To</Label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Team member handling this lead"
                className={fieldClass}
                style={fieldStyle}
                {...focusHandlers}
              />
            </Field>

            <Field>
              <Label>Notes</Label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything else worth noting..."
                className={`${fieldClass} resize-none`}
                style={fieldStyle}
                {...focusHandlers}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div
        className="sticky bottom-0 bg-white px-8 py-4 mt-8 flex items-center justify-between"
        style={{ borderTop: '1px solid #E5E7EB' }}
      >
        <Link
          href="/dashboard/leads"
          className="font-body transition-opacity hover:opacity-70"
          style={{ color: '#6B7280', fontSize: '14px' }}
        >
          Cancel
        </Link>

        <div className="flex items-center gap-3">
          {error && (
            <p className="font-body" style={{ color: '#E24B4A', fontSize: '13px' }}>
              {error}
            </p>
          )}

          <button
            onClick={() => handleSubmit(false)}
            disabled={saving}
            className="font-body rounded-xl px-5 py-2.5 transition-colors disabled:opacity-60 bg-white text-[#4A4A4A]"
            style={{ border: '1px solid #E5E7EB', fontSize: '14px' }}
          >
            Save Only
          </button>

          <button
            onClick={() => handleSubmit(true)}
            disabled={saving}
            className="flex items-center gap-2 font-heading font-bold uppercase text-white rounded-xl px-5 py-2.5 transition-colors disabled:opacity-60"
            style={{ background: '#8B2FC9', fontSize: '14px' }}
            onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = '#7A28B8' }}
            onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = '#8B2FC9' }}
          >
            {saving ? (
              <>
                <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Creating...
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Save &amp; Run AI Analysis
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
