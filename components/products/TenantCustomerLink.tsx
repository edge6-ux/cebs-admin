'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface CustomerOption {
  id: string
  business_name: string
  contact_name: string
  email: string
}

interface TenantRef {
  id: string
  customer_id: string | null
}

interface Props {
  tenant: TenantRef
  customer: CustomerOption | null
  customers: CustomerOption[]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const sectionLabel: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  color: '#9CA3AF',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '16px',
}

export default function TenantCustomerLink({ tenant, customer, customers }: Props) {
  const router = useRouter()
  const [currentCustomer, setCurrentCustomer] = useState<CustomerOption | null>(customer)
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [linking, setLinking] = useState(false)

  async function handleUnlink() {
    await fetch(`/api/admin/products/field-assessment/tenants/${tenant.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: null }),
    })
    setCurrentCustomer(null)
    router.refresh()
  }

  async function handleLink() {
    if (!selectedCustomerId) return
    setLinking(true)
    await fetch(`/api/admin/products/field-assessment/tenants/${tenant.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: selectedCustomerId }),
    })
    setLinking(false)
    router.refresh()
  }

  return (
    <div
      className="rounded-2xl border p-5 mb-4 shadow-sm"
      style={{ background: 'white', borderColor: '#E5E7EB' }}
    >
      <p style={sectionLabel}>Customer Record</p>

      {currentCustomer ? (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="rounded-full flex items-center justify-center flex-shrink-0"
              style={{ width: '36px', height: '36px', background: '#0D0D0D' }}
            >
              <span
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '13px',
                }}
              >
                {getInitials(currentCustomer.business_name)}
              </span>
            </div>
            <div>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#0D0D0D',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                {currentCustomer.business_name}
              </p>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#6B7280',
                  fontSize: '12px',
                  marginTop: '2px',
                }}
              >
                {currentCustomer.contact_name}
              </p>
            </div>
          </div>

          <Link
            href={`/dashboard/customers/${currentCustomer.id}`}
            style={{
              display: 'block',
              fontFamily: 'Inter, sans-serif',
              color: '#8B2FC9',
              fontSize: '13px',
              fontWeight: 500,
              textDecoration: 'none',
              marginBottom: '12px',
            }}
          >
            View Customer →
          </Link>

          <button
            onClick={handleUnlink}
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#9CA3AF',
              fontSize: '12px',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#E24B4A' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF' }}
          >
            Unlink
          </button>
        </>
      ) : (
        <>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#6B7280',
              fontSize: '13px',
              marginBottom: '12px',
            }}
          >
            Link this tenant to an existing customer record.
          </p>

          <select
            value={selectedCustomerId}
            onChange={e => setSelectedCustomerId(e.target.value)}
            style={{
              display: 'block',
              width: '100%',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '12px 16px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              color: '#0D0D0D',
              outline: 'none',
              boxSizing: 'border-box',
              appearance: 'auto',
            } as React.CSSProperties}
          >
            <option value="">Select a customer</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.business_name} — {c.contact_name}
              </option>
            ))}
          </select>

          <button
            onClick={handleLink}
            disabled={!selectedCustomerId || linking}
            style={{
              display: 'block',
              width: '100%',
              marginTop: '12px',
              background: '#8B2FC9',
              color: 'white',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              padding: '10px 16px',
              borderRadius: '12px',
              border: 'none',
              cursor: !selectedCustomerId || linking ? 'not-allowed' : 'pointer',
              opacity: !selectedCustomerId || linking ? 0.6 : 1,
            }}
          >
            {linking ? 'Linking...' : 'Link Customer'}
          </button>
        </>
      )}
    </div>
  )
}
