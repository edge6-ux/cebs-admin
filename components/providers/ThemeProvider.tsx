'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'night'

const ThemeContext = createContext<{
  theme: Theme
  toggle: () => void
}>({ theme: 'light', toggle: () => {} })

export function useTheme() {
  return useContext(ThemeContext)
}

const NIGHT_CSS = `
  body { background: transparent !important; }
  .dashboard-root { background: transparent !important; }

  /* Glass cards */
  .bg-white {
    background: rgba(10, 8, 20, 0.60) !important;
    backdrop-filter: blur(20px) saturate(1.5) !important;
    -webkit-backdrop-filter: blur(20px) saturate(1.5) !important;
  }

  /* Card shadows */
  .shadow-sm {
    box-shadow: 0 0 0 1px rgba(255,255,255,0.06), 0 4px 32px rgba(0,0,0,0.5) !important;
  }

  /* Text */
  .font-heading { color: rgba(255,255,255,0.93) !important; }
  .font-body    { color: rgba(255,255,255,0.65) !important; }

  /* Status pills and badge spans — override inline pastel backgrounds */
  span.rounded-full,
  span.rounded-xl {
    background: rgba(255,255,255,0.08) !important;
    color: rgba(255,255,255,0.88) !important;
    border: 1px solid rgba(255,255,255,0.15) !important;
  }

  /* Outline / filter buttons (not solid-primary ones which carry text-white) */
  button.rounded-xl:not([class*="text-white"]),
  button.rounded-lg:not([class*="text-white"]) {
    background: rgba(255,255,255,0.05) !important;
    border-color: rgba(255,255,255,0.12) !important;
    color: rgba(255,255,255,0.72) !important;
  }
  button.rounded-xl:not([class*="text-white"]):hover,
  button.rounded-lg:not([class*="text-white"]):hover {
    background: rgba(255,255,255,0.09) !important;
  }

  /* Table / list row hovers */
  .hover\\:bg-\\[\\#FAFAFA\\]:hover,
  .hover\\:bg-gray-50:hover {
    background: rgba(255,255,255,0.03) !important;
  }

  /* Inner panel sections */
  [style*="background: #FAFAFA"],
  [style*="background:#FAFAFA"],
  [style*="background: #F9F9F9"],
  [style*="background:#F9F9F9"],
  [style*="background: rgb(249"] {
    background: rgba(255,255,255,0.04) !important;
  }

  /* Inputs */
  input, textarea, select {
    background: rgba(255,255,255,0.05) !important;
    color: rgba(255,255,255,0.88) !important;
    border-color: rgba(255,255,255,0.12) !important;
  }
  input::placeholder,
  textarea::placeholder {
    color: rgba(255,255,255,0.28) !important;
  }

  /* Scrollbar */
  ::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
  ::-webkit-scrollbar-thumb { background: rgba(139,47,201,0.35); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(139,47,201,0.55); }
`

function applyTheme(theme: Theme) {
  const html = document.documentElement
  const styleId = 'cebs-night-styles'

  if (theme === 'night') {
    html.classList.add('night')
    if (!document.getElementById(styleId)) {
      const el = document.createElement('style')
      el.id = styleId
      el.textContent = NIGHT_CSS
      document.head.appendChild(el)
    }
  } else {
    html.classList.remove('night')
    document.getElementById(styleId)?.remove()
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const saved = localStorage.getItem('cebs_theme') as Theme | null
    const active = saved === 'night' ? 'night' : 'light'
    setTheme(active)
    applyTheme(active)
  }, [])

  function toggle() {
    const next: Theme = theme === 'light' ? 'night' : 'light'
    setTheme(next)
    localStorage.setItem('cebs_theme', next)
    applyTheme(next)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}
