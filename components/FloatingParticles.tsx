'use client'

import { useEffect, useState } from 'react'

interface Particle {
  id: number
  left: number
  top: number
  size: number
  delay: number
  duration: number
  color: string
}

export default function FloatingParticles() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    setParticles(
      Array.from({ length: 40 }, (_, i) => {
        const duration = Math.random() * 8 + 10
        return {
          id: i,
          left: Math.random() * 100,
          top: 70 + Math.random() * 35,
          size: Math.random() * 2.5 + 1.5,
          delay: -(Math.random() * duration),
          duration,
          color:
            Math.random() > 0.55
              ? `rgba(139, 47, 201, ${(Math.random() * 0.45 + 0.25).toFixed(2)})`
              : `rgba(255, 255, 255, ${(Math.random() * 0.25 + 0.1).toFixed(2)})`,
        }
      })
    )
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            animation: `float-up ${p.duration}s ${p.delay}s infinite linear`,
          }}
        />
      ))}
    </div>
  )
}
