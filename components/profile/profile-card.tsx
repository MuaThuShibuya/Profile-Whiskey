'use client'

import { motion } from 'framer-motion'
import { MapPin, Eye, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { SocialLinks } from './social-links'
import { StatusBadge } from './status-badge'

interface ProfileCardProps {
  username: string
  displayName: string
  description: string
  mood?: string
  location?: string
  viewCount?: number
  avatarUrl?: string
  status?: 'online' | 'idle' | 'dnd' | 'offline'
  social?: Record<string, string>
}

export function ProfileCard({
  username,
  displayName,
  description,
  mood,
  location,
  viewCount = 0,
  avatarUrl,
  status = 'online',
  social,
}: ProfileCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-sm"
    >
      {/* Gradient border glow — thinner, subtler */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-[var(--theme-primary,#8b5cf6)] via-[var(--theme-accent,#38bdf8)] to-[var(--theme-primary,#8b5cf6)] rounded-2xl opacity-40 blur-[3px]" />

      {/* Main card */}
      <div className="relative glass-strong rounded-2xl p-5">
        {/* Decorative blobs — smaller, no z-fighting */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[var(--theme-primary,#8b5cf6)]/10 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-[var(--theme-accent,#38bdf8)]/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Avatar section */}
        <div className="relative flex justify-center mb-4">
          <div className="relative">
            {/* Glow ring */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--theme-primary,#8b5cf6)] via-[var(--theme-accent,#38bdf8)] to-[var(--theme-primary,#8b5cf6)] rounded-full opacity-55 blur-md" />
            {/* Border ring */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--theme-primary,#8b5cf6)] via-[var(--theme-accent,#38bdf8)] to-[var(--theme-primary,#8b5cf6)] rounded-full" />

            {/* Avatar image */}
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#1a1a2e]">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  fill
                  className="object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[var(--theme-primary,#8b5cf6)] to-[var(--theme-accent,#38bdf8)] flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white/80" />
                </div>
              )}
            </div>

            <StatusBadge status={status} />
          </div>
        </div>

        {/* Profile info */}
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold bg-gradient-to-r from-white via-[var(--theme-primary,#a78bfa)] to-[var(--theme-accent,#38bdf8)] bg-clip-text text-transparent leading-tight">
            {displayName}
          </h1>

          <p className="text-muted-foreground text-xs font-mono">@{username}</p>

          {description && (
            <p className="text-foreground/75 text-sm leading-relaxed line-clamp-3">{description}</p>
          )}

          {mood && (
            <p className="text-[var(--theme-primary,#a78bfa)] text-xs italic opacity-80">
              &ldquo;{mood}&rdquo;
            </p>
          )}

          {/* Meta info */}
          <div className="flex items-center justify-center gap-4 pt-1 text-xs text-muted-foreground">
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {viewCount.toLocaleString()} lượt xem
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="my-4 h-px bg-gradient-to-r from-transparent via-[var(--theme-primary,#8b5cf6)]/30 to-transparent" />

        {/* Social links */}
        <SocialLinks links={social} />
      </div>
    </motion.div>
  )
}
