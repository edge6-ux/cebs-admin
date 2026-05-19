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
    <div className="dashboard-root min-h-screen flex">
      <DashboardShell>{children}</DashboardShell>
    </div>
  )
}
