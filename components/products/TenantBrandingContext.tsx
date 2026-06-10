'use client'

import { createContext, useContext, useState } from 'react'

interface TenantBrandingContextValue {
  primaryColor: string
  ctaText: string
  setPrimaryColor: (c: string) => void
  setCtaText: (t: string) => void
}

const TenantBrandingContext = createContext<TenantBrandingContextValue | null>(null)

export function TenantBrandingProvider({
  children,
  initialColor,
  initialCtaText,
}: {
  children: React.ReactNode
  initialColor: string
  initialCtaText: string
}) {
  const [primaryColor, setPrimaryColor] = useState(initialColor)
  const [ctaText, setCtaText] = useState(initialCtaText)

  return (
    <TenantBrandingContext.Provider value={{ primaryColor, ctaText, setPrimaryColor, setCtaText }}>
      {children}
    </TenantBrandingContext.Provider>
  )
}

export function useTenantBranding() {
  const ctx = useContext(TenantBrandingContext)
  if (!ctx) throw new Error('useTenantBranding must be used within TenantBrandingProvider')
  return ctx
}
