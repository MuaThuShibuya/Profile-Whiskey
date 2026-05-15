'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Lock, Bot, ArrowRight } from 'lucide-react'
import { AuroraBackground } from '@/components/abyss/aurora-background'
import { ParticleBackground } from '@/components/abyss/particle-background'
import { ProfileCard } from '@/components/profile/profile-card'
import { ActionButtons } from '@/components/profile/action-buttons'
import { MusicPlayer } from '@/components/player/music-player'
import { ViewCounter } from '@/components/profile/view-counter'

const STATUS_LABELS: Record<string, string> = {
  online:  'Đang hoạt động',
  idle:    'Hơi bận',
  dnd:     'Không làm phiền',
  offline: 'Ngoại tuyến',
}

const STATUS_COLORS: Record<string, string> = {
  online:  'bg-green-500',
  idle:    'bg-yellow-500',
  dnd:     'bg-red-500',
  offline: 'bg-gray-500',
}

export default function HomePage() {
  const [config, setConfig] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [botCount, setBotCount] = useState(0)

  useEffect(() => {
    const initProfile = async () => {
      try {
        const [, profileRes, botsRes] = await Promise.all([
          fetch('/api/profile/views', { method: 'POST' }),
          fetch('/api/profile'),
          fetch('/api/bots'),
        ])

        const profileText = await profileRes.text()
        try {
          const json = JSON.parse(profileText)
          if (json.success) setConfig(json.data)
        } catch {
          console.error('[Client Error] Dữ liệu profile không phải JSON hợp lệ')
        }

        try {
          const botsJson = await botsRes.json()
          if (botsJson.success) setBotCount(botsJson.data.length)
        } catch {}
      } catch (error) {
        console.error('[Client Fatal] Lỗi kết nối toàn cục:', error)
      } finally {
        setMounted(true)
      }
    }
    initProfile()
  }, [])

  if (!mounted) return null

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a15] text-white">
        <div className="w-8 h-8 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const status = config.profile.status as string
  const statusLabel = STATUS_LABELS[status] ?? STATUS_LABELS.online
  const statusDot = STATUS_COLORS[status] ?? STATUS_COLORS.online

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background layers */}
      <AuroraBackground />
      <ParticleBackground />

      {/* View counter */}
      <ViewCounter count={config.profile.viewCount} trend={15} />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        {/* Floating decorative elements */}
        <motion.div
          className="absolute top-1/4 left-10 w-2 h-2 rounded-full bg-[#8b5cf6]"
          style={{ willChange: 'transform, opacity' }}
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/3 right-20 w-1.5 h-1.5 rounded-full bg-[#38bdf8]"
          style={{ willChange: 'transform, opacity' }}
          animate={{ y: [0, -15, 0], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
        />
        <motion.div
          className="absolute bottom-1/3 left-20 w-1 h-1 rounded-full bg-[#a78bfa]"
          style={{ willChange: 'transform, opacity' }}
          animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
        />

        {/* Status pill */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs text-muted-foreground"
            animate={{
              boxShadow: [
                '0 0 20px rgba(139, 92, 246, 0.1)',
                '0 0 30px rgba(139, 92, 246, 0.2)',
                '0 0 20px rgba(139, 92, 246, 0.1)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <span className={`w-2 h-2 rounded-full animate-pulse ${statusDot}`} />
            <span>{statusLabel}</span>
          </motion.div>
        </motion.div>

        {/* Profile Card */}
        <ProfileCard
          username={config.profile.username}
          displayName={config.profile.displayName}
          description={config.profile.bio}
          mood={config.profile.quote}
          location={config.profile.location}
          viewCount={config.profile.viewCount}
          status={config.profile.status as 'online' | 'idle' | 'dnd' | 'offline'}
          social={config.social}
        />

        {/* Action buttons */}
        <div className="mt-10">
          <ActionButtons botInvite={config.botInvite} />
        </div>

        {/* Quote */}
        {config.profile.quote && (
          <motion.p
            className="mt-12 text-center text-muted-foreground/60 text-sm italic max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            {'"'}{config.profile.quote}{'"'}
          </motion.p>
        )}

        {/* Bot preview link */}
        {botCount > 0 && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
          >
            <Link
              href="/bots"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-[#8b5cf6]/20 text-sm text-muted-foreground hover:text-white hover:border-[#8b5cf6]/50 transition-all group"
            >
              <Bot className="w-4 h-4 text-[#8b5cf6]" />
              <span>{botCount} Discord Bot</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}
      </div>

      {/* Music Player */}
      <MusicPlayer src={config.profile.music} />

      {/* Cursor glow effect */}
      <div className="pointer-events-none fixed inset-0 z-30 transition-all duration-300" id="cursor-glow" />

      {/* Hidden Admin Login Button */}
      <Link
        href="/login"
        className="fixed bottom-6 right-6 z-50 p-3 rounded-full glass-strong border border-border text-muted-foreground hover:text-white hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all group"
        title="Cổng Admin"
      >
        <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </Link>
    </main>
  )
}
