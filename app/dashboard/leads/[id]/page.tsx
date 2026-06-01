import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronLeft, Mail, Phone, Building2, DollarSign } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase-server'
import { fmtDate, priorityLabel, priorityColor } from '@/lib/utils'
import type { Lead, Evaluation, Proposal, LeadStatus, Customer, Questionnaire } from '@/lib/types'
import LeadManagement from '@/components/leads/LeadManagement'
import LeadActions from '@/components/leads/LeadActions'
import LeadTimeline from '@/components/leads/LeadTimeline'
import LeadDangerZone from '@/components/leads/LeadDangerZone'
import LeadDetailTabs from '@/components/leads/LeadDetailTabs'

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(' ')
  if (parts.length === 1) return (parts[0][0] ?? '').toUpperCase()
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase()
}

function priorityBg(score: number): string {
  if (score >= 80) return 'rgba(226,75,74,0.1)'
  if (score >= 50) return 'rgba(200,146,42,0.1)'
  return 'rgba(107,114,128,0.1)'
}

const statusConfig: Record<LeadStatus, { label: string; bg: string; color: string }> = {
  new:       { label: 'New',       bg: '#EDE9FE', color: '#6D28D9' },
  reviewed:  { label: 'Reviewed',  bg: '#DBEAFE', color: '#1D4ED8' },
  contacted: { label: 'Contacted', bg: '#FEF3C7', color: '#92400E' },
  converted: { label: 'Converted', bg: '#D1FAE5', color: '#065F46' },
  not_a_fit: { label: 'Not a Fit', bg: '#F3F4F6', color: '#6B7280' },
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [
    { data: leadData },
    { data: evaluation },
    { data: proposalsRaw },
    { data: customerData },
    { data: questionnaireData },
  ] = await Promise.all([
    supabaseAdmin.from('cebs_leads').select('*').eq('id', id).single(),
    supabaseAdmin.from('evaluations').select('*').eq('lead_id', id).maybeSingle(),
    supabaseAdmin.from('proposals').select('*').eq('lead_id', id).is('deleted_at', null).order('created_at', { ascending: false }),
    supabaseAdmin.from('customers').select('*').eq('lead_id', id).maybeSingle(),
    supabaseAdmin.from('lead_questionnaires').select('*').eq('lead_id', id).maybeSingle(),
  ])

  if (!leadData) redirect('/dashboard/leads')

  const lead = leadData as Lead
  const eval_ = evaluation as Evaluation | null
  const proposals = (proposalsRaw ?? []) as Proposal[]
  const customer = customerData as Customer | null
  const questionnaire = questionnaireData as Questionnaire | null
  const status = statusConfig[lead.status] ?? statusConfig.new

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back button */}
      <Link
        href="/dashboard/leads"
        className="inline-flex items-center gap-1 font-body mb-6 transition-colors hover:text-[#0D0D0D]"
        style={{ color: '#6B7280', fontSize: '14px' }}
      >
        <ChevronLeft size={16} />
        Back to Leads
      </Link>

      {/* Header card */}
      <div
        className="bg-white rounded-2xl p-6 mb-6 shadow-sm flex gap-5 items-start flex-wrap"
        style={{ border: '1px solid #E5E7EB' }}
      >
        {/* Avatar */}
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-full"
          style={{ width: '64px', height: '64px', background: '#0D0D0D' }}
        >
          <span className="font-heading font-bold text-white" style={{ fontSize: '22px' }}>
            {getInitials(lead.full_name)}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Top row */}
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '24px' }}>
                {lead.business_name}
              </h1>
              <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '14px' }}>
                {lead.full_name}
              </p>
              <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '13px' }}>
                Submitted {fmtDate(lead.created_at)}
              </p>
            </div>

            <div className="flex items-start gap-2 flex-wrap">
              <span
                className="font-body font-bold px-3 py-1.5 rounded-xl"
                style={{ fontSize: '13px', background: status.bg, color: status.color }}
              >
                {status.label}
              </span>
              {lead.priority_score > 0 && (
                <span
                  className="font-body font-bold px-3 py-1.5 rounded-xl"
                  style={{
                    fontSize: '13px',
                    color: priorityColor(lead.priority_score),
                    background: priorityBg(lead.priority_score),
                  }}
                >
                  {priorityLabel(lead.priority_score)} Priority
                </span>
              )}
            </div>
          </div>

          {/* Contact row */}
          <div className="flex gap-5 flex-wrap mt-4">
            <a
              href={`mailto:${lead.email}`}
              className="flex items-center gap-2 font-body transition-opacity hover:opacity-70"
              style={{ color: '#8B2FC9', fontSize: '14px' }}
            >
              <Mail size={16} style={{ color: '#6B7280' }} />
              {lead.email}
            </a>

            {lead.phone && (
              <a
                href={`tel:${lead.phone}`}
                className="flex items-center gap-2 font-body transition-opacity hover:opacity-70"
                style={{ color: '#8B2FC9', fontSize: '14px' }}
              >
                <Phone size={16} style={{ color: '#6B7280' }} />
                {lead.phone}
              </a>
            )}

            {lead.industry && (
              <div className="flex items-center gap-2">
                <Building2 size={16} style={{ color: '#6B7280' }} />
                <span className="font-body" style={{ color: '#4A4A4A', fontSize: '14px' }}>
                  {lead.industry}
                </span>
              </div>
            )}

            {lead.monthly_spend && (
              <div className="flex items-center gap-2">
                <DollarSign size={16} style={{ color: '#6B7280' }} />
                <span className="font-body" style={{ color: '#4A4A4A', fontSize: '14px' }}>
                  {lead.monthly_spend}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left column */}
        <div className="min-w-0">
          <LeadDetailTabs
            lead={lead}
            evaluation={eval_}
            proposals={proposals}
            questionnaire={questionnaire}
            customer={customer}
          />
        </div>

        {/* Right column */}
        <div>
          <LeadManagement lead={lead} />
          <LeadActions lead={lead} />
          <LeadTimeline lead={lead} />

          {/* Delete lead */}
          <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
            <p
              className="font-body uppercase pb-3 mb-4"
              style={{ color: '#6B7280', fontSize: '11px', letterSpacing: '0.08em', borderBottom: '1px solid #F5F5F5' }}
            >
              Danger Zone
            </p>
            <LeadDangerZone id={id} />
          </div>
        </div>
      </div>
    </div>
  )
}
