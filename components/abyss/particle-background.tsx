'use client'

import { useEffect, useRef } from 'react'

interface Props {
  count?: number
}

export function ParticleBackground({ count = 35 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let rafId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    const palette: [number, number, number][] = [
      [139, 92, 246],
      [56, 189, 248],
      [167, 139, 250],
      [236, 72, 153],
    ]

    const n = Math.min(Math.max(count, 10), 60)
    const particles = Array.from({ length: n }, () => {
      const [r, g, b] = palette[Math.floor(Math.random() * palette.length)]
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.6 + 0.4,
        sx: (Math.random() - 0.5) * 0.22,
        sy: (Math.random() - 0.5) * 0.22,
        op: Math.random() * 0.4 + 0.06,
        r, g, b,
      }
    })

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const W = canvas.width
      const H = canvas.height

      for (const p of particles) {
        p.x = ((p.x + p.sx) + W) % W
        p.y = ((p.y + p.sy) + H) % H

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.op})`
        ctx.fill()
      }

      rafId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [count])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  )
}
