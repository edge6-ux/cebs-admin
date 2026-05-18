'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'

interface Props {
  onConfirm: () => Promise<void>
  label?: string
}

export default function DeleteButton({ onConfirm, label }: Props) {
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
      title={label ?? 'Delete'}
      style={{
        color: '#9CA3AF',
        background: 'none',
        border: label ? '1px solid #E5E7EB' : 'none',
        borderRadius: label ? '10px' : undefined,
        cursor: 'pointer',
        padding: label ? '7px 12px' : '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexShrink: 0,
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '13px',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = '#E24B4A'; if (label) e.currentTarget.style.borderColor = '#E24B4A' }}
      onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF'; if (label) e.currentTarget.style.borderColor = '#E5E7EB' }}
    >
      <Trash2 size={15} />
      {label && label}
    </button>
  )
}
