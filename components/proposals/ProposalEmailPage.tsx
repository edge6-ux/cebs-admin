'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, RefreshCw, Send, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface LineItem {
  name: string
  description: string
  price: number
  is_retainer: boolean
}

interface ProposalSummary {
  tier: string
  lineItems: LineItem[]
  investmentLow: number
  investmentHigh: number
  monthlyRetainer: number
  timelineWeeks: number | null
  businessName: string
  customerName: string
  customerEmail: string
}

interface GeneratedEmail {
  subject: string
  intro: string
  nextSteps: string
  customerEmail: string
  customerName: string
}

interface Props {
  proposalId: string
  summary: ProposalSummary
}

const tierColors: Record<string, { bg: string; color: string }> = {
  audit:    { bg: '#EDE9FE', color: '#6D28D9' },
  optimize: { bg: '#DBEAFE', color: '#1D4ED8' },
  build:    { bg: 'rgba(139,47,201,0.1)', color: '#8B2FC9' },
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #E5E7EB',
  borderRadius: '12px',
  padding: '12px 16px',
  fontFamily: 'var(--font-inter), sans-serif',
  fontSize: '14px',
  color: '#0D0D0D',
  background: 'white',
  outline: 'none',
}

export default function ProposalEmailPage({ proposalId, summary }: Props) {
  const router = useRouter()
  const [generating, setGenerating] = useState(true)
  const [subject, setSubject]       = useState('')
  const [intro, setIntro]           = useState('')
  const [nextSteps, setNextSteps]   = useState('')
  const [sending, setSending]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [generated, setGenerated]   = useState(false)

  useEffect(() => {
    generate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function generate() {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/proposals/${proposalId}/email`, { method: 'POST' })
      if (!res.ok) throw new Error('Generation failed')
      const data = await res.json() as GeneratedEmail
      setSubject(data.subject)
      setIntro(data.intro)
      setNextSteps(data.nextSteps)
      setGenerated(true)
    } catch {
      setError('Failed to generate email. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSend() {
    if (!generated) return
    setSending(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/proposals/${proposalId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          intro,
          nextSteps,
          customerEmail:   summary.customerEmail,
          customerName:    summary.customerName,
          businessName:    summary.businessName,
          lineItems:       summary.lineItems,
          investmentLow:   summary.investmentLow,
          investmentHigh:  summary.investmentHigh,
          monthlyRetainer: summary.monthlyRetainer,
          timelineWeeks:   summary.timelineWeeks ?? 0,
        }),
      })
      if (!res.ok) throw new Error('Send failed')
      router.push(`/dashboard/proposals/${proposalId}`)
    } catch {
      setError('Failed to send. Please try again.')
      setSending(false)
    }
  }

  const tier = tierColors[summary.tier] ?? tierColors.build
  const lineItemsTotal = summary.lineItems.reduce((sum, li) => sum + li.price, 0)
  const displayTotal   = lineItemsTotal > 0 ? lineItemsTotal : summary.investmentHigh

  return (
    <div className="max-w-5xl mx-auto">

      {/* Back */}
      <Link
        href={`/dashboard/proposals/${proposalId}`}
        className="inline-flex items-center gap-1 font-body mb-6 transition-colors hover:text-[#0D0D0D]"
        style={{ color: '#6B7280', fontSize: '14px' }}
      >
        <ChevronLeft size={16} />
        Back to Proposal
      </Link>

      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <p className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '22px' }}>
            Send Proposal Email
          </p>
          <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '14px' }}>
            To: {summary.customerName} &lt;{summary.customerEmail}&gt;
          </p>
        </div>

        {generated && !generating && (
          <button
            onClick={generate}
            disabled={generating}
            className="flex items-center gap-2 font-body rounded-xl px-4 py-2.5 transition-colors hover:bg-gray-50 disabled:opacity-50"
            style={{ border: '1px solid #E5E7EB', fontSize: '13px', color: '#4A4A4A', background: 'white' }}
          >
            <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
            Regenerate
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_288px] gap-6">

        {/* Left — compose */}
        <div className="bg-white rounded-2xl shadow-sm p-8" style={{ border: '1px solid #E5E7EB' }}>

          {/* Generating state */}
          {generating && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div
                className="rounded-full animate-spin"
                style={{ width: '32px', height: '32px', border: '3px solid #F3F4F6', borderTopColor: '#8B2FC9' }}
              />
              <p className="font-body" style={{ color: '#6B7280', fontSize: '14px' }}>
                Generating email copy…
              </p>
            </div>
          )}

          {/* Error state */}
          {error && !generating && !generated && (
            <div className="flex flex-col items-center py-16 gap-4">
              <AlertCircle size={36} style={{ color: '#E24B4A' }} />
              <p className="font-body text-center" style={{ color: '#E24B4A', fontSize: '14px' }}>
                {error}
              </p>
              <button
                onClick={generate}
                className="font-body font-medium text-white rounded-xl px-5 py-2.5"
                style={{ background: '#8B2FC9', fontSize: '14px', border: 'none', cursor: 'pointer' }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Compose fields */}
          {generated && !generating && (
            <div className="space-y-6">
              <div>
                <label className="block font-body font-medium mb-2" style={{ color: '#4A4A4A', fontSize: '13px' }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px #8B2FC9'; e.currentTarget.style.borderColor = '#8B2FC9' }}
                  onBlur={(e)  => { e.currentTarget.style.boxShadow = 'none';               e.currentTarget.style.borderColor = '#E5E7EB' }}
                />
              </div>

              <div>
                <label className="block font-body font-medium mb-2" style={{ color: '#4A4A4A', fontSize: '13px' }}>
                  Opening
                </label>
                <textarea
                  rows={5}
                  value={intro}
                  onChange={(e) => setIntro(e.target.value)}
                  className="resize-none"
                  style={{ ...inputStyle, lineHeight: '1.75' }}
                  onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px #8B2FC9'; e.currentTarget.style.borderColor = '#8B2FC9' }}
                  onBlur={(e)  => { e.currentTarget.style.boxShadow = 'none';               e.currentTarget.style.borderColor = '#E5E7EB' }}
                />
              </div>

              <div>
                <label className="block font-body font-medium mb-2" style={{ color: '#4A4A4A', fontSize: '13px' }}>
                  Next Steps
                </label>
                <textarea
                  rows={3}
                  value={nextSteps}
                  onChange={(e) => setNextSteps(e.target.value)}
                  className="resize-none"
                  style={{ ...inputStyle, lineHeight: '1.75' }}
                  onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px #8B2FC9'; e.currentTarget.style.borderColor = '#8B2FC9' }}
                  onBlur={(e)  => { e.currentTarget.style.boxShadow = 'none';               e.currentTarget.style.borderColor = '#E5E7EB' }}
                />
                <p className="font-body mt-2" style={{ color: '#9CA3AF', fontSize: '12px' }}>
                  Line items, pricing, and Honed Ops branding are added automatically by the email template.
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

        {/* Right — proposal summary */}
        <div className="space-y-4">

          {/* Proposal details card */}
          <div className="bg-white rounded-2xl shadow-sm p-5" style={{ border: '1px solid #E5E7EB' }}>
            <p
              className="font-body uppercase pb-3 mb-4"
              style={{ color: '#6B7280', fontSize: '11px', letterSpacing: '0.08em', borderBottom: '1px solid #F5F5F5' }}
            >
              Proposal Summary
            </p>

            <div className="mb-4">
              <span
                className="inline-block font-body font-semibold px-2.5 py-1 rounded-full capitalize"
                style={{ fontSize: '12px', background: tier.bg, color: tier.color }}
              >
                {summary.tier}
              </span>
            </div>

            <p className="font-heading font-bold mb-1" style={{ color: '#0D0D0D', fontSize: '16px' }}>
              {summary.businessName}
            </p>
            <p className="font-body mb-4" style={{ color: '#6B7280', fontSize: '13px' }}>
              {summary.customerName}
            </p>

            {/* Investment */}
            {(summary.investmentLow > 0 || summary.investmentHigh > 0) && (
              <div className="flex items-center justify-between py-3" style={{ borderTop: '1px solid #F5F5F5' }}>
                <span className="font-body" style={{ color: '#6B7280', fontSize: '13px' }}>Investment</span>
                <span className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '15px' }}>
                  {summary.investmentLow === summary.investmentHigh
                    ? formatCurrency(summary.investmentLow)
                    : `${formatCurrency(summary.investmentLow)} – ${formatCurrency(summary.investmentHigh)}`}
                </span>
              </div>
            )}

            {summary.monthlyRetainer > 0 && (
              <div className="flex items-center justify-between py-3" style={{ borderTop: '1px solid #F5F5F5' }}>
                <span className="font-body" style={{ color: '#6B7280', fontSize: '13px' }}>Retainer</span>
                <span className="font-heading font-bold" style={{ color: '#8B2FC9', fontSize: '14px' }}>
                  {formatCurrency(summary.monthlyRetainer)}/mo
                </span>
              </div>
            )}

            {summary.timelineWeeks != null && summary.timelineWeeks > 0 && (
              <div className="flex items-center justify-between py-3" style={{ borderTop: '1px solid #F5F5F5' }}>
                <span className="font-body" style={{ color: '#6B7280', fontSize: '13px' }}>Timeline</span>
                <span className="font-body" style={{ color: '#4A4A4A', fontSize: '13px' }}>
                  {summary.timelineWeeks} weeks
                </span>
              </div>
            )}
          </div>

          {/* Line items card */}
          {summary.lineItems.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-5" style={{ border: '1px solid #E5E7EB' }}>
              <p
                className="font-body uppercase pb-3 mb-4"
                style={{ color: '#6B7280', fontSize: '11px', letterSpacing: '0.08em', borderBottom: '1px solid #F5F5F5' }}
              >
                Services
              </p>
              <div className="space-y-3">
                {summary.lineItems.map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-2">
                    <span className="font-body" style={{ color: '#4A4A4A', fontSize: '13px', lineHeight: '1.4' }}>
                      {item.name}
                    </span>
                    <span className="font-body font-medium flex-shrink-0" style={{ color: '#0D0D0D', fontSize: '13px' }}>
                      {item.is_retainer
                        ? `${formatCurrency(item.price)}/mo`
                        : item.price === 0
                        ? 'Free'
                        : formatCurrency(item.price)}
                    </span>
                  </div>
                ))}
                {displayTotal > 0 && (
                  <div
                    className="flex items-center justify-between pt-3"
                    style={{ borderTop: '1px solid #F5F5F5' }}
                  >
                    <span className="font-body font-semibold" style={{ color: '#4A4A4A', fontSize: '13px' }}>Total</span>
                    <span className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '15px' }}>
                      {formatCurrency(displayTotal)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div
        className="sticky bottom-0 flex items-center justify-between mt-6 px-8 py-4"
        style={{ background: 'white', borderTop: '1px solid #E5E7EB' }}
      >
        <Link
          href={`/dashboard/proposals/${proposalId}`}
          className="font-body transition-colors hover:text-[#0D0D0D]"
          style={{ color: '#6B7280', fontSize: '14px' }}
        >
          Cancel
        </Link>

        <div className="flex flex-col items-end gap-1.5">
          <button
            onClick={handleSend}
            disabled={sending || !generated || generating}
            className="flex items-center gap-2 font-heading font-bold uppercase text-white rounded-xl px-6 py-2.5"
            style={{
              background: '#8B2FC9',
              fontSize: '14px',
              cursor:  sending || !generated || generating ? 'not-allowed' : 'pointer',
              opacity: sending || !generated || generating ? 0.5 : 1,
              transition: 'opacity 150ms',
            }}
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
          {error && (
            <p className="font-body" style={{ color: '#E24B4A', fontSize: '13px' }}>
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
