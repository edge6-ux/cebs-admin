'use client'

import { useState } from 'react'
import { ClipboardList, CheckCircle, Check } from 'lucide-react'
import type { Lead, Questionnaire } from '@/lib/types'

// CheckCircle used in Prompt E (Mark Complete button)
void CheckCircle

const LEAD_SOURCE_OPTIONS = [
  'Google Search',
  'Google Maps / GBP',
  'Word of mouth',
  'Repeat customers',
  'Facebook',
  'Instagram',
  'Paid ads',
  'Yard signs / truck wrap',
  'Nextdoor',
  'Other directories',
]

type Props = {
  lead: Lead
  questionnaire: Questionnaire | null
}

export default function QuestionnaireTab({ lead, questionnaire }: Props) {
  const [started, setStarted] = useState(questionnaire !== null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Section 1 — Business Health
  const [yearsInBusiness, setYearsInBusiness] = useState(questionnaire?.years_in_business ?? '')
  const [employeeCount, setEmployeeCount] = useState(questionnaire?.employee_count ?? '')
  const [busySeason, setBusySeason] = useState(questionnaire?.busy_season ?? '')
  const [typicalWeek, setTypicalWeek] = useState(questionnaire?.typical_week ?? '')
  const [revenueRange, setRevenueRange] = useState(questionnaire?.revenue_range ?? '')
  const [growthStatus, setGrowthStatus] = useState(questionnaire?.growth_status ?? '')
  const [growthNotes, setGrowthNotes] = useState(questionnaire?.growth_notes ?? '')

  // Section 2 — Current Technology
  const [customerJourney, setCustomerJourney] = useState(questionnaire?.customer_journey ?? '')
  const [underusedTools, setUnderusedTools] = useState(questionnaire?.underused_tools ?? '')
  const [wishlist, setWishlist] = useState(questionnaire?.wishlist ?? '')
  const [schedulingMethod, setSchedulingMethod] = useState(questionnaire?.scheduling_method ?? '')
  const [schedulingNotes, setSchedulingNotes] = useState(questionnaire?.scheduling_notes ?? '')
  const [invoicingMethod, setInvoicingMethod] = useState(questionnaire?.invoicing_method ?? '')
  const [invoicingNotes, setInvoicingNotes] = useState(questionnaire?.invoicing_notes ?? '')
  const [postJobCommunication, setPostJobCommunication] = useState(questionnaire?.post_job_communication ?? '')
  const [communicationNotes, setCommunicationNotes] = useState(questionnaire?.communication_notes ?? '')

  // Section 3 — Marketing & Leads
  const [leadSourcesArray, setLeadSourcesArray] = useState<string[]>(() => {
    try {
      const parsed = JSON.parse(questionnaire?.lead_sources || '[]') as unknown
      return Array.isArray(parsed) ? (parsed as string[]) : []
    } catch {
      return []
    }
  })
  const [leadSourceNotes, setLeadSourceNotes] = useState(questionnaire?.lead_source_notes ?? '')
  const [googlePresence, setGooglePresence] = useState(questionnaire?.google_presence ?? '')
  const [runsPaidAds, setRunsPaidAds] = useState(questionnaire?.runs_paid_ads ?? '')
  const [adNotes, setAdNotes] = useState(questionnaire?.ad_notes ?? '')
  const [reviewStrategy, setReviewStrategy] = useState(questionnaire?.review_strategy ?? '')
  const [closeRate, setCloseRate] = useState(questionnaire?.close_rate ?? '')
  const [badLeadDescription, setBadLeadDescription] = useState(questionnaire?.bad_lead_description ?? '')

  // Section 4 — Pain Points
  const [biggestTimeCost, setBiggestTimeCost] = useState(questionnaire?.biggest_time_cost ?? '')
  const [biggestWorry, setBiggestWorry] = useState(questionnaire?.biggest_worry ?? '')
  const [fixTomorrow, setFixTomorrow] = useState(questionnaire?.fix_tomorrow ?? '')
  const [previousAttempts, setPreviousAttempts] = useState(questionnaire?.previous_attempts ?? '')
  const [costOfInaction, setCostOfInaction] = useState(questionnaire?.cost_of_inaction ?? '')

  // Sections 5–6 — declared upfront so state persists as sections are added
  const [currentSiteIssues, setCurrentSiteIssues] = useState(questionnaire?.current_site_issues ?? '')
  const [competitorSites, setCompetitorSites] = useState(questionnaire?.competitor_sites ?? '')
  const [pagesNeeded, setPagesNeeded] = useState<string[]>(questionnaire?.pages_needed ?? [])
  const [hasCopy, setHasCopy] = useState(questionnaire?.has_copy ?? '')
  const [hasPhotos, setHasPhotos] = useState(questionnaire?.has_photos ?? '')
  const [referenceSites, setReferenceSites] = useState(questionnaire?.reference_sites ?? '')
  const [idealCustomer, setIdealCustomer] = useState(questionnaire?.ideal_customer ?? '')
  const [brandWords, setBrandWords] = useState(questionnaire?.brand_words ?? '')
  const [successDefinition, setSuccessDefinition] = useState(questionnaire?.success_definition ?? '')
  const [timeline, setTimeline] = useState(questionnaire?.timeline ?? '')
  const [budget, setBudget] = useState(questionnaire?.budget ?? '')
  const [decisionMakers, setDecisionMakers] = useState(questionnaire?.decision_makers ?? '')
  const [objections, setObjections] = useState(questionnaire?.objections ?? '')

  // Suppress warnings for sections 5–6 setters until they are built
  void [
    setCurrentSiteIssues, setCompetitorSites, setPagesNeeded,
    setHasCopy, setHasPhotos, setReferenceSites, setIdealCustomer,
    setBrandWords, setSuccessDefinition, setTimeline, setBudget,
    setDecisionMakers, setObjections,
    currentSiteIssues, competitorSites, pagesNeeded,
    hasCopy, hasPhotos, referenceSites, idealCustomer,
    brandWords, successDefinition, timeline, budget,
    decisionMakers, objections,
  ]

  async function save(fields: Record<string, unknown>) {
    setSaving(true)
    try {
      await fetch(`/api/admin/leads/${lead.id}/questionnaire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      console.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  function toggleLeadSource(option: string) {
    const updated = leadSourcesArray.includes(option)
      ? leadSourcesArray.filter((s) => s !== option)
      : [...leadSourcesArray, option]
    setLeadSourcesArray(updated)
    save({ lead_sources: JSON.stringify(updated) })
  }

  const fieldClass =
    'w-full rounded-xl px-4 py-3 bg-white outline-none transition-all duration-150 focus:ring-2 focus:ring-[#8B2FC9] focus:border-[#8B2FC9]'
  const fieldStyle = {
    border: '1px solid #E5E7EB',
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    color: '#0D0D0D',
  } as const

  // ─── Not started ─────────────────────────────────────────────────────────────

  if (!started) {
    return (
      <div
        className="bg-white rounded-2xl p-12 shadow-sm text-center"
        style={{ border: '1px solid #E5E7EB' }}
      >
        <ClipboardList size={48} className="mx-auto" style={{ color: '#8B2FC9' }} />

        <h2
          className="font-heading font-bold mt-4 mb-2"
          style={{ color: '#0D0D0D', fontSize: '20px' }}
        >
          Sales Questionnaire
        </h2>

        <p
          className="font-body mx-auto mb-6"
          style={{ color: '#6B7280', fontSize: '14px', maxWidth: '384px', lineHeight: '1.6' }}
        >
          Walk through this with the business owner during the consultation call. Answers save
          automatically and feed into the AI analysis.
        </p>

        <button
          disabled={saving}
          onClick={async () => {
            setSaving(true)
            await save({
              lead_id: lead.id,
              started_at: new Date().toISOString(),
            })
            setStarted(true)
            setSaving(false)
          }}
          className="inline-flex items-center gap-2 font-heading font-bold uppercase text-white rounded-xl px-6 py-3 transition-colors disabled:opacity-60"
          style={{ background: '#8B2FC9', fontSize: '14px' }}
          onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = '#7A28B8' }}
          onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = '#8B2FC9' }}
        >
          <ClipboardList size={16} />
          Start Questionnaire
        </button>
      </div>
    )
  }

  // ─── Started ─────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* ── Section 1 — Business Health ── */}
      <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
        <p
          className="font-body uppercase pb-3 mb-5"
          style={{
            color: '#6B7280',
            fontSize: '11px',
            letterSpacing: '0.08em',
            borderBottom: '1px solid #F5F5F5',
          }}
        >
          Business Health
        </p>

        {/* Years in business */}
        <div className="mb-5">
          <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '14px' }}>
            How long have you been in business?
          </label>
          <select
            value={yearsInBusiness}
            onChange={(e) => {
              const v = e.target.value
              setYearsInBusiness(v)
              save({ years_in_business: v })
            }}
            className={fieldClass}
            style={fieldStyle}
          >
            <option value="">Select</option>
            <option value="Less than 1 year">Less than 1 year</option>
            <option value="1–2 years">1–2 years</option>
            <option value="3–5 years">3–5 years</option>
            <option value="6–10 years">6–10 years</option>
            <option value="10+ years">10+ years</option>
          </select>
        </div>

        {/* Employee count */}
        <div className="mb-5">
          <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '14px' }}>
            How many employees?
          </label>
          <select
            value={employeeCount}
            onChange={(e) => {
              const v = e.target.value
              setEmployeeCount(v)
              save({ employee_count: v })
            }}
            className={fieldClass}
            style={fieldStyle}
          >
            <option value="">Select</option>
            <option value="Just me">Just me</option>
            <option value="2–5">2–5</option>
            <option value="6–10">6–10</option>
            <option value="11–25">11–25</option>
            <option value="25+">25+</option>
          </select>
        </div>

        {/* Busy season */}
        <div className="mb-5">
          <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '14px' }}>
            Busiest season or time of year?
          </label>
          <input
            type="text"
            value={busySeason}
            onChange={(e) => setBusySeason(e.target.value)}
            onBlur={(e) => save({ busy_season: e.target.value })}
            placeholder="e.g. Summer, tax season, weekends..."
            className={fieldClass}
            style={fieldStyle}
          />
        </div>

        {/* Typical week */}
        <div className="mb-5">
          <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '14px' }}>
            What does a typical week look like operationally?
          </label>
          <textarea
            value={typicalWeek}
            onChange={(e) => setTypicalWeek(e.target.value)}
            onBlur={(e) => save({ typical_week: e.target.value })}
            rows={2}
            placeholder="Walk us through a typical week — what does the team spend most of their time doing?"
            className={`${fieldClass} resize-none`}
            style={fieldStyle}
          />
        </div>

        {/* Revenue range */}
        <div className="mb-5">
          <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '14px' }}>
            Annual revenue range
          </label>
          <p className="font-body mb-2" style={{ color: '#9CA3AF', fontSize: '12px' }}>
            Optional — helps us right-size recommendations
          </p>
          <select
            value={revenueRange}
            onChange={(e) => {
              const v = e.target.value
              setRevenueRange(v)
              save({ revenue_range: v })
            }}
            className={fieldClass}
            style={fieldStyle}
          >
            <option value="">Prefer not to say</option>
            <option value="Under $100K">Under $100K</option>
            <option value="$100K – $250K">$100K – $250K</option>
            <option value="$250K – $500K">$250K – $500K</option>
            <option value="$500K – $1M">$500K – $1M</option>
            <option value="$1M+">$1M+</option>
          </select>
        </div>

        {/* Growth status */}
        <div>
          <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '14px' }}>
            Right now the business is...
          </label>
          <div className="flex gap-3 mt-1 flex-wrap">
            {(['growing', 'flat', 'declining'] as const).map((option) => (
              <button
                key={option}
                onClick={() => {
                  setGrowthStatus(option)
                  save({ growth_status: option })
                }}
                className={[
                  'font-body font-medium px-5 py-2.5 rounded-full capitalize cursor-pointer transition-all duration-150 border',
                  growthStatus === option
                    ? 'bg-[#0D0D0D] text-white border-[#0D0D0D]'
                    : 'bg-white text-[#4A4A4A] border-[#E5E7EB]',
                ].join(' ')}
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
          <textarea
            value={growthNotes}
            onChange={(e) => setGrowthNotes(e.target.value)}
            onBlur={(e) => save({ growth_notes: e.target.value })}
            rows={2}
            placeholder="Any context on growth trajectory..."
            className={`${fieldClass} resize-none mt-3`}
            style={fieldStyle}
          />
        </div>
      </div>

      {/* ── Section 2 — Current Technology ── */}
      <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
        <p
          className="font-body uppercase pb-3 mb-5"
          style={{
            color: '#6B7280',
            fontSize: '11px',
            letterSpacing: '0.08em',
            borderBottom: '1px solid #F5F5F5',
          }}
        >
          Current Technology
        </p>

        {/* Customer journey */}
        <div className="mb-5">
          <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '14px' }}>
            Walk me through a customer journey — from first contact to payment. What tools touch that process?
          </label>
          <textarea
            value={customerJourney}
            onChange={(e) => setCustomerJourney(e.target.value)}
            onBlur={(e) => save({ customer_journey: e.target.value })}
            rows={3}
            placeholder="e.g. Customer calls us → we log it in Jobber → we schedule → invoice via QuickBooks..."
            className={`${fieldClass} resize-none`}
            style={fieldStyle}
          />
        </div>

        {/* Underused tools */}
        <div className="mb-5">
          <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '14px' }}>
            What do you pay for that you barely use?
          </label>
          <textarea
            value={underusedTools}
            onChange={(e) => setUnderusedTools(e.target.value)}
            onBlur={(e) => save({ underused_tools: e.target.value })}
            rows={2}
            placeholder="Tools, software, subscriptions that aren't pulling their weight..."
            className={`${fieldClass} resize-none`}
            style={fieldStyle}
          />
        </div>

        {/* Wishlist */}
        <div className="mb-5">
          <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '14px' }}>
            What do you wish existed that doesn't?
          </label>
          <textarea
            value={wishlist}
            onChange={(e) => setWishlist(e.target.value)}
            onBlur={(e) => save({ wishlist: e.target.value })}
            rows={2}
            placeholder="Any tool or feature you've wanted but never found..."
            className={`${fieldClass} resize-none`}
            style={fieldStyle}
          />
        </div>

        {/* Scheduling method */}
        <div className="mb-5">
          <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '14px' }}>
            How do you handle scheduling or booking?
          </label>
          <select
            value={schedulingMethod}
            onChange={(e) => {
              const v = e.target.value
              setSchedulingMethod(v)
              save({ scheduling_method: v })
            }}
            className={fieldClass}
            style={fieldStyle}
          >
            <option value="">Select</option>
            <option value="Phone only">Phone only</option>
            <option value="Text message">Text message</option>
            <option value="Email">Email</option>
            <option value="Online booking tool">Online booking tool</option>
            <option value="Walk-ins only">Walk-ins only</option>
            <option value="No scheduling needed">No scheduling needed</option>
            <option value="Other">Other</option>
          </select>
          <textarea
            value={schedulingNotes}
            onChange={(e) => setSchedulingNotes(e.target.value)}
            onBlur={(e) => save({ scheduling_notes: e.target.value })}
            rows={2}
            placeholder="Any details about how scheduling works..."
            className={`${fieldClass} resize-none mt-2`}
            style={fieldStyle}
          />
        </div>

        {/* Invoicing method */}
        <div className="mb-5">
          <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '14px' }}>
            How do you invoice and collect payment?
          </label>
          <select
            value={invoicingMethod}
            onChange={(e) => {
              const v = e.target.value
              setInvoicingMethod(v)
              save({ invoicing_method: v })
            }}
            className={fieldClass}
            style={fieldStyle}
          >
            <option value="">Select</option>
            <option value="Cash or check only">Cash or check only</option>
            <option value="Square or Stripe">Square or Stripe</option>
            <option value="QuickBooks">QuickBooks</option>
            <option value="Paper invoices">Paper invoices</option>
            <option value="Verbal / informal">Verbal / informal</option>
            <option value="Other software">Other software</option>
            <option value="Other">Other</option>
          </select>
          <textarea
            value={invoicingNotes}
            onChange={(e) => setInvoicingNotes(e.target.value)}
            onBlur={(e) => save({ invoicing_notes: e.target.value })}
            rows={2}
            placeholder="Any details about payment collection..."
            className={`${fieldClass} resize-none mt-2`}
            style={fieldStyle}
          />
        </div>

        {/* Post-job communication */}
        <div>
          <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '14px' }}>
            How do you communicate with customers after the job is done?
          </label>
          <select
            value={postJobCommunication}
            onChange={(e) => {
              const v = e.target.value
              setPostJobCommunication(v)
              save({ post_job_communication: v })
            }}
            className={fieldClass}
            style={fieldStyle}
          >
            <option value="">Select</option>
            <option value="We don't follow up">We don&apos;t follow up</option>
            <option value="Phone call">Phone call</option>
            <option value="Text message">Text message</option>
            <option value="Email manually">Email manually</option>
            <option value="Automated system">Automated system</option>
            <option value="Other">Other</option>
          </select>
          <textarea
            value={communicationNotes}
            onChange={(e) => setCommunicationNotes(e.target.value)}
            onBlur={(e) => save({ communication_notes: e.target.value })}
            rows={2}
            placeholder="Any details on post-job follow up..."
            className={`${fieldClass} resize-none mt-2`}
            style={fieldStyle}
          />
        </div>
      </div>

      {/* ── Section 3 — Marketing & Leads ── */}
      <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
        <p
          className="font-body uppercase pb-3 mb-5"
          style={{
            color: '#6B7280',
            fontSize: '11px',
            letterSpacing: '0.08em',
            borderBottom: '1px solid #F5F5F5',
          }}
        >
          Marketing &amp; Leads
        </p>

        {/* Lead sources */}
        <div className="mb-5">
          <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '14px' }}>
            Where do most of your leads come from?
          </label>
          <p className="font-body mb-2" style={{ color: '#9CA3AF', fontSize: '12px' }}>
            Select all that apply
          </p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {LEAD_SOURCE_OPTIONS.map((option) => {
              const checked = leadSourcesArray.includes(option)
              return (
                <div
                  key={option}
                  className="flex gap-2.5 items-center cursor-pointer py-1 select-none"
                  onClick={() => toggleLeadSource(option)}
                >
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-md transition-all duration-150"
                    style={{
                      width: '18px',
                      height: '18px',
                      background: checked ? '#8B2FC9' : 'white',
                      border: `1.5px solid ${checked ? '#8B2FC9' : '#D1D5DB'}`,
                    }}
                  >
                    {checked && <Check size={12} color="white" strokeWidth={3} />}
                  </div>
                  <span className="font-body" style={{ color: '#4A4A4A', fontSize: '14px' }}>
                    {option}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="mt-3">
            <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '14px' }}>
              Any context on lead quality or volume?
            </label>
            <textarea
              value={leadSourceNotes}
              onChange={(e) => setLeadSourceNotes(e.target.value)}
              onBlur={(e) => save({ lead_source_notes: e.target.value })}
              rows={2}
              className={`${fieldClass} resize-none`}
              style={fieldStyle}
            />
          </div>
        </div>

        {/* Google presence */}
        <div className="mb-5">
          <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '14px' }}>
            What does your Google presence look like?
          </label>
          <select
            value={googlePresence}
            onChange={(e) => {
              const v = e.target.value
              setGooglePresence(v)
              save({ google_presence: v })
            }}
            className={fieldClass}
            style={fieldStyle}
          >
            <option value="">Select</option>
            <option value="Strong — top of maps pack">Strong — top of maps pack</option>
            <option value="Decent — shows up sometimes">Decent — shows up sometimes</option>
            <option value="Weak — hard to find us">Weak — hard to find us</option>
            <option value="No GBP set up yet">No GBP set up yet</option>
            <option value="Not sure">Not sure</option>
          </select>
        </div>

        {/* Paid ads */}
        <div className="mb-5">
          <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '14px' }}>
            Do you run any paid ads?
          </label>
          <div className="flex gap-3 mt-1 flex-wrap">
            {([['yes', 'Yes'], ['no', 'No'], ['used_to', 'Used to']] as const).map(([value, label]) => (
              <button
                key={value}
                onClick={() => {
                  setRunsPaidAds(value)
                  save({ runs_paid_ads: value })
                }}
                className={[
                  'font-body font-medium px-5 py-2.5 rounded-full cursor-pointer transition-all duration-150 border',
                  runsPaidAds === value
                    ? 'bg-[#0D0D0D] text-white border-[#0D0D0D]'
                    : 'bg-white text-[#4A4A4A] border-[#E5E7EB]',
                ].join(' ')}
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
              >
                {label}
              </button>
            ))}
          </div>
          {(runsPaidAds === 'yes' || runsPaidAds === 'used_to') && (
            <div className="mt-3">
              <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '14px' }}>
                Which platforms and rough monthly spend?
              </label>
              <textarea
                value={adNotes}
                onChange={(e) => setAdNotes(e.target.value)}
                onBlur={(e) => save({ ad_notes: e.target.value })}
                rows={2}
                className={`${fieldClass} resize-none`}
                style={fieldStyle}
              />
            </div>
          )}
        </div>

        {/* Review strategy */}
        <div className="mb-5">
          <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '14px' }}>
            How do you currently ask for reviews?
          </label>
          <select
            value={reviewStrategy}
            onChange={(e) => {
              const v = e.target.value
              setReviewStrategy(v)
              save({ review_strategy: v })
            }}
            className={fieldClass}
            style={fieldStyle}
          >
            <option value="">Select</option>
            <option value="We don't ask">We don&apos;t ask</option>
            <option value="Ask verbally in person">Ask verbally in person</option>
            <option value="Send a text manually">Send a text manually</option>
            <option value="Send an email manually">Send an email manually</option>
            <option value="Automated system">Automated system</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Close rate */}
        <div className="mb-5">
          <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '14px' }}>
            Roughly what percentage of new inquiries become paying customers?
          </label>
          <select
            value={closeRate}
            onChange={(e) => {
              const v = e.target.value
              setCloseRate(v)
              save({ close_rate: v })
            }}
            className={fieldClass}
            style={fieldStyle}
          >
            <option value="">Select</option>
            <option value="Under 25%">Under 25%</option>
            <option value="25–50%">25–50%</option>
            <option value="50–75%">50–75%</option>
            <option value="75%+">75%+</option>
            <option value="Not sure">Not sure</option>
          </select>
        </div>

        {/* Bad lead */}
        <div>
          <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '14px' }}>
            What does a bad lead look like for you?
          </label>
          <textarea
            value={badLeadDescription}
            onChange={(e) => setBadLeadDescription(e.target.value)}
            onBlur={(e) => save({ bad_lead_description: e.target.value })}
            rows={2}
            placeholder="e.g. Price shoppers, wrong service area, unrealistic budget..."
            className={`${fieldClass} resize-none`}
            style={fieldStyle}
          />
        </div>
      </div>

      {/* ── Section 4 — Pain Points ── */}
      <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm" style={{ border: '1px solid #E5E7EB' }}>
        <p
          className="font-body uppercase pb-3"
          style={{
            color: '#6B7280',
            fontSize: '11px',
            letterSpacing: '0.08em',
            borderBottom: '1px solid #F5F5F5',
          }}
        >
          Pain Points
        </p>
        <p className="font-body mb-5 mt-3" style={{ color: '#6B7280', fontSize: '13px' }}>
          These answers matter most. Take your time here.
        </p>

        {/* Biggest time cost */}
        <div className="mb-5">
          <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '14px' }}>
            What's the one thing that costs you the most time every week?
          </label>
          <textarea
            value={biggestTimeCost}
            onChange={(e) => setBiggestTimeCost(e.target.value)}
            onBlur={(e) => save({ biggest_time_cost: e.target.value })}
            rows={3}
            placeholder="Be specific — what exact task or process eats the most hours?"
            className={`${fieldClass} resize-none`}
            style={fieldStyle}
          />
        </div>

        {/* Biggest worry */}
        <div className="mb-5">
          <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '14px' }}>
            What keeps you up at night about the business?
          </label>
          <textarea
            value={biggestWorry}
            onChange={(e) => setBiggestWorry(e.target.value)}
            onBlur={(e) => save({ biggest_worry: e.target.value })}
            rows={3}
            placeholder="Cash flow, finding good employees, staying competitive, online reviews..."
            className={`${fieldClass} resize-none`}
            style={fieldStyle}
          />
        </div>

        {/* Fix tomorrow */}
        <div className="mb-5">
          <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '14px' }}>
            If you could fix one thing tomorrow what would it be?
          </label>
          <textarea
            value={fixTomorrow}
            onChange={(e) => setFixTomorrow(e.target.value)}
            onBlur={(e) => save({ fix_tomorrow: e.target.value })}
            rows={2}
            placeholder="One thing, no constraints — what would it be?"
            className={`${fieldClass} resize-none`}
            style={fieldStyle}
          />
        </div>

        {/* Previous attempts */}
        <div className="mb-5">
          <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '14px' }}>
            Have you tried to solve any of this before? What happened?
          </label>
          <textarea
            value={previousAttempts}
            onChange={(e) => setPreviousAttempts(e.target.value)}
            onBlur={(e) => save({ previous_attempts: e.target.value })}
            rows={2}
            placeholder="Tried a website company, bought software that didn't work out, hired someone who left..."
            className={`${fieldClass} resize-none`}
            style={fieldStyle}
          />
        </div>

        {/* Cost of inaction */}
        <div>
          <label className="block font-body font-medium mb-1.5" style={{ color: '#4A4A4A', fontSize: '14px' }}>
            What's the cost of NOT fixing this?
          </label>
          <p className="font-body mb-2" style={{ color: '#9CA3AF', fontSize: '12px' }}>
            Time, money, stress, missed opportunities
          </p>
          <textarea
            value={costOfInaction}
            onChange={(e) => setCostOfInaction(e.target.value)}
            onBlur={(e) => save({ cost_of_inaction: e.target.value })}
            rows={2}
            placeholder="e.g. We're losing roughly 10 jobs a month to competitors with better online presence..."
            className={`${fieldClass} resize-none`}
            style={fieldStyle}
          />
        </div>
      </div>

      {/* ── Sticky save status bar ── */}
      <div
        className="sticky bottom-0 bg-white flex items-center justify-between px-6 py-3"
        style={{ borderTop: '1px solid #E5E7EB' }}
      >
        <div>
          {saving ? (
            <div className="flex gap-2 items-center">
              <svg
                className="animate-spin"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                style={{ color: '#8B2FC9' }}
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="font-body" style={{ color: '#6B7280', fontSize: '13px' }}>
                Saving...
              </span>
            </div>
          ) : saved ? (
            <span className="font-body font-medium" style={{ color: '#16A34A', fontSize: '13px' }}>
              Saved ✓
            </span>
          ) : (
            <div />
          )}
        </div>
        {/* Mark Complete button — built in Prompt E */}
        <div />
      </div>
    </div>
  )
}
