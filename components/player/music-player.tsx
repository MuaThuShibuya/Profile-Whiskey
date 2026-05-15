'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX, X } from 'lucide-react'

interface MusicPlayerProps {
  src?: string
  title?: string
  artist?: string
}

export function MusicPlayer({ src, title, artist }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!src) return
    setLoaded(false)
    setHasError(false)
    setCurrentTime(0)
    setDuration(0)
    setIsPlaying(false)

    const audio = new Audio()
    audio.preload = 'metadata'
    audio.volume = 0.7

    const onMeta = () => { setDuration(audio.duration || 0); setLoaded(true) }
    const onTime = () => setCurrentTime(audio.currentTime)
    const onEnded = () => { setIsPlaying(false); setCurrentTime(0) }
    const onErr = () => setHasError(true)

    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onErr)
    audio.src = src
    audioRef.current = audio

    return () => {
      audio.pause()
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onErr)
      audioRef.current = null
    }
  }, [src])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false))
    } else {
      audio.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : 0.7
  }, [isMuted])

  if (!src || dismissed) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const fmt = (s: number) => {
    if (!isFinite(s) || isNaN(s) || s < 0) return '0:00'
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
  }

  const trackLabel = hasError
    ? 'Không thể tải nhạc'
    : loaded
      ? (title || 'Nhạc nền')
      : 'Đang tải...'

  const subLabel = hasError
    ? null
    : loaded
      ? (artist || fmt(currentTime) + ' / ' + fmt(duration))
      : null

  return (
    <motion.div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center gap-2.5 pl-3 pr-2 py-2 glass-strong rounded-full border border-white/10 shadow-xl min-w-[220px] max-w-[320px]">

        {/* Play / Pause */}
        <button
          onClick={() => !hasError && setIsPlaying(p => !p)}
          disabled={hasError || !loaded}
          aria-label={isPlaying ? 'Tạm dừng' : 'Phát nhạc'}
          className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white
            bg-gradient-to-r from-[var(--theme-primary,#8b5cf6)] to-[var(--theme-accent,#38bdf8)]
            hover:scale-105 transition-transform disabled:opacity-40"
        >
          {isPlaying
            ? <Pause className="w-3.5 h-3.5" />
            : <Play className="w-3.5 h-3.5 ml-0.5" />}
        </button>

        {/* Info + Progress */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <p className="text-xs font-medium text-white leading-tight truncate">{trackLabel}</p>

          {!hasError && (
            <div
              className="mt-1 h-0.5 bg-white/15 rounded-full cursor-pointer"
              onClick={e => {
                if (!audioRef.current || !duration) return
                const r = e.currentTarget.getBoundingClientRect()
                audioRef.current.currentTime = ((e.clientX - r.left) / r.width) * duration
              }}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--theme-primary,#8b5cf6)] to-[var(--theme-accent,#38bdf8)]"
                style={{ width: `${progress}%`, transition: 'width 0.5s linear' }}
              />
            </div>
          )}

          {subLabel && (
            <p className="text-[10px] text-white/40 mt-0.5 truncate leading-tight">{subLabel}</p>
          )}
        </div>

        {/* Mute */}
        <button
          onClick={() => setIsMuted(m => !m)}
          aria-label={isMuted ? 'Bỏ tắt tiếng' : 'Tắt tiếng'}
          className="w-6 h-6 flex-shrink-0 flex items-center justify-center text-white/45 hover:text-white transition-colors"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* Dismiss */}
        <button
          onClick={() => { audioRef.current?.pause(); setDismissed(true) }}
          aria-label="Đóng player"
          className="w-6 h-6 flex-shrink-0 flex items-center justify-center text-white/30 hover:text-white/70 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  )
}
