'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Trash2 } from 'lucide-react'

interface Props {
  tenant: {
    id: string
    business_name: string
  }
}

export default function TenantDangerZone({ tenant }: Props) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setDeleting(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/products/field-assessment/tenants/${tenant.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete')

      router.push('/dashboard/products/field-assessment/tenants')
      router.refresh()
    } catch {
      setError('Failed to delete tenant. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <div
      className="rounded-2xl p-5 mt-6 shadow-sm"
      style={{ background: 'white', border: '1px solid #FECACA' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={16} style={{ color: '#E24B4A' }} />
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            color: '#E24B4A',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          Danger Zone
        </span>
      </div>

      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          color: '#6B7280',
          fontSize: '13px',
          lineHeight: 1.6,
          marginBottom: '16px',
        }}
      >
        Deleting this tenant will immediately disable their assessment form and operator dashboard.
        The tenant will be permanently deleted after 30 days. This action cannot be undone.
      </p>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{
            background: 'white',
            border: '1px solid #E24B4A',
            color: '#E24B4A',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#FCEBEB' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'white' }}
        >
          <Trash2 size={14} />
          Delete Tenant
        </button>
      ) : (
        <>
          <div className="rounded-xl p-4 mb-4" style={{ background: '#FCEBEB' }}>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                color: '#991B1B',
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '4px',
              }}
            >
              Are you sure?
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#E24B4A', fontSize: '13px' }}>
              This will immediately disable {tenant.business_name}&apos;s access. They will be
              permanently deleted in 30 days.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2.5 rounded-xl"
              style={{
                background: 'white',
                border: '1px solid #E5E7EB',
                color: '#4A4A4A',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{
                background: deleting ? '#E5E7EB' : '#E24B4A',
                color: deleting ? '#9CA3AF' : 'white',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                cursor: deleting ? 'not-allowed' : 'pointer',
                border: 'none',
              }}
              onMouseEnter={e => { if (!deleting) e.currentTarget.style.background = '#DC2626' }}
              onMouseLeave={e => { if (!deleting) e.currentTarget.style.background = '#E24B4A' }}
            >
              <Trash2 size={14} />
              {deleting ? 'Deleting...' : 'Yes, Delete Tenant'}
            </button>
          </div>
        </>
      )}

      {error && (
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            color: '#E24B4A',
            fontSize: '13px',
            marginTop: '12px',
          }}
        >
          {error}
        </p>
      )}
    </div>
  )
}
