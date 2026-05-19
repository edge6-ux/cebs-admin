'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Download } from 'lucide-react'
import type { Lead } from '@/lib/types'

const fieldStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #E5E7EB',
  borderRadius: '12px',
  padding: '12px 16px',
  fontFamily: 'var(--font-inter), sans-serif',
  fontSize: '14px',
  color: '#0D0D0D',
  background: 'white',
  outline: 'none',
  transition: 'all 150ms',
}

const focusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.boxShadow = '0 0 0 2px #8B2FC9'
    e.currentTarget.style.borderColor = '#8B2FC9'
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.boxShadow = 'none'
    e.currentTarget.style.borderColor = '#E5E7EB'
  },
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

function Label({ children }: { children: string }) {
  return (
    <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '13px' }}>
      {children}
    </label>
  )
}

function SaveRow({ saved, label, onSave }: { saved: boolean; label: string; onSave: () => void }) {
  return (
    <div className="flex items-center justify-end gap-3 mt-5">
      {saved && (
        <span className="font-body" style={{ color: '#16A34A', fontSize: '13px' }}>Saved ✓</span>
      )}
      <button
        type="button"
        onClick={onSave}
        className="font-body font-medium text-white rounded-xl px-5 py-2.5 transition-opacity hover:opacity-90"
        style={{ background: '#8B2FC9', fontSize: '14px' }}
      >
        {label}
      </button>
    </div>
  )
}

function DollarInput({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="relative">
      <span
        className="absolute font-body pointer-events-none"
        style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', fontSize: '14px' }}
      >
        $
      </span>
      <input
        type="number"
        min={0}
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ...fieldStyle, paddingLeft: '28px' }}
        {...focusHandlers}
      />
    </div>
  )
}

type BusinessInfo = {
  name: string
  email: string
  phone: string
  website: string
}

type Pricing = {
  optimizeLow: number
  optimizeHigh: number
  buildLow: number
  buildHigh: number
  retainerLow: number
  retainerHigh: number
}

const TEAM = [
  { initials: 'E',  name: 'Edge',           role: 'Technology & Product' },
  { initials: 'RK', name: 'Richard Kingan',  role: 'Business Development' },
  { initials: 'CK', name: 'Cara Kingan',     role: 'Operations' },
]

const OWNER_BADGE = { bg: '#EDE9FE', color: '#6D28D9', label: 'Owner' }

function exportLeadsCSV(leads: Lead[]) {
  const headers = [
    'Business Name', 'Full Name', 'Email', 'Phone', 'Industry',
    'Monthly Spend', 'Challenge', 'Status', 'Priority Score',
    'Tier Recommendation', 'Source', 'Submitted',
  ]
  const rows = leads.map((l) => [
    `"${(l.business_name || '').replace(/"/g, '""')}"`,
    `"${(l.full_name || '').replace(/"/g, '""')}"`,
    l.email || '',
    l.phone || '',
    l.industry || '',
    l.monthly_spend || '',
    `"${(l.challenge || '').replace(/"/g, '""')}"`,
    l.status || '',
    l.priority_score || 0,
    l.tier_recommendation || '',
    l.hear_about_us || '',
    l.created_at || '',
  ])
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `cebs-leads-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function SettingsPage() {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: 'Competitive Edge Business Solutions',
    email: 'hello@cuttingedgebs.com',
    phone: '',
    website: 'https://cebs-one.vercel.app',
  })
  const [savedBusiness, setSavedBusiness] = useState(false)

  const [pricing, setPricing] = useState<Pricing>({
    optimizeLow: 1500,
    optimizeHigh: 5000,
    buildLow: 5000,
    buildHigh: 50000,
    retainerLow: 300,
    retainerHigh: 1500,
  })
  const [savedPricing, setSavedPricing] = useState(false)

  const [notifications, setNotifications] = useState({
    newLead: true,
    leadAssigned: true,
    proposalSent: true,
    proposalAccepted: true,
    projectComplete: true,
  })
  const [savedNotifications, setSavedNotifications] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [exportingCSV, setExportingCSV] = useState(false)

  useEffect(() => {
    const savedBI = localStorage.getItem('cebs_business_info')
    if (savedBI) setBusinessInfo(JSON.parse(savedBI))
    const savedP = localStorage.getItem('cebs_pricing')
    if (savedP) setPricing(JSON.parse(savedP))
    const savedN = localStorage.getItem('cebs_notifications')
    if (savedN) setNotifications(JSON.parse(savedN))
  }, [])

  function saveBusiness() {
    localStorage.setItem('cebs_business_info', JSON.stringify(businessInfo))
    setSavedBusiness(true)
    setTimeout(() => setSavedBusiness(false), 2000)
  }

  function savePricing() {
    localStorage.setItem('cebs_pricing', JSON.stringify(pricing))
    setSavedPricing(true)
    setTimeout(() => setSavedPricing(false), 2000)
  }

  function updateBusiness(patch: Partial<BusinessInfo>) {
    setBusinessInfo((prev) => ({ ...prev, ...patch }))
  }

  function updatePricing(patch: Partial<Pricing>) {
    setPricing((prev) => ({ ...prev, ...patch }))
  }

  function saveNotifications() {
    localStorage.setItem('cebs_notifications', JSON.stringify(notifications))
    setSavedNotifications(true)
    setTimeout(() => setSavedNotifications(false), 2000)
  }

  function toggleNotification(key: keyof typeof notifications) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  async function handlePasswordUpdate() {
    if (!currentPassword) { setPasswordError('Enter your current password'); return }
    if (newPassword.length < 8) { setPasswordError('Minimum 8 characters'); return }
    if (newPassword !== confirmPassword) { setPasswordError("Passwords don't match"); return }

    setSavingPassword(true)
    setPasswordError(null)

    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: currentPassword }),
    })

    if (!res.ok) {
      setPasswordError('Incorrect current password')
      setSavingPassword(false)
      return
    }

    setPasswordSuccess(true)
    setSavingPassword(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '22px' }}>
          Settings
        </h1>
        <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '14px' }}>
          Manage admin preferences and account details.
        </p>
      </div>

      {/* Section 1 — Business Info */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
        <SectionLabel>Business Information</SectionLabel>

        <div className="space-y-4">
          <div>
            <Label>Business Name</Label>
            <input
              type="text"
              value={businessInfo.name}
              onChange={(e) => updateBusiness({ name: e.target.value })}
              style={fieldStyle}
              {...focusHandlers}
            />
          </div>

          <div>
            <Label>Contact Email</Label>
            <input
              type="email"
              value={businessInfo.email}
              onChange={(e) => updateBusiness({ email: e.target.value })}
              style={fieldStyle}
              {...focusHandlers}
            />
          </div>

          <div>
            <Label>Phone Number</Label>
            <input
              type="tel"
              value={businessInfo.phone}
              onChange={(e) => updateBusiness({ phone: e.target.value })}
              placeholder="Business phone number"
              style={fieldStyle}
              {...focusHandlers}
            />
          </div>

          <div>
            <Label>Website</Label>
            <input
              type="url"
              value={businessInfo.website}
              onChange={(e) => updateBusiness({ website: e.target.value })}
              style={fieldStyle}
              {...focusHandlers}
            />
          </div>
        </div>

        <SaveRow saved={savedBusiness} label="Save Business Info" onSave={saveBusiness} />
      </div>

      {/* Section 2 — Team Members */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
        <SectionLabel>Team Members</SectionLabel>

        <p className="font-body mb-5" style={{ color: '#6B7280', fontSize: '13px' }}>
          Team members who handle leads and projects.
        </p>

        <div className="space-y-3 mb-4">
          {TEAM.map((member) => {
            const badge = OWNER_BADGE
            return (
              <div
                key={member.initials}
                className="flex items-center gap-4 rounded-xl p-3"
                style={{ background: '#F9F9F9' }}
              >
                <div
                  className="flex items-center justify-center rounded-full flex-shrink-0"
                  style={{ width: '36px', height: '36px', background: '#0D0D0D' }}
                >
                  <span className="font-heading font-bold text-white" style={{ fontSize: '13px' }}>
                    {member.initials}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold" style={{ color: '#0D0D0D', fontSize: '14px' }}>
                    {member.name}
                  </p>
                  <p className="font-body mt-0.5" style={{ color: '#6B7280', fontSize: '12px' }}>
                    {member.role}
                  </p>
                </div>

                <span
                  className="font-body font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{ fontSize: '11px', background: badge.bg, color: badge.color }}
                >
                  {badge.label}
                </span>
              </div>
            )
          })}
        </div>

        <p className="font-body mt-4" style={{ color: '#6B7280', fontSize: '12px' }}>
          Full team management coming in a future update.
        </p>
      </div>

      {/* Section 3 — Pricing Defaults */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
        <SectionLabel>Pricing Defaults</SectionLabel>

        <p className="font-body mb-5" style={{ color: '#6B7280', fontSize: '13px' }}>
          Starting values shown in the proposal builder. Adjustable per engagement.
        </p>

        <div className="space-y-4">
          {/* Audit — disabled */}
          <div>
            <Label>Audit &amp; Strategy</Label>
            <p className="font-body mb-1" style={{ color: '#6B7280', fontSize: '12px' }}>
              Always free — entry point for all engagements
            </p>
            <input
              type="text"
              value="Free"
              disabled
              style={{ ...fieldStyle, background: '#F9F9F9', cursor: 'not-allowed', opacity: 0.6 }}
            />
          </div>

          <div>
            <Label>Optimize — From</Label>
            <DollarInput value={pricing.optimizeLow} onChange={(v) => updatePricing({ optimizeLow: v })} />
          </div>

          <div>
            <Label>Optimize — To</Label>
            <DollarInput value={pricing.optimizeHigh} onChange={(v) => updatePricing({ optimizeHigh: v })} />
          </div>

          <div>
            <Label>Build — From</Label>
            <DollarInput value={pricing.buildLow} onChange={(v) => updatePricing({ buildLow: v })} />
          </div>

          <div>
            <Label>Build — To</Label>
            <DollarInput value={pricing.buildHigh} onChange={(v) => updatePricing({ buildHigh: v })} />
          </div>

          <div>
            <Label>Monthly Retainer — From</Label>
            <DollarInput value={pricing.retainerLow} onChange={(v) => updatePricing({ retainerLow: v })} />
          </div>

          <div>
            <Label>Monthly Retainer — To</Label>
            <DollarInput value={pricing.retainerHigh} onChange={(v) => updatePricing({ retainerHigh: v })} />
          </div>
        </div>

        <SaveRow saved={savedPricing} label="Save Pricing Defaults" onSave={savePricing} />
      </div>

      {/* Section 4 — Notifications */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
        <SectionLabel>Notifications</SectionLabel>

        <p className="font-body mb-5" style={{ color: '#6B7280', fontSize: '13px' }}>
          Choose what triggers an email notification to the team.
        </p>

        <div className="space-y-5">
          {([
            { key: 'newLead',          label: 'New Lead',           desc: 'When a consultation request is submitted via the website' },
            { key: 'leadAssigned',     label: 'Lead Assigned',      desc: 'When a lead is assigned to a team member' },
            { key: 'proposalSent',     label: 'Proposal Sent',      desc: 'When a proposal is marked as sent to a client' },
            { key: 'proposalAccepted', label: 'Proposal Accepted',  desc: 'When a client accepts a proposal' },
            { key: 'projectComplete',  label: 'Project Complete',   desc: 'When a project is marked as complete' },
          ] as { key: keyof typeof notifications; label: string; desc: string }[]).map(({ key, label, desc }) => {
            const on = notifications[key]
            return (
              <div key={key} className="flex items-center justify-between">
                <div className="mr-4">
                  <p className="font-body font-medium" style={{ color: '#0D0D0D', fontSize: '14px' }}>{label}</p>
                  <p className="font-body mt-0.5" style={{ color: '#6B7280', fontSize: '13px' }}>{desc}</p>
                </div>

                <div
                  className="relative flex-shrink-0 cursor-pointer"
                  style={{ width: '44px', height: '24px', borderRadius: '9999px', background: on ? '#8B2FC9' : '#D1D5DB', transition: 'background 150ms' }}
                  onClick={() => toggleNotification(key)}
                >
                  <div
                    style={{
                      position: 'absolute',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'white',
                      top: '2px',
                      transform: on ? 'translateX(22px)' : 'translateX(2px)',
                      transition: 'transform 150ms',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <SaveRow saved={savedNotifications} label="Save Preferences" onSave={saveNotifications} />
      </div>

      {/* Section 5 — Admin Password */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
        <SectionLabel>Admin Password</SectionLabel>

        <p className="font-body mb-5" style={{ color: '#6B7280', fontSize: '13px' }}>
          Update the password used to access this dashboard.
        </p>

        <div className="space-y-4">
          <div>
            <Label>Current Password</Label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={fieldStyle}
              {...focusHandlers}
            />
          </div>

          <div>
            <Label>New Password</Label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={fieldStyle}
              {...focusHandlers}
            />
            <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '12px' }}>Minimum 8 characters</p>
          </div>

          <div>
            <Label>Confirm New Password</Label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={fieldStyle}
              {...focusHandlers}
            />
            {confirmPassword.length > 0 && confirmPassword !== newPassword && (
              <p className="font-body mt-1" style={{ color: '#E24B4A', fontSize: '12px' }}>Passwords don&apos;t match</p>
            )}
          </div>
        </div>

        {passwordError && (
          <p className="font-body mt-2" style={{ color: '#E24B4A', fontSize: '13px' }}>{passwordError}</p>
        )}

        {passwordSuccess && (
          <div className="flex items-start gap-2 mt-3 px-4 py-3 rounded-xl" style={{ background: '#FEF3C7' }}>
            <AlertTriangle size={16} style={{ color: '#92400E', flexShrink: 0, marginTop: '2px' }} />
            <p className="font-body" style={{ color: '#92400E', fontSize: '13px', lineHeight: '1.5' }}>
              Password verified. To make this permanent update <strong>ADMIN_PASSWORD</strong> in your Vercel environment variables.
            </p>
          </div>
        )}

        <div className="flex justify-end mt-5">
          <button
            type="button"
            onClick={handlePasswordUpdate}
            disabled={savingPassword}
            className="font-body font-medium text-white rounded-xl px-5 py-2.5 transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: '#8B2FC9', fontSize: '14px' }}
          >
            {savingPassword ? 'Verifying...' : 'Update Password'}
          </button>
        </div>
      </div>

      {/* Section 6 — Danger Zone */}
      <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1.5px solid #FCEBEB' }}>
        <p
          className="font-body uppercase pb-3 mb-5"
          style={{ color: '#E24B4A', fontSize: '11px', letterSpacing: '0.08em', borderBottom: '1px solid #FCEBEB' }}
        >
          Data
        </p>

        {/* Export row */}
        <div className="flex items-center justify-between pb-5" style={{ borderBottom: '1px solid #FEE2E2' }}>
          <div>
            <p className="font-body font-semibold" style={{ color: '#0D0D0D', fontSize: '14px' }}>Export Leads</p>
            <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '13px' }}>Download all leads as a CSV file.</p>
          </div>

          <button
            type="button"
            disabled={exportingCSV}
            onClick={async () => {
              setExportingCSV(true)
              try {
                const res = await fetch('/api/admin/leads')
                const leads = await res.json()
                exportLeadsCSV(leads as Lead[])
              } finally {
                setExportingCSV(false)
              }
            }}
            className="flex items-center gap-2 font-body rounded-xl px-4 py-2 transition-colors disabled:opacity-60 flex-shrink-0 ml-4"
            style={{ background: 'white', border: '1px solid #E5E7EB', fontSize: '13px', color: '#4A4A4A', cursor: 'pointer' }}
            onMouseEnter={(e) => { if (!exportingCSV) { e.currentTarget.style.borderColor = '#8B2FC9'; e.currentTarget.style.color = '#8B2FC9' } }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#4A4A4A' }}
          >
            <Download size={14} />
            {exportingCSV ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>

        {/* Clear test data row */}
        <div className="flex items-center justify-between mt-5">
          <div>
            <p className="font-body font-semibold" style={{ color: '#0D0D0D', fontSize: '14px' }}>Clear Test Data</p>
            <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '13px' }}>Remove leads marked as test entries.</p>
          </div>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="font-body rounded-xl px-4 py-2 transition-colors flex-shrink-0 ml-4"
            style={{ background: 'white', border: '1px solid #E24B4A', fontSize: '13px', color: '#E24B4A', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#FCEBEB' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'white' }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Confirm modal */}
      {showClearConfirm && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.5)', zIndex: 200 }}
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full shadow-xl"
            style={{ maxWidth: '400px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading font-bold mb-2" style={{ color: '#0D0D0D', fontSize: '18px' }}>
              Are you sure?
            </h2>
            <p className="font-body mb-6" style={{ color: '#6B7280', fontSize: '14px', lineHeight: '1.6' }}>
              This will permanently delete leads marked as test entries. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 font-body rounded-xl py-2.5 transition-colors"
                style={{ background: 'white', border: '1px solid #E5E7EB', fontSize: '14px', color: '#4A4A4A', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowClearConfirm(false)
                  console.log('Clear test data — coming soon')
                }}
                className="flex-1 font-body font-semibold text-white rounded-xl py-2.5 transition-colors"
                style={{ background: '#E24B4A', fontSize: '14px', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#C53030' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#E24B4A' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
