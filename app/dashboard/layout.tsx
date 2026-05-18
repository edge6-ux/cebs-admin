import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/layout/DashboardShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const authed = cookieStore.get('ce_admin_authed')

  if (!authed) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#F5F5F5' }}>
      <DashboardShell>{children}</DashboardShell>
    </div>
  )
}
