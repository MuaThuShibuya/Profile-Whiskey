'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat } from 'lucide-react'

interface MusicPlayerProps {
  src?: string
  title?: string
  artist?: string
}

export function MusicPlayer({ src, title = 'Whispers of the Abyss', artist = 'Void Symphony' }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [isLooping, setIsLooping] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasAudio, setHasAudio] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!src) { setHasAudio(false); return }

    const audio = new Audio()
    audio.preload = 'metadata'
    audio.loop = isLooping
    audio.volume = isMuted ? 0 : volume

    const onLoaded = () => { setDuration(audio.duration || 0); setHasAudio(true) }
    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onEnded = () => { if (!isLooping) { setIsPlaying(false); setCurrentTime(0) } }
    const onError = () => setHasAudio(false)

    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    audio.src = src
    audioRef.current = audio

    return () => {
      audio.pause()
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      audioRef.current = null
    }
  }, [src]) // eslint-disable-line react-hooks/exhaustive-deps

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
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  useEffect(() => {
    if (audioRef.current) audioRef.current.loop = isLooping
  }, [isLooping])

  const formatTime = (s: number) => {
    if (!isFinite(s) || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audioRef.current.currentTime = ratio * duration
  }

  return (
    <motion.div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#8b5cf6] via-[#38bdf8] to-[#a78bfa] rounded-2xl opacity-30 blur-sm" />

        <div className="relative glass-strong rounded-2xl overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-4">
              {/* Album art */}
              <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6] to-[#38bdf8]" />
                <AnimatePresence>
                  {isPlaying && (
                    <motion.div
                      className="absolute inset-0 flex items-end justify-center gap-0.5 p-2"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                      {[0, 1, 2, 3, 4].map(i => (
                        <motion.div
                          key={i} className="w-1.5 bg-white/80 rounded-full"
                          animate={{ height: ['30%', '80%', '50%', '90%', '40%'] }}
                          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse', delay: i * 0.1 }}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Track info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground truncate">{title}</h4>
                <p className="text-xs text-muted-foreground truncate">
                  {hasAudio ? artist : src ? 'Loading...' : 'No track configured'}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <motion.button
                  className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                  whileTap={{ scale: 0.9 }} aria-label="Previous"
                  onClick={() => { if (audioRef.current) { audioRef.current.currentTime = 0; setCurrentTime(0) } }}
                  disabled={!hasAudio}
                >
                  <SkipBack className="w-4 h-4" />
                </motion.button>

                <motion.button
                  className="p-3 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] text-white shadow-lg shadow-[#8b5cf6]/30 disabled:opacity-40"
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setIsPlaying(!isPlaying)}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  disabled={!hasAudio}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </motion.button>

                <motion.button
                  className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                  whileTap={{ scale: 0.9 }} aria-label="Next" disabled={!hasAudio}
                >
                  <SkipForward className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground w-8">{formatTime(currentTime)}</span>
              <div
                className="flex-1 h-1 bg-secondary rounded-full overflow-hidden cursor-pointer"
                onClick={handleSeek}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#38bdf8] pointer-events-none"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground w-8 text-right">{formatTime(duration)}</span>
            </div>

            {/* Expanded controls */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  className="mt-3 flex items-center justify-between"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <motion.button
                    className={`p-1.5 rounded-full transition-colors ${isLooping ? 'text-[#8b5cf6]' : 'text-muted-foreground hover:text-foreground'}`}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsLooping(!isLooping)}
                    aria-label="Toggle loop"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                  </motion.button>

                  <div className="flex items-center gap-2">
                    <motion.button
                      className="p-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsMuted(!isMuted)}
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </motion.button>
                    <input
                      type="range" min="0" max="1" step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={e => { setVolume(parseFloat(e.target.value)); setIsMuted(false) }}
                      className="w-16 h-1 accent-[#8b5cf6] cursor-pointer"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Expand toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            aria-label="Expand player"
          >
            <span className="text-[10px]">{isExpanded ? '▼' : '▲'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
