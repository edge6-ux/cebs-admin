import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-server'
import type { Job, Customer } from '@/lib/types'
import RetainerJobDetail from '@/components/jobs/RetainerJobDetail'

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: jobData } = await supabaseAdmin
    .from('jobs')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!jobData) notFound()

  const job = jobData as Job

  let customer: Customer | null = null
  if (job.customer_id) {
    const { data } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', job.customer_id)
      .single()
    customer = (data as Customer) ?? null
  }

  const isRetainer = job.type === 'retainer'

  if (isRetainer) {
    return <RetainerJobDetail job={job} customer={customer} />
  }

  return (
    <div className="p-4">
      <p className="font-heading text-2xl font-bold">Job detail — coming soon</p>
    </div>
  )
}
