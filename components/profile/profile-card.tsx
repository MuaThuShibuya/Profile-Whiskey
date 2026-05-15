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
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      {/* Animated border glow */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-[#8b5cf6] via-[#38bdf8] to-[#a78bfa] rounded-2xl opacity-50 blur-sm animate-pulse-glow" />
      
      {/* Main card */}
      <div className="relative glass-strong rounded-2xl p-8 max-w-md w-full animate-float">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#8b5cf6]/10 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#38bdf8]/10 to-transparent rounded-full blur-2xl" />
        
        {/* Avatar section */}
        <div className="relative flex justify-center mb-6">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {/* Avatar glow ring */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#8b5cf6] via-[#38bdf8] to-[#a78bfa] rounded-full opacity-60 blur-md" />
            
            {/* Avatar border */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#8b5cf6] via-[#38bdf8] to-[#a78bfa] rounded-full" />
            
            {/* Avatar image */}
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-[#1a1a2e]">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  fill
                  className="object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#8b5cf6] to-[#38bdf8] flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-white/80" />
                </div>
              )}
            </div>
            
            {/* Status indicator */}
            <StatusBadge status={status} />
          </motion.div>
        </div>

        {/* Profile info */}
        <div className="text-center space-y-3">
          <motion.h1
            className="text-2xl font-bold text-glow bg-gradient-to-r from-white via-[#a78bfa] to-[#38bdf8] bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {displayName}
          </motion.h1>
          
          <motion.p
            className="text-muted-foreground text-sm font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            @{username}
          </motion.p>

          <motion.p
            className="text-foreground/80 text-sm leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {description}
          </motion.p>

          {mood && (
            <motion.p
              className="text-[#a78bfa] text-xs italic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {'"'}{mood}{'"'}
            </motion.p>
          )}

          {/* Meta info */}
          <motion.div
            className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
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
          </motion.div>
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/30 to-transparent" />

        {/* Social links */}
        <SocialLinks links={social} />
      </div>
    </motion.div>
  )
}
