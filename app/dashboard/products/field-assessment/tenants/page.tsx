'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Building2, Mail, Tag, ClipboardList, Copy, Trash2, RefreshCw } from 'lucide-react'
import { fmtDate } from '@/lib/utils'

const FIELD_APP_URL =
  process.env.NEXT_PUBLIC_FIELD_APP_URL ?? 'https://treeservice-fieldapp.vercel.app'

interface TenantSubmissionCount {
  count: number
}

interface Tenant {
  id: string
  slug: string
  business_name: string
  industry: string
  primary_color: string
  secondary_color: string
  logo_url: string
  notification_email: string
  admin_email: string
  auth_user_id: string
  active: boolean
  deleted_at: string | null
  created_at: string
  updated_at: string
  submissions: TenantSubmissionCount[]
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'Inter, sans-serif',
  color: '#4A4A4A',
  fontSize: '13px',
  fontWeight: 500,
  marginBottom: '6px',
}

const helperStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  color: '#9CA3AF',
  fontSize: '12px',
  marginBottom: '6px',
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

export default function TenantsPage() {
  const router = useRouter()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [deleted, setDeleted] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [businessName, setBusinessName] = useState('')
  const [slug, setSlug] = useState('')
  const [industry, setIndustry] = useState('tree_services')
  const [notificationEmail, setNotificationEmail] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#1C3A2B')
  const [logoUrl, setLogoUrl] = useState('')

  useEffect(() => {
    fetch('/api/admin/products/field-assessment/tenants')
      .then(res => res.json())
      .then(data => {
        setTenants(data.tenants ?? [])
        setDeleted(data.deleted ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleRestore(id: string) {
    const res = await fetch(`/api/admin/products/field-assessment/tenants/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deleted_at: null, active: true }),
    })
    if (res.ok) {
      const restored = await res.json() as Tenant
      setDeleted(prev => prev.filter(t => t.id !== id))
      setTenants(prev => [{ ...restored, submissions: [] }, ...prev])
    }
  }

  async function handleToggleActive(tenant: Tenant) {
    const res = await fetch(`/api/admin/products/field-assessment/tenants/${tenant.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !tenant.active }),
    })
    if (res.ok) {
      const updated = await res.json()
      setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, active: updated.active } : t))
    }
  }

  async function handleCopyLink(tenant: Tenant) {
    await navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_FIELD_APP_URL || 'https://treeservice-fieldapp.vercel.app'}/${tenant.slug}`
    )
    setCopiedId(tenant.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function resetForm() {
    setBusinessName('')
    setSlug('')
    setIndustry('tree_services')
    setNotificationEmail('')
    setAdminEmail('')
    setAdminPassword('')
    setPrimaryColor('#1C3A2B')
    setLogoUrl('')
    setError(null)
  }

  async function handleCreate() {
    if (!businessName || !slug || !notificationEmail || !adminEmail || !adminPassword) {
      setError('All required fields must be filled.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/products/field-assessment/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          business_name: businessName,
          industry,
          primary_color: primaryColor,
          secondary_color: '#C8922A',
          logo_url: logoUrl,
          notification_email: notificationEmail,
          admin_email: adminEmail,
          admin_password: adminPassword,
        }),
      })

      if (res.status === 409) {
        setError('That slug is already taken.')
        setSaving(false)
        return
      }

      if (!res.ok) throw new Error('Failed')

      const newTenant = await res.json()
      setTenants(prev => [newTenant, ...prev])
      setShowNewForm(false)
      resetForm()
    } catch {
      setError('Failed to create tenant. Try again.')
      setSaving(false)
    }
  }

  const totalAssessments = tenants.reduce(
    (sum, t) => sum + (t.submissions?.[0]?.count || 0),
    0
  )

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              color: '#0D0D0D',
              fontWeight: 700,
              fontSize: '22px',
            }}
          >
            Field Assessment Tenants
          </h1>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#6B7280',
              fontSize: '14px',
              marginTop: '4px',
            }}
          >
            {tenants.length} tenants
          </p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{
            background: '#8B2FC9',
            color: 'white',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          }}
        >
          <Plus size={16} />
          New Tenant
        </button>
      </div>

      {/* Stats Row */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[
          { dot: '#10B981', label: 'Active',            count: tenants.filter(t => t.active).length },
          { dot: '#9CA3AF', label: 'Inactive',          count: tenants.filter(t => !t.active).length },
          { dot: '#8B2FC9', label: 'Total Assessments', count: totalAssessments },
        ].map(({ dot, label, count }) => (
          <div
            key={label}
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
              {count}
            </span>
          </div>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="animate-pulse rounded-2xl h-32"
              style={{ background: '#F3F4F6' }}
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && tenants.length === 0 && (
        <div
          className="rounded-2xl border p-12 text-center"
          style={{ background: 'white', borderColor: '#E5E7EB' }}
        >
          <Building2 size={40} style={{ color: '#9CA3AF', margin: '0 auto' }} />
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#9CA3AF',
              fontSize: '15px',
              marginTop: '12px',
            }}
          >
            No tenants yet
          </p>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#9CA3AF',
              fontSize: '13px',
              marginTop: '4px',
            }}
          >
            Create your first tenant to get started.
          </p>
        </div>
      )}

      {/* Tenant Cards */}
      {!loading && tenants.length > 0 && (
        <div className="space-y-4">
          {tenants.map(tenant => {
            const submissionCount = tenant.submissions?.[0]?.count || 0
            const industryLabel = tenant.industry
              .replace(/_/g, ' ')
              .replace(/\b\w/g, c => c.toUpperCase())
            const isCopied = copiedId === tenant.id

            return (
              <div
                key={tenant.id}
                className="rounded-2xl p-5 shadow-sm"
                style={{ background: 'white', border: '1px solid #E5E7EB', cursor: 'pointer' }}
                onClick={() =>
                  router.push(`/dashboard/products/field-assessment/tenants/${tenant.id}`)
                }
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-full flex-shrink-0"
                      style={{
                        width: '12px',
                        height: '12px',
                        background: tenant.primary_color,
                      }}
                    />
                    <div>
                      <p
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          color: '#0D0D0D',
                          fontSize: '15px',
                          fontWeight: 600,
                        }}
                      >
                        {tenant.business_name}
                      </p>
                      <p
                        style={{
                          fontFamily: 'monospace',
                          color: '#9CA3AF',
                          fontSize: '12px',
                          marginTop: '2px',
                        }}
                      >
                        /{tenant.slug}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleToggleActive(tenant) }}
                    className="cursor-pointer px-2.5 py-1 rounded-full"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: tenant.active ? '#D1FAE5' : '#F3F4F6',
                      color: tenant.active ? '#065F46' : '#6B7280',
                    }}
                  >
                    {tenant.active ? 'Active' : 'Inactive'}
                  </button>
                </div>

                {/* Details row */}
                <div className="flex gap-5 flex-wrap mb-4">
                  <span
                    className="flex items-center gap-1.5"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: '#6B7280',
                      fontSize: '12px',
                    }}
                  >
                    <Mail size={12} style={{ color: '#9CA3AF' }} />
                    {tenant.notification_email}
                  </span>
                  <span
                    className="flex items-center gap-1.5"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: '#6B7280',
                      fontSize: '12px',
                    }}
                  >
                    <Tag size={12} style={{ color: '#9CA3AF' }} />
                    {industryLabel}
                  </span>
                  <span
                    className="flex items-center gap-1.5"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: '#6B7280',
                      fontSize: '12px',
                    }}
                  >
                    <ClipboardList size={12} style={{ color: '#9CA3AF' }} />
                    {submissionCount} assessment{submissionCount !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Bottom row */}
                <div
                  className="flex items-center justify-between pt-4"
                  style={{ borderTop: '1px solid #F5F5F5' }}
                >
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: '#9CA3AF',
                      fontSize: '12px',
                    }}
                  >
                    {fmtDate(tenant.created_at)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => { e.stopPropagation(); handleCopyLink(tenant) }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px',
                        color: isCopied ? '#8B2FC9' : '#4A4A4A',
                        background: 'white',
                        border: `1px solid ${isCopied ? '#8B2FC9' : '#E5E7EB'}`,
                        transition: 'all 150ms',
                      }}
                      onMouseEnter={(e) => {
                        if (!isCopied) {
                          e.currentTarget.style.borderColor = '#8B2FC9'
                          e.currentTarget.style.color = '#8B2FC9'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isCopied) {
                          e.currentTarget.style.borderColor = '#E5E7EB'
                          e.currentTarget.style.color = '#4A4A4A'
                        }
                      }}
                    >
                      <Copy size={12} />
                      {isCopied ? 'Copied!' : 'Copy Link'}
                    </button>
                    <a
                      href={`${FIELD_APP_URL}/${tenant.slug}/admin`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: '#8B2FC9',
                        fontSize: '13px',
                        fontWeight: 500,
                        textDecoration: 'none',
                      }}
                    >
                      Open Dashboard →
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Recently Deleted */}
      {deleted.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Trash2 size={16} style={{ color: '#9CA3AF' }} />
            <h2
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                color: '#0D0D0D',
                fontWeight: 700,
                fontSize: '17px',
              }}
            >
              Recently Deleted
            </h2>
            <span
              className="px-2.5 py-1 rounded-full"
              style={{
                background: '#F3F4F6',
                color: '#6B7280',
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {deleted.length}
            </span>
          </div>

          <div className="space-y-3">
            {deleted.map(tenant => {
              const daysLeft = 30 - Math.floor(
                (Date.now() - new Date(tenant.deleted_at!).getTime()) / (1000 * 60 * 60 * 24)
              )
              return (
                <div
                  key={tenant.id}
                  className="rounded-2xl p-5"
                  style={{
                    background: '#F9F9F9',
                    border: '1px solid #E5E7EB',
                    opacity: 0.7,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          color: '#4A4A4A',
                          fontSize: '15px',
                          fontWeight: 600,
                          marginBottom: '4px',
                        }}
                      >
                        {tenant.business_name}
                      </p>
                      <p
                        style={{
                          fontFamily: 'monospace',
                          color: '#9CA3AF',
                          fontSize: '12px',
                        }}
                      >
                        /{tenant.slug}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className="px-2.5 py-1 rounded-full"
                        style={{
                          background: '#FCEBEB',
                          color: '#E24B4A',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '11px',
                          fontWeight: 600,
                        }}
                      >
                        Deleted
                      </span>
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          color: '#9CA3AF',
                          fontSize: '11px',
                          marginTop: '4px',
                        }}
                      >
                        {daysLeft} day{daysLeft !== 1 ? 's' : ''} until permanent deletion
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between mt-3 pt-3"
                    style={{ borderTop: '1px solid #E5E7EB' }}
                  >
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: '#9CA3AF',
                        fontSize: '12px',
                      }}
                    >
                      Deleted {fmtDate(tenant.deleted_at!)}
                    </span>
                    <button
                      onClick={() => handleRestore(tenant.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                      style={{
                        background: 'white',
                        border: '1px solid #E5E7EB',
                        color: '#4A4A4A',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 150ms',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#8B2FC9'
                        e.currentTarget.style.color = '#8B2FC9'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#E5E7EB'
                        e.currentTarget.style.color = '#4A4A4A'
                      }}
                    >
                      <RefreshCw size={12} />
                      Restore
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* New Tenant Modal */}
      {showNewForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowNewForm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full overflow-y-auto"
            style={{ maxWidth: '512px', maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: '1px solid #F5F5F5' }}
            >
              <h2
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  color: '#0D0D0D',
                  fontWeight: 700,
                  fontSize: '18px',
                }}
              >
                New Tenant
              </h2>
              <button
                onClick={() => setShowNewForm(false)}
                style={{
                  color: '#9CA3AF',
                  fontSize: '22px',
                  cursor: 'pointer',
                  lineHeight: 1,
                  background: 'none',
                  border: 'none',
                }}
              >
                ×
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-5 space-y-4">
              {/* Business Name */}
              <div>
                <label style={labelStyle}>Business Name</label>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Smith's Tree Service"
                  style={inputStyle}
                />
              </div>

              {/* Slug */}
              <div>
                <label style={labelStyle}>URL Slug</label>
                <p style={helperStyle}>Lowercase, hyphens only e.g. smiths-tree</p>
                <input
                  value={slug}
                  onChange={(e) =>
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^a-z0-9-]/g, '')
                    )
                  }
                  placeholder="smiths-tree"
                  style={inputStyle}
                />
              </div>

              {/* Industry */}
              <div>
                <label style={labelStyle}>Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  style={{ ...inputStyle, appearance: 'auto' }}
                >
                  <option value="tree_services">Tree Services</option>
                </select>
              </div>

              {/* Notification Email */}
              <div>
                <label style={labelStyle}>Notification Email</label>
                <p style={helperStyle}>New assessment alerts sent here</p>
                <input
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Admin Email */}
              <div>
                <label style={labelStyle}>Operator Login Email</label>
                <p style={helperStyle}>Email used to log into the dashboard</p>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Admin Password */}
              <div>
                <label style={labelStyle}>Operator Password</label>
                <p style={helperStyle}>Initial password for the operator dashboard</p>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Primary Color */}
              <div>
                <label style={labelStyle}>Brand Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{
                      width: '48px',
                      height: '40px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      padding: '4px',
                      cursor: 'pointer',
                    }}
                  />
                  <input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#1C3A2B"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                </div>
              </div>

              {/* Logo URL */}
              <div>
                <label style={labelStyle}>Logo URL</label>
                <p style={helperStyle}>Optional</p>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  style={inputStyle}
                />
              </div>

              {error && (
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: '#E24B4A',
                    fontSize: '13px',
                  }}
                >
                  {error}
                </p>
              )}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderTop: '1px solid #F5F5F5' }}
            >
              <button
                onClick={() => setShowNewForm(false)}
                className="px-5 py-2.5 rounded-xl"
                style={{
                  background: 'white',
                  border: '1px solid #E5E7EB',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  color: '#4A4A4A',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl uppercase"
                style={{
                  background: '#8B2FC9',
                  color: 'white',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700,
                  fontSize: '14px',
                  opacity: saving ? 0.7 : 1,
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? 'Creating...' : 'Create Tenant'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
