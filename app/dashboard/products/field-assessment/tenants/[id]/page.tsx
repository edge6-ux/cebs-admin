import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ExternalLink, LayoutDashboard, ClipboardList } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase-server'
import { formatCurrency, fmtDate, timeAgo, statusColors } from '@/lib/utils'
import TenantActiveToggle from '@/components/products/TenantActiveToggle'
import TenantCopyLinkButton from '@/components/products/TenantCopyLinkButton'
import TenantConfiguration from '@/components/products/TenantConfiguration'
import TenantCustomerLink from '@/components/products/TenantCustomerLink'

const FIELD_APP_URL =
  process.env.NEXT_PUBLIC_FIELD_APP_URL ?? 'https://treeservice-fieldapp.vercel.app'

interface Tenant {
  id: string
  slug: string
  business_name: string
  industry: string
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
  customer_name: string | null
  property_address: string | null
  status: string
  created_at: string
  form_data: {
    service_type?: string
    urgency?: string
  } | null
}

interface CustomerRecord {
  id: string
  business_name: string
  contact_name: string
  email: string
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TenantDetailPage({ params }: PageProps) {
  const { id } = await params

  const [tenantResult, submissionsResult, countResult] = await Promise.all([
    supabaseAdmin.from('tenants').select('*').eq('id', id).single(),
    supabaseAdmin
      .from('field_submissions')
      .select('*')
      .eq('tenant_id', id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabaseAdmin
      .from('field_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', id),
  ])

  if (tenantResult.error || !tenantResult.data) {
    redirect('/dashboard/products/field-assessment/tenants')
  }

  const tenant = tenantResult.data as Tenant
  const submissions = (submissionsResult.data ?? []) as FieldSubmission[]
  const submissionCount = countResult.count ?? 0

  const [customerResult, allCustomersResult] = await Promise.all([
    tenant.customer_id
      ? supabaseAdmin
          .from('customers')
          .select('*')
          .eq('id', tenant.customer_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabaseAdmin
      .from('customers')
      .select('id, business_name, contact_name, email')
      .eq('status', 'active')
      .order('business_name'),
  ])

  const customer = (customerResult.data ?? null) as CustomerRecord | null
  const allCustomers = (allCustomersResult.data ?? []) as CustomerRecord[]

  const assessmentUrl = `${FIELD_APP_URL}/${tenant.slug}`
  const dashboardUrl = `${FIELD_APP_URL}/${tenant.slug}/admin`

  const now = new Date()
  const thisMonthCount = submissions.filter(s => {
    const d = new Date(s.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const industryLabel = tenant.industry.replace(/_/g, ' ')

  return (
    <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '24px' }}>
      {/* Back button */}
      <Link
        href="/dashboard/products/field-assessment/tenants"
        className="flex items-center gap-1 mb-6"
        style={{
          fontFamily: 'Inter, sans-serif',
          color: '#6B7280',
          fontSize: '14px',
          textDecoration: 'none',
          width: 'fit-content',
        }}
      >
        <ChevronLeft size={16} />
        Back to Tenants
      </Link>

      {/* Tenant Header Card */}
      <div
        className="rounded-2xl border p-6 mb-6 shadow-sm"
        style={{ background: 'white', borderColor: '#E5E7EB' }}
      >
        <div
          className="flex items-start justify-between flex-wrap gap-4"
          style={{ marginBottom: '0' }}
        >
          {/* Left: avatar + name */}
          <div className="flex items-start gap-4">
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: tenant.primary_color,
              }}
            >
              {tenant.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tenant.logo_url}
                  alt=""
                  style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                />
              ) : (
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '18px',
                  }}
                >
                  {tenant.business_name[0]}
                </span>
              )}
            </div>

            <div>
              <p
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  color: '#0D0D0D',
                  fontWeight: 700,
                  fontSize: '22px',
                  marginBottom: '4px',
                }}
              >
                {tenant.business_name}
              </p>
              <p
                style={{
                  fontFamily: 'monospace',
                  color: '#9CA3AF',
                  fontSize: '13px',
                  marginBottom: '4px',
                }}
              >
                /{tenant.slug}
              </p>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#6B7280',
                  fontSize: '13px',
                  textTransform: 'capitalize',
                }}
              >
                {industryLabel}
              </p>
            </div>
          </div>

          {/* Right: badges */}
          <div className="flex items-start gap-2 flex-wrap">
            <span
              style={{
                background: tenant.active ? '#D1FAE5' : '#F3F4F6',
                color: tenant.active ? '#065F46' : '#6B7280',
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: '12px',
              }}
            >
              {tenant.active ? 'Active' : 'Inactive'}
            </span>

            {tenant.retainer_amount != null && tenant.retainer_amount > 0 && (
              <span
                style={{
                  background: 'rgba(139,47,201,0.1)',
                  color: '#8B2FC9',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  fontWeight: 700,
                  padding: '6px 12px',
                  borderRadius: '12px',
                }}
              >
                {formatCurrency(tenant.retainer_amount)}/mo
              </span>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div
          className="flex gap-8 flex-wrap mt-4 pt-4"
          style={{ borderTop: '1px solid #F5F5F5' }}
        >
          {[
            { label: 'Total Assessments', value: String(submissionCount) },
            { label: 'This Month', value: String(thisMonthCount) },
            {
              label: 'Monthly Retainer',
              value:
                tenant.retainer_amount != null && tenant.retainer_amount > 0
                  ? `${formatCurrency(tenant.retainer_amount)}/mo`
                  : '—',
            },
            {
              label: 'Next Billing',
              value: tenant.next_billing_date ? fmtDate(tenant.next_billing_date) : '—',
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col">
              <span
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  color: '#0D0D0D',
                  fontWeight: 700,
                  fontSize: '22px',
                }}
              >
                {value}
              </span>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#6B7280',
                  fontSize: '12px',
                  marginTop: '2px',
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div
        className="rounded-2xl border p-4 mb-6 shadow-sm"
        style={{ background: 'white', borderColor: '#E5E7EB' }}
      >
        <div className="flex gap-3 flex-wrap">
          <TenantCopyLinkButton url={assessmentUrl} />

          <a
            href={assessmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{
              background: 'white',
              border: '1px solid #E5E7EB',
              color: '#4A4A4A',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={16} />
            Open Assessment Form
          </a>

          <a
            href={dashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{
              background: 'white',
              border: '1px solid #8B2FC9',
              color: '#8B2FC9',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              textDecoration: 'none',
            }}
          >
            <LayoutDashboard size={16} />
            Open Operator Dashboard
          </a>

          <TenantActiveToggle tenantId={tenant.id} active={tenant.active} />
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left — Recent Assessments */}
        <div>
          <div
            className="rounded-2xl border p-6 shadow-sm"
            style={{ background: 'white', borderColor: '#E5E7EB' }}
          >
            <div className="flex items-center justify-between mb-5">
              <p
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  color: '#0D0D0D',
                  fontWeight: 700,
                  fontSize: '17px',
                }}
              >
                Recent Assessments
              </p>
              <Link
                href={`/dashboard/products/field-assessment/assessments?tenant=${tenant.id}`}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#8B2FC9',
                  fontSize: '13px',
                  textDecoration: 'none',
                }}
              >
                View all →
              </Link>
            </div>

            {submissions.length === 0 ? (
              <div className="flex flex-col items-center py-6">
                <ClipboardList size={28} style={{ color: '#9CA3AF' }} />
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: '#6B7280',
                    fontSize: '14px',
                    marginTop: '8px',
                  }}
                >
                  No assessments yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map(s => {
                  const colors = statusColors(s.status)
                  const serviceType = s.form_data?.service_type
                    ? s.form_data.service_type.replace(/_/g, ' ')
                    : '—'
                  return (
                    <div
                      key={s.id}
                      className="rounded-xl p-4"
                      style={{ background: '#F9F9F9' }}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <p
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              color: '#0D0D0D',
                              fontSize: '14px',
                              fontWeight: 600,
                            }}
                          >
                            {s.customer_name ?? '—'}
                          </p>
                          {s.property_address && (
                            <p
                              style={{
                                fontFamily: 'Inter, sans-serif',
                                color: '#6B7280',
                                fontSize: '12px',
                                marginTop: '2px',
                              }}
                            >
                              {s.property_address}
                            </p>
                          )}
                        </div>
                        <span
                          className="px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{
                            background: colors.bg,
                            color: colors.color,
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        >
                          {s.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            color: '#4A4A4A',
                            fontSize: '12px',
                            textTransform: 'capitalize',
                          }}
                        >
                          {serviceType}
                        </span>
                        <span
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            color: '#9CA3AF',
                            fontSize: '12px',
                          }}
                        >
                          {timeAgo(s.created_at)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div>
          <TenantConfiguration tenant={tenant} />

          <TenantCustomerLink
            tenant={{ id: tenant.id, customer_id: tenant.customer_id }}
            customer={customer}
            customers={allCustomers}
          />

          {/* Billing / Stripe */}
          <div
            className="rounded-2xl border p-5 shadow-sm"
            style={{ background: 'white', borderColor: '#E5E7EB' }}
          >
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                color: '#9CA3AF',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '16px',
              }}
            >
              Billing
            </p>

            {tenant.stripe_customer_id ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: '#6B7280',
                      fontSize: '13px',
                    }}
                  >
                    Stripe Customer
                  </span>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      color: '#4A4A4A',
                      fontSize: '13px',
                      maxWidth: '160px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tenant.stripe_customer_id}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: '#6B7280',
                      fontSize: '13px',
                    }}
                  >
                    Subscription
                  </span>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      color: '#4A4A4A',
                      fontSize: '13px',
                      maxWidth: '160px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tenant.stripe_subscription_id ?? '—'}
                  </span>
                </div>
              </div>
            ) : (
              <>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: '#9CA3AF',
                    fontSize: '13px',
                    marginBottom: '12px',
                  }}
                >
                  No Stripe integration yet. Billing managed manually.
                </p>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: '#9CA3AF',
                    fontSize: '12px',
                  }}
                >
                  Stripe integration coming soon.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
