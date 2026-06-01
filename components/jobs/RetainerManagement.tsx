'use client'

import { useState } from 'react'
import type { Job } from '@/lib/types'

interface Props {
  job: Job
}

type SaveStatus = null | 'saving' | 'saved' | 'error'

export default function RetainerManagement({ job }: Props) {
  const [status, setStatus] = useState<Job['status']>(job.status)
  const [assignedTo, setAssignedTo] = useState(job.assigned_to)
  const [description, setDescription] = useState(job.description)
  const [dueDate, setDueDate] = useState(job.due_date ?? '')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(null)

  async function save(fields: Record<string, string | null | undefined>) {
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

  return (
    <div
      className="bg-white rounded-2xl shadow-sm p-5 mb-4"
      style={{ border: '1px solid #E5E7EB' }}
    >
      <p
        className="font-body uppercase pb-3 mb-4"
        style={{
          color: '#9CA3AF',
          fontSize: '11px',
          letterSpacing: '0.08em',
          borderBottom: '1px solid #F5F5F5',
        }}
      >
        Management
      </p>

      {/* Status */}
      <div className="mb-4">
        <label
          className="font-body block mb-1.5"
          style={{ color: '#6B7280', fontSize: '12px' }}
        >
          Status
        </label>
        <select
          className="w-full font-body rounded-xl px-3 py-2"
          style={{ border: '1px solid #E5E7EB', fontSize: '14px', color: '#0D0D0D' }}
          value={status}
          onChange={(e) => {
            const next = e.target.value as Job['status']
            setStatus(next)
            save({ status: next })
          }}
        >
          <option value="queued">Queued</option>
          <option value="in_progress">Active</option>
          <option value="on_hold">Paused</option>
        </select>
      </div>

      {/* Scope of Work */}
      <div className="mb-4">
        <label
          className="font-body block mb-1.5"
          style={{ color: '#6B7280', fontSize: '12px' }}
        >
          Scope of Work
        </label>
        <textarea
          rows={4}
          className="w-full font-body resize-none rounded-xl px-3 py-2"
          style={{ border: '1px solid #E5E7EB', fontSize: '14px', color: '#0D0D0D' }}
          placeholder="Describe what's included in this retainer each month..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => save({ description })}
        />
      </div>

      {/* Assigned To */}
      <div className="mb-4">
        <label
          className="font-body block mb-1.5"
          style={{ color: '#6B7280', fontSize: '12px' }}
        >
          Assigned To
        </label>
        <input
          type="text"
          className="w-full font-body rounded-xl px-3 py-2"
          style={{ border: '1px solid #E5E7EB', fontSize: '14px', color: '#0D0D0D' }}
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          onBlur={() => save({ assigned_to: assignedTo })}
        />
      </div>

      {/* Next Billing Date */}
      <div className="mb-2">
        <label
          className="font-body block mb-1.5"
          style={{ color: '#6B7280', fontSize: '12px' }}
        >
          Next Billing Date
        </label>
        <input
          type="date"
          className="w-full font-body rounded-xl px-3 py-2"
          style={{ border: '1px solid #E5E7EB', fontSize: '14px', color: '#0D0D0D' }}
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          onBlur={() => save({ due_date: dueDate || null })}
        />
      </div>

      {/* Save status indicator */}
      {saveStatus && (
        <p
          className="font-body text-right mt-2"
          style={{
            fontSize: '12px',
            color:
              saveStatus === 'saved'
                ? '#16A34A'
                : saveStatus === 'error'
                  ? '#E24B4A'
                  : '#6B7280',
          }}
        >
          {saveStatus === 'saving'
            ? 'Saving...'
            : saveStatus === 'saved'
              ? 'Saved ✓'
              : 'Failed'}
        </p>
      )}
    </div>
  )
}
