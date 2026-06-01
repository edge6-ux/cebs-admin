'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import DeleteButton from '@/components/ui/DeleteButton'

interface Props {
  proposalId: string
  status: string
  leadId: string
  customerEmail: string
  customerName: string
}

const btnBase: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 16px',
  borderRadius: '12px',
  fontSize: '14px',
  fontFamily: 'var(--font-inter), sans-serif',
  cursor: 'pointer',
  border: 'none',
}

export default function ProposalDetailActions({
  proposalId,
  status,
  leadId,
  customerEmail,
  customerName,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<'accepted' | 'declined' | null>(null)

  async function handleUpdate(newStatus: 'accepted' | 'declined') {
    setLoading(newStatus)
    try {
      const res = await fetch(`/api/admin/proposals/${proposalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) router.refresh()
      else alert('Failed to update proposal')
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <div className="space-y-2">
        {status === 'draft' && (
          <button
            onClick={() => router.push(`/dashboard/proposals/${proposalId}/email`)}
            style={{ ...btnBase, background: '#8B2FC9', color: 'white', fontWeight: 500 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#7A28B8' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#8B2FC9' }}
          >
            <Send size={15} />
            Send Proposal Email
          </button>
        )}

        {status === 'sent' && (
          <>
            <button
              onClick={() => handleUpdate('accepted')}
              disabled={loading !== null}
              style={{ ...btnBase, background: '#16A34A', color: 'white', fontWeight: 500, opacity: loading !== null ? 0.6 : 1 }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#15803D' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#16A34A' }}
            >
              {loading === 'accepted' ? (
                <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : <CheckCircle size={15} />}
              Mark as Accepted
            </button>

            <button
              onClick={() => handleUpdate('declined')}
              disabled={loading !== null}
              style={{ ...btnBase, background: 'white', color: '#E24B4A', border: '1px solid #E24B4A', fontWeight: 400, opacity: loading !== null ? 0.6 : 1 }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#FFF5F5' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'white' }}
            >
              {loading === 'declined' ? (
                <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : <XCircle size={15} />}
              Mark as Declined
            </button>
          </>
        )}

        <button
          onClick={() => router.push(`/dashboard/leads/${leadId}`)}
          style={{ ...btnBase, background: 'white', color: '#4A4A4A', border: '1px solid #E5E7EB', fontWeight: 400 }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#F9F9F9' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'white' }}
        >
          <ExternalLink size={15} style={{ color: '#6B7280' }} />
          View Lead
        </button>

        <div className="pt-1">
          <DeleteButton
            label="Delete Proposal"
            onConfirm={async () => {
              const res = await fetch(`/api/admin/proposals/${proposalId}`, { method: 'DELETE' })
              if (res.ok) router.push(`/dashboard/leads/${leadId}`)
            }}
          />
        </div>
      </div>

    </>
  )
}
