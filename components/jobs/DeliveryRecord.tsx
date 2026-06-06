'use client'

import { useState } from 'react'
import { ExternalLink, AlertTriangle } from 'lucide-react'
import type { Job } from '@/lib/types'

interface Props {
  job: Job
}

type SaveStatus = null | 'saving' | 'saved' | 'error'

const inputClass =
  'w-full border border-[#E5E7EB] rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-[#8B2FC9]'
const labelClass = 'block font-body font-medium mb-1.5 text-[#6B7280] text-xs'

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (!status) return null
  return (
    <div className="text-right mt-2">
      {status === 'saving' && (
        <span className="font-body inline-flex items-center gap-1.5" style={{ fontSize: '12px', color: '#6B7280' }}>
          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Saving...
        </span>
      )}
      {status === 'saved' && (
        <span className="font-body" style={{ fontSize: '12px', color: '#16A34A' }}>Saved ✓</span>
      )}
      {status === 'error' && (
        <span className="font-body" style={{ fontSize: '12px', color: '#E24B4A' }}>Failed</span>
      )}
    </div>
  )
}

export default function DeliveryRecord({ job }: Props) {
  const [liveUrl, setLiveUrl] = useState(job.live_url ?? '')
  const [repoUrl, setRepoUrl] = useState(job.repo_url ?? '')
  const [pocName, setPocName] = useState(job.poc_name ?? '')
  const [pocRole, setPocRole] = useState(job.poc_role ?? '')
  const [credentials, setCredentials] = useState(job.credentials ?? '')
  const [handoffDate, setHandoffDate] = useState(job.handoff_date ?? '')
  const [handoffNotes, setHandoffNotes] = useState(job.handoff_notes ?? '')
  const [internalNotes, setInternalNotes] = useState(job.internal_notes ?? '')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(null)

  async function save(field: string, value: string) {
    setSaveStatus('saving')
    try {
      const res = await fetch(`/api/admin/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value || null }),
      })
      setSaveStatus(res.ok ? 'saved' : 'error')
    } catch {
      setSaveStatus('error')
    }
    setTimeout(() => setSaveStatus(null), 2000)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Live URL</label>
        <div className="flex gap-2">
          <input
            type="url"
            className={inputClass}
            value={liveUrl}
            placeholder="https://clientsite.com"
            onChange={e => setLiveUrl(e.target.value)}
            onBlur={() => save('live_url', liveUrl)}
          />
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center justify-center w-11 rounded-xl border border-[#E5E7EB] hover:border-[#8B2FC9] transition-colors"
            >
              <ExternalLink size={16} style={{ color: '#8B2FC9' }} />
            </a>
          )}
        </div>
      </div>

      <div>
        <label className={labelClass}>Repository</label>
        <input
          type="url"
          className={inputClass}
          value={repoUrl}
          placeholder="https://github.com/..."
          onChange={e => setRepoUrl(e.target.value)}
          onBlur={() => save('repo_url', repoUrl)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Point of Contact</label>
          <input
            className={inputClass}
            value={pocName}
            placeholder="Jane Smith"
            onChange={e => setPocName(e.target.value)}
            onBlur={() => save('poc_name', pocName)}
          />
        </div>
        <div>
          <label className={labelClass}>Their Role</label>
          <input
            className={inputClass}
            value={pocRole}
            placeholder="Owner"
            onChange={e => setPocRole(e.target.value)}
            onBlur={() => save('poc_role', pocRole)}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Login Credentials</label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={3}
          value={credentials}
          placeholder={"Username: admin@client.com\nPassword: ..."}
          onChange={e => setCredentials(e.target.value)}
          onBlur={() => save('credentials', credentials)}
        />
        <div className="flex items-start gap-2 mt-1">
          <AlertTriangle size={12} style={{ color: '#C8922A', marginTop: '2px', flexShrink: 0 }} />
          <p className="font-body" style={{ color: '#C8922A', fontSize: '11px' }}>
            Visible to all admin users. Store sensitive credentials securely.
          </p>
        </div>
      </div>

      <div>
        <label className={labelClass}>Handoff Date</label>
        <input
          type="date"
          className={inputClass}
          value={handoffDate}
          onChange={e => setHandoffDate(e.target.value)}
          onBlur={() => save('handoff_date', handoffDate)}
        />
      </div>

      <div>
        <label className={labelClass}>Handoff Notes</label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={3}
          value={handoffNotes}
          placeholder="Notes for the client handoff..."
          onChange={e => setHandoffNotes(e.target.value)}
          onBlur={() => save('handoff_notes', handoffNotes)}
        />
      </div>

      <div>
        <label className={labelClass}>Internal Notes</label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={3}
          value={internalNotes}
          placeholder="Internal team notes — not shared with client..."
          onChange={e => setInternalNotes(e.target.value)}
          onBlur={() => save('internal_notes', internalNotes)}
        />
      </div>

      <SaveIndicator status={saveStatus} />
    </div>
  )
}
