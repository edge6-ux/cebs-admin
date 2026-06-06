'use client'

import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  LayoutDashboard,
  Users2,
  Briefcase,
  FileText,
  BarChart2,
  Settings,
  LogOut,
  Building2,
  Hammer,
  Trash2,
  RefreshCw,
} from 'lucide-react'

type NavItem = {
  icon: React.ElementType
  label: string
  href: string
}

const mainNav: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users2,          label: 'Leads',     href: '/dashboard/leads' },
  { icon: Building2,       label: 'Customers', href: '/dashboard/customers' },
  { icon: Hammer,          label: 'Jobs',      href: '/dashboard/jobs' },
  { icon: RefreshCw,       label: 'Retainers', href: '/dashboard/retainers' },
  { icon: Briefcase,       label: 'Projects',  href: '/dashboard/projects' },
]

const managementNav: NavItem[] = [
  { icon: FileText,  label: 'Proposals', href: '/dashboard/proposals' },
  { icon: BarChart2, label: 'Revenue',   href: '/dashboard/revenue' },
]

const systemNav: NavItem[] = [
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  { icon: Trash2,   label: 'Trash',    href: '/dashboard/trash' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  async function handleSignOut() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div
      className={`fixed left-0 top-0 h-screen flex flex-col justify-between py-6 z-50 transition-transform duration-200 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
      style={{ width: '240px', background: '#0D0D0D' }}
    >
      {/* Logo */}
      <div>
        <div className="flex items-center gap-3 px-5 mb-8">
          <Image
            src="/images/honedopsnobg.png"
            alt="Honed Ops"
            width={48}
            height={16}
            className="object-contain"
            priority
          />
        </div>

        {/* Nav */}
        <nav className="px-3 space-y-1 flex-1">
          <NavGroup items={mainNav} isActive={isActive} onClose={onClose} />

          <p
            className="font-body uppercase px-3 mb-2 mt-4 text-white/25"
            style={{ fontSize: '10px', letterSpacing: '0.1em' }}
          >
            Management
          </p>
          <NavGroup items={managementNav} isActive={isActive} onClose={onClose} />

          <p
            className="font-body uppercase px-3 mb-2 mt-4 text-white/25"
            style={{ fontSize: '10px', letterSpacing: '0.1em' }}
          >
            System
          </p>
          <NavGroup items={systemNav} isActive={isActive} onClose={onClose} />
        </nav>
      </div>

      {/* Bottom */}
      <div className="px-3">
        <div className="mb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
        <button
          onClick={() => { handleSignOut(); onClose() }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-body transition-all duration-150 text-white/40 hover:text-white/70 cursor-pointer"
          style={{ fontSize: '14px' }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  )
}

function NavGroup({
  items,
  isActive,
  onClose,
}: {
  items: NavItem[]
  isActive: (href: string) => boolean
  onClose: () => void
}) {
  const router = useRouter()

  return (
    <>
      {items.map((item) => {
        const active = isActive(item.href)
        const Icon = item.icon
        return (
          <button
            key={item.href}
            onClick={() => { router.push(item.href); onClose() }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-body transition-all duration-150 cursor-pointer"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              background: active ? 'rgba(139,47,201,0.15)' : 'transparent',
              color: active ? '#8B2FC9' : 'rgba(255,255,255,0.5)',
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
              }
            }}
          >
            <Icon
              size={16}
              style={{ color: active ? '#8B2FC9' : 'rgba(255,255,255,0.3)', flexShrink: 0 }}
            />
            {item.label}
          </button>
        )
      })}
    </>
  )
}
