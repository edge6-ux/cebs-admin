'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Send, RefreshCw, AlertCircle } from 'lucide-react'

interface LineItem {
  name: string
  price: number
  is_retainer: boolean
}

interface ProposalData {
  tier: string
  lineItems: LineItem[]
  investmentLow: number
  investmentHigh: number
  monthlyRetainer: number
  timelineWeeks: number | null
  businessName: string
}

interface GeneratedEmail {
  subject: string
  intro: string
  nextSteps: string
  customerEmail: string
  customerName: string
  proposal: ProposalData
}

interface Props {
  proposalId: string
  customerEmail: string
  customerName: string
  onClose: () => void
  onSent: () => void
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #E5E7EB',
  borderRadius: '12px',
  padding: '10px 16px',
  fontFamily: 'var(--font-inter), sans-serif',
  fontSize: '14px',
  color: '#0D0D0D',
  background: 'white',
  outline: 'none',
}

export default function ProposalEmailModal({
  proposalId,
  customerEmail,
  customerName,
  onClose,
  onSent,
}: Props) {
  const [generating, setGenerating] = useState(true)
  const [generated, setGenerated] = useState<GeneratedEmail | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    generateEmail()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function generateEmail() {
    setGenerating(true)
    setError(null)
    setGenerated(null)
    try {
      const res = await fetch(`/api/admin/proposals/${proposalId}/email`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Generation failed')
      const data = await res.json() as GeneratedEmail
      setGenerated(data)
    } catch {
      setError('Failed to generate. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  async function sendEmail() {
    if (!generated) return
    setSending(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/proposals/${proposalId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: generated.subject,
          intro: generated.intro,
          nextSteps: generated.nextSteps,
          customerEmail: generated.customerEmail || customerEmail,
          customerName: generated.customerName || customerName,
          proposal: generated.proposal,
        }),
      })
      if (!res.ok) throw new Error('Send failed')
      onSent()
    } catch {
      setError('Failed to send. Please try again.')
      setSending(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.6)', zIndex: 200 }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full overflow-y-auto"
        style={{ maxWidth: '672px', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid #F5F5F5' }}
        >
          <div>
            <p className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '18px' }}>
              Proposal Email
            </p>
            <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '13px' }}>
              To: {customerName} &lt;{customerEmail}&gt;
            </p>
          </div>

          <div className="flex items-center gap-2">
            {generated && (
              <button
                onClick={generateEmail}
                disabled={generating}
                className="flex items-center gap-2 font-body rounded-xl px-3 py-2 transition-colors hover:bg-gray-50 disabled:opacity-50"
                style={{ border: '1px solid #E5E7EB', fontSize: '13px', color: '#4A4A4A', background: 'white' }}
              >
                <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
                Regenerate
              </button>
            )}
            <button
              onClick={onClose}
              style={{ color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', lineHeight: 1, padding: '4px' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#0D0D0D' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF' }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Generating */}
          {generating && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div
                className="rounded-full animate-spin"
                style={{ width: '28px', height: '28px', border: '3px solid #F3F4F6', borderTopColor: '#8B2FC9' }}
              />
              <p className="font-body" style={{ color: '#6B7280', fontSize: '14px' }}>
                Generating proposal email…
              </p>
            </div>
          )}

          {/* Error (failed to generate) */}
          {error && !generating && !generated && (
            <div className="flex flex-col items-center py-8 gap-4">
              <AlertCircle size={32} style={{ color: '#E24B4A' }} />
              <p className="font-body text-center" style={{ color: '#E24B4A', fontSize: '14px' }}>
                {error}
              </p>
              <button
                onClick={generateEmail}
                className="font-body font-medium text-white rounded-xl px-4 py-2.5"
                style={{ background: '#8B2FC9', fontSize: '14px', border: 'none', cursor: 'pointer' }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Generated */}
          {generated && !generating && (
            <div className="space-y-5">
              {/* Subject */}
              <div>
                <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '13px' }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={generated.subject}
                  onChange={(e) => setGenerated({ ...generated, subject: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px #8B2FC9'; e.currentTarget.style.borderColor = '#8B2FC9' }}
                  onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E5E7EB' }}
                />
              </div>

              {/* Intro */}
              <div>
                <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '13px' }}>
                  Opening
                </label>
                <textarea
                  rows={4}
                  value={generated.intro}
                  onChange={(e) => setGenerated({ ...generated, intro: e.target.value })}
                  className="resize-none"
                  style={{ ...inputStyle, lineHeight: '1.7', padding: '12px 16px' }}
                  onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px #8B2FC9'; e.currentTarget.style.borderColor = '#8B2FC9' }}
                  onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E5E7EB' }}
                />
              </div>

              {/* Next Steps */}
              <div>
                <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '13px' }}>
                  Next Steps
                </label>
                <textarea
                  rows={3}
                  value={generated.nextSteps}
                  onChange={(e) => setGenerated({ ...generated, nextSteps: e.target.value })}
                  className="resize-none"
                  style={{ ...inputStyle, lineHeight: '1.7', padding: '12px 16px' }}
                  onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px #8B2FC9'; e.currentTarget.style.borderColor = '#8B2FC9' }}
                  onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E5E7EB' }}
                />
                <p className="font-body mt-1.5" style={{ color: '#9CA3AF', fontSize: '12px' }}>
                  Line items, pricing, and branding are added automatically by the template.
                </p>
              </div>

              {error && (
                <p className="font-body" style={{ color: '#E24B4A', fontSize: '13px' }}>
                  {error}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: '1px solid #F5F5F5' }}
        >
          <p className="font-body" style={{ color: '#9CA3AF', fontSize: '12px' }}>
            Sending marks this proposal as Sent.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="font-body rounded-xl px-5 py-2.5 transition-colors hover:bg-gray-50"
              style={{ border: '1px solid #E5E7EB', fontSize: '14px', color: '#4A4A4A', background: 'white', cursor: 'pointer' }}
            >
              Cancel
            </button>

            <button
              onClick={sendEmail}
              disabled={sending || !generated || generating}
              className="flex items-center gap-2 font-heading font-bold uppercase text-white rounded-xl px-5 py-2.5 disabled:opacity-50"
              style={{ background: '#8B2FC9', fontSize: '14px', cursor: sending || !generated || generating ? 'not-allowed' : 'pointer' }}
              onMouseEnter={(e) => { if (!sending && generated && !generating) e.currentTarget.style.background = '#7A28B8' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#8B2FC9' }}
            >
              {sending ? (
                <>
                  <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Sending…
                </>
              ) : (
                <>
                  <Send size={15} />
                  Send Proposal
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
