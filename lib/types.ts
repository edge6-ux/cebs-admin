export type LeadStatus =
  | 'new'
  | 'reviewed'
  | 'contacted'
  | 'converted'
  | 'not_a_fit'

export type Lead = {
  id: string
  created_at: string
  full_name: string
  business_name: string
  email: string
  phone: string
  industry: string
  challenge: string
  monthly_spend: string
  hear_about_us: string
  status: LeadStatus
  priority_score: number
  assigned_to: string
  notes: string
  tier_recommendation: string
  ai_analysis: AIAnalysis | null
  contacted_at: string | null
  last_activity_at: string
  interested_in?: string
  interested_category?: string
}

export type UpsellOpportunity = {
  service_name: string
  trigger: string
  question_to_ask: string
  why: string
  estimated_value: string
}

export type AIAnalysis = {
  priority_score: number
  priority_reason: string
  tier_recommendation: 'audit' | 'optimize' | 'build'
  tier_reasoning: string
  estimated_monthly_waste: string
  identified_tools: string[]
  key_opportunities: string[]
  talking_points: string[]
  red_flags: string[]
  recommended_services: string[]
  upsell_opportunities: UpsellOpportunity[]
  draft_audit_summary: string
}

export type Evaluation = {
  id: string
  created_at: string
  updated_at: string
  lead_id: string
  current_tools: Tool[]
  monthly_spend_confirmed: number
  pain_points: string
  technical_comfort: string
  timeline: string
  budget_range: string
  decision_maker: string
  tier_fit: string
  notes: string
  ai_summary: string
  ai_talking_points: string[]
  completed_at: string | null
}

export type Tool = {
  name: string
  cost: number
  category: string
  keep: boolean
}

export type Proposal = {
  id: string
  created_at: string
  lead_id: string
  evaluation_id: string
  tier: string
  scope: string
  investment_low: number
  investment_high: number
  monthly_retainer: number
  timeline_weeks: number
  includes: string[]
  excludes: string[]
  status: 'draft' | 'sent' | 'accepted' | 'declined'
  sent_at: string | null
  responded_at: string | null
}

export type Project = {
  id: string
  created_at: string
  lead_id: string
  proposal_id: string
  client_name: string
  client_email: string
  client_phone: string
  business_name: string
  tier: string
  status: 'kickoff' | 'in_progress' | 'review' | 'complete' | 'on_hold'
  start_date: string | null
  target_date: string | null
  completed_date: string | null
  contract_value: number
  monthly_retainer: number
  notes: string
  checklist: ChecklistItem[]
}

export type ChecklistItem = {
  id: string
  label: string
  completed: boolean
}

export type JobStatus = 'queued' | 'in_progress' | 'review' | 'delivered' | 'on_hold'

export type JobType = 'website' | 'optimization' | 'custom_build' | 'retainer' | 'other'

export type JobPriority = 'low' | 'medium' | 'high' | 'urgent'

export type Job = {
  id: string
  created_at: string
  updated_at: string
  customer_id: string | null
  project_id: string | null
  proposal_id: string | null
  title: string
  description: string
  type: JobType
  status: JobStatus
  priority: JobPriority
  assigned_to: string
  due_date: string | null
  completed_at: string | null
  live_url: string
  repo_url: string
  poc_name: string
  poc_role: string
  credentials: string
  handoff_date: string | null
  handoff_notes: string
  internal_notes: string
  customer?: {
    id: string
    business_name: string
    contact_name: string
    email: string
  }
}

export type Service = {
  id: string
  created_at: string
  name: string
  description: string
  category: string
  price_low: number
  price_high: number
  is_retainer: boolean
  retainer_price_low: number
  retainer_price_high: number
  active: boolean
}

export type LineItem = {
  id?: string
  service_id: string | null
  name: string
  description: string
  price: number
  is_retainer: boolean
  sort_order: number
}

export type CustomerStatus = 'active' | 'inactive' | 'churned'

export type Customer = {
  id: string
  created_at: string
  updated_at: string
  lead_id: string | null
  business_name: string
  contact_name: string
  email: string
  phone: string
  industry: string
  website: string
  notes: string
  on_retainer: boolean
  retainer_amount: number
  status: CustomerStatus
}

export type Questionnaire = {
  id: string
  created_at: string
  updated_at: string
  lead_id: string
  years_in_business: string
  employee_count: string
  busy_season: string
  typical_week: string
  revenue_range: string
  growth_status: string
  growth_notes: string
  customer_journey: string
  underused_tools: string
  wishlist: string
  scheduling_method: string
  scheduling_notes: string
  invoicing_method: string
  invoicing_notes: string
  post_job_communication: string
  communication_notes: string
  lead_sources: string
  lead_source_notes: string
  google_presence: string
  runs_paid_ads: string
  ad_notes: string
  review_strategy: string
  close_rate: string
  bad_lead_description: string
  biggest_time_cost: string
  biggest_worry: string
  fix_tomorrow: string
  previous_attempts: string
  cost_of_inaction: string
  current_site_issues: string
  competitor_sites: string
  pages_needed: string[]
  has_copy: string
  has_photos: string
  reference_sites: string
  ideal_customer: string
  brand_words: string
  success_definition: string
  timeline: string
  budget: string
  decision_makers: string
  objections: string
  started_at: string | null
  completed_at: string | null
}
