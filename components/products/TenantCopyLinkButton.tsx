'use client'

import { useState } from 'react'
import { Link2 } from 'lucide-react'

interface Props {
  url: string
}

export default function TenantCopyLinkButton({ url }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
      style={{
        background: 'white',
        border: '1px solid #E5E7EB',
        color: copied ? '#8B2FC9' : '#4A4A4A',
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'color 150ms',
      }}
    >
      <Link2 size={16} />
      {copied ? 'Copied!' : 'Copy Assessment Link'}
    </button>
  )
}
