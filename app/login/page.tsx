'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0D0D0D' }}>
      <div className="max-w-sm w-full bg-white rounded-2xl p-8 shadow-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Image
            src="/images/complogo1.png"
            alt="Competitive Edge Business Solutions"
            width={96}
            height={96}
            className="mx-auto"
            priority
          />
          <p className="font-heading font-bold mt-4" style={{ color: '#0D0D0D', fontSize: '22px' }}>
            Competitive Edge Admin
          </p>
          <p className="font-body mt-1" style={{ color: '#6B7280', fontSize: '14px' }}>
            Internal Operations
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block font-body font-medium mb-1"
              style={{ color: '#4A4A4A', fontSize: '14px' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 font-body outline-none transition-all focus:ring-2 focus:ring-[#8B2FC9] focus:border-[#8B2FC9]"
              style={{ borderColor: '#E5E7EB', fontSize: '15px' }}
              autoFocus
              required
            />
          </div>

          {error && (
            <p className="font-body" style={{ color: '#E24B4A', fontSize: '13px' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-heading font-bold uppercase py-3 rounded-xl text-white transition-colors disabled:opacity-60"
            style={{ background: '#8B2FC9', fontSize: '15px' }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#7A28B8' }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#8B2FC9' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
