'use client'

import { useState, useEffect, useMemo, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Plus, Send, Sparkles, X } from 'lucide-react'
import type { Lead, Evaluation, Service, LineItem } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface Props {
  lead: Lead
  evaluation: Evaluation | null
  services: Service[]
}

function SectionLabel({ children, action }: { children: string; action?: ReactNode }) {
  return (
    <div
      className="flex items-center justify-between pb-3 mb-5"
      style={{ borderBottom: '1px solid #F5F5F5' }}
    >
      <p
        className="font-body uppercase"
        style={{ color: '#6B7280', fontSize: '11px', letterSpacing: '0.08em' }}
      >
        {children}
      </p>
      {action}
    </div>
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

export default function ProposalForm({ lead, evaluation, services }: Props) {
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
  const [draftError, setDraftError] = useState<string | null>(null)
  const [draftSuccess, setDraftSuccess] = useState(false)
  const [proposalMode, setProposalMode] = useState<'catalog' | 'custom'>(
    services.length > 0 ? 'catalog' : 'custom'
  )
  const [lineItems, setLineItems] = useState<LineItem[]>([])

  const servicesByCategory = useMemo(() => {
    const grouped: Record<string, Service[]> = {}
    for (const s of services) {
      if (!grouped[s.category]) grouped[s.category] = []
      grouped[s.category].push(s)
    }
    return grouped
  }, [services])

  // Auto-calc investment from line items in catalog mode
  useEffect(() => {
    if (proposalMode !== 'catalog') return
    const oneTime = lineItems.filter((li) => !li.is_retainer)
    const retainer = lineItems.filter((li) => li.is_retainer)
    const totalOneTime = oneTime.reduce((sum, li) => sum + (li.price || 0), 0)
    const totalRetainer = retainer.reduce((sum, li) => sum + (li.price || 0), 0)
    setInvestmentLow(totalOneTime)
    setInvestmentHigh(totalOneTime)
    setMonthlyRetainer(totalRetainer)
  }, [lineItems, proposalMode])

  function toggleService(service: Service) {
    setLineItems((prev) => {
      const exists = prev.find((li) => li.service_id === service.id)
      if (exists) return prev.filter((li) => li.service_id !== service.id)
      return [
        ...prev,
        {
          service_id: service.id,
          name: service.name,
          description: service.description,
          price: service.is_retainer ? service.retainer_price_low : service.price_low,
          is_retainer: service.is_retainer,
          sort_order: prev.length,
        },
      ]
    })
  }

  function updateLineItem(index: number, patch: Partial<LineItem>) {
    setLineItems((prev) => prev.map((li, i) => (i === index ? { ...li, ...patch } : li)))
  }

  function removeLineItem(index: number) {
    setLineItems((prev) =>
      prev.filter((_, i) => i !== index).map((li, i) => ({ ...li, sort_order: i }))
    )
  }

  async function draftProposal() {
    if (!tier) return
    setDraftLoading(true)
    setDraftError(null)
    setDraftSuccess(false)
    try {
      const res = await fetch('/api/admin/proposals/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id, evaluationId: evaluation?.id || null, tier }),
      })
      let data: Record<string, unknown> = {}
      try { data = await res.json() } catch { /* non-json body */ }
      if (!res.ok) {
        setDraftError(`Error ${res.status}: ${(data.error as string) ?? 'Unknown error'}`)
        return
      }
      setScope((data.scope as string) || '')
      setIncludes((data.includes as string[]) || [])
      setExcludes((data.excludes as string[]) || [])
      setDraftSuccess(true)
      document.getElementById('scope-field')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } catch (err) {
      setDraftError(`Network error: ${err instanceof Error ? err.message : String(err)}`)
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

      const proposal = await res.json()

      if (proposalMode === 'catalog' && lineItems.length > 0) {
        await fetch('/api/admin/proposals/line-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ proposalId: proposal.id, lineItems }),
        })
      }

      router.push(`/dashboard/leads/${lead.id}`)
    } catch {
      setError('Failed to save proposal. Please try again.')
      setSaving(false)
    }
  }

  const oneTimeTotal = lineItems
    .filter((li) => !li.is_retainer)
    .reduce((sum, li) => sum + (li.price || 0), 0)
  const retainerTotal = lineItems
    .filter((li) => li.is_retainer)
    .reduce((sum, li) => sum + (li.price || 0), 0)

  const modeToggle = services.length > 0 ? (
    <div
      className="flex items-center rounded-lg"
      style={{ border: '1px solid #E5E7EB', background: '#F9F9F9', padding: '2px' }}
    >
      {(['catalog', 'custom'] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => setProposalMode(mode)}
          className="font-body font-medium capitalize rounded-md px-3 py-1 transition-all"
          style={{
            fontSize: '12px',
            background: proposalMode === mode ? 'white' : 'transparent',
            color: proposalMode === mode ? '#0D0D0D' : '#6B7280',
            boxShadow: proposalMode === mode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {mode}
        </button>
      ))}
    </div>
  ) : undefined

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
              id="scope-field"
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

          {proposalMode === 'catalog' ? (
            <>
              {lineItems.length > 0 ? (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-xl mb-5"
                  style={{ background: 'rgba(139,47,201,0.05)', border: '1px solid rgba(139,47,201,0.15)' }}
                >
                  <Check size={14} style={{ color: '#8B2FC9', flexShrink: 0 }} />
                  <p className="font-body" style={{ color: '#6B7280', fontSize: '13px' }}>
                    Investment calculated from service selections below.
                  </p>
                </div>
              ) : (
                <p className="font-body mb-5" style={{ color: '#9CA3AF', fontSize: '13px' }}>
                  Select services below to auto-calculate the investment.
                </p>
              )}
            </>
          ) : (
            <>
              <p className="font-body mb-4" style={{ color: '#6B7280', fontSize: '13px' }}>
                All prices based on cash/check payment.
              </p>

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
            </>
          )}

          <div className={proposalMode === 'catalog' ? '' : 'mt-5'}>
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

        {/* Section 3 — Service Line Items or Includes/Excludes */}
        <div>
          <SectionLabel action={modeToggle}>
            {proposalMode === 'catalog' ? 'Service Catalog' : "What's Included"}
          </SectionLabel>

          {proposalMode === 'catalog' ? (
            <>
              {/* Service browser grouped by category */}
              {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                <div key={category} className="mb-6">
                  <p
                    className="font-body font-semibold mb-2"
                    style={{ color: '#4A4A4A', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                  >
                    {category}
                  </p>
                  <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))' }}>
                    {categoryServices.map((service) => {
                      const selected = lineItems.some((li) => li.service_id === service.id)
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => toggleService(service)}
                          className="text-left rounded-xl p-3 transition-all"
                          style={{
                            border: selected ? '1.5px solid #8B2FC9' : '1.5px solid #E5E7EB',
                            background: selected ? 'rgba(139,47,201,0.05)' : 'white',
                            cursor: 'pointer',
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span
                              className="font-body font-semibold"
                              style={{ fontSize: '13px', color: selected ? '#8B2FC9' : '#0D0D0D', lineHeight: '1.3' }}
                            >
                              {service.name}
                            </span>
                            {selected && (
                              <div
                                className="flex-shrink-0 flex items-center justify-center rounded-full"
                                style={{ width: '18px', height: '18px', background: '#8B2FC9', marginTop: '1px' }}
                              >
                                <Check size={11} color="white" strokeWidth={3} />
                              </div>
                            )}
                          </div>
                          <p className="font-body mt-1.5" style={{ color: '#9CA3AF', fontSize: '11px' }}>
                            {service.is_retainer
                              ? `${formatCurrency(service.retainer_price_low)}/mo`
                              : `${formatCurrency(service.price_low)} – ${formatCurrency(service.price_high)}`}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* Selected line items */}
              {lineItems.length > 0 && (
                <div className="mt-2">
                  <p className="font-body font-medium mb-3" style={{ color: '#4A4A4A', fontSize: '13px' }}>
                    Selected Services
                  </p>
                  <div className="space-y-2">
                    {lineItems.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{ background: '#F9F9F9', border: '1px solid #F0F0F0' }}
                      >
                        <div className="flex-1 min-w-0">
                          {item.service_id ? (
                            <p
                              className="font-body font-medium truncate"
                              style={{ fontSize: '13px', color: '#0D0D0D' }}
                            >
                              {item.name}
                            </p>
                          ) : (
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => updateLineItem(i, { name: e.target.value })}
                              placeholder="Service name"
                              style={{
                                width: '100%',
                                border: '1px solid #E5E7EB',
                                borderRadius: '8px',
                                padding: '4px 8px',
                                fontFamily: 'var(--font-inter), sans-serif',
                                fontSize: '13px',
                                color: '#0D0D0D',
                                background: 'white',
                                outline: 'none',
                              }}
                              onFocus={(e) => { e.currentTarget.style.borderColor = '#8B2FC9' }}
                              onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E7EB' }}
                            />
                          )}
                          {item.is_retainer && (
                            <span className="font-body" style={{ fontSize: '11px', color: '#6B7280' }}>
                              /mo retainer
                            </span>
                          )}
                        </div>
                        <div className="relative flex-shrink-0" style={{ width: '120px' }}>
                          <span
                            className="absolute font-body pointer-events-none"
                            style={{ left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', fontSize: '13px' }}
                          >
                            $
                          </span>
                          <input
                            type="number"
                            min={0}
                            value={item.price || ''}
                            onChange={(e) => updateLineItem(i, { price: Number(e.target.value) })}
                            style={{
                              width: '100%',
                              border: '1px solid #E5E7EB',
                              borderRadius: '8px',
                              padding: '6px 8px 6px 22px',
                              fontFamily: 'var(--font-inter), sans-serif',
                              fontSize: '13px',
                              color: '#0D0D0D',
                              background: 'white',
                              outline: 'none',
                            }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = '#8B2FC9' }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E7EB' }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLineItem(i)}
                          style={{
                            color: '#9CA3AF',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            flexShrink: 0,
                            display: 'flex',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#E24B4A' }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF' }}
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div
                    className="mt-3 px-4 py-3 rounded-xl flex items-center gap-8 flex-wrap"
                    style={{ background: 'rgba(139,47,201,0.05)', border: '1px solid rgba(139,47,201,0.15)' }}
                  >
                    {oneTimeTotal > 0 && (
                      <div>
                        <p className="font-body" style={{ color: '#6B7280', fontSize: '11px' }}>One-time</p>
                        <p className="font-heading font-bold" style={{ color: '#8B2FC9', fontSize: '18px' }}>
                          {formatCurrency(oneTimeTotal)}
                        </p>
                      </div>
                    )}
                    {retainerTotal > 0 && (
                      <div>
                        <p className="font-body" style={{ color: '#6B7280', fontSize: '11px' }}>Monthly retainer</p>
                        <p className="font-heading font-bold" style={{ color: '#8B2FC9', fontSize: '18px' }}>
                          {formatCurrency(retainerTotal)}/mo
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  setLineItems((prev) => [
                    ...prev,
                    { service_id: null, name: '', description: '', price: 0, is_retainer: false, sort_order: prev.length },
                  ])
                }
                className="flex items-center font-body font-medium transition-opacity hover:opacity-70 mt-4"
                style={{ gap: '6px', color: '#8B2FC9', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <Plus size={14} />
                Add custom line item
              </button>
            </>
          ) : (
            <>
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
                      <div
                        className="flex-shrink-0 rounded-full"
                        style={{ width: '6px', height: '6px', background: '#16A34A' }}
                      />
                      <input
                        type="text"
                        value={item}
                        onChange={(e) =>
                          setIncludes((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))
                        }
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
                      <div
                        className="flex-shrink-0 rounded-full"
                        style={{ width: '6px', height: '6px', background: '#E24B4A' }}
                      />
                      <input
                        type="text"
                        value={item}
                        onChange={(e) =>
                          setExcludes((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))
                        }
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
            </>
          )}
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

              {draftError && (
                <p className="font-body mt-2" style={{ color: '#E24B4A', fontSize: '13px' }}>
                  {draftError}
                </p>
              )}
              {draftSuccess && (
                <p className="font-body mt-2" style={{ color: '#16A34A', fontSize: '13px' }}>
                  ✓ Draft generated — scope and line items filled above.
                </p>
              )}
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
