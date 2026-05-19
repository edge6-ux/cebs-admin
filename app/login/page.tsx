'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import FluidBackground from '@/components/FluidBackground'
import FloatingParticles from '@/components/FloatingParticles'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/dashboard')
    } else {
      setError('Incorrect password')
      setLoading(false)
    }
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden flex items-center justify-center px-4"
      style={{ background: '#0D0D0D' }}
    >
      <FluidBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/60 pointer-events-none" />
      <FloatingParticles />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo + heading */}
        <div className="text-center mb-10">
          <Image
            src="/images/cebslogo6-transparent.png"
            alt="Competitive Edge Business Solutions"
            width={160}
            height={64}
            className="mx-auto object-contain"

            priority
          />
          <p
            className="font-heading font-bold mt-5"
            style={{
              color: '#FFFFFF',
              fontSize: '24px',
              textShadow: '0 0 30px rgba(139,47,201,0.6)',
            }}
          >
            Competitive Edge Admin
          </p>
          <p
            className="font-body mt-1"
            style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}
          >
            Internal Operations
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block font-body font-medium mb-2"
              style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', letterSpacing: '0.04em' }}
            >
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="w-full rounded-xl px-4 py-3.5 font-body outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${focused ? '#8B2FC9' : 'rgba(255,255,255,0.12)'}`,
                color: '#FFFFFF',
                fontSize: '15px',
                boxShadow: focused
                  ? '0 0 0 3px rgba(139,47,201,0.25), 0 0 24px rgba(139,47,201,0.2)'
                  : 'none',
              }}
              autoFocus
              required
            />
          </div>

          {error && (
            <p
              className="font-body"
              style={{
                color: '#FF6B6B',
                fontSize: '13px',
                textShadow: '0 0 12px rgba(226,75,74,0.6)',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-heading font-bold uppercase py-3.5 rounded-xl text-white transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #8B2FC9 0%, #6B1FA8 100%)',
              fontSize: '14px',
              letterSpacing: '0.1em',
              boxShadow: '0 0 20px rgba(139,47,201,0.5), 0 0 60px rgba(139,47,201,0.15)',
              border: '1px solid rgba(139,47,201,0.4)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.boxShadow = '0 0 32px rgba(139,47,201,0.8), 0 0 80px rgba(139,47,201,0.25)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(139,47,201,0.5), 0 0 60px rgba(139,47,201,0.15)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Bottom rule */}
        <div
          className="mt-8 mx-auto"
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(139,47,201,0.4), transparent)',
          }}
        />
      </div>
    </div>
  )
}
