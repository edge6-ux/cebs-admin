'use client'

import { useState } from 'react'
import type { Lead } from '@/lib/types'

type SaveStatus = null | 'saving' | 'saved' | 'error'

const inputStyle: React.CSSProperties = {
  border: '1px solid #E5E7EB',
  borderRadius: '12px',
  padding: '10px 12px',
  fontFamily: 'var(--font-inter), sans-serif',
  fontSize: '14px',
  background: 'white',
  width: '100%',
  outline: 'none',
  color: '#0D0D0D',
}

export default function LeadManagement({ lead }: { lead: Lead }) {
  const [status, setStatus] = useState(lead.status)
  const [assignedTo, setAssignedTo] = useState(lead.assigned_to ?? '')
  const [notes, setNotes] = useState(lead.notes ?? '')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(null)

  async function save(fields: Partial<Lead>) {
    setSaveStatus('saving')
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus(null), 2000)
    } catch {
      setSaveStatus('error')
    }
  }

  return (
    <div
      className="bg-white rounded-2xl p-5 mb-4 shadow-sm"
      style={{ border: '1px solid #E5E7EB' }}
    >
      <p
        className="font-body uppercase pb-3 mb-5"
        style={{
          color: '#6B7280',
          fontSize: '11px',
          letterSpacing: '0.08em',
          borderBottom: '1px solid #F5F5F5',
        }}
      >
        Lead Management
      </p>

      {/* Status */}
      <div className="mb-4">
        <p className="font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '13px' }}>
          Status
        </p>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as Lead['status'])
            save({ status: e.target.value as Lead['status'] })
          }}
          className="focus:ring-2 focus:ring-[#8B2FC9] cursor-pointer"
          style={inputStyle}
        >
          <option value="new">New</option>
          <option value="reviewed">Reviewed</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
          <option value="not_a_fit">Not a Fit</option>
        </select>
      </div>

      {/* Assigned to */}
      <div className="mb-4">
        <p className="font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '13px' }}>
          Assigned To
        </p>
        <input
          type="text"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          onBlur={() => save({ assigned_to: assignedTo })}
          placeholder="Assign to team member..."
          className="focus:ring-2 focus:ring-[#8B2FC9]"
          style={inputStyle}
        />
      </div>

      {/* Notes */}
      <div className="mb-2">
        <p className="font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '13px' }}>
          Notes
        </p>
        <textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => save({ notes })}
          placeholder="Add internal notes about this lead..."
          className="resize-none focus:ring-2 focus:ring-[#8B2FC9]"
          style={inputStyle}
        />
      </div>

      {/* Save status indicator */}
      <div className="text-right mt-1" style={{ minHeight: '18px' }}>
        {saveStatus === 'saving' && (
          <span className="font-body inline-flex items-center gap-1.5" style={{ color: '#6B7280', fontSize: '12px' }}>
            <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Saving...
          </span>
        )}
        {saveStatus === 'saved' && (
          <span className="font-body" style={{ color: '#16A34A', fontSize: '12px' }}>Saved ✓</span>
        )}
        {saveStatus === 'error' && (
          <span className="font-body" style={{ color: '#E24B4A', fontSize: '12px' }}>Failed to save</span>
        )}
      </div>
    </div>
  )
}
