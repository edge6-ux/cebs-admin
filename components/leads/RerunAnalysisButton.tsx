'use client'

import { useState } from 'react'

export default function RerunAnalysisButton({ leadId }: { leadId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRerun() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/analyze`, { method: 'POST' })
      if (res.ok) {
        window.location.reload()
      } else {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? 'Analysis failed.')
        setLoading(false)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed.')
      setLoading(false)
    }
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
    {error && (
      <p className="font-body" style={{ color: '#E24B4A', fontSize: '12px' }}>
        {error}
      </p>
    )}
    <button
      onClick={handleRerun}
      disabled={loading}
      className="font-body rounded-lg px-3 py-1.5 transition-colors disabled:opacity-60"
      style={{ border: '1px solid #E5E7EB', fontSize: '12px', color: '#6B7280' }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.borderColor = '#8B2FC9'
          e.currentTarget.style.color = '#8B2FC9'
        }
      }}
      onMouseLeave={(e) => {
        if (!loading) {
          e.currentTarget.style.borderColor = '#E5E7EB'
          e.currentTarget.style.color = '#6B7280'
        }
      }}
    >
      {loading ? 'Running...' : 'Re-run Analysis'}
    </button>
    </div>
  )
}
