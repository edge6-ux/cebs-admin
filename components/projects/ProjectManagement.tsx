'use client'

import { useState } from 'react'
import type { Project } from '@/lib/types'

interface Props {
  project: Project
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #E5E7EB',
  borderRadius: '12px',
  padding: '10px 14px',
  fontFamily: 'var(--font-inter), sans-serif',
  fontSize: '14px',
  color: '#0D0D0D',
  background: 'white',
  outline: 'none',
}

function FieldLabel({ children }: { children: string }) {
  return (
    <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '13px' }}>
      {children}
    </label>
  )
}

export default function ProjectManagement({ project }: Props) {
  const [status, setStatus]                   = useState(project.status)
  const [contractValue, setContractValue]     = useState(project.contract_value)
  const [monthlyRetainer, setMonthlyRetainer] = useState(project.monthly_retainer)
  const [startDate, setStartDate]             = useState(project.start_date ?? '')
  const [targetDate, setTargetDate]           = useState(project.target_date ?? '')
  const [notes, setNotes]                     = useState(project.notes ?? '')
  const [saving, setSaving]                   = useState(false)
  const [saved, setSaved]                     = useState(false)
  const [error, setError]                     = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          contract_value:   contractValue,
          monthly_retainer: monthlyRetainer,
          start_date:  startDate  || null,
          target_date: targetDate || null,
          notes,
          updated_at: new Date().toISOString(),
        }),
      })

      if (!res.ok) throw new Error('Failed')

      setSaved(true)
      setSaving(false)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setError('Failed to save')
      setSaving(false)
    }
  }

  return (
    <div
      className="bg-white rounded-2xl shadow-sm p-5 mb-4"
      style={{ border: '1px solid #E5E7EB' }}
    >
      <p
        className="font-body uppercase pb-3 mb-4"
        style={{ color: '#6B7280', fontSize: '11px', letterSpacing: '0.08em', borderBottom: '1px solid #F5F5F5' }}
      >
        Project Details
      </p>

      {/* Status */}
      <div className="mb-4">
        <FieldLabel>Status</FieldLabel>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Project['status'])}
          style={{ ...inputStyle, cursor: 'pointer' }}
          onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px #8B2FC9'; e.currentTarget.style.borderColor = '#8B2FC9' }}
          onBlur={(e)  => { e.currentTarget.style.boxShadow = 'none';               e.currentTarget.style.borderColor = '#E5E7EB' }}
        >
          <option value="kickoff">Kickoff</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="complete">Complete</option>
          <option value="on_hold">On Hold</option>
        </select>
      </div>

      {/* Contract Value */}
      <div className="mb-4">
        <FieldLabel>Contract Value</FieldLabel>
        <div className="relative">
          <span
            className="absolute left-3.5 top-1/2 -translate-y-1/2 font-body"
            style={{ color: '#6B7280', fontSize: '14px', pointerEvents: 'none' }}
          >
            $
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={contractValue}
            onChange={(e) => setContractValue(parseFloat(e.target.value) || 0)}
            style={{ ...inputStyle, paddingLeft: '26px' }}
            onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px #8B2FC9'; e.currentTarget.style.borderColor = '#8B2FC9' }}
            onBlur={(e)  => { e.currentTarget.style.boxShadow = 'none';               e.currentTarget.style.borderColor = '#E5E7EB' }}
          />
        </div>
      </div>

      {/* Monthly Retainer */}
      <div className="mb-4">
        <FieldLabel>Monthly Retainer</FieldLabel>
        <div className="relative">
          <span
            className="absolute left-3.5 top-1/2 -translate-y-1/2 font-body"
            style={{ color: '#6B7280', fontSize: '14px', pointerEvents: 'none' }}
          >
            $
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={monthlyRetainer}
            onChange={(e) => setMonthlyRetainer(parseFloat(e.target.value) || 0)}
            style={{ ...inputStyle, paddingLeft: '26px' }}
            onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px #8B2FC9'; e.currentTarget.style.borderColor = '#8B2FC9' }}
            onBlur={(e)  => { e.currentTarget.style.boxShadow = 'none';               e.currentTarget.style.borderColor = '#E5E7EB' }}
          />
        </div>
        <p className="font-body mt-1" style={{ color: '#9CA3AF', fontSize: '12px' }}>
          0 if no retainer
        </p>
      </div>

      {/* Start Date */}
      <div className="mb-4">
        <FieldLabel>Start Date</FieldLabel>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px #8B2FC9'; e.currentTarget.style.borderColor = '#8B2FC9' }}
          onBlur={(e)  => { e.currentTarget.style.boxShadow = 'none';               e.currentTarget.style.borderColor = '#E5E7EB' }}
        />
      </div>

      {/* Target Date */}
      <div className="mb-4">
        <FieldLabel>Target Date</FieldLabel>
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px #8B2FC9'; e.currentTarget.style.borderColor = '#8B2FC9' }}
          onBlur={(e)  => { e.currentTarget.style.boxShadow = 'none';               e.currentTarget.style.borderColor = '#E5E7EB' }}
        />
      </div>

      {/* Notes */}
      <div className="mb-4">
        <FieldLabel>Notes</FieldLabel>
        <textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Project notes, context, or any important details..."
          className="resize-none"
          style={{ ...inputStyle, lineHeight: '1.7' }}
          onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px #8B2FC9'; e.currentTarget.style.borderColor = '#8B2FC9' }}
          onBlur={(e)  => { e.currentTarget.style.boxShadow = 'none';               e.currentTarget.style.borderColor = '#E5E7EB' }}
        />
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full font-body font-medium rounded-xl transition-all"
        style={{
          background: '#8B2FC9',
          color: 'white',
          fontSize: '14px',
          padding: '10px 20px',
          opacity: saving ? 0.6 : 1,
          cursor: saving ? 'not-allowed' : 'pointer',
          marginTop: '8px',
        }}
        onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = '#7A28B8' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#8B2FC9' }}
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>

      {saved && (
        <p className="font-body mt-2 text-center" style={{ color: '#16A34A', fontSize: '13px' }}>
          Saved ✓
        </p>
      )}
      {error && (
        <p className="font-body mt-2 text-center" style={{ color: '#E24B4A', fontSize: '13px' }}>
          {error}
        </p>
      )}
    </div>
  )
}
