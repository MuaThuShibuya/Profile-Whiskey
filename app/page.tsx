'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Lock, Bot, ArrowRight } from 'lucide-react'
import { DynamicBackground } from '@/components/abyss/dynamic-background'
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
    const init = async () => {
      try {
        const [, profileRes, botsRes] = await Promise.all([
          fetch('/api/profile/views', { method: 'POST' }),
          fetch('/api/profile'),
          fetch('/api/bots'),
        ])

        try {
          const json = JSON.parse(await profileRes.text())
          if (json.success) setConfig(json.data)
        } catch {
          console.error('[Client] Dữ liệu profile không hợp lệ')
        }

        try {
          const bJson = await botsRes.json()
          if (bJson.success) setBotCount(bJson.data.length)
        } catch {}
      } catch (err) {
        console.error('[Client] Lỗi kết nối:', err)
      } finally {
        setMounted(true)
      }
    }
    init()
  }, [])

  /* Apply theme CSS vars whenever config changes */
  useEffect(() => {
    if (!config?.theme) return
    const root = document.documentElement
    const t = config.theme
    if (t.primaryColor) root.style.setProperty('--theme-primary', t.primaryColor)
    if (t.accentColor) root.style.setProperty('--theme-accent', t.accentColor)
  }, [config])

  if (!mounted) return null

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a15]">
        <div className="w-8 h-8 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const { profile, theme, effects, social } = config
  const status = profile?.status as string
  const statusLabel = STATUS_LABELS[status] ?? STATUS_LABELS.online
  const statusDot = STATUS_COLORS[status] ?? STATUS_COLORS.online

  const enableParticles = effects?.enableParticles !== false
  const enableMusicPlayer = effects?.enableMusicPlayer !== false
  const enableViewCounter = effects?.enableViewCounter !== false
  const particleCount = Math.min(theme?.particleCount ?? 35, 60)

  const hasMusicPlayer = enableMusicPlayer && !!profile?.music

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Dynamic background — aurora / image / video */}
      <DynamicBackground
        bgUrl={profile?.background}
        avatarUrl={profile?.avatar}
        useAvatarAsBg={theme?.useAvatarAsBackground ?? false}
        primaryColor={theme?.primaryColor}
        accentColor={theme?.accentColor}
      />

      {/* Particles */}
      {enableParticles && <ParticleBackground count={particleCount} />}

      {/* View counter */}
      {enableViewCounter && (
        <ViewCounter count={profile?.viewCount} trend={15} />
      )}

      {/* Main content */}
      <div className={`relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16 ${hasMusicPlayer ? 'pb-24' : 'pb-16'}`}>

        {/* Floating decorative dots */}
        <motion.div
          className="absolute top-1/4 left-10 w-1.5 h-1.5 rounded-full bg-[var(--theme-primary,#8b5cf6)]"
          style={{ willChange: 'transform, opacity' }}
          animate={{ y: [0, -18, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/3 right-16 w-1 h-1 rounded-full bg-[var(--theme-accent,#38bdf8)]"
          style={{ willChange: 'transform, opacity' }}
          animate={{ y: [0, -12, 0], opacity: [0.4, 0.85, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
        />

        {/* Status pill */}
        <motion.div
          className="mb-5 text-center"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs text-muted-foreground">
            <span className={`w-2 h-2 rounded-full animate-pulse ${statusDot}`} />
            <span>{statusLabel}</span>
          </div>
        </motion.div>

        {/* Profile Card */}
        <ProfileCard
          username={profile?.username ?? ''}
          displayName={profile?.displayName ?? ''}
          description={profile?.bio ?? ''}
          mood={profile?.quote}
          location={profile?.location}
          viewCount={profile?.viewCount}
          avatarUrl={profile?.avatar}
          status={status as 'online' | 'idle' | 'dnd' | 'offline'}
          social={social}
        />

        {/* Action buttons */}
        <div className="mt-7 w-full">
          <ActionButtons botInvite={config.botInvite} />
        </div>

        {/* Bot preview */}
        {botCount > 0 && (
          <motion.div
            className="mt-5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
          >
            <Link
              href="/bots"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-[var(--theme-primary,#8b5cf6)]/20 text-xs text-muted-foreground hover:text-white hover:border-[var(--theme-primary,#8b5cf6)]/50 transition-all group"
            >
              <Bot className="w-3.5 h-3.5 text-[var(--theme-primary,#8b5cf6)]" />
              <span>{botCount} Discord Bot</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        )}
      </div>

      {/* Music player — only if music URL and feature enabled */}
      {hasMusicPlayer && (
        <MusicPlayer
          src={profile.music}
          title={profile.musicTitle || undefined}
          artist={profile.musicArtist || undefined}
        />
      )}

      {/* Hidden admin login */}
      <Link
        href="/login"
        className="fixed bottom-5 right-5 z-50 p-2.5 rounded-full glass-strong border border-border text-muted-foreground hover:text-white hover:shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all group"
        title="Cổng Admin"
      >
        <Lock className="w-4 h-4 group-hover:scale-110 transition-transform" />
      </Link>
    </main>
  )
}
