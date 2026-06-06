'use client'

import { useRouter } from 'next/navigation'
import { Mail, ExternalLink, Briefcase, Play, CheckCircle } from 'lucide-react'
import type { Job, Customer, Project } from '@/lib/types'

interface Props {
  job: Job
  customer: Customer | null
  project: Project | null
}

export default function QuickActions({ job, customer, project }: Props) {
  const router = useRouter()

  async function patchStatus(status: string) {
    const body: Record<string, string> = { status }
    if (status === 'delivered') body.completed_at = new Date().toISOString()
    await fetch(`/api/admin/jobs/${job.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    router.refresh()
  }

  const hasActions =
    customer?.email ||
    job.live_url ||
    job.project_id ||
    job.status === 'queued' ||
    job.status === 'in_progress' ||
    job.status === 'review'

  const outlineBtn =
    'flex w-full items-center gap-2.5 font-body font-medium px-4 py-2.5 rounded-xl transition-colors text-sm'

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5" style={{ border: '1px solid #E5E7EB' }}>
      <p
        className="font-body uppercase pb-3 mb-4"
        style={{ color: '#6B7280', fontSize: '11px', letterSpacing: '0.08em', borderBottom: '1px solid #F5F5F5' }}
      >
        Actions
      </p>

      {!hasActions && (
        <p className="font-body" style={{ color: '#9CA3AF', fontSize: '13px' }}>No actions available.</p>
      )}

      <div className="space-y-2">
        {customer?.email && (
          <a
            href={`mailto:${customer.email}`}
            className={`${outlineBtn} hover:border-[#8B2FC9] hover:text-[#8B2FC9] hover:fill-[#8B2FC9]`}
            style={{ border: '1px solid #E5E7EB', color: '#4A4A4A' }}
          >
            <Mail size={15} style={{ color: '#6B7280' }} />
            Email Client
          </a>
        )}

        {job.live_url && (
          <a
            href={job.live_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${outlineBtn} hover:border-[#8B2FC9] hover:text-[#8B2FC9]`}
            style={{ border: '1px solid #E5E7EB', color: '#4A4A4A' }}
          >
            <ExternalLink size={15} style={{ color: '#6B7280' }} />
            Visit Live Site
          </a>
        )}

        {job.project_id && (
          <a
            href={`/dashboard/projects/${job.project_id}`}
            className={`${outlineBtn} hover:border-[#8B2FC9] hover:text-[#8B2FC9]`}
            style={{ border: '1px solid #E5E7EB', color: '#4A4A4A' }}
          >
            <Briefcase size={15} style={{ color: '#6B7280' }} />
            View Project
          </a>
        )}

        {job.status === 'queued' && (
          <button
            onClick={() => patchStatus('in_progress')}
            className={outlineBtn}
            style={{ border: '1px solid #1D4ED8', color: '#1D4ED8' }}
          >
            <Play size={15} />
            Mark In Progress
          </button>
        )}

        {(job.status === 'in_progress' || job.status === 'review') && (
          <button
            onClick={() => patchStatus('delivered')}
            className={`${outlineBtn} justify-center`}
            style={{ background: '#16A34A', color: 'white', border: 'none' }}
          >
            <CheckCircle size={15} />
            Mark Delivered
          </button>
        )}
      </div>
    </div>
  )
}
