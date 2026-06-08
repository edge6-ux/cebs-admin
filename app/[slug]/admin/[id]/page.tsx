import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-server'
import SubmissionDetail from '@/components/admin/SubmissionDetail'

interface Tenant {
  id: string
  slug: string
  business_name: string
  primary_color: string
  secondary_color: string | null
  logo_url: string | null
  notification_email: string
  admin_email: string
  auth_user_id: string | null
  active: boolean
  customer_id: string | null
  retainer_amount: number | null
  billing_cycle: string | null
  next_billing_date: string | null
  notes: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
  updated_at: string
}

interface FieldSubmission {
  id: string
  tenant_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  property_address: string
  status: string
  notes: string | null
  contacted_at: string | null
  contact_method: 'phone' | 'email' | null
  created_at: string
  image_urls: string[] | null
  urgency: 'high' | 'medium' | 'low' | null
  hazards: string[] | null
  form_data: {
    service_type?: string | string[]
    tree_count?: string
    tree_height?: string
    urgency?: string
    additional_notes?: string
  } | null
  operator_report: string | null
  customer_report: string | null
}

interface PageProps {
  params: Promise<{ slug: string; id: string }>
}

export default async function SubmissionDetailPage({ params }: PageProps) {
  const { slug, id } = await params

  const [tenantResult, submissionResult] = await Promise.all([
    supabaseAdmin.from('tenants').select('*').eq('slug', slug).single(),
    supabaseAdmin.from('field_submissions').select('*').eq('id', id).single(),
  ])

  if (tenantResult.error || !tenantResult.data) {
    redirect('/')
  }

  if (submissionResult.error || !submissionResult.data) {
    redirect(`/${slug}/admin`)
  }

  const tenant = tenantResult.data as Tenant
  const submission = submissionResult.data as FieldSubmission

  if (submission.tenant_id !== tenant.id) {
    redirect(`/${slug}/admin`)
  }

  return <SubmissionDetail tenant={tenant} submission={submission} />
}
