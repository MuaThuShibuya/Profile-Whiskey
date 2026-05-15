'use client'

import { motion } from 'framer-motion'

interface Props {
  bgUrl?: string
  avatarUrl?: string
  useAvatarAsBg?: boolean
  primaryColor?: string
  accentColor?: string
}

function isVideoUrl(url: string): boolean {
  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)) return true
  if (url.includes('res.cloudinary.com') && url.includes('/video/')) return true
  return false
}

export function DynamicBackground({
  bgUrl,
  avatarUrl,
  useAvatarAsBg = false,
  primaryColor = '#8b5cf6',
  accentColor = '#38bdf8',
}: Props) {
  const displayUrl = bgUrl || (useAvatarAsBg && avatarUrl ? avatarUrl : undefined)
  const showVideo = !!displayUrl && isVideoUrl(displayUrl)
  const showImage = !!displayUrl && !showVideo
  const isAvatarBg = !bgUrl && useAvatarAsBg && !!avatarUrl

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Dark base — always present */}
      <div className="absolute inset-0 bg-[#0a0a15]" />

      {showVideo ? (
        <video
          key={displayUrl}
          src={displayUrl}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          style={{ willChange: 'transform' }}
        />
      ) : showImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${displayUrl})`,
            ...(isAvatarBg
              ? { filter: 'blur(14px) brightness(0.28)', transform: 'scale(1.06)' }
              : {}),
          }}
        />
      ) : (
        /* Aurora fallback — uses dynamic theme colors */
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          <motion.div
            className="absolute top-0 left-1/4 w-[600px] h-[500px] rounded-full"
            style={{
              background: `radial-gradient(ellipse at center, ${primaryColor}28 0%, transparent 70%)`,
              willChange: 'transform',
            }}
            animate={{ x: [0, 80, -40, 0], y: [0, 40, -20, 0], scale: [1, 1.1, 0.95, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/4 right-1/4 w-[500px] h-[400px] rounded-full"
            style={{
              background: `radial-gradient(ellipse at center, ${accentColor}1c 0%, transparent 70%)`,
              willChange: 'transform',
            }}
            animate={{ x: [0, -60, 50, 0], y: [0, -30, 15, 0], scale: [1, 0.9, 1.05, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/3 w-[400px] h-[350px] rounded-full"
            style={{
              background: `radial-gradient(ellipse at center, ${primaryColor}20 0%, transparent 70%)`,
              willChange: 'transform',
            }}
            animate={{ x: [0, 50, -30, 0], y: [0, -50, 30, 0], scale: [1, 1.1, 0.9, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      )}

      {/* Dark overlay — stronger for media background */}
      {displayUrl && <div className="absolute inset-0 bg-black/55" />}

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(5,5,16,0.55) 100%)',
        }}
      />

      {/* Subtle film noise */}
      <div
        className="absolute inset-0 opacity-[0.018] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
