'use client'

import { useState } from 'react'

interface Props {
  src: string
  alt: string
}

export default function LogoImage({ src, alt }: Props) {
  const [error, setError] = useState(false)

  return (
    <div className="bg-[#F9F9F9] rounded-xl p-4 flex items-center justify-center mb-4">
      {error ? (
        <p className="font-body" style={{ color: '#9CA3AF', fontSize: '12px' }}>
          Logo unavailable
        </p>
      ) : (
        <img
          src={src}
          alt={alt}
          className="max-h-16 max-w-full object-contain"
          onError={() => setError(true)}
        />
      )}
    </div>
  )
}
