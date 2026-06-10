'use client'

import { useState } from 'react'
import { useTenantBranding } from './TenantBrandingContext'

interface TenantConfigProps {
  id: string
  business_name: string
  primary_color: string
  logo_url: string | null
  notification_email: string
  cta_text: string | null
  retainer_amount: number | null
  billing_cycle: string | null
  next_billing_date: string | null
  notes: string | null
}

interface Props {
  tenant: TenantConfigProps
}

const inputStyle: React.CSSProperties = {
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
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'Inter, sans-serif',
  color: '#4A4A4A',
  fontSize: '13px',
  fontWeight: 500,
  marginBottom: '6px',
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

export default function TenantConfiguration({ tenant }: Props) {
  const { setPrimaryColor: setContextColor, setCtaText: setContextCtaText } = useTenantBranding()
  const [businessName, setBusinessName] = useState(tenant.business_name)
  const [primaryColor, setPrimaryColor] = useState(tenant.primary_color)
  const [logoUrl, setLogoUrl] = useState(tenant.logo_url ?? '')
  const [notificationEmail, setNotificationEmail] = useState(tenant.notification_email)
  const [ctaText, setCtaText] = useState(tenant.cta_text ?? '')
  const [retainerAmount, setRetainerAmount] = useState(tenant.retainer_amount ?? 0)
  const [billingCycle, setBillingCycle] = useState(tenant.billing_cycle ?? 'monthly')
  const [nextBillingDate, setNextBillingDate] = useState(tenant.next_billing_date ?? '')
  const [notes, setNotes] = useState(tenant.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/products/field-assessment/tenants/${tenant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: businessName,
          primary_color: primaryColor,
          logo_url: logoUrl || null,
          notification_email: notificationEmail,
          cta_text: ctaText || null,
          retainer_amount: retainerAmount,
          billing_cycle: billingCycle,
          next_billing_date: nextBillingDate || null,
          notes,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setError('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="rounded-2xl border p-5 mb-4 shadow-sm"
      style={{ background: 'white', borderColor: '#E5E7EB' }}
    >
      <p style={sectionLabel}>Configuration</p>

      <div className="space-y-4">
        <div>
          <label style={labelStyle}>Business Name</label>
          <input
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Brand Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={primaryColor}
              onChange={e => { setPrimaryColor(e.target.value); setContextColor(e.target.value) }}
              style={{
                width: '48px',
                height: '40px',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                padding: '4px',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            />
            <input
              value={primaryColor}
              onChange={e => { setPrimaryColor(e.target.value); setContextColor(e.target.value) }}
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Logo URL</label>
          <input
            type="url"
            value={logoUrl}
            onChange={e => setLogoUrl(e.target.value)}
            style={inputStyle}
          />
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="Logo preview"
              style={{ height: '32px', objectFit: 'contain', marginTop: '8px' }}
            />
          )}
        </div>

        <div>
          <label style={labelStyle}>Notification Email</label>
          <input
            type="email"
            value={notificationEmail}
            onChange={e => setNotificationEmail(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Button Text</label>
          <input
            value={ctaText}
            onChange={e => { setCtaText(e.target.value); setContextCtaText(e.target.value) }}
            placeholder="Get a Free Estimate"
            style={inputStyle}
          />
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              color: '#9CA3AF',
              marginTop: '4px',
            }}
          >
            The call to action text on their website button
          </p>
        </div>

        <div>
          <label style={labelStyle}>Monthly Retainer</label>
          <div style={{ position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                color: '#6B7280',
                pointerEvents: 'none',
              }}
            >
              $
            </span>
            <input
              type="number"
              min={0}
              value={retainerAmount}
              onChange={e => setRetainerAmount(Number(e.target.value))}
              style={{ ...inputStyle, paddingLeft: '28px' }}
            />
          </div>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              color: '#9CA3AF',
              marginTop: '4px',
            }}
          >
            0 if no retainer
          </p>
        </div>

        <div>
          <label style={labelStyle}>Billing Cycle</label>
          <select
            value={billingCycle}
            onChange={e => setBillingCycle(e.target.value)}
            style={{ ...inputStyle, appearance: 'auto' } as React.CSSProperties}
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annual">Annual</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Next Billing Date</label>
          <input
            type="date"
            value={nextBillingDate}
            onChange={e => setNextBillingDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Internal Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Contract notes, special arrangements..."
            style={{ ...inputStyle, resize: 'none' }}
          />
        </div>
      </div>

      {error && (
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            color: '#E24B4A',
            fontSize: '13px',
            marginTop: '8px',
          }}
        >
          {error}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          display: 'block',
          width: '100%',
          background: '#8B2FC9',
          color: 'white',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          fontWeight: 500,
          padding: '10px 20px',
          borderRadius: '12px',
          border: 'none',
          marginTop: '8px',
          cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>

      {saved && (
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            color: '#16A34A',
            fontSize: '13px',
            marginTop: '8px',
            textAlign: 'center',
          }}
        >
          Saved ✓
        </p>
      )}
    </div>
  )
}
