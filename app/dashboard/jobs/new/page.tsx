import { supabaseAdmin } from '@/lib/supabase-server'
import type { Customer, Project } from '@/lib/types'
import NewJobForm from '@/components/jobs/NewJobForm'

export default async function NewJobPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string; projectId?: string; type?: string }>
}) {
  const { customerId, projectId, type } = await searchParams

  const [customersResult, customerResult, projectResult] = await Promise.all([
    supabaseAdmin
      .from('customers')
      .select('id, business_name, contact_name, email')
      .eq('status', 'active')
      .order('business_name'),
    customerId
      ? supabaseAdmin.from('customers').select('*').eq('id', customerId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    projectId
      ? supabaseAdmin.from('projects').select('*').eq('id', projectId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ])

  const customers = (customersResult.data ?? []) as Pick<Customer, 'id' | 'business_name' | 'contact_name' | 'email'>[]
  const customer  = customerResult.data  as Customer | null
  const project   = projectResult.data   as Project  | null

  const validTypes = ['website', 'optimization', 'custom_build', 'retainer', 'other']
  const initialType = type && validTypes.includes(type) ? type : undefined

  return (
    <div className="max-w-2xl mx-auto">
      <NewJobForm
        customers={customers}
        preselectedCustomer={customer}
        preselectedProject={project}
        initialType={initialType}
      />
    </div>
  )
}
