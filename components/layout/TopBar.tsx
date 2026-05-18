'use client'

import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/dashboard':            'Dashboard',
  '/dashboard/leads':      'Leads',
  '/dashboard/customers':  'Customers',
  '/dashboard/projects':   'Projects',
  '/dashboard/proposals':  'Proposals',
  '/dashboard/revenue':    'Revenue',
  '/dashboard/settings':   'Settings',
}

function getTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname]
  for (const [key, value] of Object.entries(pageTitles)) {
    if (pathname.startsWith(key + '/')) return value
  }
  return 'Dashboard'
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

interface TopBarProps {
  onMenuClick: () => void
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname()

  return (
    <div
      className="fixed top-0 right-0 left-0 md:left-[240px] z-30 flex items-center justify-between px-4 md:px-6 bg-white"
      style={{ height: '64px', borderBottom: '1px solid #E5E7EB' }}
    >
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
          style={{ width: '36px', height: '36px', color: '#4A4A4A' }}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <p className="font-heading font-bold" style={{ color: '#0D0D0D', fontSize: '18px' }}>
          {getTitle(pathname)}
        </p>
      </div>

      {/* Right: date */}
      <span
        className="font-body hidden md:block"
        style={{ color: '#6B7280', fontSize: '13px' }}
      >
        {formatDate()}
      </span>
    </div>
  )
}
