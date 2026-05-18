'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Send, Sparkles } from 'lucide-react'
import type { Lead, Evaluation } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface Props {
  lead: Lead
  evaluation: Evaluation | null
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
}

const focusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.boxShadow = '0 0 0 2px #8B2FC9'
    e.currentTarget.style.borderColor = '#8B2FC9'
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.boxShadow = 'none'
    e.currentTarget.style.borderColor = '#E5E7EB'
  },
}

const TIERS = [
  {
    value: 'audit',
    title: 'Audit & Strategy',
    description: 'Free initial report with specific recommendations and estimated savings.',
    priceHint: 'Free',
    selectedBorder: '#8B2FC9',
    selectedBg: 'rgba(139,47,201,0.06)',
    selectedColor: '#8B2FC9',
  },
  {
    value: 'optimize',
    title: 'Optimize & Consolidate',
    description: 'Tool consolidation, workflow automation, and system integration.',
    priceHint: '$1,500–$5,000',
    selectedBorder: '#1D4ED8',
    selectedBg: 'rgba(29,78,216,0.06)',
    selectedColor: '#1D4ED8',
  },
  {
    value: 'build',
    title: 'Build',
    description: 'Custom software designed specifically for the business.',
    priceHint: '$5,000–$50,000+',
    selectedBorder: '#8B2FC9',
    selectedBg: 'rgba(139,47,201,0.06)',
    selectedColor: '#8B2FC9',
  },
] as const

export default function ProposalForm({ lead, evaluation }: Props) {
  const router = useRouter()

  const [tier, setTier] = useState(evaluation?.tier_fit ?? '')
  const [scope, setScope] = useState('')
  const [investmentLow, setInvestmentLow] = useState(0)
  const [investmentHigh, setInvestmentHigh] = useState(0)
  const [monthlyRetainer, setMonthlyRetainer] = useState(0)
  const [timelineWeeks, setTimelineWeeks] = useState(0)
  const [includes, setIncludes] = useState<string[]>([])
  const [excludes, setExcludes] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [draftLoading, setDraftLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function draftProposal() {
    if (!tier) return
    setDraftLoading(true)
    try {
      const res = await fetch('/api/admin/proposals/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id, evaluationId: evaluation?.id || null, tier }),
      })
      if (res.ok) {
        const data = await res.json()
        setScope(data.scope || '')
        setIncludes(data.includes || [])
        setExcludes(data.excludes || [])
      }
    } finally {
      setDraftLoading(false)
    }
  }

  async function submitProposal(status: 'draft' | 'sent') {
    if (!tier || !scope) {
      setError('Tier and scope of work are required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          evaluation_id: evaluation?.id || null,
          tier,
          scope,
          investment_low: investmentLow,
          investment_high: investmentHigh,
          monthly_retainer: monthlyRetainer,
          timeline_weeks: timelineWeeks,
          includes: includes.filter((i) => i.trim() !== ''),
          excludes: excludes.filter((e) => e.trim() !== ''),
          status,
          sent_at: status === 'sent' ? new Date().toISOString() : null,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      router.push(`/dashboard/leads/${lead.id}`)
    } catch {
      setError('Failed to save proposal. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="pb-24">
      <div
        className="bg-white rounded-2xl p-8 shadow-sm space-y-8"
        style={{ border: '1px solid #E5E7EB' }}
      >
        {/* Section 1 — Proposal Details */}
        <div>
          <SectionLabel>Proposal Details</SectionLabel>

          <div>
            <label className="block font-body font-medium mb-3" style={{ color: '#4A4A4A', fontSize: '13px' }}>
              Service Tier
            </label>

            <div className="space-y-3">
              {TIERS.map((t) => {
                const selected = tier === t.value
                const recommended = evaluation?.tier_fit === t.value
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTier(t.value)}
                    className="w-full text-left rounded-xl p-4 transition-all"
                    style={{
                      border: selected ? `1.5px solid ${t.selectedBorder}` : '1.5px solid #E5E7EB',
                      background: selected ? t.selectedBg : 'white',
                      cursor: 'pointer',
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="font-heading font-bold"
                          style={{ fontSize: '15px', color: selected ? t.selectedColor : '#0D0D0D' }}
                        >
                          {t.title}
                        </span>
                        {recommended && (
                          <span
                            className="font-body font-semibold px-2 py-0.5 rounded-full"
                            style={{ fontSize: '11px', color: '#16A34A', background: '#D1FAE5' }}
                          >
                            ✓ Recommended
                          </span>
                        )}
                      </div>
                      <span className="font-body font-semibold flex-shrink-0" style={{ fontSize: '12px', color: '#8B2FC9' }}>
                        {t.priceHint}
                      </span>
                    </div>
                    <p className="font-body mt-2" style={{ color: '#6B7280', fontSize: '13px', lineHeight: '1.5' }}>
                      {t.description}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-6">
            <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '13px' }}>
              Scope of Work
            </label>
            <textarea
              rows={5}
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="Describe exactly what is included in this proposal. Be specific — this becomes the basis of the agreement."
              className="resize-none"
              style={fieldStyle}
              {...focusHandlers}
            />
          </div>
        </div>

        {/* Section 2 — Investment */}
        <div>
          <SectionLabel>Investment</SectionLabel>

          <p className="font-body mb-4" style={{ color: '#6B7280', fontSize: '13px' }}>
            All prices based on cash/check payment.
          </p>

          {/* Range inputs */}
          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '13px' }}>
                From
              </label>
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
                  value={investmentLow || ''}
                  onChange={(e) => setInvestmentLow(Number(e.target.value))}
                  style={{ ...fieldStyle, paddingLeft: '28px' }}
                  {...focusHandlers}
                />
              </div>
            </div>

            <div>
              <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '13px' }}>
                To
              </label>
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
                  value={investmentHigh || ''}
                  onChange={(e) => setInvestmentHigh(Number(e.target.value))}
                  style={{ ...fieldStyle, paddingLeft: '28px' }}
                  {...focusHandlers}
                />
              </div>
            </div>
          </div>

          {/* Range preview */}
          {(investmentLow > 0 || investmentHigh > 0) && (
            <div
              className="flex items-center justify-between mt-3 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(139,47,201,0.06)', border: '1px solid rgba(139,47,201,0.15)' }}
            >
              <span className="font-body" style={{ color: '#6B7280', fontSize: '13px' }}>Investment Range</span>
              <span className="font-heading font-bold" style={{ color: '#8B2FC9', fontSize: '18px' }}>
                {formatCurrency(investmentLow)} – {formatCurrency(investmentHigh)}
              </span>
            </div>
          )}

          {/* Monthly retainer */}
          <div className="mt-5">
            <label className="block font-body font-medium mb-1" style={{ color: '#4A4A4A', fontSize: '13px' }}>
              Monthly Retainer
            </label>
            <p className="font-body mb-1.5" style={{ color: '#6B7280', fontSize: '12px' }}>
              For ongoing management of software we build. Leave 0 if not applicable.
            </p>
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
                value={monthlyRetainer || ''}
                onChange={(e) => setMonthlyRetainer(Number(e.target.value))}
                style={{ ...fieldStyle, paddingLeft: '28px' }}
                {...focusHandlers}
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-5">
            <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '13px' }}>
              Estimated Timeline
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                value={timelineWeeks || ''}
                onChange={(e) => setTimelineWeeks(Number(e.target.value))}
                style={{ ...fieldStyle, paddingRight: '64px' }}
                {...focusHandlers}
              />
              <span
                className="absolute font-body pointer-events-none"
                style={{ right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', fontSize: '14px' }}
              >
                weeks
              </span>
            </div>
          </div>
        </div>

        {/* Section 3 — What's Included */}
        <div>
          <SectionLabel>What&apos;s Included</SectionLabel>

          {/* Includes */}
          <div className="mb-6">
            <label className="block font-body font-medium mb-3" style={{ color: '#4A4A4A', fontSize: '13px' }}>
              Included in this proposal
            </label>

            {includes.length === 0 && (
              <p className="font-body mb-3" style={{ color: '#9CA3AF', fontSize: '13px' }}>
                No items added yet
              </p>
            )}

            <div className="space-y-2 mb-3">
              {includes.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex-shrink-0 rounded-full" style={{ width: '6px', height: '6px', background: '#16A34A' }} />
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => setIncludes((prev) => prev.map((v, idx) => idx === i ? e.target.value : v))}
                    placeholder="e.g. Custom website built on Next.js"
                    style={{
                      flex: 1,
                      border: 'none',
                      borderBottom: '1px solid #E5E7EB',
                      background: 'transparent',
                      fontFamily: 'var(--font-inter), sans-serif',
                      fontSize: '14px',
                      color: '#0D0D0D',
                      outline: 'none',
                      padding: '6px 4px',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderBottomColor = '#8B2FC9' }}
                    onBlur={(e) => { e.currentTarget.style.borderBottomColor = '#E5E7EB' }}
                  />
                  <button
                    type="button"
                    onClick={() => setIncludes((prev) => prev.filter((_, idx) => idx !== i))}
                    style={{ color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: 0, flexShrink: 0 }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#E24B4A' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIncludes((prev) => [...prev, ''])}
              className="flex items-center font-body font-medium transition-opacity hover:opacity-70"
              style={{ gap: '6px', color: '#8B2FC9', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <Plus size={14} />
              Add item
            </button>
          </div>

          {/* Excludes */}
          <div>
            <label className="block font-body font-medium mb-1" style={{ color: '#4A4A4A', fontSize: '13px' }}>
              Explicitly excluded
            </label>
            <p className="font-body mb-3" style={{ color: '#6B7280', fontSize: '12px' }}>
              Set clear expectations by listing what is not included.
            </p>

            {excludes.length === 0 && (
              <p className="font-body mb-3" style={{ color: '#9CA3AF', fontSize: '13px' }}>
                No items added yet
              </p>
            )}

            <div className="space-y-2 mb-3">
              {excludes.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex-shrink-0 rounded-full" style={{ width: '6px', height: '6px', background: '#E24B4A' }} />
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => setExcludes((prev) => prev.map((v, idx) => idx === i ? e.target.value : v))}
                    placeholder="e.g. Ongoing content creation"
                    style={{
                      flex: 1,
                      border: 'none',
                      borderBottom: '1px solid #E5E7EB',
                      background: 'transparent',
                      fontFamily: 'var(--font-inter), sans-serif',
                      fontSize: '14px',
                      color: '#0D0D0D',
                      outline: 'none',
                      padding: '6px 4px',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderBottomColor = '#8B2FC9' }}
                    onBlur={(e) => { e.currentTarget.style.borderBottomColor = '#E5E7EB' }}
                  />
                  <button
                    type="button"
                    onClick={() => setExcludes((prev) => prev.filter((_, idx) => idx !== i))}
                    style={{ color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: 0, flexShrink: 0 }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#E24B4A' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setExcludes((prev) => [...prev, ''])}
              className="flex items-center font-body font-medium transition-opacity hover:opacity-70"
              style={{ gap: '6px', color: '#8B2FC9', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <Plus size={14} />
              Add exclusion
            </button>
          </div>
        </div>

        {/* AI Draft */}
        <div className="rounded-2xl p-5" style={{ background: '#F9F9F9', border: '1px solid #E5E7EB' }}>
          <div className="flex gap-4 items-start">
            <div
              className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{ width: '40px', height: '40px', background: 'white', border: '1px solid #E5E7EB' }}
            >
              <Sparkles size={18} style={{ color: '#8B2FC9' }} />
            </div>

            <div className="flex-1">
              <p className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '15px' }}>
                Generate with AI
              </p>
              <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '13px', lineHeight: '1.5' }}>
                Let Claude draft the scope, includes, and excludes based on the lead and evaluation.
              </p>

              <button
                type="button"
                onClick={draftProposal}
                disabled={draftLoading || !tier}
                title={!tier ? 'Select a tier first' : undefined}
                className="flex items-center gap-2 font-body font-medium text-white rounded-xl mt-3 transition-colors disabled:opacity-60"
                style={{ background: '#8B2FC9', fontSize: '14px', padding: '10px 16px', border: 'none', cursor: !tier ? 'not-allowed' : 'pointer' }}
                onMouseEnter={(e) => { if (tier && !draftLoading) e.currentTarget.style.background = '#7A28B8' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#8B2FC9' }}
              >
                {draftLoading ? (
                  <>
                    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Drafting...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    Draft Proposal
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div
        className="sticky bottom-0 bg-white px-8 py-4 mt-8 flex items-center justify-between"
        style={{ borderTop: '1px solid #E5E7EB', zIndex: 40 }}
      >
        <button
          type="button"
          onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
          className="font-body transition-opacity hover:opacity-70"
          style={{ color: '#6B7280', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          Cancel
        </button>

        <div className="flex flex-col items-end gap-2">
          {error && (
            <p className="font-body" style={{ color: '#E24B4A', fontSize: '13px' }}>
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => submitProposal('draft')}
              disabled={saving}
              className="font-body rounded-xl px-5 py-2.5 transition-colors disabled:opacity-60"
              style={{ border: '1px solid #E5E7EB', color: '#4A4A4A', fontSize: '14px', background: 'white', cursor: 'pointer' }}
            >
              Save as Draft
            </button>

            <button
              type="button"
              onClick={() => submitProposal('sent')}
              disabled={saving}
              className="flex items-center gap-2 font-heading font-bold uppercase text-white rounded-xl px-5 py-2.5 transition-colors disabled:opacity-60"
              style={{ background: '#8B2FC9', fontSize: '14px', cursor: 'pointer' }}
              onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = '#7A28B8' }}
              onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = '#8B2FC9' }}
            >
              {saving ? (
                <>
                  <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Send size={15} />
                  Save &amp; Mark as Sent
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
