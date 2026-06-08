'use client'

import { useState } from 'react'
import { Power, PowerOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  tenantId: string
  active: boolean
}

export default function TenantActiveToggle({ tenantId, active }: Props) {
  const [isActive, setIsActive] = useState(active)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleToggle() {
    setLoading(true)
    await fetch(`/api/admin/products/field-assessment/tenants/${tenantId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !isActive }),
    })
    setIsActive(!isActive)
    setLoading(false)
    router.refresh()
  }

  if (isActive) {
    return (
      <button
        onClick={handleToggle}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
        style={{
          background: 'white',
          border: '1px solid #E24B4A',
          color: '#E24B4A',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          fontWeight: 500,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#FCEBEB' }}
        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'white' }}
      >
        <PowerOff size={16} />
        Deactivate
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
      style={{
        background: '#16A34A',
        color: 'white',
        border: 'none',
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        fontWeight: 500,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
      }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#15803D' }}
      onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#16A34A' }}
    >
      <Power size={16} />
      Activate
    </button>
  )
}
