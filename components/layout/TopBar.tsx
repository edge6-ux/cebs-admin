'use client'

import { usePathname } from 'next/navigation'
import { Menu, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/providers/ThemeProvider'

const pageTitles: Record<string, string> = {
  '/dashboard':           'Dashboard',
  '/dashboard/leads':     'Leads',
  '/dashboard/customers': 'Customers',
  '/dashboard/jobs':      'Jobs',
  '/dashboard/retainers': 'Retainers',
  '/dashboard/projects':  'Projects',
  '/dashboard/proposals': 'Proposals',
  '/dashboard/revenue':   'Revenue',
  '/dashboard/settings':  'Settings',
  '/dashboard/trash':     'Trash',
  '/dashboard/products/field-assessment/tenants':     'Field Assessment — Tenants',
  '/dashboard/products/field-assessment/assessments': 'Field Assessment — Assessments',
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
  const { theme, toggle } = useTheme()
  const isNight = theme === 'night'

  return (
    <div
      className="topbar fixed top-0 right-0 left-0 md:left-[240px] z-30 flex items-center justify-between px-4 md:px-6"
      style={{
        height: '64px',
        background: isNight ? 'rgba(5, 5, 12, 0.72)' : 'white',
        borderBottom: `1px solid ${isNight ? 'rgba(255,255,255,0.07)' : '#E5E7EB'}`,
        backdropFilter: isNight ? 'blur(20px) saturate(1.6)' : undefined,
        WebkitBackdropFilter: isNight ? 'blur(20px) saturate(1.6)' : undefined,
      }}
    >
      {/* Left: hamburger + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
          style={{ width: '36px', height: '36px', color: isNight ? 'rgba(255,255,255,0.6)' : '#4A4A4A' }}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <p
          className="font-heading font-bold"
          style={{ color: isNight ? 'rgba(255,255,255,0.92)' : '#0D0D0D', fontSize: '18px' }}
        >
          {getTitle(pathname)}
        </p>
      </div>

      {/* Right: date + theme toggle */}
      <div className="flex items-center gap-4">
        <span
          suppressHydrationWarning
          className="font-body hidden md:block"
          style={{ color: isNight ? 'rgba(255,255,255,0.35)' : '#6B7280', fontSize: '13px' }}
        >
          {formatDate()}
        </span>

        <button
          onClick={toggle}
          title={isNight ? 'Switch to light mode' : 'Switch to night mode'}
          className="flex items-center justify-center rounded-xl transition-all"
          style={{
            width: '36px',
            height: '36px',
            background: isNight ? 'rgba(139,47,201,0.15)' : 'transparent',
            border: isNight ? '1px solid rgba(139,47,201,0.3)' : '1px solid #E5E7EB',
            color: isNight ? '#8B2FC9' : '#9CA3AF',
            boxShadow: isNight ? '0 0 12px rgba(139,47,201,0.2)' : 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#8B2FC9'
            e.currentTarget.style.color = '#8B2FC9'
            if (isNight) e.currentTarget.style.boxShadow = '0 0 20px rgba(139,47,201,0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = isNight ? 'rgba(139,47,201,0.3)' : '#E5E7EB'
            e.currentTarget.style.color = isNight ? '#8B2FC9' : '#9CA3AF'
            e.currentTarget.style.boxShadow = isNight ? '0 0 12px rgba(139,47,201,0.2)' : 'none'
          }}
        >
          {isNight ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </div>
  )
}
