'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Check } from 'lucide-react'
import type { Lead, Evaluation, Tool } from '@/lib/types'
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
  border: '1px solid #E5E7EB',
  borderRadius: '12px',
  padding: '10px 12px',
  fontFamily: 'var(--font-inter), sans-serif',
  fontSize: '14px',
  color: '#0D0D0D',
  background: 'white',
  outline: 'none',
}

const focusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.boxShadow = '0 0 0 2px #8B2FC9'
    e.currentTarget.style.borderColor = '#8B2FC9'
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.boxShadow = 'none'
    e.currentTarget.style.borderColor = '#E5E7EB'
  },
}

const COMFORT_OPTIONS = ['Low', 'Medium', 'High', 'Technical'] as const
const TIER_OPTIONS = [
  {
    value: 'audit',
    label: 'Audit',
    description: 'One-time review & recommendations',
  },
  {
    value: 'optimize',
    label: 'Optimize',
    description: 'Ongoing improvements & integrations',
  },
  {
    value: 'build',
    label: 'Build',
    description: 'Full custom system build-out',
  },
] as const

export default function EvaluationForm({ lead, evaluation }: Props) {
  const router = useRouter()

  const [tools, setTools] = useState<Tool[]>(evaluation?.current_tools ?? [])
  const [monthlySpend, setMonthlySpend] = useState(evaluation?.monthly_spend_confirmed ?? 0)
  const [painPoints, setPainPoints] = useState(evaluation?.pain_points ?? '')
  const [technicalComfort, setTechnicalComfort] = useState(evaluation?.technical_comfort ?? '')
  const [timeline, setTimeline] = useState(evaluation?.timeline ?? '')
  const [budgetRange, setBudgetRange] = useState(evaluation?.budget_range ?? '')
  const [decisionMaker, setDecisionMaker] = useState(evaluation?.decision_maker ?? '')
  const [tierFit, setTierFit] = useState(evaluation?.tier_fit ?? '')
  const [notes, setNotes] = useState(evaluation?.notes ?? '')
  const [evalId, setEvalId] = useState<string | null>(evaluation?.id ?? null)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const totalSpend = tools.reduce((sum, t) => sum + (t.cost || 0), 0)

  useEffect(() => {
    setMonthlySpend(totalSpend)
  }, [totalSpend])

  function addTool() {
    setTools((prev) => [...prev, { name: '', cost: 0, category: '', keep: true }])
  }

  function removeTool(index: number) {
    setTools((prev) => prev.filter((_, i) => i !== index))
  }

  function updateTool(index: number, patch: Partial<Tool>) {
    setTools((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)))
  }

  function buildPayload(complete: boolean) {
    return {
      lead_id: lead.id,
      current_tools: tools,
      monthly_spend_confirmed: monthlySpend,
      pain_points: painPoints,
      technical_comfort: technicalComfort,
      timeline,
      budget_range: budgetRange,
      decision_maker: decisionMaker,
      tier_fit: tierFit,
      notes,
      completed_at: complete ? new Date().toISOString() : null,
    }
  }

  async function saveEvaluation(complete: boolean) {
    setSaving(true)
    setSaved(false)

    try {
      if (evalId) {
        const res = await fetch(`/api/admin/evaluations/${evalId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload(complete)),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error ?? 'Failed to save')
        }
      } else {
        const res = await fetch('/api/admin/evaluations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload(complete)),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error ?? 'Failed to save')
        }
        const data = await res.json()
        setEvalId(data.id)
      }

      if (complete) {
        router.push(`/dashboard/leads/${lead.id}`)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pb-24">
      <div
        className="bg-white rounded-2xl p-8 shadow-sm space-y-8"
        style={{ border: '1px solid #E5E7EB' }}
      >
        {/* Section 1 — Tool Stack */}
        <div>
          <SectionLabel>Current Tool Stack</SectionLabel>

          <p className="font-body mb-4" style={{ color: '#6B7280', fontSize: '13px' }}>
            List every tool the business is currently paying for. Mark each as keep or replace.
          </p>

          <div className="space-y-3 mb-4">
            {tools.length === 0 && (
              <p className="font-body text-center py-4" style={{ color: '#9CA3AF', fontSize: '14px' }}>
                No tools added yet
              </p>
            )}

            {tools.map((tool, i) => (
              <div key={i} className="flex gap-3 items-center">
                <input
                  type="text"
                  value={tool.name}
                  onChange={(e) => updateTool(i, { name: e.target.value })}
                  placeholder="Tool name e.g. Thryv"
                  className="flex-1"
                  style={fieldStyle}
                  {...focusHandlers}
                />

                <input
                  type="number"
                  min={0}
                  value={tool.cost || ''}
                  onChange={(e) => updateTool(i, { cost: parseFloat(e.target.value) || 0 })}
                  placeholder="$/mo"
                  style={{ ...fieldStyle, width: '112px', textAlign: 'right' }}
                  {...focusHandlers}
                />

                <div className="flex flex-shrink-0" style={{ gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => updateTool(i, { keep: true })}
                    className="font-body font-semibold px-3 py-1.5 rounded-full transition-colors"
                    style={{
                      fontSize: '12px',
                      background: tool.keep ? '#D1FAE5' : 'white',
                      color: tool.keep ? '#065F46' : '#6B7280',
                      border: tool.keep ? '1px solid #16A34A' : '1px solid #E5E7EB',
                      cursor: 'pointer',
                    }}
                  >
                    Keep
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTool(i, { keep: false })}
                    className="font-body font-semibold px-3 py-1.5 rounded-full transition-colors"
                    style={{
                      fontSize: '12px',
                      background: !tool.keep ? '#FCEBEB' : 'white',
                      color: !tool.keep ? '#991B1B' : '#6B7280',
                      border: !tool.keep ? '1px solid #E24B4A' : '1px solid #E5E7EB',
                      cursor: 'pointer',
                    }}
                  >
                    Replace
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeTool(i)}
                  className="flex-shrink-0 transition-colors"
                  style={{ color: '#9CA3AF', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#E24B4A' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addTool}
            className="flex items-center gap-2 font-body font-medium mt-2 transition-opacity hover:opacity-70"
            style={{ color: '#8B2FC9', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <Plus size={16} />
            Add Tool
          </button>

          <div
            className="flex items-center justify-between mt-4 pt-4"
            style={{ borderTop: '1px solid #F5F5F5' }}
          >
            <p className="font-body font-medium" style={{ color: '#4A4A4A', fontSize: '14px' }}>
              Total Monthly Spend
            </p>
            <p className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '18px' }}>
              {formatCurrency(totalSpend)}
            </p>
          </div>
        </div>

        {/* Section 2 — Consultation Notes */}
        <div>
          <SectionLabel>Consultation Notes</SectionLabel>

          <div className="space-y-5">
            {/* Pain Points */}
            <div>
              <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '13px' }}>
                Pain Points
              </label>
              <textarea
                rows={4}
                value={painPoints}
                onChange={(e) => setPainPoints(e.target.value)}
                placeholder="What specific frustrations did they describe? Inefficiencies, manual work, missed revenue..."
                className="resize-none w-full"
                style={fieldStyle}
                {...focusHandlers}
              />
            </div>

            {/* Technical Comfort */}
            <div>
              <label className="block font-body font-medium mb-2" style={{ color: '#4A4A4A', fontSize: '13px' }}>
                Technical Comfort Level
              </label>
              <div className="flex gap-2 flex-wrap">
                {COMFORT_OPTIONS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setTechnicalComfort(level)}
                    className="font-body font-semibold px-4 py-2 rounded-full transition-colors"
                    style={{
                      fontSize: '13px',
                      cursor: 'pointer',
                      background: technicalComfort === level ? '#EDE9FE' : 'white',
                      color: technicalComfort === level ? '#6D28D9' : '#6B7280',
                      border: technicalComfort === level ? '1px solid #8B2FC9' : '1px solid #E5E7EB',
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Decision Maker */}
            <div>
              <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '13px' }}>
                Decision Maker
              </label>
              <input
                type="text"
                value={decisionMaker}
                onChange={(e) => setDecisionMaker(e.target.value)}
                placeholder="Who makes the final call? Owner, manager, partner..."
                className="w-full"
                style={fieldStyle}
                {...focusHandlers}
              />
            </div>

            {/* Timeline */}
            <div>
              <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '13px' }}>
                Timeline
              </label>
              <select
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full"
                style={fieldStyle}
                {...focusHandlers}
              >
                <option value="">Select timeline</option>
                <option>ASAP — within 2 weeks</option>
                <option>1 month</option>
                <option>1–3 months</option>
                <option>3–6 months</option>
                <option>6+ months</option>
                <option>Just exploring</option>
              </select>
            </div>

            {/* Budget Range */}
            <div>
              <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '13px' }}>
                Budget Range
              </label>
              <select
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                className="w-full"
                style={fieldStyle}
                {...focusHandlers}
              >
                <option value="">Select range</option>
                <option>Under $1,000</option>
                <option>$1,000–$3,000</option>
                <option>$3,000–$7,500</option>
                <option>$7,500–$15,000</option>
                <option>$15,000+</option>
                <option>Unknown / Not discussed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3 — Assessment */}
        <div>
          <SectionLabel>Assessment</SectionLabel>

          <div className="space-y-5">
            {/* Confirmed Monthly Spend */}
            <div>
              <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '13px' }}>
                Confirmed Monthly Spend
              </label>
              <p className="font-body mb-2" style={{ color: '#9CA3AF', fontSize: '12px' }}>
                Auto-calculated from tool stack above. Adjust if needed.
              </p>
              <div className="relative" style={{ maxWidth: '200px' }}>
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 font-body"
                  style={{ color: '#6B7280', fontSize: '14px', pointerEvents: 'none' }}
                >
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  value={monthlySpend || ''}
                  onChange={(e) => setMonthlySpend(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  style={{ ...fieldStyle, paddingLeft: '24px', width: '100%', textAlign: 'right' }}
                  {...focusHandlers}
                />
              </div>
            </div>

            {/* Tier Fit */}
            <div>
              <label className="block font-body font-medium mb-2" style={{ color: '#4A4A4A', fontSize: '13px' }}>
                Recommended Tier Fit
              </label>
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {TIER_OPTIONS.map((tier) => {
                  const selected = tierFit === tier.value
                  return (
                    <button
                      key={tier.value}
                      type="button"
                      onClick={() => setTierFit(tier.value)}
                      className="flex flex-col items-start p-4 rounded-2xl transition-all text-left"
                      style={{
                        border: selected ? '2px solid #8B2FC9' : '1px solid #E5E7EB',
                        background: selected ? '#FAF5FF' : 'white',
                        cursor: 'pointer',
                        gap: '4px',
                      }}
                    >
                      <span
                        className="font-heading font-bold capitalize"
                        style={{ color: selected ? '#8B2FC9' : '#0D0D0D', fontSize: '14px' }}
                      >
                        {tier.label}
                      </span>
                      <span
                        className="font-body"
                        style={{ color: '#6B7280', fontSize: '12px', lineHeight: '1.4' }}
                      >
                        {tier.description}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Internal Notes */}
            <div>
              <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '13px' }}>
                Internal Notes
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything else the team should know before building a proposal..."
                className="resize-none w-full"
                style={fieldStyle}
                {...focusHandlers}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky form actions */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white px-8 py-4 flex items-center justify-between"
        style={{ borderTop: '1px solid #E5E7EB', zIndex: 40, marginLeft: '240px' }}
      >
        {/* Left — save status */}
        <div className="flex items-center gap-2" style={{ minHeight: '24px' }}>
          {saving && (
            <>
              <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#8B2FC9" strokeWidth="4" />
                <path className="opacity-75" fill="#8B2FC9" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="font-body" style={{ color: '#6B7280', fontSize: '13px' }}>Saving...</span>
            </>
          )}
          {saved && !saving && (
            <>
              <Check size={15} style={{ color: '#16A34A' }} />
              <span className="font-body" style={{ color: '#16A34A', fontSize: '13px' }}>Saved</span>
            </>
          )}
        </div>

        {/* Right — action buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => saveEvaluation(false)}
            disabled={saving}
            className="font-body rounded-xl px-5 py-2.5 transition-colors disabled:opacity-60"
            style={{ border: '1px solid #E5E7EB', color: '#4A4A4A', fontSize: '14px', background: 'white', cursor: 'pointer' }}
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => saveEvaluation(true)}
            disabled={saving}
            className="font-heading font-bold uppercase text-white rounded-xl px-5 py-2.5 transition-colors disabled:opacity-60"
            style={{ background: '#8B2FC9', fontSize: '14px', cursor: 'pointer' }}
            onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = '#7A28B8' }}
            onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = '#8B2FC9' }}
          >
            Mark Complete
          </button>
        </div>
      </div>
    </div>
  )
}
