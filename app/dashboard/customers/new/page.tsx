'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

const INDUSTRIES = [
  'Retail',
  'Restaurant / Food & Beverage',
  'Health & Wellness',
  'Real Estate',
  'Construction / Trades',
  'Professional Services',
  'Beauty / Personal Care',
  'Fitness',
  'Technology',
  'Education',
  'Non-Profit',
  'Other',
]

const inputClass =
  'w-full font-body bg-white rounded-xl px-4 py-2.5 outline-none transition-colors'
const inputStyle = {
  border: '1px solid #E5E7EB',
  color: '#0D0D0D',
  fontSize: '14px',
}
const labelStyle = {
  color: '#4A4A4A',
  fontSize: '13px',
  fontWeight: 500,
  marginBottom: '6px',
  display: 'block' as const,
}

export default function NewCustomerPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    business_name: '',
    contact_name: '',
    email: '',
    phone: '',
    industry: '',
    website: '',
    notes: '',
  })

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.business_name || !form.contact_name || !form.email) return

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.status === 409) {
        setError('A customer with this email already exists.')
        return
      }

      if (!res.ok) {
        setError('Something went wrong. Please try again.')
        return
      }

      const customer = await res.json()
      router.push(`/dashboard/customers/${customer.id}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.push('/dashboard/customers')}
        className="inline-flex items-center gap-1 font-body mb-6 transition-colors hover:text-[#0D0D0D]"
        style={{ color: '#6B7280', fontSize: '14px' }}
      >
        <ChevronLeft size={16} />
        Back to Customers
      </button>

      {/* Header */}
      <p className="font-heading font-bold mb-6" style={{ color: '#0D0D0D', fontSize: '22px' }}>
        Add Customer
      </p>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl p-8 shadow-sm space-y-5" style={{ border: '1px solid #E5E7EB' }}>
          {/* Business name */}
          <div>
            <label style={labelStyle}>Business Name <span style={{ color: '#E24B4A' }}>*</span></label>
            <input
              type="text"
              required
              value={form.business_name}
              onChange={(e) => set('business_name', e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {/* Contact name */}
          <div>
            <label style={labelStyle}>Contact Name <span style={{ color: '#E24B4A' }}>*</span></label>
            <input
              type="text"
              required
              value={form.contact_name}
              onChange={(e) => set('contact_name', e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>Email Address <span style={{ color: '#E24B4A' }}>*</span></label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
            <p className="font-body mt-1.5" style={{ color: '#9CA3AF', fontSize: '12px' }}>
              Must be unique — duplicate emails will return an error
            </p>
          </div>

          {/* Phone */}
          <div>
            <label style={labelStyle}>Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {/* Industry */}
          <div>
            <label style={labelStyle}>Industry</label>
            <select
              value={form.industry}
              onChange={(e) => set('industry', e.target.value)}
              className={inputClass + ' cursor-pointer'}
              style={inputStyle}
            >
              <option value="">Select industry...</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* Website */}
          <div>
            <label style={labelStyle}>Website</label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => set('website', e.target.value)}
              placeholder="https://"
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              className={inputClass}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="font-body" style={{ color: '#E24B4A', fontSize: '13px' }}>
              {error}
            </p>
          )}
        </div>

        {/* Sticky bottom bar */}
        <div
          className="fixed bottom-0 left-0 right-0 md:left-[240px] flex items-center justify-end gap-3 px-6 py-4 bg-white"
          style={{ borderTop: '1px solid #E5E7EB', zIndex: 20 }}
        >
          <button
            type="button"
            onClick={() => router.push('/dashboard/customers')}
            className="font-body px-4 py-2.5 rounded-xl transition-colors hover:bg-gray-50"
            style={{ border: '1px solid #E5E7EB', color: '#4A4A4A', fontSize: '14px' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="font-heading font-bold uppercase rounded-xl px-5 py-2.5 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: '#8B2FC9', fontSize: '14px' }}
          >
            {submitting ? 'Creating...' : 'Create Customer'}
          </button>
        </div>
      </form>

      {/* Space for sticky bar */}
      <div style={{ height: '80px' }} />
    </div>
  )
}
