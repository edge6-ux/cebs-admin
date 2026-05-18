'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'

export default function RunAnalysisButton({ leadId }: { leadId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRun() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/analyze`, { method: 'POST' })
      if (res.ok) {
        window.location.reload()
      } else {
        setError('Analysis failed. Please try again.')
        setLoading(false)
      }
    } catch {
      setError('Analysis failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Sparkles size={32} style={{ color: '#8B2FC9' }} />
      <p className="font-body" style={{ color: '#6B7280', fontSize: '14px' }}>
        No analysis yet
      </p>
      <button
        onClick={handleRun}
        disabled={loading}
        className="flex items-center gap-2 font-body font-medium text-white rounded-xl px-5 py-2.5 transition-colors disabled:opacity-60"
        style={{ background: '#8B2FC9', fontSize: '14px' }}
        onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#7A28B8' }}
        onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#8B2FC9' }}
      >
        {loading ? (
          <>
            <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles size={15} />
            Run AI Analysis
          </>
        )}
      </button>
      {error && (
        <p className="font-body mt-2" style={{ color: '#E24B4A', fontSize: '13px' }}>
          {error}
        </p>
      )}
    </div>
  )
}
