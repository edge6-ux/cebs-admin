'use client'

import { useState, useEffect } from 'react'
import type { Lead, Evaluation, Proposal, Questionnaire, Customer } from '@/lib/types'
import OverviewTab from '@/components/leads/tabs/OverviewTab'
import EvaluationTab from '@/components/leads/tabs/EvaluationTab'
import ProposalsTab from '@/components/leads/tabs/ProposalsTab'
import QuestionnaireTab from '@/components/leads/tabs/QuestionnaireTab'

const VALID_TABS = ['overview', 'questionnaire', 'evaluation', 'proposals'] as const
type TabValue = typeof VALID_TABS[number]

function isTabValue(v: string): v is TabValue {
  return (VALID_TABS as readonly string[]).includes(v)
}


type Props = {
  lead: Lead
  evaluation: Evaluation | null
  proposals: Proposal[]
  questionnaire: Questionnaire | null
  customer: Customer | null
}

export default function LeadDetailTabs({ lead, evaluation, proposals, questionnaire, customer }: Props) {
  const [activeTab, setActiveTab] = useState<TabValue>('overview')

  useEffect(() => {
    const stored = localStorage.getItem(`lead_tab_${lead.id}`)
    if (stored && isTabValue(stored)) {
      setActiveTab(stored)
    }
  }, [lead.id])

  function handleTabChange(tab: TabValue) {
    setActiveTab(tab)
    localStorage.setItem(`lead_tab_${lead.id}`, tab)
  }

  return (
    <div>
      {/* Tab bar */}
      <div
        className="flex gap-1 p-1.5 mb-4 rounded-2xl shadow-sm bg-white"
        style={{ border: '1px solid #E5E7EB' }}
      >
        {/* Overview */}
        <button
          onClick={() => handleTabChange('overview')}
          className={[
            'flex-1 py-2.5 px-3 rounded-xl text-center transition-all duration-150 cursor-pointer',
            activeTab === 'overview'
              ? 'bg-[#0D0D0D] text-white font-semibold'
              : 'text-[#6B7280] font-medium hover:bg-[#F5F5F5] hover:text-[#0D0D0D]',
          ].join(' ')}
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
        >
          Overview
        </button>

        {/* Questionnaire */}
        <button
          onClick={() => handleTabChange('questionnaire')}
          className={[
            'flex-1 py-2.5 px-3 rounded-xl text-center transition-all duration-150 cursor-pointer',
            activeTab === 'questionnaire'
              ? 'bg-[#0D0D0D] text-white font-semibold'
              : 'text-[#6B7280] font-medium hover:bg-[#F5F5F5] hover:text-[#0D0D0D]',
          ].join(' ')}
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
        >
          Questionnaire
          {questionnaire?.completed_at && (
            <span
              style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#16A34A',
                marginLeft: '6px',
                verticalAlign: 'middle',
              }}
            />
          )}
        </button>

        {/* Evaluation */}
        <button
          onClick={() => handleTabChange('evaluation')}
          className={[
            'flex-1 py-2.5 px-3 rounded-xl text-center transition-all duration-150 cursor-pointer',
            activeTab === 'evaluation'
              ? 'bg-[#0D0D0D] text-white font-semibold'
              : 'text-[#6B7280] font-medium hover:bg-[#F5F5F5] hover:text-[#0D0D0D]',
          ].join(' ')}
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
        >
          Evaluation
          {evaluation?.completed_at && (
            <span
              style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#16A34A',
                marginLeft: '6px',
                verticalAlign: 'middle',
              }}
            />
          )}
        </button>

        {/* Proposals */}
        <button
          onClick={() => handleTabChange('proposals')}
          className={[
            'flex-1 py-2.5 px-3 rounded-xl text-center transition-all duration-150 cursor-pointer',
            activeTab === 'proposals'
              ? 'bg-[#0D0D0D] text-white font-semibold'
              : 'text-[#6B7280] font-medium hover:bg-[#F5F5F5] hover:text-[#0D0D0D]',
          ].join(' ')}
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
        >
          Proposals
          {proposals.length > 0 && (
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                fontWeight: '600',
                background: '#F3F4F6',
                color: '#6B7280',
                padding: '2px 6px',
                borderRadius: '9999px',
                marginLeft: '6px',
              }}
            >
              {proposals.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <OverviewTab lead={lead} customer={customer} />
      )}
      {activeTab === 'questionnaire' && (
        <QuestionnaireTab lead={lead} questionnaire={questionnaire} />
      )}
      {activeTab === 'evaluation' && (
        <EvaluationTab lead={lead} evaluation={evaluation} />
      )}
      {activeTab === 'proposals' && (
        <ProposalsTab lead={lead} proposals={proposals} />
      )}
    </div>
  )
}
