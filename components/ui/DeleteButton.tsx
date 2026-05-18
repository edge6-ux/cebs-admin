'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'

interface Props {
  onConfirm: () => Promise<void>
}

export default function DeleteButton({ onConfirm }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  if (confirming) {
    return (
      <span className="flex items-center gap-1" style={{ flexShrink: 0 }}>
        <span className="font-body" style={{ fontSize: '12px', color: '#6B7280' }}>Delete?</span>
        <button
          onClick={async (e) => {
            e.stopPropagation()
            setLoading(true)
            await onConfirm()
            setLoading(false)
            setConfirming(false)
          }}
          disabled={loading}
          style={{ fontSize: '12px', color: '#E24B4A', background: 'none', border: 'none', cursor: 'pointer', padding: '0 3px', fontFamily: 'var(--font-inter), sans-serif', fontWeight: 500 }}
        >
          {loading ? '…' : 'Yes'}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setConfirming(false) }}
          style={{ fontSize: '12px', color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: '0 3px', fontFamily: 'var(--font-inter), sans-serif' }}
        >
          No
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={(e) => { e.stopPropagation(); setConfirming(true) }}
      title="Delete"
      style={{ color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
      onMouseEnter={(e) => { e.currentTarget.style.color = '#E24B4A' }}
      onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF' }}
    >
      <Trash2 size={15} />
    </button>
  )
}
