'use client'

import { useState, useCallback } from 'react'
import type { Customer } from '@/lib/types'

interface Props {
  customer: Customer
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p
      className="font-body uppercase pb-3 mb-4"
      style={{ color: '#6B7280', fontSize: '11px', letterSpacing: '0.08em', borderBottom: '1px solid #F5F5F5' }}
    >
      {children}
    </p>
  )
}

const labelStyle = {
  color: '#4A4A4A',
  fontSize: '12px',
  fontWeight: 500,
  display: 'block' as const,
  marginBottom: '6px',
}

const inputClass = 'w-full font-body bg-white rounded-xl px-3 py-2 outline-none transition-colors'
const inputStyle = { border: '1px solid #E5E7EB', color: '#0D0D0D', fontSize: '14px' }

export default function CustomerManagement({ customer }: Props) {
  const [status, setStatus]               = useState(customer.status)
  const [website, setWebsite]             = useState(customer.website ?? '')
  const [notes, setNotes]                 = useState(customer.notes ?? '')
  const [onRetainer, setOnRetainer]       = useState(customer.on_retainer)
  const [retainerAmount, setRetainerAmount] = useState(String(customer.retainer_amount ?? ''))
  const [saveStatus, setSaveStatus]       = useState<null | 'saving' | 'saved' | 'error'>(null)

  const save = useCallback(async (patch: Record<string, unknown>) => {
    setSaveStatus('saving')
    try {
      const res = await fetch(`/api/admin/customers/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!res.ok) throw new Error()
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus(null), 2000)
    } catch {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus(null), 2000)
    }
  }, [customer.id])

  function handleStatusChange(val: string) {
    setStatus(val as Customer['status'])
    save({ status: val })
  }

  function handleRetainerToggle() {
    const next = !onRetainer
    setOnRetainer(next)
    save({ on_retainer: next })
  }

  return (
    <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
      <SectionLabel>Account Details</SectionLabel>

      {/* Status */}
      <div className="mb-4">
        <label style={labelStyle}>Status</label>
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className={inputClass + ' cursor-pointer'}
          style={inputStyle}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="churned">Churned</option>
        </select>
      </div>

      {/* Website */}
      <div className="mb-4">
        <label style={labelStyle}>Website</label>
        <input
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          onBlur={() => save({ website })}
          placeholder="https://"
          className={inputClass}
          style={inputStyle}
        />
      </div>

      {/* On retainer toggle */}
      <div className="mb-4 flex items-center justify-between">
        <label style={{ ...labelStyle, marginBottom: 0 }}>On Retainer</label>
        <button
          type="button"
          onClick={handleRetainerToggle}
          className="relative flex-shrink-0 transition-colors"
          style={{
            width: '40px',
            height: '22px',
            borderRadius: '11px',
            background: onRetainer ? '#8B2FC9' : '#E5E7EB',
          }}
          aria-checked={onRetainer}
          role="switch"
        >
          <span
            className="absolute top-0.5 transition-transform"
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              left: '2px',
              transform: onRetainer ? 'translateX(18px)' : 'translateX(0)',
            }}
          />
        </button>
      </div>

      {/* Retainer amount */}
      {onRetainer && (
        <div className="mb-4">
          <label style={labelStyle}>Monthly Amount</label>
          <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
            <span
              className="font-body px-3 py-2 bg-gray-50 flex-shrink-0"
              style={{ color: '#6B7280', fontSize: '14px', borderRight: '1px solid #E5E7EB' }}
            >
              $
            </span>
            <input
              type="number"
              min="0"
              value={retainerAmount}
              onChange={(e) => setRetainerAmount(e.target.value)}
              onBlur={() => save({ retainer_amount: Number(retainerAmount) || 0 })}
              className="flex-1 font-body bg-white px-3 py-2 outline-none"
              style={{ color: '#0D0D0D', fontSize: '14px' }}
            />
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="mb-2">
        <label style={labelStyle}>Notes</label>
        <textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => save({ notes })}
          className={inputClass}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {/* Save status */}
      <div className="text-right" style={{ minHeight: '18px' }}>
        {saveStatus === 'saving' && (
          <span className="font-body" style={{ color: '#9CA3AF', fontSize: '12px' }}>
            Saving...
          </span>
        )}
        {saveStatus === 'saved' && (
          <span className="font-body" style={{ color: '#16A34A', fontSize: '12px' }}>
            Saved ✓
          </span>
        )}
        {saveStatus === 'error' && (
          <span className="font-body" style={{ color: '#E24B4A', fontSize: '12px' }}>
            Failed
          </span>
        )}
      </div>
    </div>
  )
}
