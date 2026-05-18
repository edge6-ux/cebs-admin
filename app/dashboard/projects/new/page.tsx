'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

const fieldStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #E5E7EB',
  borderRadius: '12px',
  padding: '12px 16px',
  fontFamily: 'var(--font-inter), sans-serif',
  fontSize: '14px',
  color: '#0D0D0D',
  background: 'white',
  outline: 'none',
}

const focusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.boxShadow = '0 0 0 2px #8B2FC9'
    e.currentTarget.style.borderColor = '#8B2FC9'
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.boxShadow = 'none'
    e.currentTarget.style.borderColor = '#E5E7EB'
  },
}

function Label({ children, required }: { children: string; required?: boolean }) {
  return (
    <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '13px' }}>
      {children}
      {required && <span style={{ color: '#E24B4A' }}> *</span>}
    </label>
  )
}

export default function NewProjectPage() {
  const router = useRouter()

  const [clientName, setClientName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [tier, setTier] = useState('')
  const [contractValue, setContractValue] = useState(0)
  const [monthlyRetainer, setMonthlyRetainer] = useState(0)
  const [startDate, setStartDate] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!clientName || !businessName) {
      setError('Client name and business name are required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: clientName,
          business_name: businessName,
          client_email: clientEmail,
          client_phone: clientPhone,
          tier,
          contract_value: contractValue,
          monthly_retainer: monthlyRetainer,
          start_date: startDate || null,
          target_date: targetDate || null,
          notes,
          status: 'kickoff',
          checklist: [],
        }),
      })
      if (!res.ok) throw new Error('Failed to create project')
      router.push('/dashboard/projects')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/dashboard/projects"
        className="inline-flex items-center gap-1 font-body mb-6 transition-colors hover:text-[#0D0D0D]"
        style={{ color: '#6B7280', fontSize: '14px' }}
      >
        <ChevronLeft size={16} />
        Back to Projects
      </Link>

      <div className="mb-6">
        <h1 className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '22px' }}>
          New Project
        </h1>
      </div>

      <div
        className="bg-white rounded-2xl p-8 shadow-sm space-y-5"
        style={{ border: '1px solid #E5E7EB' }}
      >
        <div>
          <Label required>Client Name</Label>
          <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Jane Smith" style={fieldStyle} {...focusHandlers} />
        </div>

        <div>
          <Label required>Business Name</Label>
          <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Smith's Auto Repair" style={fieldStyle} {...focusHandlers} />
        </div>

        <div>
          <Label>Email</Label>
          <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="jane@smithsauto.com" style={fieldStyle} {...focusHandlers} />
        </div>

        <div>
          <Label>Phone</Label>
          <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="(555) 000-0000" style={fieldStyle} {...focusHandlers} />
        </div>

        <div>
          <Label>Service Tier</Label>
          <select value={tier} onChange={(e) => setTier(e.target.value)} style={fieldStyle} {...focusHandlers}>
            <option value="">Select tier</option>
            <option value="audit">Audit &amp; Strategy</option>
            <option value="optimize">Optimize &amp; Consolidate</option>
            <option value="build">Build</option>
          </select>
        </div>

        <div>
          <Label>Contract Value</Label>
          <div className="relative">
            <span className="absolute font-body pointer-events-none" style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', fontSize: '14px' }}>$</span>
            <input type="number" min={0} value={contractValue || ''} onChange={(e) => setContractValue(Number(e.target.value))} style={{ ...fieldStyle, paddingLeft: '28px' }} {...focusHandlers} />
          </div>
        </div>

        <div>
          <Label>Monthly Retainer</Label>
          <p className="font-body mb-1.5" style={{ color: '#6B7280', fontSize: '12px' }}>Leave 0 if none</p>
          <div className="relative">
            <span className="absolute font-body pointer-events-none" style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', fontSize: '14px' }}>$</span>
            <input type="number" min={0} value={monthlyRetainer || ''} onChange={(e) => setMonthlyRetainer(Number(e.target.value))} style={{ ...fieldStyle, paddingLeft: '28px' }} {...focusHandlers} />
          </div>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <Label>Start Date</Label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={fieldStyle} {...focusHandlers} />
          </div>
          <div>
            <Label>Target Date</Label>
            <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} style={fieldStyle} {...focusHandlers} />
          </div>
        </div>

        <div>
          <Label>Notes</Label>
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything worth noting..." className="resize-none" style={fieldStyle} {...focusHandlers} />
        </div>
      </div>

      <div
        className="sticky bottom-0 bg-white px-8 py-4 mt-8 flex items-center justify-between"
        style={{ borderTop: '1px solid #E5E7EB' }}
      >
        <Link href="/dashboard/projects" className="font-body transition-opacity hover:opacity-70" style={{ color: '#6B7280', fontSize: '14px' }}>
          Cancel
        </Link>

        <div className="flex items-center gap-3">
          {error && <p className="font-body" style={{ color: '#E24B4A', fontSize: '13px' }}>{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="font-heading font-bold uppercase text-white rounded-xl px-5 py-2.5 transition-colors disabled:opacity-60"
            style={{ background: '#8B2FC9', fontSize: '14px', cursor: 'pointer' }}
            onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = '#7A28B8' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#8B2FC9' }}
          >
            {saving ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  )
}
