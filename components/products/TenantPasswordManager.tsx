'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Eye, EyeOff, Mail, UserPlus } from 'lucide-react'

interface Props {
  tenantId: string
  adminEmail: string
  authUserId: string | null
}

interface Strength {
  level: number
  label: string
  color: string
}

function getStrength(pwd: string): Strength {
  if (pwd.length < 6) return { level: 1, label: 'Too short', color: '#E24B4A' }
  if (pwd.length < 8) return { level: 2, label: 'Weak', color: '#C8922A' }
  if (pwd.length < 10) return { level: 3, label: 'Good', color: '#1D4ED8' }
  const hasNumber = /\d/.test(pwd)
  const hasSpecial = /[^a-zA-Z0-9]/.test(pwd)
  if (hasNumber && hasSpecial) return { level: 4, label: 'Strong', color: '#16A34A' }
  return { level: 3, label: 'Good', color: '#1D4ED8' }
}

const barColors = ['#E24B4A', '#C8922A', '#1D4ED8', '#16A34A']

const sectionLabel: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  color: '#9CA3AF',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '16px',
}

const divider: React.CSSProperties = {
  borderTop: '1px solid #F5F5F5',
  margin: '16px 0',
}

export default function TenantPasswordManager({ tenantId, adminEmail, authUserId }: Props) {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savedPassword, setSavedPassword] = useState(false)
  const [sendingReset, setSendingReset] = useState(false)
  const [sentReset, setSentReset] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRelink, setShowRelink] = useState(false)
  const [relinking, setRelinking] = useState(false)

  const strength = newPassword.length > 0 ? getStrength(newPassword) : null

  async function handlePasswordUpdate() {
    setSavingPassword(true)
    setError(null)
    setShowRelink(false)

    const res = await fetch('/api/admin/products/field-assessment/tenants/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authUserId, newPassword }),
    })

    if (!res.ok) {
      const body = await res.json() as { error?: string }
      setError(body.error ?? 'Failed to update password.')
      setShowRelink(true)
      setSavingPassword(false)
      return
    }

    setNewPassword('')
    setSavedPassword(true)
    setSavingPassword(false)
    setTimeout(() => setSavedPassword(false), 3000)
  }

  async function handleRelink() {
    setRelinking(true)
    setError(null)

    const res = await fetch('/api/admin/products/field-assessment/tenants/relink-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, adminEmail, newPassword }),
    })

    const body = await res.json() as { error?: string }

    if (!res.ok) {
      setError(body.error ?? 'Failed to re-create account.')
      setRelinking(false)
      return
    }

    router.refresh()
  }

  async function handleSendReset() {
    setSendingReset(true)
    setError(null)

    const res = await fetch('/api/admin/products/field-assessment/tenants/reset-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authUserId, adminEmail }),
    })

    if (!res.ok) {
      const body = await res.json() as { error?: string }
      setError(body.error ?? 'Failed to send reset email.')
      setSendingReset(false)
      return
    }

    setSentReset(true)
    setSendingReset(false)
  }

  return (
    <div
      className="rounded-2xl border p-5 shadow-sm"
      style={{ background: 'white', borderColor: '#E5E7EB' }}
    >
      <p style={sectionLabel}>Operator Access</p>

      {/* Email row */}
      <div style={{ marginBottom: '16px' }}>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            color: '#6B7280',
            fontSize: '12px',
            fontWeight: 500,
            marginBottom: '4px',
          }}
        >
          Login Email
        </p>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#0D0D0D',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            {adminEmail}
          </span>
          <button
            onClick={() => navigator.clipboard.writeText(adminEmail)}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}
            title="Copy email"
          >
            <Copy
              size={14}
              style={{ color: '#9CA3AF' }}
              onMouseEnter={e => { (e.currentTarget as SVGElement).style.color = '#4A4A4A' }}
              onMouseLeave={e => { (e.currentTarget as SVGElement).style.color = '#9CA3AF' }}
            />
          </button>
        </div>
      </div>

      <div style={divider} />

      {/* No auth user warning */}
      {!authUserId ? (
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            color: '#9CA3AF',
            fontSize: '13px',
            textAlign: 'center',
            padding: '8px 0',
          }}
        >
          No auth account linked — password management unavailable.
        </p>
      ) : (
        <>
          {/* Manual password reset */}
          <div style={{ marginBottom: '16px' }}>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                color: '#4A4A4A',
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '12px',
              }}
            >
              Set New Password
            </p>

            {/* Password input */}
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="New password..."
                style={{
                  display: 'block',
                  width: '100%',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '12px 40px 12px 16px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  color: '#0D0D0D',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 2px #8B2FC9' }}
                onBlur={e => { e.currentTarget.style.boxShadow = 'none' }}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  color: '#9CA3AF',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Strength meter */}
            {strength && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: '4px',
                        borderRadius: '9999px',
                        background: i <= strength.level ? barColors[strength.level - 1] : '#F3F4F6',
                      }}
                    />
                  ))}
                </div>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    color: strength.color,
                    marginTop: '4px',
                  }}
                >
                  {strength.label}
                </p>
              </div>
            )}

            <button
              onClick={handlePasswordUpdate}
              disabled={newPassword.length < 6 || savingPassword}
              style={{
                display: 'block',
                width: '100%',
                background: newPassword.length < 6 || savingPassword ? '#E5E7EB' : '#8B2FC9',
                color: newPassword.length < 6 || savingPassword ? '#9CA3AF' : 'white',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                padding: '10px 16px',
                borderRadius: '12px',
                border: 'none',
                cursor: newPassword.length < 6 || savingPassword ? 'not-allowed' : 'pointer',
              }}
            >
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>

            {savedPassword && (
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#16A34A',
                  fontSize: '12px',
                  marginTop: '8px',
                  textAlign: 'center',
                }}
              >
                ✓ Password updated successfully
              </p>
            )}

            {error && (
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#E24B4A',
                  fontSize: '12px',
                  marginTop: '8px',
                }}
              >
                {error}
              </p>
            )}

            {/* Re-create auth account — shown after a failed password update */}
            {showRelink && (
              <div
                className="rounded-xl p-3 mt-3"
                style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}
              >
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: '#92400E',
                    fontSize: '12px',
                    fontWeight: 500,
                    marginBottom: '8px',
                  }}
                >
                  Auth account may be missing. Re-create it using the password entered above.
                </p>
                <button
                  onClick={handleRelink}
                  disabled={newPassword.length < 6 || relinking}
                  className="flex items-center gap-2"
                  style={{
                    background: newPassword.length < 6 || relinking ? '#E5E7EB' : '#0D0D0D',
                    color: newPassword.length < 6 || relinking ? '#9CA3AF' : 'white',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    fontWeight: 500,
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: newPassword.length < 6 || relinking ? 'not-allowed' : 'pointer',
                  }}
                >
                  <UserPlus size={13} />
                  {relinking ? 'Re-creating...' : 'Re-create Account'}
                </button>
              </div>
            )}
          </div>

          <div style={divider} />

          {/* Reset email */}
          <div>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                color: '#4A4A4A',
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '4px',
              }}
            >
              Password Reset Email
            </p>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                color: '#9CA3AF',
                fontSize: '12px',
                marginBottom: '12px',
              }}
            >
              Send a reset link to {adminEmail}
            </p>

            <button
              onClick={handleSendReset}
              disabled={sendingReset || sentReset}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                background: sentReset ? '#D1FAE5' : 'white',
                border: `1px solid ${sentReset ? '#16A34A' : '#E5E7EB'}`,
                color: sentReset ? '#065F46' : sendingReset ? '#9CA3AF' : '#4A4A4A',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                padding: '10px 16px',
                borderRadius: '12px',
                cursor: sendingReset || sentReset ? 'not-allowed' : 'pointer',
              }}
            >
              <Mail size={15} />
              {sentReset ? '✓ Reset email sent' : sendingReset ? 'Sending...' : 'Send Reset Email'}
            </button>

            {sentReset && (
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#6B7280',
                  fontSize: '12px',
                  marginTop: '8px',
                  textAlign: 'center',
                }}
              >
                Check {adminEmail} for the reset link
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
