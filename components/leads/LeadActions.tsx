'use client'

import { useRouter } from 'next/navigation'
import { Mail, Phone, ClipboardList, FileText } from 'lucide-react'
import type { Lead } from '@/lib/types'

export default function LeadActions({ lead }: { lead: Lead }) {
  const router = useRouter()

  return (
    <div
      className="bg-white rounded-2xl p-5 mb-4 shadow-sm"
      style={{ border: '1px solid #E5E7EB' }}
    >
      <p
        className="font-body uppercase pb-3 mb-5"
        style={{
          color: '#6B7280',
          fontSize: '11px',
          letterSpacing: '0.08em',
          borderBottom: '1px solid #F5F5F5',
        }}
      >
        Actions
      </p>

      <div className="space-y-2">
        {/* Send Email */}
        <a
          href={`mailto:${lead.email}`}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-body font-medium transition-colors bg-white"
          style={{ border: '1px solid #E5E7EB', color: '#4A4A4A', fontSize: '14px' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#8B2FC9'
            e.currentTarget.style.color = '#8B2FC9'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#E5E7EB'
            e.currentTarget.style.color = '#4A4A4A'
          }}
        >
          <Mail size={16} style={{ color: '#6B7280', flexShrink: 0 }} />
          Send Email
        </a>

        {/* Call Lead */}
        <a
          href={lead.phone ? `tel:${lead.phone}` : undefined}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-body font-medium transition-colors bg-white"
          style={{
            border: '1px solid #E5E7EB',
            color: '#4A4A4A',
            fontSize: '14px',
            opacity: lead.phone ? 1 : 0.4,
            pointerEvents: lead.phone ? 'auto' : 'none',
            cursor: lead.phone ? 'pointer' : 'not-allowed',
          }}
          onMouseEnter={(e) => {
            if (lead.phone) {
              e.currentTarget.style.borderColor = '#8B2FC9'
              e.currentTarget.style.color = '#8B2FC9'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#E5E7EB'
            e.currentTarget.style.color = '#4A4A4A'
          }}
        >
          <Phone size={16} style={{ color: '#6B7280', flexShrink: 0 }} />
          Call Lead
        </a>

        {/* Start Evaluation */}
        <button
          onClick={() => router.push(`/dashboard/leads/${lead.id}/evaluate`)}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-body font-medium transition-colors bg-white"
          style={{ border: '1px solid #8B2FC9', color: '#8B2FC9', fontSize: '14px' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139,47,201,0.05)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'white' }}
        >
          <ClipboardList size={16} style={{ color: '#8B2FC9', flexShrink: 0 }} />
          Start Evaluation
        </button>

        {/* Create Proposal */}
        <button
          onClick={() => router.push(`/dashboard/leads/${lead.id}/proposal/new`)}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-body font-medium text-white transition-colors"
          style={{ background: '#8B2FC9', fontSize: '14px' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#7A28B8' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#8B2FC9' }}
        >
          <FileText size={16} style={{ flexShrink: 0 }} />
          Create Proposal
        </button>
      </div>
    </div>
  )
}
