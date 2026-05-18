'use client'

import DeleteButton from '@/components/ui/DeleteButton'

export default function LeadDangerZone({ id }: { id: string }) {
  return (
    <DeleteButton
      label="Delete Lead"
      onConfirm={async () => {
        const res = await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' })
        if (res.ok) window.location.href = '/dashboard/leads'
      }}
    />
  )
}
