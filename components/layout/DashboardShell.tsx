'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import FluidBackground from '@/components/FluidBackground'
import FloatingParticles from '@/components/FloatingParticles'
import { useTheme } from '@/components/providers/ThemeProvider'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme } = useTheme()
  const isNight = theme === 'night'

  return (
    <>
      {/* Night mode: full-screen animated background */}
      {isNight && (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          <FluidBackground />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/65" />
          <FloatingParticles />
        </div>
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 md:hidden"
          style={{ background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 md:ml-[240px]" style={{ position: 'relative', zIndex: 1 }}>
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 md:px-8 pb-8" style={{ paddingTop: '88px' }}>
          {children}
        </main>
      </div>
    </>
  )
}
