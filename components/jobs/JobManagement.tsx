'use client'

import { useState } from 'react'
import type { Job, JobStatus, JobPriority } from '@/lib/types'

interface Props {
  job: Job
}

type SaveStatus = null | 'saving' | 'saved' | 'error'

const STATUS_OPTIONS: { value: JobStatus; label: string }[] = [
  { value: 'queued', label: 'Queued' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'In Review' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'on_hold', label: 'On Hold' },
]

const PRIORITY_OPTIONS: {
  value: JobPriority
  label: string
  sel: { bg: string; border: string; color: string }
}[] = [
  { value: 'low',    label: 'Low',    sel: { bg: '#F9F9F9', border: '#E5E7EB', color: '#9CA3AF' } },
  { value: 'medium', label: 'Medium', sel: { bg: '#F3F4F6', border: '#9CA3AF', color: '#6B7280' } },
  { value: 'high',   label: 'High',   sel: { bg: '#FEF3C7', border: '#C8922A', color: '#92400E' } },
  { value: 'urgent', label: 'Urgent', sel: { bg: '#FCEBEB', border: '#E24B4A', color: '#991B1B' } },
]

const inputClass =
  'w-full border border-[#E5E7EB] rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-[#8B2FC9]'
const labelClass = 'block font-body font-medium mb-2 text-[#6B7280] text-xs'

export default function JobManagement({ job }: Props) {
  const [status, setStatus] = useState<JobStatus>(job.status)
  const [priority, setPriority] = useState<JobPriority>(job.priority)
  const [assignedTo, setAssignedTo] = useState(job.assigned_to ?? '')
  const [dueDate, setDueDate] = useState(job.due_date ?? '')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(null)

  async function save(fields: Record<string, string | null>) {
    setSaveStatus('saving')
    try {
      const res = await fetch(`/api/admin/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      setSaveStatus(res.ok ? 'saved' : 'error')
    } catch {
      setSaveStatus('error')
    }
    setTimeout(() => setSaveStatus(null), 2000)
  }

  async function handleStatusChange(value: JobStatus) {
    setStatus(value)
    const fields: Record<string, string | null> = { status: value }
    if (value === 'delivered') fields.completed_at = new Date().toISOString()
    await save(fields)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 mb-4" style={{ border: '1px solid #E5E7EB' }}>
      <p
        className="font-body uppercase pb-3 mb-4"
        style={{ color: '#6B7280', fontSize: '11px', letterSpacing: '0.08em', borderBottom: '1px solid #F5F5F5' }}
      >
        Management
      </p>

      <div className="mb-4">
        <label className={labelClass}>Status</label>
        <select
          className={inputClass}
          value={status}
          onChange={e => handleStatusChange(e.target.value as JobStatus)}
        >
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className={labelClass}>Priority</label>
        <div className="flex gap-2 flex-wrap">
          {PRIORITY_OPTIONS.map(opt => {
            const isSelected = priority === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setPriority(opt.value)
                  save({ priority: opt.value })
                }}
                className="font-body font-medium px-3 py-1.5 rounded-full transition-colors"
                style={
                  isSelected
                    ? { fontSize: '12px', background: opt.sel.bg, border: `1px solid ${opt.sel.border}`, color: opt.sel.color }
                    : { fontSize: '12px', background: '#FFFFFF', border: '1px solid #E5E7EB', color: '#9CA3AF' }
                }
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mb-4">
        <label className={labelClass}>Assigned To</label>
        <input
          className={inputClass}
          value={assignedTo}
          onChange={e => setAssignedTo(e.target.value)}
          onBlur={() => save({ assigned_to: assignedTo || null })}
        />
      </div>

      <div className="mb-2">
        <label className={labelClass}>Due Date</label>
        <input
          type="date"
          className={inputClass}
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          onBlur={() => save({ due_date: dueDate || null })}
        />
      </div>

      <div className="text-right mt-2">
        {saveStatus === 'saving' && (
          <span className="font-body inline-flex items-center gap-1.5" style={{ fontSize: '12px', color: '#6B7280' }}>
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Saving...
          </span>
        )}
        {saveStatus === 'saved' && (
          <span className="font-body" style={{ fontSize: '12px', color: '#16A34A' }}>Saved ✓</span>
        )}
        {saveStatus === 'error' && (
          <span className="font-body" style={{ fontSize: '12px', color: '#E24B4A' }}>Failed</span>
        )}
      </div>
    </div>
  )
}
