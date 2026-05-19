'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Plus } from 'lucide-react'
import type { Customer, Project } from '@/lib/types'

interface Props {
  customers: Pick<Customer, 'id' | 'business_name' | 'contact_name' | 'email'>[]
  preselectedCustomer?: Customer | null
  preselectedProject?: Project | null
}

const typeOptions = [
  { value: 'website',      label: 'Website',      selectedBg: '#DBEAFE',              selectedBorder: '#1D4ED8', selectedColor: '#1D4ED8' },
  { value: 'optimization', label: 'Optimization', selectedBg: '#D1FAE5',              selectedBorder: '#16A34A', selectedColor: '#16A34A' },
  { value: 'custom_build', label: 'Custom Build', selectedBg: '#EDE9FE',              selectedBorder: '#6D28D9', selectedColor: '#6D28D9' },
  { value: 'retainer',     label: 'Retainer',     selectedBg: 'rgba(139,47,201,0.1)', selectedBorder: '#8B2FC9', selectedColor: '#8B2FC9' },
  { value: 'other',        label: 'Other',        selectedBg: '#F3F4F6',              selectedBorder: '#6B7280', selectedColor: '#6B7280' },
]

const priorityOptions = [
  { value: 'low',    label: 'Low',    selectedBg: '#F3F4F6', selectedBorder: '#9CA3AF', selectedColor: '#6B7280' },
  { value: 'medium', label: 'Medium', selectedBg: '#DBEAFE', selectedBorder: '#1D4ED8', selectedColor: '#1D4ED8' },
  { value: 'high',   label: 'High',   selectedBg: '#FEF3C7', selectedBorder: '#C8922A', selectedColor: '#92400E' },
  { value: 'urgent', label: 'Urgent', selectedBg: '#FCEBEB', selectedBorder: '#E24B4A', selectedColor: '#991B1B' },
]

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

function FieldLabel({ children }: { children: string }) {
  return (
    <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '13px' }}>
      {children}
    </label>
  )
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export default function NewJobForm({ customers, preselectedCustomer, preselectedProject }: Props) {
  const router = useRouter()
  const [customerId, setCustomerId] = useState(preselectedCustomer?.id ?? '')
  const [projectId]                 = useState(preselectedProject?.id ?? '')
  const [title, setTitle]           = useState('')
  const [description, setDescription] = useState('')
  const [type, setType]             = useState('website')
  const [priority, setPriority]     = useState('medium')
  const [assignedTo, setAssignedTo] = useState('')
  const [dueDate, setDueDate]       = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState<string | null>(null)

  async function handleSubmit() {
    if (!title || !customerId) {
      setError('Title and customer are required.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id:    customerId,
          project_id:     projectId || null,
          title,
          description,
          type,
          priority,
          assigned_to:    assignedTo,
          due_date:       dueDate || null,
          internal_notes: internalNotes,
          status:         'queued',
        }),
      })

      if (!res.ok) throw new Error('Failed to create')

      const job = await res.json() as { id: string }
      router.push(`/dashboard/jobs/${job.id}`)
    } catch {
      setError('Failed to create job. Please try again.')
      setSaving(false)
    }
  }

  return (
    <>
      {/* Back */}
      <Link
        href="/dashboard/jobs"
        className="inline-flex items-center gap-1 font-body mb-6 transition-colors hover:text-[#0D0D0D]"
        style={{ color: '#6B7280', fontSize: '14px' }}
      >
        <ChevronLeft size={16} />
        Back to Jobs
      </Link>

      {/* Header */}
      <div className="mb-6">
        <p className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '22px' }}>
          New Job
        </p>
        <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '14px' }}>
          Manually create a job and assign it to a customer.
        </p>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8" style={{ border: '1px solid #E5E7EB' }}>

        {/* Section 1 — Job Details */}
        <div>
          <SectionLabel>Job Details</SectionLabel>
          <div className="space-y-5">

            <div>
              <FieldLabel>Job Title</FieldLabel>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Website Build — Smith's Auto Repair"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px #8B2FC9'; e.currentTarget.style.borderColor = '#8B2FC9' }}
                onBlur={(e)  => { e.currentTarget.style.boxShadow = 'none';               e.currentTarget.style.borderColor = '#E5E7EB' }}
              />
            </div>

            <div>
              <FieldLabel>Description</FieldLabel>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what needs to be built or done. Include any relevant context from the client conversation."
                className="resize-none"
                style={{ ...inputStyle, lineHeight: '1.7' }}
                onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px #8B2FC9'; e.currentTarget.style.borderColor = '#8B2FC9' }}
                onBlur={(e)  => { e.currentTarget.style.boxShadow = 'none';               e.currentTarget.style.borderColor = '#E5E7EB' }}
              />
            </div>

            <div>
              <FieldLabel>Job Type</FieldLabel>
              <div className="flex gap-2 flex-wrap">
                {typeOptions.map((opt) => {
                  const sel = type === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setType(opt.value)}
                      className="font-body font-medium transition-all duration-150"
                      style={{
                        fontSize: '13px',
                        padding: '8px 16px',
                        borderRadius: '9999px',
                        cursor: 'pointer',
                        background: sel ? opt.selectedBg     : 'white',
                        border:     `1px solid ${sel ? opt.selectedBorder : '#E5E7EB'}`,
                        color:      sel ? opt.selectedColor  : '#4A4A4A',
                      }}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <FieldLabel>Priority</FieldLabel>
              <div className="flex gap-2 flex-wrap">
                {priorityOptions.map((opt) => {
                  const sel = priority === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPriority(opt.value)}
                      className="font-body font-medium transition-all duration-150"
                      style={{
                        fontSize: '13px',
                        padding: '8px 16px',
                        borderRadius: '9999px',
                        cursor: 'pointer',
                        background: sel ? opt.selectedBg     : 'white',
                        border:     `1px solid ${sel ? opt.selectedBorder : '#E5E7EB'}`,
                        color:      sel ? opt.selectedColor  : '#4A4A4A',
                      }}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Section 2 — Assignment */}
        <div>
          <SectionLabel>Assignment</SectionLabel>
          <div className="space-y-5">

            <div>
              <FieldLabel>Customer</FieldLabel>
              {preselectedCustomer ? (
                <div
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ background: '#F9F9F9', border: '1px solid #E5E7EB' }}
                >
                  <div
                    className="flex items-center justify-center rounded-full flex-shrink-0"
                    style={{ width: '32px', height: '32px', background: '#0D0D0D' }}
                  >
                    <span className="font-heading font-bold" style={{ color: 'white', fontSize: '12px' }}>
                      {initials(preselectedCustomer.business_name)}
                    </span>
                  </div>
                  <div>
                    <p className="font-body font-bold" style={{ color: '#0D0D0D', fontSize: '14px' }}>
                      {preselectedCustomer.business_name}
                    </p>
                    <p className="font-body" style={{ color: '#6B7280', fontSize: '12px' }}>
                      {preselectedCustomer.email}
                    </p>
                  </div>
                </div>
              ) : (
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px #8B2FC9'; e.currentTarget.style.borderColor = '#8B2FC9' }}
                  onBlur={(e)  => { e.currentTarget.style.boxShadow = 'none';               e.currentTarget.style.borderColor = '#E5E7EB' }}
                >
                  <option value="">Select a customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.business_name} — {c.contact_name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <FieldLabel>Assigned To</FieldLabel>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Team member handling this job"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px #8B2FC9'; e.currentTarget.style.borderColor = '#8B2FC9' }}
                onBlur={(e)  => { e.currentTarget.style.boxShadow = 'none';               e.currentTarget.style.borderColor = '#E5E7EB' }}
              />
            </div>

            <div>
              <FieldLabel>Due Date</FieldLabel>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px #8B2FC9'; e.currentTarget.style.borderColor = '#8B2FC9' }}
                onBlur={(e)  => { e.currentTarget.style.boxShadow = 'none';               e.currentTarget.style.borderColor = '#E5E7EB' }}
              />
            </div>

          </div>
        </div>

        {/* Section 3 — Additional Context */}
        <div>
          <SectionLabel>Additional Context</SectionLabel>
          <p className="font-body mb-4" style={{ color: '#6B7280', fontSize: '13px' }}>
            Optional — add any extra context the team needs to complete this job.
          </p>
          <div>
            <FieldLabel>Internal Notes</FieldLabel>
            <textarea
              rows={3}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Login details, access instructions, client preferences..."
              className="resize-none"
              style={{ ...inputStyle, lineHeight: '1.7' }}
              onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px #8B2FC9'; e.currentTarget.style.borderColor = '#8B2FC9' }}
              onBlur={(e)  => { e.currentTarget.style.boxShadow = 'none';               e.currentTarget.style.borderColor = '#E5E7EB' }}
            />
          </div>
        </div>

      </div>

      {/* Sticky footer */}
      <div
        className="sticky bottom-0 flex items-center justify-between mt-8 px-8 py-4"
        style={{ background: 'white', borderTop: '1px solid #E5E7EB' }}
      >
        <Link
          href="/dashboard/jobs"
          className="font-body transition-colors hover:text-[#0D0D0D]"
          style={{ color: '#6B7280', fontSize: '14px' }}
        >
          Cancel
        </Link>

        <div className="flex flex-col items-end gap-1.5">
          <button
            onClick={handleSubmit}
            disabled={saving || !title || !customerId}
            className="flex items-center gap-2 font-heading font-bold uppercase text-white rounded-xl px-6 py-2.5"
            style={{
              background: '#8B2FC9',
              fontSize: '14px',
              cursor:  saving || !title || !customerId ? 'not-allowed' : 'pointer',
              opacity: saving || !title || !customerId ? 0.5 : 1,
              transition: 'opacity 150ms',
            }}
            onMouseEnter={(e) => { if (!saving && title && customerId) e.currentTarget.style.background = '#7A28B8' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#8B2FC9' }}
          >
            {saving ? (
              <>
                <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Creating...
              </>
            ) : (
              <>
                <Plus size={15} />
                Create Job
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
    </>
  )
}
