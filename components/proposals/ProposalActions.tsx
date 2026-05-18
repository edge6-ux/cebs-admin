'use client'

import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

interface Props {
  proposalId: string
  status: string
  leadId: string
}

export default function ProposalActions({ proposalId, status, leadId: _leadId }: Props) {
  const [loading, setLoading] = useState<'accepted' | 'declined' | null>(null)

  if (status !== 'sent') return null

  async function handleUpdate(newStatus: 'accepted' | 'declined') {
    setLoading(newStatus)
    try {
      const res = await fetch(`/api/admin/proposals/${proposalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        window.location.reload()
      } else {
        alert('Failed to update proposal')
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex gap-2 mt-3">
      <button
        onClick={() => handleUpdate('accepted')}
        disabled={loading !== null}
        className="flex items-center gap-1.5 font-body font-medium text-white rounded-xl px-3 py-2 transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: '#16A34A', fontSize: '13px' }}
      >
        {loading === 'accepted' ? (
          <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <CheckCircle size={13} />
        )}
        Mark Accepted
      </button>

      <button
        onClick={() => handleUpdate('declined')}
        disabled={loading !== null}
        className="flex items-center gap-1.5 font-body rounded-xl px-3 py-2 transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ border: '1px solid #E24B4A', color: '#E24B4A', fontSize: '13px', background: 'white' }}
      >
        {loading === 'declined' ? (
          <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <XCircle size={13} />
        )}
        Mark Declined
      </button>
    </div>
  )
}
